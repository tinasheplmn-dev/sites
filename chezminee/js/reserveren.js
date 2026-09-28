/* Reserveringssysteem Chez Minée, powered by Mettafel.
   Compact paneel rechtsonder (opent via elke [data-paneel-open]-knop) en
   dezelfde flow ingebed op reserveren.html ([data-reserveer-inline]).
   Fail-open: zonder JavaScript wijzen alle knoppen naar reserveren.html,
   en daar staat een gewoon formulier dat via mail werkt. */
(function () {
  'use strict';

  /* Openingstijden (zelfde bron als main.js). Keuken tot 22 uur,
     laatste reservering om 21.00 uur. Reserveren kan vanaf 9.00 uur. */
  var TIJDEN = {
    0: { open: 9, laatste: 21 },
    1: { open: 9, laatste: 21 },
    2: null,
    3: { open: 9, laatste: 21 },
    4: { open: 9, laatste: 21 },
    5: { open: 9, laatste: 21 },
    6: { open: 9, laatste: 21 },
  };
  var DAGKORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var MAANDKORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var MAX_ONLINE = 8;

  var paneel = document.querySelector('[data-paneel]');
  var inline = document.querySelector('[data-reserveer-inline]');
  if (!paneel && !inline) return;

  var keuze = { datum: null, tijd: null, gasten: 2 };

  function datumNaam(d) {
    var vandaag = new Date(); vandaag.setHours(0, 0, 0, 0);
    var morgen = new Date(vandaag); morgen.setDate(morgen.getDate() + 1);
    var dag = new Date(d); dag.setHours(0, 0, 0, 0);
    if (dag.getTime() === vandaag.getTime()) return 'Vandaag';
    if (dag.getTime() === morgen.getTime()) return 'Morgen';
    return DAGKORT[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDKORT[d.getMonth()];
  }
  function isoDatum(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function komendeOpenDagen(n) {
    var uit = [];
    var d = new Date();
    for (var i = 0; i < 45 && uit.length < n; i++) {
      var kandidaat = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      var t = TIJDEN[kandidaat.getDay()];
      if (!t) continue;
      if (i === 0) {
        var uur = new Date().getHours() + new Date().getMinutes() / 60;
        if (uur >= t.laatste - 0.5) continue;   /* vandaag kan niet meer */
      }
      uit.push(kandidaat);
    }
    return uit;
  }
  function tijdslots(datum) {
    var t = TIJDEN[datum.getDay()];
    if (!t) return [];
    var slots = [];
    var start = t.open;
    var vandaag = isoDatum(new Date()) === isoDatum(datum);
    if (vandaag) {
      var nu = new Date().getHours() + new Date().getMinutes() / 60;
      start = Math.max(start, Math.ceil((nu + 0.75) * 2) / 2);   /* minstens 45 min vooruit */
    }
    for (var u = start; u <= t.laatste; u += 0.5) {
      var heel = Math.floor(u), min = Math.round((u - heel) * 60);
      slots.push(String(heel).padStart(2, '0') + ':' + String(min).padStart(2, '0'));
    }
    return slots;
  }

  function bouwFlow(houder, inPaneel) {
    houder.innerHTML =
      '<form class="paneel-body" novalidate>' +
      '  <div class="paneel-stap">' +
      '    <span class="stap-label">Welke dag?</span>' +
      '    <div class="chip-rij" data-dagen></div>' +
      '    <div class="veld" data-anders hidden>' +
      '      <label for="' + (inPaneel ? 'p' : 'i') + '-datum">Kies een datum</label>' +
      '      <input type="date" id="' + (inPaneel ? 'p' : 'i') + '-datum" name="datum">' +
      '    </div>' +
      '  </div>' +
      '  <div class="paneel-stap" data-tijdstap hidden>' +
      '    <span class="stap-label">Hoe laat?</span>' +
      '    <div class="chip-rij" data-tijden></div>' +
      '  </div>' +
      '  <div class="paneel-stap">' +
      '    <span class="stap-label">Met hoeveel?</span>' +
      '    <div class="chip-rij" data-gasten></div>' +
      '    <p class="noot" data-groepnoot hidden style="font-size:.85rem;color:var(--dim);max-width:none">Meer dan ' + MAX_ONLINE + ' personen? Stuur ons een berichtje via het <a href="contact.html" style="font-weight:700;color:var(--merk-tekst)">contactformulier</a>, dan regelen we het samen.</p>' +
      '  </div>' +
      '  <div class="veld"><label for="' + (inPaneel ? 'p' : 'i') + '-naam">Je naam</label><input type="text" id="' + (inPaneel ? 'p' : 'i') + '-naam" name="naam" autocomplete="name" required></div>' +
      '  <div class="veld"><label for="' + (inPaneel ? 'p' : 'i') + '-tel">Telefoonnummer</label><input type="tel" id="' + (inPaneel ? 'p' : 'i') + '-tel" name="telefoon" autocomplete="tel" required></div>' +
      '  <div class="veld"><label for="' + (inPaneel ? 'p' : 'i') + '-mail">E-mailadres</label><input type="email" id="' + (inPaneel ? 'p' : 'i') + '-mail" name="email" autocomplete="email" required></div>' +
      '  <div class="veld"><label for="' + (inPaneel ? 'p' : 'i') + '-wens">Wensen of allergieën <span style="font-weight:400;color:var(--dim)">(niet verplicht)</span></label><textarea id="' + (inPaneel ? 'p' : 'i') + '-wens" name="wensen" placeholder="Bijvoorbeeld: kinderstoel, glutenvrij, graag op het terras"></textarea></div>' +
      '  <div class="paneel-voet">' +
      '    <p class="fout" data-fout hidden style="color:#b3261e;font-weight:600;font-size:.93rem"></p>' +
      '    <button class="knop knop-vol" type="submit">Bevestig de reservering</button>' +
      '    <p class="noot">Je krijgt direct een bevestiging op je scherm en het team neemt contact op als er iets niet past.</p>' +
      '    <p class="mettafel-noot">Reserveringssysteem powered by <a href="https://mettafel.nl" target="_blank" rel="noopener">Mettafel</a></p>' +
      '  </div>' +
      '</form>';

    var vorm = houder.querySelector('form');
    var dagenRij = houder.querySelector('[data-dagen]');
    var tijdStap = houder.querySelector('[data-tijdstap]');
    var tijdenRij = houder.querySelector('[data-tijden]');
    var gastenRij = houder.querySelector('[data-gasten]');
    var groepNoot = houder.querySelector('[data-groepnoot]');
    var andersVeld = houder.querySelector('[data-anders]');
    var datumInput = andersVeld.querySelector('input');
    var foutRegel = houder.querySelector('[data-fout]');

    function chip(tekst, waarde) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'keuze-chip';
      b.textContent = tekst;
      b.dataset.waarde = waarde;
      b.setAttribute('aria-pressed', 'false');
      return b;
    }
    function kies(rij, knop) {
      rij.querySelectorAll('.keuze-chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      if (knop) knop.setAttribute('aria-pressed', 'true');
    }

    /* dagen */
    komendeOpenDagen(4).forEach(function (d) {
      var b = chip(datumNaam(d), isoDatum(d));
      dagenRij.appendChild(b);
    });
    var anders = chip('Andere datum', '');
    dagenRij.appendChild(anders);

    dagenRij.addEventListener('click', function (e) {
      var b = e.target.closest('.keuze-chip');
      if (!b) return;
      kies(dagenRij, b);
      if (b === anders) {
        andersVeld.hidden = false;
        datumInput.min = isoDatum(new Date());
        datumInput.focus();
        keuze.datum = datumInput.value || null;
      } else {
        andersVeld.hidden = true;
        keuze.datum = b.dataset.waarde;
      }
      toonTijden();
    });
    datumInput.addEventListener('change', function () {
      var d = new Date(datumInput.value + 'T12:00');
      if (isNaN(d)) return;
      if (!TIJDEN[d.getDay()]) {
        foutRegel.textContent = 'Op dinsdag zijn we gesloten. Kies een andere dag.';
        foutRegel.hidden = false;
        keuze.datum = null;
        tijdStap.hidden = true;
        return;
      }
      foutRegel.hidden = true;
      keuze.datum = datumInput.value;
      toonTijden();
    });

    function toonTijden() {
      keuze.tijd = null;
      tijdenRij.innerHTML = '';
      if (!keuze.datum) { tijdStap.hidden = true; return; }
      var d = new Date(keuze.datum + 'T12:00');
      var slots = tijdslots(d);
      if (!slots.length) { tijdStap.hidden = true; return; }
      slots.forEach(function (s) { tijdenRij.appendChild(chip(s, s)); });
      tijdStap.hidden = false;
    }
    tijdenRij.addEventListener('click', function (e) {
      var b = e.target.closest('.keuze-chip');
      if (!b) return;
      kies(tijdenRij, b);
      keuze.tijd = b.dataset.waarde;
    });

    /* gasten */
    for (var g = 1; g <= MAX_ONLINE; g++) {
      var b = chip(g === MAX_ONLINE ? g + '+' : String(g), g);
      if (g === 2) { b.setAttribute('aria-pressed', 'true'); }
      gastenRij.appendChild(b);
    }
    gastenRij.addEventListener('click', function (e) {
      var b = e.target.closest('.keuze-chip');
      if (!b) return;
      kies(gastenRij, b);
      keuze.gasten = parseInt(b.dataset.waarde, 10);
      groepNoot.hidden = keuze.gasten < MAX_ONLINE;
    });

    /* versturen */
    vorm.addEventListener('submit', function (e) {
      e.preventDefault();
      foutRegel.hidden = true;
      var naam = vorm.naam.value.trim();
      var tel = vorm.telefoon.value.trim();
      var mail = vorm.email.value.trim();
      if (!keuze.datum) { foutRegel.textContent = 'Kies eerst een dag.'; foutRegel.hidden = false; return; }
      if (!keuze.tijd) { foutRegel.textContent = 'Kies nog een tijd.'; foutRegel.hidden = false; return; }
      if (!naam) { foutRegel.textContent = 'Vul je naam in.'; foutRegel.hidden = false; vorm.naam.focus(); return; }
      if (!/^[+\d][\d\s\-()]{7,}$/.test(tel)) { foutRegel.textContent = 'Dat telefoonnummer lijkt niet te kloppen.'; foutRegel.hidden = false; vorm.telefoon.focus(); return; }
      if (!/^\S+@\S+\.\S+$/.test(mail)) { foutRegel.textContent = 'Dat e-mailadres lijkt niet te kloppen.'; foutRegel.hidden = false; vorm.email.focus(); return; }

      var knopVerstuur = vorm.querySelector('[type="submit"]');
      knopVerstuur.disabled = true;
      knopVerstuur.textContent = 'Versturen...';

      fetch('/api/reservering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: naam, telefoon: tel, email: mail,
          datum: keuze.datum, tijd: keuze.tijd, gasten: keuze.gasten,
          wensen: vorm.wensen.value.trim(),
        }),
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j.ok) throw new Error(j.fout || 'mislukt');
        toonKlaar(houder, j.id);
      }).catch(function () {
        /* server niet bereikbaar (bijv. statische host): val terug op mail */
        var onderwerp = 'Reservering ' + keuze.datum + ' ' + keuze.tijd + ' voor ' + keuze.gasten;
        var tekst = 'Beste Chez Minée,%0A%0AGraag reserveer ik een tafel.%0ADatum: ' + keuze.datum + '%0ATijd: ' + keuze.tijd + '%0AAantal: ' + keuze.gasten + '%0ANaam: ' + encodeURIComponent(naam) + '%0ATelefoon: ' + encodeURIComponent(tel) + (vorm.wensen.value ? '%0AWensen: ' + encodeURIComponent(vorm.wensen.value) : '');
        location.href = 'mailto:info@chezminee.nl?subject=' + encodeURIComponent(onderwerp) + '&body=' + tekst;
        knopVerstuur.disabled = false;
        knopVerstuur.textContent = 'Bevestig de reservering';
      });
    });
  }

  function toonKlaar(houder, nummer) {
    var d = new Date(keuze.datum + 'T' + keuze.tijd);
    var eind = new Date(d.getTime() + 2 * 60 * 60 * 1000);
    function ics(dd) { return dd.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    var agenda = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(
      'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Chez Minee//NL\nBEGIN:VEVENT\nUID:' + nummer + '@chezminee.nl\nDTSTART:' + ics(d) + '\nDTEND:' + ics(eind) + '\nSUMMARY:Tafel bij Chez Minée (' + keuze.gasten + ' pers.)\nLOCATION:Orthenseweg 1\\, 5212 EA \'s-Hertogenbosch\nEND:VEVENT\nEND:VCALENDAR');
    houder.innerHTML =
      '<div class="paneel-body"><div class="paneel-klaar">' +
      '  <span class="vink"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '  <h2 style="font-size:1.4rem">À bientôt!</h2>' +
      '  <p>Je reservering <strong>' + nummer + '</strong> voor <strong>' + keuze.gasten + '</strong> ' + (keuze.gasten === 1 ? 'persoon' : 'personen') + ' op <strong>' + datumNaam(new Date(keuze.datum + 'T12:00')).toLowerCase() + ' om ' + keuze.tijd + '</strong> staat genoteerd. Het team van Chez Minée neemt alleen contact op als er iets niet past.</p>' +
      '  <a class="knop knop-lijn" style="width:auto" download="chez-minee.ics" href="' + agenda + '">Zet in je agenda</a>' +
      '  <p class="mettafel-noot">Reserveringssysteem powered by <a href="https://mettafel.nl" target="_blank" rel="noopener">Mettafel</a></p>' +
      '</div></div>';
  }

  /* ---------- paneel openen en sluiten ---------- */
  if (paneel) {
    var open = false;
    var gebouwd = false;
    function openPaneel() {
      if (!gebouwd) {
        paneel.innerHTML =
          '<div class="paneel-kop"><h2>Reserveer een tafel</h2>' +
          '<button class="sluit" data-paneel-dicht aria-label="Paneel sluiten"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
          '<div data-flow></div>';
        bouwFlow(paneel.querySelector('[data-flow]'), true);
        paneel.addEventListener('click', function (e) {
          if (e.target.closest('[data-paneel-dicht]')) sluitPaneel();
        });
        gebouwd = true;
      }
      paneel.classList.add('open');
      open = true;
    }
    function sluitPaneel() {
      paneel.classList.remove('open');
      open = false;
    }
    document.querySelectorAll('[data-paneel-open]').forEach(function (k) {
      k.addEventListener('click', function (e) {
        /* op de reserveerpagina zelf laat de knop gewoon scrollen */
        if (document.querySelector('[data-reserveer-inline]')) return;
        e.preventDefault();
        if (open) sluitPaneel(); else openPaneel();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) sluitPaneel();
    });
  }

  if (inline) bouwFlow(inline, false);
})();
