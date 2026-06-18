(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var title = document.querySelector('[data-hero-title]');
    var summary = document.querySelector('[data-hero-summary]');
    var meta = document.querySelector('[data-hero-meta]');
    var link = document.querySelector('[data-hero-link]');
    var poster = document.querySelector('[data-hero-poster]');

    if (!slides.length || !title || !summary || !meta || !link || !poster) {
      return;
    }

    var current = 0;

    function show(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });

      var active = slides[index];
      title.textContent = active.getAttribute('data-title') || '';
      summary.textContent = active.getAttribute('data-summary') || '';
      link.href = active.getAttribute('data-link') || '#';
      poster.href = active.getAttribute('data-link') || '#';
      poster.querySelector('img').src = active.getAttribute('data-poster') || '';
      poster.querySelector('img').alt = (active.getAttribute('data-title') || '影片') + ' 海报';
      meta.innerHTML = '';
      ['year', 'region', 'genre'].forEach(function (key) {
        var value = active.getAttribute('data-' + key);
        if (value) {
          var chip = document.createElement('span');
          chip.textContent = value;
          meta.appendChild(chip);
        }
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    show(0);
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initStaticFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-static-filter]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
      var scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
      var count = document.querySelector(panel.getAttribute('data-count-target') || '');
      var empty = document.querySelector(panel.getAttribute('data-empty-target') || '');

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var visible = 0;
        var activeSelects = selects.map(function (select) {
          return {
            field: select.getAttribute('data-field'),
            value: normalize(select.value)
          };
        });

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type')
          ].join(' '));
          var matched = !keyword || haystack.indexOf(keyword) !== -1;

          activeSelects.forEach(function (item) {
            if (!item.value || !matched) {
              return;
            }
            var fieldValue = normalize(card.getAttribute('data-' + item.field));
            if (fieldValue.indexOf(item.value) === -1) {
              matched = false;
            }
          });

          card.classList.toggle('hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible;
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  function cardTemplate(movie) {
    var image = './' + movie.image + '.jpg';
    var tags = String(movie.tags || movie.genre || '').split(/[,，、/]+/).filter(Boolean).slice(0, 3);
    var tagHtml = tags.map(function (tag) {
      return '<span>' + escapeHtml(tag.trim()) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-filter-card>' +
      '  <a class="card-thumb" href="detail/' + movie.slug + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
      '    <img src="' + image + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.style.display=\'none\'; this.parentElement.classList.add(\'poster-fallback\');">' +
      '    <span class="card-gradient"></span>' +
      '    <span class="play-badge" aria-hidden="true">▶</span>' +
      '    <span class="card-year">' + escapeHtml(movie.year) + '</span>' +
      '  </a>' +
      '  <div class="card-body">' +
      '    <a class="card-title" href="detail/' + movie.slug + '.html">' + escapeHtml(movie.title) + '</a>' +
      '    <p class="card-desc">' + escapeHtml(movie.one_line || movie.summary || '') + '</p>' +
      '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '    <div class="card-tags">' + tagHtml + '</div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function uniqueValues(data, key) {
    var map = Object.create(null);
    data.forEach(function (item) {
      var value = String(item[key] || '').trim();
      if (value) {
        map[value] = true;
      }
    });
    return Object.keys(map).sort(function (a, b) {
      return String(a).localeCompare(String(b), 'zh-CN');
    });
  }

  function fillSelect(select, values, label) {
    if (!select) {
      return;
    }
    select.innerHTML = '<option value="">' + label + '</option>';
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.MOVIE_DATA) {
      return;
    }

    var input = root.querySelector('[data-search-input]');
    var typeSelect = root.querySelector('[data-search-type]');
    var regionSelect = root.querySelector('[data-search-region]');
    var yearSelect = root.querySelector('[data-search-year]');
    var categorySelect = root.querySelector('[data-search-category]');
    var result = root.querySelector('[data-search-results]');
    var count = root.querySelector('[data-search-count]');
    var data = window.MOVIE_DATA;

    fillSelect(typeSelect, uniqueValues(data, 'type'), '全部类型');
    fillSelect(regionSelect, uniqueValues(data, 'region').slice(0, 80), '全部地区');
    fillSelect(yearSelect, uniqueValues(data, 'year').reverse(), '全部年份');
    fillSelect(categorySelect, uniqueValues(data, 'category_name'), '全部栏目');

    function apply() {
      var keyword = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var filtered = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.one_line,
          movie.summary,
          movie.category_name
        ].join(' '));
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (type && normalize(movie.type) !== type) {
          return false;
        }
        if (region && normalize(movie.region) !== region) {
          return false;
        }
        if (year && normalize(movie.year) !== year) {
          return false;
        }
        if (category && normalize(movie.category_name) !== category) {
          return false;
        }
        return true;
      });

      var shouldLimit = !keyword && !type && !region && !year && !category;
      var rendered = shouldLimit ? filtered.slice(0, 80) : filtered.slice(0, 300);
      count.textContent = filtered.length;
      result.innerHTML = rendered.map(cardTemplate).join('');
      if (filtered.length > rendered.length) {
        result.insertAdjacentHTML('afterend', '<p class="result-note" data-temp-note>已显示前 ' + rendered.length + ' 条结果，可继续输入关键词缩小范围。</p>');
      }
      Array.prototype.slice.call(document.querySelectorAll('[data-temp-note]')).slice(0, -1).forEach(function (node) {
        node.remove();
      });
    }

    [input, typeSelect, regionSelect, yearSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply);
    });
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var start = box.querySelector('[data-player-start]');
      var status = box.querySelector('[data-player-status]');
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function useFallback() {
        var fallback = video.getAttribute('data-fallback');
        if (fallback) {
          video.src = fallback;
          setStatus('使用 MP4 备用播放源');
          return true;
        }
        return false;
      }

      function initialize() {
        if (initialized || !video) {
          return;
        }
        initialized = true;
        var source = video.getAttribute('data-src');
        setStatus('正在初始化 HLS 播放源');

        if (source && window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            box.classList.add('is-ready');
            setStatus('播放源就绪');
            video.play().catch(function () {
              setStatus('点击视频继续播放');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              if (useFallback()) {
                box.classList.add('is-ready');
                video.play().catch(function () {
                  setStatus('点击视频继续播放');
                });
              } else {
                setStatus('播放源加载失败');
              }
            }
          });
        } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          box.classList.add('is-ready');
          video.play().catch(function () {
            setStatus('点击视频继续播放');
          });
        } else if (useFallback()) {
          box.classList.add('is-ready');
          video.play().catch(function () {
            setStatus('点击视频继续播放');
          });
        } else {
          setStatus('当前浏览器不支持该播放源');
        }
      }

      if (start) {
        start.addEventListener('click', initialize);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!initialized) {
            initialize();
            return;
          }
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        });
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initStaticFilters();
    initSearchPage();
    initPlayers();
  });
}());
