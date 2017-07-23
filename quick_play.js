var cardNum  = 0;
var deckSize = 5;
var cardOffset = 5;
var deckOfCards;
var suits;

$(document).ready(function() {	
	retrieveFB('Cards', shuffleCards);
	retrieveFB('Suits', function(data) {
		suits = data;
		endLoading();
	});
});

// Interactions  //

  $(document).on('click', ".top-card", function() {
  	$(this).toggleClass("flip");

    if ($(".top-card").hasClass('flip')) {
      setupHammer();
      $('#action-btn').text("next card");
    }
    else {
      removeHammer();
      $('#action-btn').text("flip");
    }
  });

  $('#action-btn').click( function() {
    if ($(".top-card").hasClass('flip') && !$(".top-card").hasClass('card_finished')) {
      nextCard();
      $(this).text("flip");
    }
    else {
      $('.top-card').addClass('flip'); 
      setupHammer();
      $(this).text("next card");
    }
  });

  function setupHammer() {
    $(".top-card").hammer().on("swiperight swipeleft", function(ev) {
      nextCard(ev.type);
    });
  }

  function removeHammer() {
    $(".top-card").hammer().off("swiperight swipeleft");
  }
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

    $($('.card').last()).addClass('top-card');
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

    if (pos === undefined) pos=n;

    var posStyle = "right: "+(cardOffset*(-1/2-pos+deckSize/2))+"px;";
    posStyle = posStyle + " top: "+(-1*cardOffset*(pos-1))+"px;";
    var frontCol = "background-color: #"+suits[card['Type']]['color']+";";

    var cardHTML =  '<div class="card"> \
          <div class="card-inner" style="'+posStyle+'"> \
            <div class="card-back"> \
              <div class="card-img-container outer"> \
                <div class="inner"> \
                  <img class="card-img" src="img/hmmrd.png"> \
                </div> \
              </div> \
              <div class="card-back-footer"> \
                <div class="footer-icon-container footer-icon-left outer"> \
                  <div class="inner"> \
                    <img class="footer-icon" src="img/green_avatar.png"> \
                    <div class="footer-text"> \
                      <span class="times-symbol">&times;</span>  \
                      <span class="times-number"> \
                        '+card['Teammates']+' \
                      </span> \
                    </div> \
                  </div> \
                </div> \
                <div class="footer-icon-container footer-icon-right outer"> \
                  <div class="inner"> \
                    <div class="footer-text"> \
                      <span class="times-number"> \
                        '+card['Opponents']+' \
                      </span> \
                      <span class="times-symbol">&times;</span>  \
                    </div> \
                    <img class="footer-icon" src="img/red_avatar.png"> \
                  </div> \
                </div> \
              </div> \
            </div> \
            <div class="card-front" style="'+frontCol+'"> \
              <div class="card-front-inner"> \
                <div class="card-header"> \
                  <p class="card-title"> \
                    '+card['Name']+' \
                  </p> \
                  <p class="card-subtitle"> \
                    '+card['Type']+' \
                  </p> \
                </div> \
                <div class="card-body outer"> \
                  <div class="inner"> \
                    '+card['Definition']+' \
                  </div> \
                </div> \
                <div class="card-footer"> \
                  <div class="footer-icon-container footer-icon-left outer"> \
                    <div class="inner"> \
                      <img class="footer-icon" src="img/green_cup.png"> \
                      <div class="footer-text"> \
                        <span class="times-symbol">&times;</span>  \
                        <span class="times-number"> \
                          '+card['Success']+' \
                        </span> \
                      </div> \
                    </div> \
                  </div> \
                  <div class="footer-icon-container footer-icon-right outer"> \
                    <div class="inner"> \
                      <div class="footer-text"> \
                        <span class="times-number"> \
                          '+card['Failure']+' \
                        </span> \
                        <span class="times-symbol">&times;</span>  \
                      </div> \
                      <img class="footer-icon" src="img/red_cup.png"> \
                    </div> \
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
    for (var i = data.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = data[i];
          data[i] = data[j];
          data[j] = temp;
      }
      deckOfCards = data;
  }

  function nextCard(ev) {
    //throw away card 1
    $('.top-card').addClass('card_finished'); //triggers animation
    if(ev == 'swipeleft') {
      $('.top-card').addClass('card_finished_left'); //triggers animation
    }
    else {
      $('.top-card').addClass('card_finished_right'); //triggers animation
    }

    drawCard(deckSize+1);
    //re-make the deck
    var $cards = $('.card:not(.card_finished)');
    $cards.last().addClass('top-card');

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