var socket = io('/scoreCardIndex');

// Emit Insert Score Card
function insertScoreCard() {

  var data = new Object();

  data['m_id'] = getQueryString().m_id;

  if($('input[name="radio"]:checked').val() === "me"){

    data['sessionID'] = document.cookie;

    console.log('emit insertOwnScoreCard');
    console.log(data);

    socket.emit('insertOwnScoreCard', data);
  }

  else if($('input[name="radio"]:checked').val() === "others") {

    data['sessionID'] = document.cookie;
    data['email'] = $('#email').val();
    data['password'] = $('#password').val();

    console.log('emit insertScoreCard');
    console.log(data);

    socket.emit('insertScoreCard', data);
  }
};

// 得点表作成後の処理
socket.on('insertScoreCard', function(data) {

  console.log('on insertScoreCard')
  console.log(data);

  if(data != '') {
    if(data.status == true) {
      location.href = '/scoreCard?m_id=' + getQueryString().m_id + '&sc_id=' + data.sc_id;
    }
    else if(data.status == false) {
      alert(data.err); 
    }
  }
});

// set Default value
$(function() {

  if($('input[name="radio"]:checked').val() === "me"){
    $('.others-form').hide(); 
  }
  else if($('input[name="radio"]:checked').val() === "others") {
    $('.others-form').show();
  }
});

// Formの切り分け
function showForm(flag){
  if(flag) {
    $('.others-form').show();
  }
  else{
    $('.others-form').hide();
  }
}