var socket = io('/scoreCard');

var match = {};

// 現在のセット数
var active_perEnd = '';

// 現在の射数
var active_arrows = '';

var number = '';
var prefectures = '';

// 得点表データの要求 & Sessionによるユーザー認証
socket.emit('extractScoreCard', {'sessionID': document.cookie, 'sc_id': getQueryString().sc_id});

// 得点表データの出力
socket.on('extractScoreCard', function(data) {

  console.log('on extractScoreCard');
  console.log(data);

  match = data;

  // 現在編集中のset
  active_perEnd = data.countPerEnd + 1;
  active_arrows = 1;

  // 現在のゼッケン番号と都道府県
  number = data.number;
  prefectures = data.prefectures;

  // 得点表データの出力
  viewScoreCard(data);

  // 得点表編集モード
  if(data.permission == true) {
    editMode(data);
  }
  else {
    // disabled input box
    $('input').attr('disabled', 'disabled');
  }
});

// 得点の追加による更新
socket.on('broadcastInsertScore', function (data) {

  console.log('on boradcastInsertScore');
  console.log(data);

    // 計算したsubTotalを表示
  $('.perEnd' + data.perEnd + ' .scoreTotal').text(e(data.subTotal));
  $('.subTotalHeader' + data.perEnd).text(e(data.subTotal));

  active_perEnd = data.perEnd + 1;
  active_arrows = 1;

  // 存在しないのであれば0, or 1
  if($('.perEnd' + data.perEnd).length != 0) {
    // すでに存在する  つまり  自分も編集者だが、その得点表が誰かによって編集された場合
    $('.perEnd' + data.perEnd).remove();

    viewScore(data);

    if(match.permission == true) {
      // まだセットが残っている
      if(active_perEnd <= match.maxPerEnd) {

        // 次のセットを表示
        var tempScore = {'subTotal': '', 'perEnd': active_perEnd};

        for(var i = 1; i <= 6; i++) {
          tempScore['score_' + i] = '';
          tempScore['updatedScore_' + i] = '';
        } 

        // 得点の表示
        viewScore(tempScore);

        // ハイライト
        light(active_perEnd, active_arrows);
      }
      // 試合終了
      else { 
        $('.ime').fadeOut(600);
      }
    } 
  }
  else {
    viewScore(data);
  }

  // 合計得点を更新
  processing(data.perEnd);
});

// 得点の修正による更新
socket.on('broadcastUpdateScore', function (data) {
  console.log('on broadcasetUpdateScore');
  console.log(data);

  // init
  var arrows = 0;

  // 更新された値がどこかを調べる
  for(var i = 1; i <= 6; i++) {
     if(data.hasOwnProperty('updatedScore_' + i) == true) {
        arrows = i;
        break;
     }
  }

   // 計算したsubTotalを表示 it include processing();
   viewUpdate(data.perEnd, arrows, data['updatedScore_' + arrows]);;
});

function editMode(data) {

  // セット数が残っていたらEdit modeに入る
  if(data.countPerEnd < data.maxPerEnd) {
    $('.ime').fadeIn(600);

    var tempScore = {'subTotal': '', 'perEnd': active_perEnd};

    for(var i = 1; i <= 6; i++) {
      tempScore['score_' + i] = '';
      tempScore['updatedScore_' + i] = '';
    }

    // 空のスコアRowを追加する
    viewScore(tempScore);

    light(active_perEnd, active_arrows);
   }
}

// セルのハイライト
function light(perEnd, arrows) {

  for(var i = 1; i <= 6; i++) {
    $('.perEnd' + perEnd + ' .score' + i).css({'border': '1px solid #aaa'});
  }

  if(arrows != 0) {
    $('.perEnd' + perEnd + ' .score' + arrows).css({'border': '1px solid #3dd0e1'});
  }

}

