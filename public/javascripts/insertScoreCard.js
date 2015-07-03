var socket = io('/scoreCardIndex');

// Emit Insert Score Card
function insertScoreCard() {

  var data = new Object();

  data['m_id'] = getQueryString().m_id;
  data['email'] = $('#email').val();
  data['password'] = $('#password').val();

  console.log('emit insertScoreCard');
  console.log(data);

  socket.emit('insertScoreCard', data);
};

socket.on('insertScoreCard', function(data) {

  console.log('on insertScoreCard')
  console.log(data);
  $('#insertScoreCardArea').append('<p>{ sc_id: ' + data.sc_id + ' }</p>');
});

function showForm(flag){

  if(flag) {
  }
  else{
    
  }
}