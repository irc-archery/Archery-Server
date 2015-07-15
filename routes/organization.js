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
};

// get /organization/ 
router.get('/', loginCheck, function(req, res) {
	// 団体画面の出力
	var o_id = req.session.o_id;

	if(o_id != undefined) {
		// 責任者idを抽出するためのSQL文
		var organizationAdminIdSql = 'select p_id from organization where o_id = ' + connection.escape(o_id);

		// 責任者idを抽出
		connection.query(organizationAdminIdSql, function(err, organizationAdminIdResults) {

			// 団体データを抽出
			var organizationDataSql = 'select organizationName, DATE_FORMAT(establish, "%Y/%m/%d") as establish, (select count(*) from account where o_id = ' + connection.escape(o_id) + ') as members, (select concat(account.lastName, account.firstName) as admin from account where account.p_id = ' + organizationAdminIdResults[0].p_id + ') as admin, place, email from organization where organization.o_id = ' + connection.escape(o_id);

			connection.query(organizationDataSql, function(err, organizationDataResults) {
				
				organizationDataResults[0]['status'] = 1;

				console.log('organizationDataResults[0]');
				console.log(organizationDataResults[0]);

				res.send(organizationDataResults[0]);
			});
		});
	}
	else{
		res.send('you are not belong to organization. place join or <a href="/organization/create">create</a>.');
	};
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
				responseData['results'] = true;
				responseData['err'] = null;

				req.session.o_id = insertOrganizationResults.insertId;
			}
			else {
				responseData['results'] = false;	
				responseData['err'] = err;
			}

			res.send(responseData);
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
		var extractOrganizationSql = 'select organization.organizationName, (select count(*) from account where account.o_id = ' + connection.escape(o_id) + ') as members from organization where organization.o_id = ' + connection.escape(o_id);

		console.log('extractOrganizationSql');
		console.log(extractOrganizationSql);

		connection.query(extractOrganizationSql, function(err, extractOrganizationData) {

			console.log('extractOrganizationData');
			console.log(extractOrganizationData);

			var extractMembersSql = 'select account.p_id, concat(account.lastName, account.firstName) as playerName, DATE_FORMAT(account.birth, "%Y/%m/%d") as birth, account.email from account where account.o_id = ' + connection.escape(o_id);

			console.log('extractMembersSql');
			console.log(extractMembersSql);

			connection.query(extractMembersSql, function(err, extractMembersResults) {

				console.log('extractMembersResults');
				console.log(extractMembersResults);

				extractOrganizationData[0]['memberList'] = extractMembersResults;

				var membersHtml = '<br><form action="/app/organization/members" method="post"> <label>email :<input type="email" name="email"></label><label>password: <input type="password" name="password"></label><input type="submit" ></form>';

	 			res.send(membersHtml + JSON.stringify( extractOrganizationData[0] ));
			});
		});
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