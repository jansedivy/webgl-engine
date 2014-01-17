var Class = require('./class');

var glMatrix = require('gl-matrix');
var vec3 = glMatrix.vec3;
var mat4 = glMatrix.mat4;

var Light = Class.extend({
  init: function(position, look, width, height, shadow) {
    this.position = position;
    this.look = look;
    this.pitch = 0.5279999999999996;
    this.yaw = 0.3419999999999995;
    this.matrix = mat4.create();
    this.width = width;
    this.height = height;
    this.shadow = shadow || false;
    if (this.shadow) {
      this._createRenderTarget();
    }
  },

  render: function() {
    mat4.identity(this.matrix);
    mat4.perspective(this.matrix, 45, this.width/this.height, 0.01, 1000.0);

    mat4.rotateX(this.matrix, this.matrix, this.pitch);
    mat4.rotateY(this.matrix, this.matrix, this.yaw);

    mat4.translate(this.matrix, this.matrix, vec3.negate([0, 0, 0], this.position));

    if (this.shadow) {
      app.renderer.renderDepth(this.matrix, this.frameBuffer);
    }
  },

  _createRenderTarget: function() {
    var gl = app.renderer.gl;

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.texture = texture;
    this.frameBuffer = frameBuffer;
  },
});

module.exports = Light;
