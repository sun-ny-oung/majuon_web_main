// ---------- 커서를 따라다니는 커스텀 팔각형 (mix-blend-mode로 배경색과 상관없이 항상 보이게) ----------
const customCursor = document.getElementById('customCursor');
window.addEventListener('mousemove', (e) => {
  customCursor.style.transform = `translate(${e.clientX - 21.5}px, ${e.clientY - 21.5}px)`;
});
window.addEventListener('mouseleave', () => { customCursor.style.opacity = '0'; });
window.addEventListener('mouseenter', () => { customCursor.style.opacity = '1'; });

// ---------- 스크롤에 따라 자연스럽게 사라지는 히어로 (확대 없이 페이드만, 스크롤 스냅으로 다음 섹션까지 자동 이동) ----------
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
const quoteCta = document.getElementById('quoteCta');

let ticking = false;

function updateScrollEffect() {
  const rect = hero.getBoundingClientRect();
  // 히어로 섹션이 뷰포트 위로 스크롤되어 나가는 만큼(자기 자신의 높이 기준)을 진행률로 사용
  const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
  hero.style.opacity = String(1 - progress);
  // 히어로를 충분히 벗어나면(두 번째 섹션부터) 상단 바를 드러냄
  siteHeader.classList.toggle('visible', progress > 0.6);
  // 문구(원 리빌) 섹션이 실제로 화면을 채우고 있는 동안에만 헤더를 밝은 글씨로 전환
  // (mix-blend-mode 자동 반전은 필터 걸린 큰 원 때문에 다른 섹션에서 깨지므로, 직접 판단해서 전환)
  const quoteRect = quoteSection.getBoundingClientRect();
  const inQuote = quoteRect.top <= 1 && quoteRect.bottom > 1;
  siteHeader.classList.toggle('on-dark', inQuote);
  // 왼쪽 아래에서 검은 원이 커지며 화면을 덮는 리빌 (진행률 0→1이 그대로 원의 크기가 됨)
  revealCircle.style.transform = `translate(50%, -50%) scale(${progress})`;
  // 원이 거의 다 자란 뒤에만, 이 페이지가 유도하려는 다음 행동(스토리/디지털 다도실)을 드러냄
  quoteCta.classList.toggle('visible', progress > 0.88);

  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateScrollEffect); ticking = true; }
}, { passive: true });
updateScrollEffect();

// ---------- 모바일 햄버거 메뉴 ----------
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');
hamburgerBtn.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
});
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  });
});

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

const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
if (!gl) { document.body.innerHTML = '<p style="padding:40px">이 브라우저는 WebGL2를 지원하지 않습니다.</p>'; }

gl.getExtension('EXT_color_buffer_float');
gl.getExtension('EXT_color_buffer_half_float');

// 모바일/저성능 기기에서는 시뮬레이션 해상도를 낮춰서 프레임드랍을 줄임
const IS_MOBILE = matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
const SIM_RESOLUTION = IS_MOBILE ? 288 : 512;
const DAMPING = 0.992;
const AUTO_DROP_INTERVAL = 5.1; // 자동 방울 간격 (기존의 3배)
const AUTO_DROP_STRENGTH = 0.35;
const CLICK_STRENGTH = 0.55;
const MOVE_STRENGTH = 0.05;

const FOAM_RECOVER_RATE = 0.0035; // 낮출수록 문양이 더 오래, 더 천천히 사라짐
const FOAM_ADVECT_STRENGTH = 1500.0;
const FOAM_DROP_RADIUS = 0.007;
const FOAM_DROP_STRENGTH = 0.9;
const FOAM_CLICK_RADIUS = 0.006;
const FOAM_CLICK_STRENGTH = 1.0;
const FOAM_MOVE_RADIUS = 0.0035;
const FOAM_MOVE_STRENGTH = 0.6;

