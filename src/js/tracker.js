var MathUtils = require('./math.js')();

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

function Tracker(opts) {


  // Access the webcam video stream
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, handleVideo, function(e) { console.warn(e); });

    function handleVideo(stream) {
      opts.webcam.src = window.URL.createObjectURL(stream);
    }

    // Define a new clemtracker object
    // see http://www.auduno.com/clmtrackr/docs/reference.html#parameters
    var ctracker = new clm.tracker({
      constantVelocity  : true,
      searchWindow      : 11,
      useWebGL          : true,
      scoreThreshold    : 0.3,
      stopOnConvergence : false,
    });

    ctracker.init(pModel);

    // improve tracking
    // see http://www.auduno.com/clmtrackr/docs/reference.html#responses
    // ctracker.setResponseMode('single', ['sobel', 'lbp']);
    ctracker.setResponseMode('single', ['raw']);
  }


  // see http://www.auduno.com/clmtrackr/docs/media/facemodel_numbering_new.png
  var paths = {
    jaw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
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
  }

  var api = {
    aabb: null,
    points: [],
    diff : 0,

    update: function() {
      ctracker.track(opts.webcam);
      api.points = ctracker.getCurrentPosition();
      api.aabb = calcAABB(api.points);

      if (api.points) {
        var eyebrowLeftHeight = api.points[19][1] + api.points[20][1] + api.points[21][1] + api.points[22][1];
        var eyebrowLeftOK = eyebrowLeftHeight / 4;
        var eyebrowRightHeight = api.points[18][1] + api.points[17][1] + api.points[16][1] + api.points[15][1];
        var eyebrowRightOK = eyebrowRightHeight / 4;
        var averageEyebro = (eyebrowLeftOK + eyebrowRightOK) / 2
        var nose = api.points[33][1];

        api.diff = Math.abs((nose - averageEyebro) / api.aabb.height) * 100;
      }
    },

    drawFace: function(canvas, ctx, webcamAABB, drawAABB) {
      ctx.strokeStyle = '#F48FB1';
      ctx.fillStyle = '#F48FB1';
      ctx.lineWidth = 10;
      if (api.points) {
        ctx.beginPath();
        drawPath(ctx, paths.jaw, webcamAABB, drawAABB);
        drawPath(ctx, paths.eyebrows.left, webcamAABB, drawAABB);
        drawPath(ctx, paths.eyebrows.right, webcamAABB, drawAABB);
        drawPath(ctx, paths.nose.bottom, webcamAABB, drawAABB);
        drawPath(ctx, paths.mouth, webcamAABB, drawAABB);
        ctx.stroke();

        var leftEye = fit(api.points[paths.eyes.pupils.left], webcamAABB, drawAABB);
        var rightEye = fit(api.points[paths.eyes.pupils.right], webcamAABB, drawAABB);
        ctx.fillRect(leftEye[0], leftEye[1], 10, 10);
        ctx.fillRect(rightEye[0], rightEye[1], 10, 10);
      }
    },

    render: function(canvas, ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1;
      ctracker.draw(canvas);

      if (api.aabb) {
        api.drawFace(canvas, ctx, {x: 0, y:0, width: 640, height: 480}, {x: canvas.width, y: 0, width: 0, height: canvas.height,});
      }
    },
  };

  // return the axis aligned bounding box of a given set of points
  function calcAABB(points) {
    if (points && points.length > 0) {
      var min = {x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
      var max = {x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
      for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        var x = point[0];
        var y = point[1];
        if (x < min.x) min.x = x;
        else if (x > max.x) max.x = x;

        if (y < min.y) min.y = y;
        else if (y > max.y) max.y = y;
      }

      var w = Math.abs(max.x - min.x);
      var h = Math.abs(max.y - min.y);

      return {
        x: min.x,
        y: min.y,
        center: {x: min.x + w / 2, y: min.y + h / 2},
        width: w,
        height: h
      };
    } else return null;
  }

  // draw a mapped path from a bounding box to another one
  function drawPath(ctx, path, fromAABB, toAABB) {
    var start = fit(api.points[path[0]], fromAABB, toAABB);
    ctx.moveTo(start[0], start[1]);

    for (var i = 0, l = path.length; i < l; i++) {
      var point = fit(api.points[path[i]], fromAABB, toAABB);
      ctx.lineTo(point[0], point[1]);
    }
  }

  // map a point from a bounding box to another one
  function fit(point, fromAABB, toAABB) {
    return [
      MathUtils.map(point[0], fromAABB.x, fromAABB.width, toAABB.x, toAABB.width),
      MathUtils.map(point[1], fromAABB.y, fromAABB.height, toAABB.y, toAABB.height),
    ];
  }

  return api;
}

module.exports = Tracker;