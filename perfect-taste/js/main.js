/* Perfect Taste: zaakgegevens, live openstatus, cateringaanvraag, zegel.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden: elke dag 11:00-22:45 (Just Eat en Uber Eats, okt 2026).
     Een sluittijd na middernacht zou als 24 + uren staan (25.5 = 01:30); de
     status en de tijdsloten in bestellen.js kunnen dat aan. Bevestigen, zie README. */
  function uren() { return { van: 11, tot: 22.75 }; }

  window.ZAAK = {
    naam: 'Perfect Taste',
    sleutel: 'perfecttaste',
    bezorgen: true,
    bereidtijd: 25,
    uren: uren,
    tip: { item: 'green-chilli-sauce', tekst: 'Add a pot of green chilli sauce?' },
    afhaalNoot: 'Collect at 47C Abbott Road, E14 0NA. Pay at the counter.',
    bezorgNoot: 'The shop calls you to confirm your address is in range and any delivery charge before cooking. Pay on delivery.',
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thank you ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') will be ready ' + tijd + '. Collect it at 47C Abbott Road and pay at the counter.'; },
    bevestigBezorgen: function (naam, n, tot, tijd) { return 'Thank you ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') is in. The shop calls you to confirm your address, then delivers ' + tijd + '. You pay on delivery.'; },
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

  /* ---------- mobiel menu: ook de sluitknop in het menu ---------- */
  var menu = document.querySelector('[data-menu]');
  var knop = document.querySelector('[data-menuknop]');
  document.querySelectorAll('[data-menu-sluit]').forEach(function (s) {
    s.addEventListener('click', function () {
      if (!menu) return;
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (knop) knop.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- het zegel: ring draait mee met scrollen (alleen als beweging mag) ---------- */
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ring = document.querySelector('.zegel-hero .zegel-ring');
  if (ring && !kalm) {
    var bezig = false;
    var draai = function () {
      bezig = false;
      ring.style.transform = 'rotate(' + (window.scrollY * 0.12).toFixed(1) + 'deg)';
    };
    window.addEventListener('scroll', function () { if (!bezig) { bezig = true; requestAnimationFrame(draai); } }, { passive: true });
  }

  /* ---------- cateringaanvraag: naar /api/aanvraag (demo-api.js vangt het statisch af) ---------- */
  var form = document.querySelector('[data-aanvraag]');
  if (form) {
    var vandaagIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    form.datum.min = vandaagIso;
    var fout = function (veld, tekst) {
      var el = form.querySelector('[data-fout="' + veld + '"]');
      if (!el) return;
      el.textContent = tekst || ''; el.hidden = !tekst;
      var inv = form.querySelector('[name="' + veld + '"]');
      if (inv) { inv.setAttribute('aria-invalid', tekst ? 'true' : 'false'); inv.closest('.veld').classList.toggle('heeft-fout', !!tekst); }
    };
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      ['naam', 'telefoon', 'datum', 'personen', 'bericht', 'algemeen'].forEach(function (v) { fout(v, ''); });
      var w = {
        naam: form.naam.value.trim(), telefoon: form.telefoon.value.trim(), datum: form.datum.value,
        personen: form.personen.value.trim(), bericht: form.bericht.value.trim(),
      };
      var eerste = null;
      var mis = function (v, t) { fout(v, t); if (!eerste) eerste = form[v]; };
      if (!w.naam) mis('naam', 'Fill in your name.');
      if (!/^[+\d][\d\s\-()]{8,}$/.test(w.telefoon)) mis('telefoon', 'Fill in a phone number we can call you back on.');
      if (!w.datum || w.datum < vandaagIso) mis('datum', 'Choose a date from today onwards.');
      if (!(parseInt(w.personen, 10) > 0)) mis('personen', 'How many people are you feeding?');
      if (w.bericht.length < 3) mis('bericht', 'Tell us briefly what you have in mind.');
      if (eerste) { eerste.focus(); return; }
      var k = form.querySelector('[data-aanvraag-knop]');
      k.disabled = true;
      try {
        var res = await fetch('api/aanvraag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ onderwerp: 'Catering / big order' }, w)) });
        var j = await res.json();
        if (!j.ok) throw new Error(j.fout || res.status);
        var datumTekst = new Date(w.datum + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
        form.querySelector('[data-aanvraag-nummer]').textContent = 'Request ' + j.id;
        form.querySelector('[data-aanvraag-tekst]').textContent = 'Thank you ' + w.naam.split(' ')[0] + '! Your request for ' + w.personen + (w.personen === '1' ? ' person' : ' people') + ' on ' + datumTekst + ' is in. The team calls you on ' + w.telefoon + ' to put it together.';
        form.querySelector('.rand-in').hidden = true;
        var klaar = form.querySelector('[data-aanvraag-klaar]');
        klaar.hidden = false;
        klaar.setAttribute('tabindex', '-1');
        klaar.focus();
      } catch (err) {
        fout('algemeen', 'Sending did not work (' + err.message + '). Please try again, or call 020 7538 1161.');
      }
      k.disabled = false;
    });
  }
})();

/* Menukaart: op mobiel alleen de eerste groep open (fail-open: de HTML zet de eerste open) */
(function () {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('.kaart-groep').forEach(function (d, i) { if (i > 0) d.removeAttribute('open'); });
})();
