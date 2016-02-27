var socket = io('/rankingIndex');

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

  var code = '';
  console.log(getReady_total);

  if(data != '') {
    getReady_total = data;

    // e(str); でxssエスケープ関数
    /*  得点表一覧のソースコード */
    for (var i = 0; i < data.length; i++) {
      code += '<tr data-id="' + e(data[i]['p_id']) + '">';
      code += '<td class="rank">' + e(data[i]['rank'])  + '</td>';
      code += '<td class="playerName">' + e(data[i]['playerName']) + '</td>';
      code += '<td class="scoreTotal">' + e(data[i]['total']) + '</td>';
      code += '</tr>';
    }

    $(".total-rank tr[data-id]").remove();
    $(".total-rank .rankingIndexArea").append(code);
  }
  else if (document.getElementById("none") == null) {
    var infoCode = '<div id="none" class="alert alert-info" role="alert">現在この試合に得点表は存在しません。新たに得点表を作成したい場合は、上のアイコンから移動できる<a href="/insertScoreCard?m_id=' + getQueryString().m_id + '" class="alert-link">得点表作成画面</a>から新たに得点表を作成してください。</div>';

    $('.infoArea').append(infoCode);
  }
});

socket.on('extractAvgRankingIndex', function(data) {
  // extractAvgRankingIndex というイベントをemitするとこの関数に入る

  console.log('on extractAvgRankingIndex');

  var code = '';
  console.log(getReady_avg);

  if(data != '') {
    getReady_avg = data;

    // e(str); でxssエスケープ関数
    /*  得点表一覧のソースコード */
    for (var i = 0; i < data.length; i++) {
      code += '<tr data-id="' + e(data[i]['p_id']) + '">';
      code += '<td class="rank">' + e(data[i]['rank'])  + '</td>';
      code += '<td class="playerName">' + e(data[i]['playerName']) + '</td>';
      code += '<td class="scoreTotal">' + e(data[i]['scoreAvg']) + '</td>';
      code += '</tr>';
    }

    $(".avg-rank tr[data-id]").remove();
    $(".avg-rank .rankingIndexArea").append(code);
  }
  else if (document.getElementById("none") == null) {
    var infoCode = '<div id="none" class="alert alert-info" role="alert">現在この試合に得点表は存在しません。新たに得点表を作成したい場合は、上のアイコンから移動できる<a href="/insertScoreCard?m_id=' + getQueryString().m_id + '" class="alert-link">得点表作成画面</a>から新たに得点表を作成してください。</div>';

    $('.infoArea').append(infoCode);
  }
});

