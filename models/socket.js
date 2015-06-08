function socketio(server) {

  // データベース接続
  var connection = require('./mysql.js')();

  // socket.ioサーバの立ち上げ
  io = require('socket.io')(server);

  // namespace毎に処理を切り分け
  //var index = require('./indexModel.js')(io.of('/'));
  var matchIndex = require('./matchIndexModel.js')(io.of('/matchIndex'), connection);
  var scoreCardIndex = require('./scoreCardIndexModel.js')(io.of('/scoreCardIndex'), connection);
  var scoreCard = require('./scoreCardModel.js')(io.of('/scoreCard'), connection);
  var debug = require('./debug.js')(io.of('/debug'), connection);

  // クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {
		// 接続成功時のログ
		console.log('suceess connection');	
  });
};

module.exports = socketio;
