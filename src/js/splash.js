var MathUtils = require('./math')();

function Splash(n, amt, speed = 0) {

  var particles = (function() {
    var pp = [];
    for (var i = 0; i < n; i++) {
      var p = {
        x: 0,
        y: 0,
        tx: (Math.random() * (amt * 1.5)) - amt - speed,
        ty: - Math.random() * amt * 2,
        weight: 1 + Math.random() * 2,
        px: 0,
        py: 0,
      };

      pp.push(p);
    }
    return pp;
  })();

  var y;
  var dieDistThreshold = 20;

  var api = {
    recycle: false,

    update: function(dt, speed) {
      var deadCounter = 0;
      for (var i = 0, l = particles.length; i < l; i++) {
        var p = particles[i];
        if (p) {
          p.px = p.x;
          p.py = p.y;

          p.ty += 9.87 * p.weight * (dt/1000) * 40;

          p.x += (p.tx - p.x) * 0.09 * (dt/1000) * 40;
          p.y += (p.ty - p.y) * 0.09 * (dt/1000) * 40;

          if (Math.abs(p.x - p.px) < 1) particles[i] = null;
        } else deadCounter++;
      }

      if (deadCounter >= particles.length) api.recycle = true;
    },

    render: function(param) {
      y = y || param.floorY;
      param.ctx.beginPath();
      for (var i = 0, l = particles.length; i < l; i++) {
        var p = particles[i];
        if (p && p.y < y) {
          param.ctx.moveTo(param.x + p.x, y + p.y);
          param.ctx.lineTo(param.x + p.px, y + p.py);
        }
      }
      param.ctx.stroke();
    },
  };

  return api;
}

module.exports = Splash;