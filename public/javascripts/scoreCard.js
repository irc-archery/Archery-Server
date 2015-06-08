var socket = io('/scoreCard');

// 得点表データの要求 & Sessionによるユーザー認証
socket.emit('extractScoreCard', {'sessionID': document.cookie, 'sc_id': getQueryString().sc_id});

// 得点表データの出力
socket.on('extractScoreCard', function(data) {

  console.log('on extractScoreCard');
  console.log(data);

  $('#scoreCardArea').append(JSON.stringify(data));
});

// 得点の追加による更新
socket.on('broadcastInsertScore', function (data) {

  console.log('on boradcastInsertScore');
  console.log(data);

  $('#broadcastInsertScoreArea').append(JSON.stringify(data));
});

// 得点の修正による更新
socket.on('broadcastUpdateScore', function (data) {
  console.log('on broadcasetUpdateScore');
  console.log(data);

  $('#broadcastUpdateScoreArea').append(JSON.stringify(data));
});

// Emit Insert Score
function insertScore() {

  var data = new Object();

  data['sc_id'] = getQueryString().sc_id;
  data['p_id'] = $('#insertScoreP_id').val();
  data['perEnd'] = $('#insertScorePerEnd').val();

  for(var i = 1; i <= 6; i++) {
    data['score_' + i]  = $('#score_' + i).val();
  }

  data['subTotal'] = $('#subTotal').val();
  data['ten'] = $('#ten').val();
  data['x'] = $('#x').val();
  data['total'] = $('#total').val();

  console.log('emit insertScore')
  console.log(data);

  socket.emit('insertScore', data);
};

// Emit Update Score
function updateScore() {

  var data = new Object();

  data['sc_id'] = $('#updateScoreSc_id').val();
  data['p_id'] = $('#updateScoreP_id').val();
  data['perEnd'] = $('#updateScorePerEnd').val();

  for(var i = 1; i <= 6; i++) {
    if($('#updatedScore_' + i).val() != ''){
      data['updatedScore_' + i]  = $('#updatedScore_' + i).val();
    }
  }

  data['subTotal'] = $('#updatedSubTotal').val();
  data['ten'] = $('#updatedTen').val();
  data['x'] = $('#updatedX').val();
  data['total'] = $('#updatedTotal').val();

  console.log('emit updateScore');
  console.log(data);

  socket.emit('updateScore', data);
};




