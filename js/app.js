/* source block: main */
/* ===== inlined: js/app.js ===== */
// ---------- 커서를 따라다니는 커스텀 팔각형 (mix-blend-mode로 배경색과 상관없이 항상 보이게) ----------
const customCursor = document.getElementById('customCursor');
if (customCursor) {
  window.addEventListener('mousemove', (e) => {
    customCursor.style.transform = `translate(${e.clientX - 21.5}px, ${e.clientY - 21.5}px)`;
  });
  window.addEventListener('mouseleave', () => { customCursor.style.opacity = '0'; });
  window.addEventListener('mouseenter', () => { customCursor.style.opacity = '1'; });
}

// ---------- 스크롤에 따라 히어로가 사라지고, 다음 장면은 조명이 꺼지듯 어두워지는 전환 ----------
const hero = document.getElementById('hero');

// 히어로가 실제로 화면에 보이는지 추적 (스크롤로 벗어나면 무거운 캔버스 시뮬레이션을 멈추기 위함)
let heroVisible = true;
const heroVisibilityObserver = new IntersectionObserver((entries) => {
  heroVisible = entries[0].isIntersecting;
}, { threshold: 0 });
heroVisibilityObserver.observe(hero);
const siteHeader = document.getElementById('siteHeader');
const revealCircle = document.getElementById('revealCircle');
const quoteSection = document.getElementById('quote');
const quoteCursorGlow = document.getElementById('quoteCursorGlow');
const quoteCta = document.getElementById('quoteCta');
const quoteBrand = document.getElementById('quoteBrand');
const mobileQuoteMq = window.matchMedia('(max-width: 720px)');
const byeongpungSection = document.getElementById('byeongpung');
// ---------- 2페이지 전용 은은한 커서 광원 ----------
if (quoteSection && quoteCursorGlow) {
  const mqDesktop = window.matchMedia('(min-width: 721px)');
  let glowInside = false;
  let glowRAF = null;
  let glowX = 0, glowY = 0, targetGlowX = 0, targetGlowY = 0;

  const animateQuoteGlow = () => {
    glowX += (targetGlowX - glowX) * 0.11;
    glowY += (targetGlowY - glowY) * 0.11;
    quoteCursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    quoteCursorGlow.style.opacity = (glowInside && mqDesktop.matches) ? '0.92' : '0';
    if (glowInside || Math.abs(targetGlowX - glowX) > 0.5 || Math.abs(targetGlowY - glowY) > 0.5) {
      glowRAF = requestAnimationFrame(animateQuoteGlow);
    } else {
      glowRAF = null;
    }
  };

  const wakeGlow = () => {
    if (!glowRAF) glowRAF = requestAnimationFrame(animateQuoteGlow);
  };

  quoteSection.addEventListener('pointerenter', (e) => {
    if (!mqDesktop.matches) return;
    const r = quoteSection.getBoundingClientRect();
    targetGlowX = e.clientX - r.left;
    targetGlowY = e.clientY - r.top;
    glowX = targetGlowX;
    glowY = targetGlowY;
    glowInside = true;
    wakeGlow();
  });
  quoteSection.addEventListener('pointermove', (e) => {
    if (!mqDesktop.matches) return;
    const r = quoteSection.getBoundingClientRect();
    targetGlowX = e.clientX - r.left;
    targetGlowY = e.clientY - r.top;
    wakeGlow();
  }, { passive:true });
  quoteSection.addEventListener('pointerleave', () => {
    glowInside = false;
    wakeGlow();
  });
  mqDesktop.addEventListener('change', () => {
    if (!mqDesktop.matches) {
      glowInside = false;
      quoteCursorGlow.style.opacity = '0';
    }
  });
}

let ticking = false;

const quoteBlendLinks = [...document.querySelectorAll('.quote-blends a')];
const quoteHazes = [...document.querySelectorAll('.quote-haze')];
const clamp = (v, min = 0, max = 1) => Math.min(Math.max(v, min), max);
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

function setQuoteTone(tone) {
  quoteHazes.forEach((haze) => haze.classList.toggle('visible', haze.dataset.tone === tone));
  quoteBlendLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.tone === tone));
}
function clearQuoteTone() {
  quoteHazes.forEach((haze) => haze.classList.remove('visible'));
  quoteBlendLinks.forEach((link) => link.classList.remove('is-active'));
}
quoteBlendLinks.forEach((link) => {
  link.addEventListener('mouseenter', () => setQuoteTone(link.dataset.tone));
  link.addEventListener('focus', () => setQuoteTone(link.dataset.tone));
  link.addEventListener('mouseleave', clearQuoteTone);
  link.addEventListener('blur', clearQuoteTone);
});

let revealCurrent = 0;
let revealTarget = 0;
let revealRAF = null;

function paintReveal() {
  revealCurrent += (revealTarget - revealCurrent) * 0.082;
  if (Math.abs(revealTarget - revealCurrent) < 0.0015) revealCurrent = revealTarget;

  const eased = easeOutQuart(clamp(revealCurrent));
  revealCircle.style.opacity = String(eased);
  revealCircle.style.filter = `blur(${(1 - eased) * 14}px)`;

  quoteBrand.classList.toggle('visible', eased > 0.88);
  quoteCta.classList.toggle('visible', eased > 0.95);

  if (revealCurrent !== revealTarget) {
    revealRAF = requestAnimationFrame(paintReveal);
  } else {
    revealRAF = null;
  }
}
function setRevealTarget(v) {
  revealTarget = clamp(v);
  if (!revealRAF) revealRAF = requestAnimationFrame(paintReveal);
}

function updateScrollEffect() {
  const rect = hero.getBoundingClientRect();
  const heroProgress = clamp(-rect.top / rect.height, 0, 1);
  hero.style.opacity = String(1 - heroProgress);
  hero.style.filter = `saturate(${1 - heroProgress * 0.18}) brightness(${1 - heroProgress * 0.06})`;
  siteHeader.classList.add('visible');
  const quoteRect = quoteSection.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const centerEl = document.elementFromPoint(Math.max(1, window.innerWidth * 0.5), Math.max(1, vh * 0.5));
  const activeSection = centerEl ? centerEl.closest('section') : null;
  const inQuote = !!activeSection && activeSection.id === 'quote';

  // 특정 도형 없이, 한지색 장면의 조명이 꺼지듯 화면 전체가 서서히 어두워진다.
  let target = mobileQuoteMq.matches ? 1 : clamp((heroProgress - 0.10) / 0.86, 0, 1);
  if (Math.abs(quoteRect.top) < 3 || (quoteRect.top <= 0 && quoteRect.bottom >= vh * .82)) target = 1;
  setRevealTarget(target);

  const mobileInQuote = mobileQuoteMq.matches && quoteRect.top < vh * .55 && quoteRect.bottom > vh * .45;
  const heroInView = rect.bottom > vh * 0.12;
  const headerSection = activeSection?.id || (
    rect.bottom > vh * .5 ? 'hero' :
    (quoteRect.top < vh * .5 && quoteRect.bottom > vh * .5 ? 'quote' : 'byeongpung')
  );
  siteHeader.classList.toggle('on-dark', headerSection === 'hero' || headerSection === 'quote');
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateScrollEffect); ticking = true; }
}, { passive: true });
window.addEventListener('scrollend', () => {
  updateScrollEffect();
  const quoteRect = quoteSection.getBoundingClientRect();
  if (Math.abs(quoteRect.top) < 6) setRevealTarget(1);
}, { passive: true });
let scrollStillTimer = null;
window.addEventListener('scroll', () => {
  clearTimeout(scrollStillTimer);
  scrollStillTimer = setTimeout(() => {
    updateScrollEffect();
    const quoteRect = quoteSection.getBoundingClientRect();
    if (Math.abs(quoteRect.top) < 8) setRevealTarget(1);
  }, 120);
}, { passive: true });
updateScrollEffect();
// ---------- 모바일 햄버거 메뉴 ----------
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');
const siteHeaderEl = document.getElementById('siteHeader');

function setMobileMenu(open) {
  mobileNav.classList.toggle('open', open);
  siteHeaderEl?.classList.toggle('menu-open', open);
  document.body.classList.toggle('mobile-menu-open', open);
  hamburgerBtn.setAttribute('aria-expanded', String(open));
  hamburgerBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
}

hamburgerBtn.addEventListener('click', () => {
  setMobileMenu(!mobileNav.classList.contains('open'));
});
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMobileMenu(false));
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileNav.classList.contains('open')) setMobileMenu(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 720 && mobileNav.classList.contains('open')) setMobileMenu(false);
}, { passive: true });

// ---------- 리플/크레마 (ripple-hero.html과 동일) ----------
const LOGO_SVG_MARKUP = `<?xml version="1.0" encoding="UTF-8"?>
<svg id="_레이어_1" data-name="레이어 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1233.06 1236.04">
  <defs>
    <style>
      .cls-1 {
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .cls-1, .cls-2, .cls-3, .cls-4 {
        fill: none;
        stroke: #fff;
      }

      .cls-1, .cls-3 {
        stroke-width: 30px;
      }

      .cls-2 {
        stroke-width: 30px;
      }

      .cls-2, .cls-3, .cls-4 {
        stroke-miterlimit: 10;
      }

      .cls-4 {
        stroke-width: 30px;
      }
    



/* ===== v65: mobile page 2 hard visibility fix — width is the only mobile criterion ===== */
@media (max-width: 720px) {
  #quote {
    display: block !important;
    position: relative !important;
    min-height: 100svh !important;
    height: 100svh !important;
    opacity: 1 !important;
    visibility: visible !important;
    background: #0e0d0c !important;
    overflow: hidden !important;
    z-index: 0 !important;
  }
  #quote .reveal-circle {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
    filter: none !important;
    transform: translateZ(0) !important;
  }
  #quote .quote-block {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 4 !important;
  }
  #quote .quote-brand {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(-50%) !important;
    pointer-events: auto !important;
    z-index: 5 !important;
  }
  #quote .quote-cta {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) !important;
    pointer-events: auto !important;
    z-index: 5 !important;
  }
}

</style>
  </defs>
  <g>
    <g>
      <path class="cls-3" d="M1146.98,443.42c-3.25-24-14.18-46.66-31.26-64.86-1.57-1.72-3.21-3.4-4.9-5l-236.81-224.82c-3.7-3.47-7.59-6.75-11.65-9.73-20.13-14.92-44.56-23.84-70.2-25.37-2.73-.23-5.47-.31-8.2-.31h-334.86c-5.14,0-10.29.31-15.35.92-25.44,2.9-49.35,13.09-68.63,29.15-2.09,1.72-4.1,3.47-6.07,5.34l-236.81,224.82c-3.78,3.59-7.31,7.4-10.49,11.41-15.67,19.19-24.95,42.5-26.48,66.76-.2,2.4-.28,4.85-.28,7.29v317.95c0,4.92.32,9.8,1,14.61,3.01,24.11,13.7,46.81,30.62,65.12,1.81,1.98,3.66,3.89,5.63,5.76l236.81,224.82c3.58,3.4,7.31,6.56,11.25,9.42,20.05,15.07,44.44,24,70.08,25.64,2.89.23,5.79.3,8.72.3h334.86c5.18,0,10.33-.3,15.39-.92,25.4-2.9,49.27-12.97,68.59-29.11,2.09-1.68,4.1-3.47,6.07-5.34l236.81-224.82c3.74-3.59,7.19-7.32,10.37-11.25,15.71-19.11,25.07-42.35,26.64-66.69.2-2.48.28-5.04.28-7.55v-317.95c0-5.26-.36-10.45-1.13-15.6ZM1017.75,738.03c0,23.88-9.89,46.81-27.53,63.83-.2.23-.4.42-.64.65l-177.49,168.51-1.25,1.18c-17.76,16.9-41.71,26.48-66.79,26.71h-.04c-.36.04-.72.04-1.09.04h-252.8c-25.28,0-49.47-9.46-67.43-26.32l-.04-.04c-.16-.11-.28-.23-.44-.38l-178.74-169.7c-17.88-16.98-27.97-39.94-28.13-63.94v-240.54c0-23.84,9.85-46.7,27.37-63.71.24-.27.48-.5.76-.76l177.13-168.17,1.61-1.53c17.88-16.98,42.11-26.59,67.39-26.71h253.32c25.24,0,49.47,9.46,67.43,26.29.16.11.32.27.48.42l176.41,167.48,2.33,2.21c17.64,16.71,27.73,39.26,28.13,62.87.04.53.04,1.07.04,1.6v240.01Z"/>
      <path class="cls-3" d="M1146.98,443.42l-129.27,52.99c-.4-23.62-10.49-46.16-28.13-62.87l-2.33-2.21-.04-.08,128.51-52.69c17.08,18.2,28.01,40.86,31.26,64.86Z"/>
      <path class="cls-3" d="M862.36,139.02l-52,124.41c-17.96-16.82-42.19-26.29-67.43-26.29h-2.41l51.64-123.5c25.64,1.53,50.07,10.45,70.2,25.37Z"/>
      <path class="cls-3" d="M489.61,237.14c-25.28.11-49.51,9.73-67.39,26.71l-1.61,1.53-55.49-121.97c19.29-16.06,43.2-26.25,68.63-29.15l55.86,122.88Z"/>
      <path class="cls-3" d="M1162.86,347.86l-261.76-248.52c-26.44-24.99-62.17-39.1-99.46-39.1h-370.22c-37.25,0-73.01,14.12-99.46,39.1L70.25,347.86c-26.32,25.1-41.23,59.02-41.23,94.42v351.48c0,35.37,14.91,69.44,41.23,94.42l261.72,248.48c26.44,25.1,62.21,39.14,99.46,39.14h370.22c37.29,0,73.01-14.04,99.46-39.14l261.76-248.48c26.32-24.99,41.19-59.06,41.19-94.42v-351.48c0-35.4-14.87-69.32-41.19-94.42ZM1148.11,776.98c0,2.52-.08,5.07-.28,7.55-1.57,24.34-10.93,47.57-26.64,66.69-3.17,3.93-6.63,7.67-10.37,11.25l-236.81,224.82c-1.97,1.87-3.98,3.66-6.07,5.34-19.33,16.14-43.2,26.21-68.59,29.11-5.06.61-10.21.92-15.39.92h-334.86c-2.93,0-5.83-.08-8.72-.3-25.64-1.64-50.03-10.57-70.08-25.64-3.94-2.86-7.68-6.03-11.25-9.42l-236.81-224.82c-1.97-1.87-3.82-3.78-5.63-5.76-16.92-18.31-27.61-41.01-30.62-65.12-.68-4.81-1-9.69-1-14.61v-317.95c0-2.44.08-4.88.28-7.29,1.53-24.26,10.81-47.57,26.48-66.76,3.17-4.01,6.71-7.82,10.49-11.41l236.81-224.82c1.97-1.87,3.98-3.63,6.07-5.34,19.29-16.06,43.2-26.25,68.63-29.15,5.06-.61,10.21-.92,15.35-.92h334.86c2.73,0,5.47.08,8.2.31,25.64,1.53,50.07,10.45,70.2,25.37,4.06,2.98,7.96,6.26,11.65,9.73l236.81,224.82c1.69,1.6,3.34,3.28,4.9,5,17.08,18.2,28.01,40.86,31.26,64.86.76,5.15,1.13,10.34,1.13,15.6v317.95Z"/>
      <path class="cls-3" d="M242.72,434.31c-17.52,17.02-27.37,39.87-27.37,63.71v2.4l-.12.3-129.96-48.99c1.53-24.26,10.81-47.57,26.48-66.76l130.96,49.33Z"/>
      <path class="cls-3" d="M245.13,804.07l-128.51,52.65c-16.92-18.31-27.61-41.01-30.62-65.12l129.35-53.03c.16,24,10.25,46.96,28.13,63.94l1.65,1.56Z"/>
      <path class="cls-3" d="M491.98,998.94l-51.6,123.42c-25.64-1.64-50.03-10.57-70.08-25.64l51.92-124.3.44.15.04.04c17.96,16.86,42.15,26.32,67.43,26.32h1.85Z"/>
      <path class="cls-3" d="M867.94,1092.64c-19.33,16.14-43.2,26.21-68.59,29.11l-55.78-122.65.44-.19h.04c25.07-.23,49.02-9.8,66.79-26.71l1.25-1.18.48-.19,55.37,121.82Z"/>
      <path class="cls-3" d="M1147.83,784.53c-1.57,24.34-10.93,47.57-26.64,66.69l-130.96-49.37c17.64-17.02,27.53-39.94,27.53-63.83v-2.4l.04-.11,130.04,49.02Z"/>
      <path class="cls-3" d="M1017.75,498.02c0-.53,0-1.07-.04-1.6-.4-23.62-10.49-46.16-28.13-62.87l-2.33-2.21-85.31-80.99-3.42-3.24-1.21-1.11-.2-.19c-1.25-1.18-2.49-2.33-3.74-3.47,1,.88,1.97,1.76,2.93,2.67l-85.47-81.15c-.16-.15-.32-.31-.48-.42-17.96-16.82-42.19-26.29-67.43-26.29h-126.38c-1.17,0-2.37,0-3.54.04-2.29,0-4.54.04-6.83.08,1.61-.08,3.25-.11,4.86-.11h-121.44c-25.28.11-49.51,9.73-67.39,26.71l-1.61,1.53-87.76,83.32-1.77,1.72-.04.04c-2.57,2.44-5.06,4.88-7.47,7.4,1.41-1.56,2.85-3.05,4.38-4.5l-84.47,80.19c-.28.27-.52.5-.76.76-17.52,17.02-27.37,39.87-27.37,63.71v120.02c0,1.11,0,2.21.04,3.32v.04c0,2.17.04,4.31.08,6.49-.08-1.56-.12-3.09-.12-4.65v115.33c.16,24,10.25,46.96,28.13,63.94l92.42,87.75,2.29,2.18s0,0,0,0l84.02,79.77c.16.15.28.27.44.38l.04.04c17.96,16.86,42.15,26.32,67.43,26.32h126.42c1.17,0,2.33,0,3.5-.04,2.29,0,4.58-.04,6.87-.08-1.65.08-3.3.12-4.94.12h120.95c.36,0,.72,0,1.09-.04h.04c25.07-.23,49.02-9.8,66.79-26.71l1.25-1.18,84.75-80.42,6.79-6.45.28-.3.16-.15,85.51-81.18c.24-.23.44-.42.64-.65,17.64-17.02,27.53-39.95,27.53-63.83v-119.99c0-1.11,0-2.25-.04-3.36v-.04c0-2.18-.04-4.27-.08-6.45.08,1.53.12,3.09.12,4.62v-114.8Z"/>
    </g>
    <g>
      <g>
        <path class="cls-3" d="M592.13,574.38c-2.64-2.67-5.36-5.26-8.15-7.79-1.29-1.18-2.57-2.33-3.9-3.43-.72-.61-1.45-1.22-2.17-1.83-.96-.84-2.01-1.64-3.01-2.48-2.81-2.25-5.75-4.46-8.72-6.6-10.73-7.75-22.26-14.57-34.28-20.49-94.51-46.01-166.16-41.7-212.49-27.58-16.15-19.42-25.84-44.03-25.84-70.81,0-28.77,11.17-55.09,29.62-75.2.12-.11.2-.23.36-.34,1.41-1.56,2.85-3.05,4.38-4.5l2.05-1.95,1.04-.95.04-.04c21.62-19.61,50.87-31.63,83.14-31.63,5.79,0,11.49.34,17,1.18.68.11,1.45.15,2.25.27,11.77,1.49,33.03,5.72,57.79,17.85,1.53.76,3.09,1.53,4.62,2.37,1.57.76,3.13,1.64,4.74,2.52,1.61.84,3.21,1.75,4.82,2.75,1.61.92,3.21,1.91,4.9,2.98,1,.57,1.97,1.22,3.01,1.95,2.25,1.41,4.54,2.94,6.83,4.58,1.85,1.3,3.74,2.63,5.59,4.04.6.46,1.25.92,1.85,1.41l.04.04s.08.08.16.11c.04,0,.08.04.12.08.2.19.44.38.68.53.28.23.56.46.88.65.32.27.6.53.92.8.32.27.64.53.96.8,3.82,3.01,7.51,6.26,11.29,9.65,1.45,1.37,2.93,2.71,4.34,4.12,1.61,1.6,3.29,3.17,4.9,4.88,1.25,1.18,2.41,2.4,3.54,3.7,2.97,3.13,5.91,6.41,8.76,9.84,1.04,1.18,2.05,2.4,3.01,3.66,2.97,3.63,5.91,7.52,8.8,11.52,1.33,1.72,2.57,3.47,3.74,5.3,1.13,1.53,2.17,3.05,3.17,4.65,1.04,1.56,2.09,3.17,3.09,4.81,1.04,1.6,2.09,3.24,3.09,4.96,1.29,2.1,2.61,4.31,3.82,6.6,4.1,7.1,8.08,14.65,11.81,22.7.96,2.14,1.97,4.31,2.97,6.49,3.54,7.9,6.87,16.18,10.09,24.95,1,2.82,2.05,5.76,3.05,8.7.56,1.68,1.13,3.36,1.65,5.04.28.95.56,1.87.84,2.78.4,1.33.76,2.63,1.13,3.93.36,1.33.72,2.63,1.04,3.97,1,3.78,1.85,7.55,2.61,11.37.32,1.53.6,3.05.84,4.62.2.95.36,1.91.48,2.9.28,1.72.52,3.43.76,5.15.2,1.34.36,2.67.48,4.04.12.76.2,1.53.24,2.33.16,1.34.28,2.67.36,4.01.12,1.22.2,2.44.24,3.62.12,1.91.2,3.78.24,5.65.04,1.49.08,3.01.08,4.5v.11c0,1.26-.01,2.52-.04,3.78"/>
        <path class="cls-3" d="M592.13,574.38c-2.64-2.67-5.36-5.26-8.15-7.79-1.29-1.18-2.57-2.33-3.9-3.43-.72-.61-1.45-1.22-2.17-1.83-.96-.84-2.01-1.64-3.01-2.48-2.81-2.25-5.75-4.46-8.72-6.6-10.73-7.75-22.26-14.57-34.28-20.49-94.51-46.01-166.16-41.7-212.49-27.58-26.44,8.05-44.68,19.3-54.09,26.17-5.22,3.47-10.05,7.44-14.71,11.83-23.03,21.9-34.76,50.44-35.24,79.16v.04c-.04.61-.04,1.22-.04,1.83,0,1.56.04,3.09.12,4.65.04.57.04,1.14.08,1.72v.27c1.65,27.05,13.34,53.68,35.12,74.39,19.93,18.88,45.09,29.83,71.09,32.73,22.1-41.05,69.56-92.25,170.74-123.15,4.22-1.3,8.44-2.44,12.74-3.51,2.37-.57,4.7-1.14,7.07-1.64,2.49-.57,4.98-1.07,7.51-1.53,1.69-.34,3.38-.61,5.06-.88.28-.08.56-.11.8-.11.72-.15,1.45-.27,2.17-.34,1.97-.3,3.9-.57,5.87-.8,2.17-.3,4.34-.53,6.55-.72,2.45-.23,4.94-.42,7.39-.57h.04c1.25-.08,2.45-.11,3.7-.15,1.21-.08,2.45-.11,3.66-.11,4.43-.12,8.88-.09,13.33.09"/>
        <path class="cls-3" d="M568.38,603.54c-4.45-.18-8.9-.21-13.33-.09-1.21,0-2.45.04-3.66.11-1.25.04-2.45.08-3.7.15h-.04c-2.45.15-4.94.34-7.39.57-2.21.19-4.38.42-6.55.72-1.97.23-3.9.5-5.87.8-.72.08-1.45.19-2.17.34-.24,0-.52.04-.8.11-1.69.27-3.38.57-5.06.88-2.53.46-5.02.95-7.51,1.53-2.37.5-4.7,1.07-7.07,1.64-4.3,1.07-8.52,2.21-12.74,3.51-101.18,30.9-148.64,82.1-170.74,123.15-12.78,23.46-17.32,43.61-18.85,54.78-1.09,5.95-1.57,12.02-1.57,18.24,0,31.25,13.18,59.55,34.56,80.23l2.29,2.17c.52.46,1,.88,1.53,1.33.56.53,1.17,1.03,1.73,1.53l.04.04c21.38,18.2,49.59,29.26,80.57,29.26,28.13,0,54.05-9.19,74.58-24.57-14.87-43.95-19.49-111.94,29.05-201.63,8.72-15.99,19.25-31.02,31.79-44.41,3.74-4.03,7.68-7.92,11.81-11.64"/>
        <path class="cls-3" d="M569.27,642.32c-4.13,3.72-8.07,7.61-11.81,11.64-12.54,13.39-23.07,28.42-31.79,44.41-48.54,89.69-43.92,157.68-29.05,201.63,8.44,25.14,20.33,42.46,27.53,51.47,3.7,4.88,7.88,9.54,12.54,13.96,23.03,21.86,53.08,33.04,83.34,33.46.64.04,1.29.04,1.93.04,1.65,0,3.3-.04,4.94-.11.56-.04,1.13-.04,1.73-.08h.36c28.53-1.56,56.58-12.7,78.36-33.38,19.89-18.88,31.42-42.81,34.48-67.41-43.24-21.06-97.17-66.08-129.71-162.14-.64-1.95-1.29-3.89-1.89-5.84-.04-.15-.08-.3-.12-.46-.6-1.98-1.21-4.01-1.73-5.99-.56-2.06-1.13-4.12-1.61-6.22-.44-1.72-.84-3.43-1.21-5.19-.12-.57-.24-1.14-.36-1.75-.4-1.87-.76-3.7-1.09-5.57-.04-.23-.08-.46-.12-.65-.28-1.72-.56-3.47-.84-5.19-.36-2.48-.68-5-.92-7.48-.24-1.87-.4-3.78-.56-5.68-.16-2.33-.32-4.69-.4-7.06-.12-2.33-.16-4.65-.16-6.98"/>
        <path class="cls-3" d="M601.1,671.74c0,2.33.04,4.65.16,6.98.08,2.36.24,4.73.4,7.06.16,1.91.32,3.82.56,5.68.24,2.48.56,5,.92,7.48.28,1.72.56,3.47.84,5.19.04.19.08.42.12.65.32,1.87.68,3.7,1.09,5.57.12.61.24,1.18.36,1.75.36,1.75.76,3.47,1.21,5.19.48,2.1,1.04,4.16,1.61,6.22.52,1.98,1.13,4.01,1.73,5.99.04.15.08.3.12.46.6,1.95,1.25,3.89,1.89,5.84,32.55,96.06,86.48,141.08,129.71,162.14,24.71,12.13,45.93,16.37,57.7,17.85,6.27.99,12.66,1.45,19.25,1.45,33.23,0,63.29-12.74,85.11-33.42l.16-.15c1.41-1.34,2.77-2.67,4.14-4.08,19.41-20.33,31.22-47.31,31.22-76.91,0-26.78-9.68-51.39-25.84-70.81-46.33,14.04-117.94,18.39-212.41-27.7-9.52-4.62-18.69-9.84-27.45-15.64-1.45-.95-2.89-1.94-4.3-2.94-1.09-.72-2.13-1.49-3.17-2.25-.76-.53-1.49-1.03-2.17-1.56-5.08-3.78-9.96-7.75-14.61-11.93"/>
        <path class="cls-3" d="M649.46,669.84c4.65,4.18,9.53,8.15,14.61,11.93.68.53,1.41,1.03,2.17,1.56,1.04.76,2.09,1.53,3.17,2.25,1.41.99,2.85,1.98,4.3,2.94,8.76,5.8,17.92,11.03,27.45,15.64,94.47,46.09,166.08,41.74,212.41,27.7,26.44-8.09,44.68-19.38,54.09-26.21,5.22-3.47,10.05-7.4,14.71-11.83,23.07-21.9,34.84-50.44,35.32-79.16v-.04c.04-.61.04-1.22.04-1.83,0-1.53-.04-3.09-.12-4.62,0-.61-.04-1.18-.08-1.79v-.19c-1.65-27.09-13.38-53.76-35.16-74.43-19.97-18.88-45.13-29.83-71.05-32.7-22.18,41.01-69.64,92.21-170.82,123.08-2.61.8-5.18,1.53-7.84,2.25-.12.04-.28.08-.4.11-1.93.5-3.9,1.03-5.87,1.49-.8.19-1.65.38-2.45.57-.52.11-1,.23-1.53.34-1.41.34-2.85.65-4.26.92-.88.19-1.77.38-2.61.53-.32.08-.64.12-.96.19-1.97.38-3.94.72-5.91,1.03-.12.04-.24.08-.36.08-5.87.95-11.73,1.68-17.64,2.17-4.32.36-8.65.59-12.98.69"/>
        <path class="cls-3" d="M677.19,632.53c4.5-.09,8.99-.32,13.48-.7,5.91-.5,11.77-1.22,17.64-2.17.12,0,.24-.04.36-.08,1.97-.3,3.94-.65,5.91-1.03.32-.08.64-.12.96-.19.88-.15,1.77-.34,2.61-.53,1.41-.27,2.85-.57,4.26-.92.52-.11,1-.23,1.53-.34.8-.19,1.65-.38,2.45-.57,1.97-.46,3.94-.99,5.87-1.49.12-.04.28-.08.4-.11,2.65-.73,5.22-1.45,7.84-2.25,101.18-30.86,148.64-82.06,170.82-123.08,12.78-23.5,17.24-43.64,18.77-54.86,1.09-5.95,1.57-12.02,1.57-18.27,0-31.09-13.1-59.36-34.36-79.96l-.2-.19-.8-.8c-.96-.92-1.93-1.79-2.93-2.67-.6-.53-1.17-1.07-1.77-1.56-.04-.04-.08-.08-.12-.11-21.38-18.16-49.55-29.22-80.53-29.22-28.13,0-54.05,9.19-74.5,24.49,14.79,43.95,19.41,112.01-29.17,201.78-1.65,3.01-3.34,5.99-5.1,8.93-.44.73-.84,1.45-1.33,2.17-.44.72-.88,1.45-1.37,2.17-.52.84-1.04,1.68-1.61,2.56-1.13,1.68-2.25,3.4-3.42,5.07-1.13,1.64-2.25,3.24-3.42,4.81-1.17,1.6-2.37,3.17-3.58,4.73-6.07,7.82-12.7,15.18-19.89,22.05"/>
        <path class="cls-3" d="M667.57,590.17c7.19-6.87,13.82-14.23,19.89-22.05,1.21-1.56,2.41-3.13,3.58-4.73,1.17-1.56,2.29-3.17,3.42-4.81,1.17-1.68,2.29-3.4,3.42-5.07.56-.88,1.08-1.72,1.61-2.56.48-.73.92-1.45,1.37-2.17.48-.72.88-1.45,1.33-2.17,1.77-2.94,3.46-5.91,5.1-8.93,48.58-89.77,43.96-157.83,29.17-201.78-8.52-25.07-20.41-42.39-27.61-51.35-3.74-4.88-7.88-9.5-12.54-13.92-23.03-21.86-53.04-33-83.3-33.46-.64-.04-1.33-.04-1.97-.04-1.61,0-3.25.04-4.86.11-.6.04-1.25.04-1.89.08-28.57,1.49-56.74,12.63-78.6,33.34-19.89,18.92-31.42,42.81-34.44,67.41,1.53.76,3.09,1.53,4.62,2.37,1.57.76,3.13,1.64,4.74,2.52,1.61.84,3.21,1.75,4.82,2.75,1.61.92,3.21,1.91,4.9,2.98,1,.57,1.97,1.22,3.01,1.95,2.25,1.41,4.54,2.94,6.83,4.58,1.85,1.3,3.74,2.63,5.59,4.04.6.46,1.25.92,1.85,1.41l.04.04s.08.08.16.11c.04,0,.08.04.12.08.2.19.44.38.68.53.28.23.56.46.88.65.32.27.6.53.92.8.32.27.64.53.96.8,3.82,3.01,7.51,6.26,11.29,9.65,1.45,1.37,2.93,2.71,4.34,4.12,1.61,1.6,3.29,3.17,4.9,4.88,1.25,1.18,2.41,2.4,3.54,3.7,2.97,3.13,5.91,6.41,8.76,9.84,1.04,1.18,2.05,2.4,3.01,3.66,2.97,3.63,5.91,7.52,8.8,11.52,1.33,1.72,2.57,3.47,3.74,5.3,1.13,1.53,2.17,3.05,3.17,4.65,1.04,1.56,2.09,3.17,3.09,4.81,1.04,1.6,2.09,3.24,3.09,4.96,1.29,2.1,2.61,4.31,3.82,6.6,4.1,7.1,8.08,14.65,11.81,22.7,1.04,2.14,2.05,4.31,2.97,6.49,3.54,7.9,6.87,16.18,10.09,24.95,1,2.82,2.05,5.76,3.05,8.7.56,1.68,1.13,3.36,1.65,5.04.28.95.56,1.87.84,2.78.4,1.33.76,2.63,1.13,3.93.36,1.33.72,2.63,1.04,3.97,1,3.78,1.85,7.55,2.61,11.37.32,1.53.6,3.05.84,4.62.2.95.36,1.91.48,2.9.28,1.72.52,3.43.76,5.15.2,1.34.36,2.67.48,4.04.12.76.2,1.53.24,2.33.16,1.34.28,2.67.36,4.01.12,1.22.2,2.44.24,3.62.12,1.91.2,3.78.24,5.65.04,1.49.08,3.01.08,4.5v.11c0,1.27-.01,2.53-.04,3.8"/>
      </g>
      <path class="cls-1" d="M451.37,401.04c40.09,11.92,84.31,40.71,109.63,74,24.98,32.85,40.71,61.49,50.33,92.99"/>
      <path class="cls-1" d="M627.59,331.89c31.23,40.84,48.59,92.1,48.6,143.51.01,34.4-8.97,68.73-24.26,99.93"/>
      <path class="cls-1" d="M826.83,418.79c-6.8,50.96-30.77,99.48-67.11,135.85-23.26,23.27-52.29,40.68-83.53,52"/>
      <path class="cls-1" d="M906.47,629.3c-40.84,31.23-92.1,48.59-143.51,48.6-33.31.01-66.55-8.41-96.94-22.82"/>
      <path class="cls-1" d="M814.89,830.83c-50.96-6.8-99.48-30.77-135.85-67.11-25.39-25.37-43.81-57.62-54.94-92.12"/>
      <path class="cls-1" d="M608.4,907.5c-31.23-40.84-48.59-92.1-48.6-143.51-.01-34.63,9.09-69.19,24.57-100.56"/>
      <path class="cls-1" d="M410.9,812.15c6.8-50.96,30.77-99.48,67.11-135.85,24.2-24.21,54.64-42.08,87.33-53.34"/>
      <path class="cls-1" d="M334.01,609.55c40.84-31.23,92.1-48.59,143.51-48.6,34.78-.01,69.5,9.17,100.97,24.77"/>
    </g>
  </g>
  <line class="cls-3" x1="222.37" y1="463.82" x2="93.55" y2="415.63"/>
  <line class="cls-3" x1="451.8" y1="244.72" x2="396.43" y2="124.27"/>
  <line class="cls-3" x1="778.51" y1="243.65" x2="829.17" y2="121.26"/>
  <line class="cls-3" x1="1009.22" y1="460.47" x2="1136.73" y2="408.72"/>
  <line class="cls-3" x1="1010.91" y1="771.57" x2="1139.59" y2="820.37"/>
  <line class="cls-3" x1="223.39" y1="774.17" x2="96.09" y2="826.33"/>
  <line class="cls-3" x1="452.99" y1="991.83" x2="401.89" y2="1114.07"/>
  <line class="cls-3" x1="782.19" y1="990.98" x2="836.13" y2="1112.07"/>
  <path class="cls-4" d="M1176.74,785.54c0,2.65-.08,5.35-.3,7.96-1.65,25.65-11.52,50.14-28.08,70.28-3.35,4.14-6.99,8.08-10.93,11.86l-249.56,236.93c-2.08,1.97-4.19,3.86-6.39,5.63-20.37,17.01-45.52,27.62-72.29,30.68-5.34.64-10.76.96-16.22.96h-352.89c-3.09,0-6.14-.08-9.19-.32-27.02-1.73-52.72-11.14-73.86-27.02-4.15-3.02-8.09-6.35-11.86-9.93l-249.56-236.93c-2.08-1.97-4.02-3.98-5.93-6.07-17.83-19.3-29.09-43.22-32.27-68.63-.72-5.07-1.06-10.21-1.06-15.4v-335.07c0-2.57.08-5.15.3-7.68,1.61-25.57,11.39-50.14,27.91-70.36,3.35-4.22,7.07-8.24,11.05-12.02l249.56-236.93c2.08-1.97,4.19-3.82,6.39-5.63,20.33-16.93,45.52-27.66,72.33-30.72,5.34-.64,10.76-.97,16.18-.97h352.89c2.88,0,5.76.08,8.64.32,27.02,1.61,52.77,11.02,73.98,26.74,4.28,3.14,8.38,6.59,12.28,10.25l249.56,236.93c1.78,1.69,3.51,3.46,5.17,5.27,18,19.18,29.52,43.06,32.95,68.35.8,5.43,1.19,10.9,1.19,16.44v335.07Z"/>
  <g>
    <path class="cls-2" d="M565.33,621.66c0,28.21,20.82,51.39,47.38,53.82,3.35,0,6.61-.94,8.03-4.96,5.19-16.16,2.16-34.26-1.65-50.96-3.55-15.74-7.06-32.54-3.99-48.08.4-2.02-1.4-3.76-3.63-3.5-25.99,3-46.15,25.9-46.15,53.68Z"/>
    <path class="cls-2" d="M628.29,671.3c-.73,2.16,1.34,4.25,3.78,3.91,25.52-3.51,45.13-26.15,45.13-53.55,0-27.66-20.02-50.48-45.87-53.66-4.65-.34-7.79-.18-8.91,6.33-2.15,14.73,1.15,30.44,4.48,45.22,3.87,16.97,6.93,35.38,1.39,51.74Z"/>
  </g>
</svg>`;


