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

## Install

Via npm only: `npm i --save sample-player`

# License

MIT License
