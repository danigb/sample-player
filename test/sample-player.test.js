/* globals describe it AudioContext */
require('web-audio-test-api')
var assert = require('assert')
var ac = new AudioContext()
var Player = require('..')
var sinon = require('sinon')

function audio (ch, secs) { return ac.createBuffer((ch || 1), (secs || 1) * ac.sampleRate, ac.sampleRate) }

describe('sample-player', () => {
  it('creates player from destination', () => {
    var player = Player(ac.destination)
    assert.equal(player.ac, ac)
  })

  it('have options', function () {
    var player = Player(ac)
    assert.deepEqual(player.options, {})
  })

  it('plays', function () {
    var player = Player(ac)
    var sample = player.start(audio())
    assert.equal(typeof sample.stop, 'function')
  })

  describe('events', function () {
    it('fires start event', function () {
      var player = Player(ac.destination)
      var events = player.on = sinon.spy()
      player.start(audio())
      assert.equal(events.callCount, 1)
      assert.equal(events.getCall(0).args[0], 'start')
      assert.equal(events.getCall(0).args[1].id, 1)
    })
  })
})
