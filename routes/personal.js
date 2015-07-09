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

// get /personal/ 
router.get('/', loginCheck, function(req, res) {
	// マイページ画面の出力
	res.send('<h1>Welcome to My Page</h1><p><a href="/matchIndex">matchIndex</a></p><p><a href="/organization">organization</a></p>');
});

// delete /personal/
router.delete('/', loginCheck, function(req, res) {
	// sessionで参照できるアカウントを削除

	res.send('delete /personal/');
});

// get /personal/record/
router.get('/record', loginCheck, function(req, res) {
	// 過去の得点表一覧画面

	res.send('get /personal/record/');
});

// get /personal/record/:id
router.get('/record/:id', loginCheck, function(req, res) {
	// :idの得点表画面

	res.send('get /record/' + req.params.id);
});


router.delete('/record/:id', loginCheck, function(req, res) {
	// :idの得点表削除API
	res.send('delete /record/' + req.params.id);
});

module.exports = router;