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

// コメント受信時に発生するイベントのハンドラー
socket.on('receive', function (data) {
  var element = "<form class='rows' data-id='" + data.id + "'>\
        <div class='form-group'>\
        <div>" + data.name + " : " + data.message +  "</div>\
        </div>\
        <div class='form-group'>\
        <button type='button' data-id='" + data.id + "' class='btn btn-warning' onclick='message_delete(this.dataset.id)'>Delete</button>\
        </div>\
        </form>";
      
  $("div#chat-area").prepend(element);
  $("form[data-id='" + data.id + "']").hide().fadeIn(1000);
});

// 初回接続時にDBに格納されているデータを受け取るイベントのハンドラー
socket.on('init_receive', function (data){
  for (var i = 0; i < data.length; i++){
        var element = "<form class='rows' data-id='" + data[i].id + "'>\
        <div class='form-group'>\
        <div>" + data[i].name + " : " + data[i].message +  "</div>\
        </div>\
        <div class='form-group'>\
        <button type='button' data-id='" + data[i].id + "' class='btn btn-warning' onclick='message_delete(this.dataset.id)'>Delete</button>\
        </div>\
        </form>";
      
        $("div#chat-area").prepend(element);
	$("form[data-id='" + data[i].id + "']").hide().fadeIn(1000);
  }
});

// コメントを削除するイベントのハンドラー
socket.on('ClDelete', function(data){
  $("form[data-id='" + data.id + "']").remove();		
});

socket.on('truncate', function(data){
  $("div#chat-area").empty(); 
});

// コメントをサーバに送信する関数
function Send() {
  var name = $("input#name").val();
  var msg = $("input#message").val();
  $("input#message").val("");
  socket.emit('send', { name: name, message: msg });
}

// コメントの削除要請をする関数
function message_delete(arg_id){
  socket.emit("SeDelete", {id: arg_id});
}

function trunCate(){
  socket.emit('truncate');
}
