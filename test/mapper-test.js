/* globals describe it */
var assert = require('assert')
var Player = require('..')
var Audio = require('./support/audio')

describe('mapper', function () {
  it('it maps note to midi numbers by default', function () {
    var audio = Audio('C4 D4')
    var player = Player(audio.ac, audio.buffers).connect(audio.ac.destination)
    assert.equal(player.buffers[60], audio.buffers['C4'])
    assert.equal(player.buffers[62], audio.buffers['D4'])
    player.start(60)
    assert.equal(audio.played().length, 1)
    assert.equal(audio.played(0).bufferName, 'C4')
  })
  it('accepts a custom map function', function () {
    function upcase (str) { return str.toUpperCase() }
    var audio = Audio('one two')
    var player = Player(audio.ac, audio.buffers, { map: upcase })
      .connect(audio.ac.destination)
    assert.deepEqual(Object.keys(player.buffers), [ 'ONE', 'TWO' ])
    player.start('ONE')
    assert.equal(audio.played().length, 1)
    player.start('oNe')
    assert.equal(audio.played().length, 2)
  })
})
