// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('DQ-GoMjZi2jjKUth');

var express = require('express');
var http = require('http');
var socket = require('socket.io');
var redis = require('redis');

var GIFEncoder = require('./gif/GIFEncoder.js');

var app = express();
var server = http.createServer(app);
var client = redis.createClient();

var isProduction = (process.env.NODE_ENV === 'production');
var port = (isProduction ? 80 : 8000);

var io = socket.listen(server);
server.listen(port);

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

var fs = require('fs');
var stream = fs.createWriteStream('mygif.gif');
var encoder = new GIFEncoder(320, 240);
encoder.stream().onWrite(function(data){
  stream.write(String.fromCharCode(data), 'binary');
});
encoder.setFrameRate(10);
encoder.setRepeat(0);
encoder.writeHeader();
encoder.writeLSD(); // logical screen descriptior
encoder.writeGlobalPalette();


io.sockets.on('connection', function(socket) {
  var gifId = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  /*
    for( var i=0; i < 5; i++ )
        gifId += possible.charAt(Math.floor(Math.random() * possible.length));
  */
  gifId = 'asdf';

  socket.emit('new_id', {
    id: gifId
  });

   //encoder.writeNetscapeExt(); // use NS app extension to indicate reps


  socket.on('frame', function(data) {

    stream.write(data, 'binary');
  
    //console.log((data).toString(16));
    //var a = new Buffer(data).toString('base64');
    //console.log(a);
    client.publish(gifId, data);
    //var b = new Buffer(a, 'base64').toString('binary');
    //console.log(data.charCodeAt(0).toString(16) + '-' + b.charCodeAt(0).toString(16));
  });
});

app.get('/watch/:id.gif', function(req, res){
  var client = redis.createClient();
  var encoder = new GIFEncoder(320, 240);

  res.setHeader('Content-Type', 'image/gif');
  
  encoder.stream().onWrite(function(data){
    res.write(String.fromCharCode(data), 'binary');
  });
  encoder.setFrameRate(10);
  encoder.setRepeat(0);
  encoder.writeHeader();
  encoder.writeLSD(); // logical screen descriptior
  encoder.writeGlobalPalette();
  //encoder.writeNetscapeExt(); // use NS app extension to indicate reps

  client.subscribe(req.params.id);
  client.on('message', function(channel, data){
    //console.log(new Buffer(data, 'base64'));
    //var b = new Buffer(data, 'base64').toString('binary');
    res.write(data, 'binary');
  });
  req.connection.addListener('close', function(){
    //client.unsubscribe();
    //client.end();
  });
});

