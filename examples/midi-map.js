/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

document.body.innerHTML = '<h1>Midi mapping (sample-player)</h1>(open the dev console)'
console.log('Loading samples...')
load(ac, 'examples/audio/piano.js').then(function (buffers) {
  console.log('loaded')
  var piano = player(ac, buffers, { map: 'midi' }).connect(ac.destination)
  piano.onstart = function (a, b) { console.log('note', a, 'at', b) }
  piano.schedule(24, function (note, i) {
    return { name: note + 48, time: 0.2 * i }
  })
})
