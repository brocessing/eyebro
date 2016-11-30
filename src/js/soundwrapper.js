var TinyEmitter = require('tiny-emitter');

function SoundWrapper() {
  var emitter = new TinyEmitter();
  var audioPath = "assets/sounds/";
  var sounds = [
    {id: 'wow', src:'wow.ogg'},
    {id: 'jump1', src:'jump_1.ogg'},
    {id: 'jump2', src:'jump_2.ogg'},
    {id: 'bounce1', src:'bounce_1.ogg'},
    {id: 'bounce2', src:'bounce_2.ogg'},
    {id: 'bounce3', src:'bounce_3.ogg'},
    {id: 'loop', src:'loop.ogg'},
  ];

  createjs.Sound.addEventListener('fileload', function(event) {
    emitter.emit('load', event);
  });

  for (var i = 0, l = sounds.length; i < l; i++) {
    var s = sounds[i];
    createjs.Sound.registerSound(audioPath + s.src, s.id, 1);
  }

  var loop, fadeOut;

  var api = {
    on: function(event, cb) { emitter.on(event, cb); },

    play: function(soundID) {
      createjs.Sound.play(soundID);
    },

    startLoop: function() {
      loop = createjs.Sound.play('loop', {loop: -1});
    },

    stopLoop: function() {
      fadeOut = setInterval(function() {
        loop.volume = loop.volume * 0.75;
        if (loop.volume <= 0.01) {
          clearInterval(fadeOut);
          loop.volume = 0;
        }
      }, 100);
    },
  };

  return api;
}

module.exports = SoundWrapper;