(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textValue(element) {
    return (element && element.value ? element.value : "").trim().toLowerCase();
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    var result = document.querySelector("[data-filter-results]");
    if (!form || !result) {
      return;
    }
    var input = form.querySelector("[data-filter-text]");
    var region = form.querySelector("[data-filter-region]");
    var year = form.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(result.querySelectorAll(".movie-card"));

    function apply() {
      var q = textValue(input);
      var r = textValue(region);
      var y = textValue(year);
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-tags") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (r && (card.getAttribute("data-region") || "").toLowerCase() !== r) {
          matched = false;
        }
        if (y && (card.getAttribute("data-year") || "").toLowerCase() !== y) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function cardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-thumb\" href=\"" + escapeHtml(movie.file) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\">",
      "<span class=\"movie-score\">" + escapeHtml(movie.rating) + "</span>",
      "</a>",
      "<div class=\"movie-body\">",
      "<div class=\"movie-meta\"><a href=\"" + escapeHtml(movie.categoryFile) + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
      "<h3><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.line) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function setupSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !Array.isArray(globalThis.MOVIES)) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var category = page.querySelector("[data-search-category]");
    var button = page.querySelector("[data-search-button]");
    var status = page.querySelector("[data-search-status]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render() {
      var q = textValue(input);
      var c = textValue(category);
      var list = globalThis.MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.year, movie.category, movie.genre, movie.line, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (c && String(movie.category || "").toLowerCase() !== c) {
          return false;
        }
        return true;
      });
      var sliced = list.slice(0, 120);
      results.innerHTML = sliced.map(cardHtml).join("");
      status.textContent = list.length ? "找到 " + list.length + " 部相关影片" : "未找到相关影片";
    }

    if (button) {
      button.addEventListener("click", render);
    }
    [input, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  globalThis.initMoviePlayer = function (source) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    if (!video || !source) {
      return;
    }
    var bound = false;

    function bind() {
      if (bound) {
        return;
      }
      bound = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
        var hls = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      bind();
      shell.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    bind();

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
  });
})();
