function mySql() {
	var mysql = require('mysql');

	return mysql.createConnection({
		host: process.env.MYSQL_HOST || 'localhost',
		user : process.env.MYSQL_USER || 'user_name',
		password: process.env.MYSQL_PASS || 'user_password',
		database: process.env.MYSQL_DB || 'db_name'
	});
}

module.exports = mySql;