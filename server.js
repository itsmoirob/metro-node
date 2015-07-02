var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mysql = require('mysql');
var csvParse = require('csv-parse');
var fs = require('fs');
var moment = require('moment');
var async = require('async');
var JSFtp = require("jsftp");


var config = require('./config.js');
var mysql_config = require('./mysql_config.js');

var app = express();

var connection = mysql.createConnection({
  host     : mysql_config.host,
  user     : mysql_config.user,
  password : mysql_config.password,
  database : mysql_config.database,
  multipleStatements: true
});

var pool  = mysql.createPool({
  connectionLimit : 10,
  host     : mysql_config.host,
  user     : mysql_config.user,
  password : mysql_config.password,
  database : mysql_config.database,
  multipleStatements: true
});

var Ftp = new JSFtp({
  host: "ftp.stark.co.uk",
  // port: 3331, // defaults to 21
  user: "SKPS1805", // defaults to "anonymous"
  pass: "9Sk8*sK#" // defaults to "@anonymous"
});

require('./app/routes/api')(app,connection);
require('./app/routes/apiMySQL.js')(app,connection,csvParse,fs,moment,async,pool,Ftp);

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(config.port, function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log("Listening on port 3000.");
  }
});
