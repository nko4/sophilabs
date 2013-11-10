macgifer = macgifer || {};
macgifer.Connection = macgifer.Connection || {};

macgifer.Connection = function(host) {
  this.host_ = host;
  this.socket_ = null;
  this.callbacks_ = {};
};

macgifer.Connection.prototype.connect = function() {
  this.socket_ = new WebSocket('ws://' + this.host_ + '/socket');
  this.socket_.onerror = this.onError_.bind(this);
  this.socket_.onmessage = this.onMessage_.bind(this);
};

macgifer.Connection.prototype.send = function(eventId, message) {
  this.socket_.send(String.fromCharCode(eventId) + message);
};

macgifer.Connection.prototype.onError_ = function(err) {
  
};

macgifer.Connection.prototype.onMessage_ = function(message) {
  var data = message.data;
  var evt = data[0].charCodeAt(0);
  var data = data.substr(1);
  var callback = this.callbacks_[evt];
  if (callback) {
    callback(data);
  }
};

macgifer.Connection.prototype.on = function(eventId, callback) {
  console.log(this);
  this.callbacks_[eventId] = callback;
};