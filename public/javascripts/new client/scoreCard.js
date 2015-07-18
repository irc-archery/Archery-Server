// スコア表にidをつける
function gamepoint_id() {
	// #scoreにclassを追加 (訂正前の得点表の部分)
	var score_nodes = $(".score tr").children();
    
	for (var i = 1;i <= 7; i++)
	{
		$(score_nodes[i]).addClass("score_id_" + i);
	}
	
	// #revise_scoreにclassを追加 (訂正があった場合の得点表の部分)
	var revise_score_nodes = $(".revise_score tr").children();
	
	for (var i = 1;i <= 7; i++)
	{
		$(revise_score_nodes[i]).addClass("revise_score_id_" + i);
	}
}

// .point内のtableにclassで番号を振る
var game_made = 1;		// 何セット目かを確認する変数
var point_table = 0;
function game_number() {
	var game = 1;
	var table_number = $(".point").children();
	
	// 試合ごとにclassで番号を振る
	for (var i = point_table;i >= 0; i--)
	{
		$(table_number[i]).addClass("game_" + game);
		var game_number = ".game_" + game + " .score tr th";
		game++;
	}

	// 現在、何試合目かを表示する
	point_table++;
	$(".game_" + point_table + " .score tr th").text(point_table + "回目");
}

// 得点表をタグごと取得する
var score_made;
var game_order = 1;

// この関数は重要なので最初に実行しておく
$(document).ready(function() {
	score_made = $(".point").first().html();
	game_number();
	gamepoint_id();
});

//ボタンクリックでスコア部分を追加
function add_score() {
	// 6つ以上追加できないようにする
	if (game_made < 6)
	{
		$(".point").prepend(score_made);
		$(".ui-table-columntoggle-btn").remove();
		$("#table9-popup-placeholder").remove();
		$("#table8-popup-placeholder").remove();
		game_number();
		gamepoint_id();
        game_made++;
		
		// 表をフェードインさせる
		fade_in();
	}
	
	else 
	{
		alert("これ以上追加できません。");
	}
}

// 得点表に点数をすべて記入されていない場合はスコア表を追加できないようにする
function ban_add_score() {	
	// 得点表に数字が入っているか確認
	var add_score_flg = true;
	for (var i = 1;i <= 6; i++)
	{
		var point_check = ".game_" + game_made + " td.score_id_" + i;
		var point_substr = $(point_check).text();
				
		// 得点表に点数が入力されていなかったら
		if (point_substr == "" || point_substr == " ")
		{
			add_score_flg = false;
			break;
		}
	}
	
	// スコア表の追加を許可する
	if (add_score_flg == true) 
	{
		add_score();
		imeInput_flg = true;
		gamenumber++;
		$(".game_" + gamenumber + " .score_id_1").css("border" , "1px double #62FFF2");
		var bye_activeborder = gamenumber - 1;
		$(".game_" + bye_activeborder + " .score_id_1").css("border" , "");
	}
	
	// スコア表の追加を禁止にする + 警告を出す
	else if(all_click != 0)
	{
		alert("得点が全て入力されていません");
	}
}

// 表をフェードイン
function fade_in() {
	var fade_num = ".game_" + game_made;
	$(fade_num).css("display" , "none");
	$(fade_num).fadeIn(600);
}

// 得点表 (計算用)
$(window).on("click" , function() {
    SumPoint();
});
	
