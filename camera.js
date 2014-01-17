var Class = require('./class');

var glMatrix = require('gl-matrix');
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;

var EAngle = require('./eangle');

var Camera = Class.extend({
  init: function(width, height) {
    this.matrix = mat4.create();
    this.width = width;
    this.height = height;

    this.position = [0, 0, 0];
    this.angle = new EAngle(0, 0, 0);
  },

  update: function() {
    mat4.identity(this.matrix);
    mat4.perspective(this.matrix, 45, this.width/this.height, 0.01, 1000.0);

    mat4.rotateX(this.matrix, this.matrix, this.angle.pitch);
    mat4.rotateY(this.matrix, this.matrix, this.angle.yaw);

    mat4.translate(this.matrix, this.matrix, vec3.negate([0, 0, 0], this.position));
  }
});

module.exports = Camera;
