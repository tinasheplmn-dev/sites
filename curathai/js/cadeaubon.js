/* cadeaubon.js: live voorbeeld van de bon en de bestelling naar /api/cadeaubon
   (powered by Mettafel). Lukt versturen niet, dan een mailknop met alles erin. */
(function () {
  'use strict';
  var form = document.querySelector('[data-cadeaubon]');
  if (!form) return;
  var $ = function (s) { return document.querySelector(s); };
  var euro = function (v) { return v === 'retraite' ? 'Retraite' : '€ ' + v; };
  function werkBij() {
    var bedrag = (form.querySelector('[name="bedrag"]:checked') || {}).value || '90';
    var bezorging = (form.querySelector('[name="bezorging"]:checked') || {}).value;
    $('[data-bon-bedrag]').textContent = euro(bedrag);
    $('[data-sam-bedrag]').textContent = euro(bedrag);
    $('[data-sam-totaal]').textContent = bedrag === 'retraite' ? 'In overleg' : '€ ' + bedrag;
    $('[data-sam-bezorging]').textContent = bezorging;
    $('[data-bon-ontvanger]').textContent = form.ontvanger.value.trim() ? 'Voor ' + form.ontvanger.value.trim() : 'Voor jou';
    $('[data-bon-boodschap]').textContent = form.boodschap.value.trim() || 'Even helemaal niks. Geniet ervan!';
    $('[data-bon-van]').textContent = form.van.value.trim() ? 'Van ' + form.van.value.trim() : 'Cura Thai';
    $('[data-teller]').textContent = form.boodschap.value.length;
    $('[data-adres]').hidden = bezorging !== 'Op papier, per post';
  }
  form.addEventListener('input', werkBij);
  form.addEventListener('change', werkBij);
  werkBij();

  var meldingen = {
    ontvanger: 'Voor wie is de cadeaubon?',
    naam: 'Vul je naam in.',
    email: 'Vul een geldig e-mailadres in.',
    telefoon: 'Vul je telefoonnummer in, voor als Juniska een vraag heeft.',
    adres: 'Vul het verzendadres in.',
  };
  function fout(naam, tekst) {
    var veld = form.querySelector('[name="' + naam + '"]').closest('.veld');
    var p = veld.querySelector('.fout');
    if (!p) { p = document.createElement('p'); p.className = 'fout'; p.setAttribute('role', 'alert'); veld.appendChild(p); }
    p.textContent = tekst || ''; p.hidden = !tekst; veld.classList.toggle('mis', !!tekst);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    var eerste = null;
    Object.keys(meldingen).forEach(function (k) {
      var mist = !data[k];
      if (k === 'adres') mist = data.bezorging === 'Op papier, per post' && !data.adres;
      if (k === 'email' && data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) mist = true;
      if (k === 'telefoon' && data.telefoon && data.telefoon.replace(/\D/g, '').length < 9) mist = true;
      fout(k, mist ? meldingen[k] : '');
      if (mist && !eerste) eerste = k;
    });
    if (eerste) { form.querySelector('[name="' + eerste + '"]').focus(); return; }
    data.bedrag = euro(data.bedrag);
    var knop = form.querySelector('button[type="submit"]');
    knop.disabled = true;
    fetch('/api/cadeaubon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.fout || 'mislukt');
        form.hidden = true;
        var bev = $('[data-bevestiging]');
        bev.querySelector('[data-nummer]').textContent = j.id || '';
        bev.hidden = false;
        bev.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function () {
        knop.disabled = false;
        var body = encodeURIComponent(Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n'));
        $('[data-reserve]').href = 'mailto:juniska@curathai.nl?subject=' + encodeURIComponent('Cadeaubon bestellen') + '&body=' + body;
        $('[data-reserve-blok]').hidden = false;
      });
  });
})();
