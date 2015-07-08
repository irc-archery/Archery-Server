var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

var loginCheck = function(req, res, next) {

	console.log('bellow is req.session.p_id');
	console.log(req.session.p_id);
	if(req.session.p_id) {
		console.log('success loginCheck with sessionID');
		next();
	}
	else {
		console.log('faild loginCheck with sessionID. redirect login form');
		res.redirect('/login');
	}
};

// get /organization/ 
router.get('/', loginCheck, function(req, res) {
	// 団体画面の出力
	res.send('get /organization/');

});

// post /organization/
router.post('/', loginCheck, function(req, res) {
	// 団体作成
	res.send('post /organization/');
});

// delete /organization/:id
router.delete('/:id', loginCheck, function(req, res) {
	// :idの団体の削除

	console.log(':id');
	console.log(req.params.id);
});

// get /organization/members
router.get('/members', loginCheck, function(req, res) {
	// メンバー管理画面

	res.send('get /organization/members')

});

router.post('/members', loginCheck, function(req, res) {
	// メンバー追加API
});

router.delete('/members/:id', loginCheck, function(req, res) {
	// :idのメンバーを団体から脱退させる
});

module.exports = router;