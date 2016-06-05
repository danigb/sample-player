/* global AudioContext */
var load = require('audio-loader')
var player = require('..')
var ac = new AudioContext()

function h (tag, text) {
  if (!tag.innerHTML) return '<' + tag + '>' + text + '</' + tag + '>'
  tag.innerHTML = text.join('')
  return function (text) { tag.innerHTML = tag.innerHTML + h('pre', text) }
}

var log = h(document.body, [
  h('h1', 'Microtone example'),
  h('h4', 'You can pass midi numbers with decimal points'),
  h('h4', 'You will hear an octave divided by 48 parts')
])

var steps = 48
var step = 12 / steps
var notes = []
for (var i = 0; i <= steps; i++) {
  notes.push(i * step + 48)
}
log('Midi notes: ' + notes.join(','))
log('Loading samples...')
load(ac, 'examples/audio/piano.js').then(function (buffers) {
  log('Samples loaded.')
  var piano = player(ac, buffers).connect(ac.destination)
  piano.on('event', function (a, b, c, d) { console.log(a, b, c, d) })
  piano.on('start', function (time, note) {
    log('note ' + note + ' started at ' + time)
  })
  piano.schedule(0, notes.map(function (note, i) {
    return [ i * 0.2, note ]
  }))
})
