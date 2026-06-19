(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function setHero(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setHero(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setHero(activeIndex + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupCardFilters() {
    var input = document.querySelector('[data-card-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var genreFilter = document.querySelector('[data-genre-filter]');
    var reset = document.querySelector('[data-reset-filters]');
    var count = document.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    if (!cards.length) {
      return;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var year = normalize(yearFilter && yearFilter.value);
      var genre = normalize(genreFilter && genreFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var passYear = !year || normalize(card.getAttribute('data-year')) === year;
        var passGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(genre) !== -1;
        var pass = passKeyword && passYear && passGenre;

        card.classList.toggle('is-hidden', !pass);
        if (pass) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    [input, yearFilter, genreFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        if (genreFilter) {
          genreFilter.value = '';
        }
        apply();
      });
    }
  }

  function setupGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-global-results]');
    var index = window.MOVIE_SEARCH_INDEX || [];

    if (!input || !results || !index.length) {
      return;
    }

    function render() {
      var keyword = normalize(input.value);

      if (!keyword) {
        results.classList.remove('open');
        results.innerHTML = '';
        return;
      }

      var matches = index.filter(function (item) {
        return normalize(item.title + ' ' + item.year + ' ' + item.category + ' ' + item.genre + ' ' + item.region).indexOf(keyword) !== -1;
      }).slice(0, 20);

      if (!matches.length) {
        results.classList.add('open');
        results.innerHTML = '<div class="empty-result">没有找到相关影片</div>';
        return;
      }

      results.classList.add('open');
      results.innerHTML = matches.map(function (item) {
        return '<a href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title + '">' +
          '<span><strong>' + item.title + '</strong>' +
          '<span>' + item.year + ' · ' + item.category + ' · ' + item.genre + '</span></span>' +
          '</a>';
      }).join('');
    }

    input.addEventListener('input', render);
    document.addEventListener('click', function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.classList.remove('open');
      }
    });
  }

  function setupPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-video]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var shell = button.closest('[data-video-shell]');
        var video = shell && shell.querySelector('video');

        if (!video) {
          return;
        }

        var source = video.getAttribute('data-video-source');

        if (!source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsInstance) {
            video._hlsInstance = new window.Hls();
            video._hlsInstance.loadSource(source);
            video._hlsInstance.attachMedia(video);
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        button.classList.add('hidden');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('hidden');
          });
        }
      });
    });
  }

  setupCardFilters();
  setupGlobalSearch();
  setupPlayers();
})();