// ---------- v67: Got Work hero — photo + lightweight coffee-surface ripple ----------
(() => {
  const heroEl = document.getElementById('hero');
  const surfaceEl = document.getElementById('gwCoffeeSurface');
  const invitationEl = document.getElementById('gwTouchInvitation');
  if (!heroEl || !surfaceEl) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disturb = null;

  function initCoffeeSurface() {
    const gl2 = surfaceEl.getContext('webgl', { alpha:false, antialias:false, powerPreference:'low-power' });
    if (!gl2) return false;
    const vertex = `attribute vec2 position; varying vec2 uv; void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;
    const fragment = `precision mediump float;
      varying vec2 uv; uniform sampler2D photo; uniform vec2 resolution;
      uniform float time; uniform vec4 ripples[16];
      void main(){
        float aspect=resolution.x/resolution.y;
        vec2 fit=aspect>1.5?vec2(1.,1.5/aspect):vec2(aspect/1.5,1.);
        vec2 base=uv*fit+(1.-fit)*vec2(.63,.5);
        vec2 offset=vec2(0.); float light=0.;
        for(int i=0;i<16;i++){
          float age=time-ripples[i].z;
          if(age>0.&&age<5.&&ripples[i].w>0.){
            vec2 delta=(uv-ripples[i].xy)*vec2(aspect,1.);
            float d=length(delta)+.0001;
            float front=d-age*.23;
            float envelope=exp(-front*front*45.)*exp(-age*.85)*smoothstep(0.,.09,age);
            float wave=sin(front*64.)*envelope*ripples[i].w;
            offset+=delta/d*vec2(1./aspect,1.)*wave*.011;
            light+=cos(front*64.)*envelope*ripples[i].w*.06;
          }
        }
        float mask=smoothstep(.22,.52,base.x);
        vec3 col=texture2D(photo,clamp(base+offset*mask,vec2(.001),vec2(.999))).rgb;
        col+=vec3(.6,.43,.23)*light*mask;
        gl_FragColor=vec4(max(col,vec3(0.)),1.);
      }`;
    function compile(type, source){
      const sh=gl2.createShader(type); gl2.shaderSource(sh,source); gl2.compileShader(sh);
      if(!gl2.getShaderParameter(sh,gl2.COMPILE_STATUS)){ gl2.deleteShader(sh); throw new Error('hero shader'); }
      return sh;
    }
    const program=gl2.createProgram();
    try {
      gl2.attachShader(program,compile(gl2.VERTEX_SHADER,vertex));
      gl2.attachShader(program,compile(gl2.FRAGMENT_SHADER,fragment));
      gl2.linkProgram(program);
      if(!gl2.getProgramParameter(program,gl2.LINK_STATUS)) throw new Error('hero link');
    } catch { return false; }
    gl2.useProgram(program);
    const buffer=gl2.createBuffer(); gl2.bindBuffer(gl2.ARRAY_BUFFER,buffer);
    gl2.bufferData(gl2.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl2.STATIC_DRAW);
    const position=gl2.getAttribLocation(program,'position'); gl2.enableVertexAttribArray(position); gl2.vertexAttribPointer(position,2,gl2.FLOAT,false,0,0);
    const texture=gl2.createTexture(); gl2.bindTexture(gl2.TEXTURE_2D,texture);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_MIN_FILTER,gl2.LINEAR); gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_MAG_FILTER,gl2.LINEAR);
    gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_WRAP_S,gl2.CLAMP_TO_EDGE); gl2.texParameteri(gl2.TEXTURE_2D,gl2.TEXTURE_WRAP_T,gl2.CLAMP_TO_EDGE);
    const loc={time:gl2.getUniformLocation(program,'time'),resolution:gl2.getUniformLocation(program,'resolution'),ripples:gl2.getUniformLocation(program,'ripples[0]')};
    const waves=new Float32Array(64); let cursor=0, raf=0, lastDisturbance=0, ready=false, visible=true;
    function size(){
      const rect=heroEl.getBoundingClientRect();
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      surfaceEl.width=Math.max(1,Math.round(rect.width*dpr)); surfaceEl.height=Math.max(1,Math.round(rect.height*dpr));
      gl2.viewport(0,0,surfaceEl.width,surfaceEl.height); render(performance.now());
    }
    function render(now){ if(!ready)return; gl2.uniform1f(loc.time,now/1000);gl2.uniform2f(loc.resolution,surfaceEl.width,surfaceEl.height);gl2.uniform4fv(loc.ripples,waves);gl2.drawArrays(gl2.TRIANGLES,0,6); }
    function frame2(now){ raf=0;if(!visible||document.hidden)return;render(now);if(now-lastDisturbance<5100&&!reduceMotion.matches)raf=requestAnimationFrame(frame2); }
    function wake(){ if(!raf&&ready&&visible&&!document.hidden) raf=requestAnimationFrame(frame2); }
    disturb=(x,y,strength=1)=>{ if(!ready||reduceMotion.matches)return; const now=performance.now();waves.set([x,1-y,now/1000,strength],cursor*4);cursor=(cursor+1)%16;lastDisturbance=now;wake(); };
    const photo=new Image();
    photo.onload=()=>{gl2.pixelStorei(gl2.UNPACK_FLIP_Y_WEBGL,true);gl2.texImage2D(gl2.TEXTURE_2D,0,gl2.RGB,gl2.RGB,gl2.UNSIGNED_BYTE,photo);ready=true;size();surfaceEl.classList.add('ready');disturb(.69,.47,.8);};
    photo.src=heroEl.querySelector('.gw-hero-picture img').src;
    new ResizeObserver(size).observe(heroEl);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{threshold:.05}).observe(heroEl);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
    surfaceEl.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;surfaceEl.classList.remove('ready');cancelAnimationFrame(raf);});
    return true;
  }

  let supported=false; try { supported=initCoffeeSurface(); } catch { supported=false; }
  let lastPointer=0;
  function touchCoffee(e,force){
    const r=heroEl.getBoundingClientRect();
    disturb?.((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height,force);
    heroEl.classList.add('has-touched');
    const label=invitationEl?.querySelector('span:last-child'); if(label) label.textContent='한 번의 손길, 오래 남는 파문';
  }
  heroEl.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&!e.buttons)return;if(performance.now()-lastPointer<90)return;lastPointer=performance.now();touchCoffee(e,.48);});
  heroEl.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;touchCoffee(e,1.25);});
  surfaceEl.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();disturb?.(.69,.51,1.35);heroEl.classList.add('has-touched');}});
  function surfacePreference(){const enabled=supported&&!reduceMotion.matches;surfaceEl.tabIndex=enabled?0:-1;surfaceEl.setAttribute('aria-hidden',String(!enabled));if(invitationEl)invitationEl.hidden=!enabled;}
  reduceMotion.addEventListener?.('change',surfacePreference); surfacePreference();
})();

// ===== v56: 자동 루프 추가 — 1초 간격으로 화담→청류→풍연→설한→화담 반복 =====
(() => {
  const section = document.getElementById('byeongpung');
  const stage = document.getElementById('u24Stage');
  const track = document.getElementById('u24Track');
  const model = document.getElementById('u24Model');
  const modelWrap = document.getElementById('u24ModelWrap');
  if (!section || !stage || !track || !model) return;

  const tones = ['216,164,161','157,210,231','191,155,103','178,184,197'];
  const TRANSITION_MS = 820;
  const HOLD_MS = 4000;
  const MANUAL_RESUME_MS = 5500;
  const TRANSITION = `transform ${TRANSITION_MS / 1000}s cubic-bezier(.22,.72,.16,1)`;
  const WRAP_MS = 860;
  const INTRO_MS = 1480;

  /* 화면상 순서는 화담 → 청류 → 풍연 → 설한이지만,
     기존 움직임 방향(현재 컷이 오른쪽으로 밀리며 다음 컷 등장)을 유지하기 위해
     실제 track 순서는 뒤집고, 맨 앞에 화담 clone을 하나 더 붙여 무한루프를 만든다. */
  const reversedSlides = Array.from(track.children).reverse();
  reversedSlides.forEach(slide => track.appendChild(slide));

  const springClone = track.lastElementChild?.cloneNode(true);
  if (springClone) {
    springClone.setAttribute('aria-hidden', 'true');
    springClone.setAttribute('data-clone', 'spring-head');
    track.insertBefore(springClone, track.firstElementChild);
  }

  /* Add a winter clone after the real spring as well.
     This gives us one off-screen slide on each side, so swiping left/right
     can loop naturally in both directions. */
  const realWinter = springClone?.nextElementSibling || track.firstElementChild;
  const winterClone = realWinter?.cloneNode(true);
  if (winterClone) {
    winterClone.setAttribute('aria-hidden', 'true');
    winterClone.setAttribute('data-clone', 'winter-tail');
    track.appendChild(winterClone);
  }

  const slides = Array.from(track.children);
  const logicalCount = 4;
  const totalSlides = slides.length;
  const slidePct = 100 / totalSlides;
  track.style.width = `${totalSlides * 100}%`;
  track.style.transition = TRANSITION;
  slides.forEach(slide => {
    slide.style.flex = `0 0 ${slidePct}%`;
    slide.style.width = `${slidePct}%`;
  });

  let index = 0;
  let wheelAccum = 0;
  let locked = false;
  let entered = false;
  let spin = 0;
  let spinTarget = 0;
  let spinRAF = null;
  let spinEase = .105;
  let touchX = null;
  let touchY = null;
  let autoTimer = null;

  const vh = () => window.innerHeight || document.documentElement.clientHeight;
  const isSectionActive = () => {
    const r = section.getBoundingClientRect();
    const h = vh();
    const mobileViewport = window.matchMedia('(max-width: 720px)').matches;
    /* Mobile Safari can finish scroll-snap after the last scroll event.
       Treat page 3 as active as soon as it owns the viewport center. */
    if (mobileViewport) return r.top <= h * 0.52 && r.bottom >= h * 0.48;
    return r.top < h * 0.35 && r.bottom > h * 0.65;
  };

  const getOffsetForIndex = (logicalIndex) => (logicalCount - logicalIndex) * slidePct;

  function applyOffset(offsetPct, animate = true) {
    track.style.transition = animate ? TRANSITION : 'none';
    track.style.transform = `translate3d(-${offsetPct}%,0,0)`;
    if (!animate) void track.offsetWidth;
  }

  function animateSpin() {
    spin += (spinTarget - spin) * spinEase;
    if (Math.abs(spinTarget - spin) < .15) spin = spinTarget;
    model.setAttribute('orientation', `0deg 0deg ${spin.toFixed(2)}deg`);
    if (spin !== spinTarget) spinRAF = requestAnimationFrame(animateSpin);
    else spinRAF = null;
  }

  function setSpinTarget(v) {
    spinTarget = v;
    if (!spinRAF) spinRAF = requestAnimationFrame(animateSpin);
  }

  function setEntered(next) {
    entered = next;
    section.classList.toggle('is-u24-entered', entered);
    if (!entered) {
      spin = 0;
      spinTarget = 0;
      spinEase = .105;
      model.setAttribute('orientation', '0deg 0deg 0deg');
    }
  }

  function setTone(logicalIndex) {
    section.style.setProperty('--u24-rgb', tones[((logicalIndex % logicalCount) + logicalCount) % logicalCount]);
  }

  function clearAuto() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function scheduleAuto(delay = HOLD_MS) {
    clearAuto();
    autoTimer = window.setTimeout(() => {
      autoTimer = null;
      if (document.hidden || !isSectionActive()) return;
      if (!entered) {
        introReveal();
        scheduleAuto(INTRO_MS + HOLD_MS);
        return;
      }
      if (locked) {
        scheduleAuto(260);
        return;
      }
      if (index >= logicalCount - 1) {
        wrapToStart(1);
      } else {
        updateState(index + 1, 1);
      }
      scheduleAuto(TRANSITION_MS + HOLD_MS);
    }, delay);
  }

  function updateState(next, direction = 0) {
    index = Math.max(0, Math.min(logicalCount - 1, next));
    applyOffset(getOffsetForIndex(index), true);
    setTone(index);

    if (entered && direction !== 0) setSpinTarget(spinTarget + direction * -45);

    if (direction !== 0) {
      locked = true;
      window.setTimeout(() => {
        locked = false;
        wheelAccum = 0;
      }, 820);
    }
  }

  function wrapToStart(direction = 1) {
    if (!entered || locked) return false;
    locked = true;
    setTone(0);
    setSpinTarget(spinTarget + direction * -45);

    /* clone 화담(맨 앞 0%)까지 같은 방향으로 이동한 뒤,
       transition을 끄고 실제 화담 위치로 즉시 되돌려 무한루프처럼 보이게 만든다. */
    applyOffset(0, true);

    window.setTimeout(() => {
      index = 0;
      applyOffset(getOffsetForIndex(0), false);
      track.style.transition = TRANSITION;
      locked = false;
      wheelAccum = 0;
    }, WRAP_MS);
    return true;
  }

  function wrapToEnd(direction = -1) {
    if (!entered || locked) return false;
    locked = true;
    setTone(logicalCount - 1);
    setSpinTarget(spinTarget + direction * -45);

    /* From real spring, move one panel further to the tail winter clone.
       Then snap invisibly back to the real winter position. */
    applyOffset((logicalCount + 1) * slidePct, true);

    window.setTimeout(() => {
      index = logicalCount - 1;
      applyOffset(getOffsetForIndex(index), false);
      track.style.transition = TRANSITION;
      locked = false;
      wheelAccum = 0;
    }, WRAP_MS);
    return true;
  }

  function introReveal() {
    if (entered || locked) return;
    locked = true;
    index = 0;
    applyOffset(getOffsetForIndex(0), false);
    setTone(0);
    setEntered(true);
    spin = 0;
    spinTarget = 0;
    model.setAttribute('orientation', '0deg 0deg 0deg');
    spinEase = .115;
    setSpinTarget(-45);

    window.setTimeout(() => {
      spinEase = .105;
      locked = false;
      wheelAccum = 0;
    }, INTRO_MS);
  }

  function step(direction) {
    if (!entered) {
      if (direction > 0) {
        introReveal();
        return true;
      }
      return false;
    }

    if (locked) return true;

    if (direction > 0) {
      if (index >= logicalCount - 1) return wrapToStart(direction);
      updateState(index + 1, direction);
      return true;
    }

    if (index <= 0) return wrapToEnd(direction);
    const next = index + direction;
    updateState(next, direction);
    return true;
  }

  model.addEventListener('load', () => {
    modelWrap?.classList.add('is-loaded');
    model.setAttribute('camera-orbit', '0deg 90deg 0.98m');
    model.setAttribute('field-of-view', '28deg');
    model.setAttribute('camera-target', '0m -0.01m 0m');
    model.setAttribute('orientation', '0deg 0deg 0deg');
    if (typeof model.updateFraming === 'function') model.updateFraming();
    if (typeof model.jumpCameraToGoal === 'function') model.jumpCameraToGoal();
  });

  function handleVisibility() {
    if (isSectionActive()) {
      /* Mobile: as soon as page 3 becomes the active snapped section,
         open the scroll immediately. Do not require one more swipe. */
      const mobileViewport = window.matchMedia('(max-width: 720px)').matches;
      if (mobileViewport && !entered && !locked) {
        introReveal();
        scheduleAuto(INTRO_MS + HOLD_MS);
      } else {
        scheduleAuto(HOLD_MS);
      }
    } else {
      clearAuto();
      if (entered && section.getBoundingClientRect().top > vh() * 0.45) {
        setEntered(false);
        updateState(0, 0);
      }
    }
  }

  window.addEventListener('wheel', (e) => {
    if (!isSectionActive()) {
      wheelAccum = 0;
      handleVisibility();
      return;
    }

    const primary = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(primary) < 2) return;
    const direction = primary > 0 ? 1 : -1;
    const shouldCapture = !entered || entered;
    if (!shouldCapture) return;

    e.preventDefault();
    if (locked) return;
    wheelAccum += primary;
    if (Math.abs(wheelAccum) < (entered ? 46 : 24)) return;
    step(direction);
    wheelAccum = 0;
    scheduleAuto(MANUAL_RESUME_MS);
  }, { passive:false });

  stage.addEventListener('touchstart', (e) => {
    touchX = e.touches[0]?.clientX ?? null;
    touchY = e.touches[0]?.clientY ?? null;
  }, { passive:true });

  stage.addEventListener('touchmove', (e) => {
    if (touchX == null || touchY == null || !isSectionActive() || locked) return;
    const x = e.touches[0]?.clientX ?? touchX;
    const y = e.touches[0]?.clientY ?? touchY;
    const dx = touchX - x;
    const dy = touchY - y;

    /* Page navigation remains vertical; season navigation is explicitly horizontal.
       Require a clearly horizontal gesture so a normal vertical page swipe is not stolen. */
    if (Math.abs(dx) <= Math.abs(dy) * 1.08 || Math.abs(dx) < 42) return;

    const direction = dx > 0 ? 1 : -1;
    e.preventDefault();
    step(direction);
    touchX = x;
    touchY = y;
    scheduleAuto(MANUAL_RESUME_MS);
  }, { passive:false });

  stage.addEventListener('touchend', () => {
    touchX = null;
    touchY = null;
  }, { passive:true });

  window.addEventListener('scroll', handleVisibility, { passive:true });
  window.addEventListener('scrollend', handleVisibility, { passive:true });
  window.addEventListener('resize', handleVisibility);

  /* iOS Safari sometimes does not emit a useful final scroll event after scroll-snap.
     IntersectionObserver catches the snapped arrival and opens the scroll immediately. */
  const mobileEntryObserver = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const mobileViewport = window.matchMedia('(max-width: 720px)').matches;
    if (!mobileViewport || !entry) return;
    if (entry.isIntersecting && entry.intersectionRatio >= 0.36) {
      if (!entered && !locked) introReveal();
      scheduleAuto(INTRO_MS + HOLD_MS);
    }
  }, { threshold:[0.18,0.36,0.5,0.68] });
  mobileEntryObserver.observe(section);

  document.addEventListener('touchend', () => {
    if (!window.matchMedia('(max-width: 720px)').matches) return;
    window.setTimeout(handleVisibility, 70);
    window.setTimeout(handleVisibility, 220);
  }, { passive:true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearAuto();
    else handleVisibility();
  });

  setTone(0);
  updateState(0, 0);
  setEntered(false);
  handleVisibility();
})();

/* source block: v71-mobile-header-reset */
(() => {
  const header = document.getElementById('siteHeader');
  const nav = document.getElementById('mobileNav');
  const btn = document.getElementById('hamburgerBtn');
  if (!header || !nav || !btn) return;

  const mq = window.matchMedia('(max-width: 720px)');

  function closeStaleMobileMenu() {
    if (!mq.matches) return;
    nav.classList.remove('open');
    header.classList.remove('menu-open');
    document.body.classList.remove('mobile-menu-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', '메뉴 열기');
  }

  function syncMobileHeaderTheme() {
    if (!mq.matches || nav.classList.contains('open')) return;
    const y = Math.max(1, (window.innerHeight || document.documentElement.clientHeight) * 0.5);
    const x = Math.max(1, window.innerWidth * 0.5);
    const el = document.elementFromPoint(x, y);
    const section = el?.closest?.('section');
    const id = section?.id;
    header.classList.toggle('on-dark', id === 'hero' || id === 'quote');
  }

  /* Safari bfcache can restore an old menu/header class state. Reset it on every page show. */
  window.addEventListener('pageshow', () => {
    closeStaleMobileMenu();
    requestAnimationFrame(syncMobileHeaderTheme);
  });

  window.addEventListener('scroll', () => requestAnimationFrame(syncMobileHeaderTheme), { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(syncMobileHeaderTheme), { passive: true });

  closeStaleMobileMenu();
  requestAnimationFrame(syncMobileHeaderTheme);
})();

/* source block: v72-mobile-header-section-sync */
(() => {
  const header = document.getElementById('siteHeader');
  const nav = document.getElementById('mobileNav');
  if (!header) return;
  const mq = window.matchMedia('(max-width: 720px)');
  let ticking = false;

  function currentSectionId() {
    const vh = window.innerHeight || document.documentElement.clientHeight || 1;
    const probeY = Math.min(vh - 1, Math.max(1, vh * 0.42));
    const probeX = Math.min(window.innerWidth - 1, Math.max(1, window.innerWidth * 0.5));
    const el = document.elementFromPoint(probeX, probeY);
    const direct = el && el.closest ? el.closest('section') : null;
    if (direct && ['hero','quote','byeongpung'].includes(direct.id)) return direct.id;

    const sections = ['hero','quote','byeongpung']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    let best = 'hero';
    let bestDist = Infinity;
    for (const section of sections) {
      const r = section.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - vh * 0.5);
      if (dist < bestDist) { bestDist = dist; best = section.id; }
    }
    return best;
  }

  function sync() {
    ticking = false;
    if (!mq.matches) {
      header.removeAttribute('data-mobile-section');
      return;
    }
    const id = currentSectionId();
    header.setAttribute('data-mobile-section', id);
    header.classList.toggle('on-dark', id === 'hero' || id === 'quote');
  }

  function requestSync() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sync);
  }

  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync, { passive: true });
  window.addEventListener('pageshow', requestSync);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestSync(); });

  /* Closing the menu must immediately restore the page-specific icon colors. */
  if (nav) {
    const observer = new MutationObserver(requestSync);
    observer.observe(nav, { attributes: true, attributeFilter: ['class'] });
  }

  requestSync();
})();

/* source block: v76-mobile-menu-final */
(() => {
  const header = document.getElementById('siteHeader');
  const oldBtn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  if (!header || !oldBtn || !nav) return;

  /* Strip every accumulated old click listener from previous iterations. */
  const btn = oldBtn.cloneNode(true);
  oldBtn.replaceWith(btn);

  function setOpen(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('mobile-menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });

  window.addEventListener('pageshow', () => setOpen(false));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) setOpen(false);
  }, { passive:true });
})();


/* v83 FINAL: deterministic mobile section + hamburger theme sync */
(() => {
  const header = document.getElementById('siteHeader');
  const hero = document.getElementById('hero');
  const quote = document.getElementById('quote');
  const page3 = document.getElementById('byeongpung');
  const nav = document.getElementById('mobileNav');
  if (!header || !hero || !quote || !page3) return;

  const mq = window.matchMedia('(max-width: 720px)');
  let raf = 0;

  function resolveSection() {
    const h = window.innerHeight || document.documentElement.clientHeight || 1;
    const r3 = page3.getBoundingClientRect();
    const rq = quote.getBoundingClientRect();

    /* Flip to page 3 as soon as it crosses the viewport midpoint.
       This also covers Safari's delayed scroll-snap settlement. */
    if (r3.top <= h * 0.52 && r3.bottom > h * 0.20) return 'byeongpung';
    if (rq.top <= h * 0.52 && rq.bottom > h * 0.20) return 'quote';
    return 'hero';
  }

  function syncNow() {
    raf = 0;
    if (!mq.matches || nav?.classList.contains('open')) return;
    const id = resolveSection();
    header.setAttribute('data-mobile-section', id);
    header.classList.toggle('on-dark', id !== 'byeongpung');
  }

  function requestSync() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(syncNow);
  }

  window.addEventListener('scroll', requestSync, { passive:true });
  window.addEventListener('scrollend', requestSync, { passive:true });
  window.addEventListener('resize', requestSync, { passive:true });
  window.addEventListener('pageshow', requestSync);
  document.addEventListener('touchend', () => {
    requestSync();
    setTimeout(requestSync, 70);
    setTimeout(requestSync, 220);
  }, { passive:true });

  const observer = new IntersectionObserver(() => requestSync(), {
    threshold:[0.20,0.35,0.50,0.65]
  });
  observer.observe(hero);
  observer.observe(quote);
  observer.observe(page3);

  requestSync();
})();


/* ===== v100: mobile-only page3 tuning GUI; desktop isolated ===== */
(() => {
  const mq = window.matchMedia('(max-width: 720px)');
  const gui = document.getElementById('u24TuneGui');
  if (!gui) return;

  const root = document.documentElement;
  const toggle = document.getElementById('u24TuneToggle');
  const panel = document.getElementById('u24TunePanel');
  const artScale = document.getElementById('u24ArtScale');
  const leftMask = document.getElementById('u24LeftMask');
  const bottomMask = document.getElementById('u24BottomMask');
  const artScaleOut = document.getElementById('u24ArtScaleOut');
  const leftMaskOut = document.getElementById('u24LeftMaskOut');
  const bottomMaskOut = document.getElementById('u24BottomMaskOut');
  const readout = document.getElementById('u24TuneReadout');
  const resetBtn = document.getElementById('u24TuneReset');
  const copyBtn = document.getElementById('u24TuneCopy');
  const storageKey = 'majuon-u24-gui-v100';

  const defaults = { artScale: 1.19, leftMask: 1.00, bottomMask: 0.87, collapsed: false };
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function readState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (e) {}
    return {
      artScale: clamp(Number(saved.artScale ?? defaults.artScale), 0.90, 1.35),
      leftMask: clamp(Number(saved.leftMask ?? defaults.leftMask), 0.00, 1.40),
      bottomMask: clamp(Number(saved.bottomMask ?? defaults.bottomMask), 0.00, 1.40),
      collapsed: Boolean(saved.collapsed ?? defaults.collapsed),
    };
  }

  let state = readState();

  function saveState() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (e) {}
  }

  function applyDesktopReset() {
    root.style.setProperty('--u24-gui-art-scale', '1');
    root.style.setProperty('--u24-gui-left-mask-strength', '1');
    root.style.setProperty('--u24-gui-bottom-mask-strength', '1');
  }

  function render() {
    if (!mq.matches) {
      applyDesktopReset();
      return;
    }

    root.style.setProperty('--u24-gui-art-scale', state.artScale.toFixed(2));
    root.style.setProperty('--u24-gui-left-mask-strength', state.leftMask.toFixed(2));
    root.style.setProperty('--u24-gui-bottom-mask-strength', state.bottomMask.toFixed(2));

    artScale.value = state.artScale.toFixed(2);
    leftMask.value = state.leftMask.toFixed(2);
    bottomMask.value = state.bottomMask.toFixed(2);
    artScaleOut.textContent = `${state.artScale.toFixed(2)}x`;
    leftMaskOut.textContent = state.leftMask.toFixed(2);
    bottomMaskOut.textContent = state.bottomMask.toFixed(2);
    readout.textContent = [
      `일러스트 크기: ${state.artScale.toFixed(2)}x`,
      `왼쪽 마스크 강도: ${state.leftMask.toFixed(2)}`,
      `아래 마스크 강도: ${state.bottomMask.toFixed(2)}`,
    ].join('\n');

    gui.classList.toggle('is-collapsed', state.collapsed);
    toggle.setAttribute('aria-expanded', String(!state.collapsed));
    const icon = toggle.querySelector('span');
    if (icon) icon.textContent = state.collapsed ? '+' : '−';
    panel.hidden = state.collapsed;
  }

  function updateFromInputs() {
    if (!mq.matches) return;
    state.artScale = clamp(Number(artScale.value), 0.90, 1.35);
    state.leftMask = clamp(Number(leftMask.value), 0.00, 1.40);
    state.bottomMask = clamp(Number(bottomMask.value), 0.00, 1.40);
    render();
    saveState();
  }

  [artScale, leftMask, bottomMask].forEach((input) => {
    input.addEventListener('input', updateFromInputs, { passive: true });
    input.addEventListener('change', updateFromInputs);
  });

  toggle.addEventListener('click', () => {
    if (!mq.matches) return;
    state.collapsed = !state.collapsed;
    render();
    saveState();
  });

  resetBtn.addEventListener('click', () => {
    if (!mq.matches) return;
    state = { ...defaults };
    render();
    saveState();
  });

  copyBtn.addEventListener('click', async () => {
    if (!mq.matches) return;
    try {
      await navigator.clipboard.writeText(readout.textContent);
      copyBtn.textContent = '복사됨';
    } catch (e) {
      copyBtn.textContent = '복사 실패';
    }
    setTimeout(() => { copyBtn.textContent = '값 복사'; }, 1200);
  });

  if (mq.addEventListener) mq.addEventListener('change', render);
  else if (mq.addListener) mq.addListener(render);
  window.addEventListener('resize', render, { passive: true });
  render();
})();


/* ===== v102: measure actual mobile artwork frame so fades hit the image, not empty paper ===== */
(() => {
  const mq = window.matchMedia('(max-width: 720px)');
  const containers = Array.from(document.querySelectorAll('#byeongpung .u24-blend-image'));
  if (!containers.length) return;

  function syncArtworkMetrics() {
    if (!mq.matches) {
      containers.forEach((wrap) => {
        wrap.style.removeProperty('--u24-art-left-offset');
        wrap.style.removeProperty('--u24-art-top-offset');
        wrap.style.removeProperty('--u24-art-rendered-width');
        wrap.style.removeProperty('--u24-art-rendered-height');
      });
      return;
    }

    containers.forEach((wrap) => {
      const img = wrap.querySelector('.u24-art');
      if (!img) return;
      const wrapRect = wrap.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      const left = Math.max(0, imgRect.left - wrapRect.left);
      const top = Math.max(0, imgRect.top - wrapRect.top);
      const width = Math.max(0, imgRect.width);
      const height = Math.max(0, imgRect.height);
      wrap.style.setProperty('--u24-art-left-offset', `${left}px`);
      wrap.style.setProperty('--u24-art-top-offset', `${top}px`);
      wrap.style.setProperty('--u24-art-rendered-width', `${width}px`);
      wrap.style.setProperty('--u24-art-rendered-height', `${height}px`);
    });
  }

  let raf = null;
  function scheduleSync() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      syncArtworkMetrics();
      setTimeout(syncArtworkMetrics, 50);
    });
  }

  window.addEventListener('load', scheduleSync);
  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('pageshow', scheduleSync);
  document.addEventListener('scroll', scheduleSync, { passive: true });
  document.addEventListener('touchend', scheduleSync, { passive: true });
  document.querySelectorAll('#u24ArtScale, #u24LeftMask, #u24BottomMask').forEach((el) => {
    el.addEventListener('input', scheduleSync, { passive: true });
    el.addEventListener('change', scheduleSync);
  });
  containers.forEach((wrap) => {
    const img = wrap.querySelector('.u24-art');
    if (img) {
      if (img.complete) scheduleSync();
      img.addEventListener('load', scheduleSync);
    }
  });
  scheduleSync();
})();
