/* Frank's Cafe: zaakgegevens, live openstatus, menubord-letters, mobiel menu.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden (brief): maandag t/m vrijdag 07:30-16:00, zaterdag 07:30-14:00, zondag gesloten.
     Bevestigen bij de eigenaar, zie README. */
  function uren(dag) {
    if (dag === 0) return null;
    if (dag === 6) return { van: 7.5, tot: 14 };
    return { van: 7.5, tot: 16 };
  }

  window.ZAAK = {
    naam: "Frank's Cafe",
    sleutel: 'frankscafe',
    bezorgen: false,
    bereidtijd: 15,
    uren: uren,
    tip: { item: 'mug-of-tea', tekst: 'A mug of tea with that?' },
    afhaalNoot: "Collect at 641 Commercial Road, E14 7NT. Everything is cooked when you order, so it is hot when you walk in.",
    betaalNoot: 'No online payment: pay in cash when you collect.',
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thanks ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') is with the kitchen and will be ready ' + tijd + '. Collect it at 641 Commercial Road and pay in cash at the counter.'; },
  };

  /* ---------- live openstatus ---------- */
  var DAGEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function hhmm(u) { var h = Math.floor(u), m = Math.round((u - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function status() {
    var nu = new Date();
    var t = nu.getHours() + nu.getMinutes() / 60;
    var u = uren(nu.getDay());
    if (u && t >= u.van && t < u.tot) return { open: true, tekst: 'Open now until ' + hhmm(u.tot) };
    if (u && t < u.van) return { open: false, tekst: 'Opens today at ' + hhmm(u.van) };
    for (var d = 1; d < 7; d++) {
      var v = uren((nu.getDay() + d) % 7);
      if (v) return { open: false, tekst: 'Closed now, open ' + (d === 1 ? 'tomorrow' : DAGEN[(nu.getDay() + d) % 7]) + ' from ' + hhmm(v.van) };
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

  /* ---------- menubord: losse letters die in het vilt worden gedrukt ----------
     De tekst staat gewoon in de HTML (fail-open). Hier alleen in spans knippen,
     de CSS laat ze na elkaar verschijnen zodra het bord .in krijgt. */
  document.querySelectorAll('[data-letters]').forEach(function (el) {
    var tekst = el.textContent;
    el.setAttribute('aria-label', tekst);
    el.textContent = '';
    var n = 0;
    tekst.split(' ').forEach(function (woord, wi) {
      var w = document.createElement('span');
      w.className = 'bord-woord';
      w.setAttribute('aria-hidden', 'true');
      woord.split('').forEach(function (l) {
        var s = document.createElement('span');
        s.className = 'bord-letter';
        s.textContent = l;
        s.style.setProperty('--l', n++);
        s.style.setProperty('--r', (((n * 37) % 7) - 3) * 0.6 + 'deg');
        w.appendChild(s);
      });
      el.appendChild(w);
      if (wi < tekst.split(' ').length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- hero: de gevel zakt iets trager weg dan de pagina (alleen desktop, alleen met muis) ---------- */
  var heroBeeld = document.querySelector('.hero-beeld');
  if (heroBeeld && window.matchMedia('(min-width: 861px) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var bezig = false;
    var zet = function () { bezig = false; heroBeeld.style.setProperty('--hero-y', (-Math.min(window.scrollY * 0.18, 40)).toFixed(1) + 'px'); };
    window.addEventListener('scroll', function () { if (!bezig) { bezig = true; requestAnimationFrame(zet); } }, { passive: true });
  }

  /* ---------- mobiel menu: ook de sluitknop in het menu ---------- */
  var menu = document.querySelector('[data-menu]');
  var knop = document.querySelector('[data-menuknop]');
  document.querySelectorAll('[data-menu-sluit]').forEach(function (s) {
    s.addEventListener('click', function () {
      if (!menu) return;
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      if (knop) { knop.setAttribute('aria-expanded', 'false'); knop.focus(); }
      document.body.style.overflow = '';
    });
  });
})();

/* Menukaart: op mobiel alleen de eerste groep open (fail-open: de HTML zet de eerste open) */
(function () {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('.kaart-groep').forEach(function (d, i) { if (i > 0) d.removeAttribute('open'); });
})();
