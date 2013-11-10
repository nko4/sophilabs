$(function() {

  var date = null;
  var frameRate = 1;
  var width = 240;
  var height = 180;
  var socket = io.connect('ws://' + window.location.hostname);

  socket.on('new_id', function(data){
    $('.url a')
      .attr('href', window.location.origin + '/watch/' + data.id + '.gif')
      .text('Click here!');
  });
  socket.on('frame_received', function(){
    var end = new Date().getTime();
    console.log("time elapsed: " + (end - date)/1000);
  });
  var worker = new Worker('js/worker.js');
  worker.addEventListener('message', function(e) {
    var frame = e.data;
    date = new Date().getTime();
    console.log("got frame: " + frame.length);
    socket.emit('frame', frame);
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
