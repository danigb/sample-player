/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

document.body.innerHTML = '<h1>Drums (sample-player)</h1>(open the dev console)'
console.log('Loading samples...')
load(ac, 'examples/audio/mrk2.json').then(function (buffers) {
  console.log('loaded')
  var drums = player(ac, buffers).connect(ac.destination)
  drums.onevent = function (a, b, c) { console.log(a, b, c) }
  drums.schedule('x...x...x...x...'.split(''), function (e, i) {
    if (e === 'x') return { name: 'kick', time: i * 1 / 8 }
  })
  drums.schedule('..x...x...x...x.'.split(''), function (e, i) {
    if (e === 'x') return { name: 'snare', gain: 0.2, time: i * 1 / 8 }
  })
})
