(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });
      show(0);
      restart();
    }

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
      var input = form.querySelector('[data-filter-input]');
      var reset = form.querySelector('[data-filter-reset]');
      var scope = form.closest('main') ? form.closest('main').querySelector('[data-filter-scope]') : document;
      if (!input || !scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty-result]');

      function filter() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-type') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      input.addEventListener('input', filter);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filter();
      });
      if (reset) {
        reset.addEventListener('click', function () {
          window.setTimeout(function () {
            input.value = '';
            filter();
          }, 0);
        });
      }
    });
  });
})();
