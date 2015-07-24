/* Socket.IO */

//var socket = io();
var socket = io('/matchIndex');

// Emit Extract Match Index
socket.emit('extractMatchIndex', {'sessionID': document.cookie});

var globalData = {};

$('#matchIndexArea').on('click', 'tr.openModal', function() {

  var data = globalData[$(this).data('match')];

  console.log(data);

  // change the text of modal window 
  $('.modal-matchName').empty();
  $('.modal-matchName').append(data.matchName);

  $('.modal-sponsor').empty();
  $('.modal-sponsor').append(data.sponsor);

  $('.modal-created').empty();
  $('.modal-created').append(data.created);

  $('.modal-length').empty();
  $('.modal-length').append(data.length);

  $('.modal-perEnd').empty();
  $('.modal-perEnd').append(data.perEnd);

  $('.modal-arrows').empty();
  $('.modal-arrows').append(data.arrows);

  $('.modal-players').empty();
  $('.modal-players').append(data.players);

  $('.modal a').attr('href', '/scoreCardIndex/?m_id=' + $(this).data('match'));
});

// On Extract Match Index
socket.on('extractMatchIndex', function (data) {

  console.log(data);

  if(data != '') {
    var code = '';

    // table
    code += '<tr><th>試合名</th><th>主催</th></tr>';

    for (var i = 0; i < data.length; i++) {
      code += '<tr class="openModal" data-match="' + data[i]['m_id'] + '" data-toggle="modal" data-target="#matchModal"><td>' + data[i]['matchName'] + '</td><td>' + data[i]['sponsor'] + '</td></tr>';

      // save the data
      globalData[data[i]['m_id']] = data[i];
    }

    $("#matchIndexArea").empty();
    $("#matchIndexArea").append(code);
  }
  else {
    // 現在は参加できる試合が存在しないことを通知
  }
});

socket.on('broadcastInsertMatch', function(data) {

 console.log(data);

  if(data != '') {
    var code = '';

    code += "<tr>";

    Object.keys(data).forEach(function (key) {
        code += "<td>" + data[key] + "</td>";
    });

    code += "</tr>";

    $("#matchIndexArea").append(code);
  }
})
