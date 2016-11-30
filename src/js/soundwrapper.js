var TinyEmitter = require('tiny-emitter');

function SoundWrapper() {
  var emitter = new TinyEmitter();
  var audioPath = "assets/sounds/";
  var sounds = [
    {id: 'wow', src:'wow.ogg', data:1},
    {id: 'jump1', src:'jump_1.ogg', data:1},
    {id: 'jump2', src:'jump_2.ogg', data:1},
    {id: 'bounce1', src:'bounce_1.ogg', data:1},
    {id: 'bounce2', src:'bounce_2.ogg', data:1},
    {id: 'bounce3', src:'bounce_3.ogg', data:1},
  ];

  createjs.Sound.addEventListener('fileload', function(event) {
    emitter.emit('load', event);
  });

  for (var i = 0, l = sounds.length; i < l; i++) {
    var s = sounds[i];
    createjs.Sound.registerSound(audioPath + s.src, s.id, 1);
  }

  var api = {
    on: function(event, cb) { emitter.on(event, cb); },

    getSound: function(id) {
      for (var i = 0, l = sounds.length; i < l; i++) {
        var sound = sounds[i];
        if (sound.id === id) return sound;
      }
    },

    play: function(soundID) {
      // var sound = api.getSound(soundID);
      console.log(soundID);
      createjs.Sound.play(soundID);
    },
  };

  return api;
}

module.exports = SoundWrapper;