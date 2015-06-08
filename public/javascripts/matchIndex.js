/* Socket.IO */

//var socket = io();
var socket = io('/matchIndex');

// Emit Extract Match Index
socket.emit('extractMatchIndex', {'sessionID': document.cookie});

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

    code += "<th></th>";

    code += "</tr>";

    for (var i = 0; i < data.length; i++) {

      code += "<tr>";

      Object.keys(data[i]).forEach(function (key) {
        code += "<td>" + data[i][key] + "</td>";
      });

      code += "<td><a href='/scoreCardIndex?m_id=" + data[i]['m_id'] + "'>Join</a></td>";

      code += "</tr>";

    }
    console.log(code);
    $("#matchIndexArea").append(code);
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