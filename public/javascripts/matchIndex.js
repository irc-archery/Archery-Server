/* Socket.IO */

//var socket = io();
var socket = io('/matchIndex');

// Emit Extract Match Index
socket.emit('extractMatchIndex', {'sessionID': getCookie()});

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
