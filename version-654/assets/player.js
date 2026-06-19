(function () {
  var hlsPromise = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("HLS library was not loaded."));
        }
      };
      script.onerror = function () {
        reject(new Error("HLS library failed to load."));
      };
      document.head.appendChild(script);
    });

    return hlsPromise;
  }

  function setStatus(container, message) {
    var status = container.querySelector("[data-player-status]");

    if (status) {
      status.textContent = message;
    }
  }

  function bindPlayer(container) {
    var video = container.querySelector("video");
    var button = container.querySelector("[data-play-button]");
    var source = container.getAttribute("data-source");

    if (!video || !button || !source) {
      return;
    }

    button.addEventListener("click", function () {
      setStatus(container, "正在加载高清播放源…");
      container.classList.add("is-playing");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {
          setStatus(container, "浏览器已阻止自动播放，请再次点击视频播放。")
        });
        return;
      }

      loadHlsScript()
        .then(function (Hls) {
          if (!Hls.isSupported()) {
            video.src = source;
            return video.play();
          }

          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setStatus(container, "浏览器已阻止自动播放，请再次点击视频播放。")
            });
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus(container, "播放源暂时无法加载，请检查对应 m3u8 文件。")
            }
          });
        })
        .catch(function () {
          video.src = source;
          video.play().catch(function () {
            setStatus(container, "当前浏览器需要 HLS 支持才能播放该线路。")
          });
        });
    });
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bindPlayer);
  });
})();
