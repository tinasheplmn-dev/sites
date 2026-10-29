/* Proefles aanvragen en inschrijven. Powered by Mettafel.
   Proefles: maximaal twee keuzes, die als vrijkaartjes in de houder vallen.
   Verzenden gaat naar /api/proefles of /api/inschrijving (server.js). Draait
   de site zonder server, dan opent het mailprogramma met alles ingevuld. */
(function () {
  'use strict';
  var MAIL = 'info@medez.nl';

  /* ---------- tabs ---------- */
  var tabs = [].slice.call(document.querySelectorAll('[data-tab]'));
  var panelen = [].slice.call(document.querySelectorAll('[data-paneel]'));
  function kiesTab(naam, focus) {
    tabs.forEach(function (t) {
      var aan = t.dataset.tab === naam;
      t.setAttribute('aria-selected', aan ? 'true' : 'false');
      t.tabIndex = aan ? 0 : -1;
      if (aan && focus) t.focus();
    });
    panelen.forEach(function (p) { p.hidden = p.dataset.paneel !== naam; });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { kiesTab(t.dataset.tab); history.replaceState(null, '', '#' + t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      kiesTab(n.dataset.tab, true);
    });
  });
  if (tabs.length) kiesTab(location.hash === '#inschrijven' ? 'inschrijven' : 'proefles');

  /* ---------- hulpjes ---------- */
  function controleerVelden(form, regels) {
    var ok = true;
    regels.forEach(function (r) {
      var veld = form.querySelector('[name="' + r[0] + '"]');
      if (!veld) return;
      var goed = r[1](veld.value.trim());
      var houder = veld.closest('.veld');
      if (houder) houder.classList.toggle('ongeldig', !goed);
      veld.setAttribute('aria-invalid', goed ? 'false' : 'true');
      if (!goed && ok) { veld.focus(); ok = false; }
    });
    return ok;
  }
  var gevuld = function (v) { return v.length > 1; };
  var email = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
  var telefoon = function (v) { return v.replace(/\D/g, '').length >= 9; };
  var datum = function (v) { return /^\d{4}-\d{2}-\d{2}$/.test(v); };

  function verstuur(soort, gegevens, onderwerp, tekst, klaar) {
    return fetch('/api/' + soort, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gegevens) })
      .then(function (r) { if (!r.ok) throw new Error('server'); return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error('server'); klaar(false); })
      .catch(function () {
        window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(onderwerp) + '&body=' + encodeURIComponent(tekst);
        klaar(true);
      });
  }
  function toonKlaar(form, viaMail, mailTekst) {
    [].slice.call(form.children).forEach(function (k) { if (!k.hasAttribute('data-klaar')) k.hidden = true; });
    var k = form.querySelector('[data-klaar]');
    k.hidden = false;
    if (viaMail) k.querySelector('[data-klaar-tekst]').textContent = mailTekst;
    k.focus();
    k.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- proefles: twee vrijkaartjes ---------- */
  var pf = document.querySelector('[data-proefles]');
  if (pf) {
    var boxen = [].slice.call(pf.querySelectorAll('input[name="proefles"]'));
    var slots = [].slice.call(pf.querySelectorAll('[data-slot]'));
    var gekozen = [];
    function tekenSlots() {
      slots.forEach(function (s, i) {
        var keuze = gekozen[i];
        s.classList.toggle('gevuld', !!keuze);
        s.querySelector('b').textContent = keuze || 'Nog kiezen';
      });
      boxen.forEach(function (b) { b.disabled = !b.checked && gekozen.length >= 2; });
    }
    boxen.forEach(function (b) {
      b.addEventListener('change', function () {
        if (b.checked) gekozen.push(b.value);
        else gekozen = gekozen.filter(function (g) { return g !== b.value; });
        pf.querySelector('[data-fout-voor="proeflessen"]').classList.remove('toon');
        tekenSlots();
      });
    });
    tekenSlots();

    pf.addEventListener('submit', function (e) {
      e.preventDefault();
      var foutKeuze = pf.querySelector('[data-fout-voor="proeflessen"]');
      var ok = controleerVelden(pf, [['naam', gevuld], ['leerling', gevuld], ['geboortedatum', datum], ['woonplaats', gevuld], ['telefoon', telefoon], ['email', email]]);
      foutKeuze.classList.toggle('toon', !gekozen.length);
      if (!gekozen.length) { pf.querySelector('[data-keuzes]').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      if (!ok) return;
      var g = {
        naam: pf.naam.value.trim(), leerling: pf.leerling.value.trim(), geboortedatum: pf.geboortedatum.value,
        woonplaats: pf.woonplaats.value.trim(), telefoon: pf.telefoon.value.trim(), email: pf.email.value.trim(),
        proeflessen: gekozen.join(' en '), opmerkingen: pf.opmerkingen.value.trim(),
      };
      var tekst = 'Hallo Médèz,\n\nIk wil graag een gratis proefles aanvragen.\n\nProefles(sen): ' + g.proeflessen +
        '\nNaam leerling: ' + g.leerling + '\nGeboortedatum leerling: ' + g.geboortedatum + '\nWoonplaats: ' + g.woonplaats +
        '\n\nNaam aanvrager: ' + g.naam + '\nTelefoon: ' + g.telefoon + '\nE-mail: ' + g.email + (g.opmerkingen ? '\n\nOpmerkingen: ' + g.opmerkingen : '') + '\n';
      var houder = pf.querySelector('[data-klaar-kaartjes]');
      houder.innerHTML = gekozen.map(function (k, i) { return '<span class="mijnkaartje gevuld"><span><i>Vrijkaartje ' + (i + 1) + '</i><b></b></span><span class="nr">Nr. 0' + (i + 1) + '</span></span>'; }).join('');
      [].slice.call(houder.querySelectorAll('b')).forEach(function (b, i) { b.textContent = gekozen[i]; });
      verstuur('proefles', g, 'Proefles aanvragen: ' + g.proeflessen, tekst, function (viaMail) {
        toonKlaar(pf, viaMail, 'Je mailprogramma opent met je aanvraag al ingevuld. Verstuur hem, dan neemt een docent contact met je op.');
      });
    });
  }

  /* ---------- inschrijven ---------- */
  var ins = document.querySelector('[data-inschrijving]');
  if (ins) {
    ins.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = controleerVelden(ins, [['naam', gevuld], ['geboortedatum', datum], ['adres', gevuld], ['postcode', gevuld], ['telefoon', telefoon], ['email', email],
        ['cursus', gevuld], ['locatie', gevuld], ['lesvorm', gevuld], ['iban', function (v) { return v.replace(/\s/g, '').length >= 15; }], ['tenNameVan', gevuld]]);
      var akkoord = ins.querySelector('[name="akkoord"]').checked;
      ins.querySelector('[data-fout-voor="akkoord"]').classList.toggle('toon', !akkoord);
      if (!ok || !akkoord) return;
      var velden = ['naam', 'geboortedatum', 'adres', 'postcode', 'telefoon', 'email', 'cursus', 'locatie', 'lesvorm', 'vereniging', 'iban', 'tenNameVan', 'opmerkingen'];
      var g = {};
      velden.forEach(function (v) { g[v] = ins.querySelector('[name="' + v + '"]').value.trim(); });
      g.duoles = ins.querySelector('[name="duoles"]:checked').value;
      g.akkoord = 'ja';
      var labels = { naam: 'Naam leerling', geboortedatum: 'Geboortedatum', adres: 'Adres', postcode: 'Postcode en woonplaats', telefoon: 'Telefoon', email: 'E-mail', cursus: 'Schrijft zich in voor', locatie: 'Leslocatie', lesvorm: 'Lesvorm', vereniging: 'Muziekvereniging', duoles: 'Duoles', iban: 'IBAN', tenNameVan: 'Ten name van', opmerkingen: 'Opmerkingen' };
      var tekst = 'Hallo Médèz,\n\nHierbij mijn inschrijving.\n\n' + Object.keys(labels).map(function (k) { return labels[k] + ': ' + (g[k] || '-'); }).join('\n') + '\n\nIk ga akkoord met de algemene lesvoorwaarden en de automatische incasso.\n';
      verstuur('inschrijving', g, 'Inschrijving: ' + g.cursus, tekst, function (viaMail) {
        toonKlaar(ins, viaMail, 'Je mailprogramma opent met je inschrijving al ingevuld. Verstuur hem, dan neemt je docent contact met je op.');
      });
    });
  }
})();
