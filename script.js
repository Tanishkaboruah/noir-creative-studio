/* NOIR® interactions — one Lenis instance, one animation system. */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lenis uses its built-in RAF loop; do not create a second requestAnimationFrame loop.
  let lenis = null;
  if (typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: true,
      lerp: reduceMotion ? 1 : 0.12,
      respectReducedMotion: true,
      stopInertiaOnNavigate: true
    });
  }

  // Reveal elements as they enter the viewport. Reduced-motion users see content immediately.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Small-screen navigation stays keyboard accessible and closes after choosing a section.
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      mobileNav.hidden = true;
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      mobileNav.hidden = isOpen;
    });
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  // A discreet pointer detail on devices that actually have a fine pointer.
  const cursor = document.querySelector('.cursor-dot');
  if (cursor && window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    window.addEventListener('pointermove', (event) => {
      cursor.style.opacity = '1';
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
  }

  // Keep a reference to the instance for debugging without creating another one.
  window.noirLenis = lenis;
});
