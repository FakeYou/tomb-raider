'use strict';

var _ = require('underscore');
var THREE = require('three');

var Moveable = function(level, definition) {
  this.level = level;
  this.definition = definition;
  this.object = this.level.objects[this.definition.ObjectID];

  this.meshes = this._prepareMeshes();
  this.meshtrees = this._prepareMeshtrees();
};

Moveable.prototype.getModel = function() {
  var stack = [];
  var group = new THREE.Group();

  var parent = group;
  parent.depth = 0;

  _.each(this.meshes, function(mesh, i) {
    var model = this.meshes[i].clone();
    var frame = this.object.Frame.Meshes[i];

    if(i === 0) {
      model.position.x = this.object.Frame.x;
      model.position.y = this.object.Frame.y;
      model.position.z = this.object.Frame.z;
    }
    else {
      var meshtree = this.meshtrees[i - 1];

      if(meshtree.Pop) {
        parent = stack.pop();
      }
      if(meshtree.Push) {
        stack.push(parent);
      }

      model.position.x = meshtree.x;
      model.position.y = meshtree.y;
      model.position.z = meshtree.z;
    }

    model.rotation.x = frame[0] * (Math.PI / 180);
    model.rotation.y = frame[1] * (Math.PI / 180);
    model.rotation.z = frame[2] * (Math.PI / 180);
    model.rotation.order = 'YXZ';
      
    parent.add(model);
    parent = model;

  }, this);

  group.position.x = this.definition.x;
  group.position.y = this.definition.y;
  group.position.z = this.definition.z;

  group.rotation.y = this.definition.Rotation * (Math.PI / 180);

  return group;
};

Moveable.prototype._prepareMeshes = function() {
  var meshes = [];

  _.times(this.object.NumMeshes, function(i) {
    meshes.push(this.level.meshes[this.object.StartingMesh + i]);
  }, this);

  return meshes;
};

Moveable.prototype._prepareMeshtrees = function() {
  var meshtrees = [];

  _.times(this.object.NumMeshes, function(i) {
    meshtrees.push(this.level.definition.MeshTrees[this.object.MeshTree + i]);
  }, this);

  return meshtrees;
};

module.exports = Moveable;