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

$('.deleteScoreCard').on('click', function() {

	var prompt = '本当にこの得点表を削除しますか';

	if(window.confirm(prompt) == true) {

		$.ajax({
			url: '/app/personal/record/' + getQueryString().sc_id,
			type: 'DELETE',
			dataType: 'json',
			success: function(data, textStatus) {

				if(data.results == true) {
					alert('この得点表の削除に成功しました。');	
					location.href = '/personal/recordIndex';
				}
				else if (data.results == false) {
					alert('この得点表の削除に失敗しました。');
				}
			},
			error: function(err) {
				alert('サーバーとの接続に失敗しました。通信状況を確認してください。');
			}
		});
	}
});