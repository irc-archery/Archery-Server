var http = require('http');
var addPrefix = require('./addPrefix');

function matchIndexModel(io, connection, sessions, ios) {

	io.on('connection', function(socket) {

		console.log('connection matchIndexModel');

		// 試合一覧データの取得
		socket.on('extractMatchIndex', function(data){

			// On log
			console.log('on extractMatchIndex');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					// ユーザーはすでにログイン済み
					if(p_id !== undefined) {

						var matchIndexIdSql = '';

						// ユーザが団体に所属している
						if(o_id !== undefined) {
							// 試合一覧のデータを抽出するために使用するidを抽出するためのSQL文
							matchIndexIdSql = 'select m_id from `match` where ( (`match`.permission = 0) or (`match`.permission = 1 and `match`.o_id = '+ o_id + ') ) and (`match`.status != 1)';
						}

						// 団体に所属していない
						else {
							matchIndexIdSql = 'select m_id from `match` where `match`.permission = 0 and `match`.status != 1';
						}

						// 試合一覧のIDを抽出
						connection.query(matchIndexIdSql, function(err, matchIndexId) {
							if(matchIndexId != '') {

								var matchIndexDataSql = 'select `match`.m_id, `match`.matchName, `match`.sponsor, DATE_FORMAT(`match`.created, "%Y/%m/%d %H:%i:%S") as created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + connection.escape(matchIndexId[0].m_id) + ' and `scoreCard`.m_id = ' + connection.escape(matchIndexId[0].m_id);

								// 試合の数に応じてselect文を追加
								for (var i = 1; i < matchIndexId.length; i++) {
									matchIndexDataSql += ' union select `match`.m_id, `match`.matchName, `match`.sponsor, DATE_FORMAT(`match`.created, "%Y/%m/%d %H:%i:%S") as created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + connection.escape(matchIndexId[i].m_id) + ' and `scoreCard`.m_id = ' + connection.escape(matchIndexId[i].m_id);
								}

								// 試合一覧のデータを抽出
								connection.query(matchIndexDataSql, function (err, matchIndexData) {

									// emit log
									console.log('emit extractMatchIndex');
									console.log(matchIndexData);

									// 試合一覧データをEmit
									socket.emit('extractMatchIndex', matchIndexData);

									// ユーザーが団体に所属していたら
									if(o_id !== undefined) {
										// ユーザーが追加の試合データを受け取れるようにroomにjoinさせる
										socket.join('matchIndexRoom' + o_id);
									}
								});
							}
							else {
								// 参加できる試合は存在しない
								socket.emit('extractMatchIndex', '');
							}
						});
					}
					// ログインしていないユーザーからのアクセス
					else{
						socket.emit('authorizationError');
					}	
				}
			});
		});

		// 試合 作成
		socket.on('insertMatch', function(data) {

			// ON log
			console.log('on insertMatch');
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

						// 試合データを挿入するためのSQL文
						var insertMatchSql = 'insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length, permission) values(' + connection.escape(p_id) + ', ' + connection.escape(o_id) + ', ' + connection.escape(data.matchName) + ', ' + connection.escape(data.sponsor) + ', now(), ' + connection.escape(data.arrows) + ', ' + connection.escape(data.perEnd) + ', ' + connection.escape(data.length) + ', ' + connection.escape(data.permission) + ');';

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

								// 試合のパーミッションはpublic
								if(data.permission == 0){
									// namespace内の送信元以外の全員にemit
									socket.broadcast.emit('broadcastInsertMatch', broadcastInsertMatchData[0]);
								}
								// 試合のパーミッションはlocal
								else if(data.permission == 1) {
									// 同じ団体の人にのみ送る
									socket.broadcast.to('matchIndexRoom' + o_id).emit('broadcastInsertMatch', broadcastInsertMatchData[0]);
								}
							});
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
		socket.on('checkOrganization', function(data) {

			// On log
			console.log('on checkOrganization');
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

						// ユーザーのo_idを抽出
						var checkOrganizationSql = "select o_id from account where p_id = " + connection.escape(p_id);

						// idを抽出
						connection.query(checkOrganizationSql, function (err, checkOrganizationData) {

							console.log('checkOrganizationData');
							console.log(checkOrganizationData);

							var emitData = {'belongs' : checkOrganizationData[0].o_id != null ? true : false};

							console.log('emit checkOrganization');
							console.log(emitData);

							socket.emit('checkOrganization', emitData);
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						socket.emit('authorizationError');
					}
				}
			});
		});
	});
};

module.exports = matchIndexModel;