$('.dropdown-toggle').dropdown();
$('.collapse').collapse();
$('.modal').modal({
	show: false
});

$('#navButton').on('click', function() {
    $(this).dropdown();
});

// リンクの更新
$(function() {
  // 得点表一覧へのリンクの生成
  $('.scoreCardIndexLink').attr('href', '/scoreCardIndex?m_id=' + getQueryString().m_id);
  // 得点表作成へのリンクの生成
  $('.insertScoreCardLink').attr('href', '/insertScoreCard?m_id=' + getQueryString().m_id);
});

// quote from http://so-zou.jp/web-app/tech/programming/javascript/sample/get.htm
function getQueryString()
{
    var result = {};
    if( 1 < window.location.search.length )
    {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = window.location.search.substring( 1 );

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split( '&' );

        for( var i = 0; i < parameters.length; i++ )
        {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[ i ].split( '=' );

            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );

            // パラメータ名をキーとして連想配列に追加する
            result[ paramName ] = paramValue;
        }
    }
    return result;
}

var lengthOption = ["90m", "70m", "60m", "50m", "40m", "30m", "70m前", "70m後"];
