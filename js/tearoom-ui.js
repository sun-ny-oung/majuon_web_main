(function () {
  var CONTENT = {
    audio: { label: "음악", title: "음악", desc: "다도실에 흐르는 배경 음악이에요. 플레이리스트를 확인해보세요.", action: "플레이리스트 보기" },
    table: { label: "타이머", title: "다도 타이머", desc: "커피를 내리는 시간을 재는 타이머예요.", action: "타이머 시작" },
    scroll: { label: "원두 추천", title: "오늘의 커피", desc: "기분이나 취향을 알려주면 어울리는 블렌드를 골라드려요.", action: "커피 추천받기" }
  };
  var BLENDS = [
    { season: "봄", name: "화담", href: "hwadam.html" },
    { season: "여름", name: "청류", href: "cheongryu.html" },
    { season: "가을", name: "풍연", href: "pungyeon.html" },
    { season: "겨울", name: "설한", href: "seolhan.html" }
  ];
  var BLEND_REASON = {
    화담: "포근하고 부드러운 산미가 편안한 순간에 잘 어울려요.",
    청류: "청량하고 깔끔한 여운이 산뜻한 기분과 잘 맞아요.",
    풍연: "묵직하고 향긋한 바디감이 차분한 시간에 어울려요.",
    설한: "진하고 따뜻한 여운이 쌀쌀한 기분을 감싸줘요."
  };
  /* TODO: 실제 백엔드(LLM API)가 준비되면 이 함수를 fetch 호출로 교체하면 됩니다.
     지금은 UI 검증용 임시 채점 로직으로, 입력한 글자에 따라 점수가 달라지긴 하지만
     실제 의미를 이해하는 건 아닙니다. */
  function mockScoreBlends(text) {
    var seed = 0;
    for (var i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
    var scored = BLENDS.map(function (b, i) {
      var s = seed || 7;
      for (var j = 0; j < b.name.length; j++) s = (s * 33 + b.name.charCodeAt(j) + i * 17) >>> 0;
      return { blend: b, raw: (s % 61) + 20 };
    });
    var total = scored.reduce(function (a, s) { return a + s.raw; }, 0);
    scored.forEach(function (s) { s.score = Math.round((s.raw / total) * 100); });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored;
  }
  /* 새 곡을 추가하려면 이 배열에 한 줄만 더하면 됩니다.
     thumb 이미지가 아직 없으면 자동으로 음표 아이콘으로 대체됩니다. */
  var PLAYLIST = [
    { title: "Spring Reverie", src: "assets/audio/tearoom/spring-reverie.mp3", thumb: "assets/audio/tearoom/thumbs/spring-reverie.jpg" },
    { title: "매화의 계절", src: "assets/audio/tearoom/maehwa-season.mp3", thumb: "assets/audio/tearoom/thumbs/maehwa-season.jpg" }
  ];
  var currentTrack = 0;
  function musicEl() {
    return document.getElementById("roomMusic");
  }
  function isPlaying() {
    var m = musicEl();
    return !!m && !m.paused && !m.ended;
  }
  function playTrack(idx) {
    var t = PLAYLIST[idx];
    var music = musicEl();
    if (!t || !music) return;
    currentTrack = idx;
    if (music.getAttribute("src") !== t.src) music.src = t.src;
    music.volume = 0.55;
    music.play().catch(function () {});
  }
  function togglePlayback() {
    var music = musicEl();
    if (!music) return;
    if (music.paused) music.play().catch(function () {});
    else music.pause();
  }
  function refreshPlaylistEl(list) {
    var parent = list.parentNode;
    if (parent) parent.replaceChild(buildPlaylistEl(), list);
  }
  function buildPlaylistEl() {
    var list = document.createElement("div");
    list.className = "room-playlist";
    /* now-playing track first, so the collapsed (peek) height always shows it */
    var order = [currentTrack].concat(
      PLAYLIST.map(function (_, i) { return i; }).filter(function (i) { return i !== currentTrack; })
    );
    order.forEach(function (idx) {
      var t = PLAYLIST[idx];
      var row = document.createElement("div");
      row.className = "room-playlist-track" + (idx === currentTrack ? " playing" : "");
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      var eqOrPlay =
        idx !== currentTrack
          ? ""
          : isPlaying()
          ? '<span class="track-eq"><i></i><i></i><i></i></span>'
          : '<span class="track-playicon">▶</span>';
      row.innerHTML =
        '<span class="track-thumb-wrap"><span class="track-thumb-fallback"></span><img class="track-thumb" alt="" src="' + t.thumb + '" onerror="this.style.display=\'none\'"></span>' +
        eqOrPlay +
        '<span class="track-name">' + t.title + "</span>";
      onActivate(row, function () {
        if (idx === currentTrack) {
          togglePlayback();
          refreshPlaylistEl(list);
          return;
        }
        playTrack(idx);
        refreshPlaylistEl(list);
      });
      list.appendChild(row);
    });
    return list;
  }
  function fauxButton(cls, text) {
    var el = document.createElement("div");
    el.className = cls;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.textContent = text;
    return el;
  }
  function onActivate(el, fn) {
    el.addEventListener("click", fn);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    });
  }

  var style = document.createElement("style");
  style.textContent =
    /* short always-on label under the hotspot icon */
    ".room-hotspot-info{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;display:flex;flex-direction:column;align-items:center;pointer-events:none}" +
    ".room-hotspot-label{color:#fffaf0;font:12px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.02em;text-shadow:0 1px 4px rgba(0,0,0,.65);white-space:nowrap}" +
    /* shared panel (mobile bottom sheet / desktop centered card) */
    ".room-panel-backdrop{position:fixed;inset:0;background:rgba(10,8,6,.18);z-index:5;opacity:0;pointer-events:none;transition:opacity .25s ease}" +
    ".room-panel-backdrop.open{opacity:1;pointer-events:auto}" +
    ".room-panel{position:fixed;left:0;right:0;bottom:0;z-index:6;background:linear-gradient(175deg,#f7f0dc,#eee2c3);color:#2e2013;border-radius:14px 14px 0 0;padding:14px 22px calc(24px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .32s cubic-bezier(.22,.72,.16,1);box-shadow:0 -16px 40px rgba(0,0,0,.5);border:1px solid #5b4028;border-bottom:0;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}" +
    ".room-panel.open{transform:translateY(0)}" +
    /* the drag handle only means anything once a playlist can be expanded */
    ".room-panel-handle{display:none;width:100%;height:28px;align-items:center;justify-content:center;margin:-8px 0 8px;cursor:grab;touch-action:none}" +
    ".room-panel.has-drag .room-panel-handle{display:flex}" +
    ".room-panel-handle::after{content:'';width:44px;height:4px;border-radius:999px;background:rgba(91,64,40,.4)}" +
    ".room-panel-title{font-size:18px;font-weight:600;margin:12px 0 7px;letter-spacing:.01em;color:#2e2013}" +
    ".room-panel-desc{font-size:14.5px;line-height:1.6;color:#4a3826;margin:0 0 16px}" +
    ".room-panel-close{position:absolute;top:12px;right:14px;background:rgba(91,64,40,.12);border:0;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:#5b4028;font-size:14px;line-height:1;cursor:pointer;padding:0}" +
    "@media (min-width:721px){.room-panel,.room-panel-backdrop{display:none}" +
    /* on desktop the (mobile-hidden) bottom sheet is replaced by this
       screen-centered card, always in the same spot for every hotspot */
    ".room-panel.cinematic{display:block;left:50%;right:auto;bottom:36px;transform:translateX(-50%) translateY(14px);width:320px;border-radius:14px;border-bottom:1px solid #5b4028;padding-top:34px;opacity:0;transition:transform .3s ease,opacity .3s ease,max-height .3s ease}" +
    ".room-panel.cinematic.open{transform:translateX(-50%) translateY(0);opacity:1}" +
    ".room-panel.cinematic .room-panel-handle{margin:-14px 0 6px}" +
    ".room-panel.cinematic .room-panel-close{top:8px;right:10px}}" +
    ".room-panel.expanded .room-playlist{max-height:280px;overflow-y:auto}" +
    /* shared: action button + the live feature states (timer / blend / note) */
    ".room-action-btn{display:block;width:100%;padding:13px 0;border-radius:999px;border:1px solid #5b4028;background:#2e2013;color:#f7f0dc;font:14px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.04em;cursor:pointer;text-align:center;box-sizing:border-box}" +
    ".room-action-btn:hover{opacity:.85}" +
    ".room-active{display:none}" +
    ".room-active.show{display:block}" +
    ".room-note{font-size:12.5px;color:#7a6650;margin:0 0 12px}" +
    ".bean-input{display:block;width:100%;box-sizing:border-box;resize:none;border:1px solid #5b4028;border-radius:8px;background:rgba(255,255,255,.4);color:#2e2013;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;padding:10px 12px;margin:0 0 10px}" +
    ".bean-input:focus{outline:none;border-color:#2e2013}" +
    ".bean-loading{position:relative}" +
    ".bean-loading::after{content:'';display:inline-block;width:4px;height:4px;margin-left:4px;border-radius:50%;background:#7a6650;animation:bean-loading-dot 1s ease-in-out infinite}" +
    "@keyframes bean-loading-dot{0%,100%{opacity:.25}50%{opacity:1}}" +
    ".bean-rank{display:flex;flex-direction:column;gap:12px;margin-bottom:14px}" +
    ".bean-rank-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px}" +
    ".bean-rank-name{font-size:14px;font-weight:600;color:#2e2013}" +
    ".bean-rank-pct{font-size:12px;color:#7a6650}" +
    ".bean-score-bar{height:5px;border-radius:999px;background:rgba(91,64,40,.15);overflow:hidden}" +
    ".bean-score-fill{height:100%;background:#a98a63;border-radius:999px;transition:width .6s ease}" +
    ".bean-rank-row.top .bean-rank-name{font-size:15.5px}" +
    ".bean-rank-row.top .bean-score-fill{background:#2e2013}" +
    ".bean-reason{margin:5px 0 0;font-size:12px;line-height:1.5;color:#7a6650}" +
    ".bean-retry{display:block;text-align:center;font-size:12.5px;color:#7a6650;text-decoration:underline;cursor:pointer;padding-top:2px}" +
    ".room-playlist{margin-bottom:12px;display:flex;flex-direction:column;gap:6px;max-height:52px;overflow:hidden;transition:max-height .3s ease}" +
    ".room-playlist-track{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #5b4028;border-radius:6px;background:rgba(91,64,40,.04);cursor:pointer}" +
    ".room-playlist-track.playing{background:rgba(91,64,40,.14)}" +
    ".room-playlist-track .track-name{font-size:12.5px;color:#2e2013;flex:1;min-width:0;text-align:left}" +
    ".track-thumb-wrap{position:relative;width:32px;height:32px;flex:none;border-radius:4px;overflow:hidden;background:#5b4028}" +
    ".track-thumb-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px}" +
    ".track-thumb{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
    ".track-eq{display:flex;align-items:flex-end;gap:2px;height:14px;flex:none}" +
    ".track-eq i{display:block;width:3px;background:#5b4028;border-radius:1px;height:4px;animation:eq-bounce 1s ease-in-out infinite}" +
    ".track-eq i:nth-child(2){animation-delay:.2s}" +
    ".track-eq i:nth-child(3){animation-delay:.4s}" +
    "@keyframes eq-bounce{0%,100%{height:4px}50%{height:14px}}" +
    ".track-playicon{flex:none;font-size:11px;color:#5b4028;line-height:1}";
  document.head.appendChild(style);

  /* ---- mobile bottom sheet (unchanged shell, contents now shared) ---- */
  var backdrop = document.createElement("div");
  backdrop.className = "room-panel-backdrop";
  var panel = document.createElement("div");
  panel.className = "room-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-live", "polite");
  panel.innerHTML =
    '<div class="room-panel-handle"></div>' +
    '<button class="room-panel-close" aria-label="닫기" type="button">&times;</button>' +
    '<div class="room-panel-default">' +
    '<div class="room-panel-title"></div>' +
    '<p class="room-panel-desc"></p>' +
    '<button class="room-action-btn" type="button"></button>' +
    "</div>" +
    '<div class="room-active"></div>';
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  var defaultView = panel.querySelector(".room-panel-default");
  var activeView = panel.querySelector(".room-active");
  var titleEl = panel.querySelector(".room-panel-title");
  var descEl = panel.querySelector(".room-panel-desc");
  var actionBtn = panel.querySelector(".room-action-btn");
  var closeBtn = panel.querySelector(".room-panel-close");
  var currentId = null;
  var audioArriveGen = 0;

  /* ---- shared live-feature state, rendered into the panel's active view ---- */
  function renderInto(container, id) {
    container.innerHTML = "";
    if (id === "scroll") {
      var prompt = document.createElement("p");
      prompt.className = "room-note";
      prompt.style.margin = "0 0 10px";
      prompt.textContent = "오늘 기분, 원하는 맛, 날씨, 먹고 싶은 디저트를 적어보세요.";
      var textarea = document.createElement("textarea");
      textarea.className = "bean-input";
      textarea.rows = 3;
      textarea.placeholder = "예: 쌀쌀하고 나른한 오후, 달콤한 디저트랑 같이";
      var submit = fauxButton("room-action-btn", "추천받기");
      container.appendChild(prompt);
      container.appendChild(textarea);
      container.appendChild(submit);
      onActivate(submit, function () {
        var text = textarea.value.trim();
        if (!text) { textarea.focus(); return; }
        renderBeanLoading(container, text);
      });
    } else if (id === "audio") {
      var myGen = ++audioArriveGen;
      if (window.tearoomCamera) window.tearoomCamera.flyToAudio();
      window.addEventListener(
        "majuon:cam-arrived",
        function () {
          if (myGen !== audioArriveGen) return;
          container.innerHTML = "";
          panel.classList.add("has-drag");
          var list = buildPlaylistEl();
          var back = fauxButton("room-action-btn", "뒤로가기");
          onActivate(back, closePanel);
          container.appendChild(list);
          container.appendChild(back);
        },
        { once: true }
      );
    }
  }
  function renderBeanLoading(container, text) {
    container.innerHTML = "";
    var loading = document.createElement("p");
    loading.className = "room-note bean-loading";
    loading.textContent = "취향을 살펴보는 중…";
    container.appendChild(loading);
    /* TODO: 실제 연동 시 이 setTimeout 대신 백엔드(fetch) 응답을 기다리면 됩니다. */
    setTimeout(function () {
      renderBeanResult(container, text);
    }, 900);
  }
  function renderBeanResult(container, text) {
    container.innerHTML = "";
    var scored = mockScoreBlends(text);
    var list = document.createElement("div");
    list.className = "bean-rank";
    scored.forEach(function (s, i) {
      var row = document.createElement("div");
      row.className = "bean-rank-row" + (i === 0 ? " top" : "");
      row.innerHTML =
        '<div class="bean-rank-head"><span class="bean-rank-name">' + s.blend.name + "</span>" +
        '<span class="bean-rank-pct">' + s.score + '%</span></div>' +
        '<div class="bean-score-bar"><div class="bean-score-fill" style="width:' + s.score + '%"></div></div>' +
        '<p class="bean-reason">' + (BLEND_REASON[s.blend.name] || "") + "</p>";
      list.appendChild(row);
    });
    container.appendChild(list);
    var link = fauxButton("room-action-btn", scored[0].blend.name + " 자세히 보기 →");
    onActivate(link, function () { location.href = scored[0].blend.href; });
    container.appendChild(link);
    var retry = fauxButton("bean-retry", "다시 물어보기");
    onActivate(retry, function () { renderInto(container, "scroll"); });
    container.appendChild(retry);
  }
  function runAction(id, defaultEl, activeEl) {
    /* the real dripping timer lives on its own 3D page (own renderer/canvas) */
    if (id === "table") {
      location.href = "timer.html";
      return;
    }
    defaultEl.style.display = "none";
    activeEl.classList.add("show");
    renderInto(activeEl, id);
  }

  function closePanel() {
    panel.classList.remove("open");
    panel.classList.remove("expanded");
    panel.classList.remove("has-drag");
    backdrop.classList.remove("open");
    if (window.tearoomCamera && window.tearoomCamera.isAway()) window.tearoomCamera.flyBack();
  }
  function openPanel(id) {
    var c = CONTENT[id];
    if (!c) return;
    currentId = id;
    titleEl.textContent = c.title;
    descEl.textContent = c.desc;
    actionBtn.textContent = c.action;
    activeView.classList.remove("show");
    defaultView.style.display = "";
    panel.classList.remove("has-drag");
    panel.classList.add("cinematic");
    panel.classList.add("open");
    backdrop.classList.add("open");
  }
  actionBtn.addEventListener("click", function () {
    if (currentId) runAction(currentId, defaultView, activeView);
  });
  closeBtn.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);
  /* drag the handle up to reveal the full song list, down to collapse it
     back to just the now-playing row */
  var handleEl = panel.querySelector(".room-panel-handle");
  var dragStartY = null;
  handleEl.addEventListener("pointerdown", function (e) {
    dragStartY = e.clientY;
    handleEl.setPointerCapture(e.pointerId);
  });
  handleEl.addEventListener("pointermove", function (e) {
    if (dragStartY === null) return;
    var delta = dragStartY - e.clientY;
    if (delta > 14) panel.classList.add("expanded");
    else if (delta < -14) panel.classList.remove("expanded");
  });
  handleEl.addEventListener("pointerup", function () {
    dragStartY = null;
  });
  /* escape hatch: if anything ever leaves the camera stuck away from the
     normal view, Esc always gets it back */
  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closePanel();
    if (window.tearoomCamera) window.tearoomCamera.reset();
  });
  /* double-click on the canvas is also how users back out of the
     camera-fly-in shot (tearoom.js dispatches this when it happens) */
  window.addEventListener("majuon:exit", closePanel);

  window.addEventListener("majuon:select", function (e) {
    var id = e.detail && e.detail.id;
    if (!id) return;
    /* while the camera is away at the audio shot, ignore other hotspots so
       their panel content never shows against the wrong camera framing */
    if (id !== "audio" && window.tearoomCamera && window.tearoomCamera.isAway()) return;
    openPanel(id);
    /* clicking the object itself does exactly what "플레이리스트 보기" does */
    if (id === "audio") runAction(id, defaultView, activeView);
  });

  /* --- first-time onboarding: nudge attention to the hotspots, and
     explain camera controls, right after the intro is dismissed --- */
  var roomEntered = false;
  var camHint = document.getElementById("roomCamHint");
  function hideCamHint() {
    if (camHint) camHint.classList.remove("show");
  }
  function findEntry(key) {
    var hs = window.roomHotspots;
    return hs && hs.entries && hs.entries.find(function (en) { return en.key === key; });
  }
  function blinkOutline(entry) {
    if (entry && entry.path) entry.path.classList.add("octagon-blink");
  }
  function stopBlink(entry) {
    if (entry && entry.path) entry.path.classList.remove("octagon-blink");
  }
  window.addEventListener("majuon:enter", function () {
    roomEntered = true;
    playTrack(0);
    var hs = window.roomHotspots;
    if (hs && hs.entries) hs.entries.forEach(blinkOutline);
    if (camHint) {
      camHint.textContent = window.matchMedia("(min-width:721px)").matches
        ? "마우스로 카메라를 움직여 보세요"
        : "드래그해서 둘러보기 · 손가락 두 개로 확대·축소";
      camHint.classList.add("show");
      setTimeout(hideCamHint, 5000);
      window.addEventListener("pointerdown", hideCamHint, { once: true });
    }
  });

  function setupHotspots() {
    var buttons = document.querySelectorAll(".room-hotspot");
    if (!buttons.length) return false;
    buttons.forEach(function (btn) {
      if (btn.dataset.uiReady) return;
      var c = CONTENT[btn.dataset.model];
      if (!c) return;
      btn.dataset.uiReady = "1";
      var entry = findEntry(btn.dataset.model);
      if (roomEntered) blinkOutline(entry);
      btn.addEventListener("mouseenter", function () { stopBlink(entry); }, { once: true });
      btn.addEventListener("click", function () { stopBlink(entry); }, { once: true });

      var info = document.createElement("div");
      info.className = "room-hotspot-info";
      var label = document.createElement("span");
      label.className = "room-hotspot-label";
      label.textContent = c.label;
      info.appendChild(label);

      btn.appendChild(info);
    });
    return true;
  }
  var tries = 0;
  var poll = setInterval(function () {
    tries++;
    if (setupHotspots() || tries > 100) clearInterval(poll);
  }, 100);
})();
