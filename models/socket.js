function socketio(server) {
  var connection = require('./mysql.js')();
  io = require('socket.io')(server);

	// クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {

		// 接続成功時のログ
		console.log('suceess connection');	

		// 試合 作成
		socket.on('insertMatch', function(data) {

			// ON log
			console.log('on insertMatch');
			console.log(data);

			// 作成者が所属している団体のIDを抽出するためのSQL文
			var extractOrganizationId = 'select o_id as id from `organization` where p_id = ' + connection.escape(data.p_id);

			// 団体IDを抽出
			connection.query(extractOrganizationId, function(err, organization) {

				// 試合データを挿入するためのSQL文
				var insertMatchSql = 'insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length) values(' + connection.escape(data.p_id) + ', ' + connection.escape(organization[0].id) + ', "' + connection.escape(data.matchName) + '", "' + connection.escape(data.sponsor) + '", now(), ' + connection.escape(data.arrows) + ', ' + connection.escape(data.perEnd) + ', ' + connection.escape(data.length) + ');';
				
				// 試合データを挿入
				connection.query(insertMatchSql, function(err, insertMatchResults) {

					// output results 
					console.log('connection.query insertMatch results');
					console.log(insertMatchResults);

					// output err
					console.log('connection.query insertMatch err');
					console.log(err);

					var broadcastInsertMatchSql  = 'select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + insertMatchResults.insertId  + ' and `scoreCard`.m_id = ' + insertMatchResults.insertId;

					connection.query(broadcastInsertMatchSql , function(err, broadcastInsertMatchData) {

						// Emit log
						console.log('broadcastInsertMatchData');
						console.log(broadcastInsertMatchData[0]);

						// Emit
						socket.emit('broadcastInsertMatch', broadcastInsertMatchData[0]);
					});
				});
			});
		});

		// 試合 一覧取得
		socket.on('extractMatchIndex', function(data){

			// On log
			console.log('on extractMatchIndex');

			// 試合一覧のデータを抽出するために使用するidを抽出するためのSQL文
			var matchIndexIdSql = 'select m_id from `match`;';

			// 試合一覧のIDを抽出
			connection.query(matchIndexIdSql, function(err, matchIndexId) {

				// 試合一覧のデータを抽出するSQL文
				var matchIndexDataSql = 'select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + connection.escape(matchIndexId[0].m_id) + ' and `scoreCard`.m_id = ' + connection.escape(matchIndexId[0].m_id);

				// 試合の数に応じてselect文を追加
				for (var i = 1; i < matchIndexId.length; i++) {
					matchIndexDataSql += ' union select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + connection.escape(matchIndexId[i].m_id) + ' and `scoreCard`.m_id = ' + connection.escape(matchIndexId[i].m_id);
				}

				// 試合一覧のデータを抽出
				connection.query(matchIndexDataSql, function (err, matchIndexData) {

					// emit log
					console.log('emit extractMatchIndex');
					console.log(matchIndexData);

					// 試合一覧データをEmit
					socket.emit('extractMatchIndex', matchIndexData);
				});
			});
		});

		// 試合 参加
		socket.on('joinMatch', function(data){
			var result = false;
			//socket.join('');

			socket.emit('joinMatch', {result: result})
		});

		// 得点表 作成
		socket.on('insertScoreCard', function(data) {
			console.log('on insertScoreCard');
			console.log(data);

			//connection.query
		});

		//  得点表 一覧取得
		socket.on('extractScoreCardIndex', function(data) {

			// On log
			console.log('on extractScoreCardIndex');
			console.log(data);

			// 得点表のid抽出に使用するSQL文
			var scoreCardIndexIdSql = 'select scoreCard.sc_id, scoreCard.p_id from scoreCard where scoreCard.m_id = ' + connection.escape(data.m_id);

			// 得点表idを抽出する
			connection.query(scoreCardIndexIdSql, function(err, scoreCardIndexId){

				// 得点表データを抽出するためのSQL文
				var scoreCardIndexDataSql = 'select scoreTotal.sc_id, account.firstName, account.lastName, scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIndexId[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIndexId[0].p_id);

				// 得点表の数に応じてselectするSQL文を追加
				for(var i = 1; i < scoreCardIndexId.length; i++){
					scoreCardIndexDataSql += ' union select scoreTotal.sc_id, account.firstName, account.lastName, scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + connection.escape(scoreCardIndexId[i].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIndexId[i].p_id);
				}

				// 構築した得点表データ抽出のSQL文でデータ抽出
				connection.query(scoreCardIndexDataSql, function(err, scoreCardIndexData){

					// Emit log
					console.log('emit : extractScoreCardIndex');
					console.log(scoreCardIndexData);

					// 得点表一覧をEmit
					socket.emit('extractScoreCardIndex', scoreCardIndexData);
				});
			});
		});

		// 得点表の抽出
		socket.on('extractScoreCard', function(data) {

			// On log
			console.log('on extractScoreCard');
			console.log(data);

			// 得点表データの抽出に使用するIDを抽出するSQL文
			var scoreCardIdSql = 'select scoreCard.sc_id, scoreCard.p_id, scoreCard.m_id from `scoreCard` where scoreCard.sc_id = ' + connection.escape(data.sc_id);

			// IDを抽出
			connection.query(scoreCardIdSql, function (err, scoreCardIdData) {

				console.log('scoreCardIdData');
				console.log(scoreCardIdData);

				// 得点表データの抽出を行うSQL文
				var scoreCardSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, `match`.length, count(spe_id) as countPerEnd, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scoreCard`, `account`, `match`, `scoreTotal`, `scorePerEnd` where scoreCard.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and account.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and `match`.m_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and scorePerEnd.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' and scoreTotal.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scoreTotal.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ';';

				// 得点データの抽出を行うSQL文
				var scorePerEndSql = 'select scorePerEnd.score_1, scorePerEnd.score_2, scorePerEnd.score_3, scorePerEnd.score_4, scorePerEnd.score_5, scorePerEnd.score_6, scorePerEnd.updatedScore_1, scorePerEnd.updatedScore_2, scorePerEnd.updatedScore_3, scorePerEnd.updatedScore_4, scorePerEnd.updatedScore_5, scorePerEnd.updatedScore_6, scorePerEnd.subTotal, scorePerEnd.perEnd from `scorePerEnd` where scorePerEnd.sc_id = ' + connection.escape(scoreCardIdData[0].sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(scoreCardIdData[0].p_id) + ' order by scorePerEnd.perEnd asc;';

				// 得点表データの抽出
				connection.query(scoreCardSql, function (err, scoreCardData) {
					// 得点データの抽出
					connection.query(scorePerEndSql, function (err, scorePerEndData) {

						// ２つのSQL文の結果を結合
						scoreCardData[0]['score'] = scorePerEndData;

						// Emit log
						console.log('emit : extractScoreCard');
						console.log(scoreCardData[0]);

						// 得点表データのEmit
						socket.emit('extractScoreCard', scoreCardData[0]);
					});
				});
			});
		});

		// 得点表記入
		socket.on('insertScore', function (data) {

			// On log
			console.log('on insertScore');
			console.log(data);

			// 得点を挿入するためのSQL文
			var insertScoreSql = 'insert into `scorePerEnd`(sc_id, p_id, o_id, perEnd, score_1, score_2, score_3, score_4, score_5, score_6, subTotal) values(' + connection.escape(data.sc_id) + ', ' + connection.escape(data.p_id) + ', (select o_id from `organization` where p_id = ' + connection.escape(data.p_id) + '), ' + connection.escape(data.perEnd) + ', ' + connection.escape(data.score_1) + ', ' + connection.escape(data.score_2) + ', ' + connection.escape(data.score_3) + ', ' + connection.escape(data.score_4) + ', ' + connection.escape(data.score_5) + ', ' + connection.escape(data.score_6) + ', ' + connection.escape(data.subTotal) + ');';

			// 得点合計を更新するためのSQL文
			var updateScoreTotalSql = 'update `scoreTotal` set ten = ' + connection.escape(data.ten) + ', x = ' + connection.escape(data.x) + ', total = ' + connection.escape(data.total) + ' where sc_id = ' + connection.escape(data.sc_id) + ' and p_id = ' + connection.escape(data.p_id);

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
					var broadcastInsertScoreSql = 'select scorePerEnd.sc_id, scorePerEnd.p_id, scorePerEnd.perEnd, scorePerEnd.score_1, scorePerEnd.score_2, scorePerEnd.score_3, scorePerEnd.score_4, scorePerEnd.score_5, scorePerEnd.score_6, scorePerEnd.subTotal, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scorePerEnd`, `scoreTotal` where scorePerEnd.sc_id = ' + connection.escape(data.sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(data.p_id) + ' and scorePerEnd.perEnd = ' + connection.escape(data.perEnd) + ' and scoreTotal.sc_id = ' + connection.escape(data.sc_id) + ' and scoreTotal.p_id = ' + connection.escape(data.p_id) + ';';

					// broadcast Emit		
					connection.query(broadcastInsertScoreSql, function (err, broadcastInsertScoreData) {

						console.log('Emit : broadcastInsertScoreData');
						console.log(broadcastInsertScoreData[0]);

						socket.broadcast.emit('broadcastInsertScore', broadcastInsertScoreData[0]);
					});
				});
			}); 

		});
	
		// 得点表修正
		socket.on('updateScore', function (data) {

			// On log
			console.log('on updateScore');
			console.log(data);

			// 得点を挿入するためのSQL文
			var updateScoreSql = 'update `scorePerEnd` set';

			for(var i = 1; i <= 6; i++){
				if( 'updatedScore_' + i in data ) {
					updateScoreSql += ' updatedScore_' + i + ' = ' + connection.escape(data['updatedScore_' + i]) + ',';
				}
			}

			// where文を追加
			updateScoreSql += ' subTotal = ' + connection.escape(data.subTotal) + ' where sc_id = ' + connection.escape(data.sc_id) + ' and p_id = ' + connection.escape(data.p_id) + ';';

			// 得点合計を更新するためのSQL文
			var updateScoreTotalSql = 'update `scoreTotal` set ten = ' + connection.escape(data.ten) + ', x = ' + connection.escape(data.x) + ', total = ' + connection.escape(data.total) + ' where sc_id = ' + connection.escape(data.sc_id) + ' and p_id = ' + connection.escape(data.p_id);

			console.log('updateScoreSql');
			console.log(updateScoreSql);

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

					broadcastUpdateScoreSql += ' scorePerEnd.subTotal, scoreTotal.ten, scoreTotal.x, scoreTotal.total from `scorePerEnd`, `scoreTotal` where scorePerEnd.sc_id = ' + connection.escape(data.sc_id) + ' and scorePerEnd.p_id = ' + connection.escape(data.p_id) + ' and scorePerEnd.perEnd = ' + connection.escape(data.perEnd) + ' and scoreTotal.sc_id = ' + connection.escape(data.sc_id) + ' and scoreTotal.p_id = ' + connection.escape(data.p_id) + ';';

					connection.query(broadcastUpdateScoreSql, function(err, broadcastUpdateScoreData) {

						// Emit log
						console.log('Emit : broadcastUpdateScore');
						console.log(broadcastUpdateScoreData[0]);

						socket.broadcast.emit('broadcastUpdateScore', broadcastUpdateScoreData[0]);
					});
				});
			}); 
		});

		// 得点表 取得
  });
	//--- End Socket.IO ---//
};

module.exports = socketio;
