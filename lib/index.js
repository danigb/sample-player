'use strict'

var player = require('./player')
var events = require('./events')
var mapper = require('./mapper')
var scheduler = require('./scheduler')
var midi = require('./midi')

function SamplePlayer (ac, source, options) {
  return midi(scheduler(mapper(events(player(ac, source, options)))))
}

if (typeof module === 'object' && module.exports) module.exports = SamplePlayer
if (typeof window !== 'undefined') window.SamplePlayer = SamplePlayer
