(()=>{
 const button=document.querySelector('.story-menu-toggle');
 const menu=document.getElementById('story-mobile-nav');
 function setOpen(open){button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');menu.hidden=!open;}
 button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
 menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){setOpen(false);button.focus();}});
 document.addEventListener('click',event=>{if(!event.target.closest('.story-header'))setOpen(false);});
 matchMedia('(min-width:641px)').addEventListener('change',event=>{if(event.matches)setOpen(false);});
})();

// ---------- 카카오톡 인앱 브라우저에서 스마트스토어가 로그인을 요구하는 문제 우회 ----------
(()=>{
 if(!/KAKAOTALK/i.test(navigator.userAgent))return;
 document.querySelectorAll('a[href*="smartstore.naver.com"]').forEach(link=>{
  link.addEventListener('click',event=>{
   event.preventDefault();
   location.href='kakaotalk://web/openExternal?url='+encodeURIComponent(link.href);
  });
 });
})();
