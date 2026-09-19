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
    /* desktop callout bubble — anchored, every frame, to the bottom edge of
       the hotspot's own morphed silhouette outline (see tick() below) */
    ".room-callout{position:fixed;left:0;top:0;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;opacity:0;pointer-events:none;transition:opacity .18s ease;z-index:7}" +
    ".room-callout.show{opacity:1}" +
    ".room-callout-line{width:1.5px;height:18px;background:#5b4028}" +
    ".room-callout-box{position:relative;width:216px;background:linear-gradient(175deg,#f7f0dc,#eee2c3);border:1px solid #5b4028;border-radius:2px;padding:14px 16px;box-shadow:0 10px 26px rgba(0,0,0,.5);font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;text-align:left}" +
    ".room-callout-box::before,.room-callout-box::after{content:'';position:absolute;width:9px;height:9px;border-color:#5b4028}" +
    ".room-callout-box::before{top:3px;left:3px;border-top:1px solid;border-left:1px solid}" +
    ".room-callout-box::after{bottom:3px;right:3px;border-bottom:1px solid;border-right:1px solid}" +
    ".room-callout-title{font-size:14.5px;font-weight:600;color:#2e2013;margin-bottom:5px;letter-spacing:.02em}" +
    ".room-callout-desc{font-size:12.5px;line-height:1.6;color:#4a3826}" +
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
  window.addEventListener("majuon:select", function (e) {
    var id = e.detail && e.detail.id;
    if (id && !isDesktop()) openPanel(id);
  });

  /* --- desktop callout: follows tearoom.js's own hover/morph state --- */
  var callout = document.createElement("div");
  callout.className = "room-callout";
  callout.innerHTML =
    '<div class="room-callout-line"></div>' +
    '<div class="room-callout-box">' +
    '<div class="room-callout-title"></div>' +
    '<div class="room-callout-desc"></div>' +
    "</div>";
  document.body.appendChild(callout);
  var calloutTitleEl = callout.querySelector(".room-callout-title");
  var calloutDescEl = callout.querySelector(".room-callout-desc");
  var calloutKey = null;

  function outlineBottomCenter(entry) {
    var loop = entry.loops && entry.loops[0];
    if (!loop || !loop.length) return null;
    var minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < loop.length; i++) {
      var p = loop[i];
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] > maxY) maxY = p[1];
    }
    return { x: (minX + maxX) / 2, y: maxY };
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!isDesktop()) {
      callout.classList.remove("show");
      return;
    }
    var hs = window.roomHotspots;
    var key = window.hotspotState;
    var entry = null;
    if (hs && hs.entries && key) {
      for (var i = 0; i < hs.entries.length; i++) {
        if (hs.entries[i].key === key) { entry = hs.entries[i]; break; }
      }
    }
    /* only reveal once the outline has actually finished morphing into
       the object's own silhouette (amount reaches 1) */
    if (entry && entry.amount >= 0.98) {
      var pt = outlineBottomCenter(entry);
      if (pt) {
        if (calloutKey !== key) {
          var c = CONTENT[key];
          if (!c) { callout.classList.remove("show"); calloutKey = null; return; }
          calloutTitleEl.textContent = c.icon + " " + c.title;
          calloutDescEl.textContent = c.desc;
          calloutKey = key;
        }
        callout.style.left = pt.x + "px";
        callout.style.top = pt.y + "px";
        callout.classList.add("show");
        return;
      }
    }
    callout.classList.remove("show");
    calloutKey = null;
  }
  requestAnimationFrame(tick);

  function addLabels() {
    var buttons = document.querySelectorAll(".room-hotspot");
    if (!buttons.length) return false;
    buttons.forEach(function (btn) {
      if (btn.querySelector(".room-hotspot-label")) return;
      var c = CONTENT[btn.dataset.model];
      if (!c) return;
      var span = document.createElement("span");
      span.className = "room-hotspot-label";
      span.textContent = c.label;
      btn.appendChild(span);
    });
    return true;
  }
  var tries = 0;
  var poll = setInterval(function () {
    tries++;
    if (addLabels() || tries > 100) clearInterval(poll);
  }, 100);
})();
