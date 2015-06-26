var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mysql = require('mysql');

var config = require('./config.js');
var mysql_config = require('./mysql_config.js');

var app = express();

var connection = mysql.createConnection({
  host     : mysql_config.host,
  user     : mysql_config.user,
  password : mysql_config.password,
  database : mysql_config.database
});

require('./app/routes/api')(app,connection);

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
