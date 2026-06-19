(function () {
  var input = document.querySelector('[data-site-search]');
  var select = document.querySelector('[data-type-select]');
  var results = document.querySelector('[data-search-results]');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getQueryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.file) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-glow"></span><span class="play-badge">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-list">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

  function render() {
    if (!results || !Array.isArray(MOVIES)) {
      return;
    }
    var query = input ? input.value.trim().toLowerCase() : '';
    var typeValue = select ? select.value : 'all';
    var filtered = MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      var typeOk = typeValue === 'all' || String(movie.type || '').indexOf(typeValue) !== -1;
      var queryOk = !query || text.indexOf(query) !== -1;
      return typeOk && queryOk;
    }).slice(0, 96);
    results.innerHTML = filtered.map(card).join('');
  }

  if (input) {
    input.value = getQueryFromUrl();
    input.addEventListener('input', render);
  }

  if (select) {
    select.addEventListener('change', render);
  }

  render();
})();
