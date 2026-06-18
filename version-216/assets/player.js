function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var hlsInstance = null;
  var ready = false;

  function attach() {
    if (ready || !video) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(options.src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    } else {
      video.src = options.src;
    }
    ready = true;
  }

  function play() {
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (!video) {
    return;
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      play();
      return;
    }
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
