var M = require('./math')();

function Ball(opts) {

  var y = 200, ty = 0, py = 0, velocity = 0, acceleration = 0, mass = 0.1;
  var trail = [];
  var canJump = true;

  var api = {
    get y() { return y; },
    get py() { return py; },
    get dy() { return M.maxDist(y, py, 10); },
    get trail() { return trail[0]; },

    jump: function(acc) {
      if (canJump) velocity = acc;
    },

    update: function(dt, floor = false) {
      py = y;
      velocity -= opts.gravity * (dt/1000) * 30;
      y += velocity * (dt/1000) * 30;

      if (floor && y <= 0) {
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
  };

  function pushTrail(y) {
    for (var i = 0; i < opts.trailLength - 1; i++) trail[i] = trail[i + 1];
    trail[trail.length - 1] = y;
}

  return api;
}

module.exports = Ball;