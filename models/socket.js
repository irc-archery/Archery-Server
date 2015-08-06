function socketio(server) {

  // データベース接続
  var connection = require('./mysql.js')();
  var nano = require('nano')('http://' + (process.env.COUCHDB_HOST || '127.0.0.1' ) + ':5984');
  var sessions = nano.db.use(process.env.COUCHDB_NAME || 'archery-server-sessions');

  // socket.ioサーバの立ち上げ
  io = require('socket.io')(server);

  // namespace毎に処理を切り分け
  var matchIndex = require('./matchIndexModel.js')(io.of('/matchIndex'), connection, sessions, io);
  var scoreCardIndex = require('./scoreCardIndexModel.js')(io.of('/scoreCardIndex'), connection, sessions, io);
  var scoreCard = require('./scoreCardModel.js')(io.of('/scoreCard'), connection, sessions, io);

  // クライアントとの接続が確立
  io.sockets.on('connection', function(socket) {
		// 接続成功時のログ
		console.log('suceess connection');	
  });
};

module.exports = socketio;
