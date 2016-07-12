var express = require('express');
var router = express.Router();

// Members Page
router.get('/', ensureAuthenticated, function (req, res, next) {
	if (req.user.username == 'db') {
		res.render('eveleyDb', { title: 'Metro' });
	} else {
		res.render('index', { title: 'Metro' });
	}
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;
