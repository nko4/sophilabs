importScripts('/js/gif/NeuQuant.js')
importScripts('/js/gif/TypedNeuQuant.js')
importScripts('/js/gif/LZWEncoder.js')
importScripts('/js/gif/ByteArray.js')
importScripts('/js/gif/GIFEncoder.js')
importScripts('/socket.io/socket.io.js')

var started = false;
var socket = null;
var encoder = null;

onmessage = function(e) {
  var data = e.data;

  if (!started) {
    socket = io.connect('http://localhost');

    encoder = new GIFEncoder(data.width, data.height);
    encoder.setFrameRate(1000);
    encoder.stream().onWrite(function(val) {
      socket.emit('frame', String.fromCharCode(val));
    });

    started = true;
  }

  encoder.addFrame(data.imageData);
};
