macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

/**
 * App
 */
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

  document.getElementById('extension-add').addEventListener(
          'click', this.addExtension_.bind(this));

  document.getElementById('rec-button').addEventListener('click',
    this.startRecording_.bind(this));

  var gifLink = document.getElementById('gif-link');
  gifLink.addEventListener('click', gifLink.select.bind(gifLink));

  this.worker_ = new Worker('/js/macgifer/worker.js');
  this.worker_.addEventListener('message', this.onWorkerMessage_.bind(this));

  this.connection_ = new macgifer.Connection(this.getHost_());
  this.connection_.on(common.events.EVT_NEW_ID, this.setGifId.bind(this));
  this.connection_.connect();
};

// Event on frame added
macgifer.App.EVT_FRAME = 'frame';

/**
 * Add extension.
 */
macgifer.App.prototype.addExtension_ = function() {
  var src = prompt('Path to javascript file:');
  if (src) {
    var script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
  }
};

/**
 * Enable extension.
 */
macgifer.App.prototype.enableExtension_ = function(event) {
    var id = event.target['data-id'];
    this.extensions_[id].enable = event.target.checked;
};

/**
 * Load extension.
 */
macgifer.App.prototype.loadExtension_ = function(extension) {
  var instance = new extension(this);
  if (this.extensions_[instance.getId()]) {
      return;
  }
  this.extensions_[instance.getId()] = {extension: instance, enable: false};
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
  delete this.extensions_[id];
};

/**
 * Add event listener.
 */
macgifer.App.prototype.on = function(id, name, callback) {
  this.events_[name].push({id: id, callback: callback});
};

/**
 * Get panel of extensions.
 */
macgifer.App.prototype.createExtensionPanel = function(extension) {
  var id = extension.getId();
  var boxId = 'extension-' + id;
  var panelId = 'extension-' + id + '-panel';
  var enableId = 'extension-' + id + '-enable'; 
  var panel = document.getElementById(panelId);
  if (panel) {
    return panel;
  }

  var box = document.createElement('div');
  box['id'] = boxId;
  box['data-id'] = id;
  box.className = 'extension';
  
  var toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  var checkbox = document.createElement('input');
  checkbox['id'] = enableId;
  checkbox['type'] = 'checkbox';
  checkbox['data-id'] = id;
  checkbox.addEventListener('click', this.enableExtension_.bind(this));
  toolbar.appendChild(checkbox);
  var label = document.createElement('label');
  label.setAttribute('for', enableId);
  label.innerHTML = 'Enable';
  toolbar.appendChild(label);
  var header = document.createElement('div');
  header.className = 'header';
  header.appendChild(toolbar);
  var title = document.createElement('h4');
  title.innerHTML = extension.getTitle();
  header.appendChild(title);
  box.appendChild(header);

  var panel = document.createElement('div');
  panel['id'] = panelId;
  panel.className = id;
  box.appendChild(panel);
    
  document.getElementById('extensions').insertBefore(box,
    document.getElementById('extensions').firstChild);

  return panel;
};

/**
 * Handle message from worker.
 */
macgifer.App.prototype.onWorkerMessage_ = function(e) {
  var frame = e.data;
  date = new Date().getTime();
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
 * Start gif transmission
 */
macgifer.App.prototype.startRecording_ = function() {
  this.initializeCamera(function(){
    var elements = document.querySelectorAll('.camera video, .camera .url');
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display = 'block';
    }
    document.getElementById('rec-button').style.display = 'none';
  });
};

/**
 * Initialize video source.
 */
macgifer.App.prototype.initializeCamera = function(callback) {
  var that = this;

  getUserMedia({video: true}, function(stream){
    that.video_.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    if (!this.started_) {
      that.start();
    }
    callback();
  }, function(err) {
    console.log(err);
  });
};

/**
 * Start capture.
 */
macgifer.App.prototype.start = function() {
  this.started_ = true;
  if (!this.interval_) {
    this.interval_ = setInterval(this.onFrame_.bind(this),
                                 1000 / common.FRAMERATE);
  }
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
    var extensions = this.extensions_;
    var canvas = this.canvas_;
    var context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(this.video_, 0, 0, this.video_.width, this.video_.height);
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    this.events_[macgifer.App.EVT_FRAME].forEach(function(definition){
      if (extensions[definition.id].enable) {
        try {
          definition.callback({canvas: canvas});
        } catch(e) {
          console.log(e);
        }  
      }
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
