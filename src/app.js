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
  color: '#F48FB1',
  lineWidth: 10,
  mirror: true,
  samplingLength: 100,
});

// debug faceTracking
var cDebug = window.document.getElementById('debug');
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
    // game.jump();
    face.recalibrate();
    e.preventDefault();
  }
});

raf.add(function (dt) {
  // dt = Math.min(dt, 30);

  face.update();

  face.tracker.render(cDebug, ctxDebug);

  if (face.calibrated) {
    if (face.eyebrows.ny > 0.5) game.jump();

    console.log(face.eyebrows.ny);
    game.update(dt);

    face.render();
    game.render();
  } else {
    console.log('calibrating...');
  }

});

game.start();