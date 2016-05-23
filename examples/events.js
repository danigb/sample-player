/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()
var NOTES = 'C4 D4 E4 F4 G4 A4 B4 C5'.split(' ')

document.body.innerHTML = '<h1>Events (sample-player)</h1>(open the dev console)'
console.log('Loading sample...')
load(ac, 'examples/audio/piano.js').then(function (buffers) {
  console.log('loaded')
  var piano = player(ac, buffers, { map: 'midi' }).connect(ac.destination)
  piano.onstart = function (a, b, c) { console.log(a, b, c) }
  var notes = NOTES.concat(NOTES.slice(0, -1).reverse())
  console.log('schedule', notes)
  piano.schedule(notes, function (note, i) {
    return { name: note, time: 0.2 * i }
  })
})
