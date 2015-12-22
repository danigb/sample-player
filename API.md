## `Player`

Create a audio buffer player. An audio buffer player allows to play audio
buffers easily.

It has three methods: `start`, `stop` and `connect`

### Parameters

* `destination` **`AudioNode or AudioContext`** the destination or the audio context. In the first case, the player will connect to that destination. In the second, you will have to call `connect` explicitly
* `options` **`Hash`** (Optional) the default sample configuration. See `Sample` constructor


### Examples

```js
var player = new Player(ac.destination)
// play the same buffer with 1 second of difference
player.start(buffer, ac.currentTime)
player.start(buffer, ac.currentTime + 1)
```

Returns `Player` the sample player


## `player.connect`

Set player destination

If you pass an audio destination in the Player constructor, you won't need
to call this method

### Parameters

* `destination` **`AudioNode`** the sample destination


### Examples

```js
var player = new Player(ac)
player.connect(ac.destination)
// same as:
var player = new Player(ac.destination)
```

Returns `Player` the player (chainable function)


## `player.start`

Start a buffer

### Parameters

* `buffer` **`AudioBuffer`** the audio buffer to play
* `when` **`Float`** the start time
* `duration` **`Float`** (Optional) the duration in seconds. If it's a number greater than 0, it will stop the buffer after that time.
* `options` **`Hash`** (Optional) options (same as in Player function)
* `destination` **`AudioDestinationNode`** (Optional) a destination that overrides the default routing


### Examples

```js
var player = new Player(ac.destination)
player.start(buffer, ac.currentTime, 1, { loop: true })
```

Returns `Object` an object with the following connected nodes:


## `player.stop`

Stop some or all of the playing samples

### Parameters

* `when` **`Float`** the time to schedule the stop
* `ids` **`Integer or Array<Integer>`** (Optional) the ids of the samples to stop or stop all samples if no value is provided


### Examples

```js
var player = new Player(ac.destination, { loop: true })
player.start(drumLoop1)
player.start(drumLoop2)
player.start(drumLoop3)
player.stop(ac.currentTime + 10) // stop all loops after 10 seconds
```



## `Sample`

Create an audio sample. An audio sample is an object with the following
connected nodes:

- source: a buffer source node
- filter: a biquad filter node
- env: a gain envelop adsr node
- amp: a gain node

They are public, and you can modify them before play.

Additionally, an audio sample has a `start` and  `stop` methods and a `onended`
event handler.

### Parameters

* `buffer` **`AudioBuffer`** (Required) the audio buffer
* `destination` **`AudioNode`** (Required) the audio destination
* `options` **`Hash or Function`** (Optional) the sample options
* `fire` **`Function`** (Optiona) a function to fire events


### Examples

```js
var sample = new Sample(buffer, ac.destination)
sample.play(ac.currentTime)
```

Returns `Sample` the sample


## `sample.onended`

A event handler that contains the callback associated with the `ended`
audio buffer source event



### Examples

```js
var sample = new Sample(buffer, ac.destination)
sample.onended = function(sample) { console.log('ended!') }
```



## `sample.start`

Schedule the sample to start. Only can be called once.

### Parameters

* `when` **`Float`** (Optional) when to start the sample or now
* `duration` **`Float`** (Optional) the duration in seconds. Only if its greater than 0, the `stop` method of sample will be called after that duration


### Examples

```js
var sample = new Sample(buffer, ac.destination)
sample.start()
sample.start() // => thows Error. Create a new sample instead.
```



## `sample.stop`

Schedule the sample to stop.

### Parameters

* `when` **`Float`** (Optiona) when to stop the sample, or now


### Examples

```js
var sample = new Sample(buffer, ac.destination)
sample.start(ac.currentTime + 1)
sample.stop(ac.currentTime + 2)
```



