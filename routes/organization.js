var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

var loginCheck = function(req, res, next) {

	console.log('bellow is req.session.p_id');

	console.log(req.session.p_id);

	if(req.session.p_id) {
		console.log('success loginCheck with sessionID');

		var checkSession = 'select * from account where p_id = ' + connection.escape(req.session.p_id);

		connection.query(checkSession, function(err, results) {

			console.log('results');
			console.log(Object.keys(results).length);

			console.log('err');
			console.log(err);

			if(Object.keys(results).length !== 0) {
				// アカウントは存在する

				if(req.session.o_id) {
					var checkOrganization = 'select * from organization where o_id = ' + connection.escape(req.session.o_id);

					connection.query(checkOrganization, function(err2, results2) {
						if(Object.keys(results2).length === 0) {
							// 団体に所属していない
							req.session.o_id = undefined;
						}
					});
				}

				next();
			}
			else {
				// アカウントは存在しない
				faild();
			}
		});

	}
	else {
		faild();
	}

	function faild() {
		console.log('faild loginCheck with sessionID. redirect login form');
		req.session.p_id = undefined;
		req.session.o_id = undefined;
		res.redirect('/login');
	}
};

// get /organization/ 
router.get('/', loginCheck, function(req, res) {
	// 団体画面の出力
	var o_id = req.session.o_id;

	if(o_id != undefined) {
		res.render('organization');
	}
	else{
		res.render('notBelong');
	}
});

// get /organization/create
router.get('/create', loginCheck, function(req, res) {
	res.render('createOrganization');
});

// post /organization/
router.post('/', loginCheck, function(req, res) {
	// 団体作成
	console.log('req.body');
	console.log(req.body);

	var p_id = req.session.p_id;

	// 団体を作成するためのSQL文
	var insertOrganizationSql = 'insert into `organization`(p_id, organizationName, establish, place, email) values(' + connection.escape(p_id) + ', ' + connection.escape(req.body.organizationName) + ', now(), ' + connection.escape(req.body.place) + ', ' + connection.escape(req.body.email) + ')';

	// 団体を作成
	connection.query(insertOrganizationSql, function(err, insertOrganizationResults) {
		console.log('insertOrganizationResults');
		console.log(insertOrganizationResults);

		// 作成したユーザーを団体に所属させるためのSQL文
		var joinOrganizationSql = 'update account set o_id = ' + insertOrganizationResults.insertId + ' where p_id = ' + p_id;

		console.log('joinOrganizationSql');
		console.log(joinOrganizationSql);

		// 作成したユーザーを団体に所属させる
		connection.query(joinOrganizationSql, function(err, joinOrganizationResults) {

			console.log('joinOrganizationResults');
			console.log(joinOrganizationResults);

			var responseData = {};

			if(!err){
				// 作成成功
				req.session.o_id = insertOrganizationResults.insertId;

				responseData = {'results': true};

			}
			else {
				// 作成失敗
				responseData = {'results': false};
			}

			res.render('afterCreateOrganization', responseData);
		});
	});
});

// delete /organization/:id
router.delete('/:id', loginCheck, function(req, res) {
	// :idの団体の削除

	console.log(':id');
	console.log(req.params.id);
});

// get /organization/members
router.get('/members', loginCheck, function(req, res) {
	// メンバー管理画面

	var o_id = req.session.o_id;

	// ユーザーが団体に所属している
	if (o_id !== undefined) {
		res.render('memberAdmin');
	}

	// ユーザーが団体に所属していない
	else {
		// 団体作成画面のリンクがあるページ
		res.redirect('/organization');
	}
});

router.get('/members/addMembers')

router.post('/members', loginCheck, function(req, res) {
	// メンバー追加API
});

router.delete('/members/:id', loginCheck, function(req, res) {
	// :idのメンバーを団体から脱退させる
});

module.exports = router;