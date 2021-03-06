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
												var scoreCardDataSql = 'select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total, (select count(scorePerEnd.perEnd) from scorePerEnd where scorePerEnd.sc_id = ' + insertScoreCardData.insertId + ') as perEnd from account, scoreTotal where scoreTotal.sc_id = ' + insertScoreCardData.insertId + ' and account.p_id = ' + connection.escape(results[0].p_id);

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
										var scoreCardDataSql = 'select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total, (select count(scorePerEnd.perEnd) from scorePerEnd where scorePerEnd.sc_id = ' + insertScoreCardData.insertId + ') as perEnd from account, scoreTotal where scoreTotal.sc_id = ' + insertScoreCardData.insertId + ' and account.p_id = ' + connection.escape(results[0].p_id);

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