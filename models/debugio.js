function debugio(server) {
  var connection = require('./mysql.js')();
  io = require('socket.io')(server);

	// クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {

  });

};

module.exports = debugio;
