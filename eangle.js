var vec3 = require('gl-matrix').vec3;
var Class = require('./class');

var EAngle = Class.extend({
  init: function(pitch, yaw, roll) {
    this.pitch = pitch;
    this.yaw = yaw;
    this.roll = roll;
  },

  toVector: function() {
    var result = vec3.create();

    result[0] = Math.cos(this.yaw)*Math.cos(this.pitch);
    result[1] = Math.sin(this.pitch);
    result[2] = Math.sin(this.yaw)*Math.cos(this.pitch);

    return result;
  },

  normalize: function() {
    if (this.pitch > 89 / 180*Math.PI) {
      this.pitch = 89 / 180*Math.PI;
    }

    if (this.pitch < -89 / 180*Math.PI) {
      this.pitch = -89 / 180*Math.PI;
    }

    while (this.yaw < -Math.PI -0.01) {
      this.yaw += Math.PI*2;
    }
    while (this.y > Math.PI) {
      this.yaw -= Math.PI*2;
    }
  }
});

module.exports = EAngle;
