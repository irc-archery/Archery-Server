var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

var loginCheck = function(req, res, next) {

	console.log('bellow is req.session.p_id');
	console.log(req.session.p_id);
	if(req.session.p_id) {
		console.log('success loginCheck with sessionID');
		next();
	}
	else {
		console.log('faild loginCheck with sessionID. redirect login form');
		res.redirect('/login');
	}
}

// ホーム
router.get('/', loginCheck, function(req, res) {
	res.redirect('/login');
});

// ログイン画面
router.get('/login', function(req, res, next) {
	console.log('bellow is req.session.p_id');
	console.log(req.session.p_id);
	// すでにログイン済み
	if(req.session.p_id) {
		console.log('already logged in ')
		res.redirect('/matchIndex');
	}
	else {
	    res.render('login');
	}	
});

// ユーザー作成画面
router.get('/createAccount', function(req, res) {
	res.render('createAccount');
})

// 試合一覧画面
router.get('/matchIndex', loginCheck, function(req, res, next) {
	res.render('matchIndex');
});

router.get('/insertMatch', loginCheck, function(req, res, next) {
	res.render('insertMatch');
});

// 得点表一覧
router.get('/scoreCardIndex', loginCheck, function(req, res) {
	console.log('req.query')
	console.log(req.query);
	res.render('scoreCardIndex', req.query);
});

// 得点表作成画面
router.get('/insertScoreCard', loginCheck, function(req, res) {
	res.render('insertScoreCard')
})

// 得点表画面
router.get('/scoreCard', loginCheck, function(req, res) {
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
		if(Object.keys(results).length !== 0) {
			console.log('success to login');	
			req.session.p_id = results[0].p_id;
			req.session.o_id = results[0].o_id;
			res.redirect('/matchIndex');
		}
		// ログイン失敗
		else {
			console.log('faild to login');
			res.redirect('/login');
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
	req.session.destroy();
	console.log('deleted session');
	res.redirect('/');
});

module.exports = router;