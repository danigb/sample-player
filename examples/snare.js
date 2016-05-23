/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

console.log('Loading...')
load(ac, 'examples/audio/snare.wav').then(function (buffer) {
  console.log('Loaded', buffer)
  var snare = player(ac, buffer).connect(ac.destination)
  console.log('snare', snare)
  snare.play()
})
