(function () {
  var CONTENT = {
    audio: { icon: "🎵", label: "음악", title: "음악", desc: "다도실에 흐르는 배경 음악을 재생해요.", action: "재생하기" },
    table: { icon: "⏱️", label: "타이머", title: "다도 타이머", desc: "커피를 내리는 시간을 재는 타이머예요.", action: "타이머 시작" },
    scroll: { icon: "☕", label: "원두 추천", title: "오늘의 커피", desc: "오늘 어울리는 마주온 블렌드를 추천해드려요.", action: "오늘의 커피 보기" }
  };
  var BLENDS = [
    { season: "봄", name: "화담", href: "hwadam.html" },
    { season: "여름", name: "청류", href: "cheongryu.html" },
    { season: "가을", name: "풍연", href: "pungyeon.html" },
    { season: "겨울", name: "설한", href: "seolhan.html" }
  ];
  var TIMER_SECONDS = 240;

  var isDesktop = function () {
    return window.matchMedia("(min-width:721px)").matches;
  };
  function formatTime(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function todaysBlend() {
    var days = Math.floor(Date.now() / 86400000);
    return BLENDS[days % BLENDS.length];
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
    /* desktop: click slides a small hanji-paper drawer down from under the label */
    ".room-hotspot-drawer{width:0;max-height:0;opacity:0;overflow:hidden;margin-top:0;pointer-events:none;transition:max-height .3s ease,opacity .22s ease,margin-top .3s ease,width 0s .3s}" +
    ".room-hotspot-drawer.open{width:210px;max-height:220px;opacity:1;margin-top:8px;pointer-events:auto;transition:max-height .3s ease,opacity .22s ease,margin-top .3s ease}" +
    ".room-hotspot-drawer-inner{position:relative;background:linear-gradient(175deg,#f7f0dc,#eee2c3);border:1px solid #5b4028;border-radius:4px;padding:14px 16px;box-shadow:0 10px 26px rgba(0,0,0,.5);text-align:left}" +
    ".room-hotspot-drawer .drawer-desc{margin:0 0 12px;font-size:12.5px;line-height:1.6;color:#4a3826}" +
    /* mobile bottom sheet */
    ".room-panel-backdrop{position:fixed;inset:0;background:rgba(10,8,6,.18);z-index:5;opacity:0;pointer-events:none;transition:opacity .25s ease}" +
    ".room-panel-backdrop.open{opacity:1;pointer-events:auto}" +
    ".room-panel{position:fixed;left:0;right:0;bottom:0;z-index:6;background:linear-gradient(175deg,#f7f0dc,#eee2c3);color:#2e2013;border-radius:14px 14px 0 0;padding:14px 22px calc(24px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .32s cubic-bezier(.22,.72,.16,1);box-shadow:0 -16px 40px rgba(0,0,0,.5);border:1px solid #5b4028;border-bottom:0;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}" +
    ".room-panel.open{transform:translateY(0)}" +
    ".room-panel-handle{width:36px;height:4px;border-radius:999px;background:rgba(91,64,40,.35);margin:0 auto 16px}" +
    ".room-panel-icon{font-size:28px;line-height:1}" +
    ".room-panel-title{font-size:18px;font-weight:600;margin:12px 0 7px;letter-spacing:.01em;color:#2e2013}" +
    ".room-panel-desc{font-size:14.5px;line-height:1.6;color:#4a3826;margin:0 0 16px}" +
    ".room-panel-close{position:absolute;top:14px;right:16px;background:rgba(91,64,40,.12);border:0;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#5b4028;font-size:19px;line-height:1;cursor:pointer;padding:0}" +
    "@media (min-width:721px){.room-panel,.room-panel-backdrop{display:none}}" +
    /* shared: action button + the live feature states (timer / blend / note),
       reused inside both the mobile sheet and the desktop drawer */
    ".room-action-btn{display:block;width:100%;padding:13px 0;border-radius:999px;border:1px solid #5b4028;background:#2e2013;color:#f7f0dc;font:14px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.04em;cursor:pointer;text-align:center;box-sizing:border-box}" +
    ".room-action-btn:hover{opacity:.85}" +
    ".room-active{display:none}" +
    ".room-active.show{display:block}" +
    ".room-active .room-timer{font-size:34px;font-weight:600;letter-spacing:.02em;text-align:center;margin:2px 0 12px;color:#2e2013;font-variant-numeric:tabular-nums}" +
    ".room-active .room-row{display:flex;gap:8px}" +
    ".room-active .room-row .room-mini-btn{flex:1;padding:10px 0;border-radius:999px;border:1px solid #5b4028;background:transparent;color:#2e2013;font:12.5px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.02em;text-align:center;cursor:pointer}" +
    ".room-active .room-row .room-mini-btn.primary{background:#2e2013;color:#f7f0dc}" +
    ".room-blend{display:flex;align-items:baseline;gap:10px;margin-bottom:12px}" +
    ".room-blend b{font-size:19px;color:#2e2013}" +
    ".room-blend span{font-size:12.5px;color:#7a6650}" +
    ".room-note{font-size:12.5px;color:#7a6650;margin:0 0 12px}" +
    "@media (max-width:720px){.room-hotspot-drawer{display:none}}";
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
    '<div class="room-panel-icon"></div>' +
    '<div class="room-panel-title"></div>' +
    '<p class="room-panel-desc"></p>' +
    '<button class="room-action-btn" type="button"></button>' +
    "</div>" +
    '<div class="room-active"></div>';
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  var defaultView = panel.querySelector(".room-panel-default");
  var activeView = panel.querySelector(".room-active");
  var iconEl = panel.querySelector(".room-panel-icon");
  var titleEl = panel.querySelector(".room-panel-title");
  var descEl = panel.querySelector(".room-panel-desc");
  var actionBtn = panel.querySelector(".room-action-btn");
  var closeBtn = panel.querySelector(".room-panel-close");
  var currentId = null;

  /* ---- shared live-feature state, rendered into whichever container
     (mobile sheet or a desktop drawer) last activated it ---- */
  var timer = { remaining: TIMER_SECONDS, running: false, intervalId: null, target: null };

  function renderInto(container, id) {
    container.innerHTML = "";
    if (id === "table") {
      var t = document.createElement("div");
      t.className = "room-timer";
      t.textContent = formatTime(timer.remaining);
      var row = document.createElement("div");
      row.className = "room-row";
      var toggleBtn = fauxButton("room-mini-btn primary", timer.running ? "일시정지" : "시작");
      var resetBtn = fauxButton("room-mini-btn", "초기화");
      onActivate(toggleBtn, function () { toggleTimer(container); });
      onActivate(resetBtn, function () { resetTimer(container); });
      row.appendChild(toggleBtn);
      row.appendChild(resetBtn);
      container.appendChild(t);
      container.appendChild(row);
    } else if (id === "scroll") {
      var b = todaysBlend();
      var blendRow = document.createElement("div");
      blendRow.className = "room-blend";
      blendRow.innerHTML = "<b>" + b.name + "</b><span>" + b.season + " 블렌드</span>";
      var note = document.createElement("p");
      note.className = "room-note";
      note.textContent = "오늘은 이 한 잔이 어울려요.";
      var link = fauxButton("room-action-btn", "자세히 보기 →");
      onActivate(link, function () { location.href = b.href; });
      container.appendChild(blendRow);
      container.appendChild(note);
      container.appendChild(link);
    } else {
      var audioNote = document.createElement("p");
      audioNote.className = "room-note";
      audioNote.style.margin = "0";
      audioNote.textContent = "🎵 음악은 곧 준비될 예정이에요.";
      container.appendChild(audioNote);
    }
  }
  function toggleTimer(container) {
    timer.target = container;
    if (timer.running) pauseTimer();
    else {
      timer.running = true;
      timer.intervalId = setInterval(tickTimer, 1000);
    }
    renderInto(container, "table");
  }
  function tickTimer() {
    if (timer.remaining <= 0) {
      pauseTimer();
      if (timer.target) renderInto(timer.target, "table");
      return;
    }
    timer.remaining--;
    if (timer.target) renderInto(timer.target, "table");
  }
  function pauseTimer() {
    timer.running = false;
    if (timer.intervalId) clearInterval(timer.intervalId);
    timer.intervalId = null;
  }
  function resetTimer(container) {
    pauseTimer();
    timer.remaining = TIMER_SECONDS;
    renderInto(container, "table");
  }
  function runAction(id, defaultEl, activeEl) {
    defaultEl.style.display = "none";
    activeEl.classList.add("show");
    if (id === "table") timer.target = activeEl;
    renderInto(activeEl, id);
  }

  function closePanel() {
    panel.classList.remove("open");
    backdrop.classList.remove("open");
  }
  function openPanel(id) {
    var c = CONTENT[id];
    if (!c) return;
    currentId = id;
    iconEl.textContent = c.icon;
    titleEl.textContent = c.title;
    descEl.textContent = c.desc;
    actionBtn.textContent = c.action;
    activeView.classList.remove("show");
    defaultView.style.display = "";
    if (id === "table" && (timer.running || timer.remaining !== TIMER_SECONDS)) runAction(id, defaultView, activeView);
    panel.classList.add("open");
    backdrop.classList.add("open");
  }
  actionBtn.addEventListener("click", function () {
    if (currentId) runAction(currentId, defaultView, activeView);
  });
  closeBtn.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);

  /* ---- desktop inline drawer: one per hotspot, lives under its label ---- */
  var openDrawer = null;
  var justOpenedDrawer = false;
  function closeDrawer() {
    if (!openDrawer) return;
    openDrawer.classList.remove("open");
    openDrawer = null;
  }
  function openDrawerFor(btn) {
    var drawer = btn.querySelector(".room-hotspot-drawer");
    if (!drawer) return;
    if (openDrawer && openDrawer !== drawer) closeDrawer();
    var drawerDefault = drawer.querySelector(".drawer-default");
    var drawerActive = drawer.querySelector(".room-active");
    drawerActive.classList.remove("show");
    drawerDefault.style.display = "";
    drawer.classList.add("open");
    openDrawer = drawer;
    /* a click directly on the 3D object (not the small icon) also opens the
       drawer via majuon:select, synchronously, from inside this same click
       event — skip the very next outside-click check so it isn't closed
       again before the user even sees it */
    justOpenedDrawer = true;
  }
  document.addEventListener("click", function (e) {
    if (justOpenedDrawer) {
      justOpenedDrawer = false;
      return;
    }
    if (!openDrawer) return;
    if (openDrawer.contains(e.target)) return;
    if (e.target.closest && e.target.closest(".room-hotspot")) return;
    closeDrawer();
  });

  window.addEventListener("majuon:select", function (e) {
    var id = e.detail && e.detail.id;
    if (!id) return;
    if (isDesktop()) {
      var btn = document.querySelector('.room-hotspot[data-model="' + id + '"]');
      if (btn) openDrawerFor(btn);
    } else {
      openPanel(id);
    }
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
    var hs = window.roomHotspots;
    if (hs && hs.entries) hs.entries.forEach(blinkOutline);
    if (camHint) {
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

      var drawer = document.createElement("div");
      drawer.className = "room-hotspot-drawer";
      drawer.innerHTML =
        '<div class="room-hotspot-drawer-inner">' +
        '<div class="drawer-default">' +
        '<p class="drawer-desc"></p>' +
        '<div class="room-action-btn" role="button" tabindex="0"></div>' +
        "</div>" +
        '<div class="room-active"></div>' +
        "</div>";
      drawer.querySelector(".drawer-desc").textContent = c.desc;
      var drawerDefault = drawer.querySelector(".drawer-default");
      var drawerActive = drawer.querySelector(".room-active");
      var drawerActionEl = drawerDefault.querySelector(".room-action-btn");
      drawerActionEl.textContent = c.action;
      var modelId = btn.dataset.model;
      onActivate(drawerActionEl, function () {
        runAction(modelId, drawerDefault, drawerActive);
      });
      info.appendChild(drawer);

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
