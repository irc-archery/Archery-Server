var http = require('http');

function debug(io, connection) {

	io.on('connection', function(socket) {

		console.log('connection debug');
		console.log('handshake');
		console.log(JSON.stringify(socket.handshake));	

		// the event for debug
		socket.on('extractAllScore', function(data) {
			var extractAllScoreSql = 'select * from scorePerEnd;';
			connection.query(extractAllScoreSql, function(err, results) {
				socket.emit('extractAllScore', results);
			});
		});

		// the event for debug
		socket.on('extractAllScoreTotal', function(data) {
			var extractAllScoreTotalSql = 'select * from scoreTotal';
			connection.query(extractAllScoreTotalSql, function(err, results) {
				socket.emit('extractAllScoreTotal', results);
			});
		});

		// the event for debug
		socket.on('extractAccountTable', function(data) {
			var extractAccountTableSql = 'select * from account';
			connection.query(extractAccountTableSql, function(err, results) {
				socket.emit('extractAccountTable', results);
			});
		});

		socket.on('extractOrganizationTable', function(data) {
			var extractOrganizationTableSql = 'select * from organization';
			connection.query(extractOrganizationTableSql, function(err, results) {
				socket.emit('extractOrganizationTable', results);
			});
		});

		socket.on('extractScoreCardTable', function(data) {
			var extractScoreCardTableSql = 'select * from scoreCard';
			connection.query(extractScoreCardTableSql, function(err, results) {
				socket.emit('extractScoreCardTable', results);
			});
		});

		socket.on('extractMatchTable', function(data) {
			var extractMatchTableSql = 'select * from `match`';
			connection.query(extractMatchTableSql, function(err, results) {
				socket.emit('extractMatchTable', results);
			});
		});
	});
};

module.exports = debug;