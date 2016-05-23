/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

document.body.innerHTML = '<h1>Detune example (sample-player)</h1>(open the dev console)'
console.log('Loading...')
load(ac, 'examples/audio/snare.wav').then(function (buffer) {
  var snare = player(ac, buffer)
  snare.events.repeat(10, function (i) {
    return { time: i * 0.5 }
  })
})
