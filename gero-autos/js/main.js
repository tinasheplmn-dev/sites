/* Gero Auto's: site-eigen gedrag bovenop motion.js.
   - live openstatus-chip (fail-open: zonder JS staat de vaste tijdenregel er)
   - formulieren: POST naar /api/<soort> (Mettafel), valt terug op mailto
   - filterknop op mobiel, vandaag markeren in de openingstijden */
(function () {
  'use strict';

  /* ---------- openstatus ---------- */
  var TIJDEN = { 0: null, 1: 'afspraak', 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [10, 14] };
  var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  function uur(h) { return String(h).padStart(2, '0') + '.00'; }
  function openStatus() {
    var nu = new Date();
    var d = nu.getDay();
    var t = nu.getHours() + nu.getMinutes() / 60;
    var v = TIJDEN[d];
    if (Array.isArray(v)) {
      if (t < v[0]) return { open: false, tekst: 'Vandaag open vanaf ' + uur(v[0]) + ' uur' };
      if (t < v[1]) return { open: true, tekst: 'Nu geopend, tot ' + uur(v[1]) + ' uur' };
    }
    if (v === 'afspraak' && t >= 9 && t < 18) return { open: true, tekst: 'Vandaag open op afspraak, bel even' };
    for (var i = 1; i <= 7; i++) {
      var dag = (d + i) % 7;
      var w = TIJDEN[dag];
      if (Array.isArray(w)) return { open: false, tekst: (i === 1 ? 'Morgen' : DAGEN[dag].charAt(0).toUpperCase() + DAGEN[dag].slice(1)) + ' weer open vanaf ' + uur(w[0]) + ' uur' };
    }
    return { open: false, tekst: 'Op afspraak geopend' };
  }
  var chip = document.querySelector('[data-openstatus]');
  if (chip) {
    var s = openStatus();
    var tekst = chip.querySelector('[data-openstatus-tekst]');
    if (tekst) tekst.textContent = s.tekst;
    var stip = document.createElement('span');
    stip.className = 'stip';
    chip.insertBefore(stip, chip.firstChild);
    chip.classList.toggle('dicht', !s.open);
  }
  var vandaag = document.querySelector('[data-tijden] [data-dag="' + new Date().getDay() + '"]');
  if (vandaag) vandaag.classList.add('vandaag');

  /* ---------- mobiele filterknop ---------- */
  var fk = document.querySelector('[data-filterknop]');
  if (fk) {
    var rij = document.getElementById(fk.getAttribute('aria-controls'));
    fk.addEventListener('click', function () {
      var open = fk.getAttribute('aria-expanded') === 'true';
      fk.setAttribute('aria-expanded', String(!open));
      if (rij) rij.classList.toggle('open', !open);
    });
  }

  /* ---------- formulieren ---------- */
  document.querySelectorAll('[data-formulier]').forEach(function (form) {
    var soort = form.dataset.formulier;
    var bevestiging = form.parentElement.querySelector('[data-bevestiging]');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true;
      form.querySelectorAll('.veld').forEach(function (v) {
        var inp = v.querySelector('input, select, textarea');
        if (!inp || !inp.required) return;
        var mis = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value)) || (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 8);
        v.classList.toggle('mis', mis);
        if (mis) ok = false;
      });
      if (!ok) { var eerste = form.querySelector('.veld.mis input, .veld.mis select, .veld.mis textarea'); if (eerste) eerste.focus(); return; }
      var velden = {};
      new FormData(form).forEach(function (val, k) { velden[k] = val; });
      velden.onderwerp = form.dataset.onderwerp || soort;
      velden.pagina = location.pathname;
      var knop = form.querySelector('button[type="submit"]');
      var oud = knop.textContent;
      knop.disabled = true; knop.textContent = 'Versturen...';
      fetch('/api/' + soort, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(velden) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.fout || 'mislukt');
          form.hidden = true;
          if (bevestiging) { bevestiging.hidden = false; bevestiging.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        })
        .catch(function () {
          /* geen backend (statische host)? dan de mailclient met alles ingevuld */
          var regels = Object.keys(velden).filter(function (k) { return k !== 'pagina'; }).map(function (k) { return k + ': ' + velden[k]; });
          location.href = 'mailto:info@geroauto.nl?subject=' + encodeURIComponent(velden.onderwerp) + '&body=' + encodeURIComponent(regels.join('\n'));
          knop.disabled = false; knop.textContent = oud;
        });
    });
    form.querySelectorAll('input, select, textarea').forEach(function (inp) {
      inp.addEventListener('input', function () { inp.closest('.veld') && inp.closest('.veld').classList.remove('mis'); });
    });
  });
})();
