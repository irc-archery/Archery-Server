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

    data['email'] = $('#email').val();
    data['password'] = $('#password').val();

    console.log('emit insertScoreCard');
    console.log(data);

    socket.emit('insertScoreCard', data);
  }
};

socket.on('insertScoreCard', function(data) {

  console.log('on insertScoreCard')
  console.log(data);
  $('#insertScoreCardArea').append('<p>{ sc_id: ' + data.sc_id + ' }</p>');
});

$(function() {
  if($('input[name="radio"]:checked').val() === "me"){
    $('.others-form').hide(); 
  }
  else if($('input[name="radio"]:checked').val() === "others") {
    $('.others-form').show();
  }
});

function showForm(flag){
  if(flag) {
    $('.others-form').show();
  }
  else{
    $('.others-form').hide();
  }
}