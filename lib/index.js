/* global AudioBuffer */
'use strict'

var note = require('note-parser')
var ADSR = require('adsr')

var identity = function (x) { return x }
var EMPTY = {}
var DEFAULTS = {
  gain: 1,
  adsr: [0.01, 0.1, 0.9, 0.05],
  loop: false,
  cents: 0,
  loopStart: 0,
  loopEnd: 0
}

function SamplePlayer (ac, source, options) {
  var connected = false
  var nextId = 0
  var tracked = {}
  var out = ac.createGain()
  out.gain.value = 1

  var opts = Object.assign({}, DEFAULTS, options)
  var toKey = opts.toKey === 'midi' ? note.midi
    : typeof opts.toKey === 'function' ? opts.toKey
    : identity

  var player = { out: out, opts: opts }
  if (source instanceof AudioBuffer) player.buffer = source
  else player.buffers = createBuffers(source, toKey)

  player.start = function (name, when, options) {
    if (player.buffer && name !== null) return player.play(null, name, when)
    var key = name ? toKey(name) : null
    var buffer = key ? player.buffers[key] : player.buffer
    if (!buffer) {
      console.warn('Buffer ' + key + ' not found.')
      return
    } else if (!connected) {
      console.warn('SamplePlayer not connected to any node.')
      return
    }

    when = when || ac.currentTime
    var node = createNode(buffer, options || EMPTY)
    node.key = key
    node.id = track(node)
    node.env.start(when)
    node.source.start(when)
    event('start', node, when)
    return node
  }
  player.play = player.start
  player.stop = function (when, ids) {
    var node
    ids = ids || Object.keys(tracked)
    return ids.map(function (id) {
      node = tracked[id]
      if (!node) return null
      node.stop(when)
    })
  }
  player.connect = function (dest) {
    connected = true
    out.connect(dest)
    return player
  }
  player.schedule = scheduler(ac, player)
  return player

  function track (node) {
    node.id = nextId++
    tracked[node.id] = node
    node.source.onended = function () {
      var now = ac.currentTime
      node.source.disconnect()
      node.env.disconnect()
      node.disconnect()
      event('ended', node, now)
    }
    return node.id
  }

  function event (name, node, when) {
    if (player.onevent) player.onevent(name, node.key, when, node)
    var fn = player['on' + name]
    if (!fn) return
    else if (node.key) fn(node.key, when, node)
    else fn(when, node)
  }

  function createNode (buffer, options) {
    var node = ac.createGain()
    node.gain.value = 0 // the envelope will control the gain
    node.connect(out)

    node.env = envelope(ac, options.adsr || opts.adsr)
    node.env.value.value = options.gain || opts.gain
    node.env.connect(node.gain)

    node.source = ac.createBufferSource()
    node.source.buffer = buffer
    node.source.connect(node)
    node.source.loop = options.loop || opts.loop
    node.source.playbackRate.value = centsToRate(options.cents || opts.cents)
    node.source.loopStart = options.loopStart || opts.loopStart
    node.source.loopEnd = options.loopEnd || opts.loopEnd
    node.stop = function (when) {
      var time = when || ac.currentTime
      var stopAt = node.env.stop(time)
      event('stop', node, time)
      node.source.stop(stopAt)
    }
    return node
  }
}

function createBuffers (source, toKey) {
  return Object.keys(source).reduce(function (buffers, name) {
    buffers[toKey(name)] = source[name]
    return buffers
  }, {})
}

// create an adsr envelop from array of [a, d, s, r]
function envelope (ac, adsr) {
  var env = ADSR(ac)
  env.attack = adsr[0]; env.decay = adsr[1]
  env.sustain = adsr[2]; env.release = adsr[3]
  return env
}

/*
 * Get playback rate for a given pitch change (in cents)
 * Basic [math](http://www.birdsoft.demon.co.uk/music/samplert.htm):
 * f2 = f1 * 2^( C / 1200 )
 */
function centsToRate (cents) { return cents ? Math.pow(2, cents / 1200) : 1 }

function scheduler (ac, player) {
  return function schedule (source, fn) {
    var events = toEvents(source).map(fn || identity).filter(identity)
    var now = ac.currentTime
    events.forEach(function (event) {
      player.play(event.name || null, now + event.time, event)
    })
  }
}
function toEvents (source) {
  return Array.isArray(source) ? source
    : typeof source === 'number' ? repeat(Math.abs(source))
    : [ source ]
}
function repeat (n) { for (var a = []; n--; a[n] = n); return a }

module.exports = SamplePlayer
