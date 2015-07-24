var socket = io('/matchIndex');

// Emit Insert Match
function insertMatch() {

  var data = new Object();

  data['sessionID'] = document.cookie;
  data['matchName'] = $('#matchName').val();
  data['sponsor'] = $('#sponsor').val();
  data['arrows'] = 6;
  data['perEnd'] = 6;
  data['length'] = $('#length').val();
  data['permission'] = $('#permission').val();

  console.log('emit insertMatch');
  console.log(data);

  socket.emit('insertMatch', data);
};

socket.on('insertMatch', function(data) {
  console.log('on insertMatch')
  console.log(data);

  location.href = "/scoreCardIndex?m_id=" + data.m_id;
});
