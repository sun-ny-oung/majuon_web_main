(function () {
  var progress = {};
  var fillEl, textEl;

  function ensureEls() {
    fillEl = fillEl || document.getElementById("loadingBarFill");
    textEl = textEl || document.getElementById("loadingText");
  }

  window.addEventListener("majuon:loadprogress", function (e) {
    var d = e.detail;
    if (!d) return;
    progress[d.key] = { loaded: d.loaded, total: d.total };
    ensureEls();

    var loaded = 0, total = 0, allKnown = true;
    for (var k in progress) {
      loaded += progress[k].loaded;
      if (progress[k].total) total += progress[k].total;
      else allKnown = false;
    }
    if (allKnown && total > 0) {
      var pct = Math.min(99, Math.round((loaded / total) * 100));
      if (fillEl) fillEl.style.width = pct + "%";
      if (textEl) textEl.textContent = "공간을 불러오는 중… " + pct + "%";
    }
  });
})();
