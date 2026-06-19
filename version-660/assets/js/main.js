(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var menu = qs('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  qsa('[data-hero-slider]').forEach(function (slider) {
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  });

  qsa('[data-filter-grid]').forEach(function (grid) {
    var input = qs('[data-filter-input]');
    var yearButtons = qsa('[data-year-filter]');
    var currentYear = 'all';

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      qsa('[data-movie-card]', grid).forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var yearOk = currentYear === 'all' || card.getAttribute('data-year') === currentYear;
        var textOk = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !(yearOk && textOk));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentYear = button.getAttribute('data-year-filter') || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });
  });
})();
