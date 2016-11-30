/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	module.exports = __webpack_require__(11);


/***/ },
/* 1 */
/***/ function(module, exports) {

	function M() {
	  var api = {
	    fastDist: function (a, b) {
	      return (b - a) * (b - a);
	    },
	    maxDist: function (a, b, max) {
	      return api.map(api.constrain(api.fastDist(a, b), 0, max * max), 0, max * max, 0, max);
	    },
	    constrain: function (a, min, max) {
	      return Math.max(min, Math.min(a, max));
	    },
	    map: function (a, in_min, in_max, out_min, out_max) {
	      return (a - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	    },
	    lerp: function (a, b, t) {
	      return a + t * (b - a);
	    },
	    norm: function (a, min, max) {
	      return api.map(a, min, max, 0, 1);
	    }
	  };
	
	  return api;
	}
	
	module.exports = M;

/***/ },
/* 2 */
/***/ function(module, exports) {

	function E () {
	  // Keep this empty so it's easier to inherit from
	  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
	}
	
	E.prototype = {
	  on: function (name, callback, ctx) {
	    var e = this.e || (this.e = {});
	
	    (e[name] || (e[name] = [])).push({
	      fn: callback,
	      ctx: ctx
	    });
	
	    return this;
	  },
	
	  once: function (name, callback, ctx) {
	    var self = this;
	    function listener () {
	      self.off(name, listener);
	      callback.apply(ctx, arguments);
	    };
	
	    listener._ = callback
	    return this.on(name, listener, ctx);
	  },
	
	  emit: function (name) {
	    var data = [].slice.call(arguments, 1);
	    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
	    var i = 0;
	    var len = evtArr.length;
	
	    for (i; i < len; i++) {
	      evtArr[i].fn.apply(evtArr[i].ctx, data);
	    }
	
	    return this;
	  },
	
	  off: function (name, callback) {
	    var e = this.e || (this.e = {});
	    var evts = e[name];
	    var liveEvents = [];
	
	    if (evts && callback) {
	      for (var i = 0, len = evts.length; i < len; i++) {
	        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
	          liveEvents.push(evts[i]);
	      }
	    }
	
	    // Remove event from queue to prevent memory leak
	    // Suggested by https://github.com/lazd
	    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910
	
	    (liveEvents.length)
	      ? e[name] = liveEvents
	      : delete e[name];
	
	    return this;
	  }
	};
	
	module.exports = E;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var raf = __webpack_require__(13);
	var Screen = __webpack_require__(7);
	var Face = __webpack_require__(5);
	var Game = __webpack_require__(6);
	var Sound = __webpack_require__(8);
	
	// -------------------------------------------------------------------------
	// SCREENS INIT
	var screens = {
	  home: Screen('section.screen#welcome', true),
	  tuto: Screen('section.screen#tuto'),
	  game: Screen('section.screen#game'),
	  end: Screen('section.screen#end')
	};
	
	// -------------------------------------------------------------------------
	// CANVAS INIT
	
	var canvases = {
	  face: window.document.getElementById('canvasFaces'),
	  game: window.document.getElementById('canvasGame')
	};
	
	(function setCanvasesSize() {
	  var w = window.innerWidth;
	  var h = window.innerHeight;
	
	  canvases.face.width = w;
	  canvases.face.height = h;
	  canvases.face.style.width = canvases.face.width + 'px';
	  canvases.face.style.height = canvases.face.height + 'px';
	
	  canvases.game.width = w;
	  canvases.game.height = h;
	  canvases.game.style.width = canvases.game.width + 'px';
	  canvases.game.style.height = canvases.game.height + 'px';
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
	  samplingLength: 100
	});
	
	face.on('start', function () {
	  raf.add(function (dt) {
	    face.update();
	    face.render();
	  });
	
	  initGame();
	});
	
	face.on('error', function (err) {
	  screens.home.elem.classList.add('error');
	});
	
	window.document.getElementById('showWebcamLabel').addEventListener('click', function () {
	  webcam.debug = !window.document.getElementById('showWebcam').checked;
	});
	
	// -------------------------------------------------------------------------
	// GAME ENGINE INIT
	function initGame() {
	  var tutoBtn = screens.home.querySelectorAll('button#start')[0];
	  tutoBtn.addEventListener('click', function () {
	    screens.home.hide();
	    screens.tuto.show();
	  });
	
	  var playBtn = screens.tuto.querySelectorAll('button#start')[0];
	  playBtn.addEventListener('click', function () {
	    screens.tuto.hide();
	    screens.game.show();
	  });
	
	  screens.game.on('show', function () {
	    var game = Game({
	      canvas: canvases.game
	    });
	
	    var score = screens.game.querySelectorAll('#score')[0];
	    var wahou = screens.game.querySelectorAll('.wahou')[0];
	
	    var sound = Sound();
	    game.on('jump', function () {
	      if (game.running) sound.play('jump1');
	    });
	    game.on('bounce', function () {
	      if (game.running) sound.play('bounce' + Math.ceil(Math.random() * 3));
	    });
	    // game.on('stop', function() { sound.stopLoop(); });
	    sound.on('load', function (e) {
	      if (e.id === 'loop') sound.startLoop();
	    });
	
	    raf.add(function (dt) {
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
	        sound.play('wow');
	      }
	    });
	
	    game.start();
	
	    game.on('loose', function () {
	
	      screens.game.hide();
	      var twitterURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('my eyebrows are so bros they did ' + game.score + ' points, on ' + window.location.href);
	      screens.end.querySelectorAll('#score > a')[0].setAttribute('href', twitterURL);
	      screens.end.querySelectorAll('#scoreValue')[0].innerHTML = game.score;
	      screens.end.querySelectorAll('button#retry')[0].addEventListener('click', function () {
	        screens.end.hide();
	        screens.game.show();
	      });
	      screens.end.show();
	    });
	  });
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var MathUtils = __webpack_require__(1)();
	var Splash = __webpack_require__(9);
	
	function Ball(opts) {
	
	  var y = 200,
	      ty = 0,
	      py = 0,
	      velocity = 0,
	      acceleration = 0,
	      mass = 0.1;
	  var trail = [];
	  var canJump = true;
	
	  var splashes = [];
	
	  var api = {
	    get y() {
	      return y;
	    },
	    get py() {
	      return py;
	    },
	    get dy() {
	      return MathUtils.maxDist(y, py, 10) / 10;
	    },
	    get trail() {
	      return trail[0];
	    },
	
	    jump: function (acc) {
	      if (canJump) {
	        velocity = acc;
	        splashes.push(Splash(10, 200));
	      }
	    },
	
	    update: function (dt, speed, floor = false) {
	      // splashes update
	      for (var i = splashes.length - 1; i >= 0; i--) {
	        if (i !== -1) {
	          var splash = splashes[i];
	          if (splash.recycle) splashes.splice(i, 1);else splash.update(dt, speed);
	        }
	      }
	
	      collid = false;
	
	      // ball update
	      py = y;
	      velocity -= opts.gravity * (dt / 1000) * 30;
	      y += velocity * (dt / 1000) * 30;
	
	      if (floor && y <= 0) {
	        if (py > 2) {
	          splashes.push(Splash(api.dy * 3, api.dy * 100, speed));
	          collid = true;
	        }
	
	        var k = -20;
	        var b = -0.1;
	        var spring = k * y;
	        var damper = b * velocity * 100;
	        acceleration = spring + damper;
	
	        velocity += acceleration * (dt / 1000);
	        y += velocity * (dt / 1000);
	
	        canJump = true;
	      }
	
	      velocity = Math.min(velocity, 100);
	
	      pushTrail(this.py);
	
	      if (y > opts.jumpMax) canJump = false;
	      return collid;
	    },
	
	    render: function (param) {
	      for (var i = 0, l = splashes.length; i < l; i++) {
	        var splash = splashes[i];
	        splash.render(param);
	      }
	
	      param.ctx.strokeStyle = param.color;
	      param.ctx.lineWidth = Math.floor(opts.radius + api.dy * opts.stretch);
	      param.ctx.beginPath();
	      param.ctx.moveTo(param.x, param.y);
	      param.ctx.lineTo(param.x - api.dy * 5, param.py);
	      param.ctx.stroke();
	    }
	  };
	
	  function pushTrail(y) {
	    for (var i = 0; i < opts.trailLength - 1; i++) trail[i] = trail[i + 1];
	    trail[trail.length - 1] = y;
	  }
	
	  return api;
	}
	
	module.exports = Ball;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Tracker = __webpack_require__(10);
	var MathUtils = __webpack_require__(1)();
	var TinyEmitter = __webpack_require__(2);
	
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
	
	function Face(opts) {
	  var emitter = new TinyEmitter();
	
	  var tracker;
	  if (navigator.getUserMedia) {
	    navigator.getUserMedia({ video: true }, handleVideo, handleError);
	
	    function handleVideo(stream) {
	      opts.webcam.src = window.URL.createObjectURL(stream);
	      tracker = Tracker({ src: opts.webcam });
	      emitter.emit('start');
	    }
	
	    function handleError(err) {
	      emitter.emit('error', err);
	    }
	  } else {
	    emitter.emit('error', 'unsupported browser');
	  }
	
	  // see http://www.auduno.com/clmtrackr/docs/media/facemodel_numbering_new.png
	  var paths = {
	    // jaw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
	    jaw: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	    eyebrows: {
	      left: [19, 20, 21, 22],
	      right: [15, 16, 17, 18]
	    },
	    unibrow: [19, 20, 21, 22, 18, 17, 16, 15],
	    eyes: {
	      left: [23, 63, 24, 64, 25, 65, 26, 66, 23],
	      right: [28, 67, 29, 68, 30, 69, 31, 70, 28],
	      pupils: {
	        left: 27,
	        right: 32
	      }
	    },
	    nose: {
	      bottom: [34, 35, 36, 42, 37, 43, 38, 39, 40],
	      line: [33, 41, 62]
	    },
	    // mouth: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 44, 56, 57, 58, 50, 59, 60, 61, 44],
	    mouth: [44, 56, 57, 58, 50]
	  };
	
	  var ctx = opts.canvas.getContext('2d');
	
	  var api = {
	    calibrated: false,
	    eyebrows: {
	      y: 0,
	      ymax: 13
	    },
	
	    get src() {
	      return opts.webcam;
	    },
	    get tracker() {
	      return tracker;
	    },
	
	    on: function (event, cb) {
	      emitter.on(event, cb);
	    },
	
	    // update eyebrows position values
	    update: function () {
	      tracker.update();
	      if (tracker.isTracking() && tracker.points) {
	        // eyebrows Y calculation
	        var eyebrowLeftY = (tracker.points[19][1] + tracker.points[20][1] + tracker.points[21][1] + tracker.points[22][1]) / 4;
	        var eyebrowRightY = (tracker.points[18][1] + tracker.points[17][1] + tracker.points[16][1] + tracker.points[15][1]) / 4;
	        var averageY = (eyebrowLeftY + eyebrowRightY) / 2;
	        var noseY = tracker.points[33][1];
	        api.eyebrows.y = Math.abs((noseY - averageY) / tracker.aabb.height) * 100;
	
	        api.calibrate();
	      } else {
	        api.recalibrate();
	      }
	    },
	
	    calibrate: function () {
	      if (api.eyebrows.y > api.eyebrows.ymax) {
	        api.eyebrows.ymax = api.eyebrows.y;
	      }
	    },
	
	    recalibrate: function () {
	      api.eyebrows.ymax = 13;
	    },
	
	    render: function () {
	      ctx.clearRect(0, 0, opts.canvas.width, opts.canvas.height);
	      ctx.strokeStyle = opts.color;
	      ctx.fillStyle = opts.color;
	      ctx.lineWidth = opts.lineWidth;
	      ctx.lineCap = 'round';
	
	      if (tracker.points) {
	        var src = {
	          x: opts.mirror ? opts.webcam.width : 0,
	          y: 0,
	          w: opts.mirror ? 0 : opts.webcam.width,
	          h: opts.webcam.height
	        };
	
	        // draw face
	        ctx.beginPath();
	        drawPath(ctx, paths.jaw, src, opts.canvas);
	        drawPath(ctx, paths.nose.bottom, src, opts.canvas);
	        drawPath(ctx, paths.mouth, src, opts.canvas);
	        ctx.stroke();
	
	        ctx.beginPath();
	        ctx.strokeStyle = '#FFA5A5';
	        drawPath(ctx, paths.eyebrows.left, src, opts.canvas);
	        drawPath(ctx, paths.eyebrows.right, src, opts.canvas);
	        ctx.stroke();
	
	        // draw eyes
	        var leftEye = [MathUtils.map(tracker.points[paths.eyes.pupils.left][0], src.x, src.w, 0, opts.canvas.width), MathUtils.map(tracker.points[paths.eyes.pupils.left][1], src.y, src.h, 0, opts.canvas.height)];
	        var rightEye = [MathUtils.map(tracker.points[paths.eyes.pupils.right][0], src.x, src.w, 0, opts.canvas.width), MathUtils.map(tracker.points[paths.eyes.pupils.right][1], src.y, src.h, 0, opts.canvas.height)];
	        ctx.beginPath();
	        ctx.arc(leftEye[0], leftEye[1], 8, 0, 2 * Math.PI, false);
	        ctx.arc(rightEye[0], rightEye[1], 8, 0, 2 * Math.PI, false);
	        ctx.fill();
	      }
	    }
	  };
	
	  // draw a mapped path from a bounding box to another one
	  function drawPath(ctx, path, src, canvas) {
	    var w = canvas.width;
	    var h = canvas.height;
	    for (var i = 0, l = path.length; i < l; i++) {
	      var point = tracker.points[path[i]];
	      var x = MathUtils.map(point[0], src.x, src.w, 0, w);
	      var y = MathUtils.map(point[1], src.y, src.h, 0, h);
	
	      if (i === 0) ctx.moveTo(x, y);else ctx.lineTo(x, y);
	    }
	  }
	
	  // return the most common value of an array, rounded to precision
	  function getMostCommonValue(arr, precision) {
	    var frequency = {};
	    var max = 0;
	    var rounder = Math.pow(10, precision);
	    var result;
	
	    for (var i = 0, l = arr.length; i < l; i++) {
	      var value = Math.round(arr[i] * rounder) / rounder;
	      frequency[value] = (frequency[value] || 0) + 1;
	      if (frequency[value] > max) {
	        max = frequency[value];
	        result = value;
	      }
	    }
	    return result;
	  }
	
	  function getMaxValue(arr) {
	    var result = Number.NEGATIVE_INFINITY;
	    for (var i = 0, l = arr.length; i < l; i++) {
	      var value = arr[i];
	      if (value > result) result = value;
	    }
	    return result;
	  }
	
	  return api;
	}
	
	module.exports = Face;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Perlin = __webpack_require__(12).noise;
	var M = __webpack_require__(1)();
	var Ball = __webpack_require__(4);
	var TinyEmitter = __webpack_require__(2);
	
	function Game(_opts) {
	  var opts = Object.assign({
	    canvas: null,
	
	    godmode: false,
	    autoSpeed: true,
	
	    tileSize: 100,
	    jumpSpeed: 15,
	    initialSpeed: 7.0,
	    maxSpeed: 30.0,
	    acceleration: 0.01,
	    nextScore: 2000,
	
	    y: 500,
	    width: 9999999,
	    weight: 10,
	    bounce: {
	      height: 150,
	      width: 200,
	      detail: 0.1
	    },
	
	    colors: {
	      platform: '#BFCFFF',
	      ball: '#FFA5A5'
	    },
	
	    ball: {
	      x: 200,
	      trailLength: 3,
	      radius: 25,
	      gravity: 9.81 * 0.75,
	      bounce: 0.5,
	      jumpMax: 50,
	      aerial: 0.35,
	      stretch: 0.8
	    }
	  }, _opts);
	
	  var emitter = new TinyEmitter();
	  var ctx = opts.canvas.getContext('2d');
	
	  var distance = 0;
	  var speed = opts.initialSpeed;
	  var ball = Ball(opts.ball);
	
	  // -------------------------------------------------------------------------
	
	  var tiles = function () {
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
	        next = Math.floor(Math.random() * 7) - (Math.random() > 0.9 ? M.map(i, 0, opts.width, 1, 10) : 1);
	      }
	    }
	
	    return tiles;
	  }();
	
	  var relief = function () {
	    var values = [];
	    var xoff = 0;
	    for (var i = 0; i < tiles.length; i++) {
	      values.push(Perlin.perlin2(xoff, 0) * 100);
	      xoff += 0.2;
	    }
	    return values;
	  }();
	
	  // -------------------------------------------------------------------------
	
	  var api = {
	    running: false,
	    get distance() {
	      return distance;
	    },
	    get score() {
	      return distance.toFixed(0);
	    },
	    get nextScore() {
	      return opts.nextScore;
	    },
	    set nextScore(s) {
	      opts.nextScore = s;
	    },
	
	    on: function (event, cb) {
	      emitter.on(event, cb);
	    },
	
	    start: function () {
	      api.running = true;
	      ball.y = 0;
	      emitter.emit('start');
	    },
	
	    stop: function () {
	      api.running = false;
	      emitter.emit('stop');
	    },
	
	    loose: function (cb) {
	      console.warn('GAME OVER.');
	      emitter.emit('loose');
	    },
	
	    jump: function (acc = 80) {
	      ball.jump(acc);
	      emitter.emit('jump');
	    },
	
	    update: function (dt) {
	      if (api.running) {
	        if (opts.autoSpeed) speed = Math.min(speed + opts.acceleration, opts.maxSpeed);
	        distance += speed;
	
	        var collide = ball.y > -100 && tiles[getCurrentTileIndex()] && touch(getCurrentTileIndex(), 3);
	        var bounce = ball.update(dt, speed, collide || opts.godmode);
	        if (bounce) emitter.emit('bounce');
	
	        if (ball.y < -600) {
	          api.stop();
	          api.loose();
	        }
	      }
	
	      return api;
	    },
	
	    render: function () {
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
	        if (x > -opts.tileSize && x < opts.canvas.width && tiles[i]) {
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
	      var ballY = opts.y + floorY - opts.ball.radius / 2 - opts.weight / 2 - ball.y;
	      var pballY = Math.min(trailMax, opts.y + floorY - ball.trail) - opts.ball.radius / 2 - opts.weight / 2;
	      ball.render({
	        canvas: opts.canvas,
	        ctx: ctx,
	        color: opts.colors.ball,
	        x: opts.ball.x,
	        y: ballY,
	        py: pballY,
	        floorY: opts.y + floorY
	      });
	    }
	  };
	
	  function getTileIndex(x) {
	    return Math.floor(x / opts.tileSize);
	  }
	  function getHeight(x) {
	    var index = getTileIndex(x);
	    var t = x % opts.tileSize / opts.tileSize;
	    return M.lerp(relief[index], relief[index + 1], t);
	  }
	
	  function getCurrentTileIndex() {
	    return Math.floor((opts.ball.x + distance) / opts.tileSize);
	  }
	
	  function getCurrentPlatform() {
	    var platform = { start: Number.NEGATIVE_INFINITY, stop: Number.POSITIVE_INFINITY };
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
	    var t = opts.ball.radius * threshold,
	        ballX = opts.ball.x + distance,
	        x = tileIndex * opts.tileSize;
	    return ballX > x - t && ballX < x + opts.tileSize + t;
	  }
	
	  return api;
	}
	
	module.exports = Game;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var TinyEmitter = __webpack_require__(2);
	
	function Screen(selector, _visible = false) {
	  var elem = window.document.querySelectorAll(selector)[0];
	  var emitter = new TinyEmitter();
	
	  var api = {
	    visible: false,
	    get elem() {
	      return elem;
	    },
	
	    on: function (event, cb) {
	      emitter.on(event, cb);
	    },
	
	    show: function (cb) {
	      if (!api.visible) {
	        if (elem && elem.classList && !elem.classList.contains('show')) {
	          emitter.emit('show');
	          elem.classList.add('show');
	          api.visible = true;
	
	          if (cb) cb();
	        }
	      }
	    },
	
	    hide: function (cb) {
	      if (api.visible) {
	        if (elem && elem.classList && elem.classList.contains('show')) {
	          elem.classList.remove('show');
	          emitter.emit('hide');
	          api.visible = false;
	
	          if (cb) cb();
	        }
	      }
	    },
	
	    querySelectorAll: function (selector) {
	      return elem.querySelectorAll(selector);
	    }
	  };
	
	  if (_visible) api.show();
	
	  return api;
	}
	
	module.exports = Screen;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var TinyEmitter = __webpack_require__(2);
	
	function SoundWrapper() {
	  var emitter = new TinyEmitter();
	  var audioPath = "assets/sounds/";
	  var sounds = [{ id: 'wow', src: 'wow.ogg' }, { id: 'jump1', src: 'jump_1.ogg' }, { id: 'jump2', src: 'jump_2.ogg' }, { id: 'bounce1', src: 'bounce_1.ogg' }, { id: 'bounce2', src: 'bounce_2.ogg' }, { id: 'bounce3', src: 'bounce_3.ogg' }, { id: 'loop', src: 'loop.ogg' }];
	
	  createjs.Sound.addEventListener('fileload', function (event) {
	    emitter.emit('load', event);
	  });
	
	  for (var i = 0, l = sounds.length; i < l; i++) {
	    var s = sounds[i];
	    createjs.Sound.registerSound(audioPath + s.src, s.id, 1);
	  }
	
	  var loop, fadeOut;
	
	  var api = {
	    on: function (event, cb) {
	      emitter.on(event, cb);
	    },
	
	    play: function (soundID) {
	      createjs.Sound.play(soundID);
	    },
	
	    startLoop: function () {
	      loop = createjs.Sound.play('loop', { loop: -1 });
	    },
	
	    stopLoop: function () {
	      fadeOut = setInterval(function () {
	        loop.volume = loop.volume * 0.75;
	        if (loop.volume <= 0.01) {
	          clearInterval(fadeOut);
	          loop.volume = 0;
	        }
	      }, 100);
	    }
	  };
	
	  return api;
	}
	
	module.exports = SoundWrapper;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var MathUtils = __webpack_require__(1)();
	
	function Splash(n, amt, speed = 0) {
	
	  var particles = function () {
	    var pp = [];
	    for (var i = 0; i < n; i++) {
	      var p = {
	        x: 0,
	        y: 0,
	        tx: Math.random() * (amt * 1.5) - amt - speed,
	        ty: -Math.random() * amt * 2,
	        weight: 1 + Math.random() * 2,
	        px: 0,
	        py: 0
	      };
	
	      pp.push(p);
	    }
	    return pp;
	  }();
	
	  var y;
	  var dieDistThreshold = 20;
	
	  var api = {
	    recycle: false,
	
	    update: function (dt, speed) {
	      var deadCounter = 0;
	      for (var i = 0, l = particles.length; i < l; i++) {
	        var p = particles[i];
	        if (p) {
	          p.px = p.x;
	          p.py = p.y;
	
	          p.ty += 9.87 * p.weight * (dt / 1000) * 40;
	
	          p.x += (p.tx - p.x) * 0.09 * (dt / 1000) * 40;
	          p.y += (p.ty - p.y) * 0.09 * (dt / 1000) * 40;
	
	          if (Math.abs(p.x - p.px) < 1) particles[i] = null;
	        } else deadCounter++;
	      }
	
	      if (deadCounter >= particles.length) api.recycle = true;
	    },
	
	    render: function (param) {
	      y = y || param.floorY;
	      param.ctx.beginPath();
	      for (var i = 0, l = particles.length; i < l; i++) {
	        var p = particles[i];
	        if (p && p.y < y) {
	          param.ctx.moveTo(param.x + p.x, y + p.y);
	          param.ctx.lineTo(param.x + p.px, y + p.py);
	        }
	      }
	      param.ctx.stroke();
	    }
	  };
	
	  return api;
	}
	
	module.exports = Splash;

/***/ },
/* 10 */
/***/ function(module, exports) {

	function Tracker(opts) {
	  var scoreThreshold = 0.4;
	
	  // Define a new clemtracker object
	  // see http://www.auduno.com/clmtrackr/docs/reference.html#parameters
	  var ctracker = new clm.tracker({
	    constantVelocity: true,
	    searchWindow: 11,
	    useWebGL: true,
	    scoreThreshold: scoreThreshold,
	    stopOnConvergence: false,
	    faceDetection: {
	      workSize: 160,
	      minScale: 2,
	      scaleFactor: 1.15,
	      useCanny: true, // false
	      edgesDensity: 1, // 0.13
	      equalizeHistogram: true
	    }
	  });
	  ctracker.init(pModel);
	  // improve tracking
	  // see http://www.auduno.com/clmtrackr/docs/reference.html#responses
	  // ctracker.setResponseMode('blend', ['raw', 'sobel']);
	  ctracker.setResponseMode('single', ['raw']);
	  ctracker.start(opts.src);
	
	  var api = {
	    aabb: null,
	    points: [],
	
	    isTracking: function () {
	      return ctracker.getScore() > scoreThreshold;
	    },
	
	    update: function () {
	      api.points = ctracker.getCurrentPosition();
	      api.aabb = calcAABB(api.points);
	    },
	
	    render: function (canvas, ctx) {
	      ctx.clearRect(0, 0, canvas.width, canvas.height);
	      ctx.lineWidth = 1;
	      ctracker.draw(canvas);
	    }
	  };
	
	  // return the axis aligned bounding box of a given set of points
	  function calcAABB(points) {
	    if (points && points.length > 0) {
	      var min = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
	      var max = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
	      for (var i = 0, l = points.length; i < l; i++) {
	        var point = points[i];
	        var x = point[0];
	        var y = point[1];
	        if (x < min.x) min.x = x;else if (x > max.x) max.x = x;
	
	        if (y < min.y) min.y = y;else if (y > max.y) max.y = y;
	      }
	
	      var w = Math.abs(max.x - min.x);
	      var h = Math.abs(max.y - min.y);
	
	      return {
	        x: min.x,
	        y: min.y,
	        center: { x: min.x + w / 2, y: min.y + h / 2 },
	        width: w,
	        height: h
	      };
	    } else return null;
	  }
	
	  return api;
	}
	
	module.exports = Tracker;

/***/ },
/* 11 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A speed-improved perlin and simplex noise algorithms for 2D.
	 *
	 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
	 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
	 * Better rank ordering method by Stefan Gustavson in 2012.
	 * Converted to Javascript by Joseph Gentle.
	 *
	 * Version 2012-03-09
	 *
	 * This code was placed in the public domain by its original author,
	 * Stefan Gustavson. You may use it as you see fit, but
	 * attribution is appreciated.
	 *
	 */
	
	(function(global){
	  var module = global.noise = {};
	
	  function Grad(x, y, z) {
	    this.x = x; this.y = y; this.z = z;
	  }
	  
	  Grad.prototype.dot2 = function(x, y) {
	    return this.x*x + this.y*y;
	  };
	
	  Grad.prototype.dot3 = function(x, y, z) {
	    return this.x*x + this.y*y + this.z*z;
	  };
	
	  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
	               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
	               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];
	
	  var p = [151,160,137,91,90,15,
	  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
	  // To remove the need for index wrapping, double the permutation table length
	  var perm = new Array(512);
	  var gradP = new Array(512);
	
	  // This isn't a very good seeding function, but it works ok. It supports 2^16
	  // different seed values. Write something better if you need more seeds.
	  module.seed = function(seed) {
	    if(seed > 0 && seed < 1) {
	      // Scale the seed out
	      seed *= 65536;
	    }
	
	    seed = Math.floor(seed);
	    if(seed < 256) {
	      seed |= seed << 8;
	    }
	
	    for(var i = 0; i < 256; i++) {
	      var v;
	      if (i & 1) {
	        v = p[i] ^ (seed & 255);
	      } else {
	        v = p[i] ^ ((seed>>8) & 255);
	      }
	
	      perm[i] = perm[i + 256] = v;
	      gradP[i] = gradP[i + 256] = grad3[v % 12];
	    }
	  };
	
	  module.seed(0);
	
	  /*
	  for(var i=0; i<256; i++) {
	    perm[i] = perm[i + 256] = p[i];
	    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
	  }*/
	
	  // Skewing and unskewing factors for 2, 3, and 4 dimensions
	  var F2 = 0.5*(Math.sqrt(3)-1);
	  var G2 = (3-Math.sqrt(3))/6;
	
	  var F3 = 1/3;
	  var G3 = 1/6;
	
	  // 2D simplex noise
	  module.simplex2 = function(xin, yin) {
	    var n0, n1, n2; // Noise contributions from the three corners
	    // Skew the input space to determine which simplex cell we're in
	    var s = (xin+yin)*F2; // Hairy factor for 2D
	    var i = Math.floor(xin+s);
	    var j = Math.floor(yin+s);
	    var t = (i+j)*G2;
	    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
	    var y0 = yin-j+t;
	    // For the 2D case, the simplex shape is an equilateral triangle.
	    // Determine which simplex we are in.
	    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
	      i1=1; j1=0;
	    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
	      i1=0; j1=1;
	    }
	    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	    // c = (3-sqrt(3))/6
	    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	    var y1 = y0 - j1 + G2;
	    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
	    var y2 = y0 - 1 + 2 * G2;
	    // Work out the hashed gradient indices of the three simplex corners
	    i &= 255;
	    j &= 255;
	    var gi0 = gradP[i+perm[j]];
	    var gi1 = gradP[i+i1+perm[j+j1]];
	    var gi2 = gradP[i+1+perm[j+1]];
	    // Calculate the contribution from the three corners
	    var t0 = 0.5 - x0*x0-y0*y0;
	    if(t0<0) {
	      n0 = 0;
	    } else {
	      t0 *= t0;
	      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
	    }
	    var t1 = 0.5 - x1*x1-y1*y1;
	    if(t1<0) {
	      n1 = 0;
	    } else {
	      t1 *= t1;
	      n1 = t1 * t1 * gi1.dot2(x1, y1);
	    }
	    var t2 = 0.5 - x2*x2-y2*y2;
	    if(t2<0) {
	      n2 = 0;
	    } else {
	      t2 *= t2;
	      n2 = t2 * t2 * gi2.dot2(x2, y2);
	    }
	    // Add contributions from each corner to get the final noise value.
	    // The result is scaled to return values in the interval [-1,1].
	    return 70 * (n0 + n1 + n2);
	  };
	
	  // 3D simplex noise
	  module.simplex3 = function(xin, yin, zin) {
	    var n0, n1, n2, n3; // Noise contributions from the four corners
	
	    // Skew the input space to determine which simplex cell we're in
	    var s = (xin+yin+zin)*F3; // Hairy factor for 2D
	    var i = Math.floor(xin+s);
	    var j = Math.floor(yin+s);
	    var k = Math.floor(zin+s);
	
	    var t = (i+j+k)*G3;
	    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
	    var y0 = yin-j+t;
	    var z0 = zin-k+t;
	
	    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
	    // Determine which simplex we are in.
	    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
	    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
	    if(x0 >= y0) {
	      if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
	      else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
	      else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
	    } else {
	      if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
	      else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
	      else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
	    }
	    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
	    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
	    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
	    // c = 1/6.
	    var x1 = x0 - i1 + G3; // Offsets for second corner
	    var y1 = y0 - j1 + G3;
	    var z1 = z0 - k1 + G3;
	
	    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
	    var y2 = y0 - j2 + 2 * G3;
	    var z2 = z0 - k2 + 2 * G3;
	
	    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
	    var y3 = y0 - 1 + 3 * G3;
	    var z3 = z0 - 1 + 3 * G3;
	
	    // Work out the hashed gradient indices of the four simplex corners
	    i &= 255;
	    j &= 255;
	    k &= 255;
	    var gi0 = gradP[i+   perm[j+   perm[k   ]]];
	    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
	    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
	    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];
	
	    // Calculate the contribution from the four corners
	    var t0 = 0.5 - x0*x0-y0*y0-z0*z0;
	    if(t0<0) {
	      n0 = 0;
	    } else {
	      t0 *= t0;
	      n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
	    }
	    var t1 = 0.5 - x1*x1-y1*y1-z1*z1;
	    if(t1<0) {
	      n1 = 0;
	    } else {
	      t1 *= t1;
	      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
	    }
	    var t2 = 0.5 - x2*x2-y2*y2-z2*z2;
	    if(t2<0) {
	      n2 = 0;
	    } else {
	      t2 *= t2;
	      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
	    }
	    var t3 = 0.5 - x3*x3-y3*y3-z3*z3;
	    if(t3<0) {
	      n3 = 0;
	    } else {
	      t3 *= t3;
	      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
	    }
	    // Add contributions from each corner to get the final noise value.
	    // The result is scaled to return values in the interval [-1,1].
	    return 32 * (n0 + n1 + n2 + n3);
	
	  };
	
	  // ##### Perlin noise stuff
	
	  function fade(t) {
	    return t*t*t*(t*(t*6-15)+10);
	  }
	
	  function lerp(a, b, t) {
	    return (1-t)*a + t*b;
	  }
	
	  // 2D Perlin Noise
	  module.perlin2 = function(x, y) {
	    // Find unit grid cell containing point
	    var X = Math.floor(x), Y = Math.floor(y);
	    // Get relative xy coordinates of point within that cell
	    x = x - X; y = y - Y;
	    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
	    X = X & 255; Y = Y & 255;
	
	    // Calculate noise contributions from each of the four corners
	    var n00 = gradP[X+perm[Y]].dot2(x, y);
	    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
	    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
	    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);
	
	    // Compute the fade curve value for x
	    var u = fade(x);
	
	    // Interpolate the four results
	    return lerp(
	        lerp(n00, n10, u),
	        lerp(n01, n11, u),
	       fade(y));
	  };
	
	  // 3D Perlin Noise
	  module.perlin3 = function(x, y, z) {
	    // Find unit grid cell containing point
	    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
	    // Get relative xyz coordinates of point within that cell
	    x = x - X; y = y - Y; z = z - Z;
	    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
	    X = X & 255; Y = Y & 255; Z = Z & 255;
	
	    // Calculate noise contributions from each of the eight corners
	    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
	    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
	    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
	    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
	    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
	    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
	    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
	    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);
	
	    // Compute the fade curve value for x, y, z
	    var u = fade(x);
	    var v = fade(y);
	    var w = fade(z);
	
	    // Interpolate
	    return lerp(
	        lerp(
	          lerp(n000, n100, u),
	          lerp(n001, n101, u), w),
	        lerp(
	          lerp(n010, n110, u),
	          lerp(n011, n111, u), w),
	       v);
	  };
	
	})( false ? this : module.exports);

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use-strict'
	
	var singleton = raf()
	
	function raf () {
	  var _observers = []
	  var _raf = null
	  var _now = Date.now()
	  var _lastDate = _now
	
	  function fpsLimiter (fps, fn) {
	    var _lastDate = _now
	    var _interval = 1000 / fps
	    var _delta = -1
	    return function () {
	      _delta = (_delta === -1) ? _interval : _now - _lastDate
	      if (_delta >= _interval) {
	        fn(_delta)
	        _lastDate = _now - (_delta % _interval)
	      }
	    }
	  }
	
	  function _run () {
	    _now = Date.now()
	    var _delta = _now - _lastDate
	
	    for (var i = 0; i < _observers.length; i++) {
	      _observers[i](_delta)
	    }
	
	    _lastDate = _now
	    _raf = window.requestAnimationFrame(_run)
	  }
	
	  function start () {
	    if (_raf) return
	    _run()
	  }
	
	  function stop () {
	    if (!_raf) return
	    window.cancelAnimationFrame(_raf)
	    _raf = null
	  }
	
	  function add (fn) {
	    if (_observers.indexOf(fn) === -1) {
	      _observers.push(fn)
	      start()
	    }
	  }
	
	  function remove (fn) {
	    var index = _observers.indexOf(fn)
	    if (index !== -1) {
	      _observers.splice(index, 1)
	      if (_observers.length === 0) stop()
	    }
	  }
	
	  return {
	    start: start,
	    stop: stop,
	    add: add,
	    remove: remove,
	    fpsLimiter: fpsLimiter
	  }
	}
	
	module.exports = singleton


/***/ }
/******/ ]);