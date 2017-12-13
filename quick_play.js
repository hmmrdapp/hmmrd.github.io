var cardNum  = 0;
var deckSize = 5;
var cardOffset = 5;
var deckOfCards;
var suits;
var triviaDeck;

// TODO: 
// 2 column long answer trivia
// trivia small screen  overflow
// trivia clickable
// swipes
// tap card disabled when trivia is up
//secretaries is too many nathan
// where to put cycle btn
// Trivia bug, flip card over after viewing trivia cards

// cards just mode b/e



// 0: not trivia
// 1: flip but turn on trivia
// 2: show q
// 3: show answer
var triviaState = 0;

// so that new trivia q doesn't return same q
var whichTrivia = -1;

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

// Interactions  //
  $(document).on('click', ".top-card", function() {
    $(this).toggleClass("flip");
    if ($(".top-card").hasClass('flip')) {
      // setupHammer();
      $('#action-btn').text("next card");
    }
    else {
      // removeHammer();
      $('#action-btn').text("flip");
    }
  });

  $('#action-btn').click( function() {
    // default state
    if(triviaState == 0) {
      if(!$('.trivia-card').hasClass('hidden')) {
        //reset Trivia
        resetTrivia();
      }

      if ($(".top-card").hasClass('flip') && !$(".top-card").hasClass('card_finished')) {
        nextCard();
      }
      else {
        $('.top-card').addClass('flip'); 
        // setupHammer();
        $(this).text("next card");
      }
    }

    // prepare to draw trivia card 
    else if (triviaState == 1) {
      $('.top-card').addClass('flip'); 
      // setupHammer();
      $(this).text("trivia");
      triviaState = 2;
    }

    //Draw Question
    else if(triviaState == 2) {
      $('.trivia-cycle-btn').removeClass('hidden');
      $('.trivia-card').removeClass('hidden');

      drawTriviaCard();

      $(this).text("show answer");
      triviaState = 3;
    }

    // show answer
    else if(triviaState == 3) {
      $('.trivia-card').addClass('flip');
      $('.trivia-cycle-btn').addClass('hidden');
      $(this).text('Next Card');
      triviaState = 0;
    }
  });

  $('#trivia-cycle-btn').click(function() {
    drawTriviaCard();
  });
///////////////////


// Initializing  //
  
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

    startGame();
  }

  function startGame() {
    for (var i = 0; i < deckSize; i++) {
      drawCard();
    }

    topcard = $($('.game-card').last());
    topcard.addClass('top-card');
    if(topcard.hasClass('is-trivia')) {
      triviaState = 1;
    }
  }
///////////////////


//     Game      //
  function drawCard(pos) {
    //shuffle deck if necessary
    if(cardNum == deckOfCards.length) {
      shuffleCards(deckOfCards);
      cardNum = 0;
    }

    $('.deck').prepend(makeCard(cardNum,pos));
    cardNum++;
  }

  function makeCard(n, pos) {
    var card = deckOfCards[n];
    if(card === undefined) {
      cardNum++;
      n = cardNum;
      card = deckOfCards[n];
    }
    if (pos === undefined) pos=n;

    var posStyle = "right: "+(cardOffset*(-1/2-pos+deckSize/2))+"px;";
    posStyle = posStyle + " top: "+(-1*cardOffset*(pos-1))+"px;";
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
          <div class="card-inner" style="'+posStyle+'"> \
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

  /**
   * Randomize array element order in-place.
   * Using Durstenfeld shuffle algorithm.
   * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
   */
  function shuffleCards(data) {
    if (data[0] === undefined) data.shift(); //when pulling from firebase 1st value is undefined

    //delete later
    // trivias = []

    for (var i = data.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = data[i];
      data[i] = data[j];
      data[j] = temp;

      // var cardTitle = data[i]['Name'];
      // if(cardTitle.trim().toLowerCase().includes('trivia')) {
      //   trivias.push(i)
      // }

    }

    // var temp = data[2];
    // data[2] = data[trivias[0]];
    // data[trivias[0]] = data[2];

    deckOfCards = data;
  }

  function nextCard(ev) {
    //rename action button
    $('#action-btn').text("flip");

    //throw away card 1
    $('.top-card').addClass('card_finished'); 

    if(ev == 'swipeleft') {
      $('.top-card').addClass('card_finished_left'); 
    }
    else {
      $('.top-card').addClass('card_finished_right'); 
    }

    drawCard(deckSize+1);
    //re-make the deck
    var $cards  = $('.game-card:not(.card_finished)');
    var topcard = $cards.last();
    topcard.addClass('top-card');

    // Check if Trivia
    if(topcard.hasClass('is-trivia')) {
      triviaState = 1;
    }

    //move the deck to correct position
    for (var i = 0; i < $cards.length; i++) {
      $($cards[i]).children().css('right', cardOffset*((1-deckSize)/2+i));
      // cardOffset*(1/2-pos+deckSize/2)
      $($cards[i]).children().css('top', -1*cardOffset*(deckSize-i-1));
    }

    //After animation delete card 1 to not clog up DOM
    $('.card_finished').one(animationEvent, function(e) {
      this.remove();
    });
  }

  function drawTriviaCard() {
    var cardTitle = $('.top-card:not(card_finished)').find('.card-title').text();

    var type = cardTitle.substr(cardTitle.indexOf(':')+1).trim();
    type = type.charAt(0).toUpperCase() + type.slice(1);
    if(type == "Pop culture") type = "Pop Culture"
    var questions = triviaDeck[type];
    var which = Math.floor(Math.random() * questions.length);

    // make sure not the same
    while(which == whichTrivia) {
      which = Math.floor(Math.random() * questions.length);
    }
    whichTrivia = which

    $('.trivia-title').text(cardTitle);
    $('.trivia-question').text(questions[whichTrivia]['Question']);
    var answerList = questions[whichTrivia]['Answer'];
    if(answerList.length >= 12 ) {
      // process overflow
    }
    var answerStr  = ""
    for (var i = 0; i < answerList.length; i++) {
      answerStr += answerList[i]+"<br>"
    }
    $('.trivia-answer').html(answerStr);
  }

  function resetTrivia() {
    $('.trivia-card').addClass('hidden');
    $('.trivia-card').removeClass('flip');
    whichTrivia = -1;
  }
///////////////////


//   Animation   //
  function whichAnimationEvent(){
    var t,
        el = document.createElement("fakeelement");

    var animations = {
      "animation"      : "animationend",
      "OAnimation"     : "oAnimationEnd",
      "MozAnimation"   : "animationend",
      "WebkitAnimation": "webkitAnimationEnd"
    }

    for (t in animations){
      if (el.style[t] !== undefined){
        return animations[t];
      }
    }
  }

  var animationEvent = whichAnimationEvent();
///////////////////