var express = require('express');
var connection = require('../models/mysql.js')();
var router = express.Router();
var crypto = require('../models/crypto.js');
var packageJson = require('../package.json');

var loginCheck = function(req, res, next) {

	// console.log('bellow is req.session.p_id');
	// console.log(req.session.p_id);

	if(req.session.p_id) {
		// console.log('success loginCheck with sessionID');

		var checkSession = 'select p_id, o_id from account where p_id = ' + connection.escape(req.session.p_id);

		connection.query(checkSession, function(err, results) {

			// console.log('results');
			// console.log(Object.keys(results).length);

			// console.log('err');
			// console.log(err);

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
		// console.log('faild loginCheck with sessionID. redirect login form');
		req.session.p_id = undefined;
		req.session.o_id = undefined;
		res.redirect('/login');
	}
};

var mIdCheck = function(req, res, next) {

	//req.session.p_idのユーザーがreq.query.m_idに参加できるかどうかチェック
	// 参加できれば、ren.render, できなければ res.redirect /matchIndex

	// ユーザーが参加しようとしている試合id
	var m_id = req.query.m_id;
	// console.log('m_id');
	// console.log(m_id);

	// m_idのオプションが存在しないGET
	if(m_id == undefined) {
		// 不正なGETなのでリダイレクト
		res.redirect('/matchIndex');
	}
	else {
		// ユーザーが所属している団体のo_id
		var o_id = req.session.o_id;

		// この試合にユーザーが参加できるかどうか確かめるためのSQL文
		var matchIndexIdSql = '';

		// ユーザが団体に所属している
		if(o_id !== undefined) {
			matchIndexIdSql = 'select m_id from `match` where (m_id = ' + m_id + ') and ( (`match`.permission = 0) or (`match`.permission = 1 and `match`.o_id = '+ o_id + ') )';
		}

		// 団体に所属していない
		else {
			matchIndexIdSql = 'select m_id from `match` where (`match`.m_id = ' + m_id + ') and (`match`.permission = 0)';
		}

		// データを抽出
		connection.query(matchIndexIdSql, function(err, matchIndexId) {

			// データが存在する ∴ そのユーザーは試合に参加できる
			if(matchIndexId != '') {
				// レンダリング
				next();
			}
			// データが存在しない ∴ そのユーザーは試合に参加できない
			else {
				// 試合一覧にリダイレクトする
				res.redirect('/matchIndex');
			}
		});
	}
};

//ホーム (マイページ)
router.get('/', loginCheck, function(req, res) {
	res.redirect('/personal');
});

// ログイン画面
router.get('/login', function(req, res, next) {
	// console.log('bellow is req.session.p_id');
	// console.log(req.session.p_id);

	var errFlash;

	if(req.session.err) {
		errFlash = req.session.err;
		req.session.err = null;
	}
	else {
		errFlash = null;
	}

	// すでにログイン済み
	if(req.session.p_id) {
		// console.log('already logged in ')
		res.redirect('/personal');
	}
	else {
	    res.render('login', {version: packageJson.version, 'err': errFlash});
	}
});

// ユーザー作成画面
router.get('/createAccount', function(req, res) {
	res.render('createAccount');
});

/* Web Socket */

// 試合一覧画面
router.get('/matchIndex', loginCheck, function(req, res, next) {
	res.render('matchIndex');
});

// 試合作成画面
router.get('/insertMatch', loginCheck, function(req, res, next) {
	res.render('insertMatch');
});

// 得点表一覧
router.get('/scoreCardIndex', loginCheck, mIdCheck, function(req, res) {
	res.render('scoreCardIndex', req.query);
});

// 得点表作成画面
router.get('/insertScoreCard', loginCheck, mIdCheck, function(req, res) {
	res.render('insertScoreCard');
});

// 得点表画面
router.get('/scoreCard', loginCheck, mIdCheck, function(req, res) {
	res.render('scoreCard');
});

// ランキング画面
router.get('/rankingIndex', loginCheck, mIdCheck, function(req, res) {
	res.render('rankingIndex');
});

// browser用のログイン処理
router.post('/login', function(req, res) {
	// console.log('post /login');
	// console.log(req.body);

	var loginSql = 'select * from account where email = ' + connection.escape(req.body.email);
	// console.log('loginSql');
	// console.log(loginSql);

	connection.query(loginSql, function(err, results) {
		if(!err) {

			// console.log('results of loginSql');
			// console.log(results);

			// ログイン成功
			if(Object.keys(results).length !== 0) {
				// console.log('try to decryption');

				try{

					if(crypto.decryption(results[0].password) === req.body.password) {
						// console.log('success to login');
						req.session.p_id = results[0].p_id;
						req.session.o_id = results[0].o_id;
						res.redirect('/personal');
					}
					else {
						// console.log('faild to login');
						req.session.err = "ログイン名が存在しないか、パスワードが間違っているためログインできませんでした。";
						res.redirect('/login');
					}
				} catch(e) {

					// console.log('on catch index.js 200 line. maybe crypto method cause it.(hashedPassword is diff)');

					req.session.err = "エラーが発生しました。(ErrCode 500:01) 再度ログインしても直らない場合はこのシステムの管理者まで連絡していただけると幸いです。";
					res.redirect('/login');
				}
			}
			// ログイン失敗
			else {
				// console.log('faild to login');
				req.session.err = "ログイン名が存在しないか、パスワードが間違っているためログインできませんでした。";
				res.redirect('/login');
			}
		}
		else {
			// console.log(err);
		}
	});
});

router.get('/logout', function(req, res) {
	req.session.destroy();
	// console.log('deleted session');
	res.redirect('/');
});

module.exports = router;
