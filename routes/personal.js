var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();
var packageJson = require('../package.json');

var loginCheck = function(req, res, next) {

	console.log('bellow is req.session.p_id');
	console.log(req.session.p_id);

	if(req.session.p_id) {
		console.log('success loginCheck with sessionID');

		var checkSession = 'select p_id, o_id from account where p_id = ' + connection.escape(req.session.p_id);

		connection.query(checkSession, function(err, results) {

			console.log('results');
			console.log(Object.keys(results).length);

			console.log('err');
			console.log(err);

			if(Object.keys(results).length !== 0) {
				// アカウントは存在する

				if(req.session.o_id) {

					// sessionに保存されているo_idとdbに保存されているo_idの整合性を確かめる
					if(results[0].o_id != req.session.o_id) {
						req.session.o_id = undefined;
					}
				}
				else {
					if(results[0].o_id) {
						// 団体に所属しているのにもかかわらず、sessionに保存されていない... So, save the o_id on session store
						req.session.o_id = results[0].o_id;	
					}		
				}
				
				next();
			}
			else {
				// アカウントは存在しない
				faild();
			}
		});

	}
	else {
		faild();
	}

	function faild() {
		console.log('faild loginCheck with sessionID. redirect login form');
		req.session.p_id = undefined;
		req.session.o_id = undefined;
		res.redirect('/login');
	}
};

// get /personal/ 
router.get('/', loginCheck, function(req, res) {
	// マイページ画面の出力
	res.render('personal', {version: packageJson.version});
});

// get /personal/record/
router.get('/recordIndex', loginCheck, function(req, res) {
	// 過去の得点表一覧画面
	res.render('recordIndex');
});

// get /personal/record/:id
router.get('/record/', loginCheck, function(req, res) {
	// :idの得点表画面
	res.render('record');
});

module.exports = router;