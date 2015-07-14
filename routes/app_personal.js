var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

var loginCheck = function(req, res, next) {

	console.log('bellow is req.session.p_id');
	console.log(req.session.p_id);

	console.log('req.headers');
	console.log(req.headers);

	if(req.session.p_id) {
		console.log('success loginCheck with sessionID');
		next();
	}
	else {
		console.log('faild loginCheck with sessionID. redirect login form');
		res.redirect('/login');
	}
};

// get /personal/
router.get('/', loginCheck, function(req, res) {
	// マイページ画面に必要な情報を提供するAPI

	// sessionよりidを抽出
	var p_id = req.session.p_id;
	var o_id = req.session.o_id;

	console.log('p_id');
	console.log(p_id);
	console.log('o_id');
	console.log(o_id);

	// ユーザー情報を抽出するためのSQL文
	var userDataSql = 'select concat(account.lastName, account.firstName) as playerName, concat(account.rubyLastName, account.rubyFirstName) as rubyPlayerName, email, DATE_FORMAT(account.birth, "%Y/%m/%d") as birth, sex, (select organization.organizationName from organization where organization.o_id = ' + connection.escape(o_id) + ') as organizationName from account where account.p_id = ' + connection.escape(p_id);
	var userRecordSql = 'select sc_id, scoreTotal.total as sum from scoreTotal where p_id = ' + connection.escape(p_id) + ' limit 5';

	// ユーザーの基本情報を追加
	connection.query(userDataSql, function(err, userDataResults){
		// ユーザーの過去の成績を抽出
		connection.query(userRecordSql, function(err, userRecordResults){

			if(userRecordResults != ''){
				var userRecordMatchSql = 'select `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.arrows, `match`.perEnd from `match` where `match`.m_id = (select scoreCard.m_id from scoreCard where scoreCard.sc_id = ' + userRecordResults[0].sc_id + ')';

				for(var i = 1; i < userRecordResults.length; i++) {
					userRecordMatchSql += ' union all select `match`.matchName, `match`.created, `match`.arrows, `match`.perEnd from `match` where `match`.m_id = (select scoreCard.m_id from scoreCard where scoreCard.sc_id = ' + userRecordResults[i].sc_id + ')';
				}

				console.log('userRecordMatchSql');
				console.log(userRecordMatchSql);

				connection.query(userRecordMatchSql, function(err, userRecordMatchResults) {

					console.log('userRecordMatchResults');
					console.log(userRecordMatchResults);

					console.log('userRecordResults');
					console.log(userRecordResults);

					userDataResults[0]['record'] = userRecordMatchResults;

					for(var i = 0; i < userRecordMatchResults.length; i++) {
						userDataResults[0]['record'][i]['sum'] = userRecordResults[i]['sum'];
					}
					console.log('response of GET /personal/')
					console.log(userDataResults[0]);

					res.send(userDataResults[0]);
				});
			}
			else {
				userDataResults[0]['record'] = [];

				console.log('response of GET /personal/')
				console.log(userDataResults[0]);

				res.send(userDataResults[0]);
			}
		});
	});
});

// delete /personal/
router.delete('/', loginCheck, function(req, res) {
	// sessionで参照できるアカウントを削除

	res.send('delete /personal/');
});

// get /personal/record/
router.get('/record', loginCheck, function(req, res) {
	// 過去の得点表一覧画面

	res.send('get /personal/record/');
});

// get /personal/record/:id
router.get('/record/:id', loginCheck, function(req, res) {
	// :idの得点表画面

	res.send('get /record/' + req.params.id);
});


router.delete('/record/:id', loginCheck, function(req, res) {
	// :idの得点表削除API
	res.send('delete /record/' + req.params.id);
});

module.exports = router;
