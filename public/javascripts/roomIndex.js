var socket = io.connect();

// Emit Extract Match Index
socket.emit('extractMatchIndex');

// debug
socket.emit('extractAllScore');
socket.emit('extractAllScoreTotal');
socket.emit('extractAccountTable');
socket.emit('extractOrganizationTable');
socket.emit('extractScoreCardTable');
socket.emit('extractMatchTable');

socket.on('extractAllScore', function (data) {

  console.log('on extractALlScore for debug');
  console.log(data);

  if(data != '') {

  var code = '';

  code += '<tr>';

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

  console.log(code);

  $('#extractAllScoreArea').append(code);

  }

});

socket.on('extractAllScoreTotal', function (data) {

  console.log('on extractALlScoreTotal for debug');
  console.log(data);

  if(data != '') {
  var code = '';

  code += '<tr>';

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

  console.log(code);

  $('#extractAllScoreTotalArea').append(code);
  }

});

socket.on('extractAccountTable', function (data) {

  console.log('on extractAccountTable for debug');
  console.log(data);

  if(data != '') {
  var code = '';

  code += '<tr>';

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

  console.log(code);

  $('#extractAccountTable').append(code);

  }

});

socket.on('extractOrganizationTable', function (data) {

  console.log('on extractOrganizationTable for debug');
  console.log(data);

  if(data != '') {
  var code = '';

  code += '<tr>';

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

  console.log(code);

  $('#extractOrganizationTable').append(code);
  }

});

socket.on('extractScoreCardTable', function (data) {

  console.log('on extractScoreCardTable for debug');
  console.log(data);

  if(data != '') {
  var code = '';

  code += '<tr>';

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

  $('#extractScoreCardTable').append(code);
  }

});

socket.on('extractMatchTable', function (data) {

  console.log('on extractMatchTable for debug');
  console.log(data);

  if(data != '') {
  var code = '';

  code += '<tr>';

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

  $('#extractMatchTable').append(code);
  }

});
// On Extract Match Index
socket.on('extractMatchIndex', function (data) {

  console.log(data);

  if(data != '') {
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
  }
});

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
    code += '<td>' + data[i]['total'] + '</td>';

    code += '</tr>';
  }

  code += '</tbody>';

  $("#scoreCardIndexArea").append(code);
});

socket.on('extractScoreCard', function (data) {

  console.log(data);

});

socket.on('broadcastInsertScore', function (data) {

  console.log('on boradcastInsertScore');
  console.log(data);

});

socket.on('broadcastUpdateScore', function (data) {
  console.log('on broadcasetUpdateScore');
  console.log(data);
})

// Emit Extract ScoreCard Index
function extractScoreCardIndex(){

  var id = $('#matchNumber').val();

  socket.emit('extractScoreCardIndex', {'m_id': id});
};

function extractScoreCard () {

  var id = $('#scoreCardNumber').val();

  socket.emit('extractScoreCard', {'sc_id': id});

}

// Emit Insert Match
function insertMatch() {

  var data = new Object();

  data['p_id'] = $('#insertMatchP_id').val();
  data['matchName'] = $('#matchName').val();
  data['sponsor'] = $('#sponsor').val();
  data['arrows'] = $('#arrows').val();
  data['perEnd'] = $('#insertMatchPerEnd').val();
  data['length'] = $('#length').val();

  console.log('emit insertMatch');
  console.log(data);

  socket.emit('insertMatch', data);
};

// Emit Insert Score Card
function insertScoreCard() {

  var data = new Object();

  data['p_id'] = $('#insertScoreCardP_id').val();
  data['m_id'] = $('#insertScoreCardM_id').val();

  console.log('emit insertScoreCard');
  console.log(data);

  socket.emit('insertScoreCard', data);
}

// Emit Insert Score
function insertScore() {

  var data = new Object();

  data['sc_id'] = $('#insertScoreSc_id').val();
  data['p_id'] = $('#insertScoreP_id').val();
  data['perEnd'] = $('#insertScorePerEnd').val();

  for(var i = 1; i <= 6; i++) {
    data['score_' + i]  = $('#score_' + i).val();
  }

  data['subTotal'] = $('#subTotal').val();
  data['ten'] = $('#ten').val();
  data['x'] = $('#x').val();
  data['total'] = $('#total').val();

  console.log('emit insertScore')
  console.log(data);

  socket.emit('insertScore', data);
};

// Emit Update Score
function updateScore() {

  var data = new Object();

  data['sc_id'] = $('#updateScoreSc_id').val();
  data['p_id'] = $('#updateScoreP_id').val();
  data['perEnd'] = $('#updateScorePerEnd').val();

  for(var i = 1; i <= 6; i++) {
    if($('#updatedScore_' + i).val() != ''){
      data['updatedScore_' + i]  = $('#updatedScore_' + i).val();
    }
  }

  data['subTotal'] = $('#updatedSubTotal').val();
  data['ten'] = $('#updatedTen').val();
  data['x'] = $('#updatedX').val();
  data['total'] = $('#updatedTotal').val();

  console.log('emit updateScore');
  console.log(data);

  socket.emit('updateScore', data);
};




