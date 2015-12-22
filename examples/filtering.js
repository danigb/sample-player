/*
Read my blog post about Web Audio API:
http://codepen.io/DonKarlssonSan/blog/fun-with-web-audio-api

Browser support for Web Audio API:
http://caniuse.com/#feat=audio-api
*/
(function () {
  var AudioContext = window.AudioContext ||
  window.webkitAudioContext
  var audioContext
  var biquadFilter

  var frequencySlider = document.getElementById('frequencySlider')
  var qSlider = document.getElementById('qSlider')
  var gainSlider = document.getElementById('gainSlider')

  var audio

  // All Web Audio API filters
  // https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/type
  // q and gain controls if the corresponding slider
  // should be enabled
  var filters = { 'lowpass': {
    q: true,
    gain: false
  }, 'highpass': {
    q: true,
    gain: false
  }, 'bandpass': {
    q: true,
    gain: false
  }, 'lowshelf': {
    q: false,
    gain: true
  }, 'highshelf': {
    q: false,
    gain: true
  }, 'peaking': {
    q: true,
    gain: true
  }, 'notch': {
    q: true,
    gain: false
  }, 'allpass': {
    q: true,
    gain: false
  }}

  var canvas = document.getElementById('canvas')
  var canvasContext = canvas.getContext('2d')

  var frequencyBars = 100
  // Array containing all the frequencies we want to get
  // response for when calling getFrequencyResponse()
  var myFrequencyArray = new Float32Array(frequencyBars)
  for (var i = 0; i < frequencyBars; ++i) {
    myFrequencyArray[i] = 2000 / frequencyBars * (i + 1)
  }

  // We receive the result in these two when calling
  // getFrequencyResponse()
  var magResponseOutput = new Float32Array(frequencyBars) // magnitude
  var phaseResponseOutput = new Float32Array(frequencyBars)

  audioContext = new AudioContext()

  window.addEventListener('load', function (e) {
    audio = document.getElementById('theSong')
    audio.crossOrigin = 'anonymous'

    var source = audioContext.createMediaElementSource(audio)

    biquadFilter = audioContext.createBiquadFilter()
    biquadFilter.type = 'lowpass'
    biquadFilter.frequency.value = 1000
    biquadFilter.Q.value = 10
    biquadFilter.gain.value = 20

    source.connect(biquadFilter)
    biquadFilter.connect(audioContext.destination)

    updateFrequencyResponse()
  }, false)

  function drawFrequencyResponse(mag, phase) {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    var barWidth = 400 / frequencyBars

    // Magnitude
    canvasContext.strokeStyle = 'white'
    canvasContext.beginPath()
    for(var frequencyStep = 0; frequencyStep < frequencyBars; ++frequencyStep) {
      canvasContext.lineTo(
        frequencyStep * barWidth,
        canvas.height - mag[frequencyStep]*90)
      }
      canvasContext.stroke()

      // Phase
      canvasContext.strokeStyle = 'red'
      canvasContext.beginPath()
      for (var frequencyStep = 0; frequencyStep < frequencyBars; ++frequencyStep) {
        canvasContext.lineTo(
          frequencyStep * barWidth,
          canvas.height - (phase[frequencyStep] * 90 + 300) / Math.PI)
        }
        canvasContext.stroke()
      }

      function updateFrequencyResponse() {
        biquadFilter.getFrequencyResponse(
          myFrequencyArray,
          magResponseOutput,
          phaseResponseOutput)
          drawFrequencyResponse(magResponseOutput, phaseResponseOutput)
        }


        frequencySlider.addEventListener('change', function () {
          biquadFilter.frequency.value = this.value
        })

        frequencySlider.addEventListener('mousemove', function () {
          biquadFilter.frequency.value = this.value
          updateFrequencyResponse()
        })

        qSlider.addEventListener('mousemove', function () {
          biquadFilter.Q.value = this.value
          updateFrequencyResponse()
        })

        gainSlider.addEventListener('mousemove', function () {
          biquadFilter.gain.value = this.value
          updateFrequencyResponse()
        })

        var filtersDropdown = document.getElementById('filtersDropdown')

        for(var item in filters) {
          var option = document.createElement('option')
          option.innerHTML = item
          // This will cause a re-flow of the page but we don't care
          filtersDropdown.appendChild(option)
        }

        function filterClicked (event) {
          event = event || window.event
          var target = event.target || event.srcElement
          var filterName = target.value
          biquadFilter.type = filterName
          updateFrequencyResponse()
          qSlider.disabled = !filters[filterName].q
          gainSlider.disabled = !filters[filterName].gain
        }
        filtersDropdown.addEventListener('change', filterClicked, false)

        ////////////////////////////
        // Soundcloud stuff below //
        ////////////////////////////

        function get(url, callback) {
          var request = new XMLHttpRequest()
          request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
              callback(request.responseText)
            }
          }

          request.open('GET', url, true)
          request.send(null)
        }

        var clientParameter = 'client_id=3b2585ef4a5eff04935abe84aad5f3f3'

        var trackPermalinkUrl =
        'https://soundcloud.com/aviciiofficial/avicii-levels-original-mix'

        function findTrack () {
          get('http://api.soundcloud.com/resolve.json?url=' + trackPermalinkUrl + '&' + clientParameter,
          function (response) {
            var trackInfo = JSON.parse(response)
            audio.src = trackInfo.stream_url + '?' + clientParameter
          }
        )
      }

      findTrack()

    })()
