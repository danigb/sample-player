/* globals describe it */
var assert = require('assert')
var Player = require('..')
var Audio = require('./support/audio')

describe('sample-player', function () {
  describe('mapper', function () {
    it('convert to midi numbers', function () {
      var audio = Audio('C4 D4')
      var player = Player(audio.ac, audio.buffers, { map: 'midi' })
        .connect(audio.ac.destination)
      assert.equal(player.buffers[60], audio.buffers['C4'])
      assert.equal(player.buffers[62], audio.buffers['D4'])
      player.start(60)
      assert.equal(audio.played().length, 1)
      assert.equal(audio.played(0).bufferName, 'C4')
    })
  })
})
