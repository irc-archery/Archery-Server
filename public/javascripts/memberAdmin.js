$(function() {
	$.ajax({
		url: '/app/organization/members',
		type: 'GET',
		dataType: 'json',
		success: function(data, textStatus) {
		    console.log(data);

		    if(data != undefined) {

		    	$('.organizationName').append(data.organizationName);

		    	$('.members').append(data.members);

		    	var code = '';

				// memberの数分だけループ
		    	for(var i = 0; i < data.memberList.length; i++) {

				    code += '<tr class="openModal" data-personalid="' + data.memberList[i]['p_id'] + '" data-toggle="modal" data-target="#memberModal">';
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