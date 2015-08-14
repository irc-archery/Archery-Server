var o_id;

$(function() {

	$.ajax({
		url: '/app/organization',
		type: 'GET',
		dataType: 'json',
		success: function(data, textStatus) {
		    console.log(data);

		    if(data != undefined) {

		    	o_id = data.o_id;

		    	$('.organizationName').append(e(data.organizationName));

		    	$('.admin').append(e(data.admin));

		    	$('.email').append(e(data.email));

		    	$('.establish').append(e(data.establish));

		    	$('.place').append(e(data.place));

		    	$('.members').append(e(data.members));

		    	var code = '';

				// memberの数分だけループ
		    	for(var i = 0; i < data.memberList.length; i++) {

		    		code += '<tr>';
		    		code += '<td>' + e(data.memberList[i]['playerName']) + '</td>';
		    		code += '<td>' + e(data.memberList[i]['birth']) + '</td>';
		    		code += '<td>' + e(data.memberList[i]['email']) + '</td>';
		    		code += '</tr>';
		    	}

		    	$('#memberListArea').append(code);

		    	if(data.permission == false) {
		    		$('.creater').remove();	
		    	}
		    }
		},
		error: function(err) {
		    console.log(err);
		}
	});
});

// 団体削除
$('.deleteOrganization').on('click', function() {

	var prompt = '本当にこの団体を削除しますか?';

	if(window.confirm(prompt) == true) {

		$.ajax({
			url: '/app/organization/' + o_id,
			type: 'DELETE',
			dataType: 'json',
			success: function(data, textStatus) {
			    console.log(data);
			    if(data.results == true) {
			    	alert('団体の削除に成功しました');
			    	location.href = '/login';
			    }
			    else if(data.results == false) {
			    	alert(data.err);	
			    }
			},
			error: function(err) {
				console.log(err);	
				alert('団体の削除に失敗しました。');
			}
		});
	}

});