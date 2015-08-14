// 得点表データの出力
function viewScoreCard(data) {

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
        $('.subTotalHeader' + (i + 1)).text(e(data.score[i].subTotal));
      }
    }

    // total, 10数, x数の出力
    $('.subTotalHeaderTotal').text(e(data.total));
    $('.subTotalHeaderTen').text(e(data.ten));  
    $('.subTotalHeaderX').text(e(data.x));  

    if(match.number == null) {
      match.number = '';
    }

    match.length = lengthOption[data.length];

    for(var i = 0; i < data.countPerEnd; i++) {
      // 得点の表示
      viewScore(data.score[i]);

      // update対応
      $('.perEnd' + data.score[i].perEnd + ' .score div').addClass('comp');
    }
  }

// output scores
function viewScore(score) {

	var code = '';

	code += '<div class="perEnd' + e(score.perEnd) + '">';
	code += '<div class="scoreAreaHeader rows">';
	code += '<div class="col-fn-10 scoreRowsInfo"><span class="perEnd">' + e(score.perEnd) + '</span>回目 : <span class="length">' + e(match.length) + '</span></div>';
	code += '<div class="col-fn-2 border_once scoreTotalHeader">小計</div>';
	code += '</div>';

	code += '<div class="rows scoreArea">';
	code += '<div class="col-fn-2 border_once number broadcastNumber">' + e(match.number) + '</div>';
	code += '<div class="col-fn-8">';
	code += '<div class="rows border score">';

	for(var i = 1; i <= 6; i++) {
    var scData = score["updatedScore_" + i];

    // 得点が修正済み
    if(scData != null && scData != '') {
      code += '<div class="col-fn-2 updated through score' + i + '" data-score="' + i + '" data-perend="' + e(score.perEnd) + '">' + e(score['score_' + i]) + '</div>';
    } 
    else {
      code += '<div class="col-fn-2 score' + i + '" data-score="' + i + '" data-perend="' + e(score.perEnd) + '">' + e(score['score_' + i]) + '</div>';
    } 
	}

	code += '</div>';
	code += '</div>';
	code += '<div class="col-fn-2 border_once scoreTotal">' + e(score.subTotal) + '</div>';
	code += '</div>';

	code += '<div class="rows updatedScoreArea bottom">';
	code += '<div class="col-fn-2 border_once number">&nbsp;</div>';
	code += '<div class="col-fn-8">';
	code += '<div class="rows border updatedScore">';

	for(var i = 1; i <= 6; i++) {
		var scData = score["updatedScore_" + i];

		if(scData == null || scData == '') {
			scData = '';
      code += '<div class="col-fn-2 updatedScore' + i + '">' + e(scData) + '</div>';
		}
    else {
      code += '<div class="col-fn-2 updated updatedScore' + i + '">' + e(scData) + '</div>';
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