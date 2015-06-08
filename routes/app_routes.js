var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

// ユーザーの登録を行うPOSTの処理
router.post('/createAccount', function(req, res) {
	console.log('post /app/createAccount');

	var createAccountSql = 'insert into account(firstName, lastName, rubyFirstName, rubyLastName, email, password, birth, type, sex) values(' + connection.escape(req.body.firstName) + ', ' + connection.escape(req.body.lastName) + ', ' + connection.escape(req.body.rubyFirstName) + ', ' + connection.escape(req.body.rubyLastName) + ', ' + connection.escape(req.body.email) + ', ' + connection.escape(req.body.password) + ', ' + connection.escape(req.body.birth) + ', ' + 2 + ', ' + connection.escape(req.body.sex) + ');';
	console.log(createAccountSql);

	connection.query(createAccountSql, function(err, results) {
		console.log('results');
		console.log(results);
		console.log('err');
		console.log(err); 

		var data = {};

		// 作成成功
		if(err === null) {
			console.log('success to create new account');
			req.session.p_id = results.insertId;
			data['result'] = true;
			data['err'] = null;
		}
		else {
			console.log('faild to create new account');
			data['result'] = false;
			data['err'] = err;
		}

		res.sender(data);
	});
});


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

		var data = {};

		// ログイン成功
		if(results != '') {
			console.log('success to login');	
			req.session.p_id = results[0].p_id;
			data['result'] = true;
			data['err'] = null;
			res.sender('fnit');
		}
		// ログイン失敗
		else {
			console.log('faild to login');
			res.render('/login');
			data['result'] = false;
			data['err'] = err;
			res.sender('fnit');
		}
	});
});

module.exports = router;