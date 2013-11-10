macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || {};
macgifer.extensions.active = macgifer.extensions.active || [];

macgifer.extensions.Meme = function(app) {
  this._app = app;
  app.on(macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
};

macgifer.extensions.Meme.prototype.onFrame_ = function(event) {
  var canvas = event.canvas;
  var context = canvas.getContext('2d');

  context.restore();
};

macgifer.extensions.active.push(macgifer.extensions.Meme);