const baseVertex = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const updateShader = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uState;
uniform vec2 texelSize;
uniform float damping;
out vec4 fragColor;
void main () {
  vec2 dx = vec2(texelSize.x, 0.0);
  vec2 dy = vec2(0.0, texelSize.y);
  float n = texture(uState, vUv + dy).x;
  float s = texture(uState, vUv - dy).x;
  float e = texture(uState, vUv + dx).x;
  float w = texture(uState, vUv - dx).x;
  vec2 self = texture(uState, vUv).xy;
  float current = self.x;
  float previous = self.y;
  float average = (n + s + e + w) * 0.25;
  float newHeight = average * 2.0 - previous;
  newHeight *= damping;
  fragColor = vec4(newHeight, current, 0.0, 1.0);
}`;

const splatShader = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec2 point;
uniform float radius;
uniform float strength;
out vec4 fragColor;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  float d = exp(-dot(p, p) / radius);
  vec2 base = texture(uTarget, vUv).xy;
  fragColor = vec4(base.x + d * strength, base.y, 0.0, 1.0);
}`;

const foamUpdateShader = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uFoam;
uniform sampler2D uBaseFoam;
uniform sampler2D uState;
uniform vec2 texelSize;
uniform float recoverRate;
uniform float advectStrength;
uniform float dt;
out vec4 fragColor;
void main () {
  vec2 dx = vec2(texelSize.x, 0.0);
  vec2 dy = vec2(0.0, texelSize.y);
  float hL = texture(uState, vUv - dx).x;
  float hR = texture(uState, vUv + dx).x;
  float hT = texture(uState, vUv + dy).x;
  float hB = texture(uState, vUv - dy).x;
  float hC = texture(uState, vUv).x;
  // 이 지점에 물결이 실제로 지나가고 있는 정도(0~1) — 건드리지 않은 곳은 0에 가까움
  float activity = smoothstep(0.02, 0.16, abs(hC));

  vec2 slope = vec2(hR - hL, hT - hB) * 0.5;
  vec2 vel = -slope * advectStrength;
  vec2 coord = clamp(vUv + vel * dt * texelSize, 0.0, 1.0);
  float advected = texture(uFoam, coord).x;

  float n = texture(uFoam, vUv + dy).x;
  float s = texture(uFoam, vUv - dy).x;
  float e = texture(uFoam, vUv + dx).x;
  float w = texture(uFoam, vUv - dx).x;
  float blurred = advected * 0.7 + (n + s + e + w) * 0.075;
  // 블러(주변 픽셀과 섞이는 것)도 물결이 지나가는 자리에서만 일어나게 해서,
  // 건드리지 않은 영역은 매 프레임 아주 조금씩이라도 뭉개지지 않고 또렷하게 유지됨
  float smoothed = mix(advected, blurred, activity);

  float base = texture(uBaseFoam, vUv).x;
  float effectiveRecoverRate = recoverRate * activity;
  float relaxed = mix(smoothed, base, effectiveRecoverRate);
  fragColor = vec4(clamp(relaxed, -0.1, 1.4), 0.0, 0.0, 1.0);
}`;

const generateFoamShader = `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 aspect;
out vec4 fragColor;
float hash (vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float valueNoise (vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm (vec2 p) {
  float v = 0.0; float amp = 0.5;
  for (int i = 0; i < 5; i++) { v += amp * valueNoise(p); p *= 2.05; amp *= 0.52; }
  return v;
}
void main () {
  vec2 p = vUv * aspect * 5.5;
  float n = fbm(p);
  n = smoothstep(0.20, 0.62, n);
  fragColor = vec4(n, 0.0, 0.0, 1.0);
}`;

const blurLogoShader = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 texelSize;
uniform float radiusPx;
uniform float warpAmount;
out vec4 fragColor;
void main () {
  // 완벽한 벡터 선 대신, 손으로 부은 라떼아트처럼 살짝 흔들리는 왜곡을 얹음
  vec2 warp = vec2(
    sin(vUv.y * 26.0) * warpAmount,
    cos(vUv.x * 24.0 + 1.7) * warpAmount
  );
  vec2 uv = vUv + warp;

  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int x = -3; x <= 3; x++) {
    for (int y = -3; y <= 3; y++) {
      vec2 offset = vec2(float(x), float(y)) * texelSize * radiusPx;
      sum += texture(uTex, uv + offset);
      total += 1.0;
    }
  }
  fragColor = sum / total;
}`;

const seedShader = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uBase;
uniform sampler2D uLogo;
uniform float logoBoost;
uniform float baseWeight;
out vec4 fragColor;
void main () {
  float base = texture(uBase, vUv).x;
  float logo = texture(uLogo, vUv).r;
  fragColor = vec4(clamp(base * baseWeight + logo * logoBoost, 0.0, 1.4), 0.0, 0.0, 1.0);
}`;

const displayShader = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uState;
uniform sampler2D uFoam;
uniform vec2 texelSize;
out vec4 fragColor;
void main () {
  float hL = texture(uState, vUv - vec2(texelSize.x, 0.0)).x;
  float hR = texture(uState, vUv + vec2(texelSize.x, 0.0)).x;
  float hT = texture(uState, vUv + vec2(0.0, texelSize.y)).x;
  float hB = texture(uState, vUv - vec2(0.0, texelSize.y)).x;
  vec3 normal = normalize(vec3((hL - hR) * 6.0, (hB - hT) * 6.0, 1.0));
  vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.75));
  float diff = max(dot(normal, lightDir), 0.0);
  float spec = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 90.0);
  vec3 espressoDeep = vec3(0.16, 0.09, 0.05);
  vec3 espressoLit = vec3(0.34, 0.21, 0.13);
  vec3 color = mix(espressoDeep, espressoLit, diff);
  float foam = clamp(texture(uFoam, vUv).x, 0.0, 1.0);
  float foamT = smoothstep(0.04, 0.8, foam);
  vec3 crema = vec3(0.86, 0.70, 0.44);
  vec3 cremaLit = crema * (0.85 + diff * 0.3);
  color = mix(color, cremaLit, foamT * 0.92);
  vec3 highlight = vec3(1.0, 0.95, 0.85);
  float specAmount = spec * 0.5;
  color = color + highlight * specAmount * (1.0 - color);
  float vignette = smoothstep(0.75, 0.15, length(vUv - 0.5));
  color *= mix(0.75, 1.0, vignette);
  fragColor = vec4(color, 1.0);
}`;

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
  return shader;
}
function createProgram(vsSource, fsSource) {
  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(program));
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms, bind() { gl.useProgram(program); } };
}
function createFBO(w, h, internalFormat, format, type, filter) {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
    attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
  };
}
function createDoubleFBO(w, h, internalFormat, format, type, filter) {
  let a = createFBO(w, h, internalFormat, format, type, filter);
  let b = createFBO(w, h, internalFormat, format, type, filter);
  return {
    width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
    get read() { return a; }, set read(v) { a = v; },
    get write() { return b; }, set write(v) { b = v; },
    swap() { const t = a; a = b; b = t; }
  };
}

const quadBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
const quadIndex = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndex);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

function blit(target) {
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndex);
  gl.bindFramebuffer(gl.FRAMEBUFFER, target);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

const updateProgram = createProgram(baseVertex, updateShader);
const foamUpdateProgram = createProgram(baseVertex, foamUpdateShader);
const generateFoamProgram = createProgram(baseVertex, generateFoamShader);
const seedProgram = createProgram(baseVertex, seedShader);
const blurLogoProgram = createProgram(baseVertex, blurLogoShader);
const splatProgram = createProgram(baseVertex, splatShader);
const displayProgram = createProgram(baseVertex, displayShader);

let state, foam, baseFoam;
function getResolution(resolution) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
  const min = Math.round(resolution);
  const max = Math.round(resolution * aspectRatio);
  if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
  return { width: min, height: max };
}
function initFramebuffers() {
  const res = getResolution(SIM_RESOLUTION);
  state = createDoubleFBO(res.width, res.height, gl.RG16F, gl.RG, gl.HALF_FLOAT, gl.LINEAR);
  foam = createDoubleFBO(res.width, res.height, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.LINEAR);
  baseFoam = createFBO(res.width, res.height, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.LINEAR);
  generateBaseFoam();
}
function generateBaseFoam() {
  gl.viewport(0, 0, baseFoam.width, baseFoam.height);
  generateFoamProgram.bind();
  gl.uniform2f(generateFoamProgram.uniforms.aspect, canvas.width / canvas.height, 1.0);
  blit(baseFoam.fbo);
  blit(foam.read.fbo);
  blit(foam.write.fbo);
}

// ---------- 로고를 크레마 초기 모양으로 사용 (시간이 지나면 자연스러운 얼룩 패턴으로 서서히 녹아듦) ----------
const LOGO_BOOST = 1.15;
const LOGO_BLUR_RADIUS_PX = 2.3; // 로고 엣지를 부드럽게 하는 정도 (GPU 블러, 브라우저 무관하게 동일하게 보임)
const LOGO_WARP_AMOUNT = 0.003; // 완벽한 벡터 선 대신 손으로 부은 듯한 흔들림 정도(UV 단위)
let logoImage = null;
let logoMaskTex = null;

function createTextureFromCanvas(canvasEl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasEl);
  return {
    texture,
    attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
  };
}

function loadLogoImage() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { logoImage = img; resolve(); };
    img.onerror = () => resolve(); // 로고 로드에 실패해도 나머지는 정상 동작하도록
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG_MARKUP);
  });
}

let logoMaskFBO = null;
function rasterizeLogoMask(size) {
  const off = document.createElement('canvas');
  off.width = size; off.height = size;
  const ctx = off.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  if (logoImage) ctx.drawImage(logoImage, 0, 0, size, size);

  // 캔버스 2D의 ctx.filter(blur)는 사파리에서 안정적으로 적용되지 않아서(브라우저마다 결과가 다름),
  // 블러는 WebGL 셰이더로 직접 처리 — 모든 브라우저에서 동일하게 보이고, 축소/확대 방식보다 화질도 좋음
  const sharpTex = createTextureFromCanvas(off);

  if (logoMaskFBO) gl.deleteFramebuffer(logoMaskFBO.fbo);
  if (logoMaskTex) gl.deleteTexture(logoMaskTex.texture);

  logoMaskFBO = createFBO(size, size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
  gl.viewport(0, 0, size, size);
  blurLogoProgram.bind();
  gl.uniform1i(blurLogoProgram.uniforms.uTex, sharpTex.attach(0));
  gl.uniform2f(blurLogoProgram.uniforms.texelSize, 1 / size, 1 / size);
  gl.uniform1f(blurLogoProgram.uniforms.radiusPx, LOGO_BLUR_RADIUS_PX);
  gl.uniform1f(blurLogoProgram.uniforms.warpAmount, LOGO_WARP_AMOUNT);
  blit(logoMaskFBO.fbo);

  gl.deleteTexture(sharpTex.texture);
  logoMaskTex = logoMaskFBO;
}

function seedFoamWithLogo() {
  if (!logoMaskTex) return;
  gl.viewport(0, 0, foam.width, foam.height);
  seedProgram.bind();
  gl.uniform1f(seedProgram.uniforms.logoBoost, LOGO_BOOST);
  // 처음엔 노이즈(자연스러운 얼룩 패턴)를 전혀 섞지 않고 로고 모양만 크레마로 보이게 함(baseWeight: 0)
  // — 노이즈는 이후 실제로 건드린/물결이 친 자리에서 foamUpdateShader의 relax 로직을 통해서만 서서히 드러남
  gl.uniform1f(seedProgram.uniforms.baseWeight, 0.0);
  gl.uniform1i(seedProgram.uniforms.uBase, baseFoam.attach(0));
  gl.uniform1i(seedProgram.uniforms.uLogo, logoMaskTex.attach(1));
  blit(foam.read.fbo);
  blit(foam.write.fbo);
}
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1 : 1.5);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; return true; }
  return false;
}
resizeCanvas();
initFramebuffers();
loadLogoImage().then(() => {
  rasterizeLogoMask(512);
  seedFoamWithLogo();
});
window.addEventListener('resize', () => {
  if (resizeCanvas()) {
    initFramebuffers();
    if (logoImage) { rasterizeLogoMask(512); seedFoamWithLogo(); }
  }
});

function splat(x, y, radius, strength) {
  gl.viewport(0, 0, state.width, state.height);
  splatProgram.bind();
  gl.uniform1i(splatProgram.uniforms.uTarget, state.read.attach(0));
  gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(splatProgram.uniforms.point, x, y);
  gl.uniform1f(splatProgram.uniforms.radius, radius);
  gl.uniform1f(splatProgram.uniforms.strength, strength);
  blit(state.write.fbo);
  state.swap();
}
function foamSplat(x, y, radius, strength) {
  gl.viewport(0, 0, foam.width, foam.height);
  splatProgram.bind();
  gl.uniform1i(splatProgram.uniforms.uTarget, foam.read.attach(0));
  gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(splatProgram.uniforms.point, x, y);
  gl.uniform1f(splatProgram.uniforms.radius, radius);
  gl.uniform1f(splatProgram.uniforms.strength, strength);
  blit(foam.write.fbo);
  foam.swap();
}

let lastPointer = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = 1.0 - (e.clientY - rect.top) / rect.height;
  splat(x, y, 0.0025, -CLICK_STRENGTH);
  foamSplat(x, y, FOAM_CLICK_RADIUS, -FOAM_CLICK_STRENGTH);
});
canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = 1.0 - (e.clientY - rect.top) / rect.height;
  if (lastPointer) {
    const dx = x - lastPointer.x, dy = y - lastPointer.y;
    const speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 40.0, 1.0);
    if (speed > 0.02) {
      splat(x, y, 0.0015, -MOVE_STRENGTH * speed);
      foamSplat(x, y, FOAM_MOVE_RADIUS, -FOAM_MOVE_STRENGTH * speed);
    }
  }
  lastPointer = { x, y };
});
canvas.addEventListener('pointerleave', () => { lastPointer = null; });

let lastTime = performance.now();
let autoDropTimer = 0;

function step() {
  gl.viewport(0, 0, state.width, state.height);
  updateProgram.bind();
  gl.uniform2f(updateProgram.uniforms.texelSize, state.texelSizeX, state.texelSizeY);
  gl.uniform1i(updateProgram.uniforms.uState, state.read.attach(0));
  gl.uniform1f(updateProgram.uniforms.damping, DAMPING);
  blit(state.write.fbo);
  state.swap();
}
function foamStep(dt) {
  gl.viewport(0, 0, foam.width, foam.height);
  foamUpdateProgram.bind();
  gl.uniform2f(foamUpdateProgram.uniforms.texelSize, foam.texelSizeX, foam.texelSizeY);
  gl.uniform1i(foamUpdateProgram.uniforms.uFoam, foam.read.attach(0));
  gl.uniform1i(foamUpdateProgram.uniforms.uBaseFoam, baseFoam.attach(1));
  gl.uniform1i(foamUpdateProgram.uniforms.uState, state.read.attach(2));
  gl.uniform1f(foamUpdateProgram.uniforms.recoverRate, FOAM_RECOVER_RATE);
  gl.uniform1f(foamUpdateProgram.uniforms.advectStrength, FOAM_ADVECT_STRENGTH);
  gl.uniform1f(foamUpdateProgram.uniforms.dt, dt);
  blit(foam.write.fbo);
  foam.swap();
}
function render() {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  displayProgram.bind();
  gl.uniform2f(displayProgram.uniforms.texelSize, state.texelSizeX, state.texelSizeY);
  gl.uniform1i(displayProgram.uniforms.uState, state.read.attach(0));
  gl.uniform1i(displayProgram.uniforms.uFoam, foam.read.attach(1));
  blit(null);
}
function frame() {
  // 히어로가 화면에 안 보일 때는 무거운 시뮬레이션(파동/크레마/렌더)을 완전히 멈춰서,
  // 다른 섹션(문구 페이지의 원 애니메이션 등)과 프레임을 두고 경쟁하지 않게 함
  if (heroVisible) {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.033);
    lastTime = now;
    autoDropTimer += dt;
    if (autoDropTimer > AUTO_DROP_INTERVAL) {
      autoDropTimer = 0;
      const x = 0.5 + (Math.random() - 0.5) * 0.5;
      const y = 0.5 + (Math.random() - 0.5) * 0.5;
      splat(x, y, 0.003, -AUTO_DROP_STRENGTH);
      foamSplat(x, y, FOAM_DROP_RADIUS, -FOAM_DROP_STRENGTH);
    }
    step();
    foamStep(dt);
    render();
  } else {
    lastTime = performance.now(); // 다시 보일 때 dt가 확 튀지 않도록 갱신만 해둠
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);