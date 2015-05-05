function socketio(server) {
  var connection = require('./mysql.js')();
  io = require('socket.io')(server);

	// クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {

		// 接続成功時のログ
		console.log('suceess connection');	

		// 試合 一覧取得
		socket.on('extractMatchIndex', function(data){

			console.log('on extractMatchIndex');

			connection.query('select m_id, matchName, length from `match`;', function(err, results){
				console.log('emit extractMatchIndex');
				console.log(results);
				socket.emit('extractMatchIndex', results);
			});
		});

		// 試合 参加
		socket.on('joinMatch', function(data){
			var result = false;
			//socket.join('');

			socket.emit('joinMatch', {result: result})
		});

		//  得点表 一覧取得
		socket.on('extractScoreCardIndex', function(data){
			console.log('on extractScoreCardIndex');
			console.log(data);

			// sql syntax for extract index id
			var matchIndexIdSql = 'select scoreCard.sc_id, scoreCard.p_id from scoreCard where scoreCard.m_id = ' + data.m_id;

			// extract id used to index
			connection.query(matchIndexIdSql, function(err, matchIndexId){

				var matchIndexDataSql = 'select score.sc_id, account.firstName, account.lastName, score.scoreTotal from account, score where score.sc_id = ' + matchIndexId[0].sc_id + ' and account.p_id = ' + matchIndexId[0].p_id;

				for(var i = 1; i < matchIndexId.length; i++){
					matchIndexDataSql += ' union select score.sc_id, account.firstName, account.lastName, score.scoreTotal from account, score where score.sc_id = ' + matchIndexId[i].sc_id + ' and account.p_id = ' + matchIndexId[i].p_id;
				}

				connection.query(matchIndexDataSql, function(err, matchIndexData){
					console.log('emit : extractMatchIndex');
					console.log(matchIndexData);
					socket.emit('extractScoreCardIndex', matchIndexData);
				});
			});
		});

		// ユーザーにdata.idの得点表のデータを返す
		socket.on('extractScoreCard', function(data){
			connection.query('select * from `score` where id = ' + data.id, function(err, results){socket.emit('getScoreCard', results); }); });
		// 得点表記入
		socket.on('insertScore', function (data) {
			// 得点表の挿入処理
			connection.query('insert into ', function (err, results) {

			}); 
		});
  });
	//--- End Socket.IO ---//
};

module.exports = socketio;
