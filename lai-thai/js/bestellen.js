/* Lai Thai: het online bestelsysteem, powered by Mettafel.
   Afhalen of bezorgen (vanaf 35 euro + 4 euro bezorgkosten), zoeken en
   categoriechips, de bakje-samensteller (twee- en drie-vaks-menu's),
   en een licht "account op dit toestel" (localStorage, geen wachtwoord)
   met bestel-opnieuw.
   Fail-open: zonder JavaScript blijft de volledige kaart leesbaar en staat
   er een telefoonnummer; de plusknoppen doen dan niets.
   Demo-afspraak: geen online betaling, betalen bij ontvangst. */
(function () {
  'use strict';

  var T = {
    leeg: 'Nog leeg. Kies iets lekkers van de kaart hiernaast.',
    naamFout: 'Vul je naam in, dan weten we voor wie de bestelling is.',
    telFout: 'Vul een telefoonnummer in waarop we je kunnen bereiken.',
    adresFout: 'Vul je straat en huisnummer in.',
    postcodeFout: 'Vul je postcode en plaats in.',
    mandLeegFout: 'Je mandje is leeg.',
    verstuurFout: function (m) { return 'Versturen lukte niet (' + m + '). Probeer het opnieuw, of bel ons op 073 612 2178.'; },
    versturen: 'Versturen...', plaats: 'Plaats bestelling',
    zsmAfhaal: 'Zo snel mogelijk (± 20 minuten)', zsmBezorg: 'Zo snel mogelijk (± 45 minuten)',
    vandaag: 'Vandaag', tijdAfhaal: 'Afhaaltijd', tijdBezorg: 'Bezorgtijd',
    bezorgkosten: 'Bezorgkosten',
    drempel: function (nog) { return 'Bezorgen kan vanaf € 35,00 aan gerechten. Nog ' + nog + ' te gaan, of kies afhalen.'; },
    drempelFout: function (nog) { return 'Voor bezorgen mist er nog ' + nog + ' aan gerechten. Vul je bestelling aan, of kies afhalen.'; },
    bevestigBezorg: function (naam, n, tot, tijd, adres) { return 'Khop khun, ' + naam + '! We gaan vers voor je koken. Je bestelling (' + n + ' gerechten, ' + tot + ') komt eraan: ' + tijd + ', op ' + adres + '. Betalen doe je aan de deur, met pin of contant.'; },
    bevestigAfhaal: function (naam, n, tot, tijd) { return 'Khop khun, ' + naam + '! We gaan vers voor je koken. Je bestelling (' + n + ' gerechten, ' + tot + ') staat klaar: ' + tijd + ', Muntelstraat 12 (tegenover de watertoren). Betalen doe je bij het afhalen, met pin of contant.'; },
    bekijk: function (n, tot) { return 'Bekijk je bestelling (' + n + ') · ' + tot; },
    accountMaak: 'Maak een account',
    accountNoot: 'Alleen opgeslagen op dit toestel, geen wachtwoord nodig.',
    accountNaam: 'Je naam', accountTel: 'Telefoonnummer', accountOpslaan: 'Opslaan',
    accountHoi: function (naam) { return 'Sawasdee, ' + naam + '!'; },
    accountWissen: 'gegevens wissen',
    opnieuw: function (n, tot) { return 'Bestel opnieuw: ' + n + ' gerechten · ' + tot; },
    accountKlaarNoot: 'Bewaar je gegevens en deze bestelling op dit toestel, dan is het de volgende keer één tik.',
    accountKlaarKnop: 'Maak een account voor de volgende keer',
    accountKlaarGelukt: 'Opgeslagen! De volgende keer staan je gegevens en "bestel opnieuw" voor je klaar.',
    bakjeTeller: function (n) { return n === 0 ? '(je keuze is compleet)' : '(nog ' + n + ' te kiezen)'; },
    bakjeFout: function (n) { return n === 1 ? 'Kies nog een hoofdgerecht voor je bakje.' : 'Kies nog ' + n + ' hoofdgerechten voor je bakje.'; },
    bakjeTeveel: 'Voor dit bakje kies je maximaal ',
    bakjeInMand: 'Je bakje staat in je bestelling!',
  };

  var BEZORG_MIN = 35;
  var BEZORG_KOSTEN = 4;

  var KAART = window.KAART || [];
  var BAKJE = window.BAKJE || null;
  var ITEMS = {};
  KAART.forEach(function (c) { c.items.forEach(function (i) { ITEMS[i.id] = i; }); });

  var euro = function (n) { return '€ ' + n.toFixed(2).replace('.', ','); };
  function bewaarBlok(sleutel, waarde) {
    try { localStorage.setItem(sleutel, JSON.stringify(waarde)); } catch (e) { /* geen opslag, geen ramp */ }
  }
  function leesBlok(sleutel) {
    try { return JSON.parse(localStorage.getItem(sleutel) || 'null'); } catch (e) { return null; }
  }

  var mand = {};
  var bewaard = leesBlok('laithai-mand') || {};
  Object.keys(bewaard).forEach(function (id) {
    if (ITEMS[id] && bewaard[id] > 0) mand[id] = Math.min(20, bewaard[id] | 0);
  });
  /* samengestelde bakjes staan los van de kaart-items */
  var bakjes = (leesBlok('laithai-bakjes') || []).filter(function (b) {
    return b && b.naam && typeof b.prijs === 'number';
  }).slice(0, 10);

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

  var wijze = 'afhalen';

  function subtotaal() {
    var kaartSom = Object.keys(mand).reduce(function (som, id) { return som + ITEMS[id].prijs * mand[id]; }, 0);
    var bakjeSom = bakjes.reduce(function (som, b) { return som + b.prijs; }, 0);
    return kaartSom + bakjeSom;
  }
  function totaal() {
    return subtotaal() + (wijze === 'bezorgen' ? BEZORG_KOSTEN : 0);
  }
  function aantalStuks() {
    return Object.keys(mand).reduce(function (som, id) { return som + mand[id]; }, 0) + bakjes.length;
  }
  function bewaar() {
    bewaarBlok('laithai-mand', mand);
    bewaarBlok('laithai-bakjes', bakjes);
  }

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
    var leeg = !ids.length && !bakjes.length;
    if (leeg) {
      regelsEl.innerHTML = '<p class="mandje-leeg">' + T.leeg + '</p>';
    } else {
      var html = ids.map(function (id) {
        var i = ITEMS[id];
        return '<div class="mandje-regel"><span class="n">' + mand[id] + '× ' + i.naam + '</span><span>' + euro(i.prijs * mand[id]) + '</span></div>';
      });
      bakjes.forEach(function (b, i) {
        html.push('<div class="mandje-regel"><span class="n">' + b.naam +
          ' <button type="button" class="account-wis" data-bakje-weg="' + i + '" aria-label="Dit bakje verwijderen">weghalen</button></span><span>' + euro(b.prijs) + '</span></div>');
      });
      regelsEl.innerHTML = html.join('');
    }
    var t = euro(subtotaal());
    document.querySelectorAll('#mandje-stap-kiezen [data-totaal]').forEach(function (el) { el.textContent = t; });
    totaalWrap.hidden = leeg;
    naarAfronden.disabled = leeg;
    if (zwever) {
      zwever.hidden = leeg || !stapAfronden.hidden || !stapKlaar.hidden;
      zweverTekst.textContent = T.bekijk(aantalStuks(), t);
    }
  }

  regelsEl.addEventListener('click', function (e) {
    var weg = e.target.closest('[data-bakje-weg]');
    if (!weg) return;
    bakjes.splice(parseInt(weg.getAttribute('data-bakje-weg'), 10), 1);
    toonMand(); bewaar();
  });

  document.querySelectorAll('.bestel-regel').forEach(function (regel) {
    var id = regel.getAttribute('data-item');
    if (!ITEMS[id]) return;
    regel.querySelector('[data-plus]').addEventListener('click', function () {
      mand[id] = Math.min(20, (mand[id] || 0) + 1);
      toonRegel(regel); toonMand(); bewaar();
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

  /* ---------- de bakje-samensteller ---------- */
  (function () {
    var paneel = document.getElementById('bakje');
    if (!paneel || !BAKJE) return;
    var soort = 2;
    var soortKnoppen = paneel.querySelectorAll('[data-soort]');
    var teller = paneel.querySelector('[data-bakje-teller]');
    var meervoud = paneel.querySelector('[data-bakje-meervoud]');
    var totaalEl = paneel.querySelector('[data-bakje-totaal]');
    var foutEl = paneel.querySelector('[data-bakje-fout]');
    var gerechtInfo = {};
    BAKJE.gerechten.forEach(function (g) { gerechtInfo[g.key] = g; });

    function gekozen() {
      return [].slice.call(paneel.querySelectorAll('input[name="bakje-gerecht"]:checked')).map(function (i) { return i.value; });
    }
    function rijst() {
      var r = paneel.querySelector('input[name="bakje-rijst"]:checked');
      return r && r.value === 'gebakken' ? BAKJE.rijst[1] : BAKJE.rijst[0];
    }
    function prijs() {
      var p = BAKJE.prijs + rijst().meer;
      gekozen().forEach(function (key) { p += (gerechtInfo[key] || {}).meer || 0; });
      return p;
    }
    function ververs() {
      var max = soort - 1;
      var keuzes = gekozen();
      var nog = Math.max(0, max - keuzes.length);
      teller.textContent = T.bakjeTeller(nog);
      if (meervoud) meervoud.hidden = max === 1;
      totaalEl.textContent = euro(prijs());
      foutEl.hidden = true;
    }
    paneel.addEventListener('change', function (e) {
      if (e.target.name === 'bakje-gerecht') {
        var max = soort - 1;
        var keuzes = gekozen();
        if (keuzes.length > max) {
          e.target.checked = false;
          foutEl.textContent = T.bakjeTeveel + max + (max === 1 ? ' gerecht.' : ' gerechten.');
          foutEl.hidden = false;
          return;
        }
      }
      ververs();
    });
    soortKnoppen.forEach(function (k) {
      k.addEventListener('click', function () {
        soort = parseInt(k.getAttribute('data-soort'), 10);
        soortKnoppen.forEach(function (s) { s.setAttribute('aria-pressed', String(s === k)); });
        var max = soort - 1;
        var keuzes = paneel.querySelectorAll('input[name="bakje-gerecht"]:checked');
        for (var i = keuzes.length - 1; i >= max; i--) keuzes[i].checked = false;
        ververs();
      });
    });
    paneel.querySelector('[data-bakje-toevoegen]').addEventListener('click', function () {
      var max = soort - 1;
      var keuzes = gekozen();
      if (keuzes.length < max) {
        foutEl.textContent = T.bakjeFout(max - keuzes.length);
        foutEl.hidden = false;
        return;
      }
      var namen = keuzes.map(function (key) { return (gerechtInfo[key] || {}).naam || key; });
      bakjes.push({
        naam: (soort === 2 ? 'Twee-vaks-bakje' : 'Drie-vaks-bakje') + ': ' + rijst().naam.toLowerCase() + ' + ' + namen.join(' + '),
        prijs: Math.round(prijs() * 100) / 100,
      });
      toonMand(); bewaar();
      foutEl.textContent = '✓ ' + T.bakjeInMand;
      foutEl.style.color = 'var(--groen)';
      foutEl.hidden = false;
      setTimeout(function () { foutEl.hidden = true; foutEl.style.color = ''; }, 3500);
      if (zwever && !zwever.hidden) { zwever.classList.remove('puls'); void zwever.offsetWidth; zwever.classList.add('puls'); }
    });
    ververs();
  })();

  /* ---------- zoeken en categoriechips ---------- */
  var zoek = document.querySelector('[data-bestel-zoek]');
  var zoekLeeg = document.querySelector('[data-zoek-leeg]');
  var bakjePaneel = document.getElementById('bakje');
  if (zoek) {
    zoek.addEventListener('input', function () {
      var q = zoek.value.trim().toLowerCase();
      var treffers = 0;
      if (bakjePaneel) bakjePaneel.hidden = !!q;
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
      if (chip.dataset.chip === 'bakje') {
        if (bakjePaneel) bakjePaneel.scrollIntoView({ block: 'start', behavior: 'smooth' });
        return;
      }
      var doel = document.getElementById('bestel-' + chip.dataset.chip);
      if (!doel) return;
      cats.forEach(function (d) { d.open = d === doel; });
      doel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  });

  /* ---------- tijden binnen de echte openingstijden ---------- */
  /* di t/m zo, keuken 16.00-20.00; laatste moment 19.45, kwartierstappen */
  function open(dag) { return dag !== 1; }
  function tijden() {
    var nu = new Date();
    var lijst = [];
    var dag = new Date(nu);
    var voorbereiding = wijze === 'bezorgen' ? 45 : 20;
    for (var d = 0; d < 8 && lijst.length === 0; d++) {
      if (open(dag.getDay())) {
        var van = new Date(dag); van.setHours(16, 0, 0, 0);
        var tot = new Date(dag); tot.setHours(19, 45, 0, 0);
        /* de keuken heeft ook vanaf openingstijd even nodig */
        var vroegst = new Date(Math.max(van.getTime() + voorbereiding * 60000, nu.getTime() + voorbereiding * 60000));
        vroegst.setMinutes(Math.ceil(vroegst.getMinutes() / 15) * 15, 0, 0);
        if (vroegst <= tot) {
          var vandaag = dag.toDateString() === nu.toDateString();
          if (vandaag && nu.getHours() >= 16) {
            lijst.push({ w: 'zsm', t: wijze === 'bezorgen' ? T.zsmBezorg : T.zsmAfhaal });
          }
          for (var s = new Date(vroegst); s <= tot; s = new Date(s.getTime() + 15 * 60000)) {
            var hh = String(s.getHours()).padStart(2, '0') + ':' + String(s.getMinutes()).padStart(2, '0');
            var label = vandaag ? T.vandaag + ' ' + hh : s.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }) + ' ' + hh;
            lijst.push({ w: (vandaag ? 'vandaag' : s.toLocaleDateString('nl-NL')) + ' ' + hh, t: label });
          }
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

  /* ---------- afhalen of bezorgen ---------- */
  var wijzeWrap = document.getElementById('wijze');
  var bezorgVelden = document.getElementById('bezorg-velden');
  var tijdLabel = document.querySelector('[data-tijd-label]');
  var drempelEl = document.querySelector('[data-bezorg-drempel]');

  function toonAfrondenTotaal() {
    var html = euro(totaal());
    document.querySelectorAll('#mandje-stap-afronden [data-totaal]').forEach(function (el) { el.textContent = html; });
    var wrap = document.querySelector('[data-afronden-totaal]');
    if (wrap) {
      var sub = wrap.querySelector('.subregel');
      if (wijze === 'bezorgen') {
        if (!sub) {
          sub = document.createElement('span');
          sub.className = 'subregel';
          wrap.insertBefore(sub, wrap.lastElementChild);
        }
        sub.textContent = 'waarvan ' + T.bezorgkosten.toLowerCase() + ' ' + euro(BEZORG_KOSTEN);
      } else if (sub) {
        sub.remove();
      }
    }
    if (drempelEl) {
      var tekort = BEZORG_MIN - subtotaal();
      var toon = wijze === 'bezorgen' && tekort > 0;
      drempelEl.hidden = !toon;
      if (toon) drempelEl.textContent = T.drempel(euro(tekort));
    }
  }

  if (wijzeWrap) {
    wijzeWrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wijze]');
      if (!b) return;
      wijze = b.dataset.wijze;
      wijzeWrap.querySelectorAll('.slot').forEach(function (k) { k.setAttribute('aria-pressed', String(k === b)); });
      bezorgVelden.hidden = wijze !== 'bezorgen';
      if (tijdLabel) tijdLabel.textContent = wijze === 'bezorgen' ? T.tijdBezorg : T.tijdAfhaal;
      vulTijden();
      toonAfrondenTotaal();
    });
  }

  /* ---------- account op dit toestel + bestel opnieuw ---------- */
  var accountPlek = document.querySelector('[data-account-plek]');
  function profiel() { return leesBlok('laithai-profiel'); }
  function laatste() { return leesBlok('laithai-laatste'); }

  function vulProfielIn() {
    var p = profiel();
    if (!p) return;
    if (p.naam && !stapAfronden.naam.value) stapAfronden.naam.value = p.naam;
    if (p.telefoon && !stapAfronden.telefoon.value) stapAfronden.telefoon.value = p.telefoon;
    if (p.adres && stapAfronden.adres && !stapAfronden.adres.value) stapAfronden.adres.value = p.adres;
    if (p.postcode && stapAfronden.postcode && !stapAfronden.postcode.value) stapAfronden.postcode.value = p.postcode;
  }

  function toonAccount() {
    if (!accountPlek) return;
    var p = profiel();
    var l = laatste();
    if (p) {
      var knop = '';
      if (l && ((l.regels && Object.keys(l.regels).some(function (id) { return ITEMS[id]; })) || (l.bakjes && l.bakjes.length))) {
        var geldig = {};
        Object.keys(l.regels || {}).forEach(function (id) { if (ITEMS[id]) geldig[id] = l.regels[id]; });
        var lb = l.bakjes || [];
        var n = Object.keys(geldig).reduce(function (s, id) { return s + geldig[id]; }, 0) + lb.length;
        var tot = Object.keys(geldig).reduce(function (s, id) { return s + geldig[id] * ITEMS[id].prijs; }, 0) +
          lb.reduce(function (s, b) { return s + b.prijs; }, 0);
        if (n > 0) knop = '<button type="button" class="knop knop-lijn account-opnieuw" data-opnieuw>' + T.opnieuw(n, euro(tot)) + '</button>';
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
        try { localStorage.removeItem('laithai-profiel'); localStorage.removeItem('laithai-laatste'); } catch (err) {}
        toonAccount();
      }
      var op = e.target.closest('[data-opnieuw]');
      if (op) {
        var l = laatste();
        if (!l) return;
        mand = {};
        Object.keys(l.regels || {}).forEach(function (id) { if (ITEMS[id]) mand[id] = Math.min(20, l.regels[id] | 0); });
        bakjes = (l.bakjes || []).slice(0, 10);
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
      bewaarBlok('laithai-profiel', { naam: f.naam.value.trim(), telefoon: f.telefoon.value.trim() });
      toonAccount();
    });
  }
  toonAccount();

  /* ---------- stappen ---------- */
  naarAfronden.addEventListener('click', function () {
    vulTijden();
    vulProfielIn();
    toonAfrondenTotaal();
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
    ['tijd', 'adres', 'postcode', 'naam', 'telefoon', 'algemeen'].forEach(function (v) { fout(v, ''); });

    var naam = stapAfronden.naam.value.trim();
    var telefoon = stapAfronden.telefoon.value.trim();
    var adres = stapAfronden.adres ? stapAfronden.adres.value.trim() : '';
    var postcode = stapAfronden.postcode ? stapAfronden.postcode.value.trim() : '';
    var ok = true;
    if (wijze === 'bezorgen') {
      if (!adres) { fout('adres', T.adresFout); ok = false; }
      if (!postcode) { fout('postcode', T.postcodeFout); ok = false; }
      var tekort = BEZORG_MIN - subtotaal();
      if (tekort > 0) { fout('algemeen', T.drempelFout(euro(tekort))); ok = false; }
    }
    if (!naam) { fout('naam', T.naamFout); ok = false; }
    if (!/^[\d+][\d\s\-()]{7,}$/.test(telefoon)) { fout('telefoon', T.telFout); ok = false; }
    if (!Object.keys(mand).length && !bakjes.length) { fout('algemeen', T.mandLeegFout); ok = false; }
    if (!ok) return;

    var knop = stapAfronden.querySelector('[data-verstuur]');
    knop.disabled = true; knop.textContent = T.versturen;

    var regels = Object.keys(mand).map(function (id) {
      return { id: id, naam: ITEMS[id].naam, aantal: mand[id], prijs: ITEMS[id].prijs };
    });
    bakjes.forEach(function (b) {
      regels.push({ id: 'bakje', naam: b.naam, aantal: 1, prijs: b.prijs });
    });
    if (wijze === 'bezorgen') {
      regels.push({ id: 'bezorgkosten', naam: T.bezorgkosten, aantal: 1, prijs: BEZORG_KOSTEN });
    }
    try {
      var r = await fetch('/api/bestelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: naam,
          telefoon: telefoon,
          wijze: wijze,
          tijd: select.value,
          adres: wijze === 'bezorgen' ? adres : '',
          postcode: wijze === 'bezorgen' ? postcode : '',
          opmerking: stapAfronden.opmerking.value.trim(),
          regels: regels,
          totaal: Math.round(totaal() * 100) / 100,
        }),
      });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');

      var tijdTekst = select.selectedOptions[0].textContent.toLowerCase();
      var n = aantalStuks(), tot = euro(totaal());
      document.querySelector('[data-bevestig-nummer]').textContent = 'Bestelling ' + j.id;
      document.querySelector('[data-bevestig-tekst]').textContent = wijze === 'bezorgen'
        ? T.bevestigBezorg(naam, n, tot, tijdTekst, adres)
        : T.bevestigAfhaal(naam, n, tot, tijdTekst);

      /* laatste bestelling bewaren; profiel bijwerken of aanbieden */
      bewaarBlok('laithai-laatste', { regels: mand, bakjes: bakjes, wanneer: new Date().toISOString() });
      if (profiel()) {
        bewaarBlok('laithai-profiel', { naam: naam, telefoon: telefoon, adres: adres, postcode: postcode });
      } else {
        var plek = document.querySelector('[data-account-plek-klaar]');
        if (plek) {
          plek.innerHTML = '<div class="account-blok"><p class="nootje" style="text-align:left">' + T.accountKlaarNoot + '</p>' +
            '<button type="button" class="knop knop-lijn" data-account-klaar>' + T.accountKlaarKnop + '</button></div>';
          plek.querySelector('[data-account-klaar]').addEventListener('click', function () {
            bewaarBlok('laithai-profiel', { naam: naam, telefoon: telefoon, adres: adres, postcode: postcode });
            plek.innerHTML = '<p class="nootje" style="text-align:left">✓ ' + T.accountKlaarGelukt + '</p>';
          });
        }
      }

      stapAfronden.hidden = true;
      stapKlaar.hidden = false;
      mand = {}; bakjes = []; bewaar();
      document.querySelectorAll('.bestel-regel').forEach(toonRegel);
      toonAccount();
    } catch (err) {
      fout('algemeen', T.verstuurFout(err.message));
      knop.disabled = false; knop.textContent = T.plaats;
    }
  });

  toonMand();
})();