// 得点の計算
function processing(perEnd) {

  var subTotal = 0;

  for(var i = 1; i <= 6; i++) {

    var cel;

    if($('.perEnd' + perEnd + ' .updatedScore' + i).text() == '') {
      cel = $('.perEnd' + perEnd + ' .score' + i).text();
    }
    else {
      cel = $('.perEnd' + perEnd + ' .updatedScore' + i).text();
    }

    if(cel == 'x' || cel == 'X') {
      cel = 10;
    } 

    if(cel == 'm' || cel == 'M') {
      cel = 0;
    }

    subTotal += parseInt(cel);
  }

  // 計算したsubTotalを表示
  $('.perEnd' + perEnd + ' .scoreTotal').text(e(subTotal));
  $('.subTotalHeader' + perEnd).text(e(subTotal));

  // 合計得点を更新
  updateScoreSubTotal();
}

// 合計得点の更新
function updateScoreSubTotal() {

  var total = 0;

  for(var i = 1; i <= 6; i++) {
    var cel = $('.subTotalHeader' + i).text();
    if(cel == '') {
      cel = 0;
    }
    total += parseInt(cel);
  }

  $('.subTotalHeaderTotal').text(e(total));

  var countX = 0;
  var countTen = 0;

  // 10数, X数の更新
  for(var i = 1; i <= active_perEnd; i++) {
    for(var j = 1; j <= 6; j++) {

      var cel = 0;

      if($('.perEnd' + i + ' .updatedScore' + j).text() != '') {
        cel = $('.perEnd' + i + ' .updatedScore' + j).text();
      } 
      else if($('.perEnd' + i + ' .score' + j).text() != '') {
        cel = $('.perEnd' + i + ' .score' + j).text(); 
      } 

      if(cel == 10) {
        countTen++; 
      }

      if(cel == 'X' || cel == 'x') {
        countX++;
      }
    } 
  }

  $('.subTotalHeaderTen').text(countTen);
  $('.subTotalHeaderX').text(countX);
}

// 得点入力時のハンドラ
$('.ime .rows div div').on('click', function() {

  console.log($(this).text());

  // 得点の表示
  $('.perEnd' + active_perEnd + ' .score' + active_arrows).text($(this).text());

  active_arrows++;

  // 規定の射数まで得点の記入が完了
  if(active_arrows > 6) {

    var mess = 'この得点で決定しますか?\n';

    mess += active_perEnd + '回目 :'; 

    for(var i = 1; i <= 6; i++) {
      mess += ' ' + $('.perEnd' + active_perEnd + ' .score' + i).text() + ','; 
    }

    // 末端の, を削除
    mess = mess.substr(0, (mess.length - 1));

    if(window.confirm(mess) == true) {

      light(active_perEnd, 0);

      // 得点計算
      processing(active_perEnd);

      // 得点の送信
      insertScore(active_perEnd);

      // update対応
      $('.perEnd' + active_perEnd + ' .score div').addClass('comp');

      // foucsを移動
      active_perEnd++;
      active_arrows = 1;

      // まだセットが残っている
      if(active_perEnd <= match.maxPerEnd) {

        // 次のセットを表示
        var tempScore = {'subTotal': '', 'perEnd': active_perEnd};

        for(var i = 1; i <= 6; i++) {
          tempScore['score_' + i] = '';
          tempScore['updatedScore_' + i] = '';
        } 

        // 得点の表示
        viewScore(tempScore);

        // ハイライト
        light(active_perEnd, active_arrows);
      }
      // 試合終了
      else { 
        $('.ime').fadeOut(600);
      }
    } 
    // 得点の初期化
    else {
      for(var i = 1; i <= 6; i++) {
        $('.perEnd' + active_perEnd + ' .score' + i).text('');
      }

      active_arrows = 1;

      light(active_perEnd, active_arrows);
    }
  }
  // まだ入力すべきスコアは残っている
  else {
    light(active_perEnd, active_arrows);
  }
});

// 得点更新のハンドラ
$('.scoreCardBody').on('click', '.comp', function() {

  if(match.permission == true) {

    $('#updateModal').modal();

    $('.modalPerEnd').text($(this).data('perend'));
    $('.modalArrows').text($(this).data('score'));

    $('.modalScore').val($(this).text());
  }
});

