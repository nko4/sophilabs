(function(){
  var canvas = document.getElementsByTagName('canvas')[0];
  var context = canvas.getContext('2d');
  var width = 320;
  var height = 240;
  //var fontSize = 30;
  var fontSize = 15;
  var fontSpace = 5;
  var fontLine = 1;

  context.rect(0, 0, width, height);
  //context.fillStyle = 'yellow';
  context.fillStyle = 'black';
  context.fill();
  context.restore();

  var getLines = function(context, text, width){
      var words = text.replace(/^\s+|\s+$/g, '').split(' ');
      var lines = [];
      var selection = words.length;
      while (words.length > 0) {
        var current = words.slice(0, selection).join(' ');
        if (context.measureText(current).width < width || selection == 1) {
          lines.push(current);
          words = words.slice(selection);
          selection = words.length;
        } else {
          selection -=1;
        }
      }
      return lines;
  };
  
  var printLines = function(context, f, lines, x, y, inc) {
    lines.forEach(function(line){
      context[f](line, x, y);
      y += inc;
    });
  };

  //context.font = 'bold ' + fontSize + 'px Impact';
  context.font = 'bold ' + fontSize + 'px Arial';
  context.textAlign = 'center';
  //context.fillStyle = '#ffffff';
  context.fillStyle = '#ffff00';

  //var topLines = getLines(context, 'I don\'t always stream video'.toUpperCase(), width);
  //var bottomLines = getLines(context, 'But when I do, I use macgifer.net'.toUpperCase(), width);
  var bottomLines = getLines(context, 'MacGifer, are you?', width).reverse();

  //printLines(context, 'fillText', topLines, width/2, fontSize + 10, fontSize + fontSpace);
  printLines(context, 'fillText', bottomLines, width/2, height - 10, -1 * (fontSize + fontSpace));

  context.strokeStyle = '#000000';
  context.lineWidth = fontLine;
  //printLines(context, 'strokeText', topLines, width/2, fontSize + 10, fontSize + fontSpace);
  printLines(context, 'strokeText', bottomLines, width/2, height - 10, -1 * (fontSize + fontSpace));

  context.restore();
})();
