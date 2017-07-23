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

$(document).on('click', ".top-card", function() {
	$(this).toggleClass("flip");
});

$('#flip-btn').click( function() {
	$('.top-card').toggleClass('flip');
});

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



$('#next-card-btn').on('click', function(){
	nextCard();
});;

function nextCard() {
	//throw away card 1
	$('.top-card').addClass('card_finished'); //triggers animation

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
                  <img class="footer-icon" src="img/red_avatar.png"> \
                  <div class="footer-text"> \
                    <span class="times-symbol">&times;</span>  \
                    <span class="times-number"> \
                      '+card['Opponents']+' \
                    </span> \
                  </div> \
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
                    <img class="footer-icon" src="img/red_cup.png"> \
                    <div class="footer-text"> \
                      <span class="times-symbol">&times;</span>  \
                      <span class="times-number"> \
                        '+card['Failure']+' \
                      </span> \
                    </div> \
                  </div> \
                </div> \
              </div> \
            </div> \
          </div>  \
        </div> \
      </div>';
                

  return cardHTML;
}

function drawCard(pos) {
	//shuffle deck if necessary
	if(cardNum == deckOfCards.length) {
		shuffleCards(deckOfCards);
		cardNum = 0;
	}

	$('.deck').prepend(makeCard(cardNum,pos));
	cardNum++;
}

function startGame() {
	for (var i = 0; i < deckSize; i++) {
		drawCard();
	}

	$($('.card').last()).addClass('top-card');
}

function randCol() {
	return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
}

function retrieveFB(ref, callback) {
	var database = firebase.database();
	var ret;
	database.ref(ref).once('value', function(snapshot) {
		callback(snapshot.val());
	});
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

function endLoading() {
	$('.loading-icon').css('visibility','hidden');

	$('.game-outer').removeClass('hidden');

	$('.intro-outer').animate({'height': 0} ,500, "swing", function() {
		$('.intro-outer').addClass('hidden');
	});


	startGame();
}
// $(".top-card").touchwipe({
//      wipeLeft: function() { alert("left"); },
//      wipeRight: function() { alert("right"); },
//      wipeUp: function() { alert("up"); },
//      wipeDown: function() { alert("down"); },
//      min_move_x: 20,
//      min_move_y: 20,
//      preventDefaultEvents: true
// });