(function () {
  var CONTENT = {
    audio: { icon: "🎵", label: "음악", title: "음악", desc: "다도실에 흐르는 배경 음악을 재생해요." },
    table: { icon: "⏱️", label: "타이머", title: "다도 타이머", desc: "커피를 내리는 시간을 재는 타이머예요." },
    scroll: { icon: "☕", label: "추천", title: "오늘의 커피", desc: "오늘 어울리는 마주온 블렌드를 추천해드려요." }
  };
  var isDesktop = function () {
    return window.matchMedia("(min-width:721px)").matches;
  };

  var style = document.createElement("style");
  style.textContent =
    ".room-hotspot-label{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;color:#fffaf0;font:12px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.02em;text-shadow:0 1px 4px rgba(0,0,0,.65);white-space:nowrap;pointer-events:none}" +
    /* mobile bottom sheet */
    ".room-panel-backdrop{position:fixed;inset:0;background:rgba(8,6,5,.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:5;opacity:0;pointer-events:none;transition:opacity .25s ease}" +
    ".room-panel-backdrop.open{opacity:1;pointer-events:auto}" +
    ".room-panel{position:fixed;left:0;right:0;bottom:0;z-index:6;background:#2b241f;color:#fff9f0;border-radius:22px 22px 0 0;padding:14px 24px calc(28px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .32s cubic-bezier(.22,.72,.16,1);box-shadow:0 -16px 44px rgba(0,0,0,.55);border-top:1px solid rgba(255,247,235,.16);font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}" +
    ".room-panel.open{transform:translateY(0)}" +
    ".room-panel-handle{width:38px;height:4px;border-radius:999px;background:rgba(255,247,235,.3);margin:0 auto 18px}" +
    ".room-panel-icon{font-size:32px;line-height:1}" +
    ".room-panel-title{font-size:20px;font-weight:600;margin:14px 0 8px;letter-spacing:.01em;color:#fff9f0}" +
    ".room-panel-desc{font-size:15.5px;line-height:1.65;color:#e6dfd1;margin:0}" +
    ".room-panel-close{position:absolute;top:16px;right:18px;background:rgba(255,247,235,.12);border:0;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:#fff9f0;font-size:20px;line-height:1;cursor:pointer;padding:0}" +
    /* desktop callout bubble, anchored to each hotspot */
    ".room-callout{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;opacity:0;pointer-events:none;transition:opacity .16s ease,margin-bottom .16s ease;margin-bottom:-4px;z-index:7}" +
    ".room-callout.show{opacity:1;margin-bottom:2px}" +
    ".room-callout-box{order:1;width:206px;background:rgba(26,22,18,.94);border:1px solid rgba(255,247,235,.32);border-radius:10px;padding:12px 14px;box-shadow:0 10px 26px rgba(0,0,0,.45);font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;text-align:left}" +
    ".room-callout-line{order:2;width:1.5px;height:14px;background:rgba(255,247,235,.7)}" +
    ".room-callout-title{font-size:13.5px;font-weight:600;color:#fff9f0;margin-bottom:4px;letter-spacing:.01em}" +
    ".room-callout-desc{font-size:12.5px;line-height:1.55;color:#e6dfd1}" +
    "@media (min-width:721px){.room-panel{display:none}.room-panel-backdrop{display:none}.room-callout{display:flex}}";
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
    '<div class="room-panel-icon"></div>' +
    '<div class="room-panel-title"></div>' +
    '<p class="room-panel-desc"></p>';
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  var iconEl = panel.querySelector(".room-panel-icon");
  var titleEl = panel.querySelector(".room-panel-title");
  var descEl = panel.querySelector(".room-panel-desc");
  var closeBtn = panel.querySelector(".room-panel-close");

  function closePanel() {
    panel.classList.remove("open");
    backdrop.classList.remove("open");
  }
  function openPanel(id) {
    var c = CONTENT[id];
    if (!c) return;
    iconEl.textContent = c.icon;
    titleEl.textContent = c.title;
    descEl.textContent = c.desc;
    panel.classList.add("open");
    backdrop.classList.add("open");
  }
  closeBtn.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);

  function hideAllCallouts() {
    document.querySelectorAll(".room-callout.show").forEach(function (el) {
      el.classList.remove("show");
    });
  }
  function showCallout(btn) {
    var el = btn.querySelector(".room-callout");
    if (!el) return;
    hideAllCallouts();
    el.classList.add("show");
  }

  window.addEventListener("majuon:select", function (e) {
    var id = e.detail && e.detail.id;
    if (!id) return;
    if (isDesktop()) {
      var btn = document.querySelector('.room-hotspot[data-model="' + id + '"]');
      if (btn) showCallout(btn);
    } else {
      openPanel(id);
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

      var label = document.createElement("span");
      label.className = "room-hotspot-label";
      label.textContent = c.label;
      btn.appendChild(label);

      var callout = document.createElement("div");
      callout.className = "room-callout";
      callout.innerHTML =
        '<div class="room-callout-box">' +
        '<div class="room-callout-title">' + c.icon + " " + c.title + "</div>" +
        '<div class="room-callout-desc">' + c.desc + "</div>" +
        "</div>" +
        '<div class="room-callout-line"></div>';
      btn.appendChild(callout);

      btn.addEventListener("mouseenter", function () {
        if (isDesktop()) showCallout(btn);
      });
      btn.addEventListener("mouseleave", function () {
        callout.classList.remove("show");
      });
    });
    return true;
  }
  var tries = 0;
  var poll = setInterval(function () {
    tries++;
    if (setupHotspots() || tries > 100) clearInterval(poll);
  }, 100);
})();
