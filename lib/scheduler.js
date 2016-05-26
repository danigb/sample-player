'use strict'

var identity = function (x) { return x }

module.exports = function (player) {
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
    var now = player.ac.currentTime
    var time = !when || when < now ? now : when
    var events = toEvents(source).map(fn || identity).filter(identity)
    player.emit('schedule', time, events)
    events.forEach(function (event) {
      var key = event.name || event.key || event.note || event.midi || null
      if (key) player.start(key, time + (event.time || 0), event)
    })
  }
  return player
}

function toEvents (source) {
  return Array.isArray(source) ? source
    : typeof source === 'number' ? repeat(Math.abs(source) + 1)
    : [ source ]
}
function repeat (n) { for (var a = []; n--; a[n] = n); return a }
