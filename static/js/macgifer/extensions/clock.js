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
};
