$(function() {
  var date = null;

  var url = 'ws://' + window.location.hostname;
  if (window.location.port) {
      url += ':' + window.location.port;
  }
  var socket = new WebSocket(url + '/socket');

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

    if (evt == common.events.EVT_NEW_ID) {
      $('.url a')
        .attr('href', window.location.origin + '/watch/' + data + '.gif')
        .text('Click here!');
    } else if (evt == common.events.EVT_FRAME_RECEIVED) {
      var end = new Date().getTime();
      console.log("time elapsed: " + (end - date) / 1000);
    }
  };

  var worker = new Worker('js/worker.js');
  worker.addEventListener('message', function(e) {
    var frame = e.data;
    date = new Date().getTime();
    console.log("got frame: " + frame.length);
    socket.send(String.fromCharCode(common.events.EVT_FRAME) + frame);
  });

  var video = $('video')[0];
  video.width = common.WIDTH;
  video.height = common.HEIGHT;

  var canvas = document.createElement('canvas');
  canvas.width = common.WIDTH;
  canvas.height = common.HEIGHT;

  var context = canvas.getContext('2d');
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  
  getUserMedia({video: true}, function(stream){
    video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;

    renderTimer = setInterval(function() {
      context.drawImage(video, 0, 0, video.width, video.height);
      if (window.draw) {
          window.draw(context, video.width, video.height);
      }
      onFrame(context);
    }, Math.round(1000 / common.FRAMERATE));
  }, function(err) {
    console.log(err);
  }); 

  var onFrame = function(context) {
    var imageData = context.getImageData(0, 0, common.WIDTH, common.HEIGHT);
    worker.postMessage({
      imageData: imageData.data,
    });
  };
});
