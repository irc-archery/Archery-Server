function socketio(server) {
  var connection = require('./mysql.js')(); // Catch data from Database and output console connection.query('show tables from archery', function(err, results, fields) {// output results console.log('show tables from archery'); console.log('---results---'); console.log(results); console.log('---result end---'); }); //--- Socket.IO ---// // wakeup socket.io server
  io = require('socket.io')(server);

	// クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {

		// 接続成功時のログ
		console.log('suceess connection');	

		// クライアントに得点表一覧を送信する
		connection.query('select * from `match`;', function(err, results) {
			console.log('emit getIndex');
			socket.emit('getIndex', results);
		});

		// ユーザーにdata.idの得点表のデータを返す
		socket.on('getScoreCard', function(data){
			connection.query('select * from `score` where id = ' + data.id, function(err, results){
				socket.emit('getScoreCard', results);
			});
		});

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
