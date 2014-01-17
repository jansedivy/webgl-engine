var Class = require('./class');
var Renderer = require('./renderer');
var Assets = require('./assets');
var Input = require('./input');
var Mesh = require('./mesh');

var Model = require('./model');

var vec3 = require('gl-matrix').vec3;

var Game = Class.extend({
  init: function() {
    this.canvas = document.querySelector('canvas');

    this.canvas.width = this.width = 512;
    this.canvas.height = this.height = 512;

    this.renderer = new Renderer(this.canvas);
    this.assets = new Assets(this.renderer, function() {
      this.load();
    }.bind(this));

    this.assets.load({
      shaders: ['basic.shader', 'fullscreen.shader', 'normal.shader', 'color.shader', 'depth.shader', 'position.shader', 'ssao.shader'],
      textures: [],
      models: ['teapot.json', 'cube.json']
    });

    this.models = [];

    this.totalTime = 0;
  },

  lockMouseMove: function(x, y) {
    var sens = 0.006;
    this.camera.angle.yaw += x * sens;
    this.camera.angle.pitch += y * sens;
    this.camera.angle.normalize();
  },

  load: function() {
    this.renderer.load();
    this.camera = this.renderer.camera;

    var cubeData = this.assets.models['cube.json'];
    var cube = new Mesh();
    cube.vertices = cubeData.vertexPositions;
    cube.indices = cubeData.indices;
    cube.normals = cubeData.vertexNormals;
    cube.createBuffers();

    var cubeModel = new Model(cube);
    cubeModel.scale = [1000, 1, 1000];
    cubeModel.position = [0, -60, 0];
    this.models.push(cubeModel);

    var potData = this.assets.models['teapot.json'];
    var pot = new Mesh();
    pot.vertices = potData.vertexPositions;
    pot.indices = potData.indices;
    pot.normals = potData.vertexNormals;
    pot.createBuffers();

    var model;
    model = new Model(pot);
    model.position[0] = 0;
    model.position[1] = -60;
    model.position[2] = 0;
    this.models.push(model);
    model = new Model(pot);
    model.position[0] = -22;
    model.position[1] = -49;
    model.position[2] = -86;
    this.models.push(model);
    model = new Model(pot);
    model.position[0] = 28;
    model.position[1] = -34;
    model.position[2] = -138;
    this.models.push(model);
    model = new Model(pot);
    model.position[0] = 27;
    model.position[1] = -38;
    model.position[2] = -76;
    this.models.push(model);
    model = new Model(pot);
    model.position[0] = -43;
    model.position[1] = -30;
    model.position[2] = -66;
    this.models.push(model);
    model = new Model(pot);
    model.position[0] = -69;
    model.position[1] = -36;
    model.position[2] = -29;
    this.models.push(model);
    model = new Model(pot);
    model.position[0] = -0;
    model.position[1] = -40;
    model.position[2] = -12;
    this.models.push(model);

    this.input = new Input(this.canvas);
    this.input.lockMouseMove = this.lockMouseMove.bind(this);

    this.startFrame();
  },

  draw: function() {
    for (var i=0; i<this.models.length; i++) {
      this.renderer.renderModel(this.models[i]);
    }
  },

  startFrame: function() {
    var self = this;
    window.requestAnimationFrame(function() {
      self.tick();
    });
  },

  tick: function() {
    this.totalTime += 1;//time
    this.update();
    this.render();
    this.startFrame();
  },

  update: function() {
    this.camera.update();

    var dir = this.camera.angle.toVector();
    dir[1] = 0;
    vec3.normalize(dir, dir);
    var up = [0, 1, 0];
    var right = vec3.create();

    vec3.cross(right, up, dir);

    this.renderer.showDepth = false;
    if (this.input.getKey(81)) { // q
      this.renderer.showDepth = true;
    }

    if (this.input.getKey(87)) { // forward
      vec3.add(this.camera.position, this.camera.position, right);
    }

    if (this.input.getKey(65)) { // left
      this.camera.position[0] -= 1;
    }

    if (this.input.getKey(69)) { // right
      this.camera.position[0] += 1;
    }

    if (this.input.getKey(83)) { // back
      vec3.sub(this.camera.position, this.camera.position, right);
    }
    for (var i=0; i<this.models.length; i++) {
      //var model = this.models[i];
      // model.rotation[0] += 0.01;
      // model.rotation[1] += 0.01;
      // model.rotation[2] += 0.01;
    }
  },

  render: function() {
    this.renderer.beginFrame();
    this.draw();
    this.renderer.endFrame();
  }
});

window.app = new Game();
