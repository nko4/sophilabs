//importScripts('/vendor/lib/NeuQuant.js')
importScripts('/vendor/lib/TypedNeuQuant.js')
importScripts('/vendor/lib/LZWEncoder.js')
importScripts('/vendor/lib/ByteArray.js')
importScripts('/vendor/lib/GIFEncoder.js')
importScripts('/js/common.js')

var started = false;
var encoder = null;

/*
 * Handle incoming message.
 */
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

  // Add frame to encoder
  encoder.addFrame(data.imageData);

  // Send encoded frame
  postMessage(buffer);
};
