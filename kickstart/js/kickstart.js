/* Rijschool Kickstart · gedrag
   Eén motion-concept: alles vertrekt uit stilstand.
   - startlicht in de hero telt af naar groen, dan lanceert de typografie
   - secties komen binnen met dezelfde launch-beweging (IntersectionObserver)
   - de toerenteller bovenin loopt met de scroll mee */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toerenteller ---------- */
  var teller = document.querySelector('.toerenteller i');
  if (teller) {
    var tick = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      teller.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ---------- vaste header ---------- */
  var kop = document.querySelector('.site-kop');
  if (kop) {
    var vast = function () { kop.classList.toggle('vast', window.scrollY > 24); };
    window.addEventListener('scroll', vast, { passive: true });
    vast();
  }

  /* ---------- mobiel menu ---------- */
  var menuKnop = document.querySelector('.menu-knop');
  var nav = document.querySelector('.hoofdnav');
  if (menuKnop && nav) {
    menuKnop.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        menuKnop.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- startlicht-sequentie (hero) ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var rood = hero.querySelector('.lamp.rood');
    var geel = hero.querySelector('.lamp.geel');
    var groen = hero.querySelector('.lamp.groen');
    var go = function () { hero.classList.add('go'); };
    if (reduced || !rood) {
      if (groen) groen.classList.add('aan');
      go();
    } else {
      setTimeout(function () { rood.classList.add('aan'); }, 250);
      setTimeout(function () { geel.classList.add('aan'); }, 800);
      setTimeout(function () {
        rood.classList.remove('aan');
        geel.classList.remove('aan');
        groen.classList.add('aan');
        go();
      }, 1350);
    }
  }

  /* ---------- launch reveals ---------- */
  var doelen = Array.prototype.slice.call(document.querySelectorAll('[data-launch]'));
  var toonInBeeld = function () {
    doelen = doelen.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 40 && r.bottom > 0) {
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
  };
  if (reduced) {
    doelen.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      doelen.forEach(function (el) { io.observe(el); });
    }
    /* vangnet naast de observer, zodat niets onzichtbaar kan blijven */
    window.addEventListener('scroll', toonInBeeld, { passive: true });
    toonInBeeld();
    setTimeout(toonInBeeld, 600);
    setTimeout(toonInBeeld, 1800);
  }

  /* ---------- carrousel ---------- */
  document.querySelectorAll('.carrousel').forEach(function (car) {
    var baan = car.querySelector('.baan');
    var dias = car.querySelectorAll('.dia');
    var vorige = car.parentElement.querySelector('[data-vorige]');
    var volgende = car.parentElement.querySelector('[data-volgende]');
    var i = 0;
    var toon = function (n) {
      i = (n + dias.length) % dias.length;
      baan.style.transform = 'translateX(-' + i * 100 + '%)';
    };
    if (vorige) vorige.addEventListener('click', function () { toon(i - 1); });
    if (volgende) volgende.addEventListener('click', function () { toon(i + 1); });
    if (!reduced) setInterval(function () { toon(i + 1); }, 7000);
  });

  /* ---------- proefles-formulier: opent WhatsApp ---------- */
  var form = document.querySelector('#proefles-formulier');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (naam) {
        var el = form.querySelector('[name="' + naam + '"]');
        return el ? el.value.trim() : '';
      };
      var regels = [
        'Hoi Bekir! Ik wil graag een proefles plannen.',
        'Naam: ' + v('naam'),
        'Telefoon: ' + v('telefoon'),
        'Leeftijd: ' + v('leeftijd')
      ];
      if (v('bericht')) regels.push('Extra: ' + v('bericht'));
      var url = 'https://wa.me/31687899608?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
      var melding = document.querySelector('#formulier-melding');
      if (melding) {
        melding.hidden = false;
        melding.textContent = 'WhatsApp opent met je aanvraag. Verstuur het bericht daar en Bekir reageert snel.';
      }
    });
  }
})();
