/* globals describe it AudioContext */
require('web-audio-test-api')
var assert = require('assert')
var ac = new AudioContext()
var Player = require('..')

function audio (ch, secs) { return ac.createBuffer((ch || 1), (secs || 1) * ac.sampleRate, ac.sampleRate) }

describe('sample-player/stop', () => {
  var player = Player(ac.destination)

  it('stop one sample', function () {
    var s = player.start(audio())
    assert.equal(player.stop(null, s.id), s.id)
  })

  it('stops all samples', function () {
    var player = Player(ac)
    player.start(audio())
    player.start(audio())
    assert.deepEqual(player.stop(), [1, 2])
  })
})
