/* The Captain's Table: zaakgegevens, live openstatus, mobiel menu.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden volgens Google: maandag t/m zaterdag 11:00-21:00, zondag gesloten.
     Bevestigen bij de eigenaar, zie README. */
  function uren(dag) { return dag === 0 ? null : { van: 11, tot: 21 }; }

  window.ZAAK = {
    naam: "The Captain's Table",
    sleutel: 'captainstable',
    bezorgen: false,
    bereidtijd: 20,
    uren: uren,
    tip: { item: 'curry-sauce', tekst: 'Add a tub of curry sauce for your chips?' },
    afhaalNoot: 'Collect at 16 Market Way, Chrisp Street Market, E14 6AH. Fresh cod can take an extra 15 to 20 minutes when it is busy: it is fried when you order.',
    betaalNoot: 'No online payment: pay in cash when you collect.',
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thank you ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') is in the kitchen and will be ready ' + tijd + '. Collect it at 16 Market Way in Chrisp Street Market and pay in cash when you collect.'; },
  };

  /* ---------- live openstatus ---------- */
  function hhmm(u) { var h = Math.floor(u), m = Math.round((u - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
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

})();

/* Menukaart: op mobiel alleen de eerste groep open (fail-open: de HTML zet de eerste open) */
(function () {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('.kaart-groep').forEach(function (d, i) { if (i > 0) d.removeAttribute('open'); });
})();
