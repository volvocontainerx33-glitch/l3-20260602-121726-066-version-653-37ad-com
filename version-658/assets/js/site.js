(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    play();
  }

  function setupLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-live-search]'));
    var areas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
    var yearFilter = document.querySelector('[data-year-filter]');
    if (!inputs.length || !areas.length) {
      return;
    }
    function apply() {
      var query = text(inputs.map(function (input) {
        return input.value;
      }).join(' ')).trim();
      var year = yearFilter ? yearFilter.value : '';
      areas.forEach(function (area) {
        Array.prototype.slice.call(area.children).forEach(function (item) {
          var haystack = text(item.getAttribute('data-title') + ' ' + item.getAttribute('data-year') + ' ' + item.getAttribute('data-region') + ' ' + item.getAttribute('data-genre') + ' ' + item.textContent);
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !year || item.getAttribute('data-year') === year || haystack.indexOf(year) !== -1;
          item.classList.toggle('is-hidden', !(matchesQuery && matchesYear));
        });
      });
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
  }

  function setupPlayer() {
    var box = document.querySelector('[data-player-box]');
    var video = document.querySelector('[data-player-video]');
    if (!box || !video) {
      return;
    }
    var started = false;
    var stream = box.getAttribute('data-stream');
    function start() {
      if (!stream) {
        return;
      }
      box.classList.add('is-playing');
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        started = true;
      }
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {});
      }
    }
    box.addEventListener('click', function (event) {
      if (event.target && event.target.tagName === 'VIDEO') {
        return;
      }
      start();
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-player-start]')).forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var button = document.querySelector('[data-global-search-button]');
    var results = document.querySelector('[data-global-results]');
    var data = window.SITE_SEARCH_INDEX || [];
    if (!input || !results || !data.length) {
      return;
    }
    function render(items, heading) {
      var html = [
        '<div class="section-head">',
        '<div>',
        '<span class="eyebrow">Result</span>',
        '<h2>' + heading + '</h2>',
        '</div>',
        '<a class="text-link" href="./rank.html">热播榜</a>',
        '</div>',
        '<div class="movie-grid compact-grid">'
      ];
      items.slice(0, 120).forEach(function (movie) {
        html.push('<article class="movie-card movie-card-compact">');
        html.push('<a class="poster-link" href="' + movie.href + '" aria-label="' + movie.title + '">');
        html.push('<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">');
        html.push('<span class="poster-shade"></span><span class="poster-play">▶</span></a>');
        html.push('<div class="movie-card-body">');
        html.push('<div class="movie-meta-line"><span>' + movie.year + '</span><span>' + movie.region + '</span></div>');
        html.push('<h3><a href="' + movie.href + '">' + movie.title + '</a></h3>');
        html.push('<p>' + movie.one + '</p>');
        html.push('</div></article>');
      });
      html.push('</div>');
      results.innerHTML = html.join('');
    }
    function search() {
      var query = text(input.value).trim();
      if (!query) {
        render(data.slice(0, 24), '热门推荐');
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var matched = data.filter(function (movie) {
        var haystack = text(movie.title + ' ' + movie.region + ' ' + movie.year + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.one);
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });
      render(matched, matched.length ? '搜索结果' : '暂无匹配影片');
    }
    input.addEventListener('input', search);
    if (button) {
      button.addEventListener('click', search);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupPlayer();
    setupGlobalSearch();
  });
})();
