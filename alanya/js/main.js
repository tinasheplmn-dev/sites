/* Alanya: zaakgegevens, live openstatus, contactformulier.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden: ma-do 16:00-23:00, vr-za 13:00-23:30, zo 13:00-23:00
     (Just Eat + Zabihah, okt 2026). Bevestigen bij de eigenaar, zie README. */
  function uren(dag) { return dag >= 1 && dag <= 4 ? { van: 16, tot: 23 } : (dag === 5 || dag === 6) ? { van: 13, tot: 23.5 } : { van: 13, tot: 23 }; }

  window.ZAAK = {
    naam: 'Alanya',
    sleutel: 'alanya',
    bezorgen: true,
    bereidtijd: 30,
    uren: uren,
    tip: { item: 'alanya-special-spicy-sauce', tekst: 'Add our red Alanya Special Spicy Sauce?' },
    afhaalNoot: 'Collect at 510A Roman Road, E3. Pay at the counter.',
    bezorgNoot: 'We deliver around Bow and Roman Road and call you if your address is outside our area. Pay on delivery.',
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thank you ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') will be ready ' + tijd + '. Collect it at 510A Roman Road and pay at the counter.'; },
    bevestigBezorgen: function (naam, n, tot, tijd) { return 'Thank you ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') is on the grill. We deliver ' + tijd + ' and you pay on delivery.'; },
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
        form.innerHTML = '<p class="form-ok" role="status">Thanks ' + naam.split(' ')[0].replace(/[<>&]/g, '') + ', your message is in. We get back to you by phone or email.</p>';
      } catch (err) {
        fout.textContent = 'Sending did not work (' + err.message + '). Please try again in a moment.';
        fout.hidden = false;
        b.disabled = false;
      }
    });
  }
})();

/* Menukaart: op mobiel alleen de eerste groep open (fail-open: de HTML zet de eerste twee open) */
(function () {
  if (!window.matchMedia('(max-width: 640px)').matches) return;
  document.querySelectorAll('.kaart-groep').forEach(function (d, i) { if (i > 0) d.removeAttribute('open'); });
})();
