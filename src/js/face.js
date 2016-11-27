var Tracker = require('./tracker');
var MathUtils = require('./math.js')();

function Face(opts) {
  var tracker = Tracker({ webcam: opts.src });
  // see http://www.auduno.com/clmtrackr/docs/media/facemodel_numbering_new.png
  var paths = {
    // jaw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    jaw: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    eyebrows: {
      left: [19, 20, 21, 22],
      right: [15, 16, 17, 18],
    },
    eyes: {
      left:  [23, 63, 24, 64, 25, 65, 26, 66, 23],
      right: [28, 67, 29, 68, 30, 69, 31, 70, 28],
      pupils : {
        left: 27,
        right: 32
      },
    },
    nose: {
      bottom: [34, 35, 36, 42, 37, 43, 38, 39, 40],
      line: [33, 41, 62],
    },
    // mouth: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 44, 56, 57, 58, 50, 59, 60, 61, 44],
    mouth: [44, 56, 57, 58, 50],
  };

  var ctx = opts.canvas.getContext('2d');

  var api = {
    calibrated: false,
    eyebrows: {
      initial: 0,
      samples: [],
      y: 0,
      ymax: Number.POSITIVE_INFINITY,
      dy: 0,
      ny: 0,
    },

    get src() { return opts.src; },
    get tracker() { return tracker; },

    // update eyebrows position values
    update: function() {
      tracker.update();
      if (tracker.isTracking() && tracker.points) {
        // eyebrows Y calculation
        var eyebrowLeftY  = (tracker.points[19][1] + tracker.points[20][1] + tracker.points[21][1] + tracker.points[22][1]) / 4;
        var eyebrowRightY = (tracker.points[18][1] + tracker.points[17][1] + tracker.points[16][1] + tracker.points[15][1]) / 4;
        var averageY = (eyebrowLeftY + eyebrowRightY) / 2;
        var noseY = tracker.points[33][1];
        api.eyebrows.y = Math.abs((noseY - averageY) / tracker.aabb.height) * 100;

        if (api.calibrated === false) api.calibrate();
        else {
          api.eyebrows.dy = api.eyebrows.y.toFixed(0) - api.eyebrows.initial;
          var ny = MathUtils.norm(api.eyebrows.y, api.eyebrows.initial, api.eyebrows.ymax)
          api.eyebrows.ny = MathUtils.constrain(ny, 0, 1);
        }
      }
    },

    calibrate: function() {
      if (api.eyebrows.samples.length < opts.samplingLength) {
        // sample eyebrows position
        api.eyebrows.samples.push(api.eyebrows.y);
      } else {
        // sampling done, calculate initial eyebrows position
        api.eyebrows.initial = getMostCommonValue(api.eyebrows.samples, 0);
        api.eyebrows.ymax = getMaxValue(api.eyebrows.samples);
        api.calibrated = true;
      }
    },

    recalibrate: function() {
      api.eyebrows.samples = [];
      api.calibrated = false;
    },

    render: function() {
      ctx.clearRect(0, 0, opts.canvas.width, opts.canvas.height);
      ctx.strokeStyle = opts.color;
      ctx.fillStyle = opts.color;
      ctx.lineWidth = opts.lineWidth;
      if (tracker.points) {
        var src = {
          x: opts.mirror ? opts.src.width : 0,
          y: 0,
          w: opts.mirror ? 0 : opts.src.width,
          h: opts.src.height,
        };

        // draw face
        ctx.beginPath();
        drawPath(ctx, paths.jaw, src, opts.canvas);
        drawPath(ctx, paths.eyebrows.left, src, opts.canvas);
        drawPath(ctx, paths.eyebrows.right, src, opts.canvas);
        drawPath(ctx, paths.nose.bottom, src, opts.canvas);
        drawPath(ctx, paths.mouth, src, opts.canvas);
        ctx.stroke();

        // draw eyes
        var leftEye = [
          MathUtils.map(tracker.points[paths.eyes.pupils.left][0], src.x, src.w, 0, opts.canvas.width),
          MathUtils.map(tracker.points[paths.eyes.pupils.left][1], src.y, src.h, 0, opts.canvas.height)
        ];
        var rightEye = [
          MathUtils.map(tracker.points[paths.eyes.pupils.right][0], src.x, src.w, 0, opts.canvas.width),
          MathUtils.map(tracker.points[paths.eyes.pupils.right][1], src.y, src.h, 0, opts.canvas.height)
        ];
        ctx.fillRect(leftEye[0], leftEye[1], 10, 10);
        ctx.fillRect(rightEye[0], rightEye[1], 10, 10);
      }
    },
  };

  // draw a mapped path from a bounding box to another one
  function drawPath(ctx, path, src, canvas) {
    var w = canvas.width;
    var h = canvas.height;
    for (var i = 0, l = path.length; i < l; i++) {
      var point = tracker.points[path[i]];
      var x = MathUtils.map(point[0], src.x, src.w, 0, w);
      var y = MathUtils.map(point[1], src.y, src.h, 0, h);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
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