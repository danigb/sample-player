/* globals describe it */
var assert = require('assert')
var Player = require('..')
var Audio = require('./support/audio')

describe('scheduler', function () {
  it('schedule events', function () {
    var audio = Audio('C4 D4')
    var player = Player(audio.ac, audio.buffers).connect(audio.ac.destination)
    var events = [
      { name: 'C4', time: 0.1, gain: 0.1 },
      { name: 62, time: 0.2, gain: 0.2 }
    ]
    player.schedule(events, null, 1)
    assert.equal(audio.played().length, 2)
    assert.equal(audio.played(0).bufferName, 'C4')
    assert.equal(audio.played(1).bufferName, 'D4')
  })
  it('accepts name, key, note and midi as event name', function () {
    var audio = new Audio('a')
    var player = Player(audio.ac, audio.buffers).connect(audio.ac.destination)
    var events = [
      { name: 'a' }, { key: 'a' }, { note: 'a' }, { midi: 'a' }, { pitch: 'a' }
    ]
    player.schedule(events, null, 1)
    assert.equal(audio.played().length, 4)
  })
})
