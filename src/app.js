var raf = require('raf');
var Face = require('./js/face');
var Game = require('./js/game');

// init Face
var cFace = window.document.getElementById('faces');
    cFace.width = window.innerWidth;
    cFace.height = window.innerHeight;
    cFace.style.width = cFace.width + 'px';
    cFace.style.height = cFace.height + 'px';

var face = Face({
  canvas: cFace,
  src: window.document.getElementById('webcam'),
  color: '#C8E7ED',
  lineWidth: 10,
  mirror: true,
  samplingLength: 100,
});

// debug faceTracking
var cDebug = window.document.getElementById('tracker');
    cDebug.width = face.src.width;
    cDebug.height = face.src.height;
    cDebug.style.width = cDebug.width;
    cDebug.style.height = cDebug.height;
var ctxDebug = cDebug.getContext('2d');

// init Game
var cGame = window.document.getElementById('game');
    cGame.width = window.innerWidth;
    cGame.height = window.innerHeight;
    cGame.style.width = cGame.width + 'px';
    cGame.style.height = cGame.height + 'px';
var game = Game({
  canvas: cGame,
});



window.document.addEventListener('keypress', function(e) {
  if (e.key === ' ') {
    game.jump();
    e.preventDefault();
  } else if (e.key === 'r') {
    face.recalibrate();
    e.preventDefault;
  }
});

var splashScreen = window.document.getElementById('welcomeScreen');
var gameScreen = window.document.getElementById('gameScreen');
var endScreen = window.document.getElementById('endScreen');
var start = window.document.getElementById('startBtn');
start.addEventListener('click', function() {
  gameScreen.classList.add('show');

  splashScreen.classList.remove('show');
  game.start();
});

game.on('loose', function() {
  gameScreen.classList.remove('show');
  window.document.getElementById('finalScore').innerHTML = game.distance.toFixed(0);
  endScreen.classList.add('show');
})

var score = window.document.getElementById('score');

raf.add(function (dt) {
  dt = Math.min(dt, 50);

  face.update();
  face.tracker.render(cDebug, ctxDebug);

  if (face.calibrated) {
    if (face.eyebrows.ny > 0.75) game.jump();
    // debug.innerHTML = face.eyebrows.ny.toFixed(2);
  } else {
    // debug.innerHTML = 'calibrating...';
  }

  face.render();
  game.update(dt);
  game.render();

  score.innerHTML = game.distance.toFixed(0);

});