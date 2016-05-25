/* global AudioBuffer */
'use strict'

var note = require('note-parser')
var ADSR = require('adsr')
var midimessage = require('midimessage')

var identity = function (x) { return x }
var toMidi = function (n) { return n >= 0 && n < 129 ? +n : note.midi(n) || n }
var EMPTY = {}
var DEFAULTS = {
  gain: 1,
  adsr: [0.01, 0.1, 0.9, 0.05],
  loop: false,
  cents: 0,
  loopStart: 0,
  loopEnd: 0
}

/**
 * Create a sample player.
 *
 * @param {AudioContext} ac - the audio context
 * @param {ArrayBuffer|Object<String,ArrayBuffer>} source
 * @param {Onject} options - (Optional) an options object
 * @return {player} the player
 * @example
 * var SamplePlayer = require('sample-player')
 * var ac = new AudioContext()
 * var snare = SamplePlayer(ac, <AudioBuffer>)
 * snare.play()
 */
function SamplePlayer (ac, source, options) {
  var connected = false
  var nextId = 0
  var tracked = {}
  var out = ac.createGain()
  out.gain.value = 1

  var opts = Object.assign({}, DEFAULTS, options)
  var toKey = opts.map === 'midi' ? toMidi
    : typeof opts.map === 'function' ? opts.map
    : identity

  /**
   * The created player
   * @namespace
   */
  var player = { out: out, opts: opts }
  if (source instanceof AudioBuffer) player.buffer = source
  else player.buffers = createBuffers(source, toKey)

  /**
   * Start a sample buffer.
   *
   * The returned object has a function `stop(when)` to stop the sound.
   *
   * @method
   * @param {String} name - the name of the buffer. If the source of the
   * SamplePlayer is one sample buffer, this parameter is not required
   * @param {Float} when - (Optional) when to start (current time if by default)
   * @param {Object} options - additional sample playing options
   * @return {AudioNode} an audio node with a `stop` function
   * @example
   * var sample = player(ac, <AudioBuffer>).connect(ac.destination)
   * sample.start()
   * sample.start(5, { gain: 0.7 }) // name not required since is only one AudioBuffer
   * @example
   * var drums = player(ac, { snare: <AudioBuffer>, kick: <AudioBuffer>, ... }).connect(ac.destination)
   * drums.start('snare')
   * drums.start('snare', 0, { gain: 0.3 })
   */
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
    fire('start', when, node)
    return node
  }
  /**
   * An alias for `player.start`
   * @see player.start
   * @since 0.3.0
   */
  player.play = player.start
  /**
   * Stop some or all samples
   *
   * @param {Float} when - (Optional) an absolute time in seconds (or currentTime
   * if not specified)
   * @param {Array} nodes - (Optional) an array of nodes or nodes ids to stop
   * @return {Array} an array of ids of the stoped samples
   *
   * @example
   * var longSound = player(ac, <AudioBuffer>).connect(ac.destination)
   * longSound.start(ac.currentTime)
   * longSound.start(ac.currentTime + 1)
   * longSound.start(ac.currentTime + 2)
   * longSound.stop(ac.currentTime + 3) // stop the three sounds
   */
  player.stop = function (when, ids) {
    var node
    ids = ids || Object.keys(tracked)
    return ids.map(function (id) {
      node = tracked[id]
      if (!node) return null
      node.stop(when)
      return node.id
    })
  }
  /**
   * Connect the player to a destination node
   *
   * @param {AudioNode} destination - the destination node
   * @return {AudioPlayer} the player
   * @chainable
   * @example
   * var sample = player(ac, <AudioBuffer>).connect(ac.destination)
   */
  player.connect = function (dest) {
    connected = true
    out.connect(dest)
    return player
  }
  /**
   * Schedule events to be played
   *
   * @param {Object} source - the events source
   * @param {Function} map - (Optional) a function to map the events source into
   * events object.
   * @param {Float} when - (Optional) an absolute time to start (or currentTime
   * if not present)
   * @return {Array} an array of ids
   * @example
   * var drums = player(ac, ...).connect(ac.destination)
   * drums.schedule([
   *   { name: 'kick', time: 0 },
   *   { name: 'snare', time: 0.5 },
   *   { name: 'kick', time: 1 },
   *   { name: 'snare', time: 1.5 }
   * ])
   */
  player.schedule = function (source, fn, when) {
    var events = toEvents(source).map(fn || identity).filter(identity)
    var time = !when || when < ac.currentTime ? ac.currentTime : when
    fire('schedule', time, events)
    events.forEach(function (event) {
      player.play(event.name || null, time + event.time, event)
    })
  }

  player.midiStartedNotes = {}
  /**
   * Process raw Web MIDI messages or already-parsed [midimessages](https://www.npmjs.com/package/midimessage) to start or stop sounds
   *
   * @param {MIDIMessageEvent | M} message - a raw [MIDI event](https://www.w3.org/TR/webmidi/#midimessageevent-interface) from the Web MIDI API or parsed as a MidiMessage from the midimessage module
   * @return {Object} all the midi notes as handled by the player
   * @example
   * window.navigator.requestMIDIAccess().then(function onMIDISuccess (midi) {
   * midi.inputs.forEach(function (port, channelKey) {
   *   port.onmidimessage = player[channelKey].processMidiMessage
   * }), function manageFailure () {...})
   */
  player.proccessMidiMessage = function processMidiMessage (message) {
    if (message.messageType == null) {
      message = midimessage(message)
    }

    if (message.messageType === 'noteon' && message.velocity === 0) {
      message.messageType = 'noteoff'
    }

    switch (message.messageType) {
      case 'noteon':
        player.midiStartedNotes[message.key] = player.play(message.key, 0)
        break
      case 'noteoff':
        if (player.midiStartedNotes[message.key]) {
          player.midiStartedNotes[message.key].stop()
        }
        break
      default:
    }
    return player.midiStartedNotes
  }

  return player

  // =============== PRIVATE FUNCTIONS ============== //

  function track (node) {
    node.id = nextId++
    tracked[node.id] = node
    node.source.onended = function () {
      var now = ac.currentTime
      node.source.disconnect()
      node.env.disconnect()
      node.disconnect()
      fire('ended', now, node)
    }
    return node.id
  }

  function fire (event, when, obj) {
    if (player.onevent) player.onevent(event, when, obj)
    var fn = player['on' + event]
    if (!fn) return
    else if (obj.key) fn(when, obj.key, obj)
    else fn(when, obj)
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
      fire('stop', time, node)
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

function toEvents (source) {
  return Array.isArray(source) ? source
    : typeof source === 'number' ? repeat(Math.abs(source) + 1)
    : [ source ]
}
function repeat (n) { for (var a = []; n--; a[n] = n); return a }

if (typeof module === 'object' && module.exports) module.exports = SamplePlayer
if (typeof window !== 'undefined') window.SamplePlayer = SamplePlayer