// 得点修正ボタン
$('.updateBtn').on('click', function() {
  $('.modal').modal('hide');

  var perEnd = $('.modalPerEnd').text();
  var arrows = $('.modalArrows').text();
  var score = $('.modalUpdatedScore').val();

  // 得点表示更新
  viewUpdate(perEnd, arrows, score);

  // 得点更新送信
  updateScore(perEnd, arrows, score)
});


// Emit Insert Score
function insertScore(perEnd) {

  var data = new Object();

  data['sessionID'] = document.cookie;
  data['sc_id'] = getQueryString().sc_id;
  data['m_id'] = getQueryString().m_id;

  data['perEnd'] = perEnd;

  for(var i = 1; i <= 6; i++) {
    data['score_' + i]  = $('.perEnd' + perEnd + ' .score' + i).text();
  }

  data['subTotal'] = $('.perEnd' + perEnd + ' .scoreTotal').text();
  data['ten'] = $('.subTotalHeaderTen').text();
  data['x'] = $('.subTotalHeaderX').text();
  data['total'] = $('.subTotalHeaderTotal').text();

  console.log('emit insertScore');
  console.log(data);

  socket.emit('insertScore', data);
};

// Emit Update Score
function updateScore(perEnd, arrows, score) {

  var data = new Object();

  data['sessionID'] = document.cookie;
  data['sc_id'] = getQueryString().sc_id;
  data['m_id'] = getQueryString().m_id;

  data['perEnd'] = perEnd;

  data['updatedScore_' + arrows] = score;

  data['subTotal'] = $('.perEnd' + perEnd + ' .scoreTotal').text();
  data['ten'] = $('.subTotalHeaderTen').text();
  data['x'] = $('.subTotalHeaderX').text();
  data['total'] = $('.subTotalHeaderTotal').text();

  console.log('emit updateScore');
  console.log(data);

  socket.emit('updateScore', data);
};

$('.numberTextBox').change(function() {
  if(window.confirm('ゼッケン番号を送信しますか?') == true) {

    var data = {};

    data['sessionID'] = document.cookie;
    data['sc_id'] = getQueryString().sc_id;

    data['number'] = $('.numberTextBox').val();

    number = $('.numberTextBox').val();
    match.number = $('.numberTextBox').val();

    $('.broadcastNumber').text(number);   
    
    console.log('emit insertNumber');
    console.log(data);

    socket.emit('insertNumber', data);
  }
  else {
    $('.numberTextBox').val(number);
  }
});

$('.prefecturesTextBox').change(function() {
  if(window.confirm('都道府県を送信しますか?') == true) {

    var data = {};

    data['sessionID'] = document.cookie;
    data['sc_id'] = getQueryString().sc_id;

    data['prefectures'] = $('.prefecturesTextBox').val();

    prefectures = $('.prefecturesTextBox').val();

    console.log('emit insertPrefecutres');
    console.log(data);

    socket.emit('insertPrefectures', data);
  }
  else {
    $('.prefecturesTextBox').val(prefectures);
  }
});

socket.on('broadcastInsertNumber', function(data) {

  console.log('on broadcastInsertNumber')
  console.log(data);

  number = data.number;

  $('.numberTextBox').val(number);
  $('.broadcastNumber').text(number);
});

socket.on('broadcastInsertPrefectures', function(data) {

  console.log('on broadcastInsertPrefectures');
  console.log(data);

  prefectures = data.Prefectures;

  $('.prefecturesTextBox').val(prefectures);
});

// 試合の終了
socket.on('broadcastCloseMatch', function(data) {
  console.log('broadcastCloseMatch');
  console.log(data); 

  if(getQueryString().m_id == data.m_id) {
    // この試合は終了
    alert('この試合は終了しました。\nこの試合の得点は過去の得点表一覧より閲覧できます');
    location.href = '/matchIndex';
  }
});