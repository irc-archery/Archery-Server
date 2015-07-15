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
	var userDataSql = 'select p_id, concat(account.lastName, account.firstName) as playerName, concat(account.rubyLastName, account.rubyFirstName) as rubyPlayerName, email, DATE_FORMAT(account.birth, "%Y/%m/%d") as birth, sex, (select organization.organizationName from organization where organization.o_id = ' + connection.escape(o_id) + ') as organizationName from account where account.p_id = ' + connection.escape(p_id);
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

	var p_id = req.session.p_id;

	// 初めに削除したいユーザーが団体のリーダーではないか確かめる
	// 団体のリーダーの場合は先に団体を削除してもらう

	// ユーザー削除SQL
	var deleteAccountSql = 'delete from account where p_id = ' + p_id;

	// ユーザーの過去の得点表を削除
	var deleteScoreCardSql = 'delete from scoreCard where p_id = ' + p_id;

	// ユーザーの過去の得点合計を削除
	var deleteScoreTotalSql = 'delete from scoreTotal where p_id = ' + p_id;

	// ユーザーの過去の得点を削除
	var	deleteScorePerEndSql = 'delete from scorePerEnd where p_id = ' + p_id;

	// ユーザーデータの削除
	connection.query(deleteAccountSql , function(errAc, results) {
		connection.query(deleteScoreCardSql, function(err, results) {
			connection.query(deleteScoreTotalSql, function(err, results) {
				connection.query(deleteScorePerEndSql, function(err, results) {
					var resData = {};	

					if(!errAc) {
						console.log('success to delete account');

						resData['results'] = true;
						resData['err'] = null;
					}
					else {
						console.log('faild to delete account');

						resData['results'] = false;
						resData['err'] = 'アカウントの削除に失敗しました';
					}

					res.send(resData);
				});
			});
		});
	});
});

// get /personal/record/
router.get('/record', loginCheck, function(req, res) {
	// 過去の得点表一覧画面

	var p_id = req.session.p_id;

	// ユーザーが過去に作成した得点表のidを抽出するためのSQL文
	var scoreCardIdSql = 'select sc_id from scoreCard where p_id = ' + connection.escape(p_id);

	// ユーザーが過去に作成した得点表のidを抽出する
	connection.query(scoreCardIdSql, function(err, scoreCardIdData) {

		if(scoreCardIdData != '') {

			// 得点表一覧データを抽出するためのSQL文
			var personalRecordSql = 'select (' + connection.escape(scoreCardIdData[0].sc_id) + ') as sc_id, `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.perEnd, `match`.arrows, (select scoreTotal.total from scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' limit 1) as sum from `match` where `match`.m_id = (select scoreCard.m_id from scoreCard where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ')';

			for(var i = 1; i < scoreCardIdData.length; i++) {
				 personalRecordSql += 'union all select (' + connection.escape(scoreCardIdData[i].sc_id) + ') as sc_id, `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.perEnd, `match`.arrows, (select scoreTotal.total from scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[i].sc_id) + ' limit 1) as sum from `match` where `match`.m_id = (select scoreCard.m_id from scoreCard where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[i].sc_id) + ')';
			}

			console.log('personalRecordSql');
			console.log(personalRecordSql);

			// 過去の得点表データを抽出する
			connection.query(personalRecordSql, function(err, personalRecordData) {

				console.log('personalRecordData');
				console.log(personalRecordData);

				var resData = {"status": 1, "record": personalRecordData};

				// データの送信
				res.send(resData);
			});
		}
		else {
			// 過去の得点表が存在しない
			res.send({"status": 0});
		}
	});
});

