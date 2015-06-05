function matchIndexModel(io, connection) {
	console.log("we are now matchIndexModel")

	io.on('connection', function(socket) {

		console.log('connection matchIndexModel');

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
	});

};

module.exports = matchIndexModel;