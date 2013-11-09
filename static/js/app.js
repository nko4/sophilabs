$(function(){
  var frameRate = 10;
  var width = 320;
  var height = 240;

  var socket = io.connect('http://localhost');
  var encoder = new GIFEncoder(width, height);
  encoder.setFrameRate(10);
  encoder.setRepeat(0);

  encoder.stream().onWrite(function(val) {
      socket.emit('frame', String.fromCharCode(val));
  });

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
      onFrame(canvas);
    }, Math.round(1000 / frameRate));
  }, function(err){
    console.log(err);
  }); 

  var onFrame = function(canvas) {
    var context = canvas.getContext("2d");
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
    encoder.addFrame(imageData.data);

    var color = getColorAtOffset(imageData.data, 3000);
    colorDiv.css('background-color', 'rgb('+color.red+','+color.green+','+color.blue+')');
    for (var y = 0; y < canvasHeight; y += 2) { // every other row because letters are not square
      for (var x = 0; x < canvasWidth; x++) {
        // get each pixel's brightness and output corresponding character
        var offset = (y * canvasWidth + x) * 4;
        var color = getColorAtOffset(imageData.data, offset);
        
      }
    }
  };

  var getColorAtOffset = function(data, offset) {
    return {
      red: data[offset],
      green: data[offset + 1],
      blue: data[offset + 2],
      alpha: data[offset + 3]
    };
  }
});
