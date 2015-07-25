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
		    }
		},
		error: function(err) {
		    console.log(err);
		}
	});
});