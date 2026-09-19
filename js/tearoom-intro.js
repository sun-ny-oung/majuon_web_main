(function () {
  var overlay = document.getElementById("introOverlay");
  var endMarker = document.getElementById("introEnd");
  var enterBtn = document.getElementById("introEnterBtn");
  if (!overlay || !endMarker || !enterBtn) return;

  function activate() {
    enterBtn.disabled = false;
    enterBtn.classList.add("active");
  }
  function dismiss() {
    overlay.classList.add("hide");
    enterBtn.classList.add("hide");
    setTimeout(function () {
      overlay.remove();
      enterBtn.remove();
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
