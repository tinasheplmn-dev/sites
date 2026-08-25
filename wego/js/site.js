/* WeGo Academy: interactie en motion.
   Eén concept: de gouden lijn van de professor. De lijn schrijft mee met je
   scroll, iconen en onderstrepingen tekenen zichzelf, secties komen rustig op. */
(function () {
  'use strict';

  const beperk = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Dev-schakelaar: ?alles toont alle reveals direct (voor screenshots/tests) */
  if (location.search.indexOf('alles') !== -1) {
    document.documentElement.classList.add('toon-alles');
  }

  /* ---------- Header rand bij scroll ---------- */
  const header = document.querySelector('.site-header');
  const zetHeader = () => header && header.classList.toggle('op-scroll', window.scrollY > 8);
  zetHeader();

  /* ---------- Mobiel menu ---------- */
  const menuKnop = document.querySelector('.menu-knop');
  if (menuKnop) {
    menuKnop.addEventListener('click', function () {
      const open = document.body.classList.toggle('menu-open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.menu-overlay a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        menuKnop.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- De gouden lijn (scrollvoortgang) ---------- */
  const wortel = document.documentElement;
  let ticker = false;
  function zetScroll() {
    const h = wortel.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    wortel.style.setProperty('--scroll', p.toFixed(4));
    zetHeader();
    zetRoute();
    ticker = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticker) { ticker = true; requestAnimationFrame(zetScroll); }
  }, { passive: true });
  window.addEventListener('resize', zetScroll);

  /* ---------- Routelijn op de rijlessenpagina ---------- */
  const route = document.querySelector('.route');
  function zetRoute() {
    if (!route) return;
    const r = route.getBoundingClientRect();
    const zicht = window.innerHeight;
    const p = Math.min(1, Math.max(0, (zicht * 0.78 - r.top) / r.height));
    route.style.setProperty('--routescroll', p.toFixed(4));
  }

  /* ---------- Reveals ---------- */
  const kijker = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (item.isIntersecting) {
        item.target.classList.add('zichtbaar');
        kijker.unobserve(item.target);
      }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .teken').forEach(function (el) { kijker.observe(el); });

  /* ---------- Iconen: lijnlengte meten zodat ze zichzelf tekenen ---------- */
  if (!beperk) {
    document.querySelectorAll('.teken svg .t').forEach(function (vorm) {
      if (typeof vorm.getTotalLength === 'function') {
        try {
          const len = Math.ceil(vorm.getTotalLength()) + 2;
          vorm.style.setProperty('--len', len);
        } catch (e) { /* vorm zonder lengte, prima */ }
      }
    });
  }

  /* ---------- Onderstreping in de hero tekent zichzelf ---------- */
  const streek = document.querySelector('.hero h1 .accent svg path');
  if (streek && !beperk && !document.documentElement.classList.contains('toon-alles')) {
    const len = streek.getTotalLength();
    streek.style.strokeDasharray = len;
    streek.style.strokeDashoffset = len;
    setTimeout(function () {
      streek.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.22,.8,.24,1)';
      streek.style.strokeDashoffset = '0';
    }, 900);
  }

  /* ---------- Proefles-formulier: netjes doorzetten naar WhatsApp ---------- */
  const form = document.querySelector('#proefles-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const naam = form.querySelector('#veld-naam').value.trim();
      const tel = form.querySelector('#veld-tel').value.trim();
      const bakSel = form.querySelector('#veld-bak');
      const bak = bakSel ? bakSel.value : '';
      if (!naam || !tel) return;
      let tekst = 'Hallo Hikmat, ik wil graag een proefles plannen. Mijn naam is ' + naam + ' en mijn telefoonnummer is ' + tel + '.';
      if (bak && bak !== 'weet ik nog niet') tekst += ' Ik wil graag ' + bak + ' leren rijden.';
      window.open('https://wa.me/31616053413?text=' + encodeURIComponent(tekst), '_blank', 'noopener');
      const noot = document.querySelector('.form-verzonden');
      if (noot) noot.hidden = false;
    });
  }

  zetScroll();
})();
