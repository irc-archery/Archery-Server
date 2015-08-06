
$('#send').on('click', function() {

	console.log('fnit');

	var data = {};

	data['lastName'] = $('#lastName').val();
	data['firstName'] = $('#firstName').val();
	data['rubyLastName'] = $('#rubyLastName').val();
	data['rubyFirstName'] = $('#rubyFirstName').val();
	data['email'] = $('#email').val();

	if($('#password').val() == $('#password2').val()) {
		data['password'] = $('#password').val();
	}
	else {
		$("#password").parent().addClass('has-error');
	}





/*

	$.ajax({
		url: '/',
		type: 'POST',
		dataType: 'json',
		data: data,
		success: function(data, textStatus) {
			if(data != undefined) {

				if(data.results == true) {
					code += '<div class="alert alert-success" role="alert">';
						code +=	'アカウントのメンバーの追加に成功しました'; 
						code += '</div>';

						$('#email').val('');
						$('#password').val('');
				}
				else if(data.results == false) {
					code += '<div class="alert alert-danger" role="alert">';
					code += data.err;
					code += '</div>';
				}

				$('.infoArea').empty();
				$('.infoArea').html(code).hide().fadeIn(600);

			}
		},
		error: function(err) {
			console.log(err);
		}
	});

*/
});
