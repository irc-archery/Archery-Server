$(function() {

	$.ajax({
		url: '/app/organization',
		type: 'GET',
		dataType: 'json',
		success: function(data, textStatus) {
		    console.log(data);

		    if(data != undefined) {

		    	$('.organizationName').append(data.organizationName);

		    	$('.admin').append(data.admin);

		    	$('.email').append(data.email);

		    	$('.establish').append(data.establish);

		    	$('.place').append(data.place);

		    	$('.members').append(data.members);

		    	var code = '';

				// memberの数分だけループ
		    	for(var i = 0; i < data.memberList.length; i++) {

		    		code += '<tr>';
		    		code += '<td>' + data.memberList[i]['playerName'] + '</td>';
		    		code += '<td>' + data.memberList[i]['birth'] + '</td>';
		    		code += '<td>' + data.memberList[i]['email'] + '</td>';
		    		code += '</tr>';
		    	}

		    	$('#memberListArea').append(code);
		    }
		},
		error: function(err) {
		    console.log(err);
		}
	});
});