var socket = io.connect();

// Emit Extract Match Index
socket.emit('extractMatchIndex');

// On Extract Match Index
socket.on('extractMatchIndex', function (data) {

  var code = '';

  // table
  code += "<tr><th>m_id</th><th>matchName</th><th>length</th></tr>";

  for (var i = 0; i < data.length; i++) {

    code += "<tr>";

    code += "<td>" + data[i]['m_id'] + "</td>";
    code += "<td>" + data[i]['matchName'] + "</td>";
    code += "<td>" + data[i]['length'] + "</td>";

    code += "</tr>";
  }

  $("#matchIndexArea").append(code);
});

// Emit Extract ScoreCard Index
function extractScoreCardIndex(){

  var id = $('#matchNumber').val();

  socket.emit('extractScoreCardIndex', {'m_id': id});
}

// On Extract ScoreCard Index
socket.on('extractScoreCardIndex', function(data){

  var code = '';

  code += '<tbody>';

  code += '<tr><td colspan="4" style="text-align: center;">m_id : ' + $('#matchNumber').val() + '</td></tr>';

  code += '<tr><th>sc_id</th><th>firstName</th><th>lastName</th><th>scoreTotal</th></tr>';

  for (var i = 0; i < data.length; i++) {
    
    code += '<tr>';

    code += '<td>' + data[i]['sc_id'] + '</td>';
    code += '<td>' + data[i]['firstName'] + '</td>';
    code += '<td>' + data[i]['lastName'] + '</td>';
    code += '<td>' + data[i]['scoreTotal'] + '</td>';

    code += '</tr>';
  }

  code += '</tbody>';

  $("#scoreCardIndexArea").append(code);
});


