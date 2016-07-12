var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var mysql = require('mysql');
var config = require('../config');

// Connect mysql
var connection = mysql.createConnection({
	host: config.mysql.host,
	user: config.mysql.user,
	password: config.mysql.password,
	database: config.mysql.database,
	multipleStatements: true
});

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
	res.render('register', {
		'title': 'Register'
	});
});

router.get('/login', function(req, res, next) {
	res.render('login', {
		'title': 'Login'
	});
});



router.post('/register', function(req, res, next) {
	// Get Form Values
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Check for Image Field
	if (req.files.profileimage) {
		console.log('Uploading File...');

		// File Info
		var profileImageOriginalName = req.files.profileimage.originalname;
		var profileImageName = req.files.profileimage.name;
		var profileImageMime = req.files.profileimage.mimetype;
		var profileImagePath = req.files.profileimage.path;
		var profileImageExt = req.files.profileimage.extension;
		var profileImageSize = req.files.profileimage.size;
	} else {
		// Set a Default Image
		var profileImageName = 'noimage.png';
	}

	// Form Validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email not valid').isEmail().contains("@primrosesolar.com");
	req.checkBody('username', 'Username field is required').notEmpty();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	// Check for errors
	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileImageName
		});

		// Create User
		User.createUser(newUser, function(err, user) {
			if (err) throw err;
			console.log(user);
		});


		// Success Message
		req.flash('success', 'You are now registered and may log in');

		res.location('/');
		res.redirect('/');
	}
});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user) {
			if (err) throw err;
			if (!user) {
				console.log('Unknown User');
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function(err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					console.log('Invalid Password');
					return done(null, false, { message: 'Invalid Password' });
				}
			});
		});
	}
));

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }), function(req, res) {
	console.log('Authentication Successful');
	req.flash('success', 'You are logged in');
	if (req.user.username == 'db') {
		res.redirect('/#/welcomeToEveley');
	} else {
		res.redirect('/'); 
	}
});

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('/users/login');
});

router.post('/newIncidentLog', function(req, res, next) {
	console.log("POST: ");
	// connection.connect();

	name = req.user.name;
	var site = req.body.site;
	var selectStartDate = req.body.selectStartDate;
	var selectStartTime = req.body.selectStartTime;
	var selectEndTime = null;
	if (!req.body.selectEndTime) {
		selectEndTime = "23:59";
	} else {
		selectEndTime = req.body.selectEndTime;
	}
	var endDateTime;
	if (req.body.selectEndDate) {
		endDateTime = "'" + req.body.selectEndDate + " " + selectEndTime + "'";
	} else {
		endDateTime = "NULL";
	}
	var reportedByPerson = req.body.reportedByPerson;
	var reportedByCompany = req.body.reportedByCompany;
	var planned = req.body.planned;
	var lossOfGeneration = req.body.lossOfGeneration;
	var category = req.body.category;
	var details = req.body.details;
	var isClosed = req.body.isClosed;


	connection.query("start transaction; insert into incident_log values (NULL," +
		site + ", now(), '" +
		selectStartDate + " " + selectStartTime + "', " +
		endDateTime + ", '" +
		reportedByPerson + "', " +
		reportedByCompany + ", " +
		category + "," +
		planned + ", " +
		lossOfGeneration + ", '" +
		details + "', " +
		isClosed
		+ ",NULL, '" + name + "', NULL, NULL); Update incident_log set incident_report_number = concat('IRF_', date(now()), '_', lpad(id-11,3,'0')) order by id desc limit 1; commit;", function(error, rows, fields) {
			console.log(error);
			// res.writeHead(200, {'Content-Type': 'text/plain'});
			req.flash('success', 'Record has been inserted');
			res.redirect('/#/incidentsAll');
		});
});

router.post('/updateIncidentLog', function(req, res, next) {
	console.log("POST: ");
	// connection.connect();

	name = req.user.name;
	var log_id = req.body.log_id;
	var selectStartDate = req.body.selectStartDate;
	var selectStartTime = req.body.selectStartTime;
	var startDateTime = '\'' + selectStartDate + ' ' + selectStartTime + '\'';
	var selectEndTime = null;
	if (!req.body.selectEndTime) {
		selectEndTime = "23:59";
	} else {
		selectEndTime = req.body.selectEndTime;
	}
	var endDateTime;
	if (req.body.selectEndDate) {
		endDateTime = '\'' + req.body.selectEndDate + ' ' + selectEndTime + '\'';
	} else {
		endDateTime = 'NULL';
	}
	var reportedByPerson = req.body.reportedByPerson;
	var reportedByCompany = req.body.reportedByCompany;
	var planned = req.body.planned;
	var lossOfGeneration = req.body.lossOfGeneration;
	var category = req.body.category;
	var details = req.body.details;
	var status = req.body.isClosed;

	//   res.send('Update incident_log set start_time = ' + startDateTime + 
	//   ', end_time = ' + endDateTime + 
	//   ', reported_by_person = \'' + reportedByPerson + 
	//   '\', reported_by_company = ' + reportedByCompany +  
	//   ', category = ' + category + 
	//   ', planned = ' + planned + 
	//   ', loss_of_generation = ' + lossOfGeneration + 
	//   ', details = \'' + details + 
	//   '\', status = ' + status + 
	//   ', last_updated_by = \'' + name +
	//   '\', last_updated_dateTime = now() where id = ' + log_id + ';');


	connection.query('Update incident_log set start_time = ' + startDateTime +
		', end_time = ' + endDateTime +
		', reported_by_person = \'' + reportedByPerson +
		'\', reported_by_company = ' + reportedByCompany +
		', category = ' + category +
		', planned = ' + planned +
		', loss_of_generation = ' + lossOfGeneration +
		', details = \'' + details +
		'\', status = ' + status +
		', last_updated_by = \'' + name +
		'\', last_updated_dateTime = now() where id = ' + log_id + ';', function(error, rows, fields) {
			console.log(error);
			// res.writeHead(200, {'Content-Type': 'text/plain'});
			req.flash('success', 'Record has been updated');
			res.redirect('/#/report/incident?incidentId=' + log_id);
		});

});

router.post('/newComment', function(req, res, next) {

	comment = req.body.comment;
	log_id = req.body.log_id;
	name = req.user.name;

	console.log('POST: ' + log_id + ' ' + comment + " " + name);

	connection.query('insert into incident_comment values (null, ' + log_id + ', \'' + comment + '\', now(), \'' + name + '\');', function(error, rows, fields) {
		console.log(error);
		// res.writeHead(200, {'Content-Type': 'text/plain'});
		req.flash('success', 'Comment has been inserted');
		res.redirect('/#/report/incident?incidentId=' + log_id);
	});
});

router.post('/closeLog', function(req, res, next) {
	status = req.body.status;
	console.log('POST: this is closed');
	res.send('POST: this is closed');
});


module.exports = router;
