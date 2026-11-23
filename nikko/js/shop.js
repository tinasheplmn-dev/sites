/* Nikko Sports: winkelwagen, productpagina, shopfilters en afrekenen.
   Alles vanilla, alles fail-open: zonder JavaScript blijven de pagina's leesbaar,
   de mandje-knoppen tonen dan geen aantal en afrekenen vraagt om te bellen. */
(function () {
  'use strict';

  var CAT = window.NIKKO_CATALOGUS || [];
  var CFG = window.NIKKO_CONFIG || { gratisVanaf: 100, verzendkosten: null };
  var bySlug = {};
  CAT.forEach(function (p) { bySlug[p.s] = p; });

  var euro = function (n) { return '€ ' + n.toFixed(2).replace('.', ','); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ikoon = function (id) { return '<svg class="ikoon" aria-hidden="true"><use href="assets/iconen.svg#' + id + '"/></svg>'; };

  /* ---------- melding ---------- */
  var meldEl = document.querySelector('[data-melding]');
  var meldTimer;
  function meld(tekst) {
    if (!meldEl) return;
    meldEl.textContent = tekst;
    meldEl.classList.add('aan');
    clearTimeout(meldTimer);
    meldTimer = setTimeout(function () { meldEl.classList.remove('aan'); }, 2800);
  }

  /* ---------- winkelwagen-opslag ---------- */
  var SLEUTEL = 'nikko_mand';
  function leesMand() {
    try { var m = JSON.parse(localStorage.getItem(SLEUTEL) || '[]'); return Array.isArray(m) ? m.filter(function (r) { return bySlug[r.slug]; }) : []; } catch (e) { return []; }
  }
  function bewaarMand(m) { try { localStorage.setItem(SLEUTEL, JSON.stringify(m)); } catch (e) {} }
  function aantalInMand(m) { return m.reduce(function (n, r) { return n + r.aantal; }, 0); }
  function subtotaal(m) { return m.reduce(function (n, r) { return n + bySlug[r.slug].pr * r.aantal; }, 0); }
  function voegToe(slug, maat, aantal) {
    var m = leesMand();
    var r = m.find(function (x) { return x.slug === slug && x.maat === maat; });
    if (r) r.aantal = Math.min(20, r.aantal + aantal); else m.push({ slug: slug, maat: maat, aantal: aantal });
    bewaarMand(m); teken(); return m;
  }
  function zetAantal(slug, maat, aantal) {
    var m = leesMand().map(function (r) { if (r.slug === slug && r.maat === maat) r.aantal = aantal; return r; }).filter(function (r) { return r.aantal > 0; });
    bewaarMand(m); teken();
  }

  /* ---------- tekenen: badge, lade, mandpagina ---------- */
  function regelHtml(r, compact) {
    var p = bySlug[r.slug];
    return '<div class="regel" data-regel data-slug="' + p.s + '" data-maat="' + esc(r.maat) + '">' +
      '<a href="p-' + p.s + '.html"><img src="' + p.a + '" alt="" width="76" height="76" loading="lazy"></a>' +
      '<div><a class="naam" href="p-' + p.s + '.html">' + esc(p.n) + '</a>' + (r.maat ? '<div class="sub">Maat ' + esc(r.maat) + '</div>' : '') +
      (compact ? '<div class="sub">' + r.aantal + ' × ' + euro(p.pr) + '</div>' : '<div class="prijs"><span class="nu">' + euro(p.pr * r.aantal) + '</span>' + (p.o ? '<span class="oud">' + euro(p.o * r.aantal) + '</span>' : '') + '</div>') + '</div>' +
      (compact ? '<b style="font-family:var(--display);font-size:1.1rem">' + euro(p.pr * r.aantal) + '</b>' :
        '<div class="acties"><div class="aantal"><button type="button" data-min aria-label="Minder">' + ikoon('i-min') + '</button><input type="number" value="' + r.aantal + '" min="0" max="20" data-aantal aria-label="Aantal"><button type="button" data-plus aria-label="Meer">' + ikoon('i-plus') + '</button></div><button type="button" class="verwijder" data-verwijder aria-label="Verwijder uit winkelwagen">' + ikoon('i-prullenbak') + '</button></div>') +
      '</div>';
  }
  function teken() {
    var m = leesMand();
    var n = aantalInMand(m);
    var sub = subtotaal(m);
    document.querySelectorAll('[data-mandtel]').forEach(function (el) { el.textContent = n || ''; el.setAttribute('data-n', n); });
    document.querySelectorAll('[data-subtotaal]').forEach(function (el) { el.textContent = euro(sub); });
    var bezorging = bezorgKosten(sub);
    document.querySelectorAll('[data-totaal]').forEach(function (el) { el.textContent = euro(sub + (bezorging.bedrag || 0)); });
    document.querySelectorAll('[data-bezorgtekst]').forEach(function (el) { el.textContent = bezorging.tekst; });
    document.querySelectorAll('[data-gratis]').forEach(function (el) {
      var rest = Math.max(0, CFG.gratisVanaf - sub);
      var p = Math.min(100, (sub / CFG.gratisVanaf) * 100);
      el.classList.toggle('klaar', rest === 0);
      el.querySelector('.lat i').style.setProperty('--p', p + '%');
      var t = el.querySelector('[data-gratistekst]');
      if (t) t.textContent = rest === 0 ? 'Gratis bezorging, je zit boven de € 100' : 'Nog ' + euro(rest) + ' tot gratis bezorging';
    });
    document.querySelectorAll('[data-ladelijst]').forEach(function (el) {
      el.innerHTML = m.length ? m.map(function (r) { return regelHtml(r, false); }).join('') :
        '<div class="lade-leeg">' + ikoon('i-mand') + '<p>Je winkelwagen is nog leeg.</p><a class="knop knop-inkt" href="shop.html">Shop de collectie</a></div>';
    });
    document.querySelectorAll('[data-mandlijst]').forEach(function (el) {
      var compact = el.hasAttribute('data-compact');
      el.innerHTML = m.length ? m.map(function (r) { return regelHtml(r, compact); }).join('') :
        '<div class="lade-leeg" style="padding:3rem 0">' + ikoon('i-mand') + '<p>Je winkelwagen is nog leeg.</p><a class="knop knop-inkt" href="shop.html">Shop de collectie</a></div>';
    });
    document.querySelectorAll('[data-afrekenknop]').forEach(function (el) { el.toggleAttribute('disabled', !m.length); el.setAttribute('aria-disabled', String(!m.length)); });
    var bestel = document.querySelector('[data-bestelknop]');
    if (bestel) bestel.toggleAttribute('disabled', !m.length);
  }
  function bezorgKosten(sub) {
    var afhalen = document.querySelector('input[name="bezorging"][value="afhalen"]');
    if (afhalen && afhalen.checked) return { bedrag: 0, tekst: 'Gratis, afhalen in Eindhoven' };
    if (sub >= CFG.gratisVanaf) return { bedrag: 0, tekst: 'Gratis' };
    if (typeof CFG.verzendkosten === 'number') return { bedrag: CFG.verzendkosten, tekst: euro(CFG.verzendkosten) };
    return { bedrag: 0, tekst: 'Volgt in de bevestiging' };
  }

  /* klikken in regels (lade en mandpagina) */
  document.addEventListener('click', function (e) {
    var regel = e.target.closest('[data-regel]');
    if (!regel) return;
    var slug = regel.dataset.slug, maat = regel.dataset.maat;
    var inp = regel.querySelector('[data-aantal]');
    if (e.target.closest('[data-verwijder]')) { zetAantal(slug, maat, 0); meld('Verwijderd uit je winkelwagen'); }
    else if (e.target.closest('[data-min]')) zetAantal(slug, maat, Math.max(0, Number(inp.value) - 1));
    else if (e.target.closest('[data-plus]')) zetAantal(slug, maat, Math.min(20, Number(inp.value) + 1));
  });
  document.addEventListener('change', function (e) {
    var regel = e.target.closest('[data-regel]');
    if (regel && e.target.hasAttribute('data-aantal')) zetAantal(regel.dataset.slug, regel.dataset.maat, Math.max(0, Math.min(20, Number(e.target.value) || 0)));
  });

  /* ---------- lade openen en sluiten ---------- */
  var lade = document.querySelector('[data-lade]');
  var achter = document.querySelector('[data-ladeachter]');
  function openLade(open) {
    if (!lade) return;
    lade.classList.toggle('open', open);
    lade.setAttribute('aria-hidden', String(!open));
    achter.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var s = lade.querySelector('[data-ladesluit]'); if (s) s.focus(); }
  }
  document.querySelectorAll('[data-mandknop]').forEach(function (b) { b.addEventListener('click', function () { openLade(true); }); });
  document.querySelectorAll('[data-ladesluit]').forEach(function (b) { b.addEventListener('click', function () { openLade(false); }); });
  if (achter) achter.addEventListener('click', function () { openLade(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openLade(false); });

  /* ---------- productpagina ---------- */
  var product = document.querySelector('[data-product]');
  if (product) {
    var slug = product.dataset.slug;
    var aantalInp = product.querySelector('[data-aantal]');
    product.querySelector('[data-min]').addEventListener('click', function () { aantalInp.value = Math.max(1, Number(aantalInp.value) - 1); });
    product.querySelector('[data-plus]').addEventListener('click', function () { aantalInp.value = Math.min(20, Number(aantalInp.value) + 1); });
    var fout = product.querySelector('[data-foutmaat]');
    product.querySelectorAll('input[name="maat"]').forEach(function (r) { r.addEventListener('change', function () { if (fout) fout.hidden = true; }); });
    product.querySelector('[data-koop]').addEventListener('click', function () {
      var maten = product.querySelectorAll('input[name="maat"]');
      var gekozen = product.querySelector('input[name="maat"]:checked');
      if (maten.length && !gekozen) { fout.hidden = false; maten[0].focus(); return; }
      var knop = this;
      voegToe(slug, gekozen ? gekozen.value : '', Math.max(1, Number(aantalInp.value) || 1));
      knop.classList.add('gedaan');
      meld('Toegevoegd aan je winkelwagen');
      setTimeout(function () { openLade(true); }, 250);
    });
    /* galerij */
    var hoofd = document.querySelector('[data-hoofdbeeld]');
    document.querySelectorAll('[data-thumb]').forEach(function (b) {
      b.addEventListener('click', function () {
        hoofd.src = b.dataset.thumb;
        document.querySelectorAll('[data-thumb]').forEach(function (x) { x.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
      });
    });
    /* maatvraag opent de chat */
    var maatChat = product.querySelector('[data-chatopen]');
    if (maatChat) maatChat.addEventListener('click', function () { document.dispatchEvent(new CustomEvent('chat:open', { detail: 'maat' })); });
  }

  /* ---------- bestsellers/aanbiedingen-tabs op home ---------- */
  document.querySelectorAll('[data-tab]').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
      document.querySelectorAll('[data-paneel]').forEach(function (p) { p.hidden = p.dataset.paneel !== t.dataset.tab; if (!p.hidden) p.classList.add('in', 'af'); });
    });
  });

  /* ---------- shop: filteren en sorteren ---------- */
  var shop = document.querySelector('[data-shop]');
  if (shop) {
    var raster = shop.querySelector('[data-raster]');
    var kaarten = [].slice.call(raster.querySelectorAll('[data-slug]'));
    var leeg = shop.querySelector('[data-leeg]');
    var telling = shop.querySelector('[data-telling]');
    var filterTel = shop.querySelector('[data-filtertel]');
    var sorteer = shop.querySelector('[data-sorteer]');
    var actiefEl = shop.querySelector('[data-actief]');
    var filters = shop.querySelector('[data-filters]');
    var params = new URLSearchParams(location.search);
    var zoek = (params.get('q') || '').toLowerCase().trim();
    var maten = {};
    var LIMIET = 24; var limiet = LIMIET;
    var meerRij = shop.querySelector('[data-meerrij]'); var meerKnop = shop.querySelector('[data-meer]');

    /* url-parameters vooraf aanvinken */
    if (params.get('sale')) { var s = filters.querySelector('input[name="sale"]'); if (s) s.checked = true; }
    if (params.get('sub')) { var sInp = filters.querySelector('input[name="sub"][value="' + CSS.escape(params.get('sub')) + '"]'); if (sInp) sInp.checked = true; }
    if (params.get('sport')) { var spInp = filters.querySelector('input[name="sport"][value="' + CSS.escape(params.get('sport')) + '"]'); if (spInp) spInp.checked = true; }

    function gekozen(naam) { return [].slice.call(filters.querySelectorAll('input[name="' + naam + '"]:checked')).map(function (i) { return i.value; }); }
    function pas() {
      var sporten = gekozen('sport'), subs = gekozen('sub'), merken = gekozen('merk'), sale = gekozen('sale').length > 0, maxen = gekozen('max').map(Number);
      var max = maxen.length ? Math.max.apply(null, maxen) : Infinity;
      var gekozenMaten = Object.keys(maten).filter(function (k) { return maten[k]; });
      var zichtbaar = [];
      kaarten.forEach(function (k) {
        var p = bySlug[k.dataset.slug];
        var ok = true;
        if (sporten.length && sporten.indexOf(p.sp) === -1) ok = false;
        if (subs.length && subs.indexOf(p.su) === -1) ok = false;
        if (merken.length && merken.indexOf(p.m) === -1) ok = false;
        if (sale && !p.o) ok = false;
        if (p.pr > max) ok = false;
        if (gekozenMaten.length && !gekozenMaten.some(function (m) { return p.ma.indexOf(m) !== -1; })) ok = false;
        if (zoek && (p.n + ' ' + p.m + ' ' + p.su + ' ' + p.sp + ' ' + p.ma.join(' ')).toLowerCase().indexOf(zoek) === -1) ok = false;
        k.hidden = !ok;
        if (ok) zichtbaar.push(k);
      });
      /* sorteren */
      var w = sorteer ? sorteer.value : 'pop';
      zichtbaar.sort(function (a, b) {
        var pa = bySlug[a.dataset.slug], pb = bySlug[b.dataset.slug];
        if (w === 'laag') return pa.pr - pb.pr;
        if (w === 'hoog') return pb.pr - pa.pr;
        if (w === 'korting') return pb.k - pa.k;
        if (w === 'naam') return pa.n.localeCompare(pb.n);
        return (pb.b - pa.b) || ((pb.m === 'Nikko') - (pa.m === 'Nikko'));
      });
      zichtbaar.forEach(function (k, i) { raster.appendChild(k); k.classList.add('in', 'af'); k.hidden = i >= limiet; });
      if (meerRij) { meerRij.hidden = zichtbaar.length <= limiet; if (meerKnop) meerKnop.textContent = 'Toon meer producten (' + Math.max(0, zichtbaar.length - limiet) + ')'; }
      telling.textContent = zichtbaar.length;
      if (filterTel) filterTel.textContent = zichtbaar.length;
      leeg.hidden = zichtbaar.length > 0;
      /* actieve filters als chips */
      var chips = [];
      sporten.forEach(function (v) { chips.push(['sport', v]); });
      subs.forEach(function (v) { chips.push(['sub', v]); });
      merken.forEach(function (v) { chips.push(['merk', v]); });
      gekozenMaten.forEach(function (v) { chips.push(['maat', v]); });
      if (sale) chips.push(['sale', 'Aanbiedingen']);
      if (max !== Infinity) chips.push(['max', 'Tot € ' + max]);
      if (zoek) chips.push(['q', 'Zoekterm: ' + zoek]);
      actiefEl.innerHTML = chips.map(function (c) { return '<button type="button" class="chip actief" data-weg="' + esc(c[0]) + '" data-waarde="' + esc(c[1]) + '">' + esc(c[1]) + ' ' + ikoon('i-sluit') + '</button>'; }).join('');
    }
    filters.addEventListener('change', function () { limiet = LIMIET; pas(); });
    if (meerKnop) meerKnop.addEventListener('click', function () { limiet += LIMIET; pas(); });
    if (sorteer) sorteer.addEventListener('change', pas);
    filters.querySelectorAll('[data-maat]').forEach(function (b) {
      b.addEventListener('click', function () { maten[b.dataset.maat] = !maten[b.dataset.maat]; b.setAttribute('aria-pressed', String(!!maten[b.dataset.maat])); pas(); });
    });
    actiefEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-weg]'); if (!b) return;
      var soort = b.dataset.weg, waarde = b.dataset.waarde;
      if (soort === 'maat') { maten[waarde] = false; var mb = filters.querySelector('[data-maat="' + CSS.escape(waarde) + '"]'); if (mb) mb.setAttribute('aria-pressed', 'false'); }
      else if (soort === 'q') { zoek = ''; history.replaceState(null, '', location.pathname); }
      else if (soort === 'sale') { filters.querySelector('input[name="sale"]').checked = false; }
      else if (soort === 'max') { filters.querySelectorAll('input[name="max"]').forEach(function (i) { i.checked = false; }); }
      else { var inp = filters.querySelector('input[name="' + soort + '"][value="' + CSS.escape(waarde) + '"]'); if (inp) inp.checked = false; }
      pas();
    });
    var fk = shop.querySelector('[data-filterknop]');
    if (fk) fk.addEventListener('click', function () { filters.classList.add('open'); });
    var fs = shop.querySelector('[data-filtersluit]');
    if (fs) fs.addEventListener('click', function () { filters.classList.remove('open'); });
    pas();
    if (zoek) { var kop = document.querySelector('.pagina-kop h1'); if (kop) kop.textContent = 'Zoekresultaten voor "' + zoek + '"'; }
  }

  /* ---------- afrekenen ---------- */
  var afrekenen = document.querySelector('[data-afrekenen]');
  if (afrekenen) {
    var adres = afrekenen.querySelector('[data-adres]');
    var bezorgRadios = afrekenen.querySelectorAll('input[name="bezorging"]');
    var winkelBetaal = afrekenen.querySelector('[data-betaal="winkel"]');
    function bezorgUpdate() {
      var afhalen = afrekenen.querySelector('input[name="bezorging"]:checked').value === 'afhalen';
      adres.hidden = afhalen;
      adres.querySelectorAll('input').forEach(function (i) { i.required = !afhalen; });
      if (winkelBetaal) { winkelBetaal.hidden = !afhalen; if (!afhalen && winkelBetaal.querySelector('input').checked) afrekenen.querySelector('input[name="betaalmethode"][value="ideal"]').checked = true; }
      teken();
    }
    bezorgRadios.forEach(function (r) { r.addEventListener('change', bezorgUpdate); });
    bezorgUpdate();
    /* onthoud gegevens op dit toestel */
    try { var oud = JSON.parse(localStorage.getItem('nikko_klant') || 'null'); if (oud) Object.keys(oud).forEach(function (k) { var i = afrekenen.querySelector('[name="' + k + '"]'); if (i && i.type !== 'radio' && i.type !== 'checkbox') i.value = oud[k]; }); } catch (e) {}

    afrekenen.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = leesMand();
      var foutEl = afrekenen.querySelector('[data-formfout]');
      foutEl.hidden = true;
      var mis = false;
      afrekenen.querySelectorAll('.veld').forEach(function (v) {
        var i = v.querySelector('input, select, textarea');
        var slecht = i.required && (!i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
        v.classList.toggle('mis', slecht);
        if (slecht && !mis) { i.focus(); mis = true; }
      });
      if (!afrekenen.querySelector('input[name="akkoord"]').checked) { foutEl.textContent = 'Vink de voorwaarden aan om te bestellen.'; foutEl.hidden = false; return; }
      if (mis) { foutEl.textContent = 'Een paar velden zijn nog niet goed ingevuld, kijk hierboven.'; foutEl.hidden = false; return; }
      if (!m.length) { foutEl.textContent = 'Je winkelwagen is leeg.'; foutEl.hidden = false; return; }
      var fd = new FormData(afrekenen);
      var gegevens = {};
      fd.forEach(function (v, k) { gegevens[k] = v; });
      var sub = subtotaal(m);
      var bezorging = bezorgKosten(sub);
      var body = {
        naam: gegevens.voornaam + ' ' + gegevens.achternaam, email: gegevens.email, telefoon: gegevens.telefoon,
        bezorging: gegevens.bezorging === 'afhalen' ? 'Afhalen in de winkel' : 'Thuisbezorgd: ' + gegevens.straat + ' ' + gegevens.huisnummer + ', ' + gegevens.postcode + ' ' + gegevens.plaats + ', ' + gegevens.land,
        betaalmethode: gegevens.betaalmethode, opmerking: gegevens.opmerking || '',
        subtotaal: sub.toFixed(2), bezorgkosten: bezorging.tekst, totaal: (sub + (bezorging.bedrag || 0)).toFixed(2),
        regels: m.map(function (r) { var p = bySlug[r.slug]; return { naam: p.n + (r.maat ? ' (' + r.maat + ')' : ''), aantal: r.aantal, prijs: (p.pr * r.aantal).toFixed(2), slug: p.s }; }),
      };
      var knop = afrekenen.querySelector('[data-bestelknop]');
      knop.disabled = true; knop.textContent = 'Een moment...';
      try { localStorage.setItem('nikko_klant', JSON.stringify({ voornaam: gegevens.voornaam, achternaam: gegevens.achternaam, email: gegevens.email, telefoon: gegevens.telefoon, straat: gegevens.straat, huisnummer: gegevens.huisnummer, postcode: gegevens.postcode, plaats: gegevens.plaats })); } catch (e) {}
      fetch('/api/bestelling', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.fout || 'Er ging iets mis.');
          try { sessionStorage.setItem('nikko_laatste', JSON.stringify({ id: j.id, naam: gegevens.voornaam, email: gegevens.email, bezorging: gegevens.bezorging, betaal: gegevens.betaalmethode })); } catch (e) {}
          bewaarMand([]);
          location.href = 'bedankt.html';
        })
        .catch(function (err) {
          knop.disabled = false; knop.innerHTML = ikoon('i-lock') + ' Bestelling plaatsen';
          foutEl.textContent = 'De bestelling kon niet worden verstuurd (' + err.message + '). Probeer het opnieuw of bel 040 211 1222, dan helpen we je direct.';
          foutEl.hidden = false;
        });
    });
  }

  /* bedankpagina */
  var bedankt = document.querySelector('[data-nummer]');
  if (bedankt) {
    try {
      var l = JSON.parse(sessionStorage.getItem('nikko_laatste') || 'null');
      if (l) {
        bedankt.textContent = l.id;
        var n = document.querySelector('[data-naam]'); if (n && l.naam) n.textContent = l.naam;
        var em = document.querySelector('[data-email]'); if (em && l.email) em.textContent = l.email;
        var sv = document.querySelector('[data-stap-verzend]'); if (sv && l.bezorging === 'afhalen') sv.textContent = 'Je bestelling staat klaar in de winkel aan de Geldropseweg 61. We laten je weten wanneer je hem kunt ophalen.';
        var sb = document.querySelector('[data-stap-betaal]'); if (sb && l.betaal === 'winkel') sb.textContent = 'Je betaalt bij het afhalen in de winkel, contant of met pin.';
      } else { bedankt.textContent = 'volgt per e-mail'; }
    } catch (e) {}
  }

  /* ---------- zakelijk en contact: formulieren naar de Mettafel-backend ---------- */
  ['[data-zakelijk]', '[data-contact]'].forEach(function (sel) {
    var f = document.querySelector(sel);
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var foutEl = f.querySelector('[data-formfout]'); foutEl.hidden = true;
      var mis = false;
      f.querySelectorAll('.veld').forEach(function (v) {
        var i = v.querySelector('input, select, textarea');
        var slecht = i.required && (!i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
        v.classList.toggle('mis', slecht);
        if (slecht && !mis) { i.focus(); mis = true; }
      });
      if (mis) { foutEl.textContent = 'Een paar velden zijn nog niet goed ingevuld.'; foutEl.hidden = false; return; }
      var body = {}; new FormData(f).forEach(function (v, k) { body[k] = v; });
      if (!body.bericht) body.bericht = '(geen toelichting)';
      var knop = f.querySelector('button[type="submit"]');
      var oudeTekst = knop.innerHTML; knop.disabled = true; knop.textContent = 'Versturen...';
      fetch(sel === '[data-zakelijk]' ? '/api/aanvraag' : '/api/bericht', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.fout || 'mislukt');
          f.innerHTML = '<div class="bedankt" style="padding:1rem 0;justify-items:start;text-align:left"><span class="vinkje">' + ikoon('i-vink') + '</span><h2 style="font-size:1.6rem">Ontvangen, bedankt!</h2><p>Je hoort ' + (sel === '[data-zakelijk]' ? 'binnen twee werkdagen' : 'op werkdagen binnen een dag') + ' van ons op ' + esc(body.email) + '. Dringend? Bel 040 211 1222.</p></div>';
        })
        .catch(function (err) {
          knop.disabled = false; knop.innerHTML = oudeTekst;
          foutEl.textContent = 'Versturen lukte niet (' + err.message + '). Mail ons op info@nikko.nl of bel 040 211 1222.'; foutEl.hidden = false;
        });
    });
  });

  teken();
  window.NIKKO_MAND = { lees: leesMand, voegToe: voegToe, open: openLade };
})();
