var Class = require('./class');

var Input = Class.extend({
  init: function(canvas) {
    this.canvas = canvas;
    this.keys = {};

    this.setupMouse();
    this.setupKeyboard();
  },

  click: function() {},
  mouseMove: function() {},
  lockMouseMove: function() {},

  getKey: function(key) {
    return this.keys[key];
  },

  setupKeyboard: function() {
    var self = this;

    document.addEventListener('keydown', function(e) {
      self.keys[e.keyCode] = true;
    });

    document.addEventListener('keyup', function(e) {
      self.keys[e.keyCode] = false;
    });
  },

  setupMouse: function() {
    var self = this;
    var down = false;
    var moved = false;

    this.canvas.addEventListener('click', function(e) {
      if (!moved) {
        self.click(e.offsetX, e.offsetY);
      }
    });

    this.canvas.addEventListener('mousedown', function() {
      down = true;
      moved = false;
      self.canvas.webkitRequestPointerLock();
    });

    this.canvas.addEventListener('mouseup', function() {
      down = false;
      document.webkitExitPointerLock();
    });

    this.canvas.addEventListener('mousemove', function(e) {
      if (down) {
        moved = true;

        var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        self.lockMouseMove(movementX, movementY);
      } else {
        self.mouseMove(e.offsetX, e.offsetY);
      }
    });
  }
});

module.exports = Input;
