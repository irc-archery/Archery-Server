function socketio(server) {

	var connection = require('./mysql.js')();
    
	// Catch data from Database and output console
	connection.query('show tables from archery', function(err, results, fields) {
		// output results		
		console.log('Connection Test to MySQL in socket.js');
		console.log('---results---');
		console.log(results);
		console.log('---result end---');
	});
    
	//--- Socket.IO ---//
	// wakeup socket.io server
	io = require('socket.io')(server);

	// クライアントとの接続が確立
	io.sockets.on('connection', function(socket) {

		socket.emit('init',  "nya");
	
		// クライアントに得点表一覧を送信する
		connection.query('select * from `match`;', function(err, results) {
			socket.emit('getIndex', results);
		});
	});
	//--- End Socket.IO ---//
};
module.exports = socketio;