// get /personal/record/:id
router.get('/record/:id', loginCheck, function(req, res) {
	// :idの得点表画面

	var p_id = req.session.p_id;
	var o_id = req.session.o_id;
	var sc_id = req.params.id;

	// 得点表データの抽出に使用するidを抽出するsql文
	var scoreCardIdSql = 'select scoreCard.sc_id, scoreCard.p_id, scoreCard.m_id from `scoreCard` where scoreCard.sc_id = ' + connection.escape(sc_id);

	// idを抽出
	connection.query(scoreCardIdSql, function (err, scoreCardIdData) {

		console.log('scoreCardIdData');
		console.log(scoreCardIdData);

		// データが正常に取得できていたら
		if(scoreCardIdData != '') {

			// reject
			if(scoreCardIdData[0].p_id === p_id) {

				var scoreCardSql = '';

				if(o_id != undefined) {
					// 得点表データの抽出を行うSQL文
					scoreCardSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, organization.organizationName, `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.length, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scoreCard`, `account`, `organization`, `match`, `scoreTotal` where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and organization.o_id = ' + connection.escape(o_id) + ' and `match`.m_id = ' + connection.escape(scoreCardIdData[0].m_id) + ' and scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scoreTotal.p_id = ' + connection.escape(scoreCardIdData[0].p_id)+ ';';
				}
				else {
					scoreCardSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.length, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scoreCard`, `account`, `match`, `scoreTotal` where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and `match`.m_id = ' + connection.escape(scoreCardIdData[0].m_id) + ' and scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scoreTotal.p_id = ' + connection.escape(scoreCardIdData[0].p_id)+ ';';
				}

				console.log('scoreCardSql');
				console.log(scoreCardSql);

				// 得点表の現在のセット数をカウントするためのSQL文
				var countPerEndSql = 'select count(spe_id) as countPerEnd from scorePerEnd where scorePerEnd.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ';';

				// 得点データの抽出を行うSQL文
				var scorePerEndSql = 'select scorePerEnd.score_1, scorePerEnd.score_2, scorePerEnd.score_3, scorePerEnd.score_4, scorePerEnd.score_5, scorePerEnd.score_6, scorePerEnd.updatedScore_1, scorePerEnd.updatedScore_2, scorePerEnd.updatedScore_3, scorePerEnd.updatedScore_4, scorePerEnd.updatedScore_5, scorePerEnd.updatedScore_6, scorePerEnd.subTotal, scorePerEnd.perEnd from `scorePerEnd` where scorePerEnd.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' order by scorePerEnd.perEnd asc;';

				// 得点表データの抽出
				connection.query(scoreCardSql, function (err, scoreCardData) {
					// セット数の抽出
					connection.query(countPerEndSql, function(err, countPerEndData){
						// 得点データの抽出
						connection.query(scorePerEndSql, function (err, scorePerEndData) {

							console.log('scoreCardData');
							console.log(scoreCardData);

							console.log('countPerEndData');
							console.log(countPerEndData);

							console.log('scorePerEndData');
							console.log(scorePerEndData);

							// ２つのSQL文の結果を結合
							scoreCardData[0]['score'] = scorePerEndData;

							scoreCardData[0]['countPerEnd'] = countPerEndData[0].countPerEnd;

							// Emit log
							console.log('emit : extractScoreCard');
							console.log(scoreCardData[0]);

							// 得点表データのEmit
							res.send(scoreCardData[0]);
						});
					});
				});
			}
			else {
				// res.redirect('/personal/record');
				console.log('不正なアクセスです');
			}
		}
		else {
			console.log('不正なsc_idです');
		}
	});
});

router.delete('/record/:id', loginCheck, function(req, res) {
	// :idの得点表削除API

	var sc_id = req.params.id;

	var p_id = req.session.p_id;

	// 初めに得点表の持ち主とsessionで参照できるユーザが一致するかcheck
	var checkPermissionSql = 'select p_id from scoreCard where sc_id = ' + connection.escape(sc_id);

	connection.query(checkPermissionSql, function(err, checkPermissionResults) {
		if(!err) {

			// permission is ok
			if(checkPermissionResults[0].p_id === p_id) {

				// 得点表削除SQL
				var deleteScoreCardSql = 'delete from scoreCard where sc_id = ' + connection.escape(sc_id);

				var deleteScoreTotalSql = 'delete from scoreTotal where sc_id = ' + connection.escape(sc_id);

				var deleteScorePerEndSql = 'delete from scorePerEnd where sc_id = ' + connection.escape(sc_id);

				connection.query(deleteScoreCardSql, function(err, deleteScoreCardResults) {
					connection.query(deleteScoreTotalSql, function(err, deleteScoreTotalResults) {
						connection.query(deleteScorePerEndSql, function(err, deleteScorePerEndResults) {

							res.send({'results': true, 'err': null});
						});
					});
				});
			}
		}
	});
});

module.exports = router;
