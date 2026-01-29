// Loads navbar and footer partials, initializes mobile menu and active link state
(async function () {
  async function inject(id, url) {
    const host = document.getElementById(id);
    if (!host) return;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    host.innerHTML = await res.text();
  }

  // Load partials in parallel
  await Promise.all([
    inject("navbar", "./nav.html"),
    inject("footer", "./footer.html"),
  ]);

  // After injection, initialize features
  initActiveLinks();
  initMenu();

  function initMenu() {
    // Ensure only one overlay exists (remove duplicates if any)
    const overlays = Array.from(document.querySelectorAll('#overlay'));
    overlays.forEach((el, i) => { if (i > 0) el.remove(); });
    const overlay = document.getElementById('overlay');
    if (!overlay) return;

    overlay.inert = true;

    const openBtnSelector = '[data-open-menu]';
    const closeBtnSelector = '[data-close-menu]';
    const panel = () => overlay.querySelector('.overlay-nav');

    function openMenu() {
      overlay.inert = false;               // show in a11y tree
      overlay.classList.add('open');        // show visually
      const btn = document.querySelector(openBtnSelector);
      if (btn) btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Move focus inside the dialog (close button or first link)
      const focusTarget =
        overlay.querySelector(closeBtnSelector) ||
        overlay.querySelector('a, button');
      if (focusTarget) focusTarget.focus();
    }

  function closeMenu() {
    const btn = document.querySelector(openBtnSelector);
    overlay.classList.remove('open');      // start fade-out

    const onEnd = () => {
      overlay.inert = true;                // remove from a11y/tab after fade
      document.body.style.overflow = '';
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    };

    // Ensure we run after transition; fallback timer in case transition is interrupted
    overlay.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(onEnd, 300);
  }

    // Delegated click handling
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest(openBtnSelector);
      if (openBtn) {
        e.preventDefault();
        openMenu();
        return;
      }
      const closeBtn = e.target.closest(closeBtnSelector);
      if (closeBtn) {
        e.preventDefault();
        closeMenu();
        return;
      }
      // Click outside the panel closes it
      if (overlay.classList.contains('open')) {
        const panel = overlay.querySelector('.overlay-nav');
        if (panel && !panel.contains(e.target) && !e.target.closest(openBtnSelector)) {
          closeMenu();
        }
      }
    });

    // Close when clicking any link inside overlay
    overlay.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) closeMenu();
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeMenu();
      }
    });
  }


  function initActiveLinks() {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    let key = 'portfolio';
    if (path.includes('about')) key = 'about';
    if (path.includes('contact')) key = 'contact';

    document.querySelectorAll(`a[data-nav]`).forEach(a => {
      if (a.getAttribute('data-nav') === key) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }
})();
