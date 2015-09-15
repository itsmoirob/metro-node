var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');
var mongoose = require('mongoose');

// From metro
var mysql = require('mysql');
var csvParse = require('csv-parse');
var fs = require('fs');
var JSFtp = require("jsftp");
var moment = require('moment');


var config = require('./config');

// connect to mongoLabDb
mongoose.connect(config.mongodb.database, function(err) {
  if(err) console.log(err);
  console.log('Connected to database.');
});
// Connect mysql
var connection = mysql.createConnection({
  host     : config.mysql.host,
  user     : config.mysql.user,
  password : config.mysql.password,
  database : config.mysql.database,
  multipleStatements: true
});

var pool  = mysql.createPool({
  connectionLimit : 10,
  host     : config.mysql.host,
  user     : config.mysql.user,
  password : config.mysql.password,
  database : config.mysql.database,
  multipleStatements: true
});

// // connect ftp
// var Ftp = new JSFtp({
//   host: config.ftp.host,
//   // port: 3331, // defaults to 21
//   user: config.ftp.user, // defaults to "anonymous"
//   pass: config.ftp.pass // defaults to "@anonymous"
// });

var app = express();

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api')(app,connection);
var apiMySQL = require('./routes/apiMySQL')(app,connection,csvParse,fs,moment,pool);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Handle File Uploads
app.use(multer({dest:'./uploads'}));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Handle Express Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave:true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
      root    = namespace.shift(),
      formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// var http = require('http');
// var CronJob = require('cron').CronJob;
// new CronJob('*/1 * * * *', function() {
//
//
//   var options = {
//     host: 'localhost',
//     port:3000,
//     path: '/api/ftp/1'
//   };
//
//   var callback = function(response) { //from https://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request
//
//     response.on('end', function () {
//       console.log("Posted");
//     });
//   };
//
//   http.request(options, callback).end();
//
// }, null, true, 'UTC');


module.exports = app;