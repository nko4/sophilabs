macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.App = function () {
  this.events_ = {};
  this.events_[macgifer.App.EVT_FRAME] = [];

  this.extensions_ = {};
  this.gifId_ = null;
  this.started_ = false;
  this.interval_ = null;
  this.canvas_ = this.createCanvas_();
  this.video_ = document.getElementById('camera');
  var loadExtension = this.loadExtension_.bind(this);
  var extensions = macgifer.extensions.active.slice();
  macgifer.extensions.active = {'push': loadExtension};
  extensions.forEach(loadExtension);

  document.getElementById('extension-add').addEventListener('click',
   this.addExtension_.bind(this));

  this.worker_ = new Worker('/js/macgifer/worker.js');
  this.worker_.addEventListener('message', this.onWorkerMessage_.bind(this));

  this.connection_ = new macgifer.Connection(this.getHost_());
  this.connection_.on(common.events.EVT_NEW_ID, this.setGifId.bind(this));
  this.connection_.connect();

  this.initializeCamera_();
};

macgifer.App.EVT_FRAME = 'frame';

macgifer.App.prototype.addExtension_ = function() {
  var src = prompt('Put your javascript file:');
  if (src) {
      var script = document.createElement('script');
      script.src = src;
      document.body.appendChild(script);
  }
};

macgifer.App.prototype.loadExtension_ = function(extension) {
  var instance = new extension(this);
  if (this.extensions_[instance.id]) {
      return;
  }
  this.extensions_[instance.id] = {extension: instance, enable: false};
};

macgifer.App.prototype.removeExtension_ = function(id) {
  var that = this;
  for(var name in this.events_) {
    this.events_[name].filter(function(definition){
      return definition.id != id;
    });
  }
  var panel = document.getElementById('extension-' + id);
  if (panel) {
      panel.remove();
  }
  delete this.extensions_[id];
};

macgifer.App.prototype.on = function(id, name, callback) {
  this.events_[name].push({id: id, callback: callback});
};

macgifer.App.prototype.createExtensionPanel = function(extension) {
  var id = extension.getId();
  var boxId = 'extension-' + id;
  var panelId = 'extension-' + id + '-panel';

  var panel = document.getElementById(panelId);
  if (panel) {
      return panel;
  }

  var box = document.createElement('div');
  box['id'] = boxId;
  box['data-id'] = id;
  box.className = 'extension';
  
  var header = document.createElement('div');
  header.className = 'header';
  var toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  var title = document.createElement('h4');
  title.innerHTML = extension.getTitle();
  header.appendChild(title);
  //TODO: getTitle, add enable, add remove (bind events)
  box.appendChild(header);

  var panel = document.createElement('div.panel');
  panel['id'] = panelId;
  box.appendChild(panel);
    
  document.getElementById('extensions').appendChild(box);

  return panel;
};

macgifer.App.prototype.onWorkerMessage_ = function(e) {
  var frame = e.data;
  date = new Date().getTime();
  console.log('Got frame: ' + frame.length + ' bytes');
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
  //context.translate(canvas.width, 0);
  //context.scale(-1, 1);
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
    var canvas = this.canvas_;
    var context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(this.video_, 0, 0, this.video_.width, this.video_.height);
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    this.events_[macgifer.App.EVT_FRAME].forEach(function(definition){
      definition.callback({canvas: canvas});
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
  link.href = window.location.origin + '/' + id + '.gif';
  link.innerHTML = 'Click!';
  this.gifId_ = id;
};

macgifer.app = macgifer.app || new macgifer.App();
