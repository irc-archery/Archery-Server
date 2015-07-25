var socket = io('/scoreCardIndex');

socket.emit('joinMatch', {'m_id': getQueryString().m_id, 'sessionID': document.cookie})

$(function() {
  // 得点表作成へのリンクの生成
  $('.insertScoreCardLink').attr('href', '/insertScoreCard?m_id=' + getQueryString().m_id);
});

$('#scoreCardIndexArea').on('click', 'tr.openScoreCard', function() {
  console.log('tr on click!');
  var matchId = getQueryString().m_id;
  var scoreCardId = $(this).data('scorecard');

  console.log(matchId);
  console.log(scoreCardId);

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
      code += '<tr class="openScoreCard" data-scorecard="' + data[i]['sc_id'] + '">';
      code += '<td>' + data[i]['playerName'] + '</td>';
      code += '<td>' + data[i]['perEnd'] + '</td>';
      code += '<td>' + data[i]['total'] + '</td>';
      code += '</tr>';
    }

    $("#scoreCardIndexArea").append(code);
  }
  else {

    var infoCode = '<div class="alert alert-info" role="alert">現在この試合に得点表は存在しません。新たに得点表を作成したい場合は、上のアイコンから移動できる<a href="/insertScoreCard?m_id=' + getQueryString().m_id + '" class="alert-link">得点表作成画面</a>から新たに得点表を作成してください。</div>';

    $('.infoArea').append(infoCode);
  }
});

socket.on('broadcastInsertScoreCard', function(data) {
  console.log('on broadcastInsertScoreCard');
  console.log(data);

  var code = '';

  code += '<tr class="openScoreCard" data-scorecard="' + data['sc_id'] + '">';
  code += '<td>' + data['playerName'] + '</td>';
  code += '<td>' + data['perEnd'] + '</td>';
  code += '<td>' + data['total'] + '</td>';
  code += '</tr>';

  $('#scoreCardIndexArea').append(code);

});

socket.on('broadcastCloseMatch', function(data) {
  console.log('broadcastCloseMatch');
  console.log(data); 
});

socket.on('broadcastInsertScore', function(data) {

  console.log('on broadcastinsertScore');
  console.log(data);
});

socket.on('broadcastUpdateScore', function(data) {
  console.log('on broadcastUpdateScore');
  console.log(data);
});