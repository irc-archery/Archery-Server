$(function() {
	// ページ読み込み時に実行	
	getMembers();
});

// メンバー一覧を取得
function getMembers() {
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

		    	code += '<tr><th>選手名</th><th>生年月日</th><th>Eメール</th></tr>';

				// memberの数分だけループ
		    	for(var i = 0; i < data.memberList.length; i++) {

				    code += '<tr class="openModal" data-personalid="' + data.memberList[i]['p_id'] + '" data-toggle="modal" data-target="#memberModal">';
		    		code += '<td class="playerName">' + data.memberList[i]['playerName'] + '</td>';
		    		code += '<td class="birth">' + data.memberList[i]['birth'] + '</td>';
		    		code += '<td class="email">' + data.memberList[i]['email'] + '</td>';
		    		code += '</tr>';
		    	}

		    	$('#memberListArea').empty();
		    	$('#memberListArea').append(code);
		    }
		},
		error: function(err) {
		    console.log(err);
		}
	});
}

// メンバー追加ボタン
$('.addMember').on('click', function() {

	var data = {};
	var dataFlag = true;

	data.email = $('#email').val();
	data.password = $('#password').val();

	console.log(data);

	if(data.email == '') {
		$('#email').parent().addClass('has-error');	
		dataFlag = false
	}

	if(data.password == '') {
		$('#password').parent().addClass('has-error');
		dataFlag = false;
	}

	if(dataFlag) {

		$('.has-error').removeClass('has-error');

		$.ajax({
			url: '/app/organization/members/',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data, textStatus) {
				if(data != undefined) {

					var code = '';

					if(data.results == true) {
						code += '<div class="alert alert-success" role="alert">';
  						code +=	'アカウントのメンバーの追加に成功しました'; 
  						code += '</div>';

  						$('#email').val('');
  						$('#password').val('');
					}
					else if(data.results == false) {
						code += '<div class="alert alert-danger" role="alert">';
  						code +=	'アカウントのメンバーの追加に失敗しました。ログイン名とパスワードを確認してください。'; 
  						code += '</div>';
					}

					$('.infoArea').empty();
					$('.infoArea').html(code).hide().fadeIn(600);

					getMembers();
				}
			},
			error: function(err) {
				console.log(err);
			}
		});
	}
});

// アカウント削除のモーダルウィンドウを表示
$('#memberListArea').on('click', '.openModal', function() {

	console.log(this);
	console.log();

	var playerName = $(this).children('.playerName').text();
	var birth = $(this).children('.birth').text();
	var email = $(this).children('.email').text();

	$('.modal-playerName').text(playerName);
	$('.modal-birth').text(birth);
	$('.modal-email').text(email);

	$('.deleteAccount').data('personalid', $(this).data('personalid'));
});

// アカウント削除ボタン
$('.deleteAccount').on('click', function() {

	console.log($(this).data('personalid'));
	var p_id = $(this).data('personalid');

	$.ajax({
		url: '/app/organization/members/' + p_id,
		type: 'DELETE',
		dataType: 'json',
		success: function(data, textStatus) {
		    console.log(data);

		    if(data != undefined) {

		    	var code = '';

		    	if(data.results == true) {
					code += '<div class="alert alert-success" role="alert">';
					code +=	'アカウントのメンバーの削除に成功しました'; 
					code += '</div>';
		    	}
		    	else if(data.results == false){
					code += '<div class="alert alert-danger" role="alert">';
					code += data.err;
					code += '</div>';
		    	}

		    	$('.infoArea2').empty();
		    	$('.infoArea2').html(code);

	    		getMembers();
		    }
		},
		error: function(err) {
			console.log(err);	
		}
	});
});