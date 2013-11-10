macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.extensions.Subtitles = function(app) {
  this._app = app;
  this.fontSize_ = 14;
  this.fontSpace_ = 5;
  this.fontLine_ = 1;
  
  var panel = app.createExtensionPanel(this);
  var bottomInput = document.createElement('input');
  bottomInput['type'] = 'text';
  bottomInput['placeholder'] = 'Bottom text';
  bottomInput['maxlength'] = 120;
  panel.appendChild(bottomInput);
  this.panel_ = panel;
  this.bottomInput_ = bottomInput;
  app.on(this.getId(), macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
};

macgifer.extensions.Subtitles.ID = 'subtitles';

macgifer.extensions.Subtitles.prototype.getId = function() {
    return macgifer.extensions.Subtitles.ID;
};

macgifer.extensions.Subtitles.prototype.getTitle = function() {
    return 'Subtitles';
};

macgifer.extensions.Subtitles.prototype.onFrame_ = function(event) {
  var canvas = event.canvas;
  var context = canvas.getContext('2d');

  var width = canvas.width;
  var height = canvas.height;
  var center = width / 2;

  var bottomText = this.bottomInput_.value;
  
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

macgifer.extensions.active.push(macgifer.extensions.Subtitles);
