var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

// ホーム
router.get('/', function(req, res) {
	res.redirect('/login');
});

// ログイン画面
router.get('/login', function(req, res) {
    res.render('login');
});

// ユーザー作成画面
router.get('/createAccount', function(req, res) {
	res.render('createAccount');
})

// 試合一覧画面
router.get('/matchIndex', function(req, res) {
	res.render('matchIndex');
});

// 得点表一覧
router.get('/scoreCardIndex', function(req, res) {
	res.render('scoreCardIndex');
});

// 得点表画面
router.get('/scoreCard', function(req, res) {
	res.render('scoreCard');
});

// for debug
router.get('/socket', function(req, res) {
	console.log(req.session);
	res.render('socket');
})

// browser用のログイン処理
router.post('/login', function(req, res) {
	console.log('post /login');
	console.log(req.body);

	var loginSql = 'select * from account where email = ' + connection.escape(req.body.email) + ' and password = ' + connection.escape(req.body.password) + ';';
	console.log('loginSql');
	console.log(loginSql);

	connection.query(loginSql, function(err, results) {
		console.log('results of loginSql');
		console.log(results);

		// ログイン成功
		if(results != '') {
			console.log('success to login');	
			req.session.p_id = results[0].p_id;
			res.redirect('/matchIndex');
		}
		// ログイン失敗
		else {
			console.log('faild to login');
			res.render('/login');
		}
	});
});

// ユーザーの登録を行うPOSTの処理
router.post('/createAccount', function(req, res) {
	console.log('post /createAccount');

	var createAccountSql = 'insert into account(firstName, lastName, rubyFirstName, rubyLastName, email, password, birth, type, sex) values(' + connection.escape(req.body.firstName) + ', ' + connection.escape(req.body.lastName) + ', ' + connection.escape(req.body.rubyFirstName) + ', ' + connection.escape(req.body.rubyLastName) + ', ' + connection.escape(req.body.email) + ', ' + connection.escape(req.body.password) + ', ' + connection.escape(req.body.birth) + ', ' + 2 + ', ' + connection.escape(req.body.sex) + ');';
	console.log(createAccountSql);

	connection.query(createAccountSql, function(err, results) {
		console.log('results');
		console.log(results);
		console.log('err');
		console.log(err); 

		// 作成成功
		if(err === null) {
			console.log('success to create new account');
			req.session.p_id = results.insertId;
			res.redirect('/matchIndex');
		}
		else {
			console.log('faild to create new account');
			res.redirect('/createAccount');
		}
	});
});

router.get('/logout', function(req, res) {
	//req.session.destroy();
	console.log('deleted session');
	res.redirect('/');
});

module.exports = router;