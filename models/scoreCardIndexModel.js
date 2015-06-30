var http = require('http');

function scoreCardIndexModel(io, connection) {

	io.on('connection', function(socket) {

		console.log('connection scoreCardIndex');

		//  得点表 一覧取得
		socket.on('joinMatch', function(data) {

			// On log
			console.log('on extractScoreCardIndex');
			console.log(data);

			/* Get p_id related SessionID */

			var addPrefix = require('./addPrefix');

			var id = addPrefix(data.sessionID);
			console.log('id');
			console.log(id);

			var dbName = process.env.COUCHDB_NAME || 'archery-server-sessions';

			// options for connection couchdb
			var options = {
				hostname: process.env.COUCHDB_HOST || '127.0.0.1',
				port: 5984,
				method: 'GET',
				path: '/' + dbName + '/' + id,
				headers: {'Accept': 'application/json'}
			};

			// CouchDBよりSessionに紐付けられたp_idを取得する
			var getReq = http.request(options, function(response) {
				response.setEncoding('utf8');
				response.on('data', function(chunk) {

					// p_idの抽出
					var p_id = JSON.parse(chunk).sess.p_id;

					console.log('p_id');
					console.log(p_id);

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
								var scoreCardIndexDataSql = 'select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName , scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIndexId[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIndexId[0].p_id);

								// 得点表の数に応じてselectするSQL文を追加
								for(var i = 1; i < scoreCardIndexId.length; i++){
									scoreCardIndexDataSql += ' union select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIndexId[i].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIndexId[i].p_id);
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
				});
			});

			getReq.on('error', function(e) {
				console.log(e);
			});

			getReq.end();
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
				if(results !== undefined) {
					console.log('success to login');	

					// 得点表作成
					var insertScoreCardSql = 'insert into scoreCard(p_id, m_id, created, place) values(' + connection.escape(results[0].p_id) + ', ' + connection.escape(data.m_id) + ', now(), "ふにっと競技場")';

					connection.query(insertScoreCardSql, function (err, insertScoreCardData) {

						// 得点表データに対応するscoreTotalのrecordをinsertする
						var insertScoreTotalSql = 'insert into scoreTotal(sc_id, p_id, o_id) values(' + insertScoreCardData.insertId + ', ' + connection.escape(results[0].p_id) + ', ' + connection.escape(results[0].o_id) + ');';

						connection.query(insertScoreTotalSql, function(err, insertScoreTotalData) {
							// 得点表のIDをemitする
							console.log('emit insertScoreCard');
							socket.emit('insertScoreCard', {'sc_id': insertScoreCardData.insertId});

							// broadcast scoreCard information: added now

							// 得点表データを抽出するためのSQL文 
							var scoreCardDataSql = 'select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + insertScoreCardData.insertId + ' and account.p_id = ' + connection.escape(results[0].p_id);

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
		});

		// 得点表 作成
		socket.on('insertOwnScoreCard', function(data) {
			console.log('on insertOwnScoreCard');
			console.log(data);

			/* Get p_id related SessionID */

			var addPrefix = require('./addPrefix');

			var id = addPrefix(data.sessionID);
			console.log('id');
			console.log(id);

			var dbName = process.env.COUCHDB_NAME || 'archery-server-sessions';

			// options for connection couchdb
			var options = {
				hostname: process.env.COUCHDB_HOST || '127.0.0.1',
				port: 5984,
				method: 'GET',
				path: '/' + dbName + '/' + id,
				headers: {'Accept': 'application/json'}
			};

			// CouchDBよりSessionに紐付けられたp_idを取得する
			var getReq = http.request(options, function(response) {

				response.setEncoding('utf8');
				response.on('data', function(chunk) {

					// p_idの抽出
					var p_id = JSON.parse(chunk).sess.p_id;
					var o_id = JSON.parse(chunk).sess.o_id;

					console.log('p_id');
					console.log(p_id);

					console.log('o_id');
					console.log(o_id);

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {
						// ユーザーデータの抽出
						var accountSql = 'select * from account where p_id = ' + p_id;
						console.log('accountSql');
						console.log(accountSql);

						connection.query(accountSql, function(err, results) {
							console.log('results of loginSql');
							console.log(results);

							// データが正常に抽出完了
							if(results !== undefined) {
								console.log('success to login');	

								// 得点表作成
								var insertScoreCardSql = 'insert into scoreCard(p_id, m_id, created, place) values(' + connection.escape(results[0].p_id) + ', ' + connection.escape(data.m_id) + ', now(), "ふにっと競技場")';

								connection.query(insertScoreCardSql, function (err, insertScoreCardData) {
									console.log('insertScoreCard results');
									console.log(insertScoreCardData);

									// 得点表データに対応するscoreTotalのrecordをinsertする
									var insertScoreTotalSql = 'insert into scoreTotal(sc_id, p_id, o_id) values(' + insertScoreCardData.insertId + ', ' + connection.escape(results[0].p_id) + ', ' + connection.escape(data.m_id) + ');';

									connection.query(insertScoreTotalSql, function(err, insertScoreTotalData) {

										// 得点表のIDをemitする
										console.log('emit insertScoreCard');
										socket.emit('insertScoreCard', {'sc_id': insertScoreCardData.insertId});

										// broadcast scoreCard information: added now

										// 得点表データを抽出するためのSQL文 
										var scoreCardDataSql = 'select scoreTotal.sc_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + insertScoreCardData.insertId + ' and account.p_id = ' + connection.escape(results[0].p_id);

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
				});
			});

			getReq.on('error', function(e) {
				console.log(e);
			});

			getReq.end();
		});

		// 受け取ったsc_idのpermissionを返すイベント
		socket.on('checkPermission', function(data) {

			// On log
			console.log('on checkPermission');
			console.log(data);

			/* Get p_id related SessionID */

			var addPrefix = require('./addPrefix');

			var id = addPrefix(data.sessionID);

			var dbName = process.env.COUCHDB_NAME || 'archery-server-sessions';

			// options for connection couchdb
			var options = {
				hostname: process.env.COUCHDB_HOST || '127.0.0.1',
				port: 5984,
				method: 'GET',
				path: '/' + dbName + '/' + id,
				headers: {'Accept': 'application/json'}
			};

			// CouchDBよりSessionに紐付けられたp_idを取得する
			var getReq = http.request(options, function(response) {
				response.setEncoding('utf8');
				response.on('data', function(chunk) {

					// p_idの抽出
					var p_id = JSON.parse(chunk).sess.p_id;

					console.log('p_id');
					console.log(p_id);

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {

						// idを抽出するsql文
						var scoreCardIdSql = 'select scoreCard.p_id from `scoreCard` where scoreCard.sc_id = ' + connection.escape(data.sc_id);

						// idを抽出
						connection.query(scoreCardIdSql, function (err, scoreCardIdData) {

							var emitData = {'permission' : scoreCardIdData[0].p_id === p_id ? true : false};

							console.log('checkPermission');
							console.log(emitData);

							socket.emit('checkPermission', emitData);
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						socket.emit('authorizationError');
					}
				});
			});

			getReq.on('error', function(e) {
				console.log(e);
			});

			getReq.end();
		});
	});
};

module.exports = scoreCardIndexModel;