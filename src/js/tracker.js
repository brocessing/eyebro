navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

function Tracker(opts) {
  // Access the webcam video stream
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, handleVideo, function(e) { console.warn(e); });

    function handleVideo(stream) {
      opts.webcam.src = window.URL.createObjectURL(stream);
    }

    var scoreThreshold = 0.3;

    // Define a new clemtracker object
    // see http://www.auduno.com/clmtrackr/docs/reference.html#parameters
    var ctracker = new clm.tracker({
      constantVelocity  : true,
      searchWindow      : 20,
      useWebGL          : true,
      scoreThreshold    : scoreThreshold,
      stopOnConvergence : false,
    });

    ctracker.init(pModel);

    // improve tracking
    // see http://www.auduno.com/clmtrackr/docs/reference.html#responses
    // ctracker.setResponseMode('blend', ['sobel', 'lbp']);
    ctracker.setResponseMode('single', ['raw']);
  }


  var api = {
    aabb: null,
    points: [],

    isTracking: function() {
      return ctracker.getScore() > scoreThreshold;
    },

    update: function() {
      ctracker.track(opts.webcam);
      api.points = ctracker.getCurrentPosition();
      api.aabb = calcAABB(api.points);
    },

    render: function(canvas, ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1;
      ctracker.draw(canvas);
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

  return api;
}

module.exports = Tracker;