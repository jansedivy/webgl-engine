var Class = require('./class');
var extend = require('node.extend');
var request = require('superagent');

var Assets = Class.extend({
  init: function(renderer, callback) {
    this.renderer = renderer;
    this.callback = callback;

    this.textures = {};
    this.shaders = {};
    this.models = {};

    this.files = {
      textures: [],
      shaders: [],
      models: []
    };
  },

  add: function(files) {
    files = extend({ textures: [], shaders: [], models: [] }, files);

    var self = this;
    files.shaders.forEach(function(item) {
      self.files.shaders.push(item);
    });

    files.textures.forEach(function(item) {
      self.files.textures.push(item);
    });

    files.models.forEach(function(item) {
      self.files.models.push(item);
    });
  },

  load: function(files) {
    this.add(files);
    this.startLoading();
  },

  startLoading: function() {
    var self = this;

    var texturesLength = this.files.textures.length;
    var shadersToLoad = this.files.shaders.length;
    var modelsToLoad = this.files.models.length;

    var load = texturesLength + shadersToLoad + modelsToLoad;

    this.files.textures.forEach(function(item) {
      var img = new Image();

      img.onload = function() {
        self.textures[item] = self.renderer.loadImage(img);
        load--;
        if (load === 0) { self.callback(); }
      };

      img.src = 'assets/textures/' + item;
    });

    this.files.shaders.forEach(function(item) {
      request.get('assets/shaders/' + item, function(data) {
        self.shaders[item] = data.text;

        load--;
        if (load === 0) { self.callback(); }
      });
    });

    this.files.models.forEach(function(item) {
      request.get('assets/models/' + item, function(data) {
        self.models[item] = JSON.parse(data.text);
        load--;
        if (load === 0) { self.callback(); }
      });
    });

    if (load === 0) { setTimeout(function() {self.callback(); }, 0); }
  }
});

module.exports = Assets;
