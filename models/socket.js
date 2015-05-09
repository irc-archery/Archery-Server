function socketio(server) {
  var connection = require('./mysql.js')();
  io = require('socket.io')(server);

	// クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {

		// 接続成功時のログ
		console.log('suceess connection');	

		// 試合 作成
		socket.on('insertMatch', function(data) {

			// 作成者が所属している団体のIDを抽出するためのSQL文
			var extractOrganizationId = 'select o_id as id from `organization` where p_id = ' + data.p_id;

			// 団体IDを抽出
			connection.query(extractOrganizationId, function(err, organization) {

				// 試合データを挿入するためのSQL文
				var insertMatchSql = 'insert into `match`(p_id, o_id, matchName, sponsor, created, arrows, perEnd, length) values(' + data.p_id + ', ' + organization[0].id + ', "' + data.matchName + '", "' + data.sponsor + '", now(), ' + data.arrows + ', ' + data.perEnd + ', ' + data.length + ');';
				
				// 試合データを挿入
				connection.query(insertMatchSql, function(err, insertMatchResults) {
					console.log(insertMatchResults);
					console.log(err);
					socket.emit('insertMatch', {'err': err});
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
				var matchIndexDataSql = 'select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + matchIndexId[0].m_id + ' and `scoreCard`.m_id = ' + matchIndexId[0].m_id;
				// 試合の数に応じてselect文を追加
				for (var i = 1; i < matchIndexId.length; i++) {
					matchIndexDataSql += ' union select `match`.m_id, `match`.matchName, `match`.sponsor, `match`.created, `match`.arrows, `match`.perEnd, `match`.length, count(`scoreCard`.sc_id) as players from `match`, `scoreCard` where `match`.m_id = ' + matchIndexId[i].m_id + ' and `scoreCard`.m_id = ' + matchIndexId[i].m_id;
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
			var scoreCardIndexIdSql = 'select scoreCard.sc_id, scoreCard.p_id from scoreCard where scoreCard.m_id = ' + data.m_id;

			// 得点表idを抽出する
			connection.query(scoreCardIndexIdSql, function(err, scoreCardIndexId){

				// 得点表データを抽出するためのSQL文
				var scoreCardIndexDataSql = 'select scoreTotal.sc_id, account.firstName, account.lastName, scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + scoreCardIndexId[0].sc_id + ' and account.p_id = ' + scoreCardIndexId[0].p_id;

				// 得点表の数に応じてselectするSQL文を追加
				for(var i = 1; i < scoreCardIndexId.length; i++){
					scoreCardIndexDataSql += ' union select scoreTotal.sc_id, account.firstName, account.lastName, scoreTotal.total from account, scoreTotal where scoreTotal.sc_id = ' + scoreCardIndexId[i].sc_id + ' and account.p_id = ' + scoreCardIndexId[i].p_id;
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

		// 得点表記入
		socket.on('insertScore', function (data) {
			// 得点表の挿入処理
			connection.query('insert into ', function (err, results) {

			}); 
		});

		// 得点表 取得
  });
	//--- End Socket.IO ---//
};

module.exports = socketio;
