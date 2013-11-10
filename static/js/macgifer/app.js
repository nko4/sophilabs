macgifer = macgifer || {};
macgifer.extensions = imacgifer.extensions || [];

macgifer.App = function () {
    this.events_ = [];
    this.extensions_ = [];
    var extensions = macgifer.extensions.slice();
    var loadExtension = this.loadExtension_.bind(this);
    macgifer.extensions = {'push': loadExtension};
    extensions.forEach(loadExtension);
};

macgifer.App.EVT_FRAME = 'frame';

macgifer.App.protoype.loadExtension_ = function(extension) {
    this.extensions_.push(extension(this));
};

maicgifer.App.prototype.on = function(name, callback) {
   this.events_[name] = this.events_[name] || [];
   this.events_[name].push(callback);
};

macgifer.app = macgifer.app || macgifer.App();
