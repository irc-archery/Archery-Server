var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

// ログイン処理を行うlogin.html
router.get('/login', function(req, res) {
    res.render('login');
});

// browser用のログイン処理
router.post('/login', function(req, res) {
	
});

// ユーザーの登録を行うPOSTの処理
router.post('/add', function(req, res) {
	
});

router.get('/logout', function(req, res) {
	req.session.destroy();
	console.log('deleted session');
	res.redirect('/');
});


module.exports = router;
