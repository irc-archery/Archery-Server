var match = {};

$(function() {

	$.ajax({
		url: '/app/personal/record/' + getQueryString().sc_id,
		type: 'GET',
		dataType: 'json',
		success: function(data, textStatus) {

			console.log(data);

			if(data != '') {

				// 試合データを保存
				match = data;

				// 得点表データを出力
				viewScoreCard(data);	

				// 修正用のhover effectを削除
				$('.comp').removeClass('comp');
			}

		},
		error: function(err) {

		}
	});

});