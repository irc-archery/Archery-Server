var express = require('express');
var router = express.Router();

router.get('/createAccount', function(req, res){

	console.log('req.body');
	console.log(req.body);

});

module.exports = router;