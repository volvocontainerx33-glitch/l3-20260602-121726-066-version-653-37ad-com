(function () {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('#mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.textContent = isOpen ? '×' : '☰';
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        let index = 0;
        let timer = null;

        const showSlide = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        const startTimer = function () {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        };

        const resetTimer = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroTarget || 0));
                resetTimer();
            });
        });

        startTimer();
    }

    document.querySelectorAll('[data-local-filter]').forEach(function (form) {
        const input = form.querySelector('input[type="search"]');
        const list = document.querySelector('[data-filter-list]');

        if (!input || !list) {
            return;
        }

        const items = Array.from(list.querySelectorAll('.movie-card'));

        const filter = function () {
            const keyword = input.value.trim().toLowerCase();
            items.forEach(function (item) {
                const haystack = item.textContent.toLowerCase();
                item.classList.toggle('hidden-by-filter', keyword && !haystack.includes(keyword));
            });
        };

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            filter();
        });

        input.addEventListener('input', filter);
    });

    const searchDataElement = document.querySelector('#search-data');
    const searchInput = document.querySelector('#search-input');
    const categoryFilter = document.querySelector('#category-filter');
    const yearFilter = document.querySelector('#year-filter');
    const searchResults = document.querySelector('#search-results');
    const searchSummary = document.querySelector('#search-summary');
    const resetButton = document.querySelector('#search-reset');

    if (searchDataElement && searchInput && categoryFilter && yearFilter && searchResults && searchSummary) {
        const movies = JSON.parse(searchDataElement.textContent || '[]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        const years = Array.from(new Set(movies.map(function (movie) {
            return movie.year;
        }).filter(Boolean))).sort().reverse();

        years.forEach(function (year) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        const createCard = function (movie) {
            const tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card">' +
                '<a class="thumb" href="' + escapeHtml(movie.url) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="play-hover">▶</span>' +
                    '<em>' + escapeHtml(movie.duration) + '</em>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-tags">' + tags + '</div>' +
                    '<div class="movie-meta">' +
                        '<span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>' +
                        '<span>' + escapeHtml(movie.views) + '</span>' +
                    '</div>' +
                '</div>' +
            '</article>';
        };

        const render = function () {
            const keyword = searchInput.value.trim().toLowerCase();
            const category = categoryFilter.value;
            const year = yearFilter.value;

            const matched = movies.filter(function (movie) {
                const haystack = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    movie.tags.join(' ')
                ].join(' ').toLowerCase();

                return (!keyword || haystack.includes(keyword)) &&
                    (!category || movie.category === category) &&
                    (!year || movie.year === year);
            });

            searchSummary.textContent = '找到 ' + matched.length + ' 部影片';
            searchResults.innerHTML = matched.slice(0, 240).map(createCard).join('');

            if (matched.length > 240) {
                searchSummary.textContent += '，当前显示前 240 部，可继续输入关键词缩小范围';
            }
        };

        const escapeHtml = function (value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        [searchInput, categoryFilter, yearFilter].forEach(function (control) {
            control.addEventListener('input', render);
            control.addEventListener('change', render);
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                searchInput.value = '';
                categoryFilter.value = '';
                yearFilter.value = '';
                render();
            });
        }

        render();
    }
})();
