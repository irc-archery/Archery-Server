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
		res.send({'results': false, 'err': 'ログインに失敗しました.'});
	}
};

// get /personal/
router.get('/', loginCheck, function(req, res) {
	// マイページ画面に必要な情報を提供するAPI

	// sessionよりidを抽出
	var p_id = req.session.p_id;

	console.log('p_id');
	console.log(p_id);

	// o_id抽出
	var extractOrganizationIdSql = 'select o_id from account where p_id = ' + p_id;

	connection.query(extractOrganizationIdSql, function(err, extractOrganizationIdResults) {
		var o_id;

		if(extractOrganizationIdResults != undefined) {
			o_id = extractOrganizationIdResults[0].o_id;
		}

		// ユーザー情報を抽出するためのSQL文
		var userDataSql = 'select p_id, concat(account.lastName, account.firstName) as playerName, concat(account.rubyLastName, account.rubyFirstName) as rubyPlayerName, email, DATE_FORMAT(account.birth, "%Y/%m/%d") as birth, sex, (select organization.organizationName from organization where organization.o_id = ' + connection.escape(o_id) + ') as organizationName from account where account.p_id = ' + connection.escape(p_id);
		var userRecordSql = 'select sc_id, scoreTotal.total as sum from scoreTotal where p_id = ' + connection.escape(p_id) + ' limit 5';

		console.log('userRecordSql');
		console.log(userRecordSql);

		// ユーザーの基本情報を追加
		connection.query(userDataSql, function(err, userDataResults){
			// ユーザーの過去の成績を抽出
			connection.query(userRecordSql, function(err, userRecordResults){

				if(userRecordResults != ''){
					var userRecordMatchSql = 'select `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.arrows, `match`.perEnd from `match` where `match`.m_id = (select scoreCard.m_id from scoreCard where scoreCard.sc_id = ' + userRecordResults[0].sc_id + ')';

					for(var i = 1; i < userRecordResults.length; i++) {
						userRecordMatchSql += ' union all select `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.arrows, `match`.perEnd from `match` where `match`.m_id = (select scoreCard.m_id from scoreCard where scoreCard.sc_id = ' + userRecordResults[i].sc_id + ')';
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
					console.log('userDataResults');
					console.log(userDataResults);

					userDataResults[0]['record'] = [];

					console.log('response of GET /personal/');
					console.log(userDataResults[0]);

					res.send(userDataResults[0]);
				}
			});
		});
	});
});

// delete /personal/
router.delete('/', loginCheck, function(req, res) {
	// sessionで参照できるアカウントを削除

	var p_id = req.session.p_id;

	// 初めに削除したいユーザーが団体のリーダーではないか確かめる
	// 団体のリーダーの場合は先に団体を削除してもらう

	// このユーザーが団体のリーダーではないか確認する
	var checkOrganizationLeaderSql = 'select * from organization where p_id = ' + p_id;

	console.log(checkOrganizationLeaderSql);

	connection.query(checkOrganizationLeaderSql, function(errCOL, checkOrganizationLeaderResults) {
		if(!errCOL) {
			console.log('checkOrganizationLeaderResults')
			console.log(checkOrganizationLeaderResults)
			console.log('Object.keys(checkOrganizationLeaderResults).length !== 0')
			console.log(Object.keys(checkOrganizationLeaderResults).length)

			if(Object.keys(checkOrganizationLeaderResults).length === 0) {
				// 団体のリーダーではない

				// 1. ユーザーが作成した試合を抽出
				// 2. 試合とその試合に属している得点表を削除
				// 2.5 試合を削除する
				// 3. そのユーザーが作成した得点表を削除
				// 4. ユーザー削除する

				// ユーザーが作成した試合とその試合に属している得点表を削除する

				// 1. ユーザーが作成したm_idを抽出

				var extractMatchIdSql = 'select m_id from `match` where p_id = ' + p_id;

				console.log('extractMatchIdSql');
				console.log(extractMatchIdSql);

				connection.query(extractMatchIdSql, function(err, extractMatchIdResults) {

					console.log('extractMatchIdResults');
					console.log(extractMatchIdResults);


					if(Object.keys(extractMatchIdResults).length !== 0) {
						// ユーザーが作成した試合が存在する

						// 2. 試合に関連付けられたデータを削除

						// 試合に所属している scorePerEnd, scoreTotalを削除するためにsc_idを抽出するSQL文
						var extractScoreCardIdSql = 'select sc_id from `scoreCard` where m_id = ' + extractMatchIdResults[0].m_id;

						for(var i = 1; i < extractMatchIdResults.length; i++) {
							extractScoreCardIdSql += ' or m_id = ' + extractMatchIdResults[i].m_id;
						}

						console.log('extractScoreCardIdSql');
						console.log(extractScoreCardIdSql);

						// sc_idを抽出
						connection.query(extractScoreCardIdSql, function(err, extractScoreCardIdResults) {

							console.log('extractScoreCardIdResults');
							console.log(extractScoreCardIdResults);

							if(extractScoreCardIdResults != undefined) {
								// ユーザーが作成した試合に関連付けられた得点表が存在する

								// 得点、得点合計、得点表を削除するためのSQL文
								var deleteScoreCardSql = 'delete from scoreCard where sc_id = ' + extractScoreCardIdResults[0].sc_id;
								var deleteScorePerEndSql = 'delete from scorePerEnd where sc_id = ' + extractScoreCardIdResults[0].sc_id;
								var deleteScoreTotalSql = 'delete from scoreTotal where sc_id = ' + extractScoreCardIdResults[0].sc_id;

								// sc_idを追加する
								for(var i = 0; i < extractScoreCardIdResults.length; i++ ){

									// scoreCard, scorePerEnd, scoreTotalを削除するためsc_idを追加
									deleteScoreCardSql += ' or sc_id = ' + extractScoreCardIdResults[i].sc_id;
									deleteScorePerEndSql += ' or sc_id = ' + extractScoreCardIdResults[i].sc_id;
									deleteScoreTotalSql += ' or sc_id = ' + extractScoreCardIdResults[i].sc_id;
								}

								console.log('deleteScoreCardSql');
								console.log(deleteScoreCardSql);

								console.log('deleteScorePerEndSql');
								console.log(deleteScorePerEndSql);

								console.log('deleteScoreTotalSql');
								console.log(deleteScoreTotalSql);

								// 得点表合計の削除
								connection.query(deleteScoreTotalSql, function(err, deleteScoreTotalResults){
									// 得点表得点の削除
									connection.query(deleteScorePerEndSql, function(err, deleteScorePerEndResults) {
										// 得点表の削除
										connection.query(deleteScoreCardSql, function(err, deleteScoreCardResults) {

											// 試合の削除
											var deleteMatchSql = 'delete from `match` where m_id = ' + extractMatchIdResults[0].m_id;

											for(var i = 1; i < extractMatchIdResults.length; i++) {
												deleteMatchSql += ' or m_id = ' + extractMatchIdResults[i].m_id;
											}

											connection.query(deleteMatchSql, function(err, deleteMatchResults) {
												// 試合の削除完了..
												// so, ユーザーが作成した得点表を削除する

												// ユーザーの過去の得点表を削除
												var deleteScoreCardSql = 'delete from scoreCard where p_id = ' + p_id;

												// ユーザーの過去の得点合計を削除
												var deleteScoreTotalSql = 'delete from scoreTotal where p_id = ' + p_id;

												// ユーザーの過去の得点を削除
												var	deleteScorePerEndSql = 'delete from scorePerEnd where p_id = ' + p_id;

												// ユーザーの得点表データの削除
												connection.query(deleteScoreCardSql, function(err, results) {
													connection.query(deleteScoreTotalSql, function(err, results) {
														connection.query(deleteScorePerEndSql, function(err, results) {

															// 4. ユーザーの削除

															// ユーザー削除SQL
															var deleteAccountSql = 'delete from account where p_id = ' + p_id;

															// ユーザーデータの削除
															connection.query(deleteAccountSql , function(errAc, results) {
																if(!errAc) {

																	var resData = {};

																	console.log('success to delete account');

																	resData['results'] = true;
																	resData['err'] = null;

																	req.session.p_id = undefined;
																	req.session.o_id = undefined;

																	console.log('send bellow data as response of delete /app/personal');
																	console.log(resData);

																	res.send(resData);
																}
																else {
																	// アカウント削除に失敗
																	console.log('faild to delete account');
																	console.log(errAc);

																	res.send({'results': false, 'err': 'ユーザーデータの削除に失敗しました'});
																}
															});
														});
													});
												});
											});
										});
									});
								});
							}
							else {
								// 試合の責任者ではあるがその試合には一つも得点表がない
								console.log('case of 試合の責任者ではあるがその試合には一つも得点表がない');

								// 試合の削除
								var deleteMatchSql = 'delete from `match` where m_id = ' + extractMatchIdResults[0].m_id;

								for(var i = 1; i < extractMatchIdResults.length; i++) {
									deleteMatchSql += ' or m_id = ' + extractMatchIdResults[i].m_id;
								}

								connection.query(deleteMatchSql, function(err, deleteMatchResults) {
									// 試合の削除完了..
									// so, ユーザーが作成した得点表を削除する

									// ユーザーの過去の得点表を削除
									var deleteScoreCardSql = 'delete from scoreCard where p_id = ' + p_id;

									// ユーザーの過去の得点合計を削除
									var deleteScoreTotalSql = 'delete from scoreTotal where p_id = ' + p_id;

									// ユーザーの過去の得点を削除
									var	deleteScorePerEndSql = 'delete from scorePerEnd where p_id = ' + p_id;

									// ユーザーの得点表データの削除
									connection.query(deleteScoreCardSql, function(err, results) {
										connection.query(deleteScoreTotalSql, function(err, results) {
											connection.query(deleteScorePerEndSql, function(err, results) {

												// 4. ユーザーの削除

												// ユーザー削除SQL
												var deleteAccountSql = 'delete from account where p_id = ' + p_id;

												// ユーザーデータの削除
												connection.query(deleteAccountSql , function(errAc, results) {
													if(!errAc) {

														var resData = {};

														console.log('success to delete account');

														resData['results'] = true;
														resData['err'] = null;

														req.session.p_id = undefined;
														req.session.o_id = undefined;

														console.log('send bellow data as response of delete /app/personal');
														console.log(resData);

														res.send(resData);
													}
													else {
														// アカウント削除に失敗
														console.log('faild to delete account');
														console.log(errAc);

														res.send({'results': false, 'err': 'Faild to delete your account.'});
													}
												});
											});
										});
									});
								});

							}
						});
					}
					else {
						// ユーザーが作成した試合が存在しない
						console.log('case of ユーザーが作成した試合が存在しない');

						// ユーザーの過去の得点表を削除
						var deleteScoreCardSql = 'delete from scoreCard where p_id = ' + p_id;

						// ユーザーの過去の得点合計を削除
						var deleteScoreTotalSql = 'delete from scoreTotal where p_id = ' + p_id;

						// ユーザーの過去の得点を削除
						var	deleteScorePerEndSql = 'delete from scorePerEnd where p_id = ' + p_id;

						// ユーザーの得点表データの削除
						connection.query(deleteScoreCardSql, function(err, results) {
							connection.query(deleteScoreTotalSql, function(err, results) {
								connection.query(deleteScorePerEndSql, function(err, results) {

									// 4. ユーザーの削除

									// ユーザー削除SQL
									var deleteAccountSql = 'delete from account where p_id = ' + p_id;

									// ユーザーデータの削除
									connection.query(deleteAccountSql , function(errAc, results) {
										if(!errAc) {

											var resData = {};

											console.log('success to delete account');

											resData['results'] = true;
											resData['err'] = null;

											req.session.p_id = undefined;
											req.session.o_id = undefined;

											console.log('send bellow data as response of delete /app/personal');
											console.log(resData);

											res.send(resData);
										}
										else {
											// アカウント削除に失敗
											console.log('faild to delete account');
											console.log(errAc);

											res.send({'results': false, 'err': 'ユーザーデータの削除に失敗しました'});
										}
									});
								});
							});
						});
					}
				});
			}
			else {
				console.log('this user is organization leader. so first it should delete its organization');
				// このユーザーは団体の責任者. foreign key制約のため初めに団体を削除しなければ、このアカウントを削除できない
				res.send({'results': false, 'err': '初めに団体を削除をしてください。'});
			}
		}
		else {
			console.log('faild to check leader account');
		}
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
	var sc_id = req.params.id;

	// o_id抽出
	var extractOrganizationIdSql = 'select o_id from account where p_id = ' + p_id;

	connection.query(extractOrganizationIdSql, function(err, extractOrganizationIdResults) {
		var o_id;

		if(extractOrganizationIdResults != undefined) {
			o_id = extractOrganizationIdResults[0].o_id;
		}

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
						scoreCardSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, organization.organizationName, `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, scoreCard.prefectures, scoreCard.number, `match`.length, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scoreCard`, `account`, `organization`, `match`, `scoreTotal` where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and organization.o_id = ' + connection.escape(o_id) + ' and `match`.m_id = ' + connection.escape(scoreCardIdData[0].m_id) + ' and scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scoreTotal.p_id = ' + connection.escape(scoreCardIdData[0].p_id)+ ';';
					}
					else {
						scoreCardSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, scoreCard.prefectures, scoreCard.number, `match`.length, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scoreCard`, `account`, `match`, `scoreTotal` where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and `match`.m_id = ' + connection.escape(scoreCardIdData[0].m_id) + ' and scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scoreTotal.p_id = ' + connection.escape(scoreCardIdData[0].p_id)+ ';';
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
							if(!err) {
								console.log('faild to delete scoreCard');
								res.send({'results': true, 'err': null});
							}
							else {
								console.log('faild to delete scoreCard');
								res.send({'results': false, 'err': '得点表の削除に失敗しました'});
							}

						});
					});
				});
			}
		}
		else {
			console.log('faild to checkPermission on delete /record/:id');
			res.send({'results': false, 'err': 'アカウントの認証に失敗しました'});
		}
	});
});

module.exports = router;
