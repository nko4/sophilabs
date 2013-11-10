$(function() {

  var date = null;
  var frameRate = 0.1;
  var width = 240;
  var height = 180;

  var url = 'ws://' + window.location.hostname;
  if (window.location.port) {
      url += ':' + window.location.port;
  }
  var socket = new WebSocket(url + '/socket');

  var EVT_FRAME = 1;
  var EVT_DISCONNECT = 2;
  var EVT_NEW_ID = 3;
  var EVT_FRAME_RECEIVED = 4;

  socket.onopen = function() {
      console.log('open');
  };

  socket.onerror = function(err) {
      console.log(err);
  };

  socket.onmessage = function(message) {
    var data = message.data;
    var evt = data[0].charCodeAt(0);
    var data = data.substr(1);

    if (evt == EVT_NEW_ID) {
      $('.url a')
        .attr('href', window.location.origin + '/watch/' + data + '.gif')
        .text('Click here!');
    } else if (evt == EVT_FRAME_RECEIVED) {
      var end = new Date().getTime();
      console.log("time elapsed: " + (end - date)/1000);
    }
  };

  var worker = new Worker('js/worker.js');
  worker.addEventListener('message', function(e) {
    var frame = e.data;
    date = new Date().getTime();
    console.log("got frame: " + frame.length);
    socket.send(String.fromCharCode(EVT_FRAME) + frame);
  });

  var video = $('video')[0];
  video.width = width;
  video.height = height;

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  
  getUserMedia({video: true}, function(stream){
    video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;

    renderTimer = setInterval(function() {
      context.drawImage(video, 0, 0, video.width, video.height);
      onFrame(context);
    }, Math.round(1000 / frameRate));
  }, function(err){
    console.log(err);
  }); 

  var onFrame = function(context) {
    var imageData = context.getImageData(0, 0, width, height);
    worker.postMessage({
      width: width,
      height: height,
      imageData: imageData.data,
    });
  };
});
