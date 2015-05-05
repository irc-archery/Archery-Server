var socket = io.connect();

socket.emit('extractMatchIndex');
console.log('emit extractMatchIndex');

// match一覧を表示
socket.on('extractMatchIndex', function (data) {

  console.log('output extractMatchIndex');
  console.log(data);

  var code = '';

  // table
  code += "<table border=1 style='padding: 5;'>";
  code += "<tr><th>m_id</th><th>matchName</th><th>length</th></tr>";

  for (var i = 0; i < data.length; i++) {

    code += "<tr>";

    code += "<td>" + data[i]['m_id'] + "</td>";
    code += "<td>" + data[i]['matchName'] + "</td>";
    code += "<td>" + data[i]['length'] + "</td>";

    code += "</tr>";
  }

  code += "</table>";

  $("#tableArea").append(code);
});

// 得点表の情報を出力
socket.on('getScoreCard', function (data) {
  console.log('bellow is Score card data');
  console.log(data);
});

function extractScoreCardIndex(){

  var id = $('#matchNumber').val();

  console.log('score card number:');
  console.log(id);

  socket.emit('extractScoreCardIndex', {'m_id': id});
}

socket.on('extractScoreCardIndex', function(data){
  console.log('extractScoreCardIndex data');
  console.log(data); 
});



