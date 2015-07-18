
//$("div[data-role*='page']").on("on pageshow" , function() {

    // 試合一覧の取得
    var socket = io("/matchIndex");
    socket.emit("extractMatchIndex", {"sessionID": document.cookie});

    socket.on("extractMatchIndex" , function(data) {
        
        console.log(data);
        
        if (data != "") {
            
            var set = "";
        
            for (var i = 0; i < data.length; i++) {
                
                // 要素の生成用
                set = "<li class='indexList'><a class='ui-btn ui-btn-icon-right ui-icon-carat-r' href='/scoreCardIndex?m_id=" + data[i]['m_id'] + "' rel='external'><table><tr>";

                set += "<td>" + data[i].matchName + "</td>";
                set += "<td>" + data[i].sponsor + "</td>";
                set += "<td>" + data[i].created + "</td>";
                set += "<td>" + data[i].players + "</td>";
                
                /*Object.keys(data[i]).forEach(function (key) {
                    if (data[i].hasOwnProperty("matchName") == true || data[i].hasOwnProperty("sponsor") == true
                        || data[i].hasOwnProperty("created") == true || data[i].hasOwnProperty("players") == true) {
                        set += "<td>" + data[i][key] + "</td>";
                        alert("true");
                    }
                });*/

                set += "</tr></table></a></li>";
                console.log(set);
                
                $("#list").append(set);
            }
        }
    });

//});

