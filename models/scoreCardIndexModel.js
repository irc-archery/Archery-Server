var http = require('http');
var addPrefix = require('./addPrefix');
var crypto = require('../models/crypto.js');

// websocketにて、/scoreCardIndexにアクセスされた時の処理
function scoreCardIndexModel(io, connection, sessions, ios) {

	io.on('connection', function(socket) {

		console.log('connection scoreCardIndex');

		//  得点表 一覧取得
		socket.on('joinMatch', function(data) {

			// On log
			console.log('on extractScoreCardIndex');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					if(p_id !== undefined) {

						// 試合に参加
						socket.join('scoreCardIndexRoom' + data.m_id);

						// 得点表一覧のEmit

						// 得点表のid抽出に使用するSQL文
						var scoreCardIndexIdSql = 'select scoreCard.sc_id, scoreCard.p_id from scoreCard where scoreCard.m_id = ' + connection.escape(data.m_id);

						// 得点表idを抽出する
						connection.query(scoreCardIndexIdSql, function(err, scoreCardIndexId){

							// 得点表が存在すればそれを抽出
							if(Object.keys(scoreCardIndexId).length !== 0) {

								// 得点表データを抽出するためのSQL文
								var scoreCardIndexDataSql = 'select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName , scoreTotal.total, (select count(scorePerEnd.perEnd) from scorePerEnd where scorePerEnd.sc_id = ' + connection.escape(scoreCardIndexId[0].sc_id) + ') as perEnd from account, scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIndexId[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIndexId[0].p_id);

								// 得点表の数に応じてselectするSQL文を追加
								for(var i = 1; i < scoreCardIndexId.length; i++){
									scoreCardIndexDataSql += ' union all select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName , scoreTotal.total, (select count(scorePerEnd.perEnd) from scorePerEnd where scorePerEnd.sc_id = ' + connection.escape(scoreCardIndexId[i].sc_id) + ') as perEnd from account, scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIndexId[i].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIndexId[i].p_id);
								}

								// 構築した得点表データ抽出のSQL文でデータ抽出
								connection.query(scoreCardIndexDataSql, function(err, scoreCardIndexData){
									// Emit log
									console.log('emit : extractScoreCardIndex');
									console.log(scoreCardIndexData);

									// 得点表一覧をEmit
									socket.emit('extractScoreCardIndex', scoreCardIndexData);
								});
							}

							// 得点表は存在しない
							else {
								socket.emit('extractScoreCardIndex','');
							}
						});
					}
					else{
						socket.emit('authorizationError');
					}
				}
			});
		});

		// 得点表 作成
		socket.on('insertScoreCard', function(data) {
			console.log('on insertScoreCard');
			console.log(data);

			// ログイン処理
			var loginSql = 'select * from account where email = ' + connection.escape(data.email);

			connection.query(loginSql, function(err, results) {
				console.log('results of loginSql');
				console.log(results);

				// ログイン成功
				if(results != '') {
					if(crypto.decryption(results[0].password) === data.password) {
						console.log('success to login');	

						// 得点表作成
						var insertScoreCardSql = 'insert into scoreCard(p_id, m_id, created) values(' + connection.escape(results[0].p_id) + ', ' + connection.escape(data.m_id) + ', now())';

						connection.query(insertScoreCardSql, function (err, insertScoreCardData) {

							console.log('insertScoreCardData');
							console.log(insertScoreCardData);

							// 得点表データに対応するscoreTotalのrecordをinsertする
							var insertScoreTotalSql = 'insert into scoreTotal(sc_id, p_id, o_id) values(' + insertScoreCardData.insertId + ', ' + connection.escape(results[0].p_id) + ', ' + connection.escape(results[0].o_id) + ');';

							connection.query(insertScoreTotalSql, function(err, insertScoreTotalData) {

								// 現在ログイン中のプレイヤーに得点表の権限を与える
								sessions.get(addPrefix(data.sessionID), function(err, sessionInfo) {
									if(!err) {
										console.log('sessionInfo');
										console.log(sessionInfo);

										var subUser = {'sc_id': insertScoreCardData.insertId};

										console.log(sessionInfo['sess']['subUser']);

										if(sessionInfo['sess']['subUser'] != undefined) {
											sessionInfo['sess']['subUser'][sessionInfo['sess']['subUser'].length] = subUser;
										}
										else {
											sessionInfo['sess']['subUser'] = [];
											sessionInfo['sess']['subUser'][0] = subUser;
										}

										console.log(sessionInfo);

										// session情報の更新
										sessions.insert(sessionInfo, function(err, sessionInfoResults) {

											if(!err) {

												// 得点表のIDをemitする
												console.log('sessionInfoResults');
												console.log(sessionInfoResults);

												console.log('emit insertScoreCard');
												socket.emit('insertScoreCard', {'status' : 1, 'err':null, 'sc_id': insertScoreCardData.insertId});

												// broadcast scoreCard information: added now

												// 得点表データを抽出するためのSQL文 
												var scoreCardDataSql = 'select scoreTotal.sc_id, account.p_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total, (select count(scorePerEnd.perEnd) from scorePerEnd where scorePerEnd.sc_id = ' + insertScoreCardData.insertId + ') as perEnd from account, scoreTotal where scoreTotal.sc_id = ' + insertScoreCardData.insertId + ' and account.p_id = ' + connection.escape(results[0].p_id);

												// 得点表データを抽出
												connection.query(scoreCardDataSql, function(err, scoreCardData) {
													console.log('emit broadcastInsertScoreCard');
													console.log(scoreCardData);

													socket.broadcast.to('scoreCardIndexRoom' + data.m_id).emit('broadcastInsertScoreCard', scoreCardData[0]);
												});
											}
											else {
												// session情報の更新に失敗
												console.log('faild to update sessoin Info');
												console.log(err);
												
												socket.emit('insertScoreCard', {'status': 0, 'err': 'ログインに失敗しました。'});
											}
										});
									}
									else {
										console.log('faild to get session Info');
										console.log(err);

										socket.emit('insertScoreCard', {'status': 0, 'err': 'ログインに失敗しました。'});
									}
								});
							});
						});
					}	
					else {
						console.log('faild to login');
						socket.emit('insertScoreCard', {'status': 0, 'err': 'ログイン名が存在しないか、パスワードが間違っているためログインできませんでした。'});
					}
				}
				// ログイン失敗
				else {
					console.log('faild to login');
					socket.emit('insertScoreCard', {'status': 0, 'err': 'ログイン名が存在しないか、パスワードが間違っているためログインできませんでした。'});
				}
			});
		});

		// 得点表 作成
		socket.on('insertOwnScoreCard', function(data) {
			console.log('on insertOwnScoreCard');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {
						// ユーザーデータの抽出
						var accountSql = 'select * from account where p_id = ' + p_id;

						connection.query(accountSql, function(err, results) {
							console.log('results of accountSql');
							console.log(results);

							// データが正常に抽出完了
							if(results != '') {
								console.log('success to login');	

								// 得点表作成
								var insertScoreCardSql = 'insert into scoreCard(p_id, m_id, created) values(' + connection.escape(results[0].p_id) + ', ' + connection.escape(data.m_id) + ', now())';

								connection.query(insertScoreCardSql, function (err, insertScoreCardData) {
									console.log('insertScoreCard results');
									console.log(insertScoreCardData);

									// 得点表データに対応するscoreTotalのrecordをinsertする
									var insertScoreTotalSql = 'insert into scoreTotal(sc_id, p_id, o_id) values(' + insertScoreCardData.insertId + ', ' + connection.escape(results[0].p_id) + ', ' + connection.escape(results[0].o_id) + ');';

									connection.query(insertScoreTotalSql, function(err, insertScoreTotalData) {

										// 得点表のIDをemitする
										console.log('emit insertScoreCard');
										socket.emit('insertScoreCard', {'sc_id': insertScoreCardData.insertId, 'status': 1, 'err': null});

										// broadcast scoreCard information: added now

										// 得点表データを抽出するためのSQL文 
										var scoreCardDataSql = 'select scoreTotal.sc_id, account.p_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total, (select count(scorePerEnd.perEnd) from scorePerEnd where scorePerEnd.sc_id = ' + insertScoreCardData.insertId + ') as perEnd from account, scoreTotal where scoreTotal.sc_id = ' + insertScoreCardData.insertId + ' and account.p_id = ' + connection.escape(results[0].p_id);

										// 得点表データを抽出
										connection.query(scoreCardDataSql, function(err, scoreCardData) {

											console.log('emit broadcastInsertScoreCard');
											console.log(scoreCardData);

											socket.broadcast.to('scoreCardIndexRoom' + data.m_id).emit('broadcastInsertScoreCard', scoreCardData[0]);
										});
									});
								});
							}
							// ログイン失敗
							else {
								console.log('faild to login');
								socket.emit('insertScoreCard', {'status': 0, 'err': 'ログインに失敗しました。'});
							}
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						socket.emit('authorizationError');
					}
				}
			});
		});

		// ランキング一覧を返すイベント
		// client side emit like 
		// socket.emit(eventName, {'m_id': getQueryString().m_id, 'sessionID': document.cookie});
		socket.on('extractTotalRankingIndex', function(data) {

			// On log
			console.log('on extractTotalRankingIndex');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
 
					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					if(p_id !== undefined) {

						// 試合に参加
						socket.join('scoreCardIndexRoom' + data.m_id);

						// 送られてきたm_idに所属している得点表データを抽出するSQL文
						var totalRankingSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total from scoreCard, scoreTotal, account where scoreCard.m_id = ' + connection.escape(data.m_id) + ' and scoreCard.sc_id = scoreTotal.sc_id and scoreCard.p_id = account.p_id';

						// 得点表データを抽出
						connection.query(totalRankingSql, function(totalRankingErr, totalRankingData) {

							if(!totalRankingErr) {

								// 抽出したデータ
								console.log('totalRankingData');
								console.log(totalRankingData);

								var responseData = {};

								// 1ユーザーあたり最高得点の得点表だけをresponseデータとして抽出する処理
								for(var i = 0; i < totalRankingData.length; i++) {
									// レスポンスとして用意しているデータの合計得点より、現在探索しているデータのほうが大きくなかったらresponseDataを上書きする処理をcontinueでskip
									if(totalRankingData[i].p_id in responseData) {
										if(!(totalRankingData[i].total > responseData[totalRankingData[i].p_id].total)) {
											continue;	
										}
									}

									responseData[totalRankingData[i].p_id] = totalRankingData[i];
								}

								var beforeSort = [];
								var i = 0;

								// 抽出したデータを配列化 (sort用)
								Object.keys(responseData).forEach(function(key) {
									beforeSort[i] = responseData[key];
									i++;
								});


								// 配列化されたデータをtotalで昇順に並べ替える	
								var afterSort = arraySort(beforeSort);


								var rank = 1;

								// 昇順に並べ替えられたarrayを利用して, response用に用意しているobjectへrankをつける
								for(var j = 0; j < afterSort.length; j++, rank++) {

									if(j != 0) {
										// 得点重複時の処理
										if(responseData[afterSort[j].p_id].total == responseData[afterSort[j - 1].p_id].total) {
											responseData[afterSort[j].p_id].rank = responseData[afterSort[j - 1].p_id].rank; 
											continue;
										}
									}

									responseData[afterSort[j].p_id].rank = rank;
								}


								//  true response
								var arrayResponseData = [];

								i = 0;

								// responseとして送るformatへ整形( obj to array)
								Object.keys(responseData).forEach(function(key) {
									arrayResponseData[i] = responseData[key];
									i++;
								});

								console.log('data for extractTotalRankingIndex');
								console.log(arrayResponseData);

								socket.emit('extractTotalRankingIndex', arrayResponseData);
							}
							else {
								console.log('得点表データの抽出に失敗');
								console.log(totalRankingErr);
							}
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						console.log('authorizationError');
						socket.emit('authorizationError');
					}
				}else {
					console.log('faild to getSession');
				}
			});
		});

		function arraySort(obj) {

			obj.sort(function(a, b) {
				return a.total < b.total ? 1 : -1;
			});

			return obj;	
		}

		function arrayAvgSort(obj) {

			obj.sort(function(a, b) {
				return a.scoreAvg < b.scoreAvg ? 1 : -1;
			});

			return obj;	
		}

		socket.on('extractAvgRankingIndex', function(data) {

			// On log
			console.log('on extractAvgRankingIndex');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
 
					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					if(p_id !== undefined) {

						// 試合に参加
						socket.join('scoreCardIndexRoom' + data.m_id);

						// 送られてきたm_idに所属している得点表データを抽出 
						var avgRankingSql = 'select scorePerEnd.sc_id, scorePerEnd.p_id, concat(account.lastName, account.firstName) as playerName, count(scorePerEnd.sc_id) as totalPerEnd, scoreTotal.total, `match`.arrows, `match`.m_id from scorePerEnd, `match`, account, scoreCard, scoreTotal where `match`.m_id = ' + connection.escape(data.m_id) + ' and scoreCard.m_id = ' + connection.escape(data.m_id) + ' and scoreCard.sc_id = scorePerEnd.sc_id and scoreCard.sc_id = scoreTotal.sc_id and account.p_id = scorePerEnd.p_id group by scorePerEnd.sc_id';

						// 得点表データを抽出
						connection.query(avgRankingSql, function(avgRankingErr, avgRankingData) {

							if(!avgRankingErr) {

								// 抽出したデータ
								console.log('avgRankingData');
								console.log(avgRankingData);

								var indexedP_id = {};

								for(var i = 0; i < avgRankingData.length; i++) {

									var p_id = avgRankingData[i]['p_id'];

									// すでにp_idがkeyとして存在する
									if(p_id in indexedP_id) {
										// 存在する ∴ breakdownへのデータの追加とtotal, avgの更新のみを行う

										indexedP_id[p_id]['scoreTotal'] += avgRankingData[i]['total'];
										indexedP_id[p_id]['arrowsTotal'] += avgRankingData[i]['totalPerEnd'] * avgRankingData[i]['arrows'];
									    indexedP_id[p_id]['scoreAvg'] =  indexedP_id[p_id]['scoreTotal'] / indexedP_id[p_id]['arrowsTotal'];
									    indexedP_id[p_id]['breakdown'].push({
											'sc_id': avgRankingData[i]['sc_id'],
											'total': avgRankingData[i]['total']
									    }); 
									}
									else {
										// 存在しない ∴ responesのformatにそってデータをsetする
										indexedP_id[p_id] = {};

										indexedP_id[p_id]['p_id'] = avgRankingData[i]['p_id'];
										indexedP_id[p_id]['playerName'] = avgRankingData[i]['playerName'];
										indexedP_id[p_id]['scoreTotal'] = avgRankingData[i]['total'];
										indexedP_id[p_id]['arrowsTotal'] = avgRankingData[i]['totalPerEnd'] * avgRankingData[i]['arrows'];
									    indexedP_id[p_id]['scoreAvg'] =  indexedP_id[p_id]['scoreTotal'] / indexedP_id[p_id]['arrowsTotal'];
										indexedP_id[p_id]['breakdown'] = [{
											'sc_id': avgRankingData[i]['sc_id'],
											'total': avgRankingData[i]['total']
										}];
									}
								}

								console.log('indexedP_id');
								console.log(indexedP_id);

								//socket.emit('extractAvgRankingIndex', indexedP_id);

								//--- quote from extractTotalRankingIndex method ---//

								var beforeSort = [];
								var i = 0;

								// 抽出したデータを配列化 (sort用)
								Object.keys(indexedP_id).forEach(function(key) {
									beforeSort[i] = indexedP_id[key];
									i++;
								});

								// 配列化されたデータをtotalで昇順に並べ替える	
								var afterSort = arrayAvgSort(beforeSort);

								var rank = 1;

								// 昇順に並べ替えられたarrayを利用して, response用に用意しているobjectへrankをつける
								for(var j = 0; j < afterSort.length; j++, rank++) {

									if(j != 0) {
										// 得点重複時の処理
										if(indexedP_id[afterSort[j].p_id].scoreAvg == indexedP_id[afterSort[j - 1].p_id].scoreAvg) {
											indexedP_id[afterSort[j].p_id].rank = indexedP_id[afterSort[j - 1].p_id].rank; 
											continue;
										}
									}

									indexedP_id[afterSort[j].p_id].rank = rank; }

								//  true response
								var arrayResponseData = [];

								i = 0;

								// responseとして送るformatへ整形( obj to array)
								Object.keys(indexedP_id).forEach(function(key) {
									arrayResponseData[i] = indexedP_id[key];
									arrayResponseData[i].scoreAvg = arrayResponseData[i].scoreAvg.toFixed(1);
									i++;
								});

								console.log('data for extractAvgRankingIndex');
								console.log(arrayResponseData);

								socket.emit('extractAvgRankingIndex', arrayResponseData);	
							}
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						console.log('authorizationError');
						socket.emit('authorizationError');
					}
				}else {
					console.log('faild to getSession');
				}
			});
		});	

		socket.on('testBroadcastInsertScore', function(data) {
			var responseData = {
				'sc_id': 1,
				'p_id': 3,
				'perEnd': 6,
				'score_1': 10,
				'score_2': 10,
				'score_3': 10,
				'score_4': 10,
				'score_5': 10,
				'score_6': 10,
				'subTotal': 60,
				'ten': 6,
				'x': 0,
				'total':220
			};

			socket.emit('broadcastInsertScore', responseData);
		});

		// 受け取ったsc_idのpermissionを返すイベント
		socket.on('checkPermission', function(data) {

			// On log
			console.log('on checkPermission');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {

						// idを抽出するsql文
						var scoreCardIdSql = 'select scoreCard.p_id, scoreCard.sc_id from `scoreCard` where scoreCard.sc_id = ' + connection.escape(data.sc_id);

						// idを抽出
						connection.query(scoreCardIdSql, function (err, scoreCardIdData) {

							var p_idPermission = ( p_id === scoreCardIdData[0].p_id ? true : false );

							var sc_idPermission = false;

							if(body.sess.subUser != undefined) {

								for(var i = 0; i < body.sess.subUser.length; i++) {
									if(body.sess.subUser[i].sc_id === scoreCardIdData[0].sc_id) {
										sc_idPermission = true;
									}
								}
							}

							// パーミッションを追加
							var emitData = {'permission' : ( p_idPermission || sc_idPermission ) ? true : false};

							console.log('checkPermission');
							console.log(emitData);

							socket.emit('checkPermission', emitData);
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						socket.emit('authorizationError');
					}
				}
			});
		});

		// 試合終了の権限確認
		socket.on('checkMatchCreater', function(data) {

			console.log('on checkMatchCreater');
			console.log(data);

			// sessionIDで参照できるp_idと試合の作成者のp_idが同一であればtrue, or false
			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {

				if(!err) {

					var checkMatchCreaterSql = 'select p_id from `match` where m_id = ' + connection.escape(data.m_id);

					connection.query(checkMatchCreaterSql, function(err, checkMatchCreaterData) {
						if(!err) {
							var emitData = {};

							console.log('checkMatchCreaterData');
							console.log(checkMatchCreaterData);

							if(checkMatchCreaterData[0].p_id == body.sess.p_id) {
								// 試合作成者と同じp_id
								emitData = {'permission': true};
							}
							else {
								emitData = {'permission': false};
							}

							socket.emit('checkMatchCreater', emitData);
						}
					});
				}
			});
		});

		// 試合の終了
		socket.on('closeMatch', function(data) {

			console.log('on closeMatch');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;
					
					var m_id = parseInt(data.m_id);

					// 1. このユーザーがこの試合の管理者かどうかcheck
					// 2. 試合のstatusを1にする
					// 3. この試合に属している得点表のstatusを1にする

					var checkPermissionSql = 'select p_id from `match` where m_id = ' + m_id;

					// 1.権限を調べる
					connection.query(checkPermissionSql, function(err, checkPermissionResults) {

						if(checkPermissionResults != '') {

							if(checkPermissionResults[0].p_id == p_id) {
								// 権限はok
								console.log('you can close this match;');

								// 2. 試合のstatusを1にする

								var closeMatchSql = 'update `match` set status = 1 where m_id = ' + m_id;

								connection.query(closeMatchSql, function(err, closeMatchResults) {

									console.log('closeMatchResults');
									console.log(closeMatchResults);

									socket.emit('broadcastCloseMatch', {'m_id': m_id});

									// 3. この試合に属している得点表のstatusを1にする
									var closeScoreCardSql = 'update `scoreCard` set status = 1 where m_id = ' + m_id;

									connection.query(closeScoreCardSql, function(err, closeScoreCardResults) {

										// broadcast
										console.log('emit broadcastCloseMatch');
										socket.broadcast.to('scoreCardIndexRoom' + m_id).emit('broadcastCloseMatch', {'m_id': m_id});
										ios.of('/matchIndex').emit('broadcastCloseMatch', {'m_id': m_id});

										// 得点表画面にいる人たちにも試合終了通知をbroadcast
										var devicesSql = 'select sc_id from scoreCard where m_id = ' + m_id;

										connection.query(devicesSql, function(err, devicesResults) {

											for(var i = 0; i < devicesResults.length; i++) {
												console.log('emit broadcastCloseMatch to scoreCardRoom' + devicesResults[i].sc_id);
												ios.of('/scoreCard').to('scoreCardRoom' + devicesResults[i].sc_id).emit('broadcastCloseMatch', {'m_id': m_id});
											}
										});
									});
								});
							}
						}
					});
				}
			});
		});
	});
};

module.exports = scoreCardIndexModel;