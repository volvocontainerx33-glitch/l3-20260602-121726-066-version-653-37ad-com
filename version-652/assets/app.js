(function () {
  const body = document.body;
  const base = body.dataset.base || './';

  function joinUrl(prefix, path) {
    if (!path) {
      return prefix;
    }
    return prefix + path.replace(/^\.\//, '');
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    let activeIndex = 0;
    let timer = null;

    function goTo(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        goTo(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.dataset.heroDot || 0);
        goTo(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    const groups = Array.from(document.querySelectorAll('[data-filter-group]'));
    if (!groups.length) {
      return;
    }
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    groups.forEach(function (group) {
      group.addEventListener('click', function (event) {
        const button = event.target.closest('[data-filter]');
        if (!button) {
          return;
        }
        group.querySelectorAll('[data-filter]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        const filter = normalizeText(button.dataset.filter);
        cards.forEach(function (card) {
          const haystack = normalizeText([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.textContent
          ].join(' '));
          const visible = filter === 'all' || haystack.includes(filter);
          card.classList.toggle('is-hidden', !visible);
        });
      });
    });
  }

  function setupSearch() {
    const input = document.getElementById('site-search');
    const results = document.getElementById('global-search-results');
    if (!input || !results) {
      return;
    }
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const movies = Array.isArray(window.MOVIES_SEARCH) ? window.MOVIES_SEARCH : [];

    function renderResults(query) {
      if (!query) {
        results.classList.remove('is-visible');
        results.innerHTML = '';
        return;
      }
      const q = normalizeText(query);
      const matches = movies.filter(function (movie) {
        return normalizeText([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category
        ].join(' ')).includes(q);
      }).slice(0, 10);

      if (!matches.length) {
        results.classList.add('is-visible');
        results.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        const image = joinUrl(base, movie.image);
        const url = joinUrl(base, movie.url);
        return [
          '<a class="search-result-item" href="' + url + '">',
          '  <img src="' + image + '" alt="' + escapeHtml(movie.title) + '" onerror="this.classList.add(\'is-missing\')">',
          '  <span><strong>' + escapeHtml(movie.title) + '</strong>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</span>',
          '  <em>观看</em>',
          '</a>'
        ].join('');
      }).join('');
      results.classList.add('is-visible');
    }

    function filterCurrentCards(query) {
      const q = normalizeText(query);
      cards.forEach(function (card) {
        if (!q) {
          card.classList.remove('is-hidden');
          return;
        }
        const haystack = normalizeText([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        card.classList.toggle('is-hidden', !haystack.includes(q));
      });
    }

    input.addEventListener('input', function () {
      const query = input.value;
      renderResults(query);
      filterCurrentCards(query);
    });

    document.addEventListener('click', function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.classList.remove('is-visible');
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      const video = player.querySelector('video');
      const button = player.querySelector('[data-play-button]');
      const source = player.dataset.src;
      let hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener('click', function () {
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              player.classList.remove('is-playing');
              button.innerHTML = '<span>!</span><strong>播放源暂不可用，稍后重试</strong>';
            }
          });
          return;
        }

        video.src = source;
        video.play().catch(function () {
          player.classList.remove('is-playing');
          button.innerHTML = '<span>!</span><strong>当前浏览器不支持 HLS 播放</strong>';
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupPlayers();
  });
})();
