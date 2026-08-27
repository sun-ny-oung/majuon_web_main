const customCursor = document.getElementById('customCursor');
window.addEventListener('mousemove', (e) => {
  customCursor.style.transform = `translate(${e.clientX - 21.5}px, ${e.clientY - 21.5}px)`;
});
window.addEventListener('mouseleave', () => { customCursor.style.opacity = '0'; });
window.addEventListener('mouseenter', () => { customCursor.style.opacity = '1'; });

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
