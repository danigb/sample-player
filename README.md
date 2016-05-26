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

#### Map note names to midi (and oposite)

```js
var samples = { 'C2': <AudioBuffer>, 'Db2': <AudioBuffer>, ... }
var piano = player(ac, samples)
piano.play(69) // => Plays 'A4'
piano.play('C#2') // => Plays 'Db2'
```

#### Events

```js
var drums = player(ac, { kick: ..., snare: ..., hihat ... })
drums.on('start', function (when, name) {
  console.log('start', name)
})
drums.on('ended', function (when, name) {
  console.log('ended', name)
})
drums.start('kick')
// console logs 'start kick'
// console.logs 'ended kick' when sound ends
```

#### Amplitude envelope control

```js
var longSound = player(ac, <AudioBuffer>, { adsr: [1.2, 0.5, 0.8, 1.3] })
longSound.play()
```

#### Listen to midi inputs

```js
var piano = player(...)
window.navigator.requestMIDIAccess().then(function (midiAccess) {
  midiAccess.inputs.forEach(function (midiInput) {
    piano.listenToMidi(midiInput)
  })
})
```

#### Play events

```js
var buffers = { 'C2': <AudioBuffer>, 'Db2': <AudioBuffer>, ... }
var marimba = player(ac, buffers)
marimba.schedule([
  { note: 'c2', time: 0, gain: 0.9 },
  { note: 'e2', time: 0.25, gain: 0.7 },
  { note: 'g2', time: 0.5, gain: 0.5 },
  { note: 'c3', time: 0.75, gain: 0.3 }
])
```

## Install

Via npm: `npm i --save sample-player` or grab the [browser ready file](https://raw.githubusercontent.com/danigb/sample-player/master/dist/sample-player.min.js) which exports `SamplePlayer` as window global.

## API

<a name="SamplePlayer"></a>

## SamplePlayer(ac, source, options) ⇒ <code>player</code>
Create a sample player.

**Returns**: <code>player</code> - the player  

| Param | Type | Description |
| --- | --- | --- |
| ac | <code>AudioContext</code> | the audio context |
| source | <code>ArrayBuffer</code> &#124; <code>Object.&lt;String, ArrayBuffer&gt;</code> |  |
| options | <code>Onject</code> | (Optional) an options object |

**Example**  
```js
var SamplePlayer = require('sample-player')
var ac = new AudioContext()
var snare = SamplePlayer(ac, <AudioBuffer>)
snare.play()
```

* [SamplePlayer(ac, source, options)](#SamplePlayer) ⇒ <code>player</code>
  * [.play](#SamplePlayer..player.play)
  * [.start(name, when, options)](#SamplePlayer..player.start) ⇒ <code>AudioNode</code>
  * [.stop(when, nodes)](#SamplePlayer..player.stop) ⇒ <code>Array</code>
  * [.on(event, callback)](#SamplePlayer..player.on) ⇒ <code>AudioPlayer</code>
  * [.connect(destination)](#SamplePlayer..player.connect) ⇒ <code>AudioPlayer</code>
  * [.schedule(source, map, when)](#SamplePlayer..player.schedule) ⇒ <code>Array</code>

<a name="SamplePlayer..player.play"></a>

#### player.play
An alias for `player.start`

**See**: player.start  
**Since**: 0.3.0  
<a name="SamplePlayer..player.start"></a>

#### player.start(name, when, options) ⇒ <code>AudioNode</code>
Start a sample buffer.

The returned object has a function `stop(when)` to stop the sound.

**Returns**: <code>AudioNode</code> - an audio node with a `stop` function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | the name of the buffer. If the source of the SamplePlayer is one sample buffer, this parameter is not required |
| when | <code>Float</code> | (Optional) when to start (current time if by default) |
| options | <code>Object</code> | additional sample playing options |

**Example**  
```js
var sample = player(ac, <AudioBuffer>).connect(ac.destination)
sample.start()
sample.start(5, { gain: 0.7 }) // name not required since is only one AudioBuffer
```
**Example**  
```js
var drums = player(ac, { snare: <AudioBuffer>, kick: <AudioBuffer>, ... }).connect(ac.destination)
drums.start('snare')
drums.start('snare', 0, { gain: 0.3 })
```
<a name="SamplePlayer..player.stop"></a>

#### player.stop(when, nodes) ⇒ <code>Array</code>
Stop some or all samples

**Returns**: <code>Array</code> - an array of ids of the stoped samples  

| Param | Type | Description |
| --- | --- | --- |
| when | <code>Float</code> | (Optional) an absolute time in seconds (or currentTime if not specified) |
| nodes | <code>Array</code> | (Optional) an array of nodes or nodes ids to stop |

**Example**  
```js
var longSound = player(ac, <AudioBuffer>).connect(ac.destination)
longSound.start(ac.currentTime)
longSound.start(ac.currentTime + 1)
longSound.start(ac.currentTime + 2)
longSound.stop(ac.currentTime + 3) // stop the three sounds
```
<a name="SamplePlayer..player.connect"></a>

#### player.connect(destination) ⇒ <code>AudioPlayer</code>
Connect the player to a destination node

**Chainable**  
**Returns**: <code>AudioPlayer</code> - the player  

| Param | Type | Description |
| --- | --- | --- |
| destination | <code>AudioNode</code> | the destination node |

**Example**  
```js
var sample = player(ac, <AudioBuffer>).connect(ac.destination)
```
<a name="SamplePlayer..player.schedule"></a>

#### player.schedule(source, map, when) ⇒ <code>Array</code>
Schedule events to be played

**Returns**: <code>Array</code> - an array of ids  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>Object</code> | the events source |
| map | <code>function</code> | (Optional) a function to map the events source into events object. |
| when | <code>Float</code> | (Optional) an absolute time to start (or currentTime if not present) |

**Example**  
```js
var drums = player(ac, ...).connect(ac.destination)
drums.schedule([
  { name: 'kick', time: 0 },
  { name: 'snare', time: 0.5 },
  { name: 'kick', time: 1 },
  { name: 'snare', time: 1.5 }
])
```

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