function SumPoint() {

	var point_sum = new Array(7);
	var totalPoint_10 = 0;
	var totalPoint_X = 0;
	
	var count_flg = true;

	for (var i = 1; i <= 6; i++) {
		point_sum[i] = 0;
	}
	
	for (var i = 1; i <= $(".point table").length; i++) {
		var totalPoint = 0;
		
		for (var j = 1; j <= 6; j++) {
			var sumSel = ".point table .score_id_" + j;
			var revise_sumSel = ".point table .revise_score_id_" + j;
			
			var sum = parseInt($(sumSel).eq(-i).text());
			var sumsub = parseInt($(revise_sumSel).eq(-i).text());
			
			count_flg = true;
			
			if (!isNaN (sumsub))
			{
				totalPoint += sumsub;
				point_sum[j] += sumsub;
				count_flg = false;
			}
			
			else if (!isNaN (sum))
			{
				totalPoint += sum;
				point_sum[j] += sum;
			}
			
			var check_or_score = $(sumSel).eq(-i).text();
			var check_or_revisescore = $(revise_sumSel).eq(-i).text();
						
			if (check_or_revisescore == "X" || check_or_score == "X" && count_flg == true)
			{
				totalPoint_X++;
			}
			
			if (check_or_revisescore == "10" || check_or_score == "10" && count_flg == true)
			{
				totalPoint_10++;
			}
		}
		
		$(".point table .score_id_7").eq(-i).text(totalPoint);
		
	}
		
	var totalPoint_sum = 0;
	for (var i = 1; i <= 6; i++) {
		$("#totalPoint_" + i).text(point_sum[i]);
		totalPoint_sum += point_sum[i];
	}
	
	$("#totalPoint_sum").text(totalPoint_sum);
	$("#totalPoint_X").text(totalPoint_X);
	$("#totalPoint_10").text(totalPoint_10);
}

//得点表 (入力用)
// 選択しているセルをわかりやすくする
var pointChange_flg = false;
// 何回目のセルなのかを確認する変数
var clicktd_index;
// 何ゲームなのかを確認するための変数
var clickgame_index_class;
// 最初に得点表入力時の警告が出るのを防ぐ
var all_click = 0;
$(function() {
	var click_point; // クリックしたclassの取得用
    var clickgame_index;
    // 何ゲームなのかを確認するための変数
    var clickgame_index_number;
	
	// セルをロングタップした時にborderの色を変える
	$(document).on("taphold　dblclick" , ".point .table-stroke .score td:not(:last-child) , .point .table-stroke .revise_score td:not(:last-child)" ,　function(event) {
		if (imeFind_flg == true)
		{
			var pointchange_check = $(this).text();
	
			var click_choose = $(this).parent().parent().attr("class");	
			if (click_choose == "score" && pointchange_check == "" || click_choose == "score" && pointchange_check == " ")
			{
				// 変更する必要があるか確認
				alert("得点が入力されていません");
			}
			
			else if (click_choose == "revise_score" && pointchange_check == "" || click_choose == "revise_score" && pointchange_check == " ")
			{
				// スルー	
			}
			
			else
			{
				var check = confirm("得点を変更しますか？");
	
				if (check == true)
				{
					// 何ゲーム目の何番目の要素をクリックしたかを取得
					var change_selector = $(this).parent().parent().parent().attr("class");
					clickgame_index_number = change_selector.search(/(.game_)+/);
					clickgame_index_class = change_selector.substr(clickgame_index_number + 1 , 6);
					clicktd_index = $("." + clickgame_index_class + " ." + click_choose + " td").index(this) + 1;
					
					$(".game_" + gamenumber + " .score_id_" + scoreid).css("border" , "");
					$("." + clickgame_index_class + " .revise_score_id_" + clicktd_index).css({
																				"border" : "1px double #F72C25" ,
																				"cursor" : "pointer"
																				});
					pointChange_flg = true;
				}
			}
		}
	});
	
	// アクティブにした要素以外をクリックした時の動作
	$(document).on("click touchend" , function(event) {
		all_click++;
		
		var checkID = event.target.id;
        
        // 変更するところと違うところをクリックされた時にborderを消す
		if (checkID != "ime" && pointChange_flg == true)
		{
		 	var checkclass = event.target.className;
            var checkSelector = event.target.parentNode.parentNode.parentNode.className;
            var checkGameClass = checkSelector.search(/(.game_)+/);
            var checkGameNumber = checkSelector.substr(checkGameClass + 1 , 6);
            var clickNodeNumber = $("." + checkGameNumber + " .revise_score td").index(event.target) + 1;
                      
			if (clickgame_index_class != checkGameNumber && clicktd_index != clickNodeNumber && pointChange_flg == true
               || clickgame_index_class != checkGameNumber && clicktd_index == clickNodeNumber && pointChange_flg == true
               || clickgame_index_class == checkGameNumber && clicktd_index != clickNodeNumber && pointChange_flg == true)
			{
                // 変更するところを赤色に変更
				$("." + clickgame_index_class + " .revise_score_id_" + clicktd_index).css("border" , "");
                // アクティブのところを消す
                $(".game_" + gamenumber + " .score_id_" + scoreid).css("border" , "1px double #62FFF2");
				pointChange_flg = false;			
			}
		}
	});	
});

