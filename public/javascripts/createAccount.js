
// foucs時のerr処理
$('.form-group input').focus(function() {

	if($(this).val() != '') {
		$(this).parent().removeClass('has-error');	
		$(this).next('.text-danger').hide();
	}

}).blur(function() {

	if($(this).val() == '') {
		$(this).parent().addClass('has-error');
		$(this).next('.text-danger').show();
	}

	if($(this).val() != '') {
		$(this).parent().removeClass('has-error');	
		$(this).next('.text-danger').hide();
	}
});

// パスワードの再確認
$('#password2').blur(function() {
	if($('#password').val() != $('#password2').val()) {
		$('.passwordErr').show();
		$(this).parent().addClass('has-error');
	}
	else {
		$('.passwordErr').hide();
		$(this).parent().removeClass('has-error');	
	}
});

$('#send').on('click', function() {

	var postFlag = true;

	var data = {};

	data['lastName'] = $('#lastName').val();
	data['firstName'] = $('#firstName').val();
	data['rubyLastName'] = $('#rubyLastName').val();
	data['rubyFirstName'] = $('#rubyFirstName').val();
	data['email'] = $('#email').val();
	data['birth'] = $('#birth').val();
	data['sex'] = $('#sex').val();

	if($('#password').val() == $('#password2').val()) {
		data['password'] = $('#password').val();
		$('.passwordErr').hide();
	}
	else {
		data['password'] = $('#password').val();
		$('#password2').parent().addClass('has-error');
		postFlag = false;
	}

	console.log(data);

	// 入力漏れが存在するか確認
	Object.keys(data).forEach(function(key) {

		if(data[key] == '') {
			$('.' + key).parent().addClass('has-error');
			$('.' + key).next('.text-danger').show();

			postFlag = false;
		}
	});

	console.log(postFlag);

	if(postFlag) {
		$.ajax({
			url: '/app/createAccount',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data, textStatus) {

				console.log(data);

				if(data.results == true) {
					alert('アカウント作成に成功しました。');
					location.href = '/personal';
				}
				else if(data.results == false) {
					var code = '';

					code += '<div class="alert alert-danger alert-dismissible" role="alert">'
					code += '<a href="#" type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></a>';
					code += data.err;
					code += '</div>';

					$('.errArea').html(code).hide().fadeIn(600);
				}
				else {
					var code = '';

					code += '<div class="alert alert-danger alert-dismissible" role="alert">'
					code += '<a href="#" type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></a>';
					code += '接続に失敗しました。通信状況を確認してもう一度お試しください';
					code += '</div>';
					
					$('.errArea').html(code).hide().fadeIn(600);	
				}
			},
			error: function(err) {
				alert('接続に失敗しました。通信状況を確認してもう一度お試しください。');
			}
		});
	}
});
