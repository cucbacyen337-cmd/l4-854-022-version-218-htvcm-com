(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.hasAttribute("hidden");
      if (open) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
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
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var stream = video ? video.getAttribute("data-stream") : "";
      var toggles = Array.prototype.slice.call(shell.querySelectorAll("[data-player-toggle]"));
      var mute = shell.querySelector("[data-player-mute]");
      var fullscreen = shell.querySelector("[data-player-fullscreen]");
      var hls = null;

      if (!video || !stream) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      function playOrPause() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }

      toggles.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playOrPause();
        });
      });

      video.addEventListener("click", playOrPause);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        toggles.forEach(function (button) {
          if (button.textContent.trim() === "▶") {
            button.textContent = "Ⅱ";
          }
        });
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
        toggles.forEach(function (button) {
          if (button.textContent.trim() === "Ⅱ") {
            button.textContent = "▶";
          }
        });
      });

      if (mute) {
        mute.addEventListener("click", function () {
          video.muted = !video.muted;
          mute.textContent = video.muted ? "有声" : "静音";
        });
      }

      if (fullscreen) {
        fullscreen.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (shell.requestFullscreen) {
            shell.requestFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initGridFilter() {
    var panel = document.querySelector("[data-grid-filter]");
    if (!panel) {
      return;
    }
    var text = panel.querySelector("[data-filter-text]");
    var category = panel.querySelector("[data-filter-category]");
    var year = panel.querySelector("[data-filter-year]");
    var sort = panel.querySelector("[data-filter-sort]");
    var grid = panel.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var keyword = text ? text.value.trim().toLowerCase() : "";
      var cat = category ? category.value : "";
      var yr = year ? year.value : "";
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var okText = !keyword || title.indexOf(keyword) >= 0 || card.textContent.toLowerCase().indexOf(keyword) >= 0;
        var okCat = !cat || card.getAttribute("data-category") === cat;
        var okYear = !yr || card.getAttribute("data-year") === yr;
        card.classList.toggle("is-hidden", !(okText && okCat && okYear));
      });
      if (sort && sort.value !== "default") {
        var visible = cards.slice().sort(function (a, b) {
          if (sort.value === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (sort.value === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          return 0;
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    [text, category, year, sort].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    if (!input || !results || !window.siteSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function card(item) {
      return [
        '<article class="movie-card">',
        '<a class="movie-card-cover" href="' + item.url + '">',
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="movie-card-play">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.desc) + '</p>',
        '<div class="movie-card-meta"><span>' + item.year + '年</span><span>★ ' + Number(item.rating).toFixed(1) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>'"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[char];
      });
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        if (summary) {
          summary.textContent = "输入关键词后显示匹配影片。";
        }
        return;
      }
      var matches = window.siteSearchData.filter(function (item) {
        return item.text.toLowerCase().indexOf(q) >= 0;
      }).slice(0, 80);
      if (summary) {
        summary.textContent = matches.length ? "已找到匹配影片，点击卡片进入详情。" : "未找到匹配影片。";
      }
      results.innerHTML = matches.length ? matches.map(card).join("") : "";
    }

    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initPlayers();
    initGridFilter();
    initSearchPage();
  });
})();
