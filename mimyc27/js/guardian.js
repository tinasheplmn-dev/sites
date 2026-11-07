/* guardian.js: de toestemmingspagina voor de ouder of voogd. Haalt de registratie op
   via het token in de URL, toont alleen het hoognodige, en slaat de toestemming op. */
(function () {
  'use strict';
  var lang = document.documentElement.lang === 'nl' ? 'nl' : 'en';
  var base = document.querySelector('link[rel="stylesheet"]').getAttribute('href').replace(/css\/style\.css.*$/, '');
  var S = {
    en: { id: 'Registration', naam: 'Attendee', type: 'Registering as', cop: 'COP attendee', guest: 'Guest or non-member', land: 'Country', ingediend: 'Submitted on', vulIn: 'Please check the highlighted fields.', netwerk: 'We could not save your permission. Check your connection and try again, or contact the camp team.' },
    nl: { id: 'Inschrijving', naam: 'Deelnemer', type: 'Ingeschreven als', cop: 'COP-lid', guest: 'Gast of niet-lid', land: 'Land', ingediend: 'Ingediend op', vulIn: 'Controleer de gemarkeerde velden.', netwerk: 'We konden je toestemming niet opslaan. Controleer je verbinding en probeer het opnieuw, of neem contact op met het kampteam.' },
  }[lang];
  var token = new URLSearchParams(location.search).get('t') || '';
  var laden = document.querySelector('[data-laden]');
  var ongeldig = document.querySelector('[data-ongeldig]');
  var form = document.querySelector('[data-voogd-form]');
  if (!form) return;

  function melding(el, tekst) { if (!el) return; el.querySelector('span').textContent = tekst; el.hidden = !tekst; }
  function rij(dt, dd) { return '<dt>' + dt + '</dt><dd>' + String(dd || '').replace(/[<>]/g, '') + '</dd>'; }

  if (form.t0) form.t0.value = String(Date.now());
  if (!token) { laden.hidden = true; ongeldig.hidden = false; return; }
  fetch(base + 'api/guardian?t=' + encodeURIComponent(token))
    .then(function (r) { return r.json(); })
    .then(function (j) {
      laden.hidden = true;
      if (!j.ok) { if (j.verlopen) { var sp = ongeldig.querySelector('span'); sp.textContent = lang === 'nl' ? 'Deze link is verlopen. Vraag het kampteam om een nieuwe link.' : 'This link has expired. Ask the camp team for a new link.'; } ongeldig.hidden = false; return; }
      if (j.bevestigd) { document.querySelector('[data-al-bevestigd]').hidden = false; return; }
      form.querySelector('[data-overzicht]').innerHTML = rij(S.id, j.id) + rij(S.naam, j.naam) + rij(S.type, j.type === 'cop' ? S.cop : S.guest) + rij(S.land, j.land);
      if (j.voogdNaam) form.naam.value = j.voogdNaam;
      if (j.voogdEmail) form.email.value = j.voogdEmail;
      if (j.voogdTelefoon) form.telefoon.value = j.voogdTelefoon;
      if (j.voogdRelatie) form.relatie.value = j.voogdRelatie;
      form.hidden = false;
    })
    .catch(function () { laden.hidden = true; ongeldig.hidden = false; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fout = form.querySelector('[data-fout]');
    melding(fout, '');
    var ok = true;
    [form.naam, form.relatie, form.telefoon, form.email].forEach(function (i) {
      var v = i.closest('.veld'); var slecht = !i.value.trim() || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value));
      v.classList.toggle('fout', slecht); if (slecht) ok = false;
    });
    [form.ouder, form.toestemming].forEach(function (c) { c.closest('.vink').classList.toggle('fout', !c.checked); if (!c.checked) ok = false; });
    if (!ok) { melding(fout, S.vulIn); return; }
    var knop = form.querySelector('[type="submit"]'); knop.disabled = true;
    fetch(base + 'api/guardian/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      t: token, naam: form.naam.value.trim(), relatie: form.relatie.value, telefoon: form.telefoon.value.trim(), email: form.email.value.trim(),
      opmerking: form.opmerking.value.trim(), media: form.media.checked, taal: lang,
      website: form.website ? form.website.value : '', t0: form.t0 ? form.t0.value : '',
    }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.fout || 'fout'); return j; }); })
      .then(function () { form.hidden = true; document.querySelector('[data-klaar]').hidden = false; window.scrollTo({ top: 0, behavior: 'smooth' }); })
      .catch(function () { melding(fout, S.netwerk); knop.disabled = false; });
  });
  form.querySelectorAll('input, select').forEach(function (i) { i.addEventListener('input', function () { var v = i.closest('.veld') || i.closest('.vink'); if (v) v.classList.remove('fout'); }); });
})();
