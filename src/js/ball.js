var MathUtils = require('./math')();
var Splash    = require('./splash');

function Ball(opts) {

  var y = 200, ty = 0, py = 0, velocity = 0, acceleration = 0, mass = 0.1;
  var trail = [];
  var canJump = true;

  var splashes = [];

  var api = {
    get y() { return y; },
    get py() { return py; },
    get dy() { return MathUtils.maxDist(y, py, 10) / 10; },
    get trail() { return trail[0]; },

    jump: function(acc) {
      if (canJump) {
        velocity = acc;
        splashes.push(Splash(10, 200));
      }
    },

    update: function(dt, speed, floor = false) {
      // splashes update
      for (var i = splashes.length - 1; i >= 0; i--) {
        if (i !== -1) {
          var splash = splashes[i];
          if (splash.recycle) splashes.splice(i, 1);
          else splash.update(dt, speed);
        }
      }

      // ball update
      py = y;
      velocity -= opts.gravity * (dt/1000) * 30;
      y += velocity * (dt/1000) * 30;

      if (floor && y <= 0) {
        if (py > 2) {
          splashes.push(Splash(api.dy * 3, api.dy * 100, speed));
        }

        var k = -20;
        var b = -0.1;
        var spring = k * y;
        var damper = b * velocity * 100;
        acceleration = (spring + damper);

        velocity += acceleration * (dt/1000);
        y += velocity * (dt/1000);

        canJump = true;
      }

      velocity = Math.min(velocity, 100);

      pushTrail(this.py);

      if (y > opts.jumpMax) canJump = false;
      return api;
    },

    render: function(param) {
      for (var i = 0, l = splashes.length; i < l; i++) {
        var splash = splashes[i];
        splash.render(param)
      }

      param.ctx.strokeStyle = param.color;
      param.ctx.lineWidth = Math.floor(opts.radius + api.dy * opts.stretch);
      param.ctx.beginPath();
      param.ctx.moveTo(param.x, param.y);
      param.ctx.lineTo(param.x - (api.dy * 5), param.py);
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