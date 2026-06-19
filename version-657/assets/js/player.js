import { H as Hls } from './hls-vendor-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var source = player.getAttribute('data-video-src');
  var hlsInstance = null;

  function startPlayback() {
    if (!video || !source) {
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported && Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else {
      video.src = source;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }
});
