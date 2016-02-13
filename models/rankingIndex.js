var http = require('http');
var addPrefix = require('./addPrefix');
var crypto = require('../models/crypto.js');

// websocketにて、/scoreCardIndexにアクセスされた時の処理
function rankingIndexModel(io, connection, sessions, ios) {

	io.on('connection', function(socket) {

		console.log('connection rankingIndex');

		// ランキング一覧を返すイベント
		// client side emit like 
		// socket.emit(eventName, {'m_id': getQueryString().m_id, 'sessionID': document.cookie});
		socket.on('extractTotalRankingIndex', function(data) {

			// On log
			console.log('on extractTotalRankingIndex');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
 
					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					if(p_id !== undefined) {

						// 試合に参加
						socket.join('scoreCardIndexRoom' + data.m_id);

						// 送られてきたm_idに所属している得点表データを抽出するSQL文
						var totalRankingSql = 'select scoreCard.sc_id, scoreCard.p_id, concat(account.lastName, account.firstName) as playerName, scoreTotal.total from scoreCard, scoreTotal, account where scoreCard.m_id = ' + connection.escape(data.m_id) + ' and scoreCard.sc_id = scoreTotal.sc_id and scoreCard.p_id = account.p_id';

						// 得点表データを抽出
						connection.query(totalRankingSql, function(totalRankingErr, totalRankingData) {

							if(!totalRankingErr) {

								// 抽出したデータ
								console.log('totalRankingData');
								console.log(totalRankingData);

								var responseData = {};

								// 1ユーザーあたり最高得点の得点表だけをresponseデータとして抽出する処理
								for(var i = 0; i < totalRankingData.length; i++) {
									// レスポンスとして用意しているデータの合計得点より、現在探索しているデータのほうが大きくなかったらresponseDataを上書きする処理をcontinueでskip
									if(totalRankingData[i].p_id in responseData) {
										if(!(totalRankingData[i].total > responseData[totalRankingData[i].p_id].total)) {
											continue;	
										}
									}

									responseData[totalRankingData[i].p_id] = totalRankingData[i];
								}

								var beforeSort = [];
								var i = 0;

								// 抽出したデータを配列化 (sort用)
								Object.keys(responseData).forEach(function(key) {
									beforeSort[i] = responseData[key];
									i++;
								});


								// 配列化されたデータをtotalで昇順に並べ替える	
								var afterSort = arraySort(beforeSort);


								var rank = 1;

								// 昇順に並べ替えられたarrayを利用して, response用に用意しているobjectへrankをつける
								for(var j = 0; j < afterSort.length; j++, rank++) {

									if(j != 0) {
										// 得点重複時の処理
										if(responseData[afterSort[j].p_id].total == responseData[afterSort[j - 1].p_id].total) {
											responseData[afterSort[j].p_id].rank = responseData[afterSort[j - 1].p_id].rank; 
											continue;
										}
									}

									responseData[afterSort[j].p_id].rank = rank;
								}


								//  true response
								var arrayResponseData = [];

								i = 0;

								// responseとして送るformatへ整形( obj to array)
								Object.keys(responseData).forEach(function(key) {
									arrayResponseData[i] = responseData[key];
									i++;
								});

								console.log('data for extractTotalRankingIndex');
								console.log(arrayResponseData);

								socket.emit('extractTotalRankingIndex', arrayResponseData);
							}
							else {
								console.log('得点表データの抽出に失敗');
								console.log(totalRankingErr);
							}
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						console.log('authorizationError');
						socket.emit('authorizationError');
					}
				}else {
					console.log('faild to getSession');
				}
			});
		});

		function arraySort(obj) {

			obj.sort(function(a, b) {
				return a.total < b.total ? 1 : -1;
			});

			return obj;	
		}

		function arrayAvgSort(obj) {

			obj.sort(function(a, b) {
				return a.scoreAvg < b.scoreAvg ? 1 : -1;
			});

			return obj;	
		}

		socket.on('extractAvgRankingIndex', function(data) {

			// On log
			console.log('on extractAvgRankingIndex');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
 
					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					if(p_id !== undefined) {

						// 試合に参加
						socket.join('scoreCardIndexRoom' + data.m_id);

						// 送られてきたm_idに所属している得点表データを抽出 
						var avgRankingSql = 'select scorePerEnd.sc_id, scorePerEnd.p_id, concat(account.lastName, account.firstName) as playerName, count(scorePerEnd.sc_id) as totalPerEnd, scoreTotal.total, `match`.arrows, `match`.m_id from scorePerEnd, `match`, account, scoreCard, scoreTotal where `match`.m_id = ' + connection.escape(data.m_id) + ' and scoreCard.m_id = ' + connection.escape(data.m_id) + ' and scoreCard.sc_id = scorePerEnd.sc_id and scoreCard.sc_id = scoreTotal.sc_id and account.p_id = scorePerEnd.p_id group by scorePerEnd.sc_id';

						// 得点表データを抽出
						connection.query(avgRankingSql, function(avgRankingErr, avgRankingData) {

							if(!avgRankingErr) {

								// 抽出したデータ
								console.log('avgRankingData');
								console.log(avgRankingData);

								var indexedP_id = {};

								for(var i = 0; i < avgRankingData.length; i++) {

									var p_id = avgRankingData[i]['p_id'];

									// すでにp_idがkeyとして存在する
									if(p_id in indexedP_id) {
										// 存在する ∴ breakdownへのデータの追加とtotal, avgの更新のみを行う

										indexedP_id[p_id]['scoreTotal'] += avgRankingData[i]['total'];
										indexedP_id[p_id]['arrowsTotal'] += avgRankingData[i]['totalPerEnd'] * avgRankingData[i]['arrows'];
									    indexedP_id[p_id]['scoreAvg'] =  indexedP_id[p_id]['scoreTotal'] / indexedP_id[p_id]['arrowsTotal'];
									    indexedP_id[p_id]['breakdown'].push({
											'sc_id': avgRankingData[i]['sc_id'],
											'total': avgRankingData[i]['total']
									    }); 
									}
									else {
										// 存在しない ∴ responesのformatにそってデータをsetする
										indexedP_id[p_id] = {};

										indexedP_id[p_id]['p_id'] = avgRankingData[i]['p_id'];
										indexedP_id[p_id]['playerName'] = avgRankingData[i]['playerName'];
										indexedP_id[p_id]['scoreTotal'] = avgRankingData[i]['total'];
										indexedP_id[p_id]['arrowsTotal'] = avgRankingData[i]['totalPerEnd'] * avgRankingData[i]['arrows'];
									    indexedP_id[p_id]['scoreAvg'] =  indexedP_id[p_id]['scoreTotal'] / indexedP_id[p_id]['arrowsTotal'];
										indexedP_id[p_id]['breakdown'] = [{
											'sc_id': avgRankingData[i]['sc_id'],
											'total': avgRankingData[i]['total']
										}];
									}
								}

								console.log('indexedP_id');
								console.log(indexedP_id);

								//socket.emit('extractAvgRankingIndex', indexedP_id);

								//--- quote from extractTotalRankingIndex method ---//

								var beforeSort = [];
								var i = 0;

								// 抽出したデータを配列化 (sort用)
								Object.keys(indexedP_id).forEach(function(key) {
									beforeSort[i] = indexedP_id[key];
									i++;
								});

								// 配列化されたデータをtotalで昇順に並べ替える	
								var afterSort = arrayAvgSort(beforeSort);

								var rank = 1;

								// 昇順に並べ替えられたarrayを利用して, response用に用意しているobjectへrankをつける
								for(var j = 0; j < afterSort.length; j++, rank++) {

									if(j != 0) {
										// 得点重複時の処理
										if(indexedP_id[afterSort[j].p_id].scoreAvg == indexedP_id[afterSort[j - 1].p_id].scoreAvg) {
											indexedP_id[afterSort[j].p_id].rank = indexedP_id[afterSort[j - 1].p_id].rank; 
											continue;
										}
									}

									indexedP_id[afterSort[j].p_id].rank = rank; }

								//  true response
								var arrayResponseData = [];

								i = 0;

								// responseとして送るformatへ整形( obj to array)
								Object.keys(indexedP_id).forEach(function(key) {
									arrayResponseData[i] = indexedP_id[key];
									arrayResponseData[i].scoreAvg = arrayResponseData[i].scoreAvg.toFixed(1);
									i++;
								});

								console.log('data for extractAvgRankingIndex');
								console.log(arrayResponseData);

								socket.emit('extractAvgRankingIndex', arrayResponseData);	
							}
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						console.log('authorizationError');
						socket.emit('authorizationError');
					}
				}else {
					console.log('faild to getSession');
				}
			});
		});	

		socket.on('testBroadcastInsertScore', function(data) {
			var responseData = {
				'sc_id': 1,
				'p_id': 3,
				'perEnd': 6,
				'score_1': 10,
				'score_2': 10,
				'score_3': 10,
				'score_4': 10,
				'score_5': 10,
				'score_6': 10,
				'subTotal': 60,
				'ten': 6,
				'x': 0,
				'total':220
			};

			socket.emit('broadcastInsertScore', responseData);
		});

		// 受け取ったsc_idのpermissionを返すイベント
		socket.on('checkPermission', function(data) {

			// On log
			console.log('on checkPermission');
			console.log(data);

			/* Get p_id related SessionID */
			sessions.get(addPrefix(data.sessionID), function(err, body) {
				if(!err) {
					console.log('nano');
					console.log(body);	

					var p_id = body.sess.p_id;
					var o_id = body.sess.o_id;

					// p_idが取得できていれば、処理を続行, そうでなければエラーEventをemit
					if(p_id !== undefined) {

						// idを抽出するsql文
						var scoreCardIdSql = 'select scoreCard.p_id, scoreCard.sc_id from `scoreCard` where scoreCard.sc_id = ' + connection.escape(data.sc_id);

						// idを抽出
						connection.query(scoreCardIdSql, function (err, scoreCardIdData) {

							var p_idPermission = ( p_id === scoreCardIdData[0].p_id ? true : false );

							var sc_idPermission = false;

							if(body.sess.subUser != undefined) {

								for(var i = 0; i < body.sess.subUser.length; i++) {
									if(body.sess.subUser[i].sc_id === scoreCardIdData[0].sc_id) {
										sc_idPermission = true;
									}
								}
							}

							// パーミッションを追加
							var emitData = {'permission' : ( p_idPermission || sc_idPermission ) ? true : false};

							console.log('checkPermission');
							console.log(emitData);

							socket.emit('checkPermission', emitData);
						});
					}
					// p_idを取得できていない = ログインができていない ∴ ログイン画面に遷移する
					else {
						socket.emit('authorizationError');
					}
				}
			});
		});
	});
};

module.exports = rankingIndexModel;