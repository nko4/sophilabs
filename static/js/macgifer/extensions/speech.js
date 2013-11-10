macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.extensions.Speech = function(app) {
  this._app = app;
  this.fontSize_ = 14;
  this.fontSpace_ = 5;
  this.fontLine_ = 1;
  this.capturing_ = false;
  this.text_ = '';
  this.recognition_ = null;
  
  var recognition = !!window.webkitSpeechRecognition;
  var panel = app.createExtensionPanel(this);
  var button = document.createElement('input');
  button['type'] = 'button';
  button['value'] = recognition ? 'Start Capture' : 'Not Supported';
  button.disabled = !recognition;
  button.addEventListener('click', this.startCapture_.bind(this));
  panel.appendChild(button);
  this.panel_ = panel;
  this.button_ = button;

  app.on(this.getId(), macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
};

macgifer.extensions.Speech.ID = 'speech';

macgifer.extensions.Speech.prototype.getId = function() {
  return macgifer.extensions.Speech.ID;
};

macgifer.extensions.Speech.prototype.getTitle = function() {
  return 'Speech Recognition';
};

macgifer.extensions.Speech.prototype.startCapture_ = function() {
  if (this.capturing_) {
    this.endCapture_();
    return;
  }
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  //recognition.interimResults = true;
  recognition.onstart = this.start_.bind(this);
  recognition.onresult = this.result_.bind(this);
  recognition.onend = this.end_.bind(this);
  this.recognition_ = recognition;
  recognition.start();
};

macgifer.extensions.Speech.prototype.start_ = function() {
  this.button_.value = 'Capturing...';
  this.capturing_ = true;
  this.text_ = '';
  setTimeout(this.endCapture_.bind(this), 50000);
};

macgifer.extensions.Speech.prototype.result_ = function(event) {
  console.log(event);
  for(var i=event.resultIndex; i<event.results.length; i++){ i
    this.text_ = event.results[i][0].transcript;
  }
};

macgifer.extensions.Speech.prototype.end_ = function() {
  this.button_.value = 'Start Capture';
  this.capturing_ = false;
};

macgifer.extensions.Speech.prototype.endCapture_ = function() {
  if (!this.capturing_) {
    return;
  }
  this.recognition_.stop();
  this.recognition_ = null;
};

macgifer.extensions.Speech.prototype.onFrame_ = function(event) {
  var canvas = event.canvas;
  var context = canvas.getContext('2d');

  var width = canvas.width;
  var height = canvas.height;
  var center = width / 2;

  var bottomText = this.text_;
  
  context.font = 'bold ' + this.fontSize_ + 'px Arial';
  context.textAlign = 'center';
  context.fillStyle = '#ffff00';

  var bottomLines = macgifer.extensions.getLines(context,
    bottomText, width).reverse();

  macgifer.extensions.printLines(context, 'fillText', bottomLines, center,
    height - 10, -1 * (this.fontSize_ + this.fontSpace_));

  context.strokeStyle = '#000000';
  context.lineWidth = this.fontLine_;
  macgifer.extensions.printLines(context, 'strokeText', bottomLines,
    center, height - 10, -1 * (this.fontSize_ + this.fontSpace_));

  context.restore();
};

macgifer.extensions.active.push(macgifer.extensions.Speech);
