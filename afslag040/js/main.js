/* Rijschool Afslag 040 · interactie
   Eén motion-idee: de belijning wijst de weg. */
(function () {
  'use strict';

  var verminderMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header ---------- */
  var header = document.querySelector('.site-header');
  function headerStand() {
    if (window.scrollY > 24) header.classList.add('vast');
    else header.classList.remove('vast');
  }
  window.addEventListener('scroll', headerStand, { passive: true });
  headerStand();

  /* ---------- mobiel menu ---------- */
  var menuKnop = document.querySelector('.menu-knop');
  if (menuKnop) {
    menuKnop.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mobiel-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- wegkant-rail: gouden stip volgt de scroll ---------- */
  var voertuig = document.querySelector('.wegrail .voertuig');
  var kms = document.querySelectorAll('.wegrail .km');
  if (voertuig) {
    var railTick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      var top = 8 + p * 84; /* tussen 8% en 92% van het scherm */
      voertuig.style.top = top + '%';
      kms.forEach(function (km) {
        var eigen = parseFloat(km.dataset.bij || '0');
        km.classList.toggle('zichtbaar', p >= eigen - 0.04);
      });
    };
    window.addEventListener('scroll', railTick, { passive: true });
    railTick();
  }

  /* ---------- reveal-choreografie ---------- */
  var kijker = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('zichtbaar');
        kijker.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .reveal-bord').forEach(function (el) { kijker.observe(el); });

  /* vangnet: bij diepe sprongen (deeplink, terug-navigatie) alles tonen dat
     al boven of binnen de kijklijn staat, ook als de observer het miste */
  function revealVangnet() {
    document.querySelectorAll('.reveal:not(.zichtbaar), .reveal-bord:not(.zichtbaar)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('zichtbaar');
    });
  }
  window.addEventListener('scroll', revealVangnet, { passive: true });
  window.addEventListener('load', revealVangnet);

  /* ---------- tellers (4,9 / 55 / 36) ---------- */
  function telOp(el) {
    var doel = parseFloat(el.dataset.tel);
    var decimalen = (el.dataset.tel.indexOf('.') > -1) ? 1 : 0;
    var duur = 1400, start = null;
    function stap(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / duur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (doel * eased).toFixed(decimalen).replace('.', ',');
      if (p < 1) requestAnimationFrame(stap);
    }
    if (verminderMotion) { el.textContent = String(doel).replace('.', ','); return; }
    requestAnimationFrame(stap);
  }
  var telKijker = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { telOp(e.target); telKijker.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-tel]').forEach(function (el) { telKijker.observe(el); });

  /* ---------- pakketten: schakel / automaat ---------- */
  var transKnoppen = document.querySelectorAll('.transmissie button');
  if (transKnoppen.length) {
    transKnoppen.forEach(function (knop) {
      knop.addEventListener('click', function () {
        transKnoppen.forEach(function (k) { k.classList.remove('actief'); });
        knop.classList.add('actief');
        var automaat = knop.dataset.trans === 'automaat';
        document.querySelectorAll('.pakket-prijs [data-basis]').forEach(function (el) {
          var basis = parseInt(el.dataset.basis, 10);
          var prijs = automaat ? basis + 100 : basis;
          el.textContent = '€' + prijs.toLocaleString('nl-NL');
        });
        document.querySelectorAll('.automaat-noot').forEach(function (n) {
          n.textContent = automaat ? 'prijs incl. automaat-toeslag' : 'schakelauto';
        });
      });
    });
  }

  /* ---------- proefles-formulier: opent WhatsApp met ingevuld bericht ---------- */
  var form = document.getElementById('proefles-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = form.querySelector('[name="naam"]').value.trim();
      var tel = form.querySelector('[name="telefoon"]').value.trim();
      var trans = form.querySelector('[name="transmissie"]:checked');
      var bericht = form.querySelector('[name="bericht"]');
      var regels = [
        'Hoi Rijschool Afslag 040! Ik wil graag een gratis proefles.',
        'Naam: ' + naam,
        'Telefoon: ' + tel,
        'Lesauto: ' + (trans ? trans.value : 'geen voorkeur')
      ];
      if (bericht && bericht.value.trim()) regels.push('Extra: ' + bericht.value.trim());
      var url = 'https://wa.me/31629565177?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }
})();
