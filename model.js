var Class = require('./class');

var Model = Class.extend({
  init: function(mesh) {
    this.mesh = mesh;
    this.position = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.scale = [1, 1, 1];
  }
});

module.exports = Model;
