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
    for (var i = 0; i < data.length; i++) {
      code += '<tr class="openModal" data-match="' + data[i]['m_id'] + '" data-toggle="modal" data-target="#matchModal"><td>' + data[i]['matchName'] + '</td><td>' + data[i]['sponsor'] + '</td></tr>';

      // save the data
      globalData[data[i]['m_id']] = data[i];
    }

    $("#matchIndexArea").append(code);
  }
  else {
    // 現在は参加できる試合が存在しないことを通知

    var infoCode = '<div class="alert alert-info" role="alert">現在開催されている試合はありません。右上のアイコンから移動できる<a href="/insertMatch" class="alert-link">試合作成画面</a>から新たに試合を作成するか、他の人が試合を作成するのをお待ちください。</div>';

    $('.infoArea').append(infoCode);
  }
});

socket.on('broadcastInsertMatch', function(data) {

 console.log(data);

  if(data != '') {
    var code = '';

    code += '<tr class="openModal" data-match="' + data['m_id'] + '" data-toggle="modal" data-target="#matchModal"><td>' + data['matchName'] + '</td><td>' + data['sponsor'] + '</td></tr>';

    // save the data
    globalData[data['m_id']] = data;

    $("#matchIndexArea").append(code);
    $('.infoArea').empty();
  }
})
