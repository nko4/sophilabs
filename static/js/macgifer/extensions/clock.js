macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.extensions.Clock = function(app) {
  this.app_ = app;
  app.on(macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
};

macgifer.extensions.Clock.prototype.onFrame_ = function(e) {
  var canvas = e.canvas;
  var context = canvas.getContext('2d');
  var now = new Date();

  context.fillStyle = 'black';
  context.fill();
  context.restore();
  context.font = 'bold 12px Arial';
  context.textAlign = 'left';
  context.fillStyle = '#ffff00';
  context.fillText(now.toLocaleTimeString(), common.WIDTH / 2 + 30, 15);
  

  context.strokeStyle = '#000000';
  context.lineWidth = 1;
  context.strokeText(now.toLocaleTimeString(), common.WIDTH / 2 + 30, 15);
};

macgifer.extensions.active.push(macgifer.extensions.Clock);