// IME表示部分
var imeFind_flg = true;
function imeFind() {
	imeFind_flg = !imeFind_flg;
			
	var marginIME = $(window).height();
				
	if (imeFind_flg == true)
	{
		marginIME = marginIME - parseInt($("#ime").height());			
		$("#ime").css({
				"display" : "block"
			});
		$("#imeflg").text("入力機能ON");
	}
	
	else
	{
		$("#ime").css({
			"display" : "none"
		});
		$("#imeflg").text("入力機能OFF");
	}
}

// IME入力部分
var imeInput_flg = true;
var gamenumber = 1;
var scoreid = 1;
$(function() {
	$(".game_" + gamenumber + " .score_id_" + scoreid).css("border" , "1px double #62FFF2");
	
	// IMEを入力したときに表に入力する
	$("#ime ul li").click(function() {
        // 通常の入力部分
		if (imeInput_flg == true && pointChange_flg == false)
		{
			var clickPointChange = ".game_" + gamenumber + " .score_id_" + scoreid;
			var btnPoint = $(this).text();
			$(clickPointChange).text(btnPoint);
			
			scoreid++;
			
            var nextGame = gamenumber + 1;
			var beforePoint = scoreid - 1;
            var nextPoint = scoreid;
			
			if (scoreid == 7 && $(".game_" + nextGame) != null)
			{
				$(".game_" + gamenumber + " .score_id_6").css("border" , "");
				
				scoreid = 1;
				imeInput_flg = false;
			}
			
			else
			{
				$(".game_" + gamenumber + " .score_id_" + nextPoint).css("border" , "1px double #62FFF2");
			}
			$(".game_" + gamenumber + " .score_id_" + beforePoint).css("border" , "");
		}
        // 得点の変更するときに動作する部分
        else if (pointChange_flg == true)
        {
			var revision = $(this).text();
			$("." + clickgame_index_class + " .revise_score_id_" + clicktd_index).text(revision);
			$("." + clickgame_index_class + " .score_id_" + clicktd_index).css("text-decoration" , "line-through");
			$("." + clickgame_index_class + " .revise_score_id_" + clicktd_index).css("background-color" , "#E3B5A4");
        }
		
		else
		{
			alert("これ以上入力できません");
		}
	});
});

