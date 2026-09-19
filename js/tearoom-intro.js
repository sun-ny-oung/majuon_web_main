(function () {
  var overlay = document.getElementById("introOverlay");
  var endMarker = document.getElementById("introEnd");
  var enterBtn = document.getElementById("introEnterBtn");
  var indicator = document.getElementById("introScrollIndicator");
  if (!overlay || !endMarker || !enterBtn) return;

  function activate() {
    enterBtn.disabled = false;
    enterBtn.classList.add("active");
    if (indicator) indicator.classList.add("hide");
  }
  function dismiss() {
    overlay.classList.add("hide");
    enterBtn.classList.add("hide");
    setTimeout(function () {
      overlay.remove();
      enterBtn.remove();
      if (indicator) indicator.remove();
    }, 550);
  }
  enterBtn.addEventListener("click", function () {
    if (!enterBtn.disabled) dismiss();
  });

  if (!("IntersectionObserver" in window)) {
    overlay.addEventListener("scroll", function () {
      if (overlay.scrollTop + overlay.clientHeight >= overlay.scrollHeight - 4) activate();
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting) activate();
    },
    { root: overlay, threshold: 0.6 }
  );
  io.observe(endMarker);
})();
