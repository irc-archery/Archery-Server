var http = require('http');

function matchIndexModel(io, connection) {

	io.on('connection', function(socket) {

		console.log('connection matchIndexModel');

		// 試合一覧データの取得
		socket.on('extractMatchIndex', function(data){

			// On log
			console.log('on extractMatchIndex');
			console.log(data);

			/* Get p_id related SessionID */

			var addPrefix = require('./addPrefix');

			var id = addPrefix(data.sessionID);
			console.log('id');
			console.log(id);

			var dbName = process.env.COUCHDB_NAME || 'archery-server-sessions';

			// options for connection couchdb
			var options = {
				hostname: process.env.OUCHDB_HOST || '127.0.0.1',
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
					// o_idの抽出
					var o_id = JSON.parse(chunk).sess.o_id;

					console.log('p_id');
					console.log(p_id);

					console.log('o_id');
					console.log(o_id);

					// ユーザーはすでにログイン済み
					if(p_id !== undefined) {

						var matchIndexIdSql = '';

						// ユーザが団体に所属している
						if(o_id !== undefined) {
							// 試合一覧のデータを抽出するために使用するidを抽出するためのSQL文
							matchIndexIdSql = 'select m_id from `match` where ( (`match`.permission = 0) or (`match`.permission = 1 and `match`.o_id = '+ o_id + ') )';
						}

						// 団体に所属していない
						else {
							matchIndexIdSql = 'select m_id from `match` where `match`.permission = 0';
						}

						console.log('matchIndexIdSql');
						console.log(matchIndexIdSql);

						// 試合一覧のIDを抽出
						connection.query(matchIndexIdSql, function(err, matchIndexId) {
							if(matchIndexId != '') {

								var matchIndexDataSql = 'select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + connection.escape(matchIndexId[0].m_id) + ' and `scoreCard`.m_id = ' + connection.escape(matchIndexId[0].m_id);

								// 試合の数に応じてselect文を追加
								for (var i = 1; i < matchIndexId.length; i++) {
									matchIndexDataSql += ' union select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + connection.escape(matchIndexId[i].m_id) + ' and `scoreCard`.m_id = ' + connection.escape(matchIndexId[i].m_id);
								}

								console.log('matchIndexDataSql');
								console.log(matchIndexDataSql);

								// 試合一覧のデータを抽出
								connection.query(matchIndexDataSql, function (err, matchIndexData) {

									// emit log
									console.log('emit extractMatchIndex');
									console.log(matchIndexData);

									// 試合一覧データをEmit
									socket.emit('extractMatchIndex', matchIndexData);
								});
							}
						});
					}
					// ログインしていないユーザーからのアクセス
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

		// 試合 作成
		socket.on('insertMatch', function(data) {

			// ON log
			console.log('on insertMatch');
			console.log(data);

			/* Get p_id related SessionID */

			var addPrefix = require('./addPrefix');

			var id = addPrefix(data.sessionID);
			console.log('id');
			console.log(id);

			var dbName = process.env.COUCHDB_NAME || 'archery-server-sessions';

			// options for connection couchdb
			var options = {
				hostname: '127.0.0.1',
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

						// 試合データを挿入するためのSQL文
						var insertMatchSql = 'insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length, permission) values(' + connection.escape(p_id) + ', ' + connection.escape(o_id) + ', ' + connection.escape(data.matchName) + ', ' + connection.escape(data.sponsor) + ', now(), ' + connection.escape(data.arrows) + ', ' + connection.escape(data.perEnd) + ', ' + connection.escape(data.length) + ', ' + connection.escape(data.permission) + ');';

						console.log(insertMatchSql);
						
						// 試合データを挿入
						connection.query(insertMatchSql, function(err, insertMatchResults) {

							// output results 
							console.log('connection.query insertMatch results');
							console.log(insertMatchResults);

							// output err
							console.log('connection.query insertMatch err');
							console.log(err);

							// 作成された試合のm_idをemit
							console.log('emit insertMatch');
							console.log(insertMatchResults.insertId);

							socket.emit('insertMatch', {'m_id': insertMatchResults.insertId});

							// 作成された試合データをbroadcast.emit
							var broadcastInsertMatchSql  = 'select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + insertMatchResults.insertId  + ' and `scoreCard`.m_id = ' + insertMatchResults.insertId;

							connection.query(broadcastInsertMatchSql , function(err, broadcastInsertMatchData) {

								// Emit log
								console.log('broadcastInsertMatchData');
								console.log(broadcastInsertMatchData[0]);

								// namespace内の送信元以外の全員にemit
								socket.broadcast.emit('broadcastInsertMatch', broadcastInsertMatchData[0]);
							});
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

module.exports = matchIndexModel;