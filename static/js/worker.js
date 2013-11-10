//importScripts('/js/gif/NeuQuant.js')
importScripts('/js/gif/TypedNeuQuant.js')
importScripts('/js/gif/LZWEncoder.js')
importScripts('/js/gif/ByteArray.js')
importScripts('/js/gif/GIFEncoder.js')

var started = false;
var encoder = null;

onmessage = function(e) {
  var data = e.data;
  var buffer = '';

  if (!started) {
    encoder = new GIFEncoder(data.width, data.height);
    encoder.setFrameRate(1);
    started = true;
  }
  encoder.stream().onWrite(function(val) {
    buffer += String.fromCharCode(val);
  });

  encoder.addFrame(data.imageData);
  postMessage(buffer);
};
