// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('DQ-GoMjZi2jjKUth');

var express = require('express');
var http = require('http');
var redis = require('redis');
var fs = require('fs');
var ws = require('ws');

var GIFEncoder = require('./lib/GIFEncoder.js');

// Common settings
var common = require('./common.js')

// Create app and websockets
var app = express();
var server = http.createServer(app);
var client = redis.createClient();
var sockets = new ws.Server({
    server: server
});

// Port
var isProduction = (process.env.NODE_ENV === 'production');
var port = (isProduction ? 80 : 8000);

server.listen(port);

/*
 * Configure express app.
 */
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

/**
 * Index
 */
app.get('/', function(req, res) {
  res.redirect('/index.htm');
});

/**
 * Index
 */
app.get('/index.htm', function(req, res) {
  res.render('app.jade', {});
});

/**
 * Why
 */
app.get('/why.htm', function(req, res) {
  res.render('why.jade', {});
});

/**
 * Really
 */
app.get('/really.htm', function(req, res) {
  res.render('really.jade', {});
});

/**
 * About
 */
app.get('/about.htm', function(req, res) {
  res.render('about.jade', {});
});

/**
 * Watch a stream.
 */
app.get('/watch/:id.gif', function(req, res) {
  var client = redis.createClient();
  var encoder = new GIFEncoder(common.WIDTH, common.HEIGHT);

  res.setHeader('Content-Type', 'image/gif');
  
  /*
   * Write GIF header.
   */
  encoder.stream().onWrite(function(data) {
    res.write(String.fromCharCode(data), 'binary');
  });
  encoder.setFrameRate(common.RECV_FRAMERATE);
  encoder.setRepeat(-1);
  encoder.writeHeader();
  encoder.writeLSD(); // logical screen descriptior
  encoder.writeGlobalPalette();
  encoder.addFrame(adjustment);

  /*
   * Read frames from Redis channel.
   */
  client.psubscribe('*.' + req.params.id);
  client.on('pmessage', function(pattern, channel, data) {
    channel = channel.split('.');

    var type = channel[0];
    var gifId = channel[1];

    if (type == common.redis.CH_FRAME) {
      console.log('Received frame');
      res.write(data, 'binary');
    } else if (type == common.redis.CH_EVENT) {
      console.log('Received event: ' + data);
      if (data == common.redis.EVT_DISCONNECt) {
        encoder.addFrame(adjustment);
      }
    }
  });

  /*
   * Close output stream.
   */
  req.connection.addListener('close', function() {
    client.unsubscribe();
    client.end();
  });
});

/*
 * Load adjustment image.
 */
var file = __dirname + '/res/adjustment-' + 
           common.WIDTH + 'x' + common.HEIGHT + '.json';
var adjustment = null;
fs.readFile(file, 'utf8', function(err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
  adjustment = JSON.parse(data);
});

/**
 * Generate an id using A-Z,a-z,0-9.
 */
var generateId = function() {
  var id = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                 "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
};

/**
 * Setup new socket connection.
 */
sockets.on('connection', function(socket) {
  var gifId = generateId();

  socket.send(String.fromCharCode(common.events.EVT_NEW_ID) + gifId);

  /*
   * Receive frames and write to Redis channel.
   */
  socket.on('message', function(data) {
    var evt = data[0].charCodeAt(0);
    var data = data.substr(1);
    if (evt == common.events.EVT_FRAME) {
      client.publish(common.redis.CH_FRAME + '.' + gifId, data);
      socket.send(String.fromCharCode(common.events.EVT_FRAME_RECEIVED));
    }
  });

  /*
   * Close input stream.
   */
  socket.on('close', function() {
    client.publish(common.redis.CH_EVENT + '.' + gifId,
                   common.redis.EVT_DISCONNECT);
  });
});
