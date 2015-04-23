function mySql() {
	var mysql = require('mysql');

	return mysql.createConnection({
		host: process.env.MYSQL_HOST || 'localhost',
		user : process.env.MYSQL_USER || 'archery_user',
		password: process.env.MYSQL_PASS || 'archery_password',
		database: process.env.MYSQL_DB || 'archery'
	});
}

module.exports = mySql;