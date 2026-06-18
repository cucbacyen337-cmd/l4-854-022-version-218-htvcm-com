(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', opened);
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                start();
            });
        });

        activate(0);
        start();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var type = scope.querySelector('[data-filter-type]');
        var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-item'));
        var empty = scope.querySelector('[data-filter-empty]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;

            items.forEach(function (item) {
                var text = normalize(item.getAttribute('data-search'));
                var itemYear = normalize(item.getAttribute('data-year'));
                var itemType = normalize(item.getAttribute('data-type'));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && itemYear !== yearValue) {
                    matched = false;
                }
                if (typeValue && itemType !== typeValue) {
                    matched = false;
                }

                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var field = form.querySelector('input');
            var query = encodeURIComponent(field ? field.value.trim() : '');
            var target = form.getAttribute('data-search-target') || './search.html';
            location.href = target + (query ? '?q=' + query : '');
        });
    });

    var searchInput = document.querySelector('[data-filter-input]');
    if (searchInput && location.search.indexOf('q=') !== -1) {
        var params = new URLSearchParams(location.search);
        var query = params.get('q');
        if (query) {
            searchInput.value = query;
            searchInput.dispatchEvent(new Event('input'));
        }
    }
}());

function initPlayer(playbackUrl) {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('[data-player-cover]');
    var attached = false;
    var hlsInstance = null;

    if (!video || !playbackUrl) {
        return;
    }

    function hideCover() {
        if (cover) {
            cover.classList.add('is-hidden');
            setTimeout(function () {
                cover.hidden = true;
            }, 260);
        }
    }

    function startPlayback() {
        hideCover();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function attachSource() {
        if (attached) {
            startPlayback();
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playbackUrl;
            startPlayback();
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(playbackUrl);
            hlsInstance.attachMedia(video);
            startPlayback();
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                startPlayback();
            });
            return;
        }

        video.src = playbackUrl;
        startPlayback();
    }

    if (cover) {
        cover.addEventListener('click', attachSource);
    }

    video.addEventListener('click', function () {
        if (!attached) {
            attachSource();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
