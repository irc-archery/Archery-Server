var socket = io.connect();

// Emit Extract Match Index
socket.emit('extractMatchIndex');

// On Extract Match Index
socket.on('extractMatchIndex', function (data) {

  console.log(data);

  var code = '';

  // table
  code += "<tr>"

  Object.keys(data[0]).forEach(function (key) {
    code += "<th>" + key + "</th>";
  });

  code += "</tr>";

  for (var i = 0; i < data.length; i++) {

    code += "<tr>";

    Object.keys(data[i]).forEach(function (key) {
      code += "<td>" + data[i][key] + "</td>";
    });

    code += "</tr>";
  }

  $("#matchIndexArea").append(code);
});

// Emit Insert Match
function insertMatch() {

  var p_id = $('#p_id').val();
  var matchName = $('#matchName').val();
  var sponsor = $('#sponsor').val();
  var arrows = $('#arrows').val();
  var perEnd = $('#perEnd').val();
  var length = $('#length').val();

  socket.emit('insertMatch', {
    'p_id': p_id,
    'matchName': matchName,
    'sponsor': sponsor,
    'arrows': arrows,
    'perEnd': perEnd,
    'length': length
  });
}

// Emit Extract ScoreCard Index
function extractScoreCardIndex(){

  var id = $('#matchNumber').val();

  socket.emit('extractScoreCardIndex', {'m_id': id});
}

// On Extract ScoreCard Index
socket.on('extractScoreCardIndex', function(data){

  console.log(data);

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


