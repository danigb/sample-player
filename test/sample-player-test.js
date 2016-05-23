/* globals describe it AudioContext */
require('web-audio-test-api')
var assert = require('assert')
var Player = require('..')
// var sinon = require('sinon')

function buffer (ac, size) { return ac.createBuffer(2, size || 22050, 44100) }

function getNodes (ac) {
  var nodes = { json: ac.toJSON() }
  nodes.out = nodes.json.inputs[0]
  nodes.amp = function (i) { return nodes.out.inputs[i] }
  nodes.source = function (i) { return nodes.amp(i).inputs[0] }
  return nodes
}

describe('sample-player', function () {
  describe('SamplePlayer', function () {
    it('creates player a player', () => {
      var ac = new AudioContext()
      var player = Player(ac, buffer(ac))
      assert(player)
      assert.deepEqual(ac.toJSON(), { name: 'AudioDestinationNode', inputs: [] })
    })
  })
  describe('connect', function () {
    it('returns the player instance', function () {
      var ac = new AudioContext()
      var player = Player(ac, buffer(ac))
      assert.equal(player.connect(ac.destination), player)
    })
    it('connects to the ac.destination', function () {
      var ac = new AudioContext()
      var player = Player(ac, buffer(ac))
      assert.equal(player.connect(ac.destination), player)
      assert.deepEqual(ac.toJSON().inputs,
        [ { name: 'GainNode', gain: { value: 1, inputs: [] }, inputs: [] } ])
    })
  })
  describe('start', function () {
    it('has no need of name if only one buffer', function () {
      var ac = new AudioContext()
      var player = Player(ac, buffer(ac, 100)).connect(ac.destination)
      player.start()
      var nodes = getNodes(ac)
      assert.equal(nodes.amp(0).name, 'GainNode')
      assert.equal(nodes.amp(0).gain.value, 0)
      assert.equal(nodes.source(0).name, 'AudioBufferSourceNode')
      assert.deepEqual(nodes.source(0).buffer.length, 100)
    })
    it('needs name if more than one buffer', function () {
      var ac = new AudioContext()
      var player = Player(ac, { one: buffer(ac, 100), two: buffer(ac, 200) }).connect(ac.destination)
      player.start('one')
      player.start('two')
      assert.equal(getNodes(ac).source(0).buffer.length, 100)
      assert.equal(getNodes(ac).source(1).buffer.length, 200)
    })
  })
  describe('stop', function () {
    it('should stop all buffers', function () {
      var ac = new AudioContext()
      var player = Player(ac, { one: buffer(ac, 100), two: buffer(ac, 200) }).connect(ac.destination)
      player.start('one')
      player.start('two')
      player.stop()
    })
  })
})
