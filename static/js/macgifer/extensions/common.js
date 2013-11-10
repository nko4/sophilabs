window.macgifer = window.macgifer || {};
macgifer.extensions = macgifer.extensions || [];

macgifer.extensions.getLines = function(context, text, width) {
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

macgifer.extensions.printLines = function(context, f, lines, x, y, inc) {
  lines.forEach(function(line){
    context[f](line, x, y);
    y += inc;
  });
};

