(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
                document.body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }

            function start() {
                stop();
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var grid = document.querySelector("[data-card-grid]");
        var searchInput = document.querySelector("[data-search-input]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var regionFilter = document.querySelector("[data-region-filter]");
        var emptyState = document.querySelector("[data-empty-state]");

        if (grid && (searchInput || yearFilter || typeFilter || regionFilter)) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

            function normalize(text) {
                return (text || "").toLowerCase().trim();
            }

            function applyFilters() {
                var query = normalize(searchInput && searchInput.value);
                var year = yearFilter ? yearFilter.value : "";
                var type = typeFilter ? typeFilter.value : "";
                var region = regionFilter ? regionFilter.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-title"));
                    var match = true;
                    if (query && text.indexOf(query) === -1) {
                        match = false;
                    }
                    if (year && card.getAttribute("data-year") !== year) {
                        match = false;
                    }
                    if (type && card.getAttribute("data-type") !== type) {
                        match = false;
                    }
                    if (region && card.getAttribute("data-region") !== region) {
                        match = false;
                    }
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("show", visible === 0);
                }
            }

            [searchInput, yearFilter, typeFilter, regionFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }

        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-play-button]");
            var loaded = false;

            function loadStream() {
                if (!video || loaded) {
                    return;
                }
                var stream = video.getAttribute("data-stream");
                if (!stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    loaded = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    loaded = true;
                    return;
                }
                video.src = stream;
                loaded = true;
            }

            function play() {
                loadStream();
                if (button) {
                    button.classList.add("hidden");
                }
                var attempt = video && video.play ? video.play() : null;
                if (attempt && attempt.catch) {
                    attempt.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("hidden");
                    }
                });
            }
        });
    });
})();
