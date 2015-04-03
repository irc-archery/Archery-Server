function socketio(server) {
    
	//--- MySQL ---//
	connection = require('./mysql.js')();
	// Catch data from Database and output console
	connection.query('select * from messages', function(err, results, fields) {
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
	});
	//--- End Socket.IO ---//
};
module.exports = socketio;