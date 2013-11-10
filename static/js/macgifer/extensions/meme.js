macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || [];

macgifer.extensions.Meme = function(app) {
  this._app = app;
  app.on(macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
};

macgifer.extensions.Meme.prototype.onFrame_ = function(event) {
  var canvas = event.canvas;

  context.restore();
};

macgifer.extensions.push(macgifer.extensions.Meme);
