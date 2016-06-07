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
  h('h1', 'Envelope example'),
  h('h4', 'You can pass midi numbers with decimal points'),
  h('h4', 'You will hear an octave divided by 48 parts')
])

load(ac, 'examples/audio/440Hz.mp3').then(function (buffer) {
  var p = player(ac, buffer, { attack: 10 }).connect(ac.destination)
  p.on(function (a, b, c, d) { console.log(a, b, c, d) })
  log('Playing...')
  var now = ac.currentTime
  p.start(now, { attack: 1, release: 1.5 })
  p.stop(now + 3)
  p.start(now + 5)
})
