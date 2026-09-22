/* Restaurant Rhodos: het online bestelsysteem, powered by Mettafel.
   ALLEEN AFHALEN (Rhodos bezorgt niet) — de wijze staat vast op 'afhalen'.
   Zoeken en categoriechips, favorietenlabels, een licht "account op dit
   toestel" (localStorage, geen wachtwoord) met bestel-opnieuw, en een
   tweetalige interface (nl/en).
   Fail-open: zonder JavaScript blijft de volledige kaart leesbaar en staat
   er een telefoonnummer; de plusknoppen doen dan niets.
   Rhodos geeft 10% korting bij afhalen (bron: eigen site): het mandje en de
   totalen tonen subtotaal, korting en eindtotaal.
   Demo-afspraak: geen online betaling, betalen bij afhalen. */
(function () {
  'use strict';

  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    leeg: 'Still empty. Pick something delicious from the menu.',
    naamFout: 'Fill in your name so we know whose order it is.',
    telFout: 'Fill in a phone number we can reach you on.',
    mandLeegFout: 'Your basket is empty.',
    verstuurFout: function (m) { return 'Sending failed (' + m + '). Please try again, or call us on 073 613 2213.'; },
    versturen: 'Sending...', plaats: 'Place order',
    zsmAfhaal: 'As soon as possible (± 25 minutes)',
    vandaag: 'Today', tijdAfhaal: 'Collection time',
    subtotaal: 'Subtotal', korting: 'Takeaway discount (10%)', eindtotaal: 'Total',
    bevestigAfhaal: function (naam, n, tot, tijd) { return 'Efcharisto ' + naam + "! We're on it. Your order (" + n + ' dishes, ' + tot + ' incl. 10% takeaway discount) will be ready: ' + tijd + ', at Kerkstraat 87. You pay on collection, by card or in cash.'; },
    bekijk: function (n, tot) { return 'View your order (' + n + ') · ' + tot; },
    accountMaak: 'Create an account',
    accountNoot: 'Saved on this device only, no password needed.',
    accountNaam: 'Your name', accountTel: 'Phone number', accountOpslaan: 'Save',
    accountHoi: function (naam) { return 'Kalimera ' + naam + '!'; },
    accountWissen: 'remove my details',
    opnieuw: function (n, tot) { return 'Order again: ' + n + ' dishes · ' + tot; },
    accountKlaarNoot: 'Save your details and this order on this device, so next time is a one-tap job.',
    accountKlaarKnop: 'Create an account for next time',
    accountKlaarGelukt: 'Saved! Next time your details and "order again" will be ready for you.',
  } : {
    leeg: 'Nog leeg. Kies iets lekkers van de kaart hiernaast.',
    naamFout: 'Vul je naam in, dan weten we voor wie de bestelling is.',
    telFout: 'Vul een telefoonnummer in waarop we je kunnen bereiken.',
    mandLeegFout: 'Je mandje is leeg.',
    verstuurFout: function (m) { return 'Versturen lukte niet (' + m + '). Probeer het opnieuw, of bel ons op 073 613 2213.'; },
    versturen: 'Versturen...', plaats: 'Plaats bestelling',
    zsmAfhaal: 'Zo snel mogelijk (± 25 minuten)',
    vandaag: 'Vandaag', tijdAfhaal: 'Afhaaltijd',
    subtotaal: 'Subtotaal', korting: 'Afhaalkorting (10%)', eindtotaal: 'Totaal',
    bevestigAfhaal: function (naam, n, tot, tijd) { return 'Efcharisto ' + naam + '! We gaan voor je aan de slag. Je bestelling (' + n + ' gerechten, ' + tot + ' incl. 10% afhaalkorting) staat klaar: ' + tijd + ', Kerkstraat 87. Betalen doe je bij het afhalen, met pin of contant.'; },
    bekijk: function (n, tot) { return 'Bekijk je bestelling (' + n + ') · ' + tot; },
    accountMaak: 'Maak een account',
    accountNoot: 'Alleen opgeslagen op dit toestel, geen wachtwoord nodig.',
    accountNaam: 'Je naam', accountTel: 'Telefoonnummer', accountOpslaan: 'Opslaan',
    accountHoi: function (naam) { return 'Kalimera ' + naam + '!'; },
    accountWissen: 'gegevens wissen',
    opnieuw: function (n, tot) { return 'Bestel opnieuw: ' + n + ' gerechten · ' + tot; },
    accountKlaarNoot: 'Bewaar je gegevens en deze bestelling op dit toestel, dan is het de volgende keer één tik.',
    accountKlaarKnop: 'Maak een account voor de volgende keer',
    accountKlaarGelukt: 'Opgeslagen! De volgende keer staan je gegevens en "bestel opnieuw" voor je klaar.',
  };

  var KAART = window.KAART || [];
  var ITEMS = {};
  KAART.forEach(function (c) { c.items.forEach(function (i) { ITEMS[i.id] = i; }); });

  var euro = function (n) { return '€ ' + n.toFixed(2).replace('.', ','); };
  function bewaarBlok(sleutel, waarde) {
    try { localStorage.setItem(sleutel, JSON.stringify(waarde)); } catch (e) { /* geen opslag, geen ramp */ }
  }
  function leesBlok(sleutel) {
    try { return JSON.parse(localStorage.getItem(sleutel) || 'null'); } catch (e) { return null; }
  }

  /* 10% afhaalkorting (bron: eigen site van Restaurant Rhodos) — Rhodos
     bezorgt niet, dus deze korting geldt voor elke bestelling. */
  var KORTINGPERCENTAGE = 0.10;

  var mand = {};
  var bewaard = leesBlok('rhodos-mand') || {};
  Object.keys(bewaard).forEach(function (id) {
    if (ITEMS[id] && bewaard[id] > 0) mand[id] = Math.min(20, bewaard[id] | 0);
  });

  var stapKiezen = document.getElementById('mandje-stap-kiezen');
  var stapAfronden = document.getElementById('mandje-stap-afronden');
  var stapKlaar = document.getElementById('mandje-stap-klaar');
  var regelsEl = document.querySelector('[data-mandje-regels]');
  var totaalWrap = document.querySelector('[data-mandje-totaal]');
  var naarAfronden = document.querySelector('[data-naar-afronden]');
  var zwever = document.querySelector('[data-mandje-zwever]');
  var zweverTekst = document.querySelector('[data-zwever-tekst]');
  var actiebalk = document.querySelector('[data-mobielcta]');
  if (actiebalk) actiebalk.remove();   /* op deze pagina zweeft het mandje al */

  /* categorieën inklappen behalve de eerste; zonder JavaScript staat alles open */
  var cats = document.querySelectorAll('.bestel-menu .menu-categorie');
  cats.forEach(function (d, i) { d.open = i === 0; });

  function subtotaal() {
    return Object.keys(mand).reduce(function (som, id) { return som + ITEMS[id].prijs * mand[id]; }, 0);
  }
  function korting() {
    return Math.round(subtotaal() * KORTINGPERCENTAGE * 100) / 100;
  }
  function totaal() {
    return Math.round((subtotaal() - korting()) * 100) / 100;
  }
  function aantalStuks() {
    return Object.keys(mand).reduce(function (som, id) { return som + mand[id]; }, 0);
  }
  function bewaar() { bewaarBlok('rhodos-mand', mand); }

  function toonRegel(regel) {
    var id = regel.getAttribute('data-item');
    var n = mand[id] || 0;
    var min = regel.querySelector('[data-min]');
    var aant = regel.querySelector('[data-aantal]');
    min.hidden = n === 0;
    aant.hidden = n === 0;
    aant.textContent = n;
    regel.querySelector('[data-plus]').classList.toggle('vol', n > 0);
  }

  function toonMand() {
    var ids = Object.keys(mand);
    if (!ids.length) {
      regelsEl.innerHTML = '<p class="mandje-leeg">' + T.leeg + '</p>';
    } else {
      regelsEl.innerHTML = ids.map(function (id) {
        var i = ITEMS[id];
        return '<div class="mandje-regel"><span class="n">' + mand[id] + '× ' + i.naam + '</span><span>' + euro(i.prijs * mand[id]) + '</span></div>';
      }).join('');
    }
    var t = euro(totaal());
    document.querySelectorAll('[data-subtotaal]').forEach(function (el) { el.textContent = euro(subtotaal()); });
    document.querySelectorAll('[data-korting]').forEach(function (el) { el.textContent = '- ' + euro(korting()); });
    document.querySelectorAll('[data-korting-label]').forEach(function (el) { el.textContent = T.korting; });
    document.querySelectorAll('[data-subtotaal-label]').forEach(function (el) { el.textContent = T.subtotaal; });
    document.querySelectorAll('[data-totaal-label]').forEach(function (el) { el.textContent = T.eindtotaal; });
    document.querySelectorAll('[data-totaal]').forEach(function (el) { el.textContent = t; });
    totaalWrap.hidden = !ids.length;
    naarAfronden.disabled = !ids.length;
    if (zwever) {
      zwever.hidden = !ids.length || !stapAfronden.hidden || !stapKlaar.hidden;
      zweverTekst.textContent = T.bekijk(aantalStuks(), t);
    }
  }

  document.querySelectorAll('.bestel-regel').forEach(function (regel) {
    var id = regel.getAttribute('data-item');
    if (!ITEMS[id]) return;
    regel.querySelector('[data-plus]').addEventListener('click', function () {
      mand[id] = Math.min(20, (mand[id] || 0) + 1);
      toonRegel(regel); toonMand(); bewaar();
      /* micro-feedback: knopje popt, mandje-zwever pulseert even mee */
      var k = this;
      k.classList.remove('pop'); void k.offsetWidth; k.classList.add('pop');
      if (zwever && !zwever.hidden) { zwever.classList.remove('puls'); void zwever.offsetWidth; zwever.classList.add('puls'); }
    });
    regel.querySelector('[data-min]').addEventListener('click', function () {
      if (!mand[id]) return;
      mand[id] -= 1;
      if (!mand[id]) delete mand[id];
      toonRegel(regel); toonMand(); bewaar();
    });
    toonRegel(regel);
  });

  /* ---------- zoeken en categoriechips ---------- */
  var zoek = document.querySelector('[data-bestel-zoek]');
  var zoekLeeg = document.querySelector('[data-zoek-leeg]');
  if (zoek) {
    zoek.addEventListener('input', function () {
      var q = zoek.value.trim().toLowerCase();
      var treffers = 0;
      cats.forEach(function (cat) {
        var inCat = 0;
        cat.querySelectorAll('.bestel-regel').forEach(function (r) {
          var raak = !q || (r.getAttribute('data-zoektekst') || '').indexOf(q) !== -1;
          r.hidden = !raak;
          if (raak) inCat++;
        });
        cat.hidden = !!q && !inCat;
        if (q && inCat) cat.open = true;
        treffers += inCat;
      });
      if (!q) cats.forEach(function (d, i) { d.open = i === 0; });
      if (zoekLeeg) zoekLeeg.hidden = !q || treffers > 0;
    });
  }
  document.querySelectorAll('[data-chip]').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      if (zoek && zoek.value) { zoek.value = ''; zoek.dispatchEvent(new Event('input')); }
      var doel = document.getElementById('bestel-' + chip.dataset.chip);
      if (!doel) return;
      cats.forEach(function (d) { d.open = d === doel; });
      doel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  });

  /* ---------- tijden binnen de echte openingstijden ---------- */
  /* Restaurant Rhodos: open maandag t/m zondag, geen sluitingsdag.
     Keuken ma-vr en zo 15:30-22:00, zaterdag al vanaf 11:30 (met lunch
     tot 15:00, daarna gewoon door tot 22:00). Laatste afhaalmoment 21:45,
     in stappen van 15 minuten, vanaf 30 minuten na "nu". */
  var wijze = 'afhalen';
  function open(dag) { return true; }
  function openVanaf(dag) { return dag === 6 ? [11, 30] : [15, 30]; }
  function tijden() {
    var nu = new Date();
    var lijst = [];
    var dag = new Date(nu);
    for (var d = 0; d < 8 && lijst.length === 0; d++) {
      var vanUur = openVanaf(dag.getDay());
      var van = new Date(dag); van.setHours(vanUur[0], vanUur[1], 0, 0);
      var tot = new Date(dag); tot.setHours(21, 45, 0, 0);
      var vroegst = new Date(Math.max(van.getTime(), nu.getTime() + 30 * 60000));
      vroegst.setMinutes(Math.ceil(vroegst.getMinutes() / 15) * 15, 0, 0);
      if (vroegst <= tot) {
        var vandaag = dag.toDateString() === nu.toDateString();
        if (vandaag && nu >= van) {
          lijst.push({ w: 'zsm', t: T.zsmAfhaal });
        }
        for (var s = new Date(vroegst); s <= tot; s = new Date(s.getTime() + 15 * 60000)) {
          var hh = String(s.getHours()).padStart(2, '0') + ':' + String(s.getMinutes()).padStart(2, '0');
          var label = vandaag ? T.vandaag + ' ' + hh : s.toLocaleDateString(EN ? 'en-GB' : 'nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }) + ' ' + hh;
          lijst.push({ w: (vandaag ? 'vandaag' : s.toLocaleDateString('nl-NL')) + ' ' + hh, t: label });
        }
      }
      dag.setDate(dag.getDate() + 1);
      dag.setHours(0, 0, 0, 0);
    }
    return lijst;
  }

  var select = document.getElementById('afhaaltijd');
  function vulTijden() {
    select.innerHTML = tijden().map(function (o) { return '<option value="' + o.w + '">' + o.t + '</option>'; }).join('');
  }

  /* ---------- Rhodos bezorgt niet: de wijze staat vast op "afhalen".
     Als de bestelpagina toch een #wijze-blok met knoppen heeft (overgenomen
     uit een ander sjabloon), verbergen we het netjes en laten we bezorgen
     nooit kiesbaar zijn; is het blok er niet, dan gebeurt hier niets. ---------- */
  var wijzeWrap = document.getElementById('wijze');
  if (wijzeWrap) {
    var wijzeVeld = wijzeWrap.closest('.veld') || wijzeWrap;
    wijzeVeld.hidden = true;
  }
  var bezorgVeldenOud = document.getElementById('bezorg-velden');
  if (bezorgVeldenOud) bezorgVeldenOud.hidden = true;
  var tijdLabel = document.querySelector('[data-tijd-label]');
  if (tijdLabel) tijdLabel.textContent = T.tijdAfhaal;

  /* ---------- account op dit toestel + bestel opnieuw ---------- */
  var accountPlek = document.querySelector('[data-account-plek]');
  function profiel() { return leesBlok('rhodos-profiel'); }
  function laatste() { return leesBlok('rhodos-laatste'); }

  function vulProfielIn() {
    var p = profiel();
    if (!p) return;
    if (p.naam && !stapAfronden.naam.value) stapAfronden.naam.value = p.naam;
    if (p.telefoon && !stapAfronden.telefoon.value) stapAfronden.telefoon.value = p.telefoon;
  }

  function toonAccount() {
    if (!accountPlek) return;
    var p = profiel();
    var l = laatste();
    if (p) {
      var knop = '';
      if (l && l.regels && Object.keys(l.regels).some(function (id) { return ITEMS[id]; })) {
        var geldig = {};
        Object.keys(l.regels).forEach(function (id) { if (ITEMS[id]) geldig[id] = l.regels[id]; });
        var n = Object.keys(geldig).reduce(function (s, id) { return s + geldig[id]; }, 0);
        var tot = Object.keys(geldig).reduce(function (s, id) { return s + geldig[id] * ITEMS[id].prijs; }, 0);
        knop = '<button type="button" class="knop knop-lijn account-opnieuw" data-opnieuw>' + T.opnieuw(n, euro(tot)) + '</button>';
      }
      accountPlek.innerHTML = '<div class="account-blok"><p><strong>' + T.accountHoi(p.naam || '') + '</strong> <button type="button" class="account-wis" data-account-wis>' + T.accountWissen + '</button></p>' + knop + '</div>';
    } else {
      accountPlek.innerHTML = '<div class="account-blok"><button type="button" class="account-maak" data-account-maak>' + T.accountMaak + '</button>' +
        '<form class="account-form" data-account-form hidden>' +
        '<label>' + T.accountNaam + '<input name="naam" autocomplete="name" required></label>' +
        '<label>' + T.accountTel + '<input name="telefoon" type="tel" autocomplete="tel" inputmode="tel" required></label>' +
        '<button class="knop knop-vol" type="submit">' + T.accountOpslaan + '</button>' +
        '<p class="nootje" style="text-align:left">' + T.accountNoot + '</p>' +
        '</form></div>';
    }
  }
  if (accountPlek) {
    accountPlek.addEventListener('click', function (e) {
      if (e.target.closest('[data-account-maak]')) {
        var f = accountPlek.querySelector('[data-account-form]');
        f.hidden = !f.hidden;
        if (!f.hidden) f.naam.focus();
      }
      if (e.target.closest('[data-account-wis]')) {
        try { localStorage.removeItem('rhodos-profiel'); localStorage.removeItem('rhodos-laatste'); } catch (err) {}
        toonAccount();
      }
      var op = e.target.closest('[data-opnieuw]');
      if (op) {
        var l = laatste();
        if (!l) return;
        mand = {};
        Object.keys(l.regels).forEach(function (id) { if (ITEMS[id]) mand[id] = Math.min(20, l.regels[id] | 0); });
        document.querySelectorAll('.bestel-regel').forEach(toonRegel);
        toonMand(); bewaar();
        op.classList.add('vol');
      }
    });
    accountPlek.addEventListener('submit', function (e) {
      var f = e.target.closest('[data-account-form]');
      if (!f) return;
      e.preventDefault();
      if (!f.naam.value.trim() || !f.telefoon.value.trim()) return;
      bewaarBlok('rhodos-profiel', { naam: f.naam.value.trim(), telefoon: f.telefoon.value.trim() });
      toonAccount();
    });
  }
  toonAccount();

  /* ---------- stappen ---------- */
  naarAfronden.addEventListener('click', function () {
    vulTijden();
    vulProfielIn();
    stapKiezen.hidden = true;
    stapAfronden.hidden = false;
    if (zwever) zwever.hidden = true;
    document.getElementById('mandje').scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  stapAfronden.querySelector('[data-terug]').addEventListener('click', function () {
    stapAfronden.hidden = true;
    stapKiezen.hidden = false;
    toonMand();
  });

  function fout(veld, tekst) {
    var el = document.querySelector('[data-fout="' + veld + '"]');
    if (!el) return;
    el.textContent = tekst || '';
    el.hidden = !tekst;
    var invoer = stapAfronden.querySelector('[name="' + veld + '"]');
    if (invoer) invoer.closest('.veld').classList.toggle('heeft-fout', !!tekst);
  }

  stapAfronden.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['tijd', 'naam', 'telefoon', 'algemeen'].forEach(function (v) { fout(v, ''); });

    var naam = stapAfronden.naam.value.trim();
    var telefoon = stapAfronden.telefoon.value.trim();
    var ok = true;
    if (!naam) { fout('naam', T.naamFout); ok = false; }
    if (!/^[\d+][\d\s\-()]{7,}$/.test(telefoon)) { fout('telefoon', T.telFout); ok = false; }
    if (!Object.keys(mand).length) { fout('algemeen', T.mandLeegFout); ok = false; }
    if (!ok) return;

    var knop = stapAfronden.querySelector('[data-verstuur]');
    knop.disabled = true; knop.textContent = T.versturen;

    var regels = Object.keys(mand).map(function (id) {
      return { id: id, naam: ITEMS[id].naam, aantal: mand[id], prijs: ITEMS[id].prijs };
    });
    try {
      var r = await fetch('/api/bestelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: naam,
          telefoon: telefoon,
          wijze: wijze,
          tijd: select.value,
          opmerking: stapAfronden.opmerking.value.trim(),
          regels: regels,
          subtotaal: Math.round(subtotaal() * 100) / 100,
          korting: Math.round(korting() * 100) / 100,
          totaal: Math.round(totaal() * 100) / 100,
        }),
      });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');

      var tijdTekst = select.selectedOptions[0].textContent.toLowerCase();
      var n = aantalStuks(), tot = euro(totaal());
      document.querySelector('[data-bevestig-nummer]').textContent = (EN ? 'Order ' : 'Bestelling ') + j.id;
      document.querySelector('[data-bevestig-tekst]').textContent = T.bevestigAfhaal(naam, n, tot, tijdTekst);

      /* laatste bestelling bewaren; profiel bijwerken of aanbieden */
      bewaarBlok('rhodos-laatste', { regels: mand, wanneer: new Date().toISOString() });
      if (profiel()) {
        bewaarBlok('rhodos-profiel', { naam: naam, telefoon: telefoon });
      } else {
        var plek = document.querySelector('[data-account-plek-klaar]');
        if (plek) {
          plek.innerHTML = '<div class="account-blok"><p class="nootje" style="text-align:left">' + T.accountKlaarNoot + '</p>' +
            '<button type="button" class="knop knop-lijn" data-account-klaar>' + T.accountKlaarKnop + '</button></div>';
          plek.querySelector('[data-account-klaar]').addEventListener('click', function () {
            bewaarBlok('rhodos-profiel', { naam: naam, telefoon: telefoon });
            plek.innerHTML = '<p class="nootje" style="text-align:left">✓ ' + T.accountKlaarGelukt + '</p>';
          });
        }
      }

      stapAfronden.hidden = true;
      stapKlaar.hidden = false;
      mand = {}; bewaar();
      document.querySelectorAll('.bestel-regel').forEach(toonRegel);
      toonAccount();
    } catch (err) {
      fout('algemeen', T.verstuurFout(err.message));
      knop.disabled = false; knop.textContent = T.plaats;
    }
  });

  toonMand();
})();
