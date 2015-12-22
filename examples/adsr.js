/* global AudioContext */
var ac = new AudioContext()
var load = require('audio-loader')(ac)
var Player = require('..')

document.body.innerHTML = '<h1>ADSR example (sample-player)</h1>(open the dev console)'
console.log('loading sample...')
load('examples/audio/dropsine.wav').then(function (buffer) {
  console.log('loaded', buffer, now)
  var player = Player(ac.destination, { loop: true, adsr: [0.02, 0.02, 0.6, 0.5] })
  player.onevent = function (event, note) {
    console.log(event, note)
  }
  var now = ac.currentTime
  player.start(buffer, now, 0.5, { gain: 0.4, freq: 2000 })
  player.start(buffer, now + 0.5, 0.5, { gain: 0.4, freq: 1000 })
  player.start(buffer, now + 1, 0.5, { gain: 0.4, pitch: -12 })
})
