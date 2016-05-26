
module.exports = function (player) {
  /**
   * Emit an event to the player event listeners
   * @param {String} event - the event name
   * @param {Float} when - the absolute time (in AudioContext reference)
   * @param {Object} object - the optional object
   */
  player.emit = function (event, when, obj) {
    if (player.onevent) player.onevent(event, when, obj)
    var fn = player['on' + event]
    if (fn) fn(when, obj)
  }
  player.on = function (event, cb) {
    var prop = 'on' + event
    var old = player[prop]
    player[prop] = old ? chain(old, cb) : cb
    return player
  }
  return player
}

function chain (fn1, fn2) {
  return function (a, b, c, d) { fn1(a, b, c, d); fn2(a, b, c, d) }
}
