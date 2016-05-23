/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

document.body.innerHTML = '<h1>Detune example (sample-player)</h1>(open the dev console)'
console.log('Loading snare')
load(ac, 'examples/audio/snare.wav').then(function (buffer) {
  var snare = player(ac, buffer).connect(ac.destination)
  console.log('loaded')
  snare.schedule(24, function (i) {
    return { time: i * 0.3, cents: 400 * i - 2400 }
  })
})