// .plus のアニメーション終了後(1秒後) class 削除
$(function() {
  $('.plus').each(function() {
    setTimeout(function() {
      $(this).removeClass('plus');
      }, 1000);
  });
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
//var max = 0;
// データの更新を配列で行う
function sortReady(object, data, flg) {
  if (data != '') {
    for (var i = 0; i < object.length; i++) {
      if (object[i]['p_id'] == data['p_id']) {
        if (flg == 'total') {
          getReady_total[i]['total'] = data['total'];
        }
        else {
          getReady_avg[i]['arrowsTotal'] += 6;
          getReady_avg[i]['scoreTotal'] += data['subTotal'];
          getReady_avg[i]['scoreAvg'] = (getReady_avg[i]['scoreTotal'] / getReady_avg[i]['arrowsTotal']);
          getReady_avg[i]['scoreAvg'] = parseFloat(getReady_avg[i]['scoreAvg'].toFixed(1));
        }
        break;
      }
    }
  }
}

// データを保持しておく配列（Total、Avg）
var getReady_total = {};
var getReady_avg = {};

// ランキングのソート
function sortData(data, key) {
  if (data != '') {
    data.sort(function(firstkey, secondkey) {
      return (firstkey[key] > secondkey[key]) ? -1 : 1;
    });
  }

  for (var i = 0; i < data.length; i++) {
    data[i]['rank'] = (i+1);
  }

  return data;
}

// 順位の表示変更
function rankAllocation (data, select) {
  var select_rank = "";
  if (data != '') {
    for (var i = 0; i < data.length; i++) {
      select_rank = select + ' tr[data-id=' + data[i]['p_id'] + '] .rank';
      $(select_rank).text(e(data[i]['rank']));
    }
  }
}

// データの場所を検索
function dataAround(data, select) {
  if (data != '') {
    var p_obj = $(select + ' tr[data-id]');
    for (var i = 0; i < p_obj.length; i++) {
      if (data['p_id'] == p_obj.eq(i).attr('data-id')) {
        return i;
      }
    }
  }
}

// ランキングの表示切替（UpdateもOK）
function rankInsertorUpdate(data) {
  // ソート
  if (mode == 0) {
    max = [].concat(getReady_total);
    max = sortData(max, 'total');
  }
  else {
    avg = [].concat(getReady_avg);
    avg = sortData(avg, 'scoreAvg');
  }

  if (mode == 0) {
    // Totalスコアの順位変更（表示部分）
    rankAllocation(max, '#total');
    $('#total tr[data-id=' + data['p_id'] + '] .scoreTotal').text(getReady_total[dataAround(data, '#total')]['total']);
  }
  else {
    // Avgスコアの順位変更（表示部分）
    rankAllocation(avg, '#avg');
    $('#avg tr[data-id=' + data['p_id'] + '] .scoreTotal').text(getReady_avg[dataAround(data, '#avg')]['scoreAvg'].toFixed(1));
  }
}

// ソート用の配列を用意
var max = {};
var avg = {};

socket.on('broadcastInsertScore', function(data) {

  console.log('on broadcastInsertScore');
  console.log(data);

  if (data != '' && parseInt($('tr[data-id=' + data['p_id'] + '] .scoreTotal').text(), 10) <= data['total']) {
    sortReady(getReady_total, data, 'total');
    sortReady(getReady_avg, data, 'avg');

    rankInsertorUpdate(data);
  }
});

// 新しいメンバーの参加時
socket.on('broadcastInsertScoreCard', function(data) {

  console.log('on broadcastInsertScoreCard');
  console.log(data);

  if (data != '' && !$('tr[data-id=' + data['p_id'] + ']')[0]) {
    // 最下位の算出
    var lowestRank = 1;
    if (mode == 0) {
      for (var i = 0; i < getReady_total.length; i++) {
        if (lowestRank <= getReady_total[i]['rank'] && $('#total tr[data-id=' + getReady_total[i]['p_id'] + '] .scoreTotal').text() != 0) {
          lowestRank = (getReady_total[i]['rank']+1);
        }
      }
    }
    else {
      for (var i = 0; i < getReady_avg.length; i++) {
        if (lowestRank <= getReady_avg[i]['rank'] && $('#avg tr[data-id=' + getReady_avg[i]['p_id'] + '] .scoreTotal').text() != 0) {
          lowestRank = (getReady_avg[i]['rank']+1);
        }
      }
    }

    var code = '';
    code += '<tr data-id="' + data['p_id'] + '" class="plus">';
    code += '<td class="rank">' + e(lowestRank)  + '</td>';
    code += '<td class="playerName">' + e(data['playerName']) + '</td>';
    code += '<td class="scoreTotal">' + 0 + '</td>';
    code += '</tr>';

    if (mode == 0) {
      $(".total-rank .rankingIndexArea").append(code);
    }
    else {
      $(".avg-rank .rankingIndexArea").append(code);
    }
  }

  //initilaizeRankingList();
});

// 得点の更新を反映
socket.on('broadcastUpdateScore', function(data) {
  if (data != '') {
    console.log('on broadcastUpdateScore');
    console.log(data);

    initilaizeRankingList();

    /*// データの更新
    for (var i = 0; i < getReady_total.length; i++) {
      if (mode == 0 && data['p_id'] == getReady_total[i]['p_id']) {
        getReady_total[i]['total'] = data['total'];
      }
    }

    for (var i = 0; i < getReady_avg.length; i++) {
      if (data['p_id'] == getReady_avg[i]['p_id']) {
        getReady_avg[i]['scoreTotal'] = data['total'];
        getReady_avg[i]['scoreAvg'] = (getReady_avg[i]['scoreTotal'] / getReady_avg[i]['arrowsTotal']);
        getReady_avg[i]['scoreAvg'] = parseFloat(getReady_avg[i]['scoreAvg'].toFixed(1));
      }
    }

    rankInsertorUpdate();*/
  }
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