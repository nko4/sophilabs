$(function() {

  var frameRate = 1;
  var width = 320;
  var height = 240;

  var worker = new Worker('js/worker.js');

  var video = $('video')[0];
  video.width = width;
  video.height = height;

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  
  var colorDiv = $('.color');
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
