//importScripts('/js/gif/NeuQuant.js')
importScripts('/js/vendor/lib/TypedNeuQuant.js')
importScripts('/js/vendor/lib/LZWEncoder.js')
importScripts('/js/vendor/gif/ByteArray.js')
importScripts('/js/vendor/gif/GIFEncoder.js')
importScripts('/js/common.js')

var started = false;
var encoder = null;

onmessage = function(e) {
  var data = e.data;
  var buffer = '';

  if (!started) {
    encoder = new GIFEncoder(common.WIDTH, common.HEIGHT);
    encoder.setFrameRate(common.RECV_FRAMERATE);
    started = true;
  }
  encoder.stream().onWrite(function(val) {
    buffer += String.fromCharCode(val);
  });

  encoder.addFrame(data.imageData);
  postMessage(buffer);
};
