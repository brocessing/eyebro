var Perlin      = require('perlin').noise;
var M           = require('./math')();
var Ball        = require('./ball');
var TinyEmitter = require('tiny-emitter');

function Game(_opts) {
  var opts = Object.assign({
    canvas       : null,

    godmode      : false,
    autoSpeed    : true,

    tileSize     : 100,
    jumpSpeed    : 15,
    initialSpeed : 7.0,
    maxSpeed     : 30.0,
    acceleration : 0.01,
    nextScore    : 2000,

    y            : 500,
    width        : 9999999,
    weight       : 10,
    bounce: {
      height        : 150,
      width         : 200,
      detail        : 0.1,
    },

    colors: {
      platform      : '#BFCFFF',
      ball          : '#FFA5A5',
    },

    ball: {
      x             : 200,
      trailLength   : 3,
      radius        : 25,
      gravity       : 9.81 * 0.75,
      bounce        : 0.5,
      jumpMax       : 50,
      aerial        : 0.35,
      stretch       : 0.8,
    },
  }, _opts);

  var emitter = new TinyEmitter();
  var ctx = opts.canvas.getContext('2d');

  var distance = 0;
  var speed = opts.initialSpeed;
  var ball = Ball(opts.ball);

  // -------------------------------------------------------------------------

  var tiles = (function() {
    var tiles = [];
    var next = Math.floor(window.innerWidth / opts.tileSize);

    for (var i = 0; i < opts.width; i += opts.tileSize) {
      if (next > 0) {
        tiles.push(true);
        next--;
      } else if (next < 0) {
        tiles.push(false);
        next++;
      } else {
        tiles.push(true);
        next = Math.floor(Math.random() * 7) - ((Math.random() > 0.9) ? 2 : 1);
      }
    }

    return tiles;
  })();

  var relief = (function() {
    var values = [];
    var xoff = 0;
    for (var i = 0; i < tiles.length; i++) {
      values.push(Perlin.perlin2(xoff, 0) * 100);
      xoff += 0.2;
    }
    return values;
  })();


  // -------------------------------------------------------------------------

  var api = {
    running: false,
    get distance() { return distance; },
    get score() { return distance.toFixed(0); },
    get nextScore() { return opts.nextScore; },
    set nextScore(s) { opts.nextScore = s; },

    on: function(event, cb) {
      emitter.on(event, cb);
    },

    start: function() {
      api.running = true;
      ball.y = 0;
      emitter.emit('start');
    },

    stop: function() {
      api.running = false;
      emitter.emit('stop');
    },

    loose: function(cb) {
      console.warn('GAME OVER.');
      emitter.emit('loose');
    },

    jump: function(acc = 80) {
      ball.jump(acc);
      if (ball.py <= 0) emitter.emit('jump');
    },

    update: function(dt) {
      if (api.running) {
        if (opts.autoSpeed) speed = Math.min(speed + opts.acceleration, opts.maxSpeed);
        distance += speed;

        var collide = ball.y > -100 && (tiles[getCurrentTileIndex()] && touch(getCurrentTileIndex(), 3));
        var bounce = ball.update(dt, speed, collide || opts.godmode);
        if (bounce) emitter.emit('bounce');

        if (ball.y < -600) {
          api.stop();
          api.loose();
        }
      }

      return api;
    },

    render : function() {
      ctx.clearRect(0, 0, opts.canvas.width, opts.canvas.height);
      // TERRAIN RENDERING
      ctx.strokeStyle = opts.colors.platform;
      ctx.lineWidth = opts.weight;
      ctx.lineCap = 'round';

      var trailMax = Number.POSITIVE_INFINITY;
      var currentPlatform = getCurrentPlatform();

      ctx.beginPath();
      for (var i = 0, l = tiles.length; i < l; i++) {
        var x = i * opts.tileSize - distance;
        if (x > - opts.tileSize && x < opts.canvas.width && tiles[i]) {
          // UNDER THE BALL, MORE DETAILLED PLATFORMS
          if (x > opts.ball.x - opts.bounce.width * 1.5 && x < opts.ball.x + opts.bounce.width) {

            var dist = M.norm(M.maxDist(opts.ball.x, x, opts.bounce.width), 0, opts.bounce.width);
            var stretch = -Math.min(ball.y, 0) * (i > currentPlatform.start && i <= currentPlatform.stop);
            var bounce = (1 - dist) * stretch;

            ctx.moveTo(x, opts.y + relief[i] + bounce);

            for (var t = 0; t < 1; t += opts.bounce.detail) {
              var lerp = {
                x: M.lerp(x, x + opts.tileSize, t),
                y: M.lerp(relief[i], relief[i + 1], t)
              };

              var dist = M.norm(M.maxDist(opts.ball.x, lerp.x, opts.bounce.width), 0, opts.bounce.width);
              bounce = (1 - dist) * stretch;

              ctx.lineTo(lerp.x, opts.y + bounce + lerp.y);
              if (dist <= 0.01) trailMax = opts.y + bounce + lerp.y;
            }
            ctx.lineTo(x + opts.tileSize, opts.y + relief[i + 1] + bounce);
          } else {
            // ELSEWHERE, RIGID STANDARD PLATFORMS
            ctx.moveTo(x, opts.y + relief[i]);
            ctx.lineTo(x + opts.tileSize, opts.y + relief[i + 1]);
          }
        }
      }
      ctx.stroke();

      var floorY = getHeight(opts.ball.x + distance);
      var ballY  = opts.y + floorY - (opts.ball.radius / 2) - (opts.weight / 2) - ball.y;
      var pballY = Math.min(trailMax, opts.y + floorY - ball.trail)  - (opts.ball.radius / 2) - (opts.weight / 2);
      ball.render({
        canvas: opts.canvas,
        ctx: ctx,
        color: opts.colors.ball,
        x: opts.ball.x,
        y: ballY,
        py: pballY,
        floorY: opts.y + floorY,
      });
    },
  };

  function getTileIndex(x) { return Math.floor(x / opts.tileSize); }
  function getHeight(x) {
    var index = getTileIndex(x);
    var t = (x % opts.tileSize) / opts.tileSize;
    return M.lerp(relief[index], relief[index + 1], t);
  }

  function getCurrentTileIndex() { return Math.floor((opts.ball.x + distance) / opts.tileSize); }

  function getCurrentPlatform() {
    var platform = { start : Number.NEGATIVE_INFINITY, stop: Number.POSITIVE_INFINITY };
    // FIND THE NEAREST HOLE ON THE LEFT
    for (var i = getCurrentTileIndex(); i > getCurrentTileIndex() - 3; i--) {
      if (!tiles[i]) {
        platform.start = i;
        break;
      }
    }
    // FIND THE NEAREST HOLE ON THE RIGHT
    for (var i = getCurrentTileIndex(); i < getCurrentTileIndex() + 3; i++) {
      if (!tiles[i]) {
        platform.stop = i;
        break;
      }
    }
    return platform;
  }

  function touch(tileIndex, threshold) {
    var
      t = opts.ball.radius * threshold,
      ballX = opts.ball.x + distance,
      x = tileIndex * opts.tileSize;
    return (ballX > x - t && ballX < x + opts.tileSize + t);
  }

  return api;
}

module.exports = Game;