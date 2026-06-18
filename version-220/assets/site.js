(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
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

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function applySearch() {
    if (!searchInput) {
      return;
    }

    var query = searchInput.value.trim().toLowerCase();

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();

      card.classList.toggle('hidden-by-search', query.length > 0 && haystack.indexOf(query) === -1);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));

  function inYearGroup(year, group) {
    if (group === 'all') {
      return true;
    }

    if (group === '2025plus') {
      return year >= 2025;
    }

    if (group === '2024') {
      return year === 2024;
    }

    if (group === '2020s') {
      return year >= 2020 && year <= 2023;
    }

    if (group === '2010s') {
      return year >= 2010 && year <= 2019;
    }

    if (group === 'older') {
      return year > 0 && year < 2010;
    }

    return true;
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.getAttribute('data-year-filter') || 'all';

      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      cards.forEach(function (card) {
        var year = parseInt(card.getAttribute('data-year') || '0', 10);
        card.classList.toggle('hidden-by-filter', !inYearGroup(year, group));
      });
    });
  });

  var video = document.querySelector('[data-video-player]');
  var playButton = document.querySelector('[data-play-button]');
  var startButtons = Array.prototype.slice.call(document.querySelectorAll('[data-start-play]'));
  var playLayer = document.querySelector('[data-play-layer]');
  var streamUrl = window.__playUrl || '';
  var playerReady = false;
  var hlsInstance = null;

  function preparePlayer() {
    if (!video || playerReady || !streamUrl) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }

    playerReady = true;
  }

  function startPlayer() {
    if (!video) {
      return;
    }

    preparePlayer();

    if (playLayer) {
      playLayer.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (playLayer) {
          playLayer.classList.remove('is-hidden');
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayer);
  }

  startButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      startPlayer();
      if (video) {
        video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  if (playLayer) {
    playLayer.addEventListener('click', function (event) {
      if (event.target === playLayer) {
        startPlayer();
      }
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (playLayer) {
        playLayer.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && playLayer) {
        playLayer.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
