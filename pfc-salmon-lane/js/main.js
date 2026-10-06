/* PFC Salmon Lane: zaakgegevens, live openstatus, menukaart op mobiel.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden: elke dag 11:30-22:00 (Just Eat, okt 2026; directories noemen 11:00-23:00).
     Bevestigen bij de eigenaar, zie README. Een sluittijd na middernacht mag als 24 + uren (25 = 01:00). */
  function uren() { return { van: 11.5, tot: 22 }; }

  window.ZAAK = {
    naam: 'PFC Salmon Lane',
    sleutel: 'pfc-salmon-lane',
    bezorgen: true,
    bereidtijd: 15,
    bereidtijdBezorgen: 35,
    /* VOORLOPIG (open punt in README): bezorggebied, -kosten en minimum zijn nog niet bevestigd */
    bezorgPostcodes: ['E14', 'E3', 'E1', 'E1W'],
    bezorgKosten: 2.00,
    bezorgMinimum: 10,
    uren: uren,
    tip: { item: 'red-sauce', tekst: 'Add a pot of red sauce?' },
    afhaalNoot: 'Collect at 106 Salmon Lane, E14 7PQ. Pay at the counter.',
    bezorgNoot: 'We deliver to E14, E3 and E1 postcodes. Pay when your order arrives.',
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thanks ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') goes in the fryer now and will be ready ' + tijd + '. Collect it at 106 Salmon Lane and pay at the counter.'; },
    bevestigBezorgen: function (naam, n, tot, tijd) { return 'Thanks ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') goes in the fryer now. We deliver ' + tijd + ' and you pay when it arrives.'; },
  };

  /* ---------- live openstatus (rekent ook met tijden na middernacht) ---------- */
  var DAGEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function hhmm(u) { u = u % 24; if (u === 0) return 'midnight'; var h = Math.floor(u), m = Math.round((u - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function status() {
    var nu = new Date();
    var t = nu.getHours() + nu.getMinutes() / 60;
    var gister = uren((nu.getDay() + 6) % 7);
    if (gister && gister.tot > 24 && t + 24 < gister.tot) return { open: true, tekst: 'Open now until ' + hhmm(gister.tot) };
    var u = uren(nu.getDay());
    if (u && t >= u.van && t < u.tot) return { open: true, tekst: 'Open now until ' + hhmm(u.tot) };
    if (u && t < u.van) return { open: false, tekst: 'Closed now, opens today at ' + hhmm(u.van) };
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
})();

/* Menukaart: op mobiel alleen de eerste groep open (fail-open: de HTML zet alleen de eerste open) */
(function () {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('.kaart-groep').forEach(function (d, i) { if (i > 0) d.removeAttribute('open'); });
})();
