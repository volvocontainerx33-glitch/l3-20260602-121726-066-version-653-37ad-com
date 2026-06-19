(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-main-nav]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5500);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var count = scope.querySelector('[data-filter-count]');
    var list = scope.parentElement.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var query = normalize(input && input.value);
      var year = normalize(yearFilter && yearFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchesType = !type || haystack.indexOf(type) !== -1;
        var isVisible = matchesQuery && matchesYear && matchesType;

        card.classList.toggle('is-filter-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    [input, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }

    applyFilter();
  });
})();
