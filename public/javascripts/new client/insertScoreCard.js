var socket = io('/scoreCardIndex');

// Emit Insert Score Card
function insertScoreCard() {

  var data = new Object();

  data['m_id'] = getQueryString().m_id;
  data['email'] = $('#emailinput').val();
  console.log($('#emailinput').val());
  
  data['password'] = $('#passwordinput').val();
  console.log($('#passwordinput').val());

  console.log('emit insertScoreCard');
  console.log(data);

  socket.emit('insertScoreCard', data);
};