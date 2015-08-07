$(function() {

	$.ajax({
		url: "/app/personal/record/",
		type: "GET",
		dataType: "json",
		success: function(data, textStatus) {
			if(data != '') {
				console.log(data);

				if(data.status == 1) {
					// 得点表が存在

					var code = '';

	                code += '<tr><th>試合名</th><th>作成日時</th><th>合計</th><th>平均</th></tr>';

					for(var i = 0; i < data.record.length; i++) {

						code += '<tr class="openScoreCard" data-id="' + data.record[i].sc_id + '">';

						code += '<td>' + data.record[i].matchName + '</td>';
						code += '<td>' + data.record[i].created + '</td>';
						code += '<td>' + data.record[i].sum + '</td>';
						code += '<td>' + (data.record[i].sum != 0 ? data.record[i].sum / data.record[i].perEnd / data.record[i].arrows : 0).toFixed(1) + '</td>';

						code += '</tr>';
					}

					$('#recordIndexArea').html(code);
				}
			}
		},
		error: function(err) {
			console.log(err);
		}
	});
});

$('#recordIndexArea').on('click', '.openScoreCard', function() {

	//location.href
	console.log('on click');
	console.log($(this).data('id'));

	location.href = '/personal/record/?sc_id=' + $(this).data('id');
});