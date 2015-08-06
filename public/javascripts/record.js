$(function() {

	$.ajax({
		url: '/app/personal/' + getQueryString().sc_id,
		type: 'GET',
		dataType: 'json',
		success: function(data, textStatus) {

			console.log(data);

		},
		error: function(err) {

		}
	});

});