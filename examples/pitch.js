/* global AudioContext */
var ac = new AudioContext()
var load = require('audio-loader')(ac)
var player = require('..')(ac)

document.body.innerHTML = '<h1>Pitch example (sample-player)</h1>(open the dev console)'
console.log('Loading piano...')
var now = ac.currentTime
load('examples/note.mp3').then(function (buffer) {
  [0, 2, 4, 5, 7, 9, 11, 12].forEach(function (p, i) {
    console.log('Detune', p * 100)
    player(buffer, { pitch: 12 * 100 + p * 100 }).connect(ac.destination).start(now + i * 0.5)
  })
})
