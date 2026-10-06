/* Unisex Hairdressers: salongegevens, live openstatus, de spiegel in de hero,
   zoeken in de prijslijst. Laadt vóór boeken.js (die leest window.SALON).
   Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden (Fresha-listing, okt 2026): ma-vr 09-19, za 09-18, zo 10-17.
     Bevestigen bij de eigenaar, zie README. */
  function uren(dag) {
    if (dag === 0) return { van: 10, tot: 17 };
    if (dag === 6) return { van: 9, tot: 18 };
    return { van: 9, tot: 19 };
  }

  window.SALON = {
    naam: 'Unisex Hairdressers',
    sleutel: 'unisexhair',
    telefoon: '020 7709 8338',
    telefoonLink: '+442077098338',
    adres: '639 Commercial Road, London E14 7NT',
    uren: uren,
    dagenVooruit: 14,
    raster: 15,
    voorloop: 15,
    stylisten: [
      { id: 'any', naam: 'Any stylist', rol: 'First free stylist for your time', letter: '' },
      { id: 'oksana', naam: 'Oksana', rol: 'Balayage, toning, colour, cuts, nikah hair', letter: 'O' },
      { id: 'angela', naam: 'Angela', rol: 'Cuts, wash and blow-dry', letter: 'A' },
      { id: 'galina', naam: 'Galina', rol: 'Hairstylist', letter: 'G' },
      { id: 'tania', naam: 'Tania', rol: 'Hairstylist', letter: 'T' },
    ],
  };

  /* ---------- live openstatus ---------- */
  var DAGEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function hhmm(u) { var h = Math.floor(u), m = Math.round((u - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function status() {
    var nu = new Date();
    var t = nu.getHours() + nu.getMinutes() / 60;
    var u = uren(nu.getDay());
    if (t >= u.van && t < u.tot) return { open: true, tekst: 'Open now until ' + hhmm(u.tot) + ', walk-ins welcome' };
    if (t < u.van) return { open: false, tekst: 'Opens today at ' + hhmm(u.van) };
    var morgen = uren((nu.getDay() + 1) % 7);
    return { open: false, tekst: 'Closed now, open tomorrow from ' + hhmm(morgen.van) };
  }
  window.SALON.status = status;
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
  var vandaag = document.querySelector('.uren [data-dag="' + new Date().getDay() + '"]');
  if (vandaag) vandaag.classList.add('vandaag');

  /* ---------- de spiegel: de heldere lens volgt de muis een klein stukje ---------- */
  var spiegel = document.querySelector('[data-spiegel]');
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (spiegel && !kalm && window.matchMedia('(pointer: fine)').matches) {
    var dx = 0, dy = 0, x = 0, y = 0, loopt = false;
    var stap = function () {
      x += (dx - x) * 0.08; y += (dy - y) * 0.08;
      spiegel.style.setProperty('--lx', x.toFixed(3));
      spiegel.style.setProperty('--ly', y.toFixed(3));
      if (Math.abs(dx - x) > 0.002 || Math.abs(dy - y) > 0.002) requestAnimationFrame(stap); else loopt = false;
    };
    spiegel.addEventListener('pointermove', function (e) {
      var r = spiegel.getBoundingClientRect();
      dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!loopt) { loopt = true; requestAnimationFrame(stap); }
    });
    spiegel.addEventListener('pointerleave', function () { dx = 0; dy = 0; if (!loopt) { loopt = true; requestAnimationFrame(stap); } });
  }

  /* ---------- mobiel menu: knoppen in het menu sluiten het ook ---------- */
  var menu = document.querySelector('[data-menu]');
  var menuknop = document.querySelector('[data-menuknop]');
  document.querySelectorAll('[data-menu-sluit]').forEach(function (s) {
    s.addEventListener('click', function () {
      if (!menu || !menu.classList.contains('open')) return;
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (menuknop) menuknop.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- zoeken in de prijslijst ---------- */
  var zoek = document.querySelector('[data-prijs-zoek]');
  if (zoek) {
    var leeg = document.querySelector('[data-zoek-leeg]');
    var groepen = [].slice.call(document.querySelectorAll('[data-prijs-cat]'));
    var beginOpen = groepen.map(function (g) { return g.open; });
    zoek.addEventListener('input', function () {
      var q = zoek.value.trim().toLowerCase();
      var gevonden = 0;
      groepen.forEach(function (g, i) {
        var treffers = 0;
        g.querySelectorAll('.prijs-regel').forEach(function (r) {
          var past = !q || r.getAttribute('data-zoektekst').indexOf(q) !== -1;
          r.hidden = !past;
          if (past) treffers++;
        });
        g.hidden = q && !treffers;
        g.open = q ? treffers > 0 : beginOpen[i];
        gevonden += treffers;
      });
      if (leeg) leeg.hidden = !q || gevonden > 0;
    });
  }
})();
