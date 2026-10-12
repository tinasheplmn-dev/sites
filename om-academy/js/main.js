/* OM Academy: site-eigen gedrag bovenop motion.js. Alles fail-open:
   zonder JavaScript staat er overal een vaste, correcte tekst.
   - eerstvolgende training (topbalk + aftelklok in de hero)
   - prijsconsole (vorm, spelers, trainingen -> totaal en boeklink)
   - uitklappanelen: tikken opent op aanraakschermen
   - contactformulier: POST naar /api/vraag (Mettafel), valt terug op mailto */
(function () {
  'use strict';

  /* ---------- eerstvolgende training ---------- */
  var MOMENTEN = [
    { dag: 0, uur: 17, eind: 19, wat: 'Zondag 17.00', waar: 'Eindhoven · RKVV Brabantia', kort: 'zondag in Eindhoven', loc: 'eindhoven' },
    { dag: 3, uur: 16, eind: 18, wat: 'Woensdag 16.00', waar: 'Antwerpen · Park Groot Schijn', kort: 'woensdag in Antwerpen', loc: 'antwerpen' },
  ];
  function volgende(nu) {
    var beste = null;
    MOMENTEN.forEach(function (m) {
      var start = new Date(nu); start.setHours(m.uur, 0, 0, 0);
      start.setDate(nu.getDate() + ((m.dag - nu.getDay() + 7) % 7));
      var eind = new Date(start); eind.setHours(m.eind);
      if (eind <= nu) { start.setDate(start.getDate() + 7); eind.setDate(eind.getDate() + 7); }
      if (!beste || start < beste.start) beste = { m: m, start: start, eind: eind };
    });
    return beste;
  }
  var twee = function (n) { return (n < 10 ? '0' : '') + n; };
  var topregel = document.querySelector('[data-volgende]');
  var klok = document.querySelector('[data-klok]');
  function werkKlokBij() {
    var nu = new Date();
    var v = volgende(nu);
    if (!v) return;
    var bezig = nu >= v.start && nu < v.eind;
    var ms = Math.max(0, v.start - nu);
    var d = Math.floor(ms / 864e5), u = Math.floor(ms / 36e5) % 24, mi = Math.floor(ms / 6e4) % 60;
    if (topregel) {
      topregel.textContent = bezig ? 'Nu op het veld: ' + v.m.kort
        : 'Volgende training: ' + v.m.kort + (d === 0 ? ', vandaag om ' + v.m.uur + '.00' : d === 1 ? ', morgen' : ', over ' + d + ' dagen');
    }
    if (klok) {
      var z = function (sel) { return document.querySelector(sel); };
      z('[data-klok-wat]').textContent = v.m.wat;
      z('[data-klok-waar]').textContent = v.m.waar;
      klok.querySelector('[data-d]').textContent = d;
      klok.querySelector('[data-u]').textContent = twee(u);
      klok.querySelector('[data-m]').textContent = twee(mi);
      var link = z('[data-klok-link]');
      if (link) link.setAttribute('href', 'boeken.html?locatie=' + v.m.loc);
    }
  }
  if (topregel || klok) { werkKlokBij(); setInterval(werkKlokBij, 30000); }

  /* ---------- prijsconsole ---------- */
  var con = document.querySelector('[data-console]');
  if (con) {
    var PRIJS = { proef: 0, personal: 25, groep: 20 };
    var NAAM = { proef: 'Proeftraining', personal: 'Personal training', groep: 'Groepstraining' };
    var GRENS = { proef: [1, 4], personal: [1, 2], groep: [3, 4] };
    var st = { vorm: 'personal', spelers: 1, tr: 1 };
    var q = function (s) { return con.querySelector(s); };
    var teken = function () {
      var g = GRENS[st.vorm];
      st.spelers = Math.max(g[0], Math.min(g[1], st.spelers));
      if (st.vorm === 'proef') st.tr = 1;
      var pp = PRIJS[st.vorm];
      var totaal = pp * st.spelers * st.tr;
      con.querySelectorAll('[data-c-vorm]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cVorm === st.vorm)); });
      con.querySelectorAll('[data-c-tr]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(Number(b.dataset.cTr) === st.tr));
        b.disabled = st.vorm === 'proef' && b.dataset.cTr === '4';
        b.style.opacity = b.disabled ? '.45' : '';
      });
      q('[data-c-spelers]').textContent = st.spelers;
      q('[data-c-min]').disabled = st.spelers <= g[0];
      q('[data-c-plus]').disabled = st.spelers >= g[1];
      q('[data-c-titel]').textContent = NAAM[st.vorm] + ' · ' + st.spelers + (st.spelers === 1 ? ' speler' : ' spelers');
      q('[data-c-totaal]').textContent = '€\u00a0' + totaal;
      q('[data-c-som]').textContent = st.vorm === 'proef'
        ? 'Je eerste training is gratis, voor iedereen die meedoet.'
        : st.spelers + (st.spelers === 1 ? ' speler' : ' spelers') + ' × € ' + pp + ' × ' + st.tr + (st.tr === 1 ? ' training' : ' trainingen');
      q('[data-c-pp]').textContent = '€\u00a0' + pp;
      q('[data-c-link]').setAttribute('href', 'boeken.html?vorm=' + st.vorm + '&aantal=' + st.spelers + '&trainingen=' + st.tr);
      var t = q('[data-c-totaal]');
      t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop');
    };
    con.querySelectorAll('[data-c-vorm]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.vorm = b.dataset.cVorm;
        if (st.vorm === 'groep' && st.spelers < 3) st.spelers = 3;
        if (st.vorm === 'personal' && st.spelers > 2) st.spelers = 2;
        teken();
      });
    });
    con.querySelectorAll('[data-c-tr]').forEach(function (b) { b.addEventListener('click', function () { st.tr = Number(b.dataset.cTr); teken(); }); });
    q('[data-c-min]').addEventListener('click', function () { st.spelers--; teken(); });
    q('[data-c-plus]').addEventListener('click', function () {
      st.spelers++;
      if (st.vorm === 'personal' && st.spelers > 2) st.vorm = 'groep';
      teken();
    });
    teken();
  }

  /* ---------- uitklappanelen: tikken of focus opent ---------- */
  var panelen = [].slice.call(document.querySelectorAll('.paneel'));
  panelen.forEach(function (p) {
    var open = function () { panelen.forEach(function (x) { x.classList.toggle('open', x === p); }); };
    p.addEventListener('click', open);
    p.addEventListener('focus', open);
  });

  /* ---------- contactformulier ---------- */
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
      if (!ok) { var eerste = form.querySelector('.veld.mis input, .veld.mis textarea'); if (eerste) eerste.focus(); return; }
      var velden = {};
      new FormData(form).forEach(function (val, k) { velden[k] = val; });
      velden.onderwerp = form.dataset.onderwerp || soort;
      var knop = form.querySelector('button[type="submit"]');
      var oud = knop.innerHTML; knop.disabled = true; knop.textContent = 'Versturen...';
      fetch('/api/' + soort, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(velden) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (!j.ok) throw new Error(j.fout); form.hidden = true; if (bevestiging) bevestiging.hidden = false; })
        .catch(function () {
          var regels = Object.keys(velden).map(function (k) { return k + ': ' + velden[k]; });
          location.href = 'mailto:om-academy@outlook.com?subject=' + encodeURIComponent(velden.onderwerp) + '&body=' + encodeURIComponent(regels.join('\n'));
          knop.disabled = false; knop.innerHTML = oud;
        });
    });
    form.querySelectorAll('input, textarea').forEach(function (inp) {
      inp.addEventListener('input', function () { var v = inp.closest('.veld'); if (v) v.classList.remove('mis'); });
    });
  });
})();
