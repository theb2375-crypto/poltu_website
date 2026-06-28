// ── Hamburger menu ──────────────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Mobile hero typewriter ───────────────────────────────────────
(function () {
  if (window.innerWidth >= 768) return;

  const titleEl = document.querySelector('.hero-title');
  if (!titleEl) return;

  const span1   = document.createElement('span');
  const br      = document.createElement('br');
  const span2   = document.createElement('span');
  span2.className = 'accent';
  const cursor  = document.createElement('span');
  cursor.className = 'hero-cursor';
  cursor.textContent = '|';

  titleEl.innerHTML = '';
  titleEl.append(span1, br, span2, cursor);
  br.style.display = 'none';

  const WORD1 = 'Democracy';
  const WORD2 = 'Reimagined';
  const TYPE  = 80;
  const BACK  = 48;
  const PAUSE_FULL  = 1800;
  const PAUSE_EMPTY = 500;

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function run() {
    while (true) {
      for (let i = 1; i <= WORD1.length; i++) {
        span1.textContent = WORD1.slice(0, i);
        await sleep(TYPE);
      }
      br.style.display = '';
      for (let i = 1; i <= WORD2.length; i++) {
        span2.textContent = WORD2.slice(0, i);
        await sleep(TYPE);
      }

      await sleep(PAUSE_FULL);

      for (let i = WORD2.length - 1; i >= 0; i--) {
        span2.textContent = WORD2.slice(0, i);
        await sleep(BACK);
      }
      br.style.display = 'none';
      for (let i = WORD1.length - 1; i >= 0; i--) {
        span1.textContent = WORD1.slice(0, i);
        await sleep(BACK);
      }

      await sleep(PAUSE_EMPTY);
    }
  }

  run();
})();

// ── Scroll-reveal animations ─────────────────────────────────────
(function () {
  // Tag an element with animation type + optional stagger delay
  function tag(el, type, delayMs) {
    if (!el) return;
    el.dataset.anim = type;
    if (delayMs) el.style.setProperty('--sd', delayMs + 'ms');
  }

  // Section header trio — each section's label/title/sub cascade
  document.querySelectorAll('.section-label').forEach(el => tag(el, 'scale', 0));
  document.querySelectorAll('.section-title').forEach(el => tag(el, 'up',  110));
  document.querySelectorAll('.section-sub'  ).forEach(el => tag(el, 'up',  200));

  // Staggered card groups — delay resets per CSS group index
  function stagger(selector, type, stepMs) {
    document.querySelectorAll(selector).forEach((el, i) => tag(el, type, i * stepMs));
  }

  stagger('.feature-card',              'up',    85);
  stagger('.how-card',                  'up',   105);
  stagger('.roadmap-item',              'left',  75);
  stagger('.media-card',                'up',    80);
  // clip-cards intentionally excluded — data-anim writes transform:none on reveal,
  // which would kill the CSS rotation tilt from :nth-child rules
  stagger('.phone-item',                'up',    80);
  stagger('.faq-item',                  'up',    50);
  stagger('.compare-row:not(.head)',    'left',  55);
  stagger('.stat',                      'up',    80);

  // One-offs (guard against null — element may have been removed from HTML)
  const _wf = document.querySelector('.waitlist-form');
  if (_wf) tag(_wf, 'up', 0);

  // Single observer fires once per element
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.10,
    rootMargin: '0px 0px -48px 0px'   // trigger slightly before fully in view
  });

  document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));
})();
