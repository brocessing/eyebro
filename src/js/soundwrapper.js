var TinyEmitter = require('tiny-emitter');

function SoundWrapper() {
  var emitter = new TinyEmitter();
  var audioPath = "assets/sounds/";
  var sounds = [
    {id: 'wow', src:'wow.ogg', playing: false},
    {id: 'jump1', src:'jump_1.ogg', playing: false},
    {id: 'jump2', src:'jump_2.ogg', playing: false},
    {id: 'bounce1', src:'bounce_1.ogg', playing: false},
    {id: 'bounce2', src:'bounce_2.ogg', playing: false},
    {id: 'bounce3', src:'bounce_3.ogg', playing: false},
  ];

  createjs.Sound.addEventListener('fileload', function(event) {
    emitter.emit('load', event);
  });

  createjs.Sound.registerSounds(sounds, audioPath);

  var api = {
    on: function(event, cb) { emitter.on(event, cb); },

    getSound: function(id) {
      for (var i = 0, l = sounds.length; i < l; i++) {
        var sound = sounds[i];
        if (sound.id === id) return sound;
      }
    },

    play: function(soundID) {
      var sound = api.getSound(soundID);
      if (!sound.playing) {
        sound.playing = true;
        createjs.Sound.play(soundID).on('complete', function() {
          sound.playing = false;
        });
      }
    },
  };

  return api;
}

module.exports = SoundWrapper;