//--- MySQL ---//

function mySql(){
	var mysql = require('mysql');

	// connect mysql data base 
	return mysql.createConnection({
		host: process.env.mysql_host || 'localhost',
		user : process.env.mysql_user || 'user_name',
		password: process.env.mysql_pass || 'user_password',
		database: process.env.mysql_db || 'db_name'
	});
}

//--- End MySQL ---//

module.exports = mySql;