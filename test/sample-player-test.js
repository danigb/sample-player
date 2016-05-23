/* globals describe it AudioContext */
require('web-audio-test-api')
var assert = require('assert')
var Player = require('..')
// var sinon = require('sinon')

function buffer (ac) { return ac.createBuffer(2, 22050, 44100) }

describe('sample-player', function () {
  describe('SamplePlayer', function () {
    it('creates player a player', () => {
      var ac = new AudioContext()
      var player = Player(ac, buffer(ac))
      assert(player)
    })
  })
})
