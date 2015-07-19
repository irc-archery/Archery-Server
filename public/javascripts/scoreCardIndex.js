var socket = io('/scoreCardIndex');

socket.emit('joinMatch', {'m_id': getQueryString().m_id, 'sessionID': document.cookie})

// On Extract ScoreCard Index
socket.on('extractScoreCardIndex', function(data){

  console.log(data);

  var code = '';

  code += '<tr><td colspan="5" style="text-align: center;">m_id : ' + getQueryString().m_id + '</td></tr>';

  code += '<tr><th>sc_id</th><th>playerName</th><th>perEnd</th><th>scoreTotal</th><th>&nbsp;</th></tr>';

  for (var i = 0; i < data.length; i++) {
    
    code += '<tr>';
    code += '<td>' + data[i]['sc_id'] + '</td>';
    code += '<td>' + data[i]['playerName'] + '</td>';
    code += '<td>' + data[i]['perEnd'] + '</td>';
    code += '<td>' + data[i]['total'] + '</td>';
    code += '<td><a href="/scoreCard?m_id=' + getQueryString().m_id + '&sc_id=' + data[i]['sc_id'] + '">Join</a></td>';

    code += '</tr>';
  }

  $("#scoreCardIndexArea").append(code);
});

socket.on('broadcastInsertScoreCard', function(data) {
  console.log('on broadcastInsertScoreCard');
  console.log(data);

  var code = '';

  code += '<tr>';
  code += '<td>' + data['sc_id'] + '</td>';
  code += '<td>' + data['playerName'] + '</td>';
  code += '<td>' + data['perEnd'] + '</td>';
  code += '<td>' + data['total'] + '</td>';
  code += '<td><a href="/scoreCard?m_id=' + getQueryString().m_id + '&sc_id=' + data['sc_id'] + '">Join</a></td>';

  code += '</tr>';

  $('#scoreCardIndexArea').append(code);

});

socket.on('broadcastCloseMatch', function(data) {
  console.log('broadcastCloseMatch');
  console.log(data); 
});