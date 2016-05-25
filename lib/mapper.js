'use strict'

var note = require('note-parser')
var toMidi = function (n) { return n >= 0 && n < 129 ? +n : note.midi(n) }

/**
 * Add buffer alterative map support
 */
module.exports = function (player) {
  var map = player.opts.map
  var toKey = map === 'midi' ? toMidi
    : typeof map === 'function' ? map
    : null
  if (toKey && player.buffers) {
    var start = player.start
    player.buffers = mapBuffers(player.buffers, toKey)
    player.start = function (name, when, options) {
      var key = name ? toKey(name) || name : name
      return start(key, when, options)
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
