// mobile-nav.js — simple hamburger slide-in nav with accessibility and ARIA announcements
(function(){
  const toggleButtons = Array.from(document.querySelectorAll('.nav-toggle'));
  if (!toggleButtons.length) return;

  const body = document.body;
  const MOBILE_CLASS = 'mobile-nav-open';

  function ensureAnnouncer(){
    let el = document.getElementById('ariaAnnouncer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ariaAnnouncer';
      el.setAttribute('role','status');
      el.setAttribute('aria-live','polite');
      el.className = 'visually-hidden';
      document.body.appendChild(el);
    }
    return el;
  }
  function announce(text){
    const el = ensureAnnouncer();
    // Clear then set to ensure screen-readers detect change
    el.textContent = '';
    setTimeout(() => el.textContent = text, 50);
  }

  function openNav(toggle) {
    body.classList.add(MOBILE_CLASS);
    toggle.setAttribute('aria-expanded', 'true');
    // set focus to first focusable link in nav
    const nav = document.querySelector('.nav-links') || document.querySelector('.nav-menu');
    if (nav) {
      const first = nav.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus();
    }
    // trap focus while open
    document.addEventListener('keydown', handleKeydown);
    announce('Menu opened');
  }

  function closeNav(toggle) {
    body.classList.remove(MOBILE_CLASS);
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', handleKeydown);
    toggle.focus();
    announce('Menu closed');
  }

  function handleKeydown(e){
    if (e.key === 'Escape') {
      // close any open nav
      const open = toggleButtons.find(t => t.getAttribute('aria-expanded') === 'true');
      if (open) closeNav(open);
    }
  }

  toggleButtons.forEach(t => {
    t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', (ev) => {
      const isOpen = t.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeNav(t); else openNav(t);
    });
  });

  // Close when clicking outside the nav on mobile
  document.addEventListener('click', (e) => {
    if (!body.classList.contains(MOBILE_CLASS)) return;
    const nav = document.querySelector('.nav-links') || document.querySelector('.nav-menu');
    const isToggle = e.target.closest('.nav-toggle');
    if (nav && !nav.contains(e.target) && !isToggle) {
      const open = toggleButtons.find(t => t.getAttribute('aria-expanded') === 'true');
      if (open) closeNav(open);
    }
  });
})();
