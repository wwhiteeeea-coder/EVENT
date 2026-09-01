// mobile-nav.js — simple hamburger slide-in nav with accessibility
(function(){
  const toggleButtons = Array.from(document.querySelectorAll('.nav-toggle'));
  if (!toggleButtons.length) return;

  const body = document.body;
  const MOBILE_CLASS = 'mobile-nav-open';

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
  }

  function closeNav(toggle) {
    body.classList.remove(MOBILE_CLASS);
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', handleKeydown);
    toggle.focus();
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
