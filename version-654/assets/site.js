(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (navToggle && siteNav) {
      navToggle.addEventListener("click", function () {
        siteNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var genreSelect = document.querySelector("[data-genre-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector("[data-no-results]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var text = title + " " + cardYear + " " + cardRegion + " " + cardGenre;
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !year || cardYear.indexOf(year) !== -1;
        var matchesGenre = !genre || cardGenre.indexOf(genre) !== -1;
        var matches = matchesKeyword && matchesYear && matchesGenre;

        card.style.display = matches ? "" : "none";

        if (matches) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.style.display = visible ? "none" : "block";
      }
    }

    if (searchInput || yearSelect || genreSelect) {
      var query = new URLSearchParams(window.location.search).get("q");

      if (query && searchInput) {
        searchInput.value = query;
      }

      [searchInput, yearSelect, genreSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", filterCards);
          element.addEventListener("change", filterCards);
        }
      });

      filterCards();
    }
  });
})();
