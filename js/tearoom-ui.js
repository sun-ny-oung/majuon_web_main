(function () {
  var CONTENT = {
    audio: { icon: "🎵", label: "음악", title: "음악", desc: "다도실에 흐르는 배경 음악을 재생해요.", action: "재생하기" },
    table: { icon: "⏱️", label: "타이머", title: "다도 타이머", desc: "커피를 내리는 시간을 재는 타이머예요.", action: "타이머 시작" },
    scroll: { icon: "☕", label: "추천", title: "오늘의 커피", desc: "오늘 어울리는 마주온 블렌드를 추천해드려요.", action: "오늘의 커피 보기" }
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

  var style = document.createElement("style");
  style.textContent =
    /* label + hover-reveal description, stacked under the hotspot icon (desktop preview) */
    ".room-hotspot-info{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;display:flex;flex-direction:column;align-items:center;pointer-events:none}" +
    ".room-hotspot-label{color:#fffaf0;font:12px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.02em;text-shadow:0 1px 4px rgba(0,0,0,.65);white-space:nowrap}" +
    ".room-hotspot-desc{width:180px;max-height:0;opacity:0;overflow:hidden;margin-top:0;text-align:center;font-size:12px;line-height:1.55;color:#f3ead4;text-shadow:0 1px 5px rgba(0,0,0,.75);transition:max-height .3s ease,opacity .22s ease,margin-top .3s ease}" +
    "@media (min-width:721px){.room-hotspot:hover .room-hotspot-desc,.room-hotspot:focus-visible .room-hotspot-desc{max-height:80px;opacity:1;margin-top:6px}}" +
    /* panel: bottom sheet on mobile, corner card on desktop — opened on click/tap
       so the room and its outline-morph stay visible behind it (no blur/heavy dim) */
    ".room-panel-backdrop{position:fixed;inset:0;background:rgba(10,8,6,.18);z-index:5;opacity:0;pointer-events:none;transition:opacity .25s ease}" +
    ".room-panel-backdrop.open{opacity:1;pointer-events:auto}" +
    ".room-panel{position:fixed;left:0;right:0;bottom:0;z-index:6;background:linear-gradient(175deg,#f7f0dc,#eee2c3);color:#2e2013;border-radius:14px 14px 0 0;padding:14px 22px calc(24px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .32s cubic-bezier(.22,.72,.16,1);box-shadow:0 -16px 40px rgba(0,0,0,.5);border:1px solid #5b4028;border-bottom:0;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}" +
    ".room-panel.open{transform:translateY(0)}" +
    ".room-panel-handle{width:36px;height:4px;border-radius:999px;background:rgba(91,64,40,.35);margin:0 auto 16px}" +
    ".room-panel-icon{font-size:28px;line-height:1}" +
    ".room-panel-title{font-size:18px;font-weight:600;margin:12px 0 7px;letter-spacing:.01em;color:#2e2013}" +
    ".room-panel-desc{font-size:14.5px;line-height:1.6;color:#4a3826;margin:0 0 16px}" +
    ".room-panel-close{position:absolute;top:14px;right:16px;background:rgba(91,64,40,.12);border:0;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#5b4028;font-size:19px;line-height:1;cursor:pointer;padding:0}" +
    ".room-panel-action{display:block;width:100%;padding:13px 0;border-radius:999px;border:1px solid #5b4028;background:#2e2013;color:#f7f0dc;font:14px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.04em;cursor:pointer;transition:opacity .2s ease}" +
    ".room-panel-action:hover{opacity:.85}" +
    ".room-panel-active{display:none}" +
    ".room-panel-active.show{display:block}" +
    ".room-panel-active .room-panel-timer{font-size:40px;font-weight:600;letter-spacing:.02em;text-align:center;margin:4px 0 14px;color:#2e2013;font-variant-numeric:tabular-nums}" +
    ".room-panel-active .room-panel-row{display:flex;gap:10px}" +
    ".room-panel-active .room-panel-row button{flex:1;padding:11px 0;border-radius:999px;border:1px solid #5b4028;background:transparent;color:#2e2013;font:13px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.03em;cursor:pointer}" +
    ".room-panel-active .room-panel-row button.primary{background:#2e2013;color:#f7f0dc}" +
    ".room-panel-blend{display:flex;align-items:baseline;gap:10px;margin-bottom:14px}" +
    ".room-panel-blend b{font-size:20px;color:#2e2013}" +
    ".room-panel-blend span{font-size:13px;color:#7a6650}" +
    ".room-panel-note{font-size:13px;color:#7a6650;margin:0 0 14px}" +
    "@media (min-width:721px){.room-panel-backdrop{display:none}.room-panel{left:auto;right:24px;bottom:24px;width:300px;border-radius:10px;border-bottom:1px solid #5b4028;transform:translateY(14px);opacity:0;transition:transform .25s ease,opacity .25s ease}.room-panel.open{transform:translateY(0);opacity:1}.room-panel-handle{display:none}}";
  document.head.appendChild(style);

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
    '<button class="room-panel-action" type="button"></button>' +
    "</div>" +
    '<div class="room-panel-active"></div>';
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  var defaultView = panel.querySelector(".room-panel-default");
  var activeView = panel.querySelector(".room-panel-active");
  var iconEl = panel.querySelector(".room-panel-icon");
  var titleEl = panel.querySelector(".room-panel-title");
  var descEl = panel.querySelector(".room-panel-desc");
  var actionBtn = panel.querySelector(".room-panel-action");
  var closeBtn = panel.querySelector(".room-panel-close");

  var currentId = null;
  var timer = { remaining: TIMER_SECONDS, running: false, intervalId: null };

  function renderTimer() {
    activeView.innerHTML =
      '<div class="room-panel-timer">' + formatTime(timer.remaining) + "</div>" +
      '<div class="room-panel-row">' +
      '<button type="button" data-act="toggle" class="primary">' + (timer.running ? "일시정지" : "시작") + "</button>" +
      '<button type="button" data-act="reset">초기화</button>' +
      "</div>";
    activeView.querySelector('[data-act="toggle"]').addEventListener("click", toggleTimer);
    activeView.querySelector('[data-act="reset"]').addEventListener("click", resetTimer);
  }
  function tickTimer() {
    if (timer.remaining <= 0) {
      pauseTimer();
      renderTimer();
      return;
    }
    timer.remaining--;
    if (currentId === "table") renderTimer();
  }
  function toggleTimer() {
    if (timer.running) pauseTimer();
    else {
      timer.running = true;
      timer.intervalId = setInterval(tickTimer, 1000);
    }
    renderTimer();
  }
  function pauseTimer() {
    timer.running = false;
    if (timer.intervalId) clearInterval(timer.intervalId);
    timer.intervalId = null;
  }
  function resetTimer() {
    pauseTimer();
    timer.remaining = TIMER_SECONDS;
    renderTimer();
  }

  function renderBlend() {
    var b = todaysBlend();
    activeView.innerHTML =
      '<div class="room-panel-blend"><b>' + b.name + "</b><span>" + b.season + " 블렌드</span></div>" +
      '<p class="room-panel-note">오늘은 이 한 잔이 어울려요.</p>' +
      '<a class="room-panel-action" style="display:block;text-align:center;text-decoration:none;box-sizing:border-box" href="' + b.href + '">자세히 보기 →</a>';
  }

  function renderAudioNote() {
    activeView.innerHTML = '<p class="room-panel-note" style="margin:0">🎵 음악은 곧 준비될 예정이에요.</p>';
  }

  function runAction(id) {
    defaultView.style.display = "none";
    activeView.classList.add("show");
    if (id === "table") renderTimer();
    else if (id === "scroll") renderBlend();
    else renderAudioNote();
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
    /* a running timer keeps going in the background even while the panel
       is closed — reopening it should show the live countdown, not reset it */
    if (id === "table" && (timer.running || timer.remaining !== TIMER_SECONDS)) runAction(id);
    panel.classList.add("open");
    backdrop.classList.add("open");
  }
  actionBtn.addEventListener("click", function () {
    if (currentId) runAction(currentId);
  });
  closeBtn.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);
  window.addEventListener("majuon:select", function (e) {
    var id = e.detail && e.detail.id;
    if (id) openPanel(id);
  });

  function setupHotspots() {
    var buttons = document.querySelectorAll(".room-hotspot");
    if (!buttons.length) return false;
    buttons.forEach(function (btn) {
      if (btn.dataset.uiReady) return;
      var c = CONTENT[btn.dataset.model];
      if (!c) return;
      btn.dataset.uiReady = "1";

      var info = document.createElement("div");
      info.className = "room-hotspot-info";
      info.innerHTML =
        '<span class="room-hotspot-label"></span>' +
        '<span class="room-hotspot-desc"></span>';
      info.querySelector(".room-hotspot-label").textContent = c.label;
      info.querySelector(".room-hotspot-desc").textContent = c.desc;
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
