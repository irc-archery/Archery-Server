var socket = io('/scoreCardIndex');

$(function() {

  // ここで選択されているモードをmode変数に格納

  initilaizeRankingList();
});

var mode = 0; // or 1

function initilaizeRankingList() {

  var eventName = '';

  if(mode == 0) {
    eventName = 'extractTotalRankingIndex';
  }
  else if (mode == 1) {
    eventName = 'extractAvgRankingIndex';
  }

  // イベントを送信
  socket.emit(eventName, {'m_id': getQueryString().m_id, 'sessionID': document.cookie});
}

socket.on('extractTotalRankingIndex', function(data) {
  // extractTotalRankingIndex というイベントをemitするとこの関数に入る

  console.log('on extractTotalRankingIndex');
  console.log('--- data ---');
  console.log(data);
  console.log('--- end data ---');

  var code = '';

  if(data != '') {

    // e(str); でxssエスケープ関数
    /*  得点表一覧のソースコード */
    for (var i = 0; i < data.length; i++) {
      code += '<tr class="openScoreCard scoreCard' + e(data[i]['sc_id']) + '" data-scorecard="' + e(data[i]['sc_id']) + '">';
      code += '<td>' + e(data[i]['playerName']) + '</td>';
      code += '<td class="perEnd">' + e(data[i]['perEnd']) + '</td>';
      code += '<td class="total">' + e(data[i]['total']) + '</td>';
      code += '</tr>';
    }

    $("#rankingIndexArea").append(code);
  }
  else {

    var infoCode = '<div class="alert alert-info" role="alert">現在この試合に得点表は存在しません。新たに得点表を作成したい場合は、上のアイコンから移動できる<a href="/insertScoreCard?m_id=' + getQueryString().m_id + '" class="alert-link">得点表作成画面</a>から新たに得点表を作成してください。</div>';

    $('.infoArea').append(infoCode);
  }
});

socket.on('extractAvgRankingIndex', function(data) {
  // extractTotalRankingIndex というイベントをemitするとこの関数に入る

  console.log('on extractAvgRankingIndex');
  console.log('--- data ---');
  console.log(data);
  console.log('--- end data ---');

});

/* debug用イベント (削除可) */
$('#fire').on('click', function() {
  socket.emit('testBroadcastInsertScore');
});

// 得点の挿入を反映
socket.on('broadcastInsertScore', function(data) {

  console.log('on broadcastInsertScore');
  console.log(data);

  //$('.scoreCard' + data.sc_id + ' .perEnd').text(e(data.perEnd));
  //$('.scoreCard' + data.sc_id + ' .total').text(e(data.total));
});

// 得点の更新を反映
socket.on('broadcastUpdateScore', function(data) {
  console.log('on broadcastUpdateScore');
  console.log(data);

  //$('.scoreCard' + data.sc_id + ' .total').text(e(data.total));
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