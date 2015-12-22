## `Player`

Create a audio buffer player

### Parameters

* `destination` **`AudioDestinationNode or AudioContext`** the destination or the audio context. In the first case, the player will connect to that destination. In the second, you will have to call `connect` explicitly
* `options` **`Hash`** the sample play configuration  Valid options:  - gain: the audio gain (default: 1) - loop: loop or not the audio (default: false) - filter: the filter type (default: 'highpass') - freq: the filter frequency (default: 0)



Returns `Player` the sample player


## `player.start`

Start a buffer

### Parameters

* `buffer` **`AudioBuffer`** the audio buffer to play
* `when` **`Float`** the start time
* `duration` **`Float`** (Optional) the duration in seconds. If it's a number greater than 0, it will stop the buffer after that time.
* `options` **`Hash`** (Optional) options (same as in Player function)
* `destination` **`AudioDestinationNode`** (Optional) a destination that overrides the default routing



Returns `Object` an object with the following connected nodes:

- source: a buffer source node
- filter: a biquad filter node
- env: a gain envelop adsr node
- amp: a gain node
- stop: a function to stop the sound at the given time


