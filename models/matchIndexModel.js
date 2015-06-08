function matchIndexModel(io, connection) {

	io.on('connection', function(socket) {

		console.log('connection matchIndexModel');
		console.log('handshake');
		console.log(JSON.stringify(socket.handshake));	

		// 試合一覧データの取得
		socket.on('extractMatchIndex', function(data){

			// On log
			console.log('on extractMatchIndex');
			
			// 試合一覧のデータを抽出するために使用するidを抽出するためのSQL文
			var matchIndexIdSql = 'select m_id from `match`;';

			// 試合一覧のIDを抽出
			connection.query(matchIndexIdSql, function(err, matchIndexId) {
				console.log('matchIndexId');
				console.log(matchIndexId);
				if(matchIndexId != '') {

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
				}
			});
		});

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
				var insertMatchSql = 'insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length) values(' + connection.escape(data.p_id) + ', ' + connection.escape(organization[0].id) + ', ' + connection.escape(data.matchName) + ', ' + connection.escape(data.sponsor) + ', now(), ' + connection.escape(data.arrows) + ', ' + connection.escape(data.perEnd) + ', ' + connection.escape(data.length) + ');';
				
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
			});
		});
		
	});

};

module.exports = matchIndexModel;