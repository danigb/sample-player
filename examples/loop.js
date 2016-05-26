/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

document.body.innerHTML = '<h1>Loop example (sample-player)</h1>(open the dev console)'
console.log('Loading sample...')
load(ac, 'examples/audio/440Hz.mp3').then(function (buffer) {
  console.log('loaded')
  var sine = player(ac, buffer, { gain: 0.3, loop: true, adsr: [1, 0.5, 0.5, 5] })
  sine.on('event', function (a, b, c) {
    console.log(a, b, c)
  })
  sine.connect(ac.destination)
  sine.start()
  setTimeout(function () {
    console.log('stop player')
    sine.stop()
  }, 8000)
})
