// the function for get document from couchdb identified dbname and sessionID
module.exports = function(sessionID) {

	// セッションIDを格納
	var id = decodeURIComponent(sessionID);

	// Cookie用のprefixを取り除く (%3A deencode :)
	var cookiePrefix = 'sessionID=s:';
	id = id.slice(id.indexOf(cookiePrefix) + cookiePrefix.length);

	// Cookie用のsuffixを取り除く
	id = id.substr(0, id.indexOf('.'));

	// Session用のprefix
	var prefix = 'connect-session_';

	// Session用のprefixを付加
	id = encodeURIComponent(decodeURIComponent(id.substr(0, prefix.length) === prefix ? '' : prefix) + id);

	return id;
};
