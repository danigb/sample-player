# sample-player [![npm](https://img.shields.io/npm/v/sample-player.svg)](https://www.npmjs.com/package/sample-player)

[![smplr](https://img.shields.io/badge/smplr-instrument-32bbee.svg)](https://github.com/danigb/smplr)

A web audio sample player:

```js
var Player = require('sample-player')
var ac = new AudioContext()
var player = Player(ac.destination)
// given an AudioBuffer...
player.start(audioBuffer)
```

## Features

- Simple and constant audio route: buffer -> filter -> amp -> destination
- adsr amplitude envelope
- Pitch and detune
- Set sample properties per player or per buffer basis
- Stop all scheduled plays

## Install

Via npm only: `npm i --save sample-player`. For a browser distribution see [smplr](https://github.com/danigb/smplr)

## Usage

Create a player with global sample options:

```js
var player = Player(ac.destination, { loop: true, filter: 'lowpass', freq: 600 })
```

And use `start` method to start an audio buffer (optionally pass when you can to start and the duration in seconds)

```js
player.start(buffer, ac.currentTime, 2)
```

You can override sample options:

```js
player.start(buffer, ac.currentTime, 2, { freq: 1200, pitch: -4 })
```

# License

MIT License
