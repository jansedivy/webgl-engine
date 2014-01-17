var Class = require('./class');

var ShaderProgram = Class.extend({
  init: function(gl, shader) {
    this.gl = gl;
    this.program = gl.createProgram();

    this.attributes = [];
    this.uniforms = [];

    this.compileShader(shader);

    this.link();

    for (var i=0, len=gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES); i<len; i++) {
      this.attributes.push(gl.getActiveAttrib(this.program, i).name);
    }

    for (i=0, len=gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS); i<len; i++) {
      this.uniforms.push(gl.getActiveUniform(this.program, i).name);
    }

    for (i=0; i<this.attributes.length; i++) {
      var aName = this.attributes[i];
      this[aName] = this.getLocationA(aName);
    }

    for (i=0; i<this.uniforms.length; i++) {
      var uName = this.uniforms[i];
      this[uName] = this.getLocationU(uName);
    }
  },

  attach: function(shader) {
    this.gl.attachShader(this.program, shader);
  },

  enable: function() {
    for (var i=0; i<this.attributes.length; i++) {
      this.gl.enableVertexAttribArray(this[this.attributes[i]]);
    }
  },

  disable: function() {
    for (var i=0; i<this.attributes.length; i++) {
      this.gl.disableVertexAttribArray(this[this.attributes[i]]);
    }
  },

  link: function() {
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error('Could not initialise shaders');
    }
  },

  use: function() {
    this.enable();
    this.gl.useProgram(this.program);
    return this;
  },

  getLocationU: function(name) {
    return this.gl.getUniformLocation(this.program, name);
  },

  getLocationA: function(name) {
    return this.gl.getAttribLocation(this.program, name);
  },

  compileShader: function(shader) {
    var splitted = shader.split(/^\w+:/m).filter(function(item) { return item; });
    var vertexShader = splitted[0];
    var fragmentShader = splitted[1];

    var gl = this.gl;

    var vs = gl.createShader(gl.VERTEX_SHADER);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(vs)); }
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(fs)); }

    this.attach(vs);
    this.attach(fs);
  },

  mat4: function(name, value) {
    this.gl.uniformMatrix4fv(this[name], false, value);
  },

  mat3: function(name, value) {
    this.gl.uniformMatrix3fv(this[name], false, value);
  },

  vec3: function(name, value) {
    this.gl.uniform3fv(this[name], value);
  },

  vec2: function(name, value) {
    this.gl.uniform2fv(this[name], value);
  },

  integer: function(name, value) {
    this.gl.uniform1i(this[name], value);
  },

  texture: function(name, texture, id) {
    app.renderer.sendTexture(this[name], texture, id);
  }
});

module.exports = ShaderProgram;
