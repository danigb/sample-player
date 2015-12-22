# sample-player [![npm](https://img.shields.io/npm/v/sample-player.svg)](https://www.npmjs.com/package/sample-player)

[![smplr](https://img.shields.io/badge/smplr-instrument-32bbee.svg)](https://github.com/danigb/smplr)

A web audio sample player:

```js
var Player = require('sample-player')
var ac = new AudioContext()
var player = new Player(ac.destination)
// given an AudioBuffer...
player.start(audioBuffer)
```

## Features

- Simple and constant audio route: `buffer -> filter -> amp -> destination`
- Amplitude envelope
- Pitch and detune
- Set sample properties per player or per buffer basis
- Stop all scheduled plays

## Install

Via npm only: `npm i --save sample-player`. For a browser distribution see [smplr](https://github.com/danigb/smplr)

## Usage

Create a player with global sample options. Use `start` method to start an audio buffer and `stop` to stop all the samples. The `start` methods accepts `when`, `duration` and `options`:


```js
var ac = new AudioContext()
var now = ac.currentTime
var player = new Player(ac.destination, { loop: true, filter: 'lowpass', freq: 600 })
// start a buffer
player.start(buffer)
// schedule start and end
player.start(buffer, now + 1).stop(now + 3)
// set duration (automatically call stop)
player.start(buffer, now + 2, 2)
// override defaults
player.start(buffer, now + 3, 2, { freq: 1200 })

player.stop() // stop all the samples
```

#### Sample options

The options can have the following values:

- gain: the sample gain value (0 to 1, default 1)
- loop: loops the sample (default false)
- pitch: the pitch of the sample in semitones (default 0)
- detune: the sample detune in cents (default 0)
- attack: the amp attack envelope time (default 0.01)
- decay: the amp decay envelope time (default 0.1)
- sustain: the multiplier of the gain value when sustain (0 to 1, default 1)
- release: the release envelope time (default 0.2)
- filter: the filter type (one of [this](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/type), default 'highpass')
- freq: the filter frequency (default 0)
- q: the filter [quality factor](https://en.wikipedia.org/wiki/Q_factor)

#### Player events

You can listen to player events with the `onEvent` property:

```js
var player = new Player(ac.destination)
player.onEvent = function (event, sample) {
  console.log(event, sample)
}
```

Currently the following event are fire: `start`, `stop`, `ended`

# License

MIT License
