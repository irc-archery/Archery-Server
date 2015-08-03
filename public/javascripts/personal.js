$(function() {

	$.ajax({
		url: '/app/personal',
		type: 'GET',
		dataType: 'json',
		success: function(data, textStatus) {
		    console.log(data);

		    if(data != undefined) {

		    	$('.playerName').append(data.playerName);
		    	$('.email').append(data.email);
		    	$('.birth').append(data.birth);

		    	var sex = '';

		    	switch(data.sex) {
		    		case 0:
		    			sex = '男';
		    			break;
		    		case 1:
		    			sex = '女性';
		    			break;
		    		case 8:
		    			sex = 'その他';
		    			break;
		    		case 9:
		    			sex = '未設定';
		    			break;
		    		default: 
		    			sex = data.sex;
		    			break;
		    	}

		    	$('.sex').append(sex);

		    	var organizationName = '';

		    	if(data.organizationName != null) {
		    		organizationName = data.organizationName;	
		    	}
		    	else {
		    		organizationName = '無所属';
		    	}

		    	$('.organizationName').append(organizationName);

		    	var record = '';

		    	if(data.record != '') {

		    		record += '<tr><th>日時</th><th>試合</th><th>合計</th><th>平均</th></tr>';

			    	for(var i = 0; i < data.record.length; i++) {

			    		record += '<tr><td>' + data.record[i].created + '</td><td>' + data.record[i].matchName + '</td><td>' + data.record[i].sum + '</td><td>' + data.record[i].sum / data.record[i].perEnd / data.record[i].arrows + '</td></tr>';
			    	}
		    	}	
		    	else {

		    		record += '<div class="alert alert-info" role="alert">まだ、得点表は作成されていません。得点表を作成するためには、<a href="/matchIndex" class="alert-link">試合一覧画面</a>より参加したい試合を選択し、得点表を作成してください。</div>';
		    	}

		    	$('#recordArea').append(record);



		    	displayLineChart(data.record)
		    }
		},
		error: function(err) {
		    console.log(err);
		}
	});
});