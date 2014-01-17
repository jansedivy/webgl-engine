var Class = require('./class');

var Mesh = Class.extend({
  init: function() {
    this.vertices = [];
    this.indices = [];
    this.uv = [];
    this.normals = [];
    this.texture = null;
    this.renderer = app.renderer;
  },

  createBuffers: function() {
    this.verticeBuffer = this.renderer.generateBuffer(this.vertices);
    this.normalBuffer = this.renderer.generateBuffer(this.normals);

    this.indicesBuffer = this.renderer.generateBuffer(this.indices, {
      target: this.renderer.gl.ELEMENT_ARRAY_BUFFER,
      dataType: Uint16Array
    });

    if (this.uv.length) {
      this.uvBuffer = this.renderer.generateBuffer(this.uv);
    }
  }
});

module.exports = Mesh;
