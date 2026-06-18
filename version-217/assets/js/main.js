(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        document.body.classList.remove('nav-open');
      }
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        activate(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initSearchFilters() {
    var form = document.querySelector('[data-filter-form]');
    var grid = document.querySelector('[data-search-grid]');

    if (!form || !grid) {
      return;
    }

    var keywordInput = form.querySelector('[data-filter-keyword]');
    var regionSelect = form.querySelector('[data-filter-region]');
    var genreSelect = form.querySelector('[data-filter-genre]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var resultCount = document.querySelector('[data-result-count]');
    var empty = document.querySelector('[data-empty-result]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardGenres = normalize(card.getAttribute('data-genre')).split('|');
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (genre && cardGenres.indexOf(genre) === -1) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = String(visible);
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('reset', function () {
      window.setTimeout(applyFilters, 0);
    });

    applyFilters();
  }

  function initImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var playButton = player.querySelector('[data-play]');
      var status = player.querySelector('[data-player-status]');
      var source = player.getAttribute('data-src');
      var hlsInstance = null;
      var bound = false;

      if (!video || !playButton || !source) {
        return;
      }

      function updateStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function bindSource() {
        if (bound) {
          return Promise.resolve();
        }

        bound = true;
        updateStatus('正在加载播放源，请稍候。');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            updateStatus('播放源已就绪。');
            video.play().catch(function () {
              updateStatus('播放源已就绪，请再次点击播放。');
            });
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              updateStatus('播放加载遇到网络或媒体错误，请刷新后重试。');
            }
          });

          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            updateStatus('播放源已就绪。');
          }, { once: true });
          return Promise.resolve();
        }

        video.src = source;
        updateStatus('当前浏览器未检测到 HLS 解析能力，已尝试直接加载播放源。');
        return Promise.resolve();
      }

      function startPlayback() {
        player.classList.add('is-playing');
        bindSource().then(function () {
          video.play().catch(function () {
            updateStatus('浏览器拦截了自动播放，请点击播放器控制栏继续。');
          });
        });
      }

      playButton.addEventListener('click', startPlayback);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHeroSlider();
    initSearchFilters();
    initImageFallbacks();
    initPlayer();
  });
})();
