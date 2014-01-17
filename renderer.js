var Class = require('./class');
var Shader = require('./shader');
var Camera = require('./camera');
var Mesh = require('./mesh');

var Light = require('./light');

var glMatrix = require('gl-matrix');
var mat4 = glMatrix.mat4;
var mat3 = glMatrix.mat3;

mat3.normalFromMat4 = function (out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
  a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
  a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
  a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

  b00 = a00 * a11 - a01 * a10,
  b01 = a00 * a12 - a02 * a10,
  b02 = a00 * a13 - a03 * a10,
  b03 = a01 * a12 - a02 * a11,
  b04 = a01 * a13 - a03 * a11,
  b05 = a02 * a13 - a03 * a12,
  b06 = a20 * a31 - a21 * a30,
  b07 = a20 * a32 - a22 * a30,
  b08 = a20 * a33 - a23 * a30,
  b09 = a21 * a32 - a22 * a31,
  b10 = a21 * a33 - a23 * a31,
  b11 = a22 * a33 - a23 * a32,

  // Calculate the determinant
  det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

  return out;
};

var Renderer = Class.extend({
  init: function(canvas) {
    this.canvas = canvas;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.gl = this.canvas.getContext('experimental-webgl');

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.shaders = {};

    this.target = this.createRenderTarget();
    this.depth = this.createRenderTarget();

    this.camera = new Camera(this.width, this.height);

    this.modelViewMatrix = mat4.create();
  },

  load: function() {
    Object.keys(app.assets.shaders).forEach(function(item) {
      this.shaders[item.split('.')[0]] = new Shader(this.gl, app.assets.shaders[item]);
    }.bind(this));

    this.lights = [new Light([-57.35168615216389, 0, 137.54709553718567], [0, 0, 0], 512, 512, true)];

    this.fullscreenModel = new Mesh();
    this.fullscreenModel.vertices = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
    this.fullscreenModel.indices = [0, 1, 2, 0, 2, 3];
    this.fullscreenModel.uv = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    this.fullscreenModel.renderer = this;
    this.fullscreenModel.createBuffers();
  },

  beginFrame: function() {
    for (var i=0, len=this.lights.length; i<len; i++) {
      this.lights[i].render();
    }

    this.useShader('basic');
    this.program.texture('uDepth', this.lights[0].texture, 0);
    this.program.mat4('uPMatrix', this.camera.matrix);
    this.program.mat4('uLightMatrix', this.lights[0].matrix);
    this.program.vec3('uCameraPosition', this.camera.position);
    this.program.vec3('uLightPosition', this.lights[0].position);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.target.frameBuffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  },

  endFrame: function() {
    this.program.disable();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    this.renderDepth(this.camera.matrix, this.depth.frameBuffer);

    this.useShader('fullscreen');
    this.program.vec3('uCameraPosition', this.camera.position);
    this.program.vec3('uLightPosition', this.lights[0].position);
    this.program.texture('uSampler', this.target.texture, 0);

    var gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fullscreenModel.uvBuffer);
    gl.vertexAttribPointer(this.program.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fullscreenModel.verticeBuffer);
    gl.vertexAttribPointer(this.program.aVertexPosition, 3, this.gl.FLOAT, false, 0, 0);
    gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.fullscreenModel.indicesBuffer);
    gl.drawElements(this.gl.TRIANGLES, this.fullscreenModel.indices.length, this.gl.UNSIGNED_SHORT, 0);

    this.program.disable();
  },

  useShader: function(shader) {
    this.program = this.shaders[shader].use();
  },

  renderModel: function(model) {
    mat4.identity(this.modelViewMatrix);
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, model.position);

    mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, model.rotation[0]);
    mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, model.rotation[1]);
    mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, model.rotation[2]);
    mat4.scale(this.modelViewMatrix, this.modelViewMatrix, model.scale);

    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, this.modelViewMatrix);

    this.program.mat4('uMVMatrix', this.modelViewMatrix);
    this.program.mat3('uNMatrix', normalMatrix);
    this.renderMesh(model.mesh);
  },

  renderMesh: function(mesh) {
    var gl = this.gl;

    if (mesh.texture !== null) {
      this.program.texture('uSampler', mesh.texture, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
      gl.vertexAttribPointer(this.program.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    }

    if (mesh.normalBuffer !== null) {
      gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.vertexAttribPointer(this.program.aVertexNormal, 3, this.gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.verticeBuffer);
    gl.vertexAttribPointer(this.program.aVertexPosition, 3, this.gl.FLOAT, false, 0, 0);

    gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indicesBuffer);
    gl.drawElements(this.gl.TRIANGLES, mesh.indices.length, this.gl.UNSIGNED_SHORT, 0);
  },

  loadImage: function(img) {
    var gl = this.gl;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  },

  generateBuffer: function(data, options) {
    options = options || {};

    var target = options.target || this.gl.ARRAY_BUFFER;
    var dataType = options.dataType || Float32Array;

    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, new dataType(data), this.gl.STATIC_DRAW);

    return buffer;
  },

  sendTexture: function(location, texture, id) {
    id = id || 0;

    var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + id);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, id);
  },

  createRenderTarget: function() {
    var gl = this.gl;

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

    return { texture: texture, frameBuffer: frameBuffer };
  },

  renderColor: function(matrix, buffer) {
    this.useShader('color');
    this.program.mat4('uPMatrix', matrix);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    app.draw();
    this.program.disable();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  },

  renderNormal: function(matrix, buffer) {
    this.useShader('normal');
    this.program.mat4('uPMatrix', matrix);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    app.draw();
    this.program.disable();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  },

  renderPosition: function(matrix, buffer) {
    this.useShader('position');
    this.program.mat4('uPMatrix', matrix);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    app.draw();
    this.program.disable();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  },

  renderDepth: function(matrix, buffer) {
    this.useShader('depth');
    this.program.mat4('uPMatrix', matrix);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    app.draw();
    this.program.disable();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
});

module.exports = Renderer;
