var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();

var loginCheck = function(req, res, next) {

	console.log('bellow is req.session.p_id');

	console.log(req.session.p_id);

	if(req.session.p_id) {
		console.log('success loginCheck with sessionID');

		var checkSession = 'select * from account where p_id = ' + connection.escape(req.session.p_id);

		connection.query(checkSession, function(err, results) {

			console.log('results');
			console.log(Object.keys(results).length);

			console.log('err');
			console.log(err);

			if(Object.keys(results).length !== 0) {
				// アカウントは存在する

				if(req.session.o_id) {
					var checkOrganization = 'select * from organization where o_id = ' + connection.escape(req.session.o_id);

					connection.query(checkOrganization, function(err2, results2) {
						if(Object.keys(results2).length === 0) {
							// 団体に所属していない
							//req.session.o_id = undefined;
						}
					});
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
	res.render('personal');
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