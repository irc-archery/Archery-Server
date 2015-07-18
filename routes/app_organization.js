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
	}
};

// get /organization/
router.get('/', loginCheck, function(req, res) {
	// 団体画面の出力
	// o_id抽出
	var extractOrganizationIdSql = 'select o_id from account where p_id = ' + p_id;

	connection.query(extractOrganizationIdSql, function(err, extractOrganizationIdResults) {
		var o_id;

		if(extractOrganizationIdResults != undefined) {
			o_id = extractOrganizationIdResults[0].o_id;
		}

		if(o_id != undefined) {
			// 責任者idを抽出するためのSQL文
			var organizationAdminIdSql = 'select p_id from organization where o_id = ' + connection.escape(o_id);

			// 責任者idを抽出
			connection.query(organizationAdminIdSql, function(err, organizationAdminIdResults) {

				// 団体データを抽出
				var organizationDataSql = 'select organizationName, DATE_FORMAT(establish, "%Y/%m/%d") as establish, (select count(*) from account where o_id = ' + connection.escape(o_id) + ') as members, (select concat(account.lastName, account.firstName) as admin from account where account.p_id = ' + organizationAdminIdResults[0].p_id + ') as admin, place, email from organization where organization.o_id = ' + connection.escape(o_id);

				connection.query(organizationDataSql, function(err, organizationDataResults) {

					var extractMembersSql = 'select account.p_id, concat(account.lastName, account.firstName) as playerName, DATE_FORMAT(account.birth, "%Y/%m/%d") as birth, account.email from account where account.o_id = ' + connection.escape(o_id);

					console.log('extractMembersSql');
					console.log(extractMembersSql);

					connection.query(extractMembersSql, function(err, extractMembersResults) {

						console.log('extractMembersResults');
						console.log(extractMembersResults);

						organizationDataResults[0]['status'] = 1;

						organizationDataResults[0]['memberList'] = extractMembersResults;

						console.log('organizationDataResults[0]');
						console.log(organizationDataResults[0]);

						res.send(organizationDataResults[0]);
					});
				});
			});
		}
		else{
			// アプリ側のo_idに所属していない時の処理
			res.send({"status": 0});
		}
	}
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

	var o_id = req.params.id;

	// sessionを参照し、このp_idのユーザーがこの団体を削除する権限があるかどうか調べる
	// 現段階ではorganizationの設立者のみが削除できるようにSQL文を書く
	var permissionCheckSql = 'select p_id from organization where o_id = ' + connection.escape(o_id);

	var resData = {'results': false, 'err': null};

	// 削除したい団体の設立者を抽出
	connection.query(permissionCheckSql, function(err, permissionCheckResults) {

		if(!err) {
			// 団体の設立者のみが削除可能
			if(permissionCheckResults[0].p_id === req.session.p_id) {

				// 団体削除SQL
				var deleteOrganizationSql = 'delete from organization where o_id = ' + connection.escape(o_id);

				// 団体に所属しているユーザーのo_idを更新
				var updateOrganizationSql = 'update account set account.o_id = NULL where account.o_id = ' + connection.escape(o_id);

				// 団体削除
				connection.query(deleteOrganizationSql, function(err, deleteOrganizationResults) {
					if(!err) {
						//団体削除完了. So 団体に所属していたユーザーのo_idを更新	
						connection.query(updateOrganizationSql, function(err, updateOrganizationResults) {

							if(!err) {
								req.session.o_id = undefined;

								console.log('団体の削除が完了しました');
								resData['results'] = true;
								res.send(resData);
							}	
							else {
								console.log('ユーザーの団体情報更新に失敗しました');
								resData['err'] = 'ユーザーの団体情報更新に失敗しました';
								res.send(resData);
							}
						});
					}
					else {
						console.log('団体の削除に失敗しました');
						resData['err'] = '団体の削除に失敗しました';
						res.send(resData);
					}
				});
			}
			else {
				console.log('団体削除の権限がありません');
				resData['err'] = '団体削除の権限がありません';
				res.send(resData);
			}
		}
		else {
			console.log('不正な団体IDです');
			resData['err'] = '不正な団体IDです';
			res.send(resData);
		}
	});
});

// get /organization/members
router.get('/members', loginCheck, function(req, res) {

	// メンバー管理画面

	// o_id抽出
	var extractOrganizationIdSql = 'select o_id from account where p_id = ' + p_id;

	connection.query(extractOrganizationIdSql, function(err, extractOrganizationIdResults) {
		var o_id;

		if(extractOrganizationIdResults != undefined) {
			o_id = extractOrganizationIdResults[0].o_id;
		}

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

		 			res.send(extractOrganizationData[0]);
				});
			});
		}
		// ユーザーが団体に所属していない
		else {
			res.send(null);
		}
	}
});

router.post('/members', loginCheck, function(req, res) {
	// メンバー追加API

	console.log('req.body');
	console.log(req.body);

	// 1. ログイン処理 
	var loginSql = 'select * from account where email = ' + connection.escape(req.body.email) + ' and password = ' + connection.escape(req.body.password) + ';';

	connection.query(loginSql, function(err, results) {
		console.log('results of loginSql');
		console.log(results);

		// ログイン成功
		if(Object.keys(results).length !== 0) {
			console.log('success to login');	

			// 団体に参加したいユーザーのp_id
			var addP_id = results[0].p_id;

			// 団体メンバーのp_id
			var memberP_id = req.session.p_id;

			// extract o_id
			var extractO_idSql = 'select o_id from account where p_id = ' + memberP_id;

			connection.query(extractO_idSql, function(err, extractO_idResults) {

				var o_id = extractO_idResults[0].o_id;

				var updateO_idSql = 'update account set o_id = ' + connection.escape(o_id) + ' where p_id = ' + connection.escape(addP_id);

				connection.query(updateO_idSql, function(err, updateO_idResults) {

					var resData = {};

					if(!err) {
						resData['results'] = true;
						resData['err'] = null;
					}
					else {
						resData['results'] = false;
						resData['err'] = 'メンバーの追加に失敗しました。';
					}

					console.log('send response about add member');
					console.log(resData);

					res.send(resData);
				});
			});
		}
		// ログイン失敗
		else {
			console.log('faild to login');

			console.log('send response about add member');
			console.log(resData);

			res.send({'results': false, 'err': 'ログインに失敗しました'});
		}
	});
});

router.delete('/members/:id', loginCheck, function(req, res) {
	// :idのメンバーを団体から脱退させる

	var p_id = req.params.id;
	var o_id = req.session.o_id;

	// sessionで参照できるo_idの団体に所属しているp_idのユーザーを、団体から脱退させ

	// TODO: 権限があるユーザーのみの削除を受け付ける

	var updateAccountSql = 'update account set o_id = NULL where p_id = ' + connection.escape(p_id) + ' and o_id = ' + connection.escape(o_id); 

	connection.query(updateAccountSql, function(err, updateAccountResults) {
		if(!err) {
			res.send({'results': true, 'err': null});
		}
		else{
			res.send({'results': false, 'err': '要求された動作の実行に失敗しました'});
		}
	});
});

module.exports = router;
