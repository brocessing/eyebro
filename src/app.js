var raf    = require('raf');
var Screen = require('./js/screen');
var Face   = require('./js/face');
var Game   = require('./js/game');
var Sound  = require('./js/soundwrapper')

// -------------------------------------------------------------------------
// SCREENS INIT
var screens = {
  home : Screen('section.screen#welcome', true),
  tuto : Screen('section.screen#tuto'),
  game : Screen('section.screen#game'),
  end  : Screen('section.screen#end'),
}


// -------------------------------------------------------------------------
// CANVAS INIT

var canvases = {
  face    : window.document.getElementById('canvasFaces'),
  game    : window.document.getElementById('canvasGame'),
};

(function setCanvasesSize() {
  var w = window.innerWidth;
  var h = window.innerHeight;

  canvases.face.width          = w;
  canvases.face.height         = h;
  canvases.face.style.width    = canvases.face.width + 'px';
  canvases.face.style.height   = canvases.face.height + 'px';

  canvases.game.width           = w;
  canvases.game.height          = h;
  canvases.game.style.width     = canvases.game.width + 'px';
  canvases.game.style.height    = canvases.game.height + 'px';
  window.addEventListener('resize', setCanvasesSize);
})();


// -------------------------------------------------------------------------
// WEBCAM INIT

var webcam = window.document.getElementById('webcam');
var face = Face({
  canvas: canvases.face,
  webcam: webcam,
  color: '#C8E7ED',
  lineWidth: 10,
  mirror: false,
  samplingLength: 100,
});

face.on('start', function() {
  raf.add(function (dt) {
    face.update();
    face.render();
  });

  initGame();
});

face.on('error', function(err) {
  screens.home.elem.classList.add('error');
});

window.document.getElementById('showWebcamLabel').addEventListener('click', function() {
  webcam.debug = (!window.document.getElementById('showWebcam').checked);
});

// -------------------------------------------------------------------------
// GAME ENGINE INIT
function initGame() {
  var tutoBtn = screens.home.querySelectorAll('button#start')[0];
  tutoBtn.addEventListener('click', function() {
    screens.home.hide();
    screens.tuto.show();
  });

  var playBtn = screens.tuto.querySelectorAll('button#start')[0];
  playBtn.addEventListener('click', function() {
    screens.tuto.hide();
    screens.game.show();
  });

  screens.game.on('show', function() {
    var score = screens.game.querySelectorAll('#score')[0];
    var wahou = screens.game.querySelectorAll('.wahou')[0];

    var game = Game({
      canvas: canvases.game,
    });

    raf.add(function(dt) {
      dt = Math.min(dt, 50);

      if (face.eyebrows.y > face.eyebrows.ymax * 0.9) {
        game.jump();
      }

      game.update(dt);
      game.render();

      // score handling
      score.innerHTML = game.score + (webcam.debug ? ' (y : ' + face.eyebrows.y.toFixed(1) + ' / ' + face.eyebrows.ymax.toFixed(1) + ')' : '');
      if (game.score > game.nextScore) {
        game.nextScore *= 2;

        wahou.classList.remove('show');

        // wahou.innerHTML = Math.floor(Math.random() * 100);

        // css anim reset hack
        // see https://css-tricks.com/restart-css-animation/#article-header-id-0
        void wahou.offsetWidth;
        wahou.classList.add('show');
      }
    });


    var sound = Sound();
    // sound.on('load', function(e) {});

    game.on('jump', function() {
      if (game.running) {
        sound.play('jump' + Math.ceil(Math.random() * 2));
      }
    });

    game.on('bounce', function() {
      if (game.running) {
        sound.play('bounce' + Math.ceil(Math.random() * 3));
      }
    });

    // -------------
    game.start();

    game.on('loose', function() {
      screens.game.hide();
      var twitterURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('my eyebrows are so bros they did ' + game.score + ' points, on ' + window.location.href);
      screens.end.querySelectorAll('#score > a')[0].setAttribute('href', twitterURL);
      screens.end.querySelectorAll('#scoreValue')[0].innerHTML = game.score;
      screens.end.querySelectorAll('button#retry')[0].addEventListener('click', function() {
        screens.end.hide();
        screens.game.show();
      });
      screens.end.show();
    });

  });
}