/* Boekingssysteem OM Academy (powered by Mettafel). Bevestiging staat op boeken.html zelf (?status=...).
   Vorm en aantal bepalen de prijs; locatie bepaalt de weekdag en dus de datums.
   POST /api/boeking. Antwoord bevat optioneel checkoutUrl (Mollie): dan door
   naar de betaalpagina. Zonder backend: bevestiging via mailto. */
(function () {
  'use strict';
  var PRIJS = { proef: 0, personal: 25, groep: 20 };
  var LOC = { eindhoven: { dag: 0, naam: 'Eindhoven, zondag 17.00-19.00', adres: 'RKVV Brabantia, Sportpark Strijp, Rijstenweg 1, Eindhoven' }, antwerpen: { dag: 3, naam: 'Antwerpen, woensdag 16.00-18.00', adres: 'Park Groot Schijn, Ruggeveldlaan 486, 2100 Deurne' } };
  var VORM = { proef: 'Proeftraining', personal: 'Personal training', groep: 'Groepstraining' };
  var MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var DAGEN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

  /* ---------- bevestiging (na boeken of na terugkeer van de betaalpagina) ---------- */
  var params = new URLSearchParams(location.search);
  var bedankt = document.querySelector('[data-bedankt]');
  if (bedankt && params.get('status')) {
    var status = params.get('status');
    var kop = bedankt.querySelector('[data-bedankt-kop]');
    var tekst = bedankt.querySelector('[data-bedankt-tekst]');
    if (status === 'betaald') { kop.textContent = 'Betaald en bevestigd. Tot op het veld!'; }
    else if (status === 'open' || status === 'pending') { kop.textContent = 'Je boeking is binnen, de betaling wordt verwerkt.'; tekst.textContent = 'Zodra de bank de betaling bevestigt, krijg je een e-mail. Duurt het langer dan een uur, stuur ons dan even een bericht.'; }
    else if (status === 'mislukt' || status === 'canceled' || status === 'failed' || status === 'expired') { kop.textContent = 'De betaling is niet gelukt.'; tekst.textContent = 'Je boeking staat wel genoteerd. Betaal gerust op het veld, of probeer het opnieuw.'; }
    var dl = bedankt.querySelector('[data-bedankt-details]');
    if (dl && params.get('id')) dl.innerHTML = '<dt>Boekingsnummer</dt><dd>' + params.get('id').replace(/[<>&"]/g, '') + '</dd>';
    bedankt.hidden = false;
    var f = document.querySelector('[data-boeken]');
    if (f) f.hidden = true;
    bedankt.scrollIntoView({ block: 'center' });
    return;
  }

  var form = document.querySelector('[data-boeken]');
  if (!form) return;
  var aantalUit = form.querySelector('[data-aantal]');
  var aantalIn = form.querySelector('[name="aantal_spelers"]');
  var datums = form.querySelector('[data-datums]');
  var s = function (k) { return form.parentElement.querySelector('[data-s-' + k + ']'); };

  function vorm() { return form.querySelector('[name="vorm"]:checked').value; }
  function locatie() { return form.querySelector('[name="locatie"]:checked').value; }
  function aantal() { return Number(aantalIn.value); }
  function trainingen() { return Number(form.trainingen.value); }

  function grenzen() {
    var v = vorm();
    return v === 'groep' ? [3, 4] : v === 'personal' ? [1, 2] : [1, 4];
  }
  function zetAantal(n) {
    var g = grenzen();
    n = Math.max(g[0], Math.min(g[1], n));
    aantalIn.value = n; aantalUit.value = n; aantalUit.textContent = n;
  }
  function bouwDatums() {
    var dag = LOC[locatie()].dag;
    var nu = new Date();
    var d = new Date(nu); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + ((dag - d.getDay() + 7) % 7));
    if (dag === nu.getDay() && nu.getHours() >= 15) d.setDate(d.getDate() + 7);
    var html = '';
    for (var i = 0; i < 6; i++) {
      var iso = d.toISOString().slice(0, 10);
      var label = DAGEN[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()];
      html += '<div class="keuze"><input type="radio" name="datum" id="d' + i + '" value="' + iso + '"' + (i === 0 ? ' checked' : '') + '><label for="d' + i + '"><strong>' + label + '</strong></label></div>';
      d.setDate(d.getDate() + 7);
    }
    datums.innerHTML = html;
    datums.querySelectorAll('input').forEach(function (r) { r.addEventListener('change', werkBij); });
  }
  function totaal() { return PRIJS[vorm()] * aantal() * (vorm() === 'proef' ? 1 : trainingen()); }
  function werkBij() {
    zetAantal(aantal());
    var v = vorm();
    form.trainingen.disabled = v === 'proef';
    if (v === 'proef') form.trainingen.value = '1';
    var betaalblok = form.querySelector('[data-betaalblok]');
    betaalblok.hidden = v === 'proef';
    var datum = form.querySelector('[name="datum"]:checked');
    s('vorm').textContent = VORM[v];
    s('spelers').textContent = aantal();
    s('trainingen').textContent = v === 'proef' ? '1 (gratis)' : trainingen();
    s('locatie').textContent = LOC[locatie()].naam;
    s('datum').textContent = datum ? datum.nextElementSibling.textContent : 'Kies een datum';
    var t = totaal();
    s('totaal').textContent = '€\u00a0' + t;
    var online = form.querySelector('[name="betaling"]:checked').value === 'online';
    var knop = form.querySelector('[data-verstuur]');
    knop.firstChild.textContent = t === 0 ? 'Bevestig je gratis proeftraining ' : online ? 'Betaal € ' + t + ' en bevestig ' : 'Bevestig je boeking ';
    s('uitleg').textContent = t === 0 ? 'Je krijgt direct een bevestiging per e-mail met adres en tijd.' : online ? 'Je gaat naar een beveiligde betaalpagina (iDEAL of Bancontact). Daarna krijg je de bevestiging per e-mail.' : 'Je krijgt direct een bevestiging per e-mail. Je rekent af bij de trainer op het veld.';
  }

  /* voorkeuze uit de URL (?vorm=groep&locatie=antwerpen) */
  if (params.get('vorm') && form.querySelector('#vorm-' + params.get('vorm'))) form.querySelector('#vorm-' + params.get('vorm')).checked = true;
  if (params.get('locatie') && form.querySelector('#loc-' + params.get('locatie'))) form.querySelector('#loc-' + params.get('locatie')).checked = true;
  if (vorm() === 'groep') aantalIn.value = 3;
  if (params.get('aantal')) aantalIn.value = Number(params.get('aantal')) || aantalIn.value;
  if (params.get('trainingen') === '4') form.trainingen.value = '4';

  form.querySelector('[data-min]').addEventListener('click', function () { zetAantal(aantal() - 1); werkBij(); });
  form.querySelector('[data-plus]').addEventListener('click', function () { zetAantal(aantal() + 1); werkBij(); });
  form.querySelectorAll('[name="vorm"]').forEach(function (r) { r.addEventListener('change', function () { if (r.value === 'groep' && aantal() < 3) aantalIn.value = 3; if (r.value === 'personal' && aantal() > 2) aantalIn.value = 2; werkBij(); }); });
  form.querySelectorAll('[name="locatie"]').forEach(function (r) { r.addEventListener('change', function () { bouwDatums(); werkBij(); }); });
  form.querySelectorAll('[name="betaling"]').forEach(function (r) { r.addEventListener('change', werkBij); });
  form.trainingen.addEventListener('change', werkBij);
  form.querySelectorAll('input, textarea').forEach(function (inp) { inp.addEventListener('input', function () { var v = inp.closest('.veld'); if (v) v.classList.remove('mis'); }); });
  bouwDatums(); werkBij();

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = true;
    form.querySelectorAll('.veld').forEach(function (v) {
      var inp = v.querySelector('input:not([type=hidden]), select, textarea');
      if (!inp || !inp.required) return;
      var mis = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value)) || (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 8);
      v.classList.toggle('mis', mis);
      if (mis) ok = false;
    });
    if (!form.querySelector('[name="datum"]:checked')) { datums.parentElement.classList.add('mis'); ok = false; }
    if (!ok) { var eerste = form.querySelector('.veld.mis input, .veld.mis select'); if (eerste) eerste.focus(); return; }

    var data = {};
    new FormData(form).forEach(function (val, k) { data[k] = val; });
    data.vorm_naam = VORM[vorm()];
    data.locatie_naam = LOC[locatie()].naam;
    data.adres = LOC[locatie()].adres;
    data.aantal_spelers = aantal();
    data.trainingen = vorm() === 'proef' ? 1 : trainingen();
    data.totaal = totaal();
    data.betaling = totaal() === 0 ? 'gratis' : data.betaling;
    var knop = form.querySelector('[data-verstuur]');
    knop.disabled = true; knop.textContent = 'Even geduld...';
    fetch('/api/boeking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.fout || 'mislukt');
        if (j.checkoutUrl) { location.href = j.checkoutUrl; return; }
        location.href = 'boeken.html?id=' + encodeURIComponent(j.id) + '&status=' + (data.betaling === 'online' ? 'open' : 'bevestigd');
      })
      .catch(function () {
        /* geen backend (statische host): mailclient met de boeking */
        var regels = ['Boeking OM Academy', 'Vorm: ' + data.vorm_naam, 'Spelers: ' + data.aantal_spelers, 'Trainingen: ' + data.trainingen, 'Locatie: ' + data.locatie_naam, 'Datum: ' + data.datum, 'Speler: ' + data.speler + ' (' + data.leeftijd + ')', 'Naam: ' + data.naam, 'Telefoon: ' + data.telefoon, 'E-mail: ' + data.email, 'Focus: ' + (data.focus || '-'), 'Totaal: € ' + data.totaal + ' (' + data.betaling + ')'];
        location.href = 'mailto:om-academy@outlook.com?subject=' + encodeURIComponent('Boeking ' + data.vorm_naam + ' ' + data.datum) + '&body=' + encodeURIComponent(regels.join('\n'));
        knop.disabled = false; werkBij();
      });
  });
})();
