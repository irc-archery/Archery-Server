var crypto = require('crypto');

var password = process.env.HASH_PASSWORD || 'hashPassword';

var Crypto = {

	// 暗号化
	encryption: function(plane) {

		var cipher = crypto.createCipher('aes192', password);
		cipher.update(plane, 'utf8', 'hex');

		return cipher.final('hex');
	},

	// 復号化
	decryption: function(cipherd) {

		var decipher = crypto.createDecipher('aes192', password);
		decipher.update(cipherd, 'hex', 'utf8');

		return decipher.final('utf8');
	}
};

module.exports = Crypto;