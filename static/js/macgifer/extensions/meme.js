macgifer = macgifer || {};
macgifer.extensions = macgifer.extensions || [];

macgifer.extensions.Meme = function(app) {
    app.on(macgifer.App.EVT_FRAME, this.onFrame_.bind(this));
    this._app = app;
};

macgifer.extensions.Meme.name = 'meme';

macgifer.extensions.Meme.prototype.onFrame_ = function(data) {

};

macgifer.extensions.push(macgifer.extensions.Meme);
