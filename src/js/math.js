function M() {
  var api = {
    fastDist: function(a, b) { return (b - a) * (b - a); },
    maxDist: function(a, b, max) { return api.map(api.constrain(api.fastDist(a, b), 0, max * max), 0, max * max, 0, max); },
    constrain: function(a, min, max) { return Math.max(min, Math.min(a, max)); },
    map: function(a, in_min, in_max, out_min, out_max) { return (a - in_min) * (out_max - out_min) / (in_max - in_min) + out_min; },
    lerp: function(a, b, t) { return a + t * (b - a); },
    norm: function(a, min, max) { return api.map(a, min, max, 0, 1); },
  };

  return api;
}

module.exports = M;