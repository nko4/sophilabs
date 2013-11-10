macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.extensions.Clock = function(app) {
  this.app_ = app;
  app.on(this.getId(), macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
  this.panel_ = app.createExtensionPanel(this);
};

macgifer.extensions.Clock.ID = 'clock';

macgifer.extensions.Clock.prototype.getId = function(enabled) {
    return macgifer.extensions.Clock.ID;
};

macgifer.extensions.Clock.prototype.getTitle = function() {
    return 'Clock';
};

macgifer.extensions.Clock.prototype.onFrame_ = function(event) {
  var canvas = event.canvas;
  var context = canvas.getContext('2d');
  var now = new Date();

  context.fillStyle = 'black';
  context.fill();
  context.restore();
  context.font = 'bold 12px Arial';
  context.textAlign = 'left';
  context.fillStyle = '#ffff00';
  context.fillText(now.toLocaleTimeString(), canvas.width / 2 + 30, 15);
  

  context.strokeStyle = '#000000';
  context.lineWidth = 1;
  context.strokeText(now.toLocaleTimeString(), canvas.width / 2 + 30, 15);

  context.restore();
};

macgifer.extensions.active.push(macgifer.extensions.Clock);
