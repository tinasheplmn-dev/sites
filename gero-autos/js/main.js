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

  /* ---------- hero-showcase: wisselt door de uitgelichte auto's ----------
     Fail-open: zonder JavaScript staat de eerste auto er gewoon. Pauzeert bij
     hover, focus, een verborgen tabblad en via de pauzeknop. */
  var sc = document.querySelector('[data-showcase]');
  if (sc) {
    var dias = [].slice.call(sc.querySelectorAll('.sc-dia'));
    var stippen = [].slice.call(sc.querySelectorAll('[data-sc-stip]'));
    var pauzeKnop = sc.querySelector('[data-sc-pauze]');
    var nu = 0, klok = null, duur = 5500;
    var kalmte = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function toon(n) {
      nu = (n + dias.length) % dias.length;
      dias.forEach(function (d, i) {
        var aan = i === nu;
        d.classList.toggle('aan', aan);
        if (aan) { d.removeAttribute('aria-hidden'); d.removeAttribute('tabindex'); }
        else { d.setAttribute('aria-hidden', 'true'); d.setAttribute('tabindex', '-1'); }
      });
      stippen.forEach(function (s, i) {
        s.classList.toggle('aan', i === nu);
        s.classList.toggle('gezien', i < nu);
        s.setAttribute('aria-selected', String(i === nu));
        var balk = s.querySelector('span');
        if (balk) { balk.style.animation = 'none'; void balk.offsetWidth; balk.style.animation = ''; }
      });
      var volgende = dias[(nu + 1) % dias.length].querySelector('img');
      if (volgende) volgende.loading = 'eager';
    }
    function stop() { clearInterval(klok); klok = null; }
    function start() {
      stop();
      if (sc.classList.contains('vast') || sc.classList.contains('gepauzeerd') || document.hidden) return;
      klok = setInterval(function () { toon(nu + 1); }, duur);
    }
    stippen.forEach(function (s, i) { s.addEventListener('click', function () { toon(i); start(); }); });
    if (pauzeKnop) pauzeKnop.addEventListener('click', function () {
      var vast = !sc.classList.contains('vast');
      sc.classList.toggle('vast', vast);
      pauzeKnop.setAttribute('aria-pressed', String(vast));
      pauzeKnop.setAttribute('aria-label', vast ? "Laat de auto's weer wisselen" : "Pauzeer de wisselende auto's");
      if (vast) stop(); else { toon(nu); start(); }
    });
    ['mouseenter', 'focusin'].forEach(function (ev) { sc.addEventListener(ev, function () { sc.classList.add('gepauzeerd'); stop(); }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { sc.addEventListener(ev, function () { sc.classList.remove('gepauzeerd'); if (!sc.classList.contains('vast')) { toon(nu); start(); } }); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    /* swipe op mobiel */
    var sx = null;
    sc.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    sc.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { toon(dx < 0 ? nu + 1 : nu - 1); start(); }
      sx = null;
    });
    if (kalmte) { sc.classList.add('vast'); if (pauzeKnop) { pauzeKnop.setAttribute('aria-pressed', 'true'); pauzeKnop.setAttribute('aria-label', "Laat de auto's wisselen"); } }
    toon(0);
    start();
  }

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
