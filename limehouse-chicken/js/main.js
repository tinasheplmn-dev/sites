/* Limehouse Fried Chicken & Spice: zaakgegevens, live openstatus, contactformulier.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden: elke dag 12:00-23:00 (Just Eat, 29-09-2026).
     Google noemt 11:00-23:00: open punt voor de eigenaar, zie README. */
  var UREN = { van: 12, tot: 23 };
  function uren(dag) { return UREN; }

  window.ZAAK = {
    naam: 'Limehouse Fried Chicken & Spice',
    sleutel: 'lfc',
    bezorgen: true,
    bereidtijd: 15,
    uren: uren,
    afhaalNoot: 'Collect at 540 Commercial Road, E1. Pay at the counter.',
    bezorgNoot: 'We deliver locally around Limehouse. We call you to confirm your address and any delivery charge before we start cooking. Pay at the door.',
    tip: { item: 'extra-sauce', tekst: 'Add our homemade chilli or Naga sauce?' },
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thanks ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') goes in the fryer for ' + tijd + '. Collect it at 540 Commercial Road and pay at the counter.'; },
    bevestigBezorgen: function (naam, n, tot, tijd) { return 'Thanks ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') is planned for ' + tijd + '. We call you shortly to confirm your address and any delivery charge. Pay at the door.'; },
  };

  /* ---------- live openstatus ---------- */
  function hhmm(u) { var h = Math.floor(u), m = Math.round((u - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function status() {
    var nu = new Date();
    var t = nu.getHours() + nu.getMinutes() / 60;
    var u = uren(nu.getDay());
    if (u && t >= u.van && t < u.tot) return { open: true, tekst: 'Open now until ' + hhmm(u.tot) };
    if (u && t < u.van) return { open: false, tekst: 'Opens today at ' + hhmm(u.van) };
    var morgen = uren((nu.getDay() + 1) % 7);
    return { open: false, tekst: 'Closed now, open tomorrow from ' + hhmm(morgen.van) };
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
      if (knop) { knop.setAttribute('aria-expanded', 'false'); knop.focus(); }
      document.documentElement.style.overflow = '';
    });
  });

  /* ---------- contactformulier ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var fout = form.querySelector('[data-contact-fout]');
      fout.hidden = true;
      var naam = form.naam.value.trim(), bericht = form.bericht.value.trim();
      if (!naam || !bericht) { fout.textContent = 'Fill in your name and your message, then we can get back to you.'; fout.hidden = false; return; }
      var b = form.querySelector('button[type="submit"]');
      b.disabled = true;
      try {
        var r = await fetch('api/aanvraag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ naam: naam, telefoon: form.telefoon.value.trim(), email: form.email.value.trim(), bericht: bericht }) });
        var j = await r.json();
        if (!j.ok) throw new Error(j.fout || r.status);
        form.innerHTML = '<p class="form-ok" role="status">Thanks ' + naam.split(' ')[0].replace(/[<>&]/g, '') + ', your message is in. The shop gets back to you by phone or email.</p>';
      } catch (err) {
        fout.textContent = 'Sending did not work (' + err.message + '). Please try again in a moment.';
        fout.hidden = false;
        b.disabled = false;
      }
    });
  }
})();
