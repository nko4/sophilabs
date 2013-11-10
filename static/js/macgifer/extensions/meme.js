macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.extensions.Meme = function(app) {
  this._app = app;
  this.fontSize_ = 18;
  this.fontSpace_ = 5;
  this.fontLine_ = 1;
  
  var panel = app.createExtensionPanel(this);
  var topInput = document.createElement('input');
  topInput['type'] = 'text';
  topInput['placeholder'] = 'Top text';
  topInput['maxlength'] = 120;
  panel.appendChild(topInput);
  var bottomInput = document.createElement('input');
  bottomInput['type'] = 'text';
  bottomInput['placeholder'] = 'Bottom text';
  bottomInput['maxlength'] = 120;
  panel.appendChild(bottomInput);
  this.panel_ = panel;
  this.topInput_ = topInput;
  this.bottomInput_ = bottomInput;
  app.on(this.getId(), macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
};

macgifer.extensions.Meme.ID = 'meme';

macgifer.extensions.Meme.prototype.getId = function() {
    return macgifer.extensions.Meme.ID;
};

macgifer.extensions.Meme.prototype.getTitle = function() {
    return 'Meme';
};

macgifer.extensions.Meme.prototype.onFrame_ = function(event) {
  var canvas = event.canvas;
  var context = canvas.getContext('2d');

  var width = canvas.width;
  var height = canvas.height;
  var center = width / 2;

  var topText = this.topInput_.value;
  var bottomText = this.bottomInput_.value;
  
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
