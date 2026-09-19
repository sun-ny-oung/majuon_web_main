(function () {
  var CONTENT = {
    audio: { icon: "🎵", label: "음악", title: "음악", desc: "다도실에 흐르는 배경 음악을 재생해요." },
    table: { icon: "⏱️", label: "타이머", title: "다도 타이머", desc: "차를 우리는 시간을 재는 타이머예요." },
    scroll: { icon: "☕", label: "추천", title: "오늘의 커피", desc: "오늘 어울리는 마주온 블렌드를 추천해드려요." }
  };

  var style = document.createElement("style");
  style.textContent =
    ".room-hotspot-label{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;color:#fffaf0;font:12px/1 -apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;letter-spacing:.02em;text-shadow:0 1px 4px rgba(0,0,0,.65);white-space:nowrap;pointer-events:none}" +
    ".room-panel-backdrop{position:fixed;inset:0;background:rgba(10,8,6,.4);z-index:5;opacity:0;pointer-events:none;transition:opacity .25s ease}" +
    ".room-panel-backdrop.open{opacity:1;pointer-events:auto}" +
    ".room-panel{position:fixed;left:0;right:0;bottom:0;z-index:6;background:#211d19;color:#f3ece1;border-radius:20px 20px 0 0;padding:22px 22px calc(22px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .32s cubic-bezier(.22,.72,.16,1);box-shadow:0 -10px 30px rgba(0,0,0,.35);font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif}" +
    ".room-panel.open{transform:translateY(0)}" +
    ".room-panel-icon{font-size:26px;line-height:1}" +
    ".room-panel-title{font-size:17px;margin:10px 0 6px;letter-spacing:.02em}" +
    ".room-panel-desc{font-size:14px;line-height:1.55;color:#cdc3b4;margin:0}" +
    ".room-panel-close{position:absolute;top:14px;right:16px;background:none;border:0;color:#cdc3b4;font-size:22px;line-height:1;cursor:pointer;padding:6px}" +
    "@media (min-width:721px){.room-panel{left:auto;right:24px;bottom:24px;width:300px;border-radius:16px;transform:translateY(14px);opacity:0;transition:transform .25s ease,opacity .25s ease}.room-panel.open{transform:translateY(0);opacity:1}.room-panel-backdrop{display:none}}";
  document.head.appendChild(style);

  var backdrop = document.createElement("div");
  backdrop.className = "room-panel-backdrop";
  var panel = document.createElement("div");
  panel.className = "room-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-live", "polite");
  panel.innerHTML =
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
    openPanel(e.detail && e.detail.id);
  });

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
