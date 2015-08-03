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

  // 得点表の個人情報を出力
  $('.matchNameTextBox').val(data.matchName);
  $('.createdTextBox').val(data.created);
  $('.numberTextBox').val(data.number);
  $('.playerNameTextBox').val(data.playerName);
  $('.organizationNameTextBox').val(data.organizationName);
  $('.prefecturesTextBox').val(data.prefectures);

  // subtotalの出力
  for(var i = 0; i < 6; i++) {
  	if(data.score[i] != undefined) {
	  	$('.subTotalHeader' + (i + 1)).text(data.score[i].subTotal);
  	}
  }

  // total, 10数, x数の出力
  $('.subTotalHeaderTotal').text(data.total);
  $('.subTotalHeaderTen').text(data.ten);  
  $('.subTotalHeaderX').text(data.x);  

  if(match.number == null) {
  	match.number = '';
  }

  var lengthOption = ["90m", "70m", "60m", "50m", "40m", "30m", "70m前", "70m後"];

  match.length = lengthOption[data.length];

  for(var i = 0; i < data.countPerEnd; i++) {
    // 得点の表示
  	viewScore(data.score[i]);

    // update対応
    $('.perEnd' + data.score[i].perEnd + ' .score div').addClass('comp');
  }

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
  $('.perEnd' + data.perEnd + ' .scoreTotal').text(data.subTotal);
  $('.subTotalHeader' + data.perEnd).text(data.subTotal);

  console.log('fnifnit');
  // 存在しないのであれば0, or 1
  if($('.perEnd' + data.perEnd).length != 0) {
    // すでに存在する  つまり  自分も編集者だが、その得点表が誰かによって編集された場合
    $('.perEnd' + data.perEnd).remove();
    active_arrows = 1;
    active_perEnd = data.perEnd + 1;

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
  processing();
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

// output scores
function viewScore(score) {

	var code = '';

	code += '<div class="perEnd' + score.perEnd + '">';
  code += '<div class="scoreAreaHeader rows">';
	code += '<div class="col-fn-10 scoreRowsInfo"><span class="perEnd">' + score.perEnd + '</span>回目 : <span class="length">' + match.length + '</span></div>';
	code += '<div class="col-fn-2 border_once scoreTotalHeader">小計</div>';
	code += '</div>';

	code += '<div class="rows scoreArea">';
	code += '<div class="col-fn-2 border_once number">' + match.number + '</div>';
	code += '<div class="col-fn-8">';
	code += '<div class="rows border score">';

	for(var i = 1; i <= 6; i++) {
    var scData = score["updatedScore_" + i];

    // 得点が修正済み
    if(scData != null && scData != '') {
      code += '<div class="col-fn-2 updated through score' + i + '" data-score="' + i + '" data-perend="' + score.perEnd + '">' + score['score_' + i] + '</div>';
    } 
    else {
      code += '<div class="col-fn-2 score' + i + '" data-score="' + i + '" data-perend="' + score.perEnd + '">' + score['score_' + i] + '</div>';
    } 
	}

	code += '</div>';
	code += '</div>';
	code += '<div class="col-fn-2 border_once scoreTotal">' + score.subTotal + '</div>';
	code += '</div>';

	code += '<div class="rows updatedScoreArea bottom">';
	code += '<div class="col-fn-2 border_once number">&nbsp;</div>';
	code += '<div class="col-fn-8">';
	code += '<div class="rows border updatedScore">';

	for(var i = 1; i <= 6; i++) {
		var scData = score["updatedScore_" + i];

		if(scData == null || scData == '') {
			scData = '';
      code += '<div class="col-fn-2 updatedScore' + i + '">' + scData + '</div>';
		}
    else {
      code += '<div class="col-fn-2 updated updatedScore' + i + '">' + scData + '</div>';
    }
	}

	code += '</div>';
	code += '</div>';
	code += '<div class="col-fn-2 border_once updatedScoreTotal">&nbsp;</div>';
	code += '</div>';
	code += '</div>';

	$('.scoreCardBody').prepend(code);
}

function viewUpdate(perEnd, arrows, score) {
    $('.perEnd' + perEnd + ' .updatedScore' + arrows).text(score);

    $('.perEnd' + perEnd + ' .score' + arrows).addClass('updated');
    $('.perEnd' + perEnd + ' .score' + arrows).addClass('updated through');
    $('.perEnd' + perEnd + ' .updatedScore' + arrows).addClass('updated');

    processing(perEnd);
}

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
  $('.perEnd' + perEnd + ' .scoreTotal').text(subTotal);
  $('.subTotalHeader' + perEnd).text(subTotal);

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

  $('.subTotalHeaderTotal').text(total);

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
    if(window.confirm('この得点で決定しますか?') == true) {

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

// 試合終了
socket.on('broadcastCloseMatch', function(data) {
  console.log('broadcastCloseMatch');
  console.log(data); 
});

// リンクの更新
$(function() {
  // 得点表作成へのリンクの生成
  $('.scoreCardIndexLink').attr('href', '/scoreCardIndex?m_id=' + getQueryString().m_id);
});

$('.numberTextBox').change(function() {
  if(window.confirm('ゼッケン番号を送信しますか?') == true) {

    var data = {};

    data['sessionID'] = document.cookie;
    data['sc_id'] = getQueryString().sc_id;

    data['number'] = $('.numberTextBox').val();

    number = $('.numberTextBox').val();

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
});

socket.on('broadcastInsertPrefectures', function(data) {

  console.log('on broadcastInsertPrefectures');
  console.log(data);

  prefectures = data.Prefectures;

  $('.prefecturesTextBox').val(prefectures);
});

