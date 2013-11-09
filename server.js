// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('DQ-GoMjZi2jjKUth');

var express = require('express');
var http = require('http');
var socket = require('socket.io');
var redis = require('redis');

var app = express();
var server = http.createServer(app);

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
  res.render('index.jade', {});
});

app.get('/test', function(req, res){
  res.render('test.jade', {});
});

io.sockets.on('connection', function(socket) {
  /*
  socket.emit('news', {
    hello: 'world'
  });
  socket.on('my other event', function(data) {
    console.log(data);
  });*/
});

app.get('/watch/:id.gif', function(req, res){
  var client = redis.createClient();
  client.subscribe(req.params.id);
  client.on('message', function(channel, data){
    res.write(new Buffer(data, 'base64'));
  });
  req.connection.addListener('close', function(){
    client.unsubscribe();
    client.end();
  });
});

