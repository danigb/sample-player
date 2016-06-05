# sample-player [![npm](https://img.shields.io/npm/v/sample-player.svg)](https://www.npmjs.com/package/sample-player)

[![Build Status](https://travis-ci.org/danigb/sample-player.svg?branch=master)](https://travis-ci.org/danigb/sample-player) [![Code Climate](https://codeclimate.com/github/danigb/sample-player/badges/gpa.svg)](https://codeclimate.com/github/danigb/sample-player) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard) [![license](https://img.shields.io/npm/l/sample-player.svg)](https://www.npmjs.com/package/sample-player)

Flexible audio sample player for browser:

```js
var player = require('sample-player')
var ac = new AudioContext()

var sample = player(ac, <AudioBuffer>)
sample.start()
sample.start() // can start several samples at the same time
sample.stop() // stop all playing sounds
```

## Features

#### Create multi-sample player

Pass a map of names to audio buffers to create a multi-sample player:

```js
var player = require('sample-player')
var ac = new AudioContext()
var drums = player(ac, {
  kick: <AudioBuffer>,
  snare: <AudioBuffer>,
  hihat: <AudioBuffer>
})
drums.start('kick')
drums.start('snare', ac.currentTime, { gain: 0.5 })
```

#### Map note names to midi (and oposite)

If the buffers are mapped to note names, you can pass note names (including enharmonics) or midi numbers:

```js
var samples = { 'C2': <AudioBuffer>, 'Db2': <AudioBuffer>, ... }
var piano = player(ac, samples)
piano.start(69) // => Plays 'A4'
piano.start('C#2') // => Plays 'Db2'
```

Decimal midi note numbers can be used to detune the notes:

```js
piano.start(69.5) // => Plays a note in the middle of 'A4' and 'Bb4'
```

#### Events

You can register event handlers with the `on` function:

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

You can apply an amplitude envelope control player-wide or shot-wide:

```js
var longSound = player(ac, <AudioBuffer>, { adsr: [1.2, 0.5, 0.8, 1.3] })
longSound.start()
longSound.start(ac.currentTime + 10, { adsr: [3, 0.5, 0.5, 1.3] })
```

#### Listen to midi inputs

Easily attach the player to a Web MIDI API `MidiInput`:

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
marimba.schedule(ac.currentTime, [
  { note: 'c2', time: 0, gain: 0.9 },
  { note: 'e2', time: 0.25, gain: 0.7 },
  { note: 'g2', time: 0.5, gain: 0.5 },
  { note: 'c3', time: 0.75, gain: 0.3 }
])
```

## Install

Via npm: `npm i --save sample-player` or grab the [browser ready file](https://raw.githubusercontent.com/danigb/sample-player/master/dist/sample-player.min.js) which exports `SamplePlayer` as window global.

## Options

The options can be passed to the `SamplePlayer` function to apply to all buffers, or to `start` function to apply to one shot.

- `gain`: float between 0 to 1
- `duration`: set the playing duration in seconds of the buffer(s)
- `loop`: set to true to loop the audio buffer

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
snare.start()
```

* [SamplePlayer(ac, source, options)](#SamplePlayer) ⇒ <code>player</code>
  * [.play](#player.play)
  * [.start(name, when, options)](#player.start) ⇒ <code>AudioNode</code>
  * [.stop(when, nodes)](#player.stop) ⇒ <code>Array</code>
  * [.on(event, callback)](#player.on) ⇒ <code>[SamplePlayer](#SamplePlayer)</code>
  * [.connect(destination)](#player.connect) ⇒ <code>[SamplePlayer](#SamplePlayer)</code>
  * [.schedule(source, map, when)](#player.schedule) ⇒ <code>Array</code>
  * [.listenToMidi(input, options)](#player.listenToMidi) ⇒ <code>[SamplePlayer](#SamplePlayer)</code>

<a name="SamplePlayer..player.play"></a>

### player.play
An alias for `player.start`

**See**: player.start  
**Since**: 0.3.0  
<a name="SamplePlayer..player.start"></a>

### player.start(name, when, options) ⇒ <code>AudioNode</code>
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

### player.stop(when, nodes) ⇒ <code>Array</code>
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

### player.connect(destination) ⇒ <code>AudioPlayer</code>
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

<a name="player.on"></a>
### player.on(event, callback) ⇒ <code>[SamplePlayer](#SamplePlayer)</code>
Adds a listener of an event

**Chainable**  
**Returns**: <code>[SamplePlayer](#SamplePlayer)</code> - the player  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>String</code> | the event name |
| callback | <code>function</code> | the event handler |

**Example**  
```js
player.on('start', function(time, note) {
  console.log(time, note)
})
```

<a name="player.schedule"></a>
### player.schedule(when, events) ⇒ <code>Array</code>

Schedule a list of events to be played at specific time.

It supports two formats of events:

- An array with `[time, note]`
- An array with objects `{ time: ?, [name|note|midi|key]: ? }`

**Returns**: <code>Array</code> - an array of ids  

| Param | Type | Description |
| --- | --- | --- |
| when | <code>Float</code> | an absolute time to start (or AudioContext's currentTime if it's less than currentTime) |
| source | <code>Array</code> | the events array |

**Example**  
```js
// Event format: [time, note]
var piano = player(ac, ...).connect(ac.destination)
piano.schedule(0, [ [0, 'C2'], [0.5, 'C3'], [1, 'C4'] ])
```

**Example**  
```js
// Event format: object { time: , name: }
var drums = player(ac, ...).connect(ac.destination)
drums.schedule(ac.currentTime, [
  { name: 'kick', time: 0 },
  { name: 'snare', time: 0.5 },
  { name: 'kick', time: 1 },
  { name: 'snare', time: 1.5 }
])
```

<a name="player.listenToMidi"></a>
### player.listenToMidi(input, options) ⇒ <code>[SamplePlayer](#SamplePlayer)</code>
Connect a player to a midi input

The options accepts:

- channel: the channel to listen to. Listen to all channels by default.

**Returns**: <code>[SamplePlayer](#SamplePlayer)</code> - the player  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>MIDIInput</code> |  |
| options | <code>Object</code> | (Optional) |

**Example**  
```js
var piano = player(...)
window.navigator.requestMIDIAccess().then(function (midiAccess) {
  midiAccess.inputs.forEach(function (midiInput) {
    piano.listenToMidi(midiInput)
  })
})
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
