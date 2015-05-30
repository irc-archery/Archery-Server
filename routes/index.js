var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/socket', function(req, res) {
	res.render('socket');
})

// ログイン処理を行うlogin.html
router.get('/login', function(req, res) {
    res.render('login');
});

// browser用のログイン処理
router.post('/login', function(req, res) {
	console.log('post /login');
	console.log(req.body);

	var loginSql = 'select * from account(email, password) where email = ' + connection.escape(req.body.email) + ' and passowrd = ' + connection.escape(req.body.password) + ';';

	connection.query(loginSql, function(err, results) {
		// ログイン成功
		if(results != '') {

		}
		// ログイン失敗
		else {

		}
	});
});

// ユーザーの登録を行うフォームをsend
router.get('/createAccount', function(req, res) {
	res.render('createAccount.ejs');
})

// ユーザーの登録を行うPOSTの処理
router.post('/createAccount', function(req, res) {
	console.log('post /createAccount');

	var createAccountSql = 'insert into account(firstName, lastName, rubyFirstName, rubyLastName, email, password, birth, type, sex) values(' + connection.escape(req.body.firstName) + ', ' + connection.escape(req.body.lastName) + ', ' + connection.escape(req.body.rubyFirstName) + ', ' + connection.escape(req.body.rubyLastName) + ', ' + connection.escape(req.body.email) + ', ' + connection.escape(req.body.password) + ', ' + connection.escape(req.body.birth) + ', ' + 2 + ', ' + connection.escape(req.body.sex) + ');';
	console.log(createAccountSql);

	connection.query(createAccountSql, function(err, results) {
		console.log('results');
		console.log(results);
	});
});

router.get('/logout', function(req, res) {
	//req.session.destroy();
	console.log('deleted session');
	res.redirect('/');
});

module.exports = router;