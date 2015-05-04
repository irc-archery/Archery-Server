function socketio(server) {
  var connection = require('./mysql.js')(); // Catch data from Database and output console connection.query('show tables from archery', function(err, results, fields) {// output results console.log('show tables from archery'); console.log('---results---'); console.log(results); console.log('---result end---'); }); //--- Socket.IO ---// // wakeup socket.io server
  io = require('socket.io')(server);

	// クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {

		// 接続成功時のログ
		console.log('suceess connection');	

		// 試合 一覧取得
		socket.on('extractMatchIndex', function(data){
			console.log('emit extractMatchIndex verfnit');

			connection.query('select m_id, matchName, length from `match`;', function(err, results){
				console.log('output resutls of extractMatchIndex');
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

			connection.query('select scoreCard.sc_id, scoreCard.scoreTotal, score.sum from scoreCard, score where scoreCard.sc_idscore.sc_id', function(err, results){

			});

			//socket.emit('extractScoreCardIndex');
		});

		// ユーザーにdata.idの得点表のデータを返す
		socket.on('getScoreCard', function(data){
			connection.query('select * from `score` where id = ' + data.id, function(err, results){socket.emit('getScoreCard', results); }); });
		// 得点表記入
		socket.on('postScore', function (data) {
			// 得点表の挿入処理
			connection.query('insert into ', function (err, results) {

			}); 
		});
  });
	//--- End Socket.IO ---//
};

module.exports = socketio;
