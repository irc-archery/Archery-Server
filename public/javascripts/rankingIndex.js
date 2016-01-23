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
  var old_length = $('.total-rank tr[data-scorerank]').length;

  if(data != '' && old_length != data.length) {
    // e(str); でxssエスケープ関数
    /*  得点表一覧のソースコード */
    for (var i = 0; i < data.length; i++) {
      code += '<tr data-id="' + e(data[i]['p_id']) + '" data-scorerank="' + e(data[i]['rank']) + '">';
      code += '<td class="rank">' + e(data[i]['rank'])  + '</td>';
      code += '<td class="playerName">' + e(data[i]['playerName']) + '</td>';
      code += '<td class="scoreTotal">' + e(data[i]['total']) + '</td>';
      code += '</tr>';
    }

    $(".total-rank tr[data-scorerank]").remove();
    $(".total-rank .rankingIndexArea").append(code);
  }
  else if (old_length != data.length) {
    var infoCode = '<div class="alert alert-info" role="alert">現在この試合に得点表は存在しません。新たに得点表を作成したい場合は、上のアイコンから移動できる<a href="/insertScoreCard?m_id=' + getQueryString().m_id + '" class="alert-link">得点表作成画面</a>から新たに得点表を作成してください。</div>';

    $('.infoArea').append(infoCode);
  }
});

socket.on('extractAvgRankingIndex', function(data) {
  // extractAvgRankingIndex というイベントをemitするとこの関数に入る

  console.log('on extractAvgRankingIndex');
  console.log('--- data ---');
  console.log(data);
  console.log('--- end data ---');

  var code = '';
  var old_length = $('.avg-rank tr[data-scorerank]').length;

  if(data != '' && old_length != data.length) {
    // e(str); でxssエスケープ関数
    /*  得点表一覧のソースコード */
    for (var i = 0; i < data.length; i++) {
      code += '<tr data-id="' + e(data[i]['sc_id']) + '" data-scorerank="' + e(data[i]['rank']) + '" data-highscore="' + e(data[i]['scoreTotal']) + '">';
      code += '<td class="rank">' + e(data[i]['rank'])  + '</td>';
      code += '<td class="playerName">' + e(data[i]['playerName']) + '</td>';
      code += '<td class="scoreTotal">' + e(data[i]['scoreAvg']) + '</td>';
      //code += '<td class="arrowTotal">' + e(data[i]['arrowsTotal']) + '</td>';
      code += '</tr>';
    }

    $(".avg-rank tr[data-scorerank]").remove();
    $(".avg-rank .rankingIndexArea").append(code);
  }
  else if (old_length != data.length) {
    var infoCode = '<div class="alert alert-info" role="alert">現在この試合に得点表は存在しません。新たに得点表を作成したい場合は、上のアイコンから移動できる<a href="/insertScoreCard?m_id=' + getQueryString().m_id + '" class="alert-link">得点表作成画面</a>から新たに得点表を作成してください。</div>';

    $('.infoArea').append(infoCode);
  }
});

/* debug用イベント (削除可) */
$('#fire').on('click', function() {
  socket.emit('testBroadcastInsertScore');
});

// 得点表の表示を切り替える
$('a[data-toggle]').on('click', function() {
  if ($('.active a[href=#total]')[0]) {
    mode = 1;
  }
  else if ($('.active a[href=#avg]')[0]) {
    mode = 0;
  }

  initilaizeRankingList();
});

// 得点の挿入を反映
var max = 0;
var high_score = 0;
socket.on('broadcastInsertScore', function(data) {

  console.log('on broadcastInsertScore');
  console.log(data);

  var total_select = '#total tr[data-id=' + data['p_id'] + ']';

  // 合計
  if (data['total'] > max) {
    // 合計の順位入れ替え
    max = data['total'];

    var broadcast_rank = 0;
    for (var i = $(total_select).attr('data-scorerank'); i >= 1; i--) {
      var total_select_rank = '#total tr[data-scorerank=' + i + ']';
      for (var j = 0; j < $(total_select_rank).length; j++) {
        if (max > parseInt($(total_select_rank + ' .scoreTotal').eq(j).text())) {
          var data_rank = parseInt($(total_select_rank + ' .rank').eq(j).text()) + 1;

          broadcast_rank = parseInt($(total_select_rank + ' .rank').eq(j).text());

          $(total_select_rank + ' .rank').eq(j).text(data_rank);
          $(total_select_rank).eq(j).attr('data-scorerank', data_rank);
        } else {
          break;
        }
      }
    }

    $(total_select + ' .rank').text(e(broadcast_rank));
    $(total_select + ' .scoreTotal').text(e(max));

    // 平均
    var avg_select = $('#avg tr[data-id=' + data['sc_id'] + ']');
    var avg = data['total'] / (parseInt($(avg_select).attr('data-highscore')) + data['perEnd']);

    for (var i = $(avg_select).attr('data-scorerank'); i >= 1; i--) {
      var avg_select_rank = '#avg tr[data-scorerank=' + i + ']';
      for (var j = 0; j < $(avg_select_rank).length; j++) {
        if (max > parseInt($(avg_select_rank + ' .scoreTotal').eq(j).text())) {
          var data_rank = parseInt($(avg_select_rank + ' .rank').eq(j).text()) + 1;

          broadcast_rank = parseInt($(avg_select_rank + ' .rank').eq(j).text());

          $(avg_select_rank + ' .rank').eq(j).text(data_rank);
          $(avg_select_rank).eq(j).attr('data-scorerank', data_rank);
        } else {
          break;
        }
      }
    }

    $(avg_select_rank + ' .rank').text(e(broadcast_rank));
    $(avg_select_rank + ' .scoreTotal').text(e(avg));
  }
});

// 得点の更新を反映
socket.on('broadcastUpdateScore', function(data) {
  console.log('on broadcastUpdateScore');
  console.log(data);
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