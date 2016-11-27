var TinyEmitter = require('tiny-emitter');

function Screen(selector, _visible = false) {
  var elem = window.document.querySelectorAll(selector)[0];
  var emitter = new TinyEmitter();

  var api = {
    visible : false,

    on: function(event, cb) {
      emitter.on(event, cb);
    },

    show: function(cb) {
      if (!api.visible) {
        if (elem && elem.classList && !elem.classList.contains('show')) {
          emitter.emit('show');
          elem.classList.add('show');
          api.visible = true;

          if (cb) cb();
        }
      }
    },

    hide: function(cb) {
      if (api.visible) {
        if (elem && elem.classList && elem.classList.contains('show')) {
          elem.classList.remove('show');
          emitter.emit('hide');
          api.visible = false;

          if (cb) cb();
        }
      }
    },

    querySelectorAll: function(selector) {
      return elem.querySelectorAll(selector);
    },
  };

  if (_visible) api.show();

  return api;
}

module.exports = Screen;