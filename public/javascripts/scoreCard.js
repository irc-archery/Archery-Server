var socket = io('/scoreCard');

// 得点表データの要求 & Sessionによるユーザー認証
socket.emit('extractScoreCard', {'sessionID': document.cookie, 'sc_id': getQueryString().sc_id});

// リンクの更新
$(function() {
  // 得点表作成へのリンクの生成
  $('.scoreCardIndexLink').attr('href', '/scoreCardIndex?m_id=' + getQueryString().m_id);
});

// 得点表データの出力
socket.on('extractScoreCard', function(data) {

  console.log('on extractScoreCard');
  console.log(data);

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
	  	$('.subTotalHeader' + i).text(data.score[i].subTotal);
  	}
  }

  // total, 10数, x数の出力
  $('.subTotalHeaderTotal').text(data.total);
  $('.subTotalHeaderTen').text(data.ten);  
  $('.subTotalHeaderX').text(data.x);  

  var number = data.number;

  if(number == null) {
  	number = '';
  }

  var lengthOption = ["90m", "70m", "60m", "50m", "40m", "30m", "70m前", "70m後"];

  var length = lengthOption[data.length];

  for(var i = 0; i < data.countPerEnd; i++) {
  	viewScore(data.score[i], length, number);
  }
});

// output scores
function viewScore(score, length, number) {

	console.log(score);

	var code = '';

	code += '<div class="perEnd' + score.perEnd + '">'
    code += '<div class="scoreAreaHeader rows">';
	code += '<div class="col-fn-10 scoreRowsInfo"><span class="perEnd">' + score.perEnd + '</span>回目 : <span class="length">' + length + '</span></div>';
	code += '<div class="col-fn-2 border_once">小計</div>';
	code += '</div>';

	code += '<div class="rows scoreArea">';
	code += '<div class="col-fn-2 border_once number">' + number + '</div>';
	code += '<div class="col-fn-8">';
	code += '<div class="rows border score">';

	for(var i = 1; i <= 6; i++) {
		code += '<div class="col-fn-2 score' + i + '">' + score['score_' + i] + '</div>';
	}

	code += '</div>';
	code += '</div>';
	code += '<div class="col-fn-2 border_once scoreTotal">' + score.subTotal + '</div>';
	code += '</div>';

	code += '<div class="rows updatedScoreArea">';
	code += '<div class="col-fn-2 border_once number">&nbsp;</div>';
	code += '<div class="col-fn-8">';
	code += '<div class="rows border updatedScore">';

	for(var i = 1; i <= 6; i++) {
		var scData = score["updatedScore_" + i];

		if(scData == null) {
			scData = '';
		}

		code += '<div class="col-fn-2 updatedScore' + i + '">' + scData + '</div>';
	}

	code += '</div>';
	code += '</div>';
	code += '<div class="col-fn-2 border_once updatedScoreTotal">&nbsp;</div>';
	code += '</div>';
	code += '</div>';

	console.log(code);

	$('.scoreCardBody').prepend(code);
}

// 得点の追加による更新
socket.on('broadcastInsertScore', function (data) {

  console.log('on boradcastInsertScore');
  console.log(data);
});

// 得点の修正による更新
socket.on('broadcastUpdateScore', function (data) {
  console.log('on broadcasetUpdateScore');
  console.log(data);
});

// Emit Insert Score
function insertScore() {

  var data = new Object();

  data['sessionID'] = document.cookie;
  data['sc_id'] = getQueryString().sc_id;
  data['m_id'] = getQueryString().m_id;

  data['perEnd'] = $('#insertScorePerEnd').val();

  for(var i = 1; i <= 6; i++) {
    data['score_' + i]  = $('#score_' + i).val();
  }

  data['subTotal'] = $('#subTotal').val();
  data['ten'] = $('#ten').val();
  data['x'] = $('#x').val();
  data['total'] = $('#total').val();

  console.log('emit insertScore');
  console.log(data);

  socket.emit('insertScore', data);
};

// Emit Update Score
function updateScore() {

  var data = new Object();

  data['sessionID'] = document.cookie;
  data['sc_id'] = getQueryString().sc_id;
  data['m_id'] = getQueryString().m_id;

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

// 試合終了
socket.on('broadcastCloseMatch', function(data) {
  console.log('broadcastCloseMatch');
  console.log(data); 
});

