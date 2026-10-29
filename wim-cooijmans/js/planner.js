/* Proeflesplanner: een klavier als agenda. Powered by Mettafel.
   Witte toetsen zijn de lesdagen (maandag tot en met vrijdag), de tijden
   zijn zwarte toetsjes. De aanvraag gaat naar /api/proefles (server.js).
   Draait de site op een host zonder server, dan opent het mailprogramma
   met de aanvraag al ingevuld: zo komt hij hoe dan ook bij Wim aan.

   Lestijden en vakanties aanpassen: alleen in INSTELLINGEN hieronder. */
(function () {
  'use strict';

  var INSTELLINGEN = {
    email: 'info@wimcooijmans.nl',
    lesdagen: [1, 2, 3, 4, 5],                 /* ma t/m vr */
    tijden: ['14.00', '14.30', '15.00', '15.30', '16.00', '16.30', '17.00', '17.30', '18.00', '18.30', '19.00', '19.30', '20.00', '20.30'],
    wekenVooruit: 6,
    /* schoolvakanties gemeente Sint-Michielsgestel (zoals in de agenda van Médèz 2026-2027), begin en eind inclusief */
    vakanties: [
      ['2026-10-17', '2026-10-25', 'herfstvakantie'],
      ['2026-12-19', '2027-01-03', 'kerstvakantie'],
      ['2027-02-06', '2027-02-14', 'carnavalsvakantie'],
      ['2027-03-29', '2027-03-29', 'Tweede Paasdag'],
      ['2027-04-24', '2027-05-09', 'meivakantie'],
      ['2027-05-17', '2027-05-17', 'Tweede Pinksterdag'],
      ['2027-07-24', '2027-09-05', 'zomervakantie'],
    ],
  };

  var form = document.querySelector('[data-planner]');
  if (!form) return;

  var DAGEN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var DAGEN_LANG = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var MAANDEN_LANG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

  var dagenEl = form.querySelector('[data-dagen]');
  var tijdenEl = form.querySelector('[data-tijden]');
  var weekLabel = form.querySelector('[data-week-label]');
  var terug = form.querySelector('[data-week-terug]');
  var verder = form.querySelector('[data-week-verder]');
  var samMoment = form.querySelector('[data-sam-moment]');
  var samWat = form.querySelector('[data-sam-wat]');
  var klaar = form.querySelector('[data-klaar]');

  var vandaag = new Date(); vandaag.setHours(0, 0, 0, 0);
  var weekIndex = 0;
  var gekozenDag = null;   /* Date */
  var gekozenTijd = null;  /* '16.30' */
  var bezet = {};          /* 'jjjj-mm-dd 16.30': true */

  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function maandag(d) { var m = new Date(d); var dag = (m.getDay() + 6) % 7; m.setDate(m.getDate() - dag); return m; }
  function vakantie(d) {
    var s = iso(d);
    for (var i = 0; i < INSTELLINGEN.vakanties.length; i++) {
      var v = INSTELLINGEN.vakanties[i];
      if (s >= v[0] && s <= v[1]) return v[2];
    }
    return '';
  }
  function eerstMogelijk() { var d = new Date(vandaag); d.setDate(d.getDate() + 1); return d; }
  function langeDatum(d) { return DAGEN_LANG[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN_LANG[d.getMonth()]; }

  /* begin bij de eerste week met een mogelijke dag */
  (function zoekStart() {
    for (var w = 0; w < INSTELLINGEN.wekenVooruit; w++) {
      var ma = maandag(vandaag); ma.setDate(ma.getDate() + w * 7);
      for (var i = 0; i < 5; i++) {
        var d = new Date(ma); d.setDate(ma.getDate() + i);
        if (d >= eerstMogelijk() && !vakantie(d)) { weekIndex = w; return; }
      }
    }
  })();

  function tekenWeek() {
    var ma = maandag(vandaag); ma.setDate(ma.getDate() + weekIndex * 7);
    var vr = new Date(ma); vr.setDate(ma.getDate() + 4);
    weekLabel.textContent = weekIndex === 0 ? 'Deze week' : (weekIndex === 1 ? 'Volgende week' : 'Week van ' + ma.getDate() + ' ' + MAANDEN[ma.getMonth()]);
    terug.disabled = weekIndex === 0;
    verder.disabled = weekIndex >= INSTELLINGEN.wekenVooruit - 1;
    dagenEl.textContent = '';
    for (var i = 0; i < 5; i++) {
      var d = new Date(ma); d.setDate(ma.getDate() + i);
      var knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'dagtoets';
      var vak = vakantie(d);
      var voorbij = d < eerstMogelijk();
      var magNiet = INSTELLINGEN.lesdagen.indexOf(d.getDay()) === -1;
      knop.disabled = !!(vak || voorbij || magNiet);
      knop.setAttribute('aria-pressed', gekozenDag && iso(gekozenDag) === iso(d) ? 'true' : 'false');
      knop.setAttribute('aria-label', langeDatum(d) + (vak ? ', ' + vak + ', geen les' : voorbij ? ', niet meer mogelijk' : ''));
      knop.dataset.datum = iso(d);
      knop.innerHTML = '<span class="dagtoets-dag">' + DAGEN[d.getDay()] + '</span><span class="dagtoets-datum">' + d.getDate() + ' ' + MAANDEN[d.getMonth()] + '</span>' + (vak ? '<span class="dagtoets-noot">vakantie</span>' : '');
      dagenEl.appendChild(knop);
    }
    /* zwarte toetsen tussen ma-di, di-wo en do-vr, zoals op een echt klavier */
    [1, 2, 4].forEach(function (n) {
      var z = document.createElement('span');
      z.className = 'zwarte-toets';
      z.setAttribute('aria-hidden', 'true');
      z.style.left = 'calc(4px + (100% - 8px) * ' + (n / 5) + ')';
      dagenEl.appendChild(z);
    });
  }

  function tekenTijden() {
    tijdenEl.textContent = '';
    if (!gekozenDag) {
      tijdenEl.innerHTML = '<p class="tijden-leeg">Tik eerst op een dag.</p>';
      return;
    }
    INSTELLINGEN.tijden.forEach(function (t) {
      var knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'tijd';
      knop.textContent = t;
      var isBezet = bezet[iso(gekozenDag) + ' ' + t];
      knop.disabled = !!isBezet;
      knop.setAttribute('aria-pressed', gekozenTijd === t ? 'true' : 'false');
      knop.setAttribute('aria-label', t + ' uur' + (isBezet ? ', al bezet' : ''));
      knop.dataset.tijd = t;
      tijdenEl.appendChild(knop);
    });
  }

  function waarde(naam) {
    var el = form.querySelector('[name="' + naam + '"]:checked') || form.querySelector('[name="' + naam + '"]');
    return el ? el.value.trim() : '';
  }

  function samenvatting() {
    samMoment.textContent = gekozenDag && gekozenTijd
      ? langeDatum(gekozenDag) + ', ' + gekozenTijd + ' uur'
      : gekozenDag ? langeDatum(gekozenDag) + ', kies nog een tijd' : 'Nog geen dag en tijd gekozen';
    samWat.textContent = waarde('instrument') + ' · ' + waarde('voorWie').toLowerCase() + ' · gratis';
  }

  dagenEl.addEventListener('click', function (e) {
    var knop = e.target.closest('.dagtoets');
    if (!knop || knop.disabled) return;
    var p = knop.dataset.datum.split('-');
    gekozenDag = new Date(+p[0], +p[1] - 1, +p[2]);
    gekozenTijd = null;
    tekenWeek(); tekenTijden(); samenvatting();
    var eerste = tijdenEl.querySelector('.tijd:not(:disabled)');
    if (eerste && window.matchMedia('(max-width: 1020px)').matches) tijdenEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  tijdenEl.addEventListener('click', function (e) {
    var knop = e.target.closest('.tijd');
    if (!knop || knop.disabled) return;
    gekozenTijd = knop.dataset.tijd;
    tekenTijden(); samenvatting();
    form.querySelector('[data-fout-voor="moment"]').classList.remove('toon');
  });
  terug.addEventListener('click', function () { if (weekIndex > 0) { weekIndex--; tekenWeek(); } });
  verder.addEventListener('click', function () { if (weekIndex < INSTELLINGEN.wekenVooruit - 1) { weekIndex++; tekenWeek(); } });
  form.addEventListener('change', samenvatting);

  /* bezette tijden ophalen (alleen als de server meedraait) */
  fetch('/api/proefles/bezet', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.bezet) return;
      j.bezet.forEach(function (b) { bezet[b.datum + ' ' + b.tijd] = true; });
      tekenTijden();
    })
    .catch(function () {});

  /* controle per veld, in gewone taal */
  function controleer() {
    var ok = true;
    [['naam', function (v) { return v.length > 1; }],
     ['telefoon', function (v) { return v.replace(/\D/g, '').length >= 9; }],
     ['email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }]].forEach(function (r) {
      var veld = form.querySelector('[name="' + r[0] + '"]');
      var goed = r[1](veld.value.trim());
      veld.closest('.veld').classList.toggle('ongeldig', !goed);
      veld.setAttribute('aria-invalid', goed ? 'false' : 'true');
      if (!goed && ok) { veld.focus(); ok = false; }
    });
    var momentFout = form.querySelector('[data-fout-voor="moment"]');
    var heeftMoment = (gekozenDag && gekozenTijd) || (!document.documentElement.classList.contains('js') && waarde('voorkeur'));
    momentFout.classList.toggle('toon', !heeftMoment);
    if (!heeftMoment && ok) { dagenEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); ok = false; }
    return ok;
  }

  function icsBestand(d, t) {
    var uur = t.split('.');
    var begin = new Date(d); begin.setHours(+uur[0], +uur[1], 0, 0);
    var eind = new Date(begin.getTime() + 30 * 60000);
    var f = function (x) { return x.getFullYear() + String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0') + 'T' + String(x.getHours()).padStart(2, '0') + String(x.getMinutes()).padStart(2, '0') + '00'; };
    var tekst = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wim Cooijmans//Proefles//NL', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@wimcooijmans.nl', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(begin), 'DTEND:' + f(eind),
      'SUMMARY:Proefles piano bij Wim Cooijmans', 'LOCATION:Marterhage 6\\, 5258 XL Berlicum',
      'DESCRIPTION:Gratis proefles. Wim bevestigt de afspraak nog persoonlijk.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return URL.createObjectURL(new Blob([tekst], { type: 'text/calendar' }));
  }

  function toonKlaar(viaMail) {
    form.classList.add('verstuurd');
    klaar.hidden = false;
    var moment = gekozenDag && gekozenTijd ? langeDatum(gekozenDag) + ', ' + gekozenTijd + ' uur' : waarde('voorkeur');
    form.querySelector('[data-klaar-moment]').textContent = moment;
    if (viaMail) {
      form.querySelector('[data-klaar-kop]').textContent = 'Nog één klik: verstuur je mail';
      form.querySelector('[data-klaar-tekst]').textContent = 'Je mailprogramma opent met je aanvraag al ingevuld. Verstuur hem, dan bevestigt Wim je proefles persoonlijk.';
    } else {
      form.querySelector('[data-klaar-tekst]').textContent = 'Wim neemt contact met je op om de afspraak te bevestigen, meestal binnen een werkdag. Past het tijdstip toch niet, dan zoeken jullie samen een ander moment.';
    }
    var ics = form.querySelector('[data-ics]');
    if (gekozenDag && gekozenTijd) ics.href = icsBestand(gekozenDag, gekozenTijd); else ics.hidden = true;
    klaar.focus();
    klaar.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!controleer()) return;
    var gegevens = {
      naam: waarde('naam'), telefoon: waarde('telefoon'), email: waarde('email'),
      voorWie: waarde('voorWie'), instrument: waarde('instrument'), wens: waarde('wens'),
      datum: gekozenDag ? iso(gekozenDag) : '', tijd: gekozenTijd || '',
      moment: gekozenDag && gekozenTijd ? langeDatum(gekozenDag) + ', ' + gekozenTijd + ' uur' : waarde('voorkeur'),
    };
    var knop = form.querySelector('[data-verstuur]');
    knop.disabled = true;
    fetch('/api/proefles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gegevens) })
      .then(function (r) { if (!r.ok) throw new Error('server'); return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error('server'); toonKlaar(false); })
      .catch(function () {
        var tekst = 'Hallo Wim,\n\nIk wil graag een gratis proefles plannen.\n\n' +
          'Moment: ' + gegevens.moment + '\nInstrument: ' + gegevens.instrument + '\nVoor wie: ' + gegevens.voorWie +
          (gegevens.wens ? '\nWat ik graag wil leren spelen: ' + gegevens.wens : '') +
          '\n\nNaam: ' + gegevens.naam + '\nTelefoon: ' + gegevens.telefoon + '\nE-mail: ' + gegevens.email + '\n';
        window.location.href = 'mailto:' + INSTELLINGEN.email + '?subject=' + encodeURIComponent('Proefles: ' + gegevens.moment) + '&body=' + encodeURIComponent(tekst);
        toonKlaar(true);
      })
      .then(function () { knop.disabled = false; });
  });

  tekenWeek(); tekenTijden(); samenvatting();
})();
