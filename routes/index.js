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
	console.log('post /login');
	console.log(req.body);
});

// ユーザーの登録を行うフォームをsend
router.get('/createAccount', function(req, res) {
	res.render('createAccount.ejs');
})

// ユーザーの登録を行うPOSTの処理
router.post('/createAccount', function(req, res) {
	console.log('post /createAccount');
	console.log(req.body);
});

router.get('/logout', function(req, res) {
	//req.session.destroy();
	console.log('deleted session');
	res.redirect('/');
});

module.exports = router;
