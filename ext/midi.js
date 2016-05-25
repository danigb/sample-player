var midimessage = require('midimessage')

/**
 * Connect a player to a midi input
 * @param {MIDIInput} input
 * @param {SamplePlayer} player
 */
function connect (input, player) {
  var midiStartedNotes = {}

  /*
  * Process raw Web MIDI messages or already-parsed [midimessages](https://www.npmjs.com/package/midimessage) to start or stop sounds
  *
  * @param {MIDIMessageEvent | M} message - a raw [MIDI event](https://www.w3.org/TR/webmidi/#midimessageevent-interface) from the Web MIDI API or parsed as a MidiMessage from the midimessage module
  * @return {Object} all the midi notes as handled by the player
  * @example
  * window.navigator.requestMIDIAccess().then(function onMIDISuccess (midi) {
  * midi.inputs.forEach(function (input, channelKey) {
  *   input.onmidimessage = player[channelKey].processMidiMessage
  * }), function manageFailure () {...})
  */
  input.onmidimessage = function (message) {
    if (message.messageType == null) {
      message = midimessage(message)
    }

    if (message.messageType === 'noteon' && message.velocity === 0) {
      message.messageType = 'noteoff'
    }

    switch (message.messageType) {
      case 'noteon':
        midiStartedNotes[message.key] = player.play(message.key, 0)
        break
      case 'noteoff':
        if (midiStartedNotes[message.key]) {
          midiStartedNotes[message.key].stop()
        }
        break
    }
    return player.midiStartedNotes
  }
}

module.exports = { connect: connect }
