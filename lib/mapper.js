'use strict'

var note = require('note-parser')
var toMidi = function (n) { return n >= 0 && n < 129 ? +n : note.midi(n) }

// Adds note name to midi conversion
module.exports = function (player) {
  var map = player.opts.map
  var toKey = typeof map === 'function' ? map : toMidi
  player.mapName = function (name) {
    return name ? toKey(name) || name : null
  }
  if (player.buffers) {
    var start = player.start
    player.buffers = mapBuffers(player.buffers, player.mapName)
    player.start = function (name, when, options) {
      return start(player.mapName(name), when, options)
    }
  }
  return player
}

function mapBuffers (buffers, toKey) {
  return Object.keys(buffers).reduce(function (mapped, name) {
    mapped[toKey(name)] = buffers[name]
    return mapped
  }, {})
}
