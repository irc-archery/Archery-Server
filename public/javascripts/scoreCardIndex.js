// 得点表一覧の取得
var socket = io("/scoreCardIndex");
socket.emit("joinMatch", {"m_id": getQueryString().m_id, "sessionID": document.cookie});

socket.on('extractScoreCardIndex', function(data){	
    
    console.log(data);
    
    if (data != "")
    {
        var set = "";
        
        for (var i = 0; i < data.length; i++) 
        {
            set = "<li class='indexList'><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' href='/scoreCard?m_id=" + getQueryString().m_id + "&sc_id=" + data[i]["sc_id"] + "' rel='external'><table><tr>";
            
            set += "<td>" + data[i]["playerName"] + "</td>";
            set += "<td>" + data[i]["perEnd"] + "</td>";
            set += "<td>" + data[i]["total"] + "</td>";
            
            set += "</tr></table></a></li>";
            
            console.log(set);
            
            $("#list").append(set);
        }
    }
});

socket.on('insertScoreCard', function(data) {

  console.log('on insertScoreCard');
  console.log(data);
    
  var set = "";
    
  set = "<li class='indexList'><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' href='/scoreCard?m_id=" + getQueryString().m_id + "&sc_id=" + data.sc_id + "' rel='external'><table><tr>";
            
  set += "<td>" + data.playerName + "</td>";
  set += "<td>" + data.perEnd + "</td>";
  set += "<td>" + data.total + "</td>";

  set += "</tr></table></a></li>";
   
  $("#list").append(set);
});