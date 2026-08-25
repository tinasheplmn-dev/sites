/* Rijschool Simplicity — gedeelde interactie
   Eén motion-taal: kalme, precieze onthullingen ("de vaste hand"). */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var pageLang = docEl.lang === 'en' ? 'en' : 'nl';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- taalvoorkeur ---------- */
  var LANG_KEY = 'simplicity-lang';
  function altUrl() {
    var a = document.querySelector('.lang-switch a[data-lang="' + (pageLang === 'nl' ? 'en' : 'nl') + '"]');
    return a ? a.getAttribute('href') : null;
  }
  try {
    var stored = localStorage.getItem(LANG_KEY);
    var cameFromSite = document.referrer && document.referrer.indexOf(location.host) !== -1;
    var isRoot = location.pathname === '/' || location.pathname === '/index.html';
    /* Alleen de kale homepage stuurt door naar de onthouden taal.
       Een directe link naar een EN- of NL-pagina respecteren we altijd. */
    if (isRoot && stored === 'en' && !cameFromSite) {
      var target = altUrl();
      if (target) { location.replace(target); return; }
    }
    if (!stored) localStorage.setItem(LANG_KEY, pageLang);
  } catch (e) { /* localStorage niet beschikbaar */ }

  document.querySelectorAll('.lang-switch a').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem(LANG_KEY, a.dataset.lang); } catch (e) {}
    });
  });

  /* ---------- header: vast, verbergen bij omlaag scrollen ---------- */
  var header = document.querySelector('.site-header');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-solid', y > 24);
      if (y > 480 && y > lastY && !document.body.classList.contains('menu-open')) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
    }
    lastY = y;
    updateProgress();
  }

  /* ---------- voortgang: lijn + autoglyph ---------- */
  var progBar = document.querySelector('.drive-progress__bar');
  var progCar = document.querySelector('.drive-progress__car');
  function updateProgress() {
    if (!progBar) return;
    var max = docEl.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progBar.style.width = (p * 100) + '%';
    if (progCar) progCar.style.left = (p * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateProgress);

  /* ---------- mobiel menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- onthullingen ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
        if (entry.target.hasAttribute('data-count')) runCounter(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }) : null;

  document.querySelectorAll('.reveal, .reveal-img, .mask-lines, [data-count]').forEach(function (el) {
    if (io && !reduced) io.observe(el);
    else { el.classList.add('is-in'); if (el.hasAttribute('data-count')) setFinal(el); }
  });

  /* ---------- tellers ---------- */
  function setFinal(el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); }
  function runCounter(el) {
    var raw = el.dataset.count;
    var isDecimal = raw.indexOf(',') !== -1;
    var end = parseFloat(raw.replace(',', '.'));
    var suffix = el.dataset.suffix || '';
    var t0 = null, dur = 1400;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = end * eased;
      el.textContent = (isDecimal ? val.toFixed(1).replace('.', ',') : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- hero geladen ---------- */
  function heroIn() {
    document.body.classList.add('is-loaded');
    var heroLines = document.querySelector('.hero .mask-lines, .hero-split .mask-lines');
    if (heroLines) heroLines.classList.add('is-in');
    updateProgress();
  }
  window.addEventListener('load', heroIn);
  setTimeout(heroIn, 1400);

  /* ---------- mobiele actiebalk: tonen na de hero ---------- */
  var mobileCta = document.querySelector('.mobile-cta');
  if (mobileCta) {
    var showAfter = window.innerHeight * 0.7;
    window.addEventListener('scroll', function () {
      mobileCta.classList.toggle('is-on', window.scrollY > showAfter);
    }, { passive: true });
  }

  /* ---------- proefles-formulier: opent WhatsApp met samenvatting ---------- */
  var form = document.getElementById('proefles-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var isEN = pageLang === 'en';
      var lines = isEN ? [
        'Hi Rijschool Simplicity! I would like to book a trial lesson.',
        'Name: ' + d.get('naam'),
        'Phone or email: ' + d.get('contact'),
        'Lesson language: ' + d.get('taal'),
        'Transmission: ' + d.get('transmissie'),
        'City: ' + d.get('plaats')
      ] : [
        'Hoi Rijschool Simplicity! Ik wil graag een proefles boeken.',
        'Naam: ' + d.get('naam'),
        'Telefoon of e-mail: ' + d.get('contact'),
        'Lestaal: ' + d.get('taal'),
        'Schakel of automaat: ' + d.get('transmissie'),
        'Plaats: ' + d.get('plaats')
      ];
      var msg = d.get('bericht');
      if (msg) lines.push((isEN ? 'Note: ' : 'Opmerking: ') + msg);
      var url = 'https://wa.me/31614350854?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
      var done = document.getElementById('form-done');
      if (done) done.hidden = false;
    });
  }

  /* ---------- jaartal ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  onScroll();
})();
