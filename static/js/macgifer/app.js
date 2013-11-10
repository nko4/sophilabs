macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

/**
 * App
 */
macgifer.App = function () {
  this.events_ = {};
  this.events_[macgifer.App.EVT_FRAME] = [];

  this.extensions_ = [];
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

// Event on frame added
macgifer.App.EVT_FRAME = 'frame';

/**
 * Add extension.
 */
macgifer.App.prototype.addExtension_ = function() {
  var src = prompt('Put your javascript file:');
  if (src) {
      var script = document.createElement('script');
      script.src = src;
      document.body.appendChild(script);
  }
};

/**
 * Load extension.
 */
macgifer.App.prototype.loadExtension_ = function(extension) {
  this.extensions_.push(new extension(this));
};

/**
 * Remove extension.
 */
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
  this.extensions_ = this.extensions_.filter(function(extension) {
    return extension.getId() != id;
  });
};

/**
 * Bind an event handler.
 */
macgifer.App.prototype.on = function(id, name, callback) {
  this.events_[name].push({id: id, callback: callback});
};

/**
 * Get panel of extensions.
 */
macgifer.App.prototype.getExtensionPanel = function(id) {
  var panel = document.getElementById('extension-' + id);
  if (panel) {
      return panel;
  }
  var panel = document.createElement('div');
  panel['id'] = 'extension' + id;
  panel['data-id'] = id;
  //TODO: getTitle, add enable, add remove (bind events)
  document.getElementById('extensions').appendChild(panel);
  return panel;
};

/**
 * Handle message from worker.
 */
macgifer.App.prototype.onWorkerMessage_ = function(e) {
  var frame = e.data;
  date = new Date().getTime();
  console.log('Got frame: ' + frame.length + ' bytes');
  this.connection_.send(common.events.EVT_FRAME, frame);
};

/**
 * Get host name and port.
 */
macgifer.App.prototype.getHost_ = function() {
  var host = window.location.hostname;
  if (window.location.port) {
    host += ':' + window.location.port;
  }
  return host;
};

/**
 * Create canvas.
 */
macgifer.App.prototype.createCanvas_ = function() {
  var canvas = document.createElement('canvas');
  canvas.width = common.WIDTH;
  canvas.height = common.HEIGHT;
  var context = canvas.getContext('2d');
  return canvas;
};

/**
 * Initialize video source.
 */
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

/**
 * Start capture.
 */
macgifer.App.prototype.start = function() {
  this.started_ = true;
  if (!this.interval_)
    this.interval_ = setInterval(this.onFrame_.bind(this), 1000 / common.FRAMERATE);
};

/**
 * Stop capture.
 */
macgifer.App.prototype.stop = function() {
  this.started_ = false;
  clearInterval(this.interval_);
  this.interval_ = null;
};

/**
 * Handle frame.
 */
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
      definition.callback({canvas: this.canvas_});
    });
    var imageData = context.getImageData(0, 0, common.WIDTH, common.HEIGHT);
    this.worker_.postMessage({
      imageData: imageData.data,
    });
  }
};

/**
 * Get ID.
 */
macgifer.App.prototype.getGifId = function() {
  return this.gifId_;
};

/**
 * Set ID.
 */
macgifer.App.prototype.setGifId = function(id) {
  var url = window.location.origin + '/' + id + '.gif';

  // Watch link
  var link = document.getElementById('gif-link');
  link.value = url;

  // Twitter sharer
  var sharer = document.getElementById('twitter-link');
  sharerUrl = 'http://twitter.com/home?status=' +
              'Watch+me+live+on+this+%23MacGifer+GIF+' + encodeURIComponent(url);
  sharer.value = 'Share';
  sharer.onclick = function() {
    window.open(sharerUrl, 'name','height=300,width=400');
  };

  this.gifId_ = id;
};

macgifer.app = macgifer.app || new macgifer.App();
