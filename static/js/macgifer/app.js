macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || [];

macgifer.App = function () {
  this.events_ = {};
  this.events_[macgifer.App.EVT_FRAME] = [];

  this.extensions_ = [];
  this.gifId_ = null;
  this.started_ = false;
  this.interval_ = null;
  this.canvas_ = this.createCanvas_();
  this.video_ = document.getElementById('camera');
  var extensions = macgifer.extensions.slice();
  var loadExtension = this.loadExtension_.bind(this);
  macgifer.extensions = {'push': loadExtension};
  extensions.forEach(loadExtension);

  this.worker_ = new Worker('/js/macgifer/worker.js');
  this.worker_.addEventListener('message', this.onWorkerMessage_.bind(this));

  this.connection_ = new macgifer.Connection(this.getHost_());
  this.connection_.on(common.events.EVT_NEW_ID, this.setGifId.bind(this));
  this.connection_.connect();

  this.initializeCamera_();
};

macgifer.App.EVT_FRAME = 'frame';

macgifer.App.prototype.loadExtension_ = function(extension) {
  this.extensions_.push(extension(this));
};

macgifer.App.prototype.on = function(name, callback) {
  this.events_[name].push(callback);
};

macgifer.App.prototype.onWorkerMessage_ = function(e) {
  var frame = e.data;
  date = new Date().getTime();
  console.log("got frame: " + frame.length);
  this.connection_.send(common.events.EVT_FRAME, frame);
};

macgifer.App.prototype.getHost_ = function() {
  var host = window.location.hostname;
  if (window.location.port) {
    host += ':' + window.location.port;
  }
  return host;
};

macgifer.App.prototype.createCanvas_ = function() {
  var canvas = document.createElement('canvas');
  canvas.width = common.WIDTH;
  canvas.height = common.HEIGHT;
  var context = canvas.getContext('2d');
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  return canvas;
};

macgifer.App.prototype.initializeCamera_ = function() {
  var that = this;

  getUserMedia({video: true}, function(stream){
    that.video_.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    if (!this.started_) {
      that.start();
    }
  }, function(err) {
    console.log(err);
  });
};

macgifer.App.prototype.start = function() {
  this.started_ = true;
  if (!this.interval_)
    this.interval_ = setInterval(this.onFrame_.bind(this), 1000 / common.FRAMERATE);
};

macgifer.App.prototype.stop = function() {
  this.started_ = false;
  clearInterval(this.interval_);
  this.interval_ = null;
};

macgifer.App.prototype.onFrame_ = function() {
  if (this.started_) {
    var context = this.canvas_.getContext('2d');
    context.drawImage(this.video_, 0, 0, this.video_.width, this.video_.height);
    this.events_[macgifer.App.EVT_FRAME].forEach(function(callback){
      callback({canvas: this.canvas_});
    });
    var imageData = context.getImageData(0, 0, common.WIDTH, common.HEIGHT);
    this.worker_.postMessage({
      imageData: imageData.data,
    });
  }
};

macgifer.App.prototype.getGifId = function() {
  return this.gifId_;
};

macgifer.App.prototype.setGifId = function(id) {
  var link = document.getElementById('gif-link');
  link.href = window.location.origin + '/watch/' + id + '.gif';
  link.innerText = 'Click!';
  this.gifId_ = id;
};

macgifer.app = macgifer.app || new macgifer.App();
