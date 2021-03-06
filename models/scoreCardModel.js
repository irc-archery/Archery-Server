var http = require('http');
var addPrefix = require('./addPrefix');

// websocketにて、/scoreCardにアクセスされた時の処理
function scoreCardModel(io, connection, sessions, ios) {

	io.on('connection', function(socket) {

		console.log('connection scoreCard');

		// 得点表の抽出
		socket.on('extractScoreCard', function(data) {

			// On log
			console.log('on extractScoreCard');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {

						socket.join('scoreCardRoom' + data.sc_id);

						// 得点表データの抽出に使用するidを抽出するsql文
						var scoreCardIdSql = 'select scoreCard.sc_id, scoreCard.p_id, scoreCard.m_id from `scoreCard` where scoreCard.sc_id = ' + connection.escape(data.sc_id);

						// idを抽出
						connection.query(scoreCardIdSql, function (err, scoreCardIdData) {

							console.log('scoreCardIdData');
							console.log(scoreCardIdData);

							// データが正常に取得できていたら
							if(scoreCardIdData != ''){

								// 得点表データの抽出を行うSQL文
								// scoreCardSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, (select organizationName from organization where o_id = (select o_id from account where p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ')) as organizationName, `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, scoreCard.prefectures, scoreCard.number, `match`.length, `match`.perEnd as maxPerEnd, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scoreCard`, `account`, `organization`, `match`, `scoreTotal` where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and `match`.m_id = ' + connection.escape(scoreCardIdData[0].m_id) + ' and scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scoreTotal.p_id = ' + connection.escape(scoreCardIdData[0].p_id)+ ';';
								var scoreCardSql = 'select scoreCard.sc_id, scoreCard.p_id, scoreCard.prefectures, scoreCard.number, (select concat(account.lastName, account.firstName) from account where account.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ') as playerName, (select organizationName from organization where o_id = (select o_id from account where p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ')) as organizationName from `scoreCard` where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id);

								// 試合データを抽出するためのSQL文
								var matchSql = 'select `match`.matchName, DATE_FORMAT(`match`.created, "%Y/%m/%d") as created, `match`.length, `match`.perEnd as maxPerEnd from `match` where `match`.m_id = ' + connection.escape(scoreCardIdData[0].m_id);

								// 得点表の現在のセット数をカウントするためのSQL文
								var countPerEndSql = 'select count(spe_id) as countPerEnd from scorePerEnd where scorePerEnd.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id);

								// 得点データの抽出を行うSQL文
								var scorePerEndSql = 'select scorePerEnd.score_1, scorePerEnd.score_2, scorePerEnd.score_3, scorePerEnd.score_4, scorePerEnd.score_5, scorePerEnd.score_6, scorePerEnd.updatedScore_1, scorePerEnd.updatedScore_2, scorePerEnd.updatedScore_3, scorePerEnd.updatedScore_4, scorePerEnd.updatedScore_5, scorePerEnd.updatedScore_6, scorePerEnd.subTotal, scorePerEnd.perEnd from `scorePerEnd` where scorePerEnd.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' order by scorePerEnd.perEnd asc;';

								// 得点合計データの抽出を行うSQL分
								var scoreTotalSql = 'select scoreTotal.ten, scoreTotal.x, scoreTotal.total from scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id);

								// 得点表データの抽出
								connection.query(scoreCardSql, function (err, scoreCardData) {
									// 試合データの抽出
									connection.query(matchSql, function(err, matchData) {
										// セット数の抽出
										connection.query(countPerEndSql, function(err, countPerEndData){
											// 得点データの抽出
											connection.query(scorePerEndSql, function (err, scorePerEndData) {
												// 得点合計データの抽出
												connection.query(scoreTotalSql, function(err, scoreTotalData) {

													// Check Permission
													var p_idPermission = ( p_id === scoreCardIdData[0].p_id ? true : false );

													var sc_idPermission = false;

													// 他人のアカウントの得点表を作成した場合の権限処理
													if(body.sess.subUser != undefined) {

														for(var i = 0; i < body.sess.subUser.length; i++) {
															if(body.sess.subUser[i].sc_id === scoreCardIdData[0].sc_id) {
																sc_idPermission = true;
															}
														}
													}

													// 試合データの結合
													Object.keys(matchData[0]).forEach(function(key) {
														scoreCardData[0][key] = matchData[0][key];
													});

													// セット数の結合
													scoreCardData[0]['countPerEnd'] = countPerEndData[0]['countPerEnd'];

													// 得点データの結合
													scoreCardData[0]['score'] = scorePerEndData;

													// 得点合計データの結合
													Object.keys(scoreTotalData[0]).forEach(function(key) {
														scoreCardData[0][key] = scoreTotalData[0][key];
													});

													// パーミッションを追加
													scoreCardData[0]['permission'] = p_idPermission || sc_idPermission;


													// Emit log
													console.log('emit : extractScoreCard');
													console.log(scoreCardData[0]);

													// 得点表データのEmit
													socket.emit('extractScoreCard', scoreCardData[0]);
												});
											});
										});
									});
								});
							}
							else {
								console.log('不正なsc_idです');
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

		// 得点表記入
		socket.on('insertScore', function (data) {

			// On log
			console.log('on insertScore');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var loggedp_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(loggedp_id !== undefined) {

						// 得点表の選手のp_idを取得
						// その人のp_idがこの人のsubUserのp_idと一致すれば処理を続行
						// その際, 挿入する値に使用するp_idをしっかりとsubUserのp_idに切り替える

						// データがすでに存在しないかどうか確認する
						var checkExistSql = 'select sc_id from `scorePerEnd` where sc_id = ' + connection.escape(data.sc_id) + ' and perEnd = ' + connection.escape(data.perEnd);

						connection.query(checkExistSql, function(err, checkExistData) {

							// 送られてきた得点表のセットが存在しなければデータを挿入する
							if(Object.keys(checkExistData).length === 0) {

								// p_idを抽出
								var extractPersonalIdSql = 'select p_id from scoreCard where sc_id = ' + connection.escape(data.sc_id);

								connection.query(extractPersonalIdSql, function(err, extractPersonalIdData) {
									if(!err) {
										var p_id = extractPersonalIdData[0].p_id;	

										// 得点を挿入するためのSQL文
										var insertScoreSql = 'insert into `scorePerEnd`(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3, score_4, score_5, score_6, subTotal) values(' + connection.escape(data.sc_id) + ', ' + connection.escape(p_id) + ', (select o_id from `organization` where p_id = ' + connection.escape(p_id) + '), ' + connection.escape(data.perEnd) + ', ' + connection.escape(data.score_1) + ', ' + connection.escape(data.score_2) + ', ' + connection.escape(data.score_3) + ', ' + connection.escape(data.score_4) + ', ' + connection.escape(data.score_5) + ', ' + connection.escape(data.score_6) + ', ' + connection.escape(data.subTotal) + ');';

										// 得点合計を更新するためのSQL文
										var updateScoreTotalSql = 'update `scoreTotal` set ten = ' + connection.escape(data.ten) + ', x = ' + connection.escape(data.x) + ', total = ' + connection.escape(data.total) + ' where sc_id = ' + connection.escape(data.sc_id) + ' and p_id = ' + connection.escape(p_id);

										// 得点の挿入処理
										connection.query(insertScoreSql, function (err, insertScoreData) {

											// 後にこのコールバック関数で、挿入された得点をブロードキャストでエミットする

											// output results
											console.log('connection.query insertScore results');
											console.log(insertScoreData);

											// output err
											console.log('connection.query insertScore err');
											console.log(err);

											// 得点合計の挿入処理
											connection.query(updateScoreTotalSql, function (err, updateScoreTotalData) {
												console.log('connection.query updateScore results');
												console.log(updateScoreTotalData);

												console.log('connection.query updateScore err');
												console.log(err);

												// 挿入された値を抽出し、ブロードキャストでエミットするためのSQL文
												var broadcastInsertScoreSql = 'select scorePerEnd.sc_id, scorePerEnd.p_id, scorePerEnd.perEnd, scorePerEnd.score_1, scorePerEnd.score_2, scorePerEnd.score_3, scorePerEnd.score_4, scorePerEnd.score_5, scorePerEnd.score_6, scorePerEnd.subTotal, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scorePerEnd`, `scoreTotal` where scorePerEnd.sc_id = ' + connection.escape(data.sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(p_id) + ' and scorePerEnd.perEnd = ' + connection.escape(data.perEnd) + ' and scoreTotal.sc_id = ' + connection.escape(data.sc_id) + ' and scoreTotal.p_id = ' + connection.escape(p_id) + ';';

												// broadcast Emit		
												connection.query(broadcastInsertScoreSql, function (err, broadcastInsertScoreData) {

													console.log('Emit : broadcastInsertScoreData');
													console.log(broadcastInsertScoreData[0]);

													socket.broadcast.to('scoreCardRoom' + data.sc_id).emit('broadcastInsertScore', broadcastInsertScoreData[0]);

													ios.of('/scoreCardIndex').to('scoreCardIndexRoom' + data.m_id).emit('broadcastInsertScore', broadcastInsertScoreData[0]);
												});
											});
										}); 
									}
									else {
										console.log('データの重複が発生したためデータを挿入しませんでした');
									}
								});
							}

							// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
							else {
								socket.emit('authorizationError');
							}
						});
					}
				}
			});
		});
	
		// 得点表修正
		socket.on('updateScore', function (data) {

			// On log
			console.log('on updateScore');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var loggedp_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(loggedp_id !== undefined) {

						// p_idを抽出
						var extractPersonalIdSql = 'select p_id from scoreCard where sc_id = ' + connection.escape(data.sc_id);

						connection.query(extractPersonalIdSql, function(err, extractPersonalIdData) {
							if(!err) {
								var p_id = extractPersonalIdData[0].p_id;	

								// 得点を挿入するためのSQL文
								var updateScoreSql = 'update `scorePerEnd` set';

								for(var i = 1; i <= 6; i++){
									if( 'updatedScore_' + i in data ) {
										updateScoreSql += ' updatedScore_' + i + ' = ' + connection.escape(data['updatedScore_' + i]) + ',';
									}
								}

								// where文を追加
								updateScoreSql += ' subTotal = ' + connection.escape(data.subTotal) + ' where sc_id = ' + connection.escape(data.sc_id) + ' and p_id = ' + connection.escape(p_id) + ' and perEnd = ' + connection.escape(data.perEnd) + ';';

								// 得点合計を更新するためのSQL文
								var updateScoreTotalSql = 'update `scoreTotal` set ten = ' + connection.escape(data.ten) + ', x = ' + connection.escape(data.x) + ', total = ' + connection.escape(data.total) + ' where sc_id = ' + connection.escape(data.sc_id) + ' and p_id = ' + connection.escape(p_id);

								// 得点の更新処理
								connection.query(updateScoreSql, function (err, updateScoreData) {

									// 後にこのコールバック関数で、挿入された得点をブロードキャストでエミットする

									// output results
									console.log('connection.query updateScore results');
									console.log(updateScoreData);

									// output err
									console.log('connection.query updateScore err');
									console.log(err);

									// 得点合計の挿入処理
									connection.query(updateScoreTotalSql, function (err, updateScoreTotalData) {

										// output results
										console.log('connection.query updateScore results');
										console.log(updateScoreTotalData);

										// output err
										console.log('connection.query updateScore err');
										console.log(err);

										// 挿入された値を抽出し、ブロードキャストでエミットするためのSQL文
										var broadcastUpdateScoreSql = 'select scorePerEnd.sc_id, scorePerEnd.p_id, scorePerEnd.perEnd, '

										for(var i = 1; i <= 6; i++){
											if( 'updatedScore_' + i in data ) {
												broadcastUpdateScoreSql += ' updatedScore_' + i + ',';
											}
										}

										broadcastUpdateScoreSql += ' scorePerEnd.subTotal, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scorePerEnd`, `scoreTotal` where scorePerEnd.sc_id = ' + connection.escape(data.sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(p_id) + ' and scorePerEnd.perEnd = ' + connection.escape(data.perEnd) + ' and scoreTotal.sc_id = ' + connection.escape(data.sc_id) + ' and scoreTotal.p_id = ' + connection.escape(p_id) + ';';

										connection.query(broadcastUpdateScoreSql, function(err, broadcastUpdateScoreData) {

											// Emit log
											console.log('Emit : broadcastUpdateScore');
											console.log(broadcastUpdateScoreData[0]);

											socket.broadcast.to('scoreCardRoom' + data.sc_id).emit('broadcastUpdateScore', broadcastUpdateScoreData[0]);

											ios.of('/scoreCardIndex').to('scoreCardIndexRoom' + data.m_id).emit('broadcastUpdateScore', broadcastUpdateScoreData[0]);
										});
									});
								}); 
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

		// ゼッケン番号登録
		socket.on('insertNumber', function (data) {

			// On log
			console.log('on insertNumber');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					var sc_id = data.sc_id;
					var number = data.number;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {					

						var insertNumberSql = 'update scoreCard set number = ' + connection.escape( number ) + ' where sc_id = ' + connection.escape( sc_id );

						connection.query(insertNumberSql, function(err, insertNumberResults) {

							if(!err) {
								// ゼッケン番号の挿入が完了... So, broadcaast it.

								// broadcast

								var broadcastInsertNumberSql = 'select sc_id, number from scoreCard where sc_id = ' + connection.escape( sc_id );

								connection.query(broadcastInsertNumberSql, function(err, broadcastInsertNumberResults) {

									console.log('Emit: broadcastInsertNumber');
									console.log(broadcastInsertNumberSql[0]);

									socket.broadcast.to('scoreCardRoom' + sc_id).emit('broadcastInsertNumber', broadcastInsertNumberResults[0]);
								});
							}
						});
					}
					else {
						socket.emit('authorizationError');
					}
				}
			});
		});

		// ゼッケン番号登録
		socket.on('insertPrefectures', function (data) {

			// On log
			console.log('on insertPrefectures');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					var sc_id = data.sc_id;
					var prefectures = data.prefectures;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {					

						var insertPrefecturesSql = 'update scoreCard set prefectures = ' + connection.escape( prefectures ) + ' where sc_id = ' + connection.escape( sc_id );

						connection.query(insertPrefecturesSql, function(err, insertPrefecturesResults) {

							if(!err) {
								// 都道府県の挿入が完了... So, broadcaast it.

								// broadcast

								var broadcastInsertPrefecturesSql = 'select sc_id, Prefectures from scoreCard where sc_id = ' + connection.escape( sc_id );

								connection.query(broadcastInsertPrefecturesSql, function(err, broadcastInsertPrefecturesResults) {

									console.log('Emit: broadcastInsertPrefectures');
									console.log(broadcastInsertPrefecturesSql[0]);

									socket.broadcast.to('scoreCardRoom' + sc_id).emit('broadcastInsertPrefectures', broadcastInsertPrefecturesResults[0]);
								});
							}
						});
					}
					else {
						socket.emit('authorizationError');
					}
				}
			});
		});
	});
};

module.exports = scoreCardModel;