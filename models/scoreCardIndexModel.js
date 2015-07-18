var http = require('http');
var addPrefix = require('./addPrefix');

function scoreCardIndexModel(io, connection, sessions) {

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
			var loginSql = 'select * from account where email = ' + connection.escape(data.email) + ' and password = ' + connection.escape(data.password) + ';';

			connection.query(loginSql, function(err, results) {
				console.log('results of loginSql');
				console.log(results);

				// ログイン成功
				if(results != '') {
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

									// session情報の更新
									sessions.insert(sessionInfo, function(err, sessionInfoResults) {

										if(!err) {

											// 得点表のIDをemitする
											console.log('emit insertScoreCard');
											socket.emit('insertScoreCard', {'sc_id': insertScoreCardData.insertId});

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
										}
									});
								}
								else {
									console.log('faild to get session Info');
									console.log(err);
								}
							});
						});
					});
				}
				// ログイン失敗
				else {
					console.log('faild to login');
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
								console.log(insertScoreCardSql);

								connection.query(insertScoreCardSql, function (err, insertScoreCardData) {
									console.log('insertScoreCard results');
									console.log(insertScoreCardData);

									// 得点表データに対応するscoreTotalのrecordをinsertする
									var insertScoreTotalSql = 'insert into scoreTotal(sc_id, p_id, o_id) values(' + insertScoreCardData.insertId + ', ' + connection.escape(results[0].p_id) + ', ' + connection.escape(results[0].o_id) + ');';
									console.log(insertScoreTotalSql);

									connection.query(insertScoreTotalSql, function(err, insertScoreTotalData) {

										// 得点表のIDをemitする
										console.log('emit insertScoreCard');
										socket.emit('insertScoreCard', {'sc_id': insertScoreCardData.insertId});

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
					
					var m_id = data.m_id;

					// 1. このユーザーがこの試合の管理者かどうかcheck
					// 2. 試合のstatusを1にする
					// 3. この試合に属している得点表のstatusを1にする

					var checkPermissionSql = 'select p_id from `match` where m_id = ' + m_id;

					// 1.権限を調べる
					connection.query(checkPermissionSql, function(err, checkPermissionResults) {

						if(checkPermissionResults != '') {

							if(checkPermissionResults[0].p_id == p_id) {
								// 権限はok

								// 2. 試合のstatusを1にする

								var closeMatchSql = 'update `match` set status = 1 where =  ' + m_id;

								connection.query(closeMatchSql, function(err, closeMatchSql) {

									// 3. この試合に属している得点表のstatusを1にする
									var closeScoreCardSql = 'update `scoreCard` set status = 1 where = ' + m_id;

									connection.query(closeScoreCardSql, function(err, closeScoreCardResults) {

										// broadcast
										socket.broadcast.to('scoreCardIndexRoom' + data.m_id).emit('broadcastCloseMatch', {'m_id': m_id});
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