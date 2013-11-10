// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('DQ-GoMjZi2jjKUth');

var express = require('express');
var http = require('http');
var socket = require('socket.io');
var redis = require('redis');
var fs = require('fs');

var GIFEncoder = require('./gif/GIFEncoder.js');

var app = express();
var server = http.createServer(app);
var client = redis.createClient();

var isProduction = (process.env.NODE_ENV === 'production');
var port = (isProduction ? 80 : 8000);

var io = socket.listen(server);
server.listen(port);

var file = __dirname + '/gif/adjustment.json';
var adjustment = null;
fs.readFile(file, 'utf8', function(err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
  adjustment = JSON.parse(data);
});

//generic config
app.configure(function() {
  app.set('views', __dirname + '/templates');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'topsecret' }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
});

app.get('/', function(req, res){
  res.render('app.jade', {});
});

app.get('/intro', function(req, res){
  res.render('intro.jade', {});
});

app.get('/canvas', function(req, res){
  res.render('canvas.jade', {});
});


/*
var ChannelEvent = function(type, value) {
    this.type = type;
    this.value = value;
};

ChannelEvent.prototype.toString() {
    return this.type + ':' + this.value;
};*/

io.sockets.on('connection', function(socket) {
  var gifId = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        gifId += possible.charAt(Math.floor(Math.random() * possible.length));

  socket.emit('new_id', {
    id: gifId
  });

  socket.on('frame', function(data) {
    client.publish('frame.' + gifId, data);
    socket.emit('frame_received', '');
  });

  socket.on('disconnect', function() {
    client.publish('event.' + gifId, 'disconnect');
  });
});

app.get('/watch/:id.gif', function(req, res) {
  var client = redis.createClient();
  var encoder = new GIFEncoder(320, 240);

  res.setHeader('Content-Type', 'image/gif');
  
  encoder.stream().onWrite(function(data) {
    res.write(String.fromCharCode(data), 'binary');
  });

  encoder.setFrameRate(20);
  encoder.setRepeat(-1);
  encoder.writeHeader();
  encoder.writeLSD(); // logical screen descriptior
  encoder.writeGlobalPalette();
  encoder.writeNetscapeExt(); // use NS app extension to indicate reps

  client.psubscribe('*.' + req.params.id);

  client.on('pmessage', function(pattern, channel, data) {
    channel = channel.split('.');

    var type = channel[0];
    var gifId = channel[1];

    if (type == 'frame') {
      console.log('received frame');
      res.write(data, 'binary');

    } else if (type == 'event') {
      console.log('received event: ' + data);
      if (data == 'disconnect') {
        encoder.addFrame(adjustment);
      }
    }
  });

  req.connection.addListener('close', function() {
    client.unsubscribe();
    client.end();
  });
});
