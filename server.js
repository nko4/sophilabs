// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('DQ-GoMjZi2jjKUth');

var express = require('express');

var app = express();

var isProduction = (process.env.NODE_ENV === 'production');
var port = (isProduction ? 80 : 8000);

//generic config
app.configure(function(){
  app.set('views', __dirname + '/templates');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'topsecret' }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
});

app.get('/', function(req, res){
  res.render('index.ejs', {});
});

app.listen(port);
