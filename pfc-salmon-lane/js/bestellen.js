/* Online ordering for a one-pager, powered by Mettafel.
   The menu on the page IS the order list: every dish has an add button.
   The basket and checkout live in a drawer that slides over the page, so
   ordering never leaves the site. Settings come from window.ZAAK (main.js),
   the dishes from window.KAART (kaart-data.js, generated).
   Fail-open: without JavaScript the full menu stays readable.
   Demo agreement: no online payment, pay on collection or delivery. */
(function () {
  'use strict';

  var Z = window.ZAAK || {};
  var KAART = window.KAART || [];
  var ITEMS = {};
  KAART.forEach(function (c) { c.items.forEach(function (i) { i.cat = c.id; ITEMS[i.id] = i; }); });
  var SLEUTEL = Z.sleutel || 'mettafel';
  var BEZORGEN = !!Z.bezorgen;
  var KOSTEN = Z.bezorgKosten || 0, MINIMUM = Z.bezorgMinimum || 0, GEBIED = Z.bezorgPostcodes || null;
  var MAX = 20;

  var T = {
    titel: 'Your order', sluiten: 'Close',
    leeg: 'Nothing here yet. Tap + next to any dish to add it.',
    subtotaal: 'Total', verder: 'Continue to your details', terug: 'Back to your order',
    wijze: 'How would you like it?', afhalen: 'Collection', bezorgen: 'Delivery',
    tijd: 'When?', naam: 'Your name', tel: 'Phone number', adres: 'Street and house number', postcode: 'Postcode',
    opmerking: 'Anything we should know?', optioneel: '(optional)', opmerkingPh: 'For example: extra spicy, no onions, allergies',
    plaats: 'Place order', versturen: 'Sending...',
    zsm: 'As soon as possible',
    vandaag: 'Today', morgen: 'Tomorrow',
    betaal: 'No online payment: you pay when you collect, or when your order arrives.',
    bezorgkosten: 'Delivery fee',
    eten: 'Food',
    gebiedFout: function (lijst) { return 'For now we deliver to ' + lijst + ' postcodes. Choose collection, or call us to check.'; },
    minimumFout: function (min, nog) { return 'Delivery starts from ' + min + ' of food. Add ' + nog + ' more, or choose collection.'; },
    naamFout: 'Fill in your name, so we know who the order is for.',
    telFout: 'Fill in a phone number we can reach you on.',
    adresFout: 'Fill in your street and house number.',
    postcodeFout: 'Fill in your postcode, for example E1 0HY.',
    mandLeegFout: 'Your order is still empty.',
    geenTijd: 'We are closed for the next few days, so online ordering is paused.',
    verstuurFout: function (m) { return 'Sending did not work (' + m + '). Please try again in a moment.'; },
    bekijk: function (n, tot) { return 'View order (' + n + ') · ' + tot; },
    toegevoegd: function (naam) { return naam + ' added'; },
    kies: 'Choose', kiesEen: 'Choose one', kiesMax: function (n) { return n === 1 ? 'Optional' : 'Optional, up to ' + n; },
    optieFout: 'Make a choice first.', toevoegen: 'Add to order',
    accountMaak: 'Save my details on this device',
    accountNoot: 'Only stored on this device. No password, no account to manage.',
    accountHoi: function (n) { return 'Welcome back, ' + n + '!'; },
    accountWis: 'forget me',
    opnieuw: function (n, tot) { return 'Order again: ' + n + (n === 1 ? ' item' : ' items') + ' · ' + tot; },
    accountKlaarKnop: 'Save my details for next time',
    accountKlaarGelukt: 'Saved. Next time your details and "order again" are ready.',
    klaar: 'Order received',
    nogmaals: 'Back to the menu',
    powered: 'Ordering system powered by',
  };

  var gbp = function (n) { return '£' + n.toFixed(2); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function bewaarBlok(k, v) { try { localStorage.setItem(SLEUTEL + '-' + k, JSON.stringify(v)); } catch (e) {} }
  function leesBlok(k) { try { return JSON.parse(localStorage.getItem(SLEUTEL + '-' + k) || 'null'); } catch (e) { return null; } }
  function wisBlok(k) { try { localStorage.removeItem(SLEUTEL + '-' + k); } catch (e) {} }
  var ikoon = function (n) { return '<svg class="ikoon" aria-hidden="true"><use href="assets/iconen.svg#i-' + n + '"/></svg>'; };

  /* ---------- the basket: lines with a key per dish + choices ---------- */
  var mand = [];
  function geldig(r) { return r && ITEMS[r.id] && r.aantal > 0; }
  (leesBlok('mand') || []).forEach(function (r) { if (geldig(r)) mand.push(r); });

  function regelPrijs(r) { return ITEMS[r.id].prijs + (r.meer || 0); }
  function totaal() { return mand.reduce(function (s, r) { return s + regelPrijs(r) * r.aantal; }, 0); }
  function stuks() { return mand.reduce(function (s, r) { return s + r.aantal; }, 0); }
  function perItem(id) { return mand.reduce(function (s, r) { return s + (r.id === id ? r.aantal : 0); }, 0); }
  function bewaar() { bewaarBlok('mand', mand); }

  function voegToe(id, keuzes, meer) {
    var sleutel = id + '|' + (keuzes || []).join('+');
    var r = mand.filter(function (x) { return x.sleutel === sleutel; })[0];
    if (r) r.aantal = Math.min(MAX, r.aantal + 1);
    else mand.push({ sleutel: sleutel, id: id, aantal: 1, keuzes: keuzes || [], meer: meer || 0 });
    bewaar(); teken(); meld(T.toegevoegd(ITEMS[id].naam));
  }

  /* ---------- the drawer, injected once ---------- */
  var lade = document.createElement('div');
  lade.className = 'lade-vlies';
  lade.hidden = true;
  lade.innerHTML =
    '<aside class="lade" id="bestel-lade" role="dialog" aria-modal="true" aria-labelledby="lade-titel" tabindex="-1">' +
    '  <header class="lade-kop"><div><span class="lade-eyebrow">' + esc(Z.naam || '') + '</span><h2 id="lade-titel">' + T.titel + '</h2></div>' +
    '    <button type="button" class="lade-sluit" data-sluit-lade aria-label="' + T.sluiten + '">' + ikoon('kruis') + '</button></header>' +
    '  <div class="lade-stap" data-stap="mand">' +
    '    <div class="lade-account" data-account-plek></div>' +
    '    <div class="lade-regels" data-mand-regels></div>' +
    '    <div class="lade-tip" data-tip hidden></div>' +
    '    <div class="lade-voet"><p class="lade-totaal"><span>' + T.subtotaal + '</span><strong data-totaal>£0.00</strong></p>' +
    '      <button type="button" class="knop knop-vol lade-knop" data-naar-gegevens disabled>' + T.verder + '</button></div>' +
    '  </div>' +
    '  <form class="lade-stap" data-stap="gegevens" novalidate hidden>' +
    (BEZORGEN ?
    '    <fieldset class="lade-wijze"><legend>' + T.wijze + '</legend>' +
    '      <label><input type="radio" name="wijze" value="afhalen" checked><span>' + ikoon('tas') + T.afhalen + '</span></label>' +
    '      <label><input type="radio" name="wijze" value="bezorgen"><span>' + ikoon('scooter') + T.bezorgen + '</span></label>' +
    '    </fieldset>' : '') +
    '    <p class="lade-noot" data-wijze-noot>' + esc(Z.afhaalNoot || '') + '</p>' +
    '    <label class="veld">' + T.tijd + '<select name="tijd" data-tijd></select></label>' +
    '    <label class="veld">' + T.naam + '<input name="naam" autocomplete="name" required><span class="fout" data-fout="naam" hidden></span></label>' +
    '    <label class="veld">' + T.tel + '<input name="telefoon" type="tel" autocomplete="tel" inputmode="tel" required><span class="fout" data-fout="telefoon" hidden></span></label>' +
    (BEZORGEN ?
    '    <div class="lade-bezorg" data-bezorg-velden hidden>' +
    '      <label class="veld">' + T.adres + '<input name="adres" autocomplete="street-address"><span class="fout" data-fout="adres" hidden></span></label>' +
    '      <label class="veld">' + T.postcode + '<input name="postcode" autocomplete="postal-code" autocapitalize="characters"><span class="fout" data-fout="postcode" hidden></span></label>' +
    '    </div>' : '') +
    '    <label class="veld">' + T.opmerking + ' <span class="lade-optioneel">' + T.optioneel + '</span><textarea name="opmerking" rows="2" placeholder="' + T.opmerkingPh + '"></textarea></label>' +
    '    <div class="lade-samenvatting" data-samenvatting></div>' +
    '    <p class="lade-noot">' + T.betaal + '</p>' +
    '    <p class="fout" data-fout="algemeen" hidden></p>' +
    '    <div class="lade-voet"><p class="lade-bezorgregel" data-bezorgregel hidden></p><p class="lade-totaal"><span>' + T.subtotaal + '</span><strong data-totaal-eind>£0.00</strong></p>' +
    '      <button type="submit" class="knop knop-vol lade-knop" data-verstuur>' + T.plaats + '</button>' +
    '      <button type="button" class="lade-terug" data-terug>' + T.terug + '</button></div>' +
    '  </form>' +
    '  <div class="lade-stap lade-klaar" data-stap="klaar" hidden>' +
    '    <span class="lade-vink">' + ikoon('vink') + '</span>' +
    '    <span class="lade-eyebrow">' + T.klaar + '</span>' +
    '    <div class="lade-ticket"><span class="lade-ticket-kop">Your ticket</span><p class="lade-nummer" data-bevestig-nummer></p><span class="lade-ticket-voet">' + esc(Z.naam || '') + '</span></div>' +
    '    <p data-bevestig-tekst></p>' +
    '    <div data-account-klaar></div>' +
    '    <button type="button" class="knop knop-lijn lade-knop" data-sluit-lade>' + T.nogmaals + '</button>' +
    '  </div>' +
    '  <p class="mettafel-noot">' + T.powered + ' <a href="https://mettafel.nl" rel="noopener" target="_blank">Mettafel</a></p>' +
    '</aside>';
  document.body.appendChild(lade);

  var paneel = lade.querySelector('.lade');
  var stappen = {};
  lade.querySelectorAll('[data-stap]').forEach(function (s) { stappen[s.getAttribute('data-stap')] = s; });
  var form = stappen.gegevens;
  var regelsEl = lade.querySelector('[data-mand-regels]');
  var naarGegevens = lade.querySelector('[data-naar-gegevens]');
  var tipEl = lade.querySelector('[data-tip]');
  var vorigeFocus = null;

  function toonStap(naam) {
    Object.keys(stappen).forEach(function (k) { stappen[k].hidden = k !== naam; });
    paneel.scrollTop = 0;
  }
  function openLade(stap) {
    vorigeFocus = document.activeElement;
    toonStap(stap || 'mand');
    lade.hidden = false;
    document.documentElement.classList.add('lade-open');
    requestAnimationFrame(function () { lade.classList.add('open'); });
    setTimeout(function () { paneel.focus(); }, 60);
  }
  function sluitLade() {
    lade.classList.remove('open');
    document.documentElement.classList.remove('lade-open');
    setTimeout(function () { lade.hidden = true; if (!stappen.klaar.hidden) toonStap('mand'); }, 280);
    if (vorigeFocus && vorigeFocus.focus) vorigeFocus.focus();
    teken();
  }
  lade.addEventListener('click', function (e) {
    if (e.target === lade || e.target.closest('[data-sluit-lade]')) sluitLade();
  });
  document.addEventListener('keydown', function (e) {
    if (lade.hidden) return;
    if (e.key === 'Escape') { if (optieVlies && !optieVlies.hidden) return; sluitLade(); }
    if (e.key === 'Tab') {
      var f = [].slice.call(paneel.querySelectorAll('button, input, select, textarea, a[href]')).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open-mand]');
    if (o) { e.preventDefault(); openLade('mand'); }
    var v = e.target.closest('[data-open-mand-als-vol]');
    if (v && mand.length) { e.preventDefault(); openLade('mand'); }
  });

  /* ---------- the floating order bar ---------- */
  var balk = document.createElement('button');
  balk.type = 'button';
  balk.className = 'mandbalk';
  balk.hidden = true;
  balk.setAttribute('data-open-mand', '');
  balk.innerHTML = '<span class="mandbalk-ikoon">' + ikoon('tas') + '<span class="mandbalk-n" data-balk-n>0</span></span><span data-balk-tekst></span>';
  document.body.appendChild(balk);

  var melder = document.createElement('p');
  melder.className = 'mand-melding';
  melder.setAttribute('role', 'status');
  melder.setAttribute('aria-live', 'polite');
  document.body.appendChild(melder);
  var meldTimer;
  function meld(t) {
    melder.textContent = t;
    melder.classList.add('aan');
    clearTimeout(meldTimer);
    meldTimer = setTimeout(function () { melder.classList.remove('aan'); }, 1800);
  }

  /* ---------- drawing ---------- */
  function regelHtml(r, i) {
    var it = ITEMS[r.id];
    var beeld = it.img ? '<img src="' + esc(it.img) + '" alt="" width="64" height="64" loading="lazy">' : '<span class="geen-foto">' + ikoon('camera') + '</span>';
    return '<div class="lade-regel">' + beeld +
      '<div class="lade-regel-tekst"><strong>' + esc(it.naam) + '</strong>' +
      (r.keuzes.length ? '<small>' + esc(r.keuzes.join(', ')) + '</small>' : '') +
      '<span class="lade-regel-prijs">' + gbp(regelPrijs(r) * r.aantal) + '</span></div>' +
      '<div class="teller"><button type="button" data-min="' + i + '" aria-label="One less ' + esc(it.naam) + '">' + ikoon('min') + '</button>' +
      '<span aria-live="polite">' + r.aantal + '</span>' +
      '<button type="button" data-plus="' + i + '" aria-label="One more ' + esc(it.naam) + '">' + ikoon('plus') + '</button></div></div>';
  }
  function teken() {
    var n = stuks(), t = gbp(totaal());
    regelsEl.innerHTML = mand.length ? mand.map(regelHtml).join('') : '<p class="lade-leeg">' + T.leeg + '</p>';
    lade.querySelectorAll('[data-totaal]').forEach(function (el) { el.textContent = t; });
    tekenEind();
    naarGegevens.disabled = !mand.length;
    var sam = lade.querySelector('[data-samenvatting]');
    sam.innerHTML = mand.map(function (r) {
      return '<div><span>' + r.aantal + '× ' + esc(ITEMS[r.id].naam) + (r.keuzes.length ? ' <small>(' + esc(r.keuzes.join(', ')) + ')</small>' : '') + '</span><span>' + gbp(regelPrijs(r) * r.aantal) + '</span></div>';
    }).join('');
    /* a tip, only if the site asks for one (e.g. a homemade sauce) */
    if (Z.tip && ITEMS[Z.tip.item]) {
      var heeft = mand.some(function (r) { return r.id === Z.tip.item; });
      tipEl.hidden = !mand.length || heeft;
      tipEl.innerHTML = '<span>' + esc(Z.tip.tekst) + '</span><button type="button" class="knop knop-lijn" data-voeg="' + esc(Z.tip.item) + '">' + ikoon('plus') + ' ' + gbp(ITEMS[Z.tip.item].prijs) + '</button>';
    }
    balk.hidden = !n || !lade.hidden;
    balk.querySelector('[data-balk-n]').textContent = n;
    balk.querySelector('[data-balk-tekst]').textContent = T.bekijk(n, t);
    document.querySelectorAll('[data-aantal-van]').forEach(function (el) {
      var k = perItem(el.getAttribute('data-aantal-van'));
      el.textContent = k;
      el.hidden = !k;
    });
    document.querySelectorAll('[data-mand-n]').forEach(function (el) { el.textContent = n; el.hidden = !n; });
    document.querySelectorAll('[data-mand-totaal]').forEach(function (el) { el.textContent = t; });
    document.querySelectorAll('[data-mand-n-tekst]').forEach(function (el) { el.textContent = n; });
    document.documentElement.classList.toggle('heeft-mand', !!n);
  }
  regelsEl.addEventListener('click', function (e) {
    var p = e.target.closest('[data-plus]'), m = e.target.closest('[data-min]');
    if (p) { var r = mand[+p.getAttribute('data-plus')]; r.aantal = Math.min(MAX, r.aantal + 1); }
    else if (m) { var q = mand[+m.getAttribute('data-min')]; q.aantal -= 1; if (q.aantal <= 0) mand.splice(+m.getAttribute('data-min'), 1); }
    else return;
    bewaar(); teken();
    var nieuw = regelsEl.querySelector('[data-' + (p ? 'plus' : 'min') + '="' + (p || m).getAttribute(p ? 'data-plus' : 'data-min') + '"]');
    if (nieuw) nieuw.focus(); else naarGegevens.focus();
  });

  /* ---------- choices (drink with a meal, lamb or chicken) ---------- */
  var optieVlies = null;
  function vraagKeuzes(id, knop) {
    var it = ITEMS[id];
    if (!optieVlies) {
      optieVlies = document.createElement('div');
      optieVlies.className = 'optie-vlies';
      optieVlies.hidden = true;
      optieVlies.innerHTML = '<div class="optie-paneel" role="dialog" aria-modal="true" aria-labelledby="optie-titel" tabindex="-1">' +
        '<header class="lade-kop"><div><span class="lade-eyebrow" data-optie-prijs></span><h2 id="optie-titel" data-optie-titel></h2></div>' +
        '<button type="button" class="lade-sluit" data-optie-sluit aria-label="' + T.sluiten + '">' + ikoon('kruis') + '</button></header>' +
        '<div data-optie-groepen></div><p class="fout" data-optie-fout hidden></p>' +
        '<button type="button" class="knop knop-vol lade-knop" data-optie-ok>' + T.toevoegen + '</button></div>';
      document.body.appendChild(optieVlies);
      optieVlies.addEventListener('click', function (e) {
        if (e.target === optieVlies || e.target.closest('[data-optie-sluit]')) sluitOptie();
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !optieVlies.hidden) sluitOptie(); });
    }
    var terugFocus = knop;
    function sluitOptie() { optieVlies.hidden = true; if (terugFocus) terugFocus.focus(); }
    optieVlies.querySelector('[data-optie-titel]').textContent = it.naam;
    optieVlies.querySelector('[data-optie-prijs]').textContent = gbp(it.prijs);
    optieVlies.querySelector('[data-optie-fout]').hidden = true;
    optieVlies.querySelector('[data-optie-groepen]').innerHTML = it.opties.map(function (g, gi) {
      var type = g.max === 1 ? 'radio' : 'checkbox';
      return '<fieldset class="optie-groep"><legend>' + esc(g.naam) + ' <small>' + (g.min >= 1 && g.max === 1 ? T.kiesEen : T.kiesMax(g.max)) + '</small></legend>' +
        g.keuzes.map(function (k, ki) {
          return '<label><input type="' + type + '" name="og' + gi + '" value="' + ki + '" data-groep="' + gi + '"><span>' + esc(k.naam) + '</span>' + (k.prijs ? '<em>+' + gbp(k.prijs) + '</em>' : '') + '</label>';
        }).join('') + '</fieldset>';
    }).join('');
    var ok = optieVlies.querySelector('[data-optie-ok]');
    var nieuwOk = ok.cloneNode(true);
    ok.parentNode.replaceChild(nieuwOk, ok);
    nieuwOk.addEventListener('click', function () {
      var keuzes = [], meer = 0, goed = true;
      it.opties.forEach(function (g, gi) {
        var gekozen = [].slice.call(optieVlies.querySelectorAll('input[data-groep="' + gi + '"]:checked'));
        if (gekozen.length < (g.min || 0) || gekozen.length > g.max) goed = false;
        gekozen.forEach(function (inp) { var k = g.keuzes[+inp.value]; keuzes.push(k.naam); meer += k.prijs || 0; });
      });
      if (!goed) { var f = optieVlies.querySelector('[data-optie-fout]'); f.textContent = T.optieFout; f.hidden = false; return; }
      optieVlies.hidden = true;
      voegToe(id, keuzes, meer);
      if (terugFocus) { terugFocus.focus(); pop(terugFocus); }
    });
    optieVlies.hidden = false;
    var eerste = optieVlies.querySelector('input');
    setTimeout(function () { (eerste || optieVlies.querySelector('.optie-paneel')).focus(); }, 30);
  }

  function pop(el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

  /* every [data-voeg] anywhere on the page adds that dish */
  document.addEventListener('click', function (e) {
    var k = e.target.closest('[data-voeg]');
    if (!k) return;
    var id = k.getAttribute('data-voeg');
    if (!ITEMS[id]) return;
    e.preventDefault();
    if (ITEMS[id].opties && ITEMS[id].opties.length) return vraagKeuzes(id, k);
    voegToe(id);
    pop(k);
  });

  /* ---------- search and category chips ---------- */
  var cats = [].slice.call(document.querySelectorAll('[data-kaart-cat]'));
  var zoek = document.querySelector('[data-kaart-zoek]');
  var zoekLeeg = document.querySelector('[data-zoek-leeg]');
  if (zoek) {
    zoek.addEventListener('input', function () {
      var q = zoek.value.trim().toLowerCase();
      var treffers = 0;
      cats.forEach(function (cat) {
        var inCat = 0;
        cat.querySelectorAll('[data-zoektekst]').forEach(function (r) {
          var raak = !q || r.getAttribute('data-zoektekst').indexOf(q) !== -1;
          r.hidden = !raak;
          if (raak) inCat++;
        });
        cat.hidden = !!q && !inCat;
        if (q && inCat && cat.tagName === 'DETAILS') cat.open = true;
        treffers += inCat;
      });
      if (!q) cats.forEach(function (d, i) { if (d.tagName === 'DETAILS') d.open = i === 0; });
      if (zoekLeeg) zoekLeeg.hidden = !q || treffers > 0;
    });
  }
  document.querySelectorAll('[data-chip]').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      var doel = document.getElementById(chip.getAttribute('data-chip'));
      if (!doel) return;
      e.preventDefault();
      if (zoek && zoek.value) { zoek.value = ''; zoek.dispatchEvent(new Event('input')); }
      if (doel.tagName === 'DETAILS') { cats.forEach(function (d) { if (d.tagName === 'DETAILS') d.open = d === doel; }); }
      document.querySelectorAll('[data-chip]').forEach(function (c) { c.setAttribute('aria-current', c === chip ? 'true' : 'false'); });
      doel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  });

  /* ---------- times inside the real opening hours ---------- */
  function slots() {
    var nu = new Date(), lijst = [];
    var minuten = (BEZORGEN && wijze() === 'bezorgen' && Z.bereidtijdBezorgen) ? Z.bereidtijdBezorgen : (Z.bereidtijd || 20);
    var bereid = minuten * 60000;
    for (var d = 0; d < 7 && lijst.length < 60; d++) {
      var dag = new Date(nu); dag.setDate(nu.getDate() + d); dag.setHours(0, 0, 0, 0);
      var u = Z.uren ? Z.uren(dag.getDay()) : null;
      if (!u) continue;
      var van = new Date(dag); van.setMinutes(u.van * 60);
      var tot = new Date(dag); tot.setMinutes(u.tot * 60 - 15);
      if (tot <= nu) continue;
      var start = new Date(Math.max(van.getTime() + bereid, nu.getTime() + bereid));
      start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
      if (d === 0 && nu >= van && nu < tot) lijst.push({ w: 'asap', t: T.zsm + ' (about ' + minuten + ' min)' });
      var label = d === 0 ? T.vandaag : d === 1 ? T.morgen : dag.toLocaleDateString('en-GB', { weekday: 'long' });
      for (var s = start; s <= tot; s = new Date(s.getTime() + 15 * 60000)) {
        var hh = String(s.getHours()).padStart(2, '0') + ':' + String(s.getMinutes()).padStart(2, '0');
        lijst.push({ w: s.toISOString(), t: label + ' ' + hh });
      }
      if (lijst.length > 8 && d >= 1) break;
    }
    return lijst;
  }
  var tijdSel = form.querySelector('[data-tijd]');
  function vulTijden() {
    var l = slots();
    tijdSel.innerHTML = l.length ? l.map(function (o) { return '<option value="' + esc(o.w) + '">' + esc(o.t) + '</option>'; }).join('') : '<option value="">' + T.geenTijd + '</option>';
  }

  /* ---------- collection or delivery ---------- */
  function wijze() { var el = form.querySelector('input[name="wijze"]:checked'); return el ? el.value : 'afhalen'; }
  form.addEventListener('change', function (e) {
    if (e.target.name !== 'wijze') return;
    var bez = wijze() === 'bezorgen';
    form.querySelector('[data-bezorg-velden]').hidden = !bez;
    form.querySelector('[data-wijze-noot]').textContent = bez ? (Z.bezorgNoot || '') : (Z.afhaalNoot || '');
    vulTijden(); tekenEind();
  });
  function isBezorgen() { return BEZORGEN && wijze() === 'bezorgen'; }
  function kosten() { return isBezorgen() ? KOSTEN : 0; }
  function tekenEind() {
    var el = lade.querySelector('[data-totaal-eind]');
    if (!el) return;
    el.textContent = gbp(totaal() + kosten());
    var r = lade.querySelector('[data-bezorgregel]');
    r.hidden = !isBezorgen() || !KOSTEN;
    r.innerHTML = '<span>' + T.eten + ' ' + gbp(totaal()) + '</span><span>' + T.bezorgkosten + ' ' + gbp(KOSTEN) + '</span>';
  }

  /* ---------- account on this device + order again ---------- */
  var accountPlek = lade.querySelector('[data-account-plek]');
  function profiel() { return leesBlok('profiel'); }
  function toonAccount() {
    var p = profiel(), l = leesBlok('laatste');
    if (!p) { accountPlek.innerHTML = ''; return; }
    var knop = '';
    if (l && l.length) {
      var ok = l.filter(geldig);
      if (ok.length) {
        var n = ok.reduce(function (s, r) { return s + r.aantal; }, 0);
        var t = ok.reduce(function (s, r) { return s + regelPrijs(r) * r.aantal; }, 0);
        knop = '<button type="button" class="knop knop-lijn lade-knop" data-opnieuw>' + ikoon('herhaal') + ' ' + T.opnieuw(n, gbp(t)) + '</button>';
      }
    }
    accountPlek.innerHTML = '<p><strong>' + T.accountHoi(esc(p.naam)) + '</strong> <button type="button" class="lade-link" data-account-wis>' + T.accountWis + '</button></p>' + knop;
  }
  accountPlek.addEventListener('click', function (e) {
    if (e.target.closest('[data-account-wis]')) { wisBlok('profiel'); wisBlok('laatste'); toonAccount(); }
    if (e.target.closest('[data-opnieuw]')) {
      mand = (leesBlok('laatste') || []).filter(geldig).map(function (r) { return { sleutel: r.sleutel, id: r.id, aantal: Math.min(MAX, r.aantal), keuzes: r.keuzes || [], meer: r.meer || 0 }; });
      bewaar(); teken();
    }
  });
  function vulProfielIn() {
    var p = profiel();
    if (!p) return;
    ['naam', 'telefoon', 'adres', 'postcode'].forEach(function (k) { if (p[k] && form[k] && !form[k].value) form[k].value = p[k]; });
  }

  /* ---------- steps ---------- */
  naarGegevens.addEventListener('click', function () { vulTijden(); vulProfielIn(); teken(); toonStap('gegevens'); form.naam.focus(); });
  form.querySelector('[data-terug]').addEventListener('click', function () { toonStap('mand'); });

  function fout(veld, tekst) {
    var el = form.querySelector('[data-fout="' + veld + '"]');
    if (!el) return;
    el.textContent = tekst || ''; el.hidden = !tekst;
    var inv = form.querySelector('[name="' + veld + '"]');
    if (inv) { inv.closest('.veld').classList.toggle('heeft-fout', !!tekst); inv.setAttribute('aria-invalid', tekst ? 'true' : 'false'); }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['naam', 'telefoon', 'adres', 'postcode', 'algemeen'].forEach(function (v) { fout(v, ''); });
    var bez = BEZORGEN && wijze() === 'bezorgen';
    var naam = form.naam.value.trim(), tel = form.telefoon.value.trim();
    var adres = bez ? form.adres.value.trim() : '', pc = bez ? form.postcode.value.trim().toUpperCase() : '';
    var eerste = null;
    function mis(v, t) { fout(v, t); if (!eerste) eerste = form.querySelector('[name="' + v + '"]'); }
    if (!naam) mis('naam', T.naamFout);
    if (!/^[+\d][\d\s\-()]{8,}$/.test(tel)) mis('telefoon', T.telFout);
    if (bez && !adres) mis('adres', T.adresFout);
    if (bez && !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(pc)) mis('postcode', T.postcodeFout);
    else if (bez && GEBIED && GEBIED.indexOf(pc.replace(/\s+/g, '').slice(0, -3)) === -1) mis('postcode', T.gebiedFout(GEBIED.filter(function (g) { return g !== 'E1W'; }).join(', ')));
    if (bez && MINIMUM && totaal() < MINIMUM) { fout('algemeen', T.minimumFout(gbp(MINIMUM), gbp(MINIMUM - totaal()))); if (!eerste) { form.querySelector('[data-fout="algemeen"]').scrollIntoView({ block: 'center' }); return; } }
    if (!mand.length) fout('algemeen', T.mandLeegFout);
    if (!tijdSel.value) fout('algemeen', T.geenTijd);
    if (eerste) { eerste.focus(); return; }
    if (!mand.length || !tijdSel.value) return;

    var knop = form.querySelector('[data-verstuur]');
    knop.disabled = true; knop.textContent = T.versturen;
    var tijdTekst = tijdSel.selectedOptions[0].textContent;
    try {
      var body = {
        naam: naam, telefoon: tel, wijze: bez ? 'bezorgen' : 'afhalen', tijd: tijdTekst,
        opmerking: form.opmerking.value.trim(),
        regels: mand.map(function (r) { return { id: r.id, naam: ITEMS[r.id].naam + (r.keuzes.length ? ' (' + r.keuzes.join(', ') + ')' : ''), aantal: r.aantal, prijs: regelPrijs(r) }; }),
        totaal: Math.round((totaal() + (bez ? KOSTEN : 0)) * 100) / 100,
      };
      if (bez && KOSTEN) body.bezorgkosten = KOSTEN;
      if (bez) { body.adres = adres; body.postcode = pc; }
      var res = await fetch('api/bestelling', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      var j = await res.json();
      if (!j.ok) throw new Error(j.fout || res.status);

      var n = stuks(), t = gbp(totaal() + (bez ? KOSTEN : 0));
      lade.querySelector('[data-bevestig-nummer]').textContent = 'No. ' + j.id;
      lade.querySelector('[data-bevestig-tekst]').textContent = (bez ? Z.bevestigBezorgen : Z.bevestigAfhalen)(naam.split(' ')[0], n, t, tijdTekst.toLowerCase());
      bewaarBlok('laatste', mand);
      var klaarPlek = lade.querySelector('[data-account-klaar]');
      if (profiel()) {
        bewaarBlok('profiel', { naam: naam, telefoon: tel, adres: adres, postcode: pc });
        klaarPlek.innerHTML = '';
      } else {
        klaarPlek.innerHTML = '<button type="button" class="knop knop-lijn lade-knop" data-bewaar-mij>' + ikoon('hart') + ' ' + T.accountKlaarKnop + '</button><p class="lade-noot">' + T.accountNoot + '</p>';
        klaarPlek.querySelector('[data-bewaar-mij]').addEventListener('click', function () {
          bewaarBlok('profiel', { naam: naam, telefoon: tel, adres: adres, postcode: pc });
          klaarPlek.innerHTML = '<p class="lade-noot">' + T.accountKlaarGelukt + '</p>';
          toonAccount();
        });
      }
      mand = []; bewaar(); teken(); toonAccount();
      toonStap('klaar');
      form.reset();
      if (BEZORGEN) { form.querySelector('[data-bezorg-velden]').hidden = true; form.querySelector('[data-wijze-noot]').textContent = Z.afhaalNoot || ''; }
    } catch (err) {
      fout('algemeen', T.verstuurFout(err.message));
    }
    knop.disabled = false; knop.textContent = T.plaats;
  });

  toonAccount();
  teken();
  window.MettafelBestellen = { open: openLade };
})();
