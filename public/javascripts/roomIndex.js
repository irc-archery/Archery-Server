var socket = io.connect();

socket.on('init', function (data) {
  console.log('init!');
  console.log(data);
});

// 得点表一覧を表示
socket.on('getIndex', function (data) {

  var code = '';

  // table
  code += "<table border=1>";
  code += "<tr><th>id</th><th>matchName</th><th>playerNum</th><th>shotNum</th><th>setNum</th><th>length</th><th>role</th></tr>";

  for (var i = 0; i < data.length; i++) {

    code += "<tr>";

    code += "<td>" + data[i]['id'] + "</td>";
    code += "<td>" + data[i]['matchName'] + "</td>";
    code += "<td>" + data[i]['playerNum'] + "</td>";
    code += "<td>" + data[i]['shotNum'] + "</td>";
    code += "<td>" + data[i]['setNum'] + "</td>";
    code += "<td>" + data[i]['length'] + "</td>";
    code += "<td>" + data[i]['role'] + "</td>";

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

function getScoreCard(){

  //var id = $('#scoreCardNumber');
  id = 1;

  console.log('score card number:')
  console.log(id);

  socket.emit('getScoreCard', {id: id});
}

