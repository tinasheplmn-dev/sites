/* Bestelpagina Kees Kroket.
   De kaart komt uit js/kaartdata.js (gegenereerd uit de catalogus).
   Online bestellen vereist JavaScript; zonder JavaScript toont de pagina
   een noscript-melding met menukaart en telefoonnummer als route.

   TAFEL: de betaalmotor (mettafel.nl). Zolang de zaak zijn Tafel-account
   nog niet heeft gekoppeld staat actief op false en legt de afrekenknop
   uit hoe je de bestelling nu doorgeeft. Na koppeling: actief op true en
   het bestel-endpoint van Tafel invullen. */
(function () {
  'use strict';

  var TAFEL = { actief: false, endpoint: '' };

  var menuVlak = document.getElementById('bestelmenu');
  if (!menuVlak || typeof KAARTDATA === 'undefined') return;

  var euro = function (n) { return n.toFixed(2).replace('.', ','); };
  var smal = window.matchMedia('(max-width: 1020px)');

  /* ---------- producten indexeren ---------- */
  var producten = {};
  KAARTDATA.forEach(function (groep) {
    groep.items.forEach(function (item) {
      if (item.varianten) {
        item.varianten.forEach(function (v, i) {
          producten[item.id + '-' + i] = { naam: item.naam, variant: v.label, prijs: v.prijs };
        });
      } else {
        producten[item.id] = { naam: item.naam, prijs: item.prijs, vanaf: item.vanaf };
      }
    });
  });

  /* ---------- wagen-state ---------- */
  var wagen = {};
  try {
    var bewaard = JSON.parse(localStorage.getItem('kk-bestelling') || '{}');
    Object.keys(bewaard).forEach(function (k) {
      if (producten[k] && bewaard[k] > 0) wagen[k] = Math.min(bewaard[k], 50);
    });
  } catch (e) { /* opslag niet beschikbaar, verder zonder */ }

  function bewaar() {
    try { localStorage.setItem('kk-bestelling', JSON.stringify(wagen)); } catch (e) { /* prima */ }
  }

  /* ---------- menu renderen ---------- */
  var html = '';
  var vorigeKaart = '';
  KAARTDATA.forEach(function (groep, gi) {
    if (groep.kaart !== vorigeKaart) {
      vorigeKaart = groep.kaart;
      html += '<div class="bestel-kaartkop"><h2>' + groep.kaart + '</h2></div>';
    }
    var open = (!smal.matches && gi === 0) ? ' open' : '';
    html += '<details class="bestelgroep"' + open + '>';
    html += '<summary class="groepkop" data-aantal="' + groep.items.length + '"><h3>' + groep.titel + '</h3></summary>';
    html += '<div class="groepbody">';
    if (groep.noot && !/normaal/.test(groep.noot)) html += '<p class="groepnoot">' + groep.noot + '</p>';
    html += '<ul>';
    groep.items.forEach(function (item) {
      html += '<li class="bestel-item">';
      if (item.varianten) {
        html += '<span class="bestel-regel"><span class="naam">' + item.naam + '</span></span>';
        item.varianten.forEach(function (v, i) {
          html += '<span class="bestel-regel variant"><span class="naam">' + v.label + '</span>'
            + '<span class="stippels" aria-hidden="true"></span><span class="prijs">' + euro(v.prijs) + '</span>'
            + '<button class="plus" data-plus="' + item.id + '-' + i + '" aria-label="Voeg toe: ' + item.naam + ' ' + v.label + '">+</button></span>';
        });
      } else {
        html += '<span class="bestel-regel"><span class="naam">' + item.naam + '</span>'
          + '<span class="stippels" aria-hidden="true"></span><span class="prijs">' + (item.vanaf ? 'vanaf ' : '') + euro(item.prijs) + '</span>'
          + '<button class="plus" data-plus="' + item.id + '" aria-label="Voeg toe: ' + item.naam + '">+</button></span>';
      }
      html += '</li>';
    });
    html += '</ul></div></details>';
  });
  menuVlak.innerHTML = html;

  /* ---------- afhaaltijden uit de openingstijden ---------- */
  var uren = { 0: [13, 24], 1: [11, 23], 2: [11, 23], 3: [11, 24], 4: [11, 25.5], 5: [11, 25.5], 6: [11, 25.5] };
  function tijdTekst(u) {
    var h = Math.floor(u % 24), m = Math.round((u % 1) * 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function vulTijden() {
    var kies = document.getElementById('afhaaltijd');
    if (!kies) return;
    var nu = new Date();
    var dag = nu.getDay();
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var gisteren = (dag + 6) % 7;
    var openNu = (uren[gisteren][1] > 24 && uur < uren[gisteren][1] - 24) || (uur >= uren[dag][0] && uur < uren[dag][1]);
    var opties = [];
    if (openNu) {
      opties.push('<option value="zsm">Zo snel mogelijk</option>');
      var einde = (uren[gisteren][1] > 24 && uur < uren[gisteren][1] - 24) ? uren[gisteren][1] - 24 : uren[dag][1];
      var start = Math.ceil((uur + 0.5) * 4) / 4;
      for (var t = start; t <= Math.min(einde - 0.25, start + 6); t += 0.25) {
        opties.push('<option value="' + tijdTekst(t) + '">' + tijdTekst(t) + '</option>');
      }
    } else {
      var vanaf = uur < uren[dag][0] ? uren[dag][0] : uren[(dag + 1) % 7][0];
      var wanneer = uur < uren[dag][0] ? 'vandaag' : 'morgen';
      opties.push('<option value="opening">Bij opening (' + wanneer + ' ' + tijdTekst(vanaf) + ')</option>');
      for (var t2 = vanaf + 0.25; t2 <= vanaf + 3; t2 += 0.25) {
        opties.push('<option value="' + tijdTekst(t2) + '">' + wanneer + ' ' + tijdTekst(t2) + '</option>');
      }
    }
    kies.innerHTML = opties.join('');
  }
  vulTijden();

  /* ---------- wagen tekenen ---------- */
  var lijst = document.getElementById('wagen-lijst');
  var leeg = document.getElementById('wagen-leeg');
  var totaalEl = document.getElementById('wagen-totaal');
  var balkKnop = document.getElementById('wagen-balk-knop');

  function teken() {
    var keys = Object.keys(wagen);
    var totaal = 0, stuks = 0;
    var uit = '';
    keys.forEach(function (k) {
      var p = producten[k];
      var n = wagen[k];
      totaal += p.prijs * n;
      stuks += n;
      uit += '<li class="wagen-item"><span class="wi-naam">' + p.naam + (p.variant ? '<small>' + p.variant + '</small>' : '') + '</span>'
        + '<span class="stepper"><button data-min="' + k + '" aria-label="Eén minder: ' + p.naam + '">&minus;</button>'
        + '<span class="aant">' + n + '</span>'
        + '<button data-bij="' + k + '" aria-label="Eén meer: ' + p.naam + '">+</button></span>'
        + '<span class="wi-prijs">' + euro(p.prijs * n) + '</span></li>';
    });
    lijst.innerHTML = uit;
    leeg.hidden = keys.length > 0;
    totaalEl.textContent = euro(totaal);
    if (balkKnop) {
      balkKnop.querySelector('.bb-links').textContent = stuks === 0 ? 'Nog niets gekozen'
        : 'Bekijk bestelling (' + stuks + ')';
      balkKnop.querySelector('.bb-rechts').textContent = stuks === 0 ? '' : euro(totaal);
    }
    bewaar();
  }
  teken();

  /* ---------- kliks ---------- */
  document.addEventListener('click', function (e) {
    var plus = e.target.closest('[data-plus]');
    if (plus) {
      var id = plus.getAttribute('data-plus');
      wagen[id] = (wagen[id] || 0) + 1;
      teken();
      plus.classList.add('gedaan');
      setTimeout(function () { plus.classList.remove('gedaan'); }, 350);
      return;
    }
    var bij = e.target.closest('[data-bij]');
    if (bij) { wagen[bij.getAttribute('data-bij')]++; teken(); return; }
    var min = e.target.closest('[data-min]');
    if (min) {
      var k = min.getAttribute('data-min');
      wagen[k]--;
      if (wagen[k] <= 0) delete wagen[k];
      teken();
    }
  });

  /* ---------- mobiel: wagenpaneel ---------- */
  var paneel = document.querySelector('.wagen');
  if (balkKnop && paneel) {
    balkKnop.addEventListener('click', function () { paneel.classList.add('open'); });
    var dicht = paneel.querySelector('.wagen-paneel-dicht');
    if (dicht) dicht.addEventListener('click', function () { paneel.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') paneel.classList.remove('open'); });
  }

  /* ---------- afrekenen ---------- */
  var afreken = document.getElementById('afrekenen');
  var melding = document.getElementById('wagen-meldvlak');
  if (afreken) {
    afreken.addEventListener('click', function () {
      melding.innerHTML = '';
      var naam = document.getElementById('bestel-naam');
      var tel = document.getElementById('bestel-tel');
      [naam, tel].forEach(function (v) { v.classList.remove('veldfout'); });
      if (!Object.keys(wagen).length) {
        melding.innerHTML = '<div class="wagen-melding">Je bestelling is nog leeg. Kies eerst iets lekkers van de kaart.</div>';
        return;
      }
      var fout = false;
      if (!naam.value.trim()) { naam.classList.add('veldfout'); fout = true; }
      if (!/[0-9]{8,}/.test(tel.value.replace(/[\s-]/g, ''))) { tel.classList.add('veldfout'); fout = true; }
      if (fout) {
        melding.innerHTML = '<div class="wagen-melding">Vul je naam en een telefoonnummer in, dan weten we voor wie de bestelling klaarstaat.</div>';
        return;
      }
      if (TAFEL.actief && TAFEL.endpoint) {
        var order = {
          items: Object.keys(wagen).map(function (k) {
            var p = producten[k];
            return { naam: p.naam, variant: p.variant || null, aantal: wagen[k], prijs: p.prijs };
          }),
          naam: naam.value.trim(),
          telefoon: tel.value.trim(),
          afhaaltijd: document.getElementById('afhaaltijd').value,
          opmerking: document.getElementById('bestel-opmerking').value.trim()
        };
        var f = document.createElement('form');
        f.method = 'POST';
        f.action = TAFEL.endpoint;
        var veld = document.createElement('input');
        veld.type = 'hidden'; veld.name = 'order'; veld.value = JSON.stringify(order);
        f.appendChild(veld);
        document.body.appendChild(f);
        f.submit();
        return;
      }
      melding.innerHTML = '<div class="wagen-melding" role="status"><strong>Bijna klaar.</strong> '
        + 'De online betaling loopt via Tafel en wordt geactiveerd zodra de kassakoppeling van de zaak live staat. '
        + 'Tot die tijd geef je je bestelling in één minuut telefonisch door: '
        + '<a href="tel:0736136720">073 613 6720</a>. Je lijstje hierboven blijft bewaard.</div>';
    });
  }
})();
