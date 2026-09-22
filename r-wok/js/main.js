/* R-wok: site-eigen laag bovenop motion.js.
   1. Live openstatus (ma 12-20, di dicht, wo t/m zo 12-20); zonder JavaScript
      blijft de vaste openingstijdenregel staan (fail-open).
   2. De keuzematrix: basis x saus wordt live een receptkaart met nummer,
      prijs en pittigheid; de bestelknop geeft het gerecht mee aan de
      bestelpagina (?add=id). Zonder JavaScript staat de volledige kaart
      gewoon op de menukaartpagina. */
(function () {
  'use strict';

  /* ---------- live openstatus ---------- */
  var statusEls = document.querySelectorAll('[data-open-status]');
  if (statusEls.length) {
    var nu = new Date();
    var dag = nu.getDay();                 /* 0 = zondag, 2 = dinsdag */
    var open = dag !== 2;
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var tekst, dicht = false;
    if (open && uur >= 12 && uur < 20) {
      tekst = 'Nu geopend, tot 20.00 uur';
    } else if (open && uur < 12) {
      tekst = 'Vandaag geopend vanaf 12.00 uur';
    } else {
      var volgende = new Date(nu);
      volgende.setDate(volgende.getDate() + 1);
      while (volgende.getDay() === 2) volgende.setDate(volgende.getDate() + 1);
      var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
      var morgen = new Date(nu); morgen.setDate(morgen.getDate() + 1);
      var wanneer = volgende.toDateString() === morgen.toDateString() ? 'morgen' : DAGEN[volgende.getDay()];
      tekst = (open ? 'Vandaag gesloten, ' : 'Dinsdag gesloten, ') + wanneer + ' vanaf 12.00 uur';
      dicht = true;
    }
    statusEls.forEach(function (el) {
      el.querySelector('[data-status-tekst]').textContent = tekst;
      el.classList.toggle('dicht', dicht);
    });
  }

  /* ---------- de keuzematrix ---------- */
  var matrix = document.querySelector('[data-matrix]');
  var kaartje = document.querySelector('[data-receptkaart]');
  if (matrix && kaartje) {
    var BASISSEN = [
      { key: 'kipfilet', naam: 'Kipfilet', prijs: 13.95, start: 38 },
      { key: 'biefstuk', naam: 'Biefstuk', prijs: 14.95, start: 20 },
      { key: 'garnalen', naam: 'Garnalen', prijs: 14.95, start: 26 },
      { key: 'peking-eend', naam: 'Peking eend', prijs: 14.95, start: 32 },
      { key: 'cha-sieuw', naam: 'Cha sieuw', prijs: 13.95, start: 44 },
      { key: 'tofu', naam: 'Tofu', prijs: 12.95, start: 55, veg: true },
    ];
    var SAUZEN = [
      { naam: 'Teriyaki', vol: 'teriyakisaus', pittig: 0 },
      { naam: 'Zoetzuur', vol: 'zoetzure saus', pittig: 0 },
      { naam: 'Ketjap', vol: 'ketjapsaus', pittig: 0 },
      { naam: 'Gon bao', vol: 'gon bao saus', pittig: 1 },
      { naam: 'Zwarte peper', vol: 'zwarte pepersaus', pittig: 2 },
      { naam: 'Thais rood', vol: 'thaise rode saus', pittig: 1 },
    ];

    var naamEl = kaartje.querySelector('[data-rk-naam]');
    var nrEl = kaartje.querySelector('[data-rk-nr]');
    var sausEl = kaartje.querySelector('[data-rk-saus]');
    var pittigEl = kaartje.querySelector('[data-rk-pittig]');
    var prijsEl = kaartje.querySelector('[data-rk-prijs]');
    var knopEl = kaartje.querySelector('[data-rk-bestel]');
    var qrEl = kaartje.querySelector('[data-rk-qr]');

    function euro(n) { return '€ ' + n.toFixed(2).replace('.', ','); }

    /* het qr-blokje: deterministisch patroon uit het gerechtnummer,
       puur decor (de echte QR-kaart zit in de keuken) */
    function tekenQr(nr) {
      if (!qrEl) return;
      qrEl.innerHTML = '';
      var zaad = nr * 2654435761 % 4294967296;
      for (var i = 0; i < 49; i++) {
        zaad = (zaad * 1103515245 + 12345) % 2147483648;
        var blok = document.createElement('i');
        if (zaad % 100 < 44) blok.className = 'uit';
        qrEl.appendChild(blok);
      }
    }

    function kies(b, s, cel) {
      matrix.querySelectorAll('button[aria-pressed]').forEach(function (k) {
        k.setAttribute('aria-pressed', String(k === cel));
      });
      var nr = BASISSEN[b].start + s;
      var id = BASISSEN[b].key + '-' + s;
      naamEl.textContent = BASISSEN[b].naam + ' ' + SAUZEN[s].vol;
      nrEl.textContent = 'NR ' + String(nr).padStart(3, '0');
      sausEl.innerHTML = 'saus <b>' + SAUZEN[s].vol + '</b>';
      pittigEl.innerHTML = SAUZEN[s].pittig
        ? 'pittig <b>' + '●'.repeat(SAUZEN[s].pittig) + '○'.repeat(2 - SAUZEN[s].pittig) + '</b>'
        : 'pittig <b>mild</b>';
      prijsEl.textContent = euro(BASISSEN[b].prijs);
      knopEl.href = 'bestellen.html?add=' + id;
      tekenQr(nr);
    }

    /* de matrixtabel opbouwen (de volledige kaart staat statisch op menukaart.html) */
    var tbody = matrix.querySelector('tbody');
    BASISSEN.forEach(function (basis, b) {
      var rij = document.createElement('tr');
      var kop = document.createElement('th');
      kop.scope = 'row';
      kop.innerHTML = basis.naam + (basis.veg ? ' <span class="veg-label">veg</span>' : '') +
        '<small>' + euro(basis.prijs) + ' incl. bijgerecht</small>';
      rij.appendChild(kop);
      SAUZEN.forEach(function (saus, s) {
        var cel = document.createElement('td');
        var knop = document.createElement('button');
        knop.type = 'button';
        knop.setAttribute('aria-pressed', 'false');
        knop.setAttribute('aria-label', basis.naam + ' met ' + saus.vol);
        knop.innerHTML = String(basis.start + s).padStart(3, '0') +
          (saus.pittig ? '<span class="pepers" aria-hidden="true">' + '▲'.repeat(saus.pittig) + '</span>' : '');
        knop.addEventListener('click', function () { kies(b, s, knop); });
        cel.appendChild(knop);
        rij.appendChild(cel);
      });
      tbody.appendChild(rij);
    });

    kies(0, 0, tbody.querySelector('button'));   /* start: kipfilet teriyaki, nr 038 */
  }
})();
