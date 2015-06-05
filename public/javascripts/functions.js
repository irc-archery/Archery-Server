// Cookie取得 引数に Cookieの名前
function getCookie(name){
  var r = null;
  var c = name + '=';
  var allcookies = document.cookie;
  var position = allcookies.indexOf( c );
  if( position != -1 ){
    var startIndex = position + c.length;
    var endIndex = allcookies.indexOf( ';', startIndex );
    if( endIndex == -1 ){
      endIndex = allcookies.length;
    }
    r = decodeURIComponent(allcookies.substring( startIndex, endIndex ) );
  }
  return r;
}

