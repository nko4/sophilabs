macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.extensions.Meme = function(app) {
  this._app = app;
  this.fontSize_ = 15;
  this.fontSpace_ = 5;
  this.fontLine_ = 1;
  this.enabled_ = true;
  
  var panel = app.createExtensionPanel(this);
  
  this.panel_ = panel;

  app.on(this.getId(), macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
};

macgifer.extensions.Meme.ID = 'meme';

macgifer.extensions.Meme.prototype.getId = function(enabled) {
    return macgifer.extensions.Meme.ID;
};

macgifer.extensions.Meme.prototype.getTitle = function() {
    return 'Meme';
};

macgifer.extensions.Meme.prototype.setEnable = function(enabled) {
    this.enabled_ = enabled;
};

macgifer.extensions.Meme.prototype.onFrame_ = function(event) {
  if (!this.enabled_) {
      return;
  }

  var canvas = event.canvas;
  var context = canvas.getContext('2d');

  var width = canvas.width;
  var height = canvas.height;
  var center = width / 2;

  var topText = 'TEST TOP';
  var bottomText = 'TEST BOTTOM';
  
  context.font = 'bold ' + this.fontSize_ + 'px Impact';
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';

  var topLines = macgifer.extensions.getLines(
    context, topText.toUpperCase(), width);
  var bottomLines = macgifer.extensions.getLines(context,
    bottomText.toUpperCase(), width).reverse();

  macgifer.extensions.printLines(context, 'fillText', topLines, center,
    this.fontSize_ + 10, this.fontSize_ + this.fontSpace_);
  macgifer.extensions.printLines(context, 'fillText', bottomLines, center,
    height - 10, -1 * (this.fontSize_ + this.fontSpace_));

  context.strokeStyle = '#000000';
  context.lineWidth = this.fontLine_;
  macgifer.extensions.printLines(context, 'strokeText', topLines, center,
    this.fontSize_ + 10, this.fontSize_ + this.fontSpace_);
  macgifer.extensions.printLines(context, 'strokeText', bottomLines,
    center, height - 10, -1 * (this.fontSize_ + this.fontSpace_));

  context.restore();
};

macgifer.extensions.active.push(macgifer.extensions.Meme);
