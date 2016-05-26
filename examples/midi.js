/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

document.body.innerHTML = '<h1>Midi (sample-player example)</h1>(open the dev console)'
console.log('Loading samples...')

load(ac, 'examples/audio/piano.js').then(function (buffers) {
  console.log('Samples loaded.')
  var piano = player(ac, buffers, { map: 'midi', adsr: [0.01, 0.1, 0.9, 1] }).connect(ac.destination)
  window.navigator.requestMIDIAccess().then(function (midiAccess) {
    console.log('Midi Access!', midiAccess)
    midiAccess.inputs.forEach(function (midiInput, channelKey) {
      console.log('Connecting to: ', midiInput)
      piano.listenToMidi(midiInput)
    }, function (msg) {
      console.log("Can't access midi: " + msg)
    })
  })
})
