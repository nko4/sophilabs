// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('DQ-GoMjZi2jjKUth');

var express = require('express');
var http = require('http');
var redis = require('redis');
var fs = require('fs');
var ws = require('ws');

var GIFEncoder = require('./gif/GIFEncoder.js');
var common = require('./common.js')

var app = express();
var server = http.createServer(app);
var client = redis.createClient();

var isProduction = (process.env.NODE_ENV === 'production');
var port = (isProduction ? 80 : 8000);

var sockets = new ws.Server({server: server});
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
  app.use(express.favicon(__dirname + '/static/img/favicon.ico'));
});

app.get('/', function(req, res){
  res.render('app.jade', {});
});

app.get('/why', function(req, res){
  res.render('why.jade', {});
});

app.get('/really', function(req, res){
  res.render('really.jade', {});
});

sockets.on('connection', function(socket) {
  var gifId = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        gifId += possible.charAt(Math.floor(Math.random() * possible.length));

  socket.send(String.fromCharCode(common.events.EVT_NEW_ID) + gifId);

  socket.on('message', function(data) {
      var evt = data[0].charCodeAt(0);
      var data = data.substr(1);
      if (evt == common.events.EVT_FRAME) {
        client.publish('frame.' + gifId, data);
        socket.send(String.fromCharCode(common.events.EVT_FRAME_RECEIVED));
      }
  });

  socket.on('close', function() {
    client.publish('event.' + gifId, 'disconnect');
  });
});

app.get('/watch/:id.gif', function(req, res) {
  var client = redis.createClient();
  var encoder = new GIFEncoder(common.WIDTH, common.HEIGHT);

  res.setHeader('Content-Type', 'image/gif');
  
  encoder.stream().onWrite(function(data) {
    res.write(String.fromCharCode(data), 'binary');
  });

  encoder.setFrameRate(common.RECV_FRAMERATE);
  encoder.setRepeat(-1);
  encoder.writeHeader();
  encoder.writeLSD(); // logical screen descriptior
  encoder.writeGlobalPalette();
  encoder.writeNetscapeExt(); // use NS app extension to indicate reps
  encoder.addFrame(adjustment);

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
