var socket = io('/scoreCardIndex');

socket.emit('joinMatch', {'m_id': getQueryString().m_id, 'sessionID': document.cookie})

socket.emit('checkMatchCreater', {'m_id': getQueryString().m_id, 'sessionID': document.cookie});

// 試合終了の権限に応じて試合終了ボタンの表示・非表示を切り替える
socket.on('checkMatchCreater', function(data) {

  console.log('on checkMatchCreater');
  console.log(data);

  if(data.permission == false) {
    $('.closeMatch').remove();
  }
});

$('.closeMatch').on('click', function() {
  if(window.confirm('試合を終了しますか?\n※現在得点表を記入中のプレイヤーも強制的に試合から退出させられます。') == true) {
    socket.emit('closeMatch', {'sessionID': document.cookie, 'm_id': getQueryString().m_id});
  }
});

// 特定の得点表が選択された時の処理
$('#scoreCardIndexArea').on('click', 'tr.openScoreCard', function() {
  console.log('tr on click!');
  var matchId = getQueryString().m_id;
  var scoreCardId = $(this).data('scorecard');

  location.href = '/scoreCard?m_id=' + matchId + '&sc_id=' + scoreCardId;
});

// On Extract ScoreCard Index
socket.on('extractScoreCardIndex', function(data){

  console.log(data);

  var code = '';

  console.log('on extractScoreCardIndex');
  console.log(data);

  if(data != '') {

    for (var i = 0; i < data.length; i++) {
      code += '<tr class="openScoreCard scoreCard' + e(data[i]['sc_id']) + '" data-scorecard="' + e(data[i]['sc_id']) + '">';
      code += '<td>' + e(data[i]['playerName']) + '</td>';
      code += '<td class="perEnd">' + e(data[i]['perEnd']) + '</td>';
      code += '<td class="total">' + e(data[i]['total']) + '</td>';
      code += '</tr>';
    }

    $("#scoreCardIndexArea").append(code);
  }
  else {

    var infoCode = '<div class="alert alert-info" role="alert">現在この試合に得点表は存在しません。新たに得点表を作成したい場合は、上のアイコンから移動できる<a href="/insertScoreCard?m_id=' + getQueryString().m_id + '" class="alert-link">得点表作成画面</a>から新たに得点表を作成してください。</div>';

    $('.infoArea').append(infoCode);
  }
});

// 得点表の挿入を反映
socket.on('broadcastInsertScoreCard', function(data) {
  console.log('on broadcastInsertScoreCard');
  console.log(data);

  var code = '';

  code += '<tr class="openScoreCard scoreCard' + e(data['sc_id']) + '" data-scorecard="' + e(data['sc_id']) + '">';
  code += '<td>' + e(data['playerName']) + ' <span class="label label-info">New</span></td>';
  code += '<td class="perEnd">' + e(data['perEnd']) + '</td>';
  code += '<td class="total">' + e(data['total']) + '</td>';
  code += '</tr>';

  $('#scoreCardIndexArea').append(code);

  $('.infoArea').empty(); 
});

// 試合終了
socket.on('broadcastCloseMatch', function(data) {
  console.log('broadcastCloseMatch');
  console.log(data); 

  if(getQueryString().m_id == data.m_id) {
    // この試合は終了
    alert('この試合は終了しました。\nこの試合の得点は過去の得点表一覧より閲覧できます');
    location.href = '/matchIndex';
  }
});

// 得点の挿入を反映
socket.on('broadcastInsertScore', function(data) {

  console.log('on broadcastInsertScore');
  console.log(data);

  $('.scoreCard' + data.sc_id + ' .perEnd').text(e(data.perEnd));
  $('.scoreCard' + data.sc_id + ' .total').text(e(data.total));
});

// 得点の更新を反映
socket.on('broadcastUpdateScore', function(data) {
  console.log('on broadcastUpdateScore');
  console.log(data);

  $('.scoreCard' + data.sc_id + ' .perEnd').text(e(data.perEnd));
  $('.scoreCard' + data.sc_id + ' .total').text(e(data.total));
});