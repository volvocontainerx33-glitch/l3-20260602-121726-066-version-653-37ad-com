import { H as Hls } from './hls-vendor-dru42stk.js';

const shell = document.querySelector('.player-shell[data-source]');

if (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.player-start');
    const source = shell.dataset.source;
    let initialized = false;
    let hls = null;

    const initPlayer = function () {
        if (!video || !source || initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };

    const start = function () {
        initPlayer();
        shell.classList.add('playing');
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                shell.classList.remove('playing');
            });
        }
    };

    if (button) {
        button.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
        shell.classList.add('playing');
    });

    video.addEventListener('pause', function () {
        if (!video.currentTime) {
            shell.classList.remove('playing');
        }
    });

    video.addEventListener('click', function () {
        if (!initialized) {
            start();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
