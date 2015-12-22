'use strict'

var ADSR = require('adsr')

/**
 * Create an ADSR envelope with the adsr options
 * @private
 */
function adsr (ac, adsr) {
  return ['attack', 'decay', 'sustain', 'release'].reduce(function (env, n, i) {
    env[n] = adsr[i]
    return env
  }, ADSR(ac))
}

var DEFAULTS = {
  gain: 1,
  loop: false,
  pitch: 0,
  loopStart: 0,
  loopEnd: 0,
  adsr: [0.01, 0.1, 0.8, 0.3],
  filter: 'highpass',
  freq: 0
}

/**
 * Create a audio buffer player
 *
 * @name Player
 * @function
 * @param {AudioDestinationNode|AudioContext} destination - the destination
 * or the audio context. In the first case, the player will connect to that
 * destination. In the second, you will have to call `connect` explicitly
 * @param {Hash} options - play options:
 *
 * - gain: the audio gain (default: 1)
 * - loop: loop or not the audio (default: false)
 * - filter: the filter type (default: 'highpass')
 * - freq: the filter frequency (default: 0)
 *
 * @return {Player} the sample player
 */
function Player (ac, options) {
  if (!(this instanceof Player)) return new Player(ac, options)

  this.options = options || {}
  this._id = 0
  this._playing = {}
  this.onevent = function () {}

  // if its a destination, connect
  if (ac.context) {
    this.ac = ac.context
    this.output = this.ac.createGain()
    this.output.connect(ac)
  } else {
    this.ac = ac
    this.output = ac.createGain()
  }
}
var player = Player.prototype

/*
 * Start a buffer
 *
 * @param {AudioBuffer} buffer - the audio buffer to play
 * @param {Float} when - the start time
 * @param {Float} duration - (Optional) the duration in seconds. If it's
 * a number greater than 0, it will stop the buffer after that time.
 * @param {Hash} options - (Optional) options (same as in Player function)
 * @param {AudioDestinationNode} destination - (Optional) a destination that
 * overrides the default routing
 * @return {Object} an object with the following connected nodes:
 *
 * - source: a buffer source node
 * - filter: a biquad filter node
 * - env: a gain envelop adsr node
 * - amp: a gain node
 * - stop: a function to stop the sound at the given time
 */
player.start = function (buffer, when, duration, options, destination) {
  var ac = this.ac
  var event = this.onevent
  when = when || ac.currentTime

  var p = { id: this._id++ }
  var opts = from(options || {}, this.options, DEFAULTS)

  p.amp = ac.createGain()
  p.amp.gain.value = 0
  p.amp.connect(destination || this.output)
  p.env = adsr(ac, opts('adsr'))
  p.env.value.value = opts('gain')
  p.env.connect(p.amp.gain)

  p.filter = ac.createBiquadFilter()
  p.filter.type = opts('filter')
  p.filter.frequency.value = opts('freq')
  p.filter.connect(p.amp)

  p.source = ac.createBufferSource()
  p.source.buffer = buffer
  p.source.loop = opts('loop')
  p.source.connect(p.filter)
  p.source.playbackRate.value = centsToRate(opts('pitch') * 100)
  p.source.loopStart = opts('loopStart')
  p.source.loopEnd = opts('loopEnd')

  p.stop = function (when) {
    event('stop', p, when)
    var stopAt = p.env.stop(when || ac.currentTime)
    p.source.stop(stopAt)
  }

  this._playing[p.id] = p
  p.onended = function () {
    event('ended', p)
    p.source.stop()
    p.source.disconnect()
    delete this._playing[p.id]
  }
  event('start', p, when)

  p.env.start(when)
  p.source.start(when)
  if (duration > 0) p.stop(when + duration)

  return p
}

player.stop = function () {

}

player.connect = function (destination) {
  this.output.connect(destination)
}

function from (a, b, c) {
  return function (name) {
    return name in a ? a[name] : (name in b ? b[name] : c[name])
  }
}

/**
 * Get playback rate for a given pitch change (in cents)
 *
 * Basic [math](http://www.birdsoft.demon.co.uk/music/samplert.htm):
 * f2 = f1 * 2^( C / 1200 )
 * @private
 */
function centsToRate (cents) { return Math.pow(2, cents / 1200) }

if (typeof module === 'object' && module.exports) module.exports = Player
if (typeof window !== 'undefined') window.Player = Player