// 点数を入力するIME (デザイン)
$(window).on("load resize" , function() {
	var ime_botton = parseInt($("#ime ul li").css("width"));
	var ime_height;
	var ime_paddingTop;
	var fontSize;
	
	var window_width = $(window).width();
		
	var userAgent = window.navigator.userAgent.toLowerCase();
	
	// Chrome用のボタンレイアウト
	if (userAgent.indexOf("chrome") != -1 || userAgent.indexOf("opera") != -1)
	{
		ime_height = ime_botton * 0.7;
		ime_paddingTop = ime_botton * 0.3;
		fontSize = ime_botton * 0.3;
	}
	// Firefox用のボタンレイアウト
	else if (userAgent.indexOf("firefox") != -1)
	{
		ime_height = ime_botton * 0.65;
		ime_paddingTop = ime_botton * 0.35;
		fontSize = ime_botton * 0.25;
	}
	// IE用のボタンレイアウト
	else if (userAgent.indexOf("msie") != -1 || userAgent.indexOf("trident") != -1)
	{
		ime_height = ime_botton * 0.7;
		ime_paddingTop = ime_botton * 0.3;
		fontSize = ime_botton * 0.3;
	}
	
	$("#ime").css("width" , window_width);
	$("#ime ul li").css({
					"height" : ime_height ,
					"paddingTop" : ime_paddingTop ,
					"fontSize" : fontSize + "px"
				});
	
    // IME表示非表示設定
    var firstIME = $(window).height();
	if (imeFind_flg == true)
	{
        var look_site = $("#ime").height() - 50;
        $("#main").css("marginBottom" , look_site + "px");
		firstIME = firstIME - parseInt($("#ime").height());
		$("#ime").css("top" , firstIME + "px");
		$("#imeflg").text("入力機能ON");
	}
	
	else
	{
		$("#ime").css("top" , firstIME + "px");
		$("#imeflg").text("入力機能OFF");
	}
});

/********** jsonデータの取得及び得点表と関連付け **********/
var socket = io('/scoreCard');
socket.emit('extractScoreCard', {'sessionID': document.cookie, 'sc_id': getQueryString().sc_id});

socket.on('extractScoreCard', function(data) {

	console.log(data);

    if (data.playerName != null)
    {
        $("#player").text("選手名 ： " + data.playerName);
    }

    if (data.length != null)
    {
        $("#mator").text(data.length + "m")
    }

    $(data.score).each(function() {
        // 得点表の部分に得点を追加
        if (this.score_1 != null)
        {
            $(".game_" + game_made + " .score_id_1").text(this.score_1);
        }

        if (this.score_2 != null)
        {
            $(".game_" + game_made + " .score_id_2").text(this.score_2);
        }

        if (this.score_3 != null)
        {
            $(".game_" + game_made + " .score_id_3").text(this.score_3);
        }

        if (this.score_4 != null)
        {
            $(".game_" + game_made + " .score_id_4").text(this.score_4);
        }

        if (this.score_5 != null)
        {
            $(".game_" + game_made + " .score_id_5").text(this.score_5);
        }

        if (this.score_6 != null)
        {
            $(".game_" + game_made + " .score_id_6").text(this.score_6);
        }

        // 得点訂正部分のスコア追加
        if (this.updatedScore_1 != null)
        {
            $(".game_" + game_made + " .revise_score_id_1").text(this.updatedScore_1);
        }

        if (this.updatedScore_2 != null)
        {
            $(".game_" + game_made + " .revise_score_id_2").text(this.updatedScore_2);
        }

        if (this.updatedScore_3 != null)
        {
            $(".game_" + game_made + " .revise_score_id_3").text(this.updatedScore_3);
        }

        if (this.updatedScore_4 != null)
        {
            $(".game_" + game_made + " .revise_score_id_4").text(this.updatedScore_4);
        }

        if (this.updatedScore_5 != null)
        {
            $(".game_" + game_made + " .revise_score_id_5").text(this.updatedScore_5);
        }
        if (this.updatedScore_6 != null)
        {
            $(".game_" + game_made + " .revise_score_id_6").text(this.updatedScore_6);
        }

        ban_add_score();

    });

    // データ取得時に得点に修正があった場合の動作
    for (var i = 1;i <= 6; i++)
    {
        for (var j = 1;j <= 6; j++)
        {
            var revise_check = $(".game_" + i + " .revise_score_id_" + j).text();
            revise_check = $.isNumeric(revise_check);
            if (revise_check == true)
            {
                $(".game_" + i + " .score_id_" + j).css("text-decoration" , "line-through");
                $(".game_" + i + " .revise_score_id_" + j).css({
                                                "background-color" : "#E3B5A4" ,
                                                "cursor" : "pointer"
                                            });
            }
        }
    }
    
    SumPoint();
});

// データを送る関数
function send_score() {
	alert("");
}