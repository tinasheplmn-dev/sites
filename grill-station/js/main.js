/* Grill Station: zaakgegevens, live openstatus, keukenclips.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden: elke dag 12:00-00:00 (opgave online, okt 2026).
     Bevestigen bij de eigenaar, zie README. */
  function uren() { return { van: 12, tot: 24 }; }

  window.ZAAK = {
    naam: 'Grill Station',
    sleutel: 'grillstation',
    bezorgen: false,
    bereidtijd: 20,
    uren: uren,
    tip: { item: 'french-fries', tekst: 'Add a portion of fries?' },
    afhaalNoot: 'Collect at 125 Boscobel Street, NW8 8PS. Pay at the counter.',
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thank you ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') is going on the grill and will be ready ' + tijd + '. Collect it at 125 Boscobel Street and pay at the counter.'; },
  };

  /* ---------- live openstatus ---------- */
  function hhmm(u) { if (u >= 24) return 'midnight'; var h = Math.floor(u), m = Math.round((u - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function status() {
    var nu = new Date();
    var t = nu.getHours() + nu.getMinutes() / 60;
    var u = uren(nu.getDay());
    if (u && t >= u.van && t < u.tot) return { open: true, tekst: 'Open now until ' + hhmm(u.tot) };
    if (u && t < u.van) return { open: false, tekst: 'Opens today at ' + hhmm(u.van) };
    for (var d = 1; d < 7; d++) {
      var v = uren((nu.getDay() + d) % 7);
      if (v) return { open: false, tekst: 'Closed now, open ' + (d === 1 ? 'tomorrow' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(nu.getDay() + d) % 7]) + ' from ' + hhmm(v.van) };
    }
    return { open: false, tekst: 'Closed now' };
  }
  function toonStatus() {
    var s = status();
    document.querySelectorAll('[data-openstatus]').forEach(function (el) {
      var t = el.querySelector('[data-openstatus-tekst]') || el;
      t.textContent = s.tekst;
      el.classList.toggle('dicht', !s.open);
    });
  }
  toonStatus();
  setInterval(toonStatus, 60000);
  var vandaag = document.querySelector('[data-dag="' + new Date().getDay() + '"]');
  if (vandaag) vandaag.classList.add('vandaag');

  /* ---------- hero-video: laadt pas na de poster, niet bij databesparen of minder beweging ---------- */
  var video = document.querySelector('[data-hero-video]');
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zuinig = navigator.connection && navigator.connection.saveData;
  if (video && !kalm && !zuinig) {
    var bron = window.matchMedia('(max-width: 640px)').matches && video.getAttribute('data-src-mobiel') ? video.getAttribute('data-src-mobiel') : video.getAttribute('data-src');
    var start = function () {
      video.src = bron;
      video.addEventListener('playing', function () { video.classList.add('speelt'); }, { once: true });
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    };
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
  }

  /* ---------- zwevende reserveerknop pas na de hero (mobiel, zie CSS) ---------- */
  var heroEl = document.querySelector('.hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { document.documentElement.classList.toggle('voorbij-hero', !e[0].isIntersecting); }).observe(heroEl);
  } else document.documentElement.classList.add('voorbij-hero');

  /* ---------- mobiel menu: ook de sluitknop in het menu ---------- */
  var menu = document.querySelector('[data-menu]');
  var knop = document.querySelector('[data-menuknop]');
  document.querySelectorAll('[data-menu-sluit]').forEach(function (s) {
    s.addEventListener('click', function () {
      if (!menu) return;
      menu.classList.remove('open');
      if (knop) { knop.setAttribute('aria-expanded', 'false'); knop.focus(); }
      document.documentElement.style.overflow = '';
    });
  });

  /* ---------- keukenclips: spelen alleen in beeld, altijd zonder geluid ---------- */
  var clips = document.querySelectorAll('[data-clip]');
  if (clips.length && !kalm && !zuinig && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        var v = it.target;
        if (it.isIntersecting) {
          if (!v.src) v.src = v.getAttribute('data-clip');
          v.muted = true;
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (v.src) v.pause();
      });
    }, { rootMargin: '120px 0px', threshold: .25 });
    clips.forEach(function (v) { io.observe(v); });
  }
})();

/* Menukaart: op mobiel alleen de eerste groep open (fail-open: de HTML zet de eerste twee open) */
(function () {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('.kaart-groep').forEach(function (d, i) { if (i > 0) d.removeAttribute('open'); });
})();
