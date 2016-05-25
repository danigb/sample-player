var midimessage = require('midimessage')

/**
 * Connect a player to a midi input
 *
 * The options accepts:
 *
 * - channel: the channel to listen to. Listen to all channels by default.
 *
 * @param {MIDIInput} input
 * @param {SamplePlayer} player
 * @param {Object} options - (Optional)
 * @return {SamplePlayer} the player
 */
function connect (input, player, options) {
  var midiStartedNotes = {}
  var opts = options || {}
  var gain = opts.gain || function (vel) { return vel / 127 }

  input.onmidimessage = function (msg) {
    var mm = msg.messageType ? msg : midimessage(msg)
    if (mm.messageType === 'noteon' && mm.velocity === 0) {
      mm.messageType = 'noteoff'
    }
    if (opts.channel && mm.channel !== opts.channel) return

    switch (mm.messageType) {
      case 'noteon':
        midiStartedNotes[mm.key] = player.play(mm.key, 0, { gain: gain(mm.velocity) })
        break
      case 'noteoff':
        if (midiStartedNotes[mm.key]) {
          midiStartedNotes[mm.key].stop()
          delete midiStartedNotes[mm.key]
        }
        break
    }
  }
  return player
}

module.exports = { connect: connect }
