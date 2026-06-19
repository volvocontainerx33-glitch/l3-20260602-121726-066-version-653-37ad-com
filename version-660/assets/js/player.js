(function () {
  function attachPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-stream');
    var ready = false;

    function bindSource() {
      if (ready || !video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        player.hls = hls;
      } else {
        video.src = source;
      }

      ready = true;
    }

    function play() {
      bindSource();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
