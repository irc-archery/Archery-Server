var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();
var crypto = require('../models/crypto.js');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	}	
});

// ユーザーの登録を行うPOSTの処理
router.post('/createAccount', function(req, res) {
	console.log('post /app/createAccount');
	console.log(req.body);

	var createAccountSql = 'insert into account(firstName, lastName, rubyFirstName, rubyLastName, email, password, birth, type, sex) values(' + connection.escape(req.body.firstName) + ', ' + connection.escape(req.body.lastName) + ', ' + connection.escape(req.body.rubyFirstName) + ', ' + connection.escape(req.body.rubyLastName) + ', ' + connection.escape(req.body.email) + ', ' + connection.escape(crypto.encryption(req.body.password)) + ', ' + connection.escape(req.body.birth) + ', ' + 2 + ', ' + connection.escape(req.body.sex) + ');';
	console.log(createAccountSql);

	connection.query(createAccountSql, function(err, results) {

		var data = {};

		// 作成成功
		if(err === null) {
			console.log('success to create new account');
			req.session.p_id = results.insertId;
			data['results'] = true;
			data['err'] = null;

			// 送信メッセージ
			var mess = '';

			mess += 'Archery realtime game systemにご登録いただきありがとうございます。<br><br>';

			mess += 'ご登録いただいたアカウント情報は以下のとおりです。<br>';
			mess += 'ログイン名 : ' + req.body.email + '<br>';
			mess += 'パスワード : ' + req.body.password + '<br><br>';

			var hostMail = process.env.EMAIL;

			console.log(typeof hostMail)

			mess += 'ご不明な点がありましたらこのメールに返信してご連絡ください。';

			var mailOptions = {
				from: process.env.EMAIL,
				to: req.body.email,
				subject: 'Archery realtime game system アカウント登録',
				html: mess
			};

			// メール送信 
			transporter.sendMail(mailOptions, function(error, info) {
				if(error) {
					return console.log(error);
				}
				console.log('message send : ' + info.response);
			});

		}
		else {
			console.log('faild to create new account');
			data['results'] = false;
			data['err'] = '入力されたメールアドレスがすでに登録されているなどの原因で、新規作成できませんでした。';
		}

		res.send(data);
	});
});

// app用のログイン処理
router.post('/login', function(req, res) {
	console.log('post /app/login');
	console.log(req.body);

	var loginSql = 'select * from account where email = ' + connection.escape(req.body.email);
	console.log('loginSql');
	console.log(loginSql);

	connection.query(loginSql, function(err, results) {
		console.log('results of loginSql');
		console.log(results);

		var data = {};

		// ログイン成功
		if(Object.keys(results).length !== 0) {

			if(crypto.decryption(results[0].password) === req.body.password) {

				console.log('success to login');

				req.session.p_id = results[0].p_id;
				req.session.o_id = results[0].o_id;

				data['results'] = true;
				data['err'] = null;
			}
			else {
				console.log('faild to login');
				data['results'] = false;
				data['err'] = 'ログイン名が存在しないか、パスワードが間違っているためログインできませんでした。';
			}
		}
		// ログイン失敗
		else {
			console.log('faild to login');
			data['results'] = false;
			data['err'] = 'ログイン名が存在しないか、パスワードが間違っているためログインできませんでした。';
		}

		res.send(data);
	});
});

module.exports = router;
