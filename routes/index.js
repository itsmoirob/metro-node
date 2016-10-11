var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({ // use multer diskStorage so that can change filename
	destination: function (req, file, cb) {
		cb(null, './files');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});
var upload = multer({ storage: storage });

// make sure all pages are authenticated
router.get('/', ensureAuthenticated, function (req, res, next) {
	if (req.user.username == 'db') {
		res.render('eveleyDb', { title: 'Metro' });
	} else {
		res.render('index', { title: 'Metro' });
	}
});

router.get('/upload', ensureAuthenticated, function (req, res, next) {
	res.render('upload', {
		'title': 'Upload'
	});
});

// api post upload of file
router.post('/upload', upload.array('csvFile', 16), function (req, res, next) {
	var filesNames = [];
	
	for (var i = 0; i < req.files.length; i++) {
		filesNames.push(req.files[i].filename);
	}
	console.log(filesNames);
	req.flash('success', 'The file(s) ' + filesNames.join(', ') + ' were uploaded.'); //dispaly a message confirming upload
	res.redirect('/upload');
});

// function for authentication
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;
