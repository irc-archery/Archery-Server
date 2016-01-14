var socket = io('/matchIndex');

// foucs時のerr処理
$('#matchName').focus(function() {

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

// Emit Insert Match
function insertMatch() {

  if($('#matchName').val() != '') {

    // lengthが18mの場合はインドア用の競技なのでセット数を5に設定する
    var length = $('#length').val();
    // length == 8で18mだったら5セット、それ以外だったら6セットにする
    var perEnd = length == 8 ? 5 : 6;

    var data = new Object();

    data['sessionID'] = document.cookie;
    data['matchName'] = $('#matchName').val();
    data['sponsor'] = $('#sponsor').val();
    data['length'] = length;
    data['perEnd'] = perEnd;
    data['arrows'] = 6;
    data['permission'] = $('#permission').val();

    console.log('emit insertMatch');
    console.log(data);

    socket.emit('insertMatch', data);
  }
  else {
    $('#matchName').parent().addClass('has-error');
    $('#matchName').next('.text-danger').show();
  }
};

socket.on('insertMatch', function(data) {
  console.log('on insertMatch')
  console.log(data);

  location.href = "/scoreCardIndex?m_id=" + data.m_id;
});
