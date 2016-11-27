var raf = require('raf');
var Tracker = require('./js/tracker');
var Game = require('./js/game');

var tracker = Tracker({
  webcam: window.document.getElementById('webcam'),
});


var game = Game();

var cGame = window.document.getElementById('game');
    cGame.width = window.innerWidth;
    cGame.height = window.innerHeight;
    cGame.style.width = cGame.width + 'px';
    cGame.style.height = cGame.height + 'px';
var ctxGame = cGame.getContext('2d');

var cFace = window.document.getElementById('faces');
    cFace.width = window.innerWidth;
    cFace.height = window.innerHeight;
    cFace.style.width = cFace.width + 'px';
    cFace.style.height = cFace.height + 'px';
var ctxFace = cFace.getContext('2d');


window.document.addEventListener('keypress', function(e) {
  if (e.key === ' ') {
    game.jump();
    e.preventDefault();
  }
});

raf.add(function (dt) {
  dt = Math.min(dt, 30);

  tracker.update();

  if (tracker.diff > 13) game.jump();
  game.update(dt);

  tracker.render(cFace, ctxFace);
  game.render(cGame, ctxGame);
});

game.start();