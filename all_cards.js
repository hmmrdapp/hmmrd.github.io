var deckOfCards;
var suits;
var triviaDeck;
var cardNum = 0;
var cardOffset = 5;

$(document).ready(function() {  
  retrieveFB('Cards', shuffleCards);
  retrieveFB('Trivia', function(data) {
    triviaDeck = data;
  });
  retrieveFB('Suits', function(data) {
    suits = data;
    endLoading();
  });
  // endLoading();
});

$('#flipper').click(function() {
  $('.card').toggleClass('flip')
});

$(document).on('click', ".card", function() {
  $(this).toggleClass("flip");
});

function retrieveFB(ref, callback) {
  var database = firebase.database();
  var ret;
  database.ref(ref).once('value', function(snapshot) {
    callback(snapshot.val());
  });
}

function endLoading() {
  $('.loading-icon').css('visibility','hidden');

  $('.game-outer').removeClass('hidden');

  $('.intro-outer').animate({'height': 0} ,500, "swing", function() {
    $('.intro-outer').addClass('hidden');
  });

  placeCards();
}

function placeCards() {
 
  for (var type in triviaDeck){
    for (var i = 0; i < triviaDeck[type].length; i++) {
      $('.deck').append(makeTriviaCard(type,i));
    }
  }

  for (var i = 0; i < deckOfCards.length; i++) {
    drawCard();
  }
}

function drawCard(pos) {
  $('.deck').append(makeCard(cardNum,pos));
  cardNum++;
}

function makeCard(n, pos) {
  var card = deckOfCards[n];
  if (pos === undefined) pos=n;

  var frontCol = "background-color: #"+suits[card['Type']]['color']+";";

  var drinkSymbolStr = "";
  if (card['Success'] == 0) {
    drinkSymbolStr = 'nodrink-symbol';
  }
  else {
    drinkSymbolStr = 'drink-symbol';
  }

  var footerStr = "";
  for (let i = 0; i <card['Teammates']; i++) {
    let pos = i*20;
    footerStr += '<img src="img/green_avatar.png" style="left: '+pos+'px;">'
  }
  for (let i = 0; i <card['Opponents']; i++) {
    let pos = i*20;
    footerStr += '<img src="img/red_avatar.png" style="right: '+pos+'px;">'
  }

  var cardClassStr = "card game-card"
  if(card['Name'].toLowerCase().includes('trivia')) {
    cardClassStr += ' is-trivia'
  }

  var cardHTML =  '<div class="'+cardClassStr+'"> \
        <div class="card-inner"> \
            <div class="card-back"> \
              <div class="card-back-img-cont"> \
                <img class="card-back-img" src="img/back_blank.png"> \
              </div> \
              <div class="card-footer card-back-footer">' + footerStr + 
              '</div> \
            </div> \
          <div class="card-front"> \
            <div class="inner-border-design"> \
              <div class="card-header"> \
                <p class="card-title"> \
                  '+card['Name']+' \
                </p> \
              </div> \
              <div class="card-body"> \
                '+card['Definition']+' \
              </div> \
              <div class="card-footer card-front-footer"> \
                  <div class="'+ drinkSymbolStr +'"> \
                    <img> \
                  </div> \
                  <div class="hmmrd-footer"> \
                    hmmrd \
                  </div> \
              </div> \
            </div> \
          </div>  \
        </div> \
      </div>';
                

  return cardHTML;
}

function shuffleCards(data) {
  if (data[0] === undefined) data.shift(); //when pulling from firebase 1st value is undefined
  deckOfCards = data;
}

function makeTriviaCard(type, n) {
  var data = triviaDeck[type][n];

  var question = data['Question']
  var answerList  = data['Answer']
  var answerStr  = ""
  var answerFontStr = ""
  for (var i = 0; i < answerList.length; i++) {
    answerStr += answerList[i]+"<br>"
  }
  if (answerList.length >=14) {
    answerFontStr = "font-size: 14px;"
  }

  var title    = "Trivia: "+type

  var cardStr = '<div class="card trivia-card">\
    <div class="card-inner">\
      <div class="card-back">\
        <div class="inner-border-design">\
          <div class="trivia-title card-title">\
          '+title+'\
          </div>\
          <div class="trivia-subtitle">\
            question\
          </div>\
          <div class="trivia-question trivia-body">\
          '+question+'\
          </div>\
          <div class="card-footer hmmrd-footer trivia-footer">\
            hmmrd\
          </div>\
        </div>\
      </div>\
      <div class="card-front">\
        <div class="inner-border-design">\
          <div class="trivia-title card-title">\
          </div>\
          <div class="trivia-subtitle">\
            answer\
          </div>\
          <div class="trivia-answer trivia-body" style="'+answerFontStr+'">\
          '+answerStr+'\
          </div>\
          <div class="card-footer hmmrd-footer trivia-footer">\
            hmmrd\
          </div>\
        </div>\
      </div>\
    </div>\
  </div>'

  return cardStr
}

function drawTriviaCard() {
   
}

function resetTrivia() {
  $('.trivia-card').addClass('hidden');
  $('.trivia-card').removeClass('flip');
  whichTrivia = -1;
}