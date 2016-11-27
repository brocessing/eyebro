var raf = require('raf');
var Face = require('./js/face');
var Game = require('./js/game');

var face = Face({
  src: window.document.getElementById('webcam'),
  color: '#F48FB1',
  lineWidth: 10,
  mirror: true,
  samplingLength: 100,
});


// var game = Game();

var cDebug = window.document.getElementById('debug');
    cDebug.width = face.src.width;
    cDebug.height = face.src.height;
    cDebug.style.width = cDebug.width;
    cDebug.style.height = cDebug.height;
var ctxDebug = cDebug.getContext('2d');

// var cGame = window.document.getElementById('game');
//     cGame.width = window.innerWidth;
//     cGame.height = window.innerHeight;
//     cGame.style.width = cGame.width + 'px';
//     cGame.style.height = cGame.height + 'px';
// var ctxGame = cGame.getContext('2d');

var cFace = window.document.getElementById('faces');
    cFace.width = window.innerWidth;
    cFace.height = window.innerHeight;
    cFace.style.width = cFace.width + 'px';
    cFace.style.height = cFace.height + 'px';
var ctxFace = cFace.getContext('2d');


// window.document.addEventListener('keypress', function(e) {
//   if (e.key === ' ') {
//     game.jump();
//     e.preventDefault();
//   }
// });

raf.add(function (dt) {
  dt = Math.min(dt, 30);

  face.update();

  face.tracker.render(cDebug, ctxDebug);

  console.log(face.eyebrows.ny);

  // if (tracker.diff > 13) game.jump();
  // game.update(dt);

  face.render(cFace, ctxFace);
  // game.render(cGame, ctxGame);
});

// game.start();