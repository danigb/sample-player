# sample-player [![npm](https://img.shields.io/npm/v/sample-player.svg)](https://www.npmjs.com/package/sample-player)

[![Build Status](https://travis-ci.org/danigb/sample-player.svg?branch=master)](https://travis-ci.org/danigb/sample-player) [![Code Climate](https://codeclimate.com/github/danigb/sample-player/badges/gpa.svg)](https://codeclimate.com/github/danigb/sample-player) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard) [![license](https://img.shields.io/npm/l/sample-player.svg)](https://www.npmjs.com/package/sample-player)

Flexible audio sample player for browser:

```js
var player = require('sample-player')
var ac = new AudioContext()

var sample = player(ac, <AudioBuffer>)
sample.play()
sample.play() // can call play several times
sample.stop() // stop all playing sounds
```

## Features

#### Create multi-sample player

```js
var audioBank = require('sample-player')
var ac = new AudioContext()
var drums = audioBank(ac, {
  kick: <AudioBuffer>,
  snare: <AudioBuffer>,
  hihat: <AudioBuffer>
})
drums.play('kick')
drums.play('snare', { gain: 0.5 })
```

#### Map name notes to midi (and oposite)

```js
var samples = { 'C2': <AudioBuffer>, 'Db2': <AudioBuffer>, ... }
var piano = player(ac, samples, { map: 'midi' })
piano.play(69) // => Plays 'A4'
piano.play('C#2') // => Plays 'Db2'
```

#### Events listeners

```js
var drums = player(ac, { kick: ..., snare: ..., hihat ... })
drums.onstart = function (when, name) {
  console.log('start', name)
}
drums.onended = function (when, name) {
  console.log('ended', name)
}
drums.start('kick')
// console logs 'start kick'
// console.logs 'ended kick' when sound ends
```

#### Amplitude envelope control

```js
var longSound = player(ac, <AudioBuffer>, { adsr: [1.2, 0.5, 0.8, 1.3] })
longSound.play()
```

#### Schedule events

```js
var marimba = player(ac, { 'C2': ... , 'Db2': .... })
marimba.schedule([
  { note: 'c2', time: 0, gain: 0.9 },
  { note: 'e2', time: 0.25, gain: 0.7 },
  { note: 'g2', time: 0.5, gain: 0.5 },
  { note: 'c3', time: 0.75, gain: 0.3 }
])
```

## Install

Via npm: `npm i --save sample-player` or grab the [browser ready file](https://raw.githubusercontent.com/danigb/sample-player/master/dist/sample-player.min.js) (4kb) which exports `loadAudio` as window global.

## API

<a name="player"></a>

#### `player(ac, source, options)`

| Param | Type | Description |
| --- | --- | --- |
| ac | <code>AudioContext</code> | the audio context |
| source | <code>Object</code> | the object to be loaded |
| options | <code>Object</code> | (Optional) the load options for that object |


## Run tests and examples

To run the test, clone this repo and:

```bash
npm install
npm test
```

To run the example:

```bash
npm i -g beefy
beefy example/midi.js
```

## License

MIT License
