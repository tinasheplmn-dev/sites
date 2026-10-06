/* Unisex Hairdressers: eigen boekingssysteem (0% commissie), powered by Mettafel.
   Vijf stappen in een lade: behandeling(en) > stylist > dag > tijd > gegevens,
   daarna een bevestiging met nummer (U-2026-0001) en een agenda-bestand.

   Openen: elk element met [data-open-boeken], of [data-boek="<behandeling-id>"]
   (opent met die behandeling al gekozen). Leest window.SALON (main.js) en
   window.PRIJZEN (prijs-data.js, gegenereerd). Praat met /api/beschikbaar en
   /api/boeking; zonder server vangt demo-api.js dat op in localStorage.
   Zonder JavaScript blijft de prijslijst gewoon leesbaar en staat het
   telefoonnummer overal klikbaar. */
(function () {
  'use strict';
  var S = window.SALON, P = window.PRIJZEN;
  var lade = document.querySelector('[data-boek-lade]');
  var scherm = document.querySelector('[data-boek-scherm]');
  if (!S || !P || !lade) return;

  var lijf = lade.querySelector('[data-boek-lijf]');
  var titel = lade.querySelector('[data-boek-titel]');
  var stapnaam = lade.querySelector('[data-boek-stapnaam]');
  var verder = lade.querySelector('[data-boek-verder]');
  var terug = lade.querySelector('[data-boek-terug]');
  var samen = lade.querySelector('[data-boek-samen]');
  var voet = lade.querySelector('[data-boek-voet]');
  var balkjes = lade.querySelectorAll('.boek-voortgang li');

  var BEH = {};
  P.groepen.forEach(function (g) { g.items.forEach(function (it) { BEH[it.id] = it; }); });

  var st = { stap: 1, keuze: [], stylist: null, datum: null, tijd: null, bezet: {}, melding: '', bezig: false, klaar: null, laatsteFocus: null };
  var TITELS = ['', 'Choose your service', 'Who would you like?', 'Pick a day', 'Pick a time', 'Your details'];
  var DAG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAG_LANG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MAAND = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var ik = function (n) { return '<svg class="ikoon" aria-hidden="true"><use href="assets/iconen.svg#i-' + n + '"/></svg>'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var p2 = function (n) { return String(n).padStart(2, '0'); };
  var ds = function (d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); };
  var tijdStr = function (m) { return p2(Math.floor(m / 60)) + ':' + p2(m % 60); };
  var duurTekst = function (m) { return m < 60 ? m + ' min' : Math.floor(m / 60) + ' hr' + (m % 60 ? ' ' + (m % 60) : ''); };
  function naarDatum(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function datumLang(s) { var d = naarDatum(s); return DAG_LANG[d.getDay()] + ' ' + d.getDate() + ' ' + MAAND[d.getMonth()]; }
  function totaal() {
    return st.keuze.reduce(function (t, id) { var b = BEH[id]; return { duur: t.duur + b.duur, prijs: t.prijs + b.prijs }; }, { duur: 0, prijs: 0 });
  }
  function stylistNaam(id) { var s = S.stylisten.filter(function (x) { return x.id === id; })[0]; return s ? s.naam : ''; }

  /* ---------- beschikbaarheid ---------- */
  function haalBezet(datum, vers) {
    if (st.bezet[datum] && !vers) return Promise.resolve(st.bezet[datum]);
    return fetch('api/beschikbaar?datum=' + datum, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) { st.bezet[datum] = (j && j.bezet) || {}; return st.bezet[datum]; })
      .catch(function () { st.bezet[datum] = {}; return st.bezet[datum]; });
  }
  function vrij(blokken, s, e) { return !(blokken || []).some(function (b) { return s < b[1] && e > b[0]; }); }
  function slots(datum) {
    var bezet = st.bezet[datum] || {};
    var d = naarDatum(datum), u = S.uren(d.getDay()), duur = totaal().duur;
    var nu = new Date(), vandaag = ds(nu) === datum;
    var vroegst = vandaag ? nu.getHours() * 60 + nu.getMinutes() + S.voorloop : 0;
    var namen = S.stylisten.map(function (s) { return s.id; }).filter(function (id) { return id !== 'any'; });
    var uit = [];
    for (var t = u.van * 60; t + duur <= u.tot * 60; t += S.raster) {
      if (t < vroegst) continue;
      var ok = st.stylist === 'any'
        ? namen.some(function (n) { return vrij(bezet[n], t, t + duur); })
        : vrij(bezet[st.stylist], t, t + duur);
      if (ok) uit.push(t);
    }
    return uit;
  }
  function dagenLijst() {
    var uit = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < S.dagenVooruit; i++) { var x = new Date(d); x.setDate(d.getDate() + i); uit.push(x); }
    return uit;
  }

  /* ---------- openen en sluiten ---------- */
  function open(id) {
    if (st.klaar) reset();
    if (id && BEH[id] && st.keuze.indexOf(id) === -1) st.keuze.push(id);
    st.laatsteFocus = document.activeElement;
    scherm.hidden = false; lade.hidden = false;
    document.documentElement.classList.add('boek-open');
    requestAnimationFrame(function () { requestAnimationFrame(function () { lade.classList.add('open'); scherm.classList.add('open'); }); });
    naarStap(st.stap || 1);
    setTimeout(function () { titel.focus(); }, 60);
  }
  function sluit() {
    lade.classList.remove('open'); scherm.classList.remove('open');
    document.documentElement.classList.remove('boek-open');
    setTimeout(function () { if (!lade.classList.contains('open')) { lade.hidden = true; scherm.hidden = true; } }, 320);
    if (st.klaar) reset();
    if (st.laatsteFocus && st.laatsteFocus.focus) st.laatsteFocus.focus();
  }
  function reset() { st.stap = 1; st.keuze = []; st.stylist = null; st.datum = null; st.tijd = null; st.melding = ''; st.klaar = null; st.bezet = {}; }
  titel.setAttribute('tabindex', '-1');

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-boek]');
    if (b && !lade.contains(b)) { e.preventDefault(); open(b.getAttribute('data-boek')); return; }
    var o = e.target.closest('[data-open-boeken]');
    if (o) { e.preventDefault(); open(); }
  });
  lade.querySelector('[data-boek-sluit]').addEventListener('click', sluit);
  scherm.addEventListener('click', sluit);
  document.addEventListener('keydown', function (e) {
    if (lade.hidden) return;
    if (e.key === 'Escape') { sluit(); return; }
    if (e.key === 'Tab') { /* focus binnen de lade houden */
      var f = [].slice.call(lade.querySelectorAll('button:not([disabled]):not([hidden]), a[href], input, textarea, [tabindex="0"]')).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  terug.addEventListener('click', function () { if (st.stap > 1) naarStap(st.stap - 1); });
  verder.addEventListener('click', function () {
    if (verder.disabled) return;
    if (st.stap < 5) naarStap(st.stap + 1); else verstuur();
  });

  /* ---------- stappen ---------- */
  function naarStap(n) {
    st.stap = n;
    lade.setAttribute('data-stap', n);
    stapnaam.textContent = 'Step ' + n + ' of 5';
    titel.textContent = TITELS[n];
    terug.hidden = n === 1;
    voet.hidden = false;
    balkjes.forEach(function (li, i) { li.className = i < n ? 'af' : ''; });
    if (n === 1) teken1();
    if (n === 2) teken2();
    if (n === 3) teken3();
    if (n === 4) teken4();
    if (n === 5) teken5();
    lijf.scrollTop = 0;
    werkVoetBij();
  }
  function werkVoetBij() {
    var t = totaal();
    var delen = [];
    if (st.keuze.length) delen.push('<strong>' + st.keuze.length + (st.keuze.length === 1 ? ' service' : ' services') + '</strong> · ' + duurTekst(t.duur) + ' · from £' + t.prijs);
    if (st.stap >= 3 && st.stylist) delen.push(esc(stylistNaam(st.stylist)));
    if (st.stap >= 4 && st.datum) delen.push(esc(datumLang(st.datum)) + (st.tijd != null && st.stap >= 5 ? ', ' + tijdStr(st.tijd) : ''));
    samen.innerHTML = delen.length ? delen.join('<br>') : 'No service chosen yet';
    var kan = { 1: st.keuze.length > 0, 2: !!st.stylist, 3: !!st.datum, 4: st.tijd != null, 5: !st.bezig }[st.stap];
    verder.disabled = !kan;
    verder.innerHTML = st.stap === 5 ? (st.bezig ? 'Booking...' : ik('vink') + ' Confirm booking') : 'Continue ' + ik('pijl');
  }

  function teken1() {
    lijf.innerHTML = (P.demo ? '<p class="boek-noot">' + ik('glans') + ' Sample prices for this preview.</p>' : '') +
      P.groepen.map(function (g) {
        return '<section class="boek-groep"><h3>' + ik(g.ikoon) + esc(g.naam) + '</h3><div class="boek-opties">' +
          g.items.map(function (it) {
            var aan = st.keuze.indexOf(it.id) !== -1;
            return '<button type="button" class="boek-optie" role="checkbox" aria-checked="' + aan + '" data-kies="' + it.id + '">' +
              '<span class="vinkvak" aria-hidden="true">' + ik('vink') + '</span><span class="optie-naam">' + esc(it.naam) +
              '<small>' + ik('klok') + duurTekst(it.duur) + '</small></span><span class="optie-prijs"><small>from</small> £' + it.prijs + '</span></button>';
          }).join('') + '</div></section>';
      }).join('');
    lijf.querySelectorAll('[data-kies]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-kies'), i = st.keuze.indexOf(id);
        if (i === -1) st.keuze.push(id); else st.keuze.splice(i, 1);
        b.setAttribute('aria-checked', String(i === -1));
        st.tijd = null; /* andere duur: tijd opnieuw kiezen */
        werkVoetBij();
      });
    });
    var eerste = lijf.querySelector('[aria-checked="true"]');
    if (eerste) setTimeout(function () { eerste.scrollIntoView({ block: 'center' }); }, 80);
  }

  function teken2() {
    lijf.innerHTML = '<div class="boek-stylisten" role="radiogroup" aria-label="Stylist">' + S.stylisten.map(function (s) {
      var aan = st.stylist === s.id;
      return '<button type="button" class="boek-stylist' + (s.id === 'any' ? ' boek-stylist-any' : '') + '" role="radio" aria-checked="' + aan + '" data-stylist="' + s.id + '">' +
        '<span class="mini-boog" aria-hidden="true">' + (s.letter ? esc(s.letter) : ik('persoon')) + '</span>' +
        '<span><strong>' + esc(s.naam) + '</strong><small>' + esc(s.rol) + '</small></span><span class="vinkvak" aria-hidden="true">' + ik('vink') + '</span></button>';
    }).join('') + '</div><p class="boek-hint">' + ik('deur') + ' Prefer to just walk in? That is fine too, we are not appointment-only.</p>';
    lijf.querySelectorAll('[data-stylist]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (st.stylist !== b.getAttribute('data-stylist')) st.tijd = null;
        st.stylist = b.getAttribute('data-stylist');
        lijf.querySelectorAll('[data-stylist]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        werkVoetBij();
        setTimeout(function () { if (st.stap === 2) naarStap(3); }, 220);
      });
    });
  }

  function teken3() {
    var dagen = dagenLijst();
    lijf.innerHTML = '<div class="boek-dagen">' + dagen.map(function (d, i) {
      var s = ds(d), u = S.uren(d.getDay());
      return '<button type="button" class="boek-dag" data-datum="' + s + '" aria-pressed="' + (st.datum === s) + '">' +
        '<span class="dag-naam">' + (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAG[d.getDay()]) + '</span>' +
        '<span class="dag-nr">' + d.getDate() + '</span><span class="dag-maand">' + MAAND[d.getMonth()] + '</span>' +
        '<span class="dag-vrij" data-vrij>' + p2(u.van) + ':00-' + p2(u.tot) + ':00</span></button>';
    }).join('') + '</div><p class="boek-hint">' + ik('klok') + ' Mon-Fri 09:00-19:00 · Sat 09:00-18:00 · Sun 10:00-17:00</p>';
    var knoppen = lijf.querySelectorAll('[data-datum]');
    knoppen.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.disabled) return;
        if (st.datum !== b.getAttribute('data-datum')) st.tijd = null;
        st.datum = b.getAttribute('data-datum');
        knoppen.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        werkVoetBij();
        setTimeout(function () { if (st.stap === 3) naarStap(4); }, 220);
      });
    });
    /* per dag tellen hoeveel tijden er vrij zijn (vers ophalen) */
    dagen.forEach(function (d) {
      var s = ds(d);
      haalBezet(s, true).then(function () {
        var b = lijf.querySelector('[data-datum="' + s + '"]');
        if (!b || st.stap !== 3) return;
        var n = slots(s).length;
        var label = b.querySelector('[data-vrij]');
        if (n) { label.textContent = n + (n === 1 ? ' time' : ' times'); b.disabled = false; }
        else { label.textContent = new Date().getHours() >= 12 && s === ds(new Date()) ? 'No times left' : 'Fully booked'; b.disabled = true; b.setAttribute('aria-pressed', 'false'); if (st.datum === s) { st.datum = null; werkVoetBij(); } }
      });
    });
  }

  function teken4() {
    lijf.innerHTML = '<p class="boek-laden">Checking free times...</p>';
    var datum = st.datum;
    haalBezet(datum, true).then(function () {
      if (st.stap !== 4 || st.datum !== datum) return;
      var lijst = slots(datum);
      if (st.tijd != null && lijst.indexOf(st.tijd) === -1) st.tijd = null;
      var delen = [['Morning', 0, 12 * 60], ['Afternoon', 12 * 60, 17 * 60], ['Evening', 17 * 60, 24 * 60]];
      var html = (st.melding ? '<p class="boek-fout" role="alert">' + esc(st.melding) + '</p>' : '') +
        '<p class="boek-datumkop">' + ik('kalender') + esc(datumLang(datum)) + ' · ' + esc(stylistNaam(st.stylist)) + ' · ' + duurTekst(totaal().duur) + '</p>';
      if (!lijst.length) html += '<p class="boek-leeg">No free times left on this day for ' + duurTekst(totaal().duur) + '. Pick another day, or call us on ' + esc(S.telefoon) + '.</p>';
      delen.forEach(function (dl) {
        var in_ = lijst.filter(function (t) { return t >= dl[1] && t < dl[2]; });
        if (!in_.length) return;
        html += '<section class="boek-tijdgroep"><h3>' + dl[0] + '</h3><div class="boek-tijden">' + in_.map(function (t) {
          return '<button type="button" class="boek-tijd" data-tijd="' + t + '" aria-pressed="' + (st.tijd === t) + '">' + tijdStr(t) + '</button>';
        }).join('') + '</div></section>';
      });
      lijf.innerHTML = html;
      st.melding = '';
      var knoppen = lijf.querySelectorAll('[data-tijd]');
      knoppen.forEach(function (b) {
        b.addEventListener('click', function () {
          st.tijd = Number(b.getAttribute('data-tijd'));
          knoppen.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          werkVoetBij();
          setTimeout(function () { if (st.stap === 4) naarStap(5); }, 220);
        });
      });
      werkVoetBij();
    });
  }

  function onthouden() { try { return JSON.parse(localStorage.getItem(S.sleutel + '-gegevens')) || {}; } catch (e) { return {}; } }
  function teken5() {
    var g = onthouden(), t = totaal();
    lijf.innerHTML = '<div class="boek-overzicht"><ul>' + st.keuze.map(function (id) {
      return '<li><span>' + esc(BEH[id].naam) + '</span><span>' + duurTekst(BEH[id].duur) + ' · from £' + BEH[id].prijs + '</span></li>';
    }).join('') + '</ul><p>' + ik('kalender') + '<strong>' + esc(datumLang(st.datum)) + ', ' + tijdStr(st.tijd) + ' to ' + tijdStr(st.tijd + t.duur) + '</strong></p>' +
      '<p>' + ik('persoon') + esc(stylistNaam(st.stylist)) + '</p><p>' + ik('pond') + 'From £' + t.prijs + ', paid in the salon after your visit</p></div>' +
      '<form class="boek-form" data-boek-form novalidate>' +
      '<label>Your name<input name="naam" autocomplete="name" required value="' + esc(g.naam) + '"><span class="veld-fout" data-fout="naam" hidden>Please add your name.</span></label>' +
      '<label>Mobile number<input name="telefoon" type="tel" inputmode="tel" autocomplete="tel" required value="' + esc(g.telefoon) + '"><span class="veld-fout" data-fout="telefoon" hidden>Please add a phone number we can reach you on.</span></label>' +
      '<label>Email <small>(optional)</small><input name="email" type="email" autocomplete="email" value="' + esc(g.email) + '"><span class="veld-fout" data-fout="email" hidden>This email address does not look right.</span></label>' +
      '<label>Anything we should know? <small>(optional)</small><textarea name="notitie" rows="3" placeholder="For example: long hair, or a photo of the look you want to show us"></textarea></label>' +
      '<p class="boek-klein">We only use your details for this appointment. Need to change it later? Call ' + esc(S.telefoon) + '.</p>' +
      '<p class="boek-fout" data-form-fout role="alert" hidden></p></form>';
    var form = lijf.querySelector('[data-boek-form]');
    form.addEventListener('submit', function (e) { e.preventDefault(); verstuur(); });
  }

  function toonVeldFout(namen) {
    lijf.querySelectorAll('[data-fout]').forEach(function (f) { f.hidden = namen.indexOf(f.getAttribute('data-fout')) === -1; });
    var eerste = namen[0] && lijf.querySelector('[name="' + namen[0] + '"]');
    if (eerste) eerste.focus();
  }

  function verstuur() {
    var form = lijf.querySelector('[data-boek-form]');
    if (!form || st.bezig) return;
    var v = { naam: form.naam.value.trim(), telefoon: form.telefoon.value.trim(), email: form.email.value.trim(), notitie: form.notitie.value.trim() };
    var fout = [];
    if (!v.naam) fout.push('naam');
    if (!/^[+\d][\d\s()-]{6,}$/.test(v.telefoon)) fout.push('telefoon');
    if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) fout.push('email');
    if (fout.length) { toonVeldFout(fout); return; }
    toonVeldFout([]);
    try { localStorage.setItem(S.sleutel + '-gegevens', JSON.stringify({ naam: v.naam, telefoon: v.telefoon, email: v.email })); } catch (e) {}
    var t = totaal();
    var body = { naam: v.naam, telefoon: v.telefoon, email: v.email, notitie: v.notitie, datum: st.datum, tijd: tijdStr(st.tijd), stylist: st.stylist, behandelingen: st.keuze.slice(), duur: t.duur };
    st.bezig = true; werkVoetBij();
    fetch('api/boeking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (a) {
        st.bezig = false;
        if (a.status === 201 && a.j.ok) { bevestig(a.j, v); return; }
        if (a.status === 409) { st.melding = a.j.fout || 'That time was just taken. Please pick another.'; st.tijd = null; naarStap(4); return; }
        var ff = form.querySelector('[data-form-fout]');
        if (a.j && a.j.mist && a.j.mist.some(function (m) { return ['naam', 'telefoon', 'email'].indexOf(m) !== -1; })) toonVeldFout(a.j.mist);
        ff.textContent = (a.j && a.j.fout) || 'Something went wrong. Please try again, or call us.'; ff.hidden = false;
        werkVoetBij();
      })
      .catch(function () {
        st.bezig = false; werkVoetBij();
        var ff = form.querySelector('[data-form-fout]');
        ff.textContent = 'No connection. Please try again, or call us on ' + S.telefoon + '.'; ff.hidden = false;
      });
  }

  function ics(b, naam) {
    var a = b.datum.replace(/-/g, ''), s = b.tijd.replace(':', '') + '00', e = b.eind.replace(':', '') + '00';
    var tekst = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mettafel//Unisex Hairdressers//EN', 'BEGIN:VEVENT',
      'UID:' + b.id + '@unisexhairdressers.london', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART;TZID=Europe/London:' + a + 'T' + s, 'DTEND;TZID=Europe/London:' + a + 'T' + e,
      'SUMMARY:Hair appointment at Unisex Hairdressers', 'LOCATION:639 Commercial Road\\, London E14 7NT',
      'DESCRIPTION:Booking ' + b.id + ' for ' + naam + ' with ' + b.stylistNaam + '. Questions? Call 020 7709 8338.',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return URL.createObjectURL(new Blob([tekst], { type: 'text/calendar' }));
  }

  function bevestig(j, v) {
    var t = totaal();
    var b = { id: j.id, datum: j.datum || st.datum, tijd: j.tijd || tijdStr(st.tijd), eind: j.eind || tijdStr(st.tijd + t.duur), stylistNaam: j.stylistNaam || stylistNaam(st.stylist) };
    st.klaar = b;
    st.stap = 6;
    lade.setAttribute('data-stap', 'klaar');
    stapnaam.textContent = 'Booked';
    titel.textContent = 'See you soon, ' + v.naam.split(' ')[0];
    terug.hidden = true; voet.hidden = true;
    balkjes.forEach(function (li) { li.className = 'af'; });
    lijf.innerHTML = '<div class="boek-klaar" data-boek-klaar><span class="klaar-boog" aria-hidden="true">' + ik('vink') + '</span>' +
      '<p class="klaar-nr">Booking number <strong data-boeknummer>' + esc(b.id) + '</strong></p>' +
      '<p class="klaar-wanneer"><strong>' + esc(datumLang(b.datum)) + '</strong><br>' + esc(b.tijd) + ' to ' + esc(b.eind) + ' with ' + esc(b.stylistNaam) + '</p>' +
      '<ul>' + st.keuze.map(function (id) { return '<li>' + esc(BEH[id].naam) + '</li>'; }).join('') + '</ul>' +
      '<p class="klaar-uitleg">Your chair is held. Come to 639 Commercial Road and pay in the salon after your appointment (from £' + t.prijs + '). Running late or need to change? Call <a href="tel:' + S.telefoonLink + '">' + esc(S.telefoon) + '</a>.</p>' +
      '<div class="klaar-knoppen"><a class="knop knop-lijn" download="unisex-hairdressers-' + esc(b.id) + '.ics" href="' + ics(b, v.naam) + '">' + ik('download') + ' Add to calendar</a>' +
      '<button type="button" class="knop knop-merk" data-klaar-sluit>Done</button></div></div>';
    lijf.querySelector('[data-klaar-sluit]').addEventListener('click', sluit);
    titel.focus();
  }

  /* direct open via #boek in de url (handig voor een link in Instagram-bio) */
  if (/^#boek(en-online)?$/.test(location.hash)) open();
})();
