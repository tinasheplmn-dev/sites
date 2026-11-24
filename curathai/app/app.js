/* Cura Thai app: lessen en massages boeken, rittenkaarten, afspraken en facturen.
   Eén pagina met hash-routes, praat met /api/app/ (powered by Mettafel). Geen frameworks. */
(function () {
  'use strict';
  var TOKEN_KEY = 'ct_klant';
  var token = '';
  try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) {}
  var info = null, mij = null, sessies = null;
  var scherm = document.querySelector('[data-scherm]');
  var paneelHouder = document.querySelector('[data-paneel]');
  var massage = { product: null, datum: null, tijd: null, maand: null, dagen: null, slots: null, code: '' };
  var lesFilter = { activiteit: '', locatie: '' };
  var melding = null; /* eenmalige melding bovenaan het volgende scherm */

  /* ---------- hulpjes ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(id) { return '<svg class="ic" aria-hidden="true"><use href="../assets/iconen.svg#i-' + id + '"/></svg>'; }
  function euro(n) { n = Math.round(Number(n || 0) * 100) / 100; var s = n.toFixed(2).split('.'); return '€ ' + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (s[1] === '00' ? '' : ',' + s[1]); }
  var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var DAGKORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  function delen(d) { var p = d.split('-').map(Number); return { j: p[0], m: p[1], d: p[2] }; }
  function weekdag(d) { var p = delen(d); return new Date(Date.UTC(p.j, p.m - 1, p.d)).getUTCDay(); }
  function datumTekst(d, metJaar) { var p = delen(d); return DAGEN[weekdag(d)] + ' ' + p.d + ' ' + MAANDEN[p.m - 1] + (metJaar ? ' ' + p.j : ''); }
  function datumKort(d) { var p = delen(d); return DAGKORT[weekdag(d)] + ' ' + p.d + ' ' + MAANDEN[p.m - 1].slice(0, 3); }
  function vandaag() { var n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); }
  function urenTot(datum, tijd) { var p = delen(datum); var t = tijd.split(':').map(Number); var dt = new Date(p.j, p.m - 1, p.d, t[0], t[1]); return (dt - new Date()) / 36e5; }
  function voornaam(n) { return String(n || '').split(' ')[0]; }
  function datumLang(d) { var p = delen(d); return p.d + ' ' + MAANDEN[p.m - 1] + ' ' + p.j; }
  function plusDagen(d, n) { var p = delen(d); var x = new Date(Date.UTC(p.j, p.m - 1, p.d + n)); return x.getUTCFullYear() + '-' + String(x.getUTCMonth() + 1).padStart(2, '0') + '-' + String(x.getUTCDate()).padStart(2, '0'); }
  /* "17 tot en met 23 april 2027" */
  function periodeTekst(van, tot) {
    if (!tot || tot === van) return datumLang(van);
    var a = delen(van), b = delen(tot);
    if (a.j === b.j && a.m === b.m) return a.d + ' tot en met ' + b.d + ' ' + MAANDEN[b.m - 1] + ' ' + b.j;
    if (a.j === b.j) return a.d + ' ' + MAANDEN[a.m - 1] + ' tot en met ' + datumLang(tot);
    return datumLang(van) + ' tot en met ' + datumLang(tot);
  }
  var TEL = 'tel:+31629129753', WA = 'https://wa.me/31629129753';
  function contactKnoppen() { return '<a class="knop knop-rand knop-klein" href="' + TEL + '">' + ic('telefoon') + 'Bel Juniska</a><a class="knop knop-rand knop-klein" href="' + WA + '">' + ic('whatsapp') + 'App Juniska</a>'; }
  function retraites() { return (info.producten || []).filter(function (p) { return p.soort === 'retraite'; }).sort(function (a, b) { return String(a.van).localeCompare(String(b.van)); }); }
  function abonnementen() { return (info.producten || []).filter(function (p) { return p.soort === 'abonnement' && p.prijs > 0; }); }
  function links() { return (info.app && info.app.links) || []; }
  /* "2 credits per maand, elk voor een massage van 90 minuten" */
  function aboCredits(p) {
    var c = (info.producten || []).filter(function (x) { return x.id === p.creditProductId; })[0];
    var voor = c ? (c.soort === 'massage' && c.duur ? 'een massage van ' + c.duur + ' minuten' : c.naam) : '';
    return p.credits + ' ' + (p.credits === 1 ? 'credit' : 'credits') + ' per maand' + (voor ? (p.credits === 1 ? ' voor ' : ', elk voor ') + voor : '');
  }

  function api(pad, body, opties) {
    var kop = { 'Content-Type': 'application/json' };
    if (token) kop['x-klant-token'] = token;
    return fetch('../api/app/' + pad, { method: body ? 'POST' : 'GET', headers: kop, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().then(function (j) { j._status = r.status; return j; }); })
      .then(function (j) { if (!j.ok) { var e = new Error(j.fout || 'Er ging iets mis.'); e.veld = j.veld; e.status = j._status; throw e; } return j; });
  }
  function zetToken(t) { token = t || ''; try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) {} werkAccountBij(); }
  function werkAccountBij() {
    var a = document.querySelector('[data-account]'); var tekst = document.querySelector('[data-account-tekst]');
    if (!a) return;
    a.href = token ? '#mij' : '#inloggen';
    tekst.textContent = token ? (mij && mij.klant ? 'Hoi ' + voornaam(mij.klant.naam) : 'Mijn') : 'Inloggen';
  }
  function laadMij() {
    if (!token) { mij = null; return Promise.resolve(null); }
    return api('mij').then(function (j) { mij = j; werkAccountBij(); return j; }).catch(function (e) { if (e.status === 401) { zetToken(''); mij = null; } return null; });
  }
  function credits() { return mij && mij.credits ? mij.credits : []; }
  function creditVoor(lesgroep) { return credits().filter(function (c) { return c.lesgroep === lesgroep && c.resterend > 0; })[0] || null; }
  function creditProduct(productId) { return credits().filter(function (c) { return c.productId === productId && c.resterend > 0; })[0] || null; }
  function eerdereBoekingen() { return mij && mij.boekingen ? mij.boekingen.filter(function (b) { return b.status !== 'geannuleerd'; }).length : 0; }

  /* ---------- schermen ---------- */
  function toon(html) {
    var m = '';
    if (melding) { m = '<div class="melding ' + melding.soort + '" role="status">' + esc(melding.tekst) + '</div>'; melding = null; }
    scherm.innerHTML = m + html;
    window.scrollTo({ top: 0 });
  }
  function kopje(eyebrow, icoon, titel, tekst) {
    return '<header>' + (eyebrow ? '<span class="eyebrow">' + ic(icoon) + esc(eyebrow) + '</span>' : '') + '<h1>' + esc(titel) + '</h1>' + (tekst ? '<p>' + esc(tekst) + '</p>' : '') + '</header>';
  }
  function statusTekst(b) {
    if (b.soort === 'retraite') return { aangevraagd: ['oranje', 'Juniska neemt contact met je op'], wacht_op_betaling: ['oranje', 'Nog te betalen'], bevestigd: ['groen', 'Je plek staat vast'], afgerond: ['grijs', 'Geweest'], geannuleerd: ['rood', 'Geannuleerd'] }[b.status] || ['grijs', b.status];
    return { aangevraagd: ['oranje', 'Wacht op bevestiging van Juniska'], wacht_op_betaling: ['oranje', 'Nog te betalen'], bevestigd: ['groen', 'Bevestigd'], afgerond: ['grijs', 'Geweest'], geannuleerd: ['rood', 'Geannuleerd'], niet_verschenen: ['grijs', 'Niet geweest'] }[b.status] || ['grijs', b.status];
  }
  function badge(b) { var s = statusTekst(b); return '<span class="badge ' + s[0] + '">' + esc(s[1]) + '</span>'; }

  /* home */
  function schermHome() {
    var komend = mij ? mij.boekingen.filter(function (b) { return b.datum >= vandaag() && b.status !== 'geannuleerd'; }).sort(function (a, b) { return (a.datum + a.tijd).localeCompare(b.datum + b.tijd); }).slice(0, 3) : [];
    var cr = credits().reduce(function (s, c) { return s + c.resterend; }, 0);
    var html = '<section class="scherm">' + kopje(null, null, mij && mij.klant ? 'Hoi ' + voornaam(mij.klant.naam) : 'Welkom bij Cura Thai', (info.app && info.app.welkom) || '') +
      '<div class="tegels">' +
      '<a class="tegel" href="#lessen"><img src="../assets/img/workshop-600.webp" alt="" width="600" height="903"><h2>Les boeken</h2><span>Hatha yoga, pilates, Thaise yogamassage ' + ic('pijl') + '</span></a>' +
      '<a class="tegel" href="#massage"><img src="../assets/img/stretch-zit-800.webp" alt="" width="800" height="800"><h2>Massage boeken</h2><span>Kies je behandeling en moment ' + ic('pijl') + '</span></a>' +
      '</div>' +
      (retraites().length ? '<a class="tegel breed" href="#retraites"><img src="../assets/img/retraite-play-800.webp" data-terugval="../assets/img/malaga-villa-600.webp" alt="" width="800" height="600" loading="lazy"><h2>Retraites in Málaga</h2><span>Zeven dagen yoga, massage en zon, voorjaar ' + esc(String(retraites()[0].van).slice(0, 4)) + ' ' + ic('pijl') + '</span></a>' : '') +
      '<div class="tegels">' +
      '<a class="tegel klein" href="#kaarten"><span class="knopje">' + ic('cadeau') + '</span><div><h2>Kaarten en abonnementen</h2><span>Voordeliger als je vaker komt ' + ic('pijl') + '</span></div></a>' +
      links().map(function (l) { return '<a class="tegel klein online" href="' + esc(l.url) + '" target="_blank" rel="noopener"><span class="knopje">' + ic('scherm') + '</span><div><h2>' + esc(l.naam) + '</h2><span>Online, ' + esc(euro(l.prijs) + ' ' + (l.per || '')) + ' ' + ic('pijl') + '</span></div></a>'; }).join('') +
      '</div>';
    if (mij) {
      html += '<div class="kaart"><div class="binnen"><div class="tussen"><h2>Jouw afspraken</h2><a class="knop-tekst knop" href="#mij">Alles</a></div>' +
        (komend.length ? komend.map(afspraakHtml).join('') : '<p class="leeg">Je hebt nog niets gepland. Kies hierboven een les of massage.</p>') +
        '<p>' + (cr ? 'Je hebt nog <b>' + cr + ' ' + (cr === 1 ? 'credit' : 'credits') + '</b> op je kaart.' : 'Je hebt op dit moment geen credits.') + '</p></div></div>';
    } else {
      html += '<div class="kaart vlak"><div class="binnen"><h3>Al eerder geweest?</h3><p>Met je inloglink zie je je afspraken, credits en facturen.</p><a class="knop knop-rand" href="#inloggen">' + ic('mail') + 'Stuur mij een inloglink</a></div></div>';
    }
    html += voet() + '</section>';
    toon(html);
  }
  function voet() { return '<p class="voet">Boeken powered by Mettafel · Vragen? <a href="https://wa.me/31629129753" style="color:var(--merk);font-weight:700">App Juniska</a></p>'; }

  /* lessen */
  function schermLessen() {
    scherm.innerHTML = '<section class="scherm">' + kopje('Groepslessen', 'yoga', 'Kies je les', 'In Oirsbeek en Amstenrade. Je eerste les is gratis.') + '<p class="laden">Rooster laden...</p></section>';
    api('sessies').then(function (j) { sessies = j.sessies; tekenLessen(); }).catch(function (e) { toon('<section class="scherm"><div class="melding fout">' + esc(e.message) + '</div></section>'); });
  }
  function tekenLessen() {
    var acts = []; var locs = [];
    sessies.forEach(function (s) { if (acts.indexOf(s.activiteit) < 0) acts.push(s.activiteit); if (locs.indexOf(s.locatie) < 0) locs.push(s.locatie); });
    var lijst = sessies.filter(function (s) { return (!lesFilter.activiteit || s.activiteit === lesFilter.activiteit) && (!lesFilter.locatie || s.locatie === lesFilter.locatie); });
    var chip = function (soort, waarde, tekst) { return '<button class="chip" type="button" data-filter="' + soort + '" data-waarde="' + esc(waarde) + '" aria-pressed="' + (lesFilter[soort] === waarde) + '">' + esc(tekst) + '</button>'; };
    var html = '<section class="scherm">' + kopje('Groepslessen', 'yoga', 'Kies je les', 'In Oirsbeek en Amstenrade. Je eerste les is gratis.') +
      '<div class="chips">' + chip('activiteit', '', 'Alles') + acts.map(function (a) { return chip('activiteit', a, a); }).join('') + locs.map(function (l) { return chip('locatie', l, l); }).join('') + '</div>';
    if (!lijst.length) html += '<p class="leeg">Geen lessen gevonden. Kijk later nog eens of app Juniska.</p>';
    var dag = '';
    lijst.forEach(function (s) {
      if (s.datum !== dag) { dag = s.datum; html += '<div class="dagkop"><b>' + esc(datumTekst(s.datum)) + '</b>' + (s.datum === vandaag() ? '<small>vandaag</small>' : '') + '</div>'; }
      var vrij = s.max - s.bezet;
      var actie;
      if (s.geannuleerd) actie = '<span class="badge rood">Geannuleerd</span>' + (s.opmerking ? '<small class="waar">' + esc(s.opmerking) + '</small>' : '');
      else if (s.ingeschreven) actie = '<span class="badge groen">' + ic('check') + 'Ingeschreven</span><button class="knop knop-tekst knop-klein" type="button" data-afmelden="' + esc(s.key) + '">Afmelden</button>';
      else if (s.vol && s.opWachtlijst) actie = '<span class="badge oranje">Op de wachtlijst</span><button class="knop knop-tekst knop-klein" type="button" data-wacht-af="' + esc(s.key) + '">Van de wachtlijst af</button>';
      else if (s.vol) actie = '<button class="knop knop-rand knop-klein" type="button" data-wacht="' + esc(s.key) + '">Zet me op de wachtlijst</button><span class="plekken vol">Vol' + (s.wachtlijst > 0 ? ', ' + s.wachtlijst + ' ' + (s.wachtlijst === 1 ? 'persoon wacht' : 'mensen wachten') : '') + '</span>';
      else actie = '<button class="knop knop-merk knop-klein" type="button" data-aanmelden="' + esc(s.key) + '">Meld je aan</button><span class="plekken' + (vrij <= 3 ? ' vol' : '') + '">' + vrij + ' ' + (vrij === 1 ? 'plek' : 'plekken') + ' vrij</span>';
      html += '<article class="les' + (s.geannuleerd ? ' geannuleerd' : '') + (s.ingeschreven ? ' mijn' : '') + '"><div class="tijd">' + esc(s.tijd) + '<small>tot ' + esc(s.eind) + '</small></div><div class="naam">' + esc(s.activiteit) + '</div><div class="actie">' + actie + '</div><div class="waar">' + esc(s.locatie) + ' · ' + esc(s.adres) + '</div></article>';
    });
    html += voet() + '</section>';
    toon(html);
  }
  function paneelAanmelden(key) {
    var s = sessies.filter(function (x) { return x.key === key; })[0];
    if (!s) return;
    var credit = creditVoor(s.lesgroep);
    var kaarten = info.producten.filter(function (p) { return (p.soort === 'kaart' || p.soort === 'les') && p.prijs > 0 && p.lesgroep === s.lesgroep; });
    var toonProefles = !mij || eerdereBoekingen() === 0;
    var html = '<div class="paneel-kop"><div><span class="eyebrow">' + ic('yoga') + 'Aanmelden</span><h2>' + esc(s.activiteit) + '</h2><p>' + esc(datumTekst(s.datum)) + ' om ' + esc(s.tijd) + ' · ' + esc(s.locatie) + '</p></div><button class="sluitknop" type="button" data-sluit aria-label="Sluiten">' + ic('sluit') + '</button></div>' +
      '<form class="formulier" data-form="les" novalidate><input type="hidden" name="sessieKey" value="' + esc(key) + '"><input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">';
    if (credit) {
      html += '<div class="melding info">Je gebruikt 1 credit van je ' + esc(credit.omschrijving) + ' (nog ' + credit.resterend + ' over).</div><input type="hidden" name="betaalwijze" value="credit">';
    } else {
      html += '<fieldset class="veld"><legend>Hoe wil je meedoen?</legend><div class="keuzes" data-keuzes>';
      if (toonProefles) html += '<label><input type="radio" name="betaalwijze" value="proefles" checked><span class="vak"><b>Gratis proefles</b><small>Voor je eerste les bij Cura Thai</small><span class="prijs">€ 0</span></span></label>';
      kaarten.forEach(function (p, i) {
        html += '<label><input type="radio" name="betaalwijze" value="kopen" data-kaart="' + esc(p.id) + '"' + (!toonProefles && i === 0 ? ' checked' : '') + '><span class="vak"><b>' + esc(p.naam) + '</b><small>' + esc(p.credits > 1 ? p.credits + ' lessen, ' + p.geldigMaanden + ' maanden geldig' : p.omschrijving || '') + '</small><span class="prijs">' + euro(p.prijs) + '</span></span></label>';
      });
      html += '</div></fieldset>';
      if (kaarten.length) html += '<div data-alleen-kopen hidden>' + codeVeld() + '<div data-samenvat></div></div>';
    }
    if (!mij) html += gegevensVelden();
    html += '<div class="veld"><label for="opm">Wil je Juniska iets laten weten? <small>(niet verplicht)</small></label><input id="opm" name="opmerking" maxlength="300" placeholder="Bijvoorbeeld een blessure"></div>' +
      '<div class="fout" data-fout hidden role="alert"></div><button class="knop knop-merk knop-breed" type="submit">Bevestig je aanmelding ' + ic('pijl') + '</button><p class="voet" style="padding:.2rem 0 0">Afmelden kan tot ' + esc((info.lessen && info.lessen.annulerenUren) || 2) + ' uur voor de les.</p></form>';
    var p = openPaneel(html);
    var form = p.querySelector('form');
    /* code en samenvatting alleen als je een losse les of kaart koopt */
    var gekozenKaart = function () { var r = form.querySelector('input[name="betaalwijze"]:checked'); return r && r.value === 'kopen' ? kaarten.filter(function (k) { return k.id === r.dataset.kaart; })[0] : null; };
    form._ctx = { soort: 'les' };
    form._samenvat = function (code) {
      var k = gekozenKaart(); if (!k) return '';
      return samenvatHtml([[k.naam, euro(k.prijs)]], k.prijs, code, info.online ? 'Je betaalt nu online' : 'Te betalen na je betaalverzoek');
    };
    var wissel = function () { var blok = form.querySelector('[data-alleen-kopen]'); if (!blok) return; blok.hidden = !gekozenKaart(); werkSamenvatBij(form); };
    form.addEventListener('change', function (e) { if (e.target.name === 'betaalwijze') wissel(); });
    wissel();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target; var data = formData(f);
      if (data.betaalwijze === 'kopen') { var r = f.querySelector('input[name="betaalwijze"]:checked'); data.kaartId = r ? r.dataset.kaart : ''; } else delete data.kortingscode;
      data.soort = 'les';
      if (!mij && !controleerGegevens(f, data)) return;
      verstuur(f, 'boek', data, function (j) {
        sluitPaneel();
        if (j.klantToken) zetToken(j.klantToken);
        laadMij().then(function () { bevestiging('Je aanmelding is binnen', j.bericht, j.boeking); });
      });
    });
  }
  function afmelden(key) {
    var b = mij && mij.boekingen.filter(function (x) { return x.sessieKey === key && x.status !== 'geannuleerd'; })[0];
    if (!b) { melding = { soort: 'info', tekst: 'Open eerst je afspraken om je af te melden.' }; location.hash = '#mij'; return; }
    annuleer(b);
  }

  /* gegevensvelden en formulierhulp */
  function gegevensVelden() {
    return '<div class="veld"><label for="naam">Je naam</label><input id="naam" name="naam" autocomplete="name" required></div>' +
      '<div class="veld"><label for="email">E-mailadres</label><input id="email" name="email" type="email" autocomplete="email" inputmode="email" required><small>Hier komt je bevestiging en je inloglink.</small></div>' +
      '<div class="veld"><label for="telefoon">Telefoonnummer</label><input id="telefoon" name="telefoon" type="tel" autocomplete="tel" inputmode="tel" required></div>';
  }
  /* ---------- kortingscode of cadeaubon: overal hetzelfde veld ---------- */
  function codeVeld(waarde, hint) {
    return '<div class="veld" data-codeveld><label for="code">Kortingscode of cadeaubon <small>(niet verplicht)</small></label>' +
      '<div class="code-rij"><input id="code" name="kortingscode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(waarde || '') + '"><button class="knop knop-rand knop-klein" type="button" data-code-toepassen>Toepassen</button></div>' +
      (hint ? '<small>' + esc(hint) + '</small>' : '') +
      '<p class="code-uitkomst" data-code-uitkomst hidden role="status"></p></div>';
  }
  function kortingInfo(code) { return (info.kortingen || []).filter(function (k) { return String(k.code).toLowerCase() === String(code).toLowerCase(); })[0] || {}; }
  /* "massage van 90 minuten" */
  function kortingDoel(productIds) {
    if (!productIds || !productIds.length) return 'massage';
    var ps = (info.producten || []).filter(function (p) { return productIds.indexOf(p.id) >= 0; });
    if (ps.length && ps.every(function (p) { return p.soort === 'massage' && p.duur; })) {
      var duren = []; ps.forEach(function (p) { if (duren.indexOf(p.duur) < 0) duren.push(p.duur); });
      return 'massage van ' + duren.join(' of ') + ' minuten';
    }
    return ps.map(function (p) { return p.naam; }).join(' of ') || 'massage';
  }
  function codeOmschrijving(j) {
    if (j.soort === 'cadeaubon') return 'Cadeaubon: ' + euro(j.saldo) + ' tegoed' + (j.geldigTot ? ', geldig tot en met ' + datumLang(j.geldigTot) : '');
    return 'Korting: ' + euro(j.bedrag) + ' op je ' + (kortingInfo(j.code).alleenNieuw ? 'eerste ' : '') + kortingDoel(j.productIds);
  }
  /* dezelfde regels als de server, zodat je de fout meteen bij het veld ziet */
  function codeFout(j, ctx) {
    if (j.soort !== 'korting') return '';
    if (ctx.soort !== 'massage') return 'Deze kortingscode geldt alleen voor een massage.';
    if (j.productIds && j.productIds.length && j.productIds.indexOf(ctx.productId) < 0) return 'Deze code geldt alleen voor een ' + kortingDoel(j.productIds) + '.';
    if (kortingInfo(j.code).alleenNieuw && mij && mij.boekingen.some(function (b) { return b.soort === 'massage' && b.status !== 'geannuleerd'; })) return 'Deze code is voor je eerste massage.';
    return '';
  }
  function codeToepassen(f) {
    var inp = f.querySelector('[name="kortingscode"]'); var knop = f.querySelector('[data-code-toepassen]'); var uit = f.querySelector('[data-code-uitkomst]');
    if (!inp) return;
    var c = inp.value.trim();
    f._code = null; uit.hidden = true; veldFout(f, 'kortingscode', '');
    if (!c) { veldFout(f, 'kortingscode', 'Vul eerst een code in.'); werkSamenvatBij(f); return; }
    knop.disabled = true;
    api('code?c=' + encodeURIComponent(c)).then(function (j) {
      knop.disabled = false;
      var fout = codeFout(j, f._ctx || {});
      if (fout) { veldFout(f, 'kortingscode', fout); werkSamenvatBij(f); return; }
      f._code = j; inp.value = j.code;
      uit.innerHTML = ic('check') + '<span>' + esc(codeOmschrijving(j)) + '</span>'; uit.hidden = false;
      werkSamenvatBij(f);
    }).catch(function (e) { knop.disabled = false; veldFout(f, 'kortingscode', e.message); werkSamenvatBij(f); });
  }
  function codeGewijzigd(f) {
    if (!f._code) { veldFout(f, 'kortingscode', ''); return; }
    f._code = null; var uit = f.querySelector('[data-code-uitkomst]'); if (uit) uit.hidden = true; werkSamenvatBij(f);
  }
  function werkSamenvatBij(f) { var h = f.querySelector('[data-samenvat]'); if (h && f._samenvat) h.innerHTML = f._samenvat(f._code); }
  /* samenvatting met tegoed of korting eraf, nooit onder nul */
  function samenvatHtml(regels, basis, code, totaalLabel, noot) {
    var af = 0; var label = ''; var rest = 0;
    if (code) {
      var bedrag = code.soort === 'cadeaubon' ? code.saldo : code.bedrag;
      af = Math.min(Math.max(0, Number(bedrag) || 0), basis);
      label = (code.soort === 'cadeaubon' ? 'Cadeaubon ' : 'Korting ') + code.code;
      if (code.soort === 'cadeaubon') rest = Math.round((code.saldo - af) * 100) / 100;
    }
    var totaal = Math.max(0, Math.round((basis - af) * 100) / 100);
    return '<div class="samenvat">' + regels.map(function (r) { return '<div><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('') +
      (af > 0 ? '<div class="aftrek"><span>' + esc(label) + '</span><b>− ' + esc(euro(af)) + '</b></div>' : '') +
      '<div class="totaal"><span>' + esc(af > 0 && totaal === 0 ? 'Te betalen' : totaalLabel) + '</span><b>' + esc(euro(totaal)) + '</b></div>' +
      (af > 0 && totaal === 0 ? '<p class="noot">Helemaal betaald met je cadeaubon.</p>' : '') +
      (rest > 0 ? '<p class="noot">Er blijft ' + esc(euro(rest)) + ' op je cadeaubon staan.</p>' : '') +
      (noot ? '<p class="noot">' + esc(noot) + '</p>' : '') + '</div>';
  }

  function formData(f) { var d = {}; new FormData(f).forEach(function (v, k) { d[k] = String(v).trim(); }); return d; }
  function veldFout(f, naam, tekst) {
    var inp = f.querySelector('[name="' + naam + '"]'); if (!inp) return false;
    var veld = inp.closest('.veld'); if (!veld) return false;
    var p = veld.querySelector('.fout'); if (!p) { p = document.createElement('p'); p.className = 'fout'; p.setAttribute('role', 'alert'); veld.appendChild(p); }
    p.textContent = tekst || ''; p.hidden = !tekst; veld.classList.toggle('mis', !!tekst);
    if (tekst) inp.focus();
    return true;
  }
  function controleerGegevens(f, d) {
    var ok = true;
    ['telefoon', 'email', 'naam'].forEach(function (k) {
      var t = '';
      if (!d[k]) t = { naam: 'Vul je naam in.', email: 'Vul je e-mailadres in.', telefoon: 'Vul je telefoonnummer in.' }[k];
      else if (k === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) t = 'Dit e-mailadres klopt niet helemaal.';
      else if (k === 'telefoon' && d.telefoon.replace(/\D/g, '').length < 9) t = 'Vul een telefoonnummer van minstens 9 cijfers in.';
      veldFout(f, k, t); if (t) ok = false;
    });
    return ok;
  }
  function verstuur(f, pad, data, klaar) {
    var knop = f.querySelector('button[type="submit"]'); var fout = f.querySelector('[data-fout]');
    knop.disabled = true; if (fout) { fout.hidden = true; fout.textContent = ''; }
    api(pad, data).then(function (j) {
      if (j.betaalUrl) { if (j.klantToken) zetToken(j.klantToken); location.href = j.betaalUrl; return; }
      klaar(j);
    }).catch(function (e) {
      knop.disabled = false;
      if (e.veld === 'proefles') { var r = f.querySelector('input[value="proefles"]'); if (r) { r.closest('label').remove(); var eerste = f.querySelector('input[name="betaalwijze"]'); if (eerste) { eerste.checked = true; eerste.dispatchEvent(new Event('change', { bubbles: true })); } } }
      if (!veldFout(f, e.veld, e.message) && fout) { fout.textContent = e.message; fout.hidden = false; fout.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
  }
  function bevestiging(titel, tekst, b, extra) {
    var wat = '';
    if (b && b.soort === 'retraite') wat = '<p><b>' + esc(b.productNaam) + '</b><br>' + esc(periodeTekst(b.datum, b.tot) + ', ' + b.personen + ' ' + (b.personen === 1 ? 'persoon' : 'personen')) + '</p>';
    else if (b) wat = '<p><b>' + esc(b.soort === 'les' ? b.activiteit : b.productNaam) + '</b><br>' + esc(datumTekst(b.datum, true)) + ' om ' + esc(b.tijd) + '</p>';
    toon('<section class="scherm"><div class="kaart"><div class="binnen bevestiging"><span class="knopje">' + ic('check') + '</span><h1>' + esc(titel) + '</h1>' + wat + '<p>' + esc(tekst) + '</p>' + (extra || '') + '<a class="knop knop-merk" href="#mij">Bekijk je afspraken</a><a class="knop knop-tekst" href="#home">Terug naar het begin</a></div></div>' + voet() + '</section>');
  }

  /* massage */
  function schermMassage() {
    var m = massage; var stap = !m.product ? 1 : !m.datum ? 2 : !m.tijd ? 3 : 4;
    var balk = '<ol class="stappen" aria-label="Stap ' + stap + ' van 4">' + [1, 2, 3, 4].map(function (i) { return '<li class="' + (i < stap ? 'klaar' : i === stap ? 'nu' : '') + '"></li>'; }).join('') + '</ol>';
    var html = '<section class="scherm">' + kopje('Massage boeken', 'handen', 'Plan je behandeling', 'In de praktijk aan de Oliemolenstraat 60 in Heerlen.') + balk;
    var samenvat = function () {
      if (!m.product) return '';
      return '<div class="samenvat"><div><span>Behandeling</span><b>' + esc(m.product.naam) + ' <button class="knop knop-tekst knop-klein" type="button" data-stap="1">wijzig</button></b></div>' +
        (m.datum ? '<div><span>Dag</span><b>' + esc(datumTekst(m.datum)) + ' <button class="knop knop-tekst knop-klein" type="button" data-stap="2">wijzig</button></b></div>' : '') +
        (m.tijd ? '<div><span>Tijd</span><b>' + esc(m.tijd) + ' tot ' + esc(eindTijd(m.tijd, m.product.duur)) + ' <button class="knop knop-tekst knop-klein" type="button" data-stap="3">wijzig</button></b></div>' : '') + '</div>';
    };
    if (stap === 1) {
      html += '<div class="stapkop"><b>1</b><h2>Kies je behandeling</h2></div>';
      var groepen = [];
      info.producten.filter(function (p) { return p.soort === 'massage'; }).forEach(function (p) { if (groepen.indexOf(p.groep) < 0) groepen.push(p.groep); });
      groepen.forEach(function (g) {
        html += '<div class="groepkop">' + esc(g) + '</div>';
        info.producten.filter(function (p) { return p.soort === 'massage' && p.groep === g; }).forEach(function (p) {
          var cr = creditProduct(p.id);
          html += '<button class="optie" type="button" data-product="' + esc(p.id) + '"><span class="knopje">' + ic(/olie|deep/i.test(p.naam) ? 'olie' : /zwanger/i.test(p.naam) ? 'hart' : 'handen') + '</span><b>' + esc(p.naam) + '</b><span class="prijs">' + (cr ? '<small>credit</small>' : euro(p.prijs)) + '</span><small>' + esc(p.duur + ' min · ' + (p.annuleren ? 'tot ' + p.annuleren + ' uur vooraf gratis annuleren' : 'niet kosteloos te annuleren')) + '</small></button>';
        });
      });
    } else if (stap === 2) {
      html += samenvat() + '<div class="stapkop"><b>2</b><h2>Kies een dag</h2></div><div data-kalender><p class="laden">Beschikbaarheid laden...</p></div>';
    } else if (stap === 3) {
      html += samenvat() + '<div class="stapkop"><b>3</b><h2>Kies een tijd</h2></div><div data-slots><p class="laden">Tijden laden...</p></div>';
    } else {
      var korting = (info.kortingen || []).filter(function (k) { return !k.productIds || k.productIds.indexOf(m.product.id) >= 0; })[0];
      var cr4 = creditProduct(m.product.id);
      html += samenvat() + '<div class="stapkop"><b>4</b><h2>' + (mij ? 'Bevestig je afspraak' : 'Jouw gegevens') + '</h2></div>' +
        '<form class="formulier" data-form="massage" novalidate><input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
        (mij ? '' : gegevensVelden()) +
        (cr4 ? '<div class="melding info">Je gebruikt 1 credit van je ' + esc(cr4.omschrijving) + ' (nog ' + cr4.resterend + ' over).</div>' :
          codeVeld(m.code, korting ? 'Nieuw bij Cura Thai? Met ' + korting.code + ' krijg je ' + euro(korting.bedrag) + ' korting op je ' + (korting.alleenNieuw ? 'eerste ' : '') + kortingDoel(korting.productIds) + '.' : '')) +
        '<div class="veld"><label for="opm">Klachten of wensen <small>(niet verplicht)</small></label><textarea id="opm" name="opmerking" maxlength="300" placeholder="Bijvoorbeeld: last van mijn onderrug"></textarea></div>' +
        (cr4 ? '<div class="samenvat"><div class="totaal"><span>Te betalen</span><b>1 credit</b></div></div>' : '<div data-samenvat></div>') +
        '<div class="fout" data-fout hidden role="alert"></div><button class="knop knop-merk knop-breed" type="submit">' + (cr4 ? 'Bevestig je afspraak' : info.online ? 'Naar betalen' : 'Vraag je afspraak aan') + ' ' + ic('pijl') + '</button>' +
        '<p class="voet" style="padding:.2rem 0 0">' + esc(info.online ? 'Na betaling staat je afspraak vast.' : 'Juniska bevestigt je afspraak zo snel mogelijk. Daarna krijg je de factuur en een betaalverzoek.') + '</p></form>';
    }
    html += voet() + '</section>';
    toon(html);
    if (stap === 2) laadKalender();
    if (stap === 3) laadSlots();
    if (stap === 4) {
      var mf = scherm.querySelector('form');
      mf._ctx = { soort: 'massage', productId: m.product.id };
      mf._samenvat = function (code) { return samenvatHtml([[m.product.naam, euro(m.product.prijs)]], m.product.prijs, code, info.online ? 'Je betaalt nu online' : 'Te betalen na bevestiging'); };
      werkSamenvatBij(mf);
      mf.addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target; var data = formData(f);
        Object.assign(data, { soort: 'massage', productId: m.product.id, datum: m.datum, tijd: m.tijd });
        m.code = data.kortingscode || '';
        if (!mij && !controleerGegevens(f, data)) return;
        verstuur(f, 'boek', data, function (j) {
          if (j.klantToken) zetToken(j.klantToken);
          massage = { product: null, datum: null, tijd: null, maand: null, dagen: null, slots: null, code: '' };
          laadMij().then(function () { bevestiging(j.boeking.status === 'bevestigd' ? 'Je afspraak staat vast' : 'Je aanvraag is binnen', j.bericht, j.boeking); });
        });
      });
    }
  }
  function eindTijd(t, duur) { var p = t.split(':').map(Number); var min = p[0] * 60 + p[1] + duur; return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'); }
  function laadKalender() {
    var m = massage;
    var klaar = function () { tekenKalender(); };
    if (m.dagen && m.dagen.product === m.product.id) return klaar();
    api('dagen?product=' + encodeURIComponent(m.product.id)).then(function (j) { m.dagen = { product: m.product.id, lijst: j.dagen }; m.maand = null; klaar(); })
      .catch(function (e) { var k = scherm.querySelector('[data-kalender]'); if (k) k.innerHTML = '<div class="melding fout">' + esc(e.message) + '</div>'; });
  }
  function tekenKalender() {
    var m = massage; var houder = scherm.querySelector('[data-kalender]'); if (!houder) return;
    var lijst = m.dagen.lijst; var perDag = {}; lijst.forEach(function (d) { perDag[d.datum] = d.vrij; });
    var eersteVrij = lijst.filter(function (d) { return d.vrij > 0; })[0];
    if (!m.maand) m.maand = (eersteVrij || lijst[0]).datum.slice(0, 7);
    var p = m.maand.split('-').map(Number); var eerste = m.maand + '-01';
    var dagenInMaand = new Date(p[0], p[1], 0).getDate();
    var start = (weekdag(eerste) + 6) % 7; /* maandag eerst */
    var laatsteMaand = lijst[lijst.length - 1].datum.slice(0, 7); var eersteMaand = lijst[0].datum.slice(0, 7);
    var html = '<div class="maandkop"><button type="button" data-maand="-1" aria-label="Vorige maand"' + (m.maand <= eersteMaand ? ' disabled' : '') + '>' + ic('links') + '</button><b>' + MAANDEN[p[1] - 1] + ' ' + p[0] + '</b><button type="button" data-maand="1" aria-label="Volgende maand"' + (m.maand >= laatsteMaand ? ' disabled' : '') + '>' + ic('rechts') + '</button></div><div class="dagen">' +
      ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map(function (d) { return '<span class="wd">' + d + '</span>'; }).join('');
    for (var i = 0; i < start; i++) html += '<span class="dag leeg"></span>';
    for (var d = 1; d <= dagenInMaand; d++) {
      var datum = m.maand + '-' + String(d).padStart(2, '0'); var vrij = perDag[datum] || 0;
      html += '<button class="dag' + (m.datum === datum ? ' gekozen' : '') + '" type="button" data-datum="' + datum + '"' + (vrij ? '' : ' disabled') + ' aria-label="' + esc(datumTekst(datum)) + (vrij ? ', ' + vrij + ' tijden vrij' : ', niet beschikbaar') + '">' + d + (vrij ? '<em></em>' : '') + '</button>';
    }
    html += '</div><p class="voet" style="padding:.4rem 0 0">' + (eersteVrij ? 'Eerste vrije dag: ' + esc(datumTekst(eersteVrij.datum)) + '.' : 'Er is de komende tijd geen plek. App Juniska voor een moment in overleg.') + '</p>';
    houder.innerHTML = html;
  }
  function laadSlots() {
    var m = massage;
    api('slots?product=' + encodeURIComponent(m.product.id) + '&datum=' + m.datum).then(function (j) {
      var h = scherm.querySelector('[data-slots]'); if (!h) return;
      if (!j.slots.length) { h.innerHTML = '<p class="leeg">Op deze dag is net alles bezet. <button class="knop knop-tekst" type="button" data-stap="2">Kies een andere dag</button></p>'; return; }
      h.innerHTML = '<div class="slots">' + j.slots.map(function (t) { return '<button class="slot" type="button" data-tijd="' + t + '">' + t + '</button>'; }).join('') + '</div><p class="voet" style="padding:.4rem 0 0">Duur: ' + m.product.duur + ' minuten.</p>';
    }).catch(function (e) { var h = scherm.querySelector('[data-slots]'); if (h) h.innerHTML = '<div class="melding fout">' + esc(e.message) + '</div>'; });
  }

  /* kaarten */
  function schermKaarten() {
    var kaarten = info.producten.filter(function (p) { return p.soort === 'kaart' && p.prijs > 0; });
    var abos = abonnementen();
    var heb = function (id) { return mij && (mij.abonnementen || []).some(function (a) { return a.productId === id && a.actief; }); };
    var html = '<section class="scherm">' + kopje('Kaarten en abonnementen', 'cadeau', 'Vaker komen, minder betalen', 'Je credits staan meteen na betaling in de app.') +
      '<h2 class="groep-titel">Rittenkaarten</h2><div class="tegels">' + kaarten.map(function (p) {
        return '<div class="kaart"><div class="binnen"><span class="knopje">' + ic(p.lesgroep === 'prive' ? 'hart' : 'yoga') + '</span><h3>' + esc(p.naam) + '</h3><p>' + esc(p.omschrijving || '') + '</p><span class="prijs">' + euro(p.prijs) + ' <small>' + esc(p.credits + ' credits · ' + p.geldigMaanden + ' mnd geldig') + '</small></span><button class="knop knop-merk" type="button" data-koop="' + esc(p.id) + '">Koop deze kaart</button></div></div>';
      }).join('') + '</div>';
    if (abos.length) {
      html += '<h2 class="groep-titel">Abonnementen</h2><p class="groep-tekst">Vaste massages per maand. Maandelijks opzegbaar.</p><div class="tegels">' + abos.map(function (p) {
        return '<div class="kaart"><div class="binnen"><span class="knopje">' + ic('handen') + '</span><h3>' + esc(p.naam) + '</h3><p>' + esc(p.omschrijving || '') + '</p>' +
          '<span class="prijs">' + euro(p.prijs) + ' <small>per maand</small></span>' +
          '<ul class="punten"><li>' + ic('check') + esc(aboCredits(p)) + '</li><li>' + ic('check') + 'Maandelijks opzegbaar</li></ul>' +
          (heb(p.id) ? '<span class="badge groen">' + ic('check') + 'Dit abonnement heb je al</span>' : '<button class="knop knop-merk" type="button" data-koop="' + esc(p.id) + '">Neem dit abonnement</button>') + '</div></div>';
      }).join('') + '</div>';
    }
    if (links().length) {
      html += '<h2 class="groep-titel">Online</h2><div class="tegels">' + links().map(linkKaart).join('') + '</div>';
    }
    html += voet() + '</section>';
    toon(html);
  }
  function linkKaart(l) {
    return '<div class="kaart"><div class="binnen"><span class="knopje">' + ic('scherm') + '</span><h3>' + esc(l.naam) + '</h3><p>' + esc(l.omschrijving || '') + '</p>' +
      (l.prijs ? '<span class="prijs">' + euro(l.prijs) + ' <small>' + esc(l.per || '') + '</small></span>' : '') +
      '<a class="knop knop-rand" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.knop || 'Bekijk') + ' ' + ic('pijl') + '<span class="sr-only"> (opent in een nieuw venster)</span></a></div></div>';
  }
  function paneelKoop(id) {
    var p = info.producten.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var abo = p.soort === 'abonnement';
    var html = '<div class="paneel-kop"><div><span class="eyebrow">' + ic(abo ? 'handen' : 'cadeau') + (abo ? 'Abonnement' : 'Rittenkaart') + '</span><h2>' + esc(p.naam) + '</h2><p>' + esc(abo ? euro(p.prijs) + ' per maand: ' + aboCredits(p) + '. Maandelijks opzegbaar.' : p.credits + ' credits, ' + p.geldigMaanden + ' maanden geldig.') + '</p></div><button class="sluitknop" type="button" data-sluit aria-label="Sluiten">' + ic('sluit') + '</button></div>' +
      '<form class="formulier" data-form="koop" novalidate>' + (mij ? '' : gegevensVelden()) + codeVeld('') +
      '<div data-samenvat></div><div class="fout" data-fout hidden role="alert"></div>' +
      '<button class="knop knop-merk knop-breed" type="submit">' + (info.online ? 'Naar betalen' : 'Bestel en ontvang een betaalverzoek') + ' ' + ic('pijl') + '</button>' +
      (abo ? '<p class="voet" style="padding:.2rem 0 0">Elke maand krijg je een nieuwe factuur. Na betaling staan je credits klaar. Opzeggen doe je zelf in de app, onder Mijn.</p>' : '') + '</form>';
    var pan = openPaneel(html);
    var form = pan.querySelector('form');
    form._ctx = { soort: 'koop', productId: p.id };
    form._samenvat = function (code) { return samenvatHtml([[abo ? 'Eerste maand' : p.naam, euro(p.prijs)]], p.prijs, code, 'Te betalen'); };
    werkSamenvatBij(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target; var data = formData(f); data.productId = p.id;
      if (!mij && !controleerGegevens(f, data)) return;
      verstuur(f, 'koop', data, function (j) { sluitPaneel(); if (j.klantToken) zetToken(j.klantToken); laadMij().then(function () { bevestiging(abo ? 'Je abonnement is afgesloten' : 'Je bestelling is binnen', j.bericht, null); }); });
    });
  }

  /* retraites */
  function retraiteBeeld(r) { return '../assets/img/retraite-' + esc(String(r.id).split('-')[1] || '') + '-800.webp'; }
  function retraitePlekken(r) {
    if (r.vrij == null) return '';
    return '<span class="plekken-label' + (r.vrij <= 3 ? ' weinig' : '') + '">' + (r.vrij > 0 ? 'Nog ' + r.vrij + ' ' + (r.vrij === 1 ? 'plek' : 'plekken') + ' vrij' : 'Vol') + '</span>';
  }
  function schermRetraites(id) {
    var lijst = retraites();
    if (id) {
      var r = lijst.filter(function (x) { return x.id === id; })[0];
      if (r) return schermRetraiteForm(r);
      melding = { soort: 'info', tekst: 'Deze retraite staat niet (meer) open. Hieronder zie je wat er wel is.' };
    }
    var html = '<section class="scherm">' + kopje('Retraites', 'zon', 'Een week voor jezelf', 'Zeven dagen in de bergen boven Málaga, samen met Juniska. Yoga, massage, goed eten en tijd om bij te komen.');
    if (!lijst.length) html += '<p class="leeg">Er staan nu geen retraites gepland. App Juniska als je op de hoogte wilt blijven.</p>';
    html += lijst.map(function (r) {
      var vol = r.vrij === 0;
      return '<article class="kaart retraite"><div class="binnen"><div class="beeld"><img src="' + retraiteBeeld(r) + '" data-terugval="../assets/img/malaga-villa-600.webp" alt="" width="800" height="600" loading="lazy">' + retraitePlekken(r) + '</div>' +
        '<div class="tekst"><span class="eyebrow">' + ic('kalender') + esc(periodeTekst(r.van, r.tot)) + '</span><h2>' + esc(r.naam) + '</h2>' +
        '<p class="waar">' + ic('pin') + '<span>' + esc(r.locatie || '') + '</span></p>' +
        '<p>' + esc(r.omschrijving || '') + '</p>' +
        '<span class="prijs">vanaf ' + euro(r.prijs) + ' <small>p.p.</small></span>' +
        (vol ? '<p class="melding info">Deze retraite is vol. App Juniska, dan zet zij je op de wachtlijst.</p><a class="knop knop-rand" href="' + WA + '">' + ic('whatsapp') + 'App Juniska</a>' : '<a class="knop knop-merk" href="#retraites/' + esc(r.id) + '">Meld je aan ' + ic('pijl') + '</a>') +
        '</div></div></article>';
    }).join('');
    html += '<div class="kaart vlak"><div class="binnen"><h3>Eerst even overleggen?</h3><p>Juniska vertelt je graag meer over het programma, de kamers en de reis.</p><div class="rij">' + contactKnoppen() + '</div></div></div>' + voet() + '</section>';
    toon(html);
  }
  var KAMERS = ['Gedeelde tweepersoonskamer (aparte bedden)', 'Samen met mijn reisgenoot', 'Eenpersoonskamer (prijs op aanvraag)'];
  function schermRetraiteForm(r) {
    var max = Math.max(1, Math.min(6, r.vrij == null ? 6 : r.vrij));
    if (r.vrij === 0) { melding = { soort: 'info', tekst: 'De ' + r.naam + ' is vol. App Juniska, dan zet zij je op de wachtlijst.' }; location.hash = '#retraites'; return; }
    var html = '<section class="scherm"><a class="knop knop-tekst terug" href="#retraites">' + ic('links') + 'Alle retraites</a>' +
      kopje('Aanmelden retraite', 'zon', r.naam, periodeTekst(r.van, r.tot) + ' · ' + (r.locatie || '')) +
      '<div class="kaart"><div class="binnen"><form class="formulier" data-form="retraite" novalidate><input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
      '<div class="veld"><span class="label" id="personen-label">Met hoeveel personen kom je?</span><div class="stepper" role="group" aria-labelledby="personen-label">' +
      '<button type="button" data-stepper="-1" aria-label="Eén persoon minder" disabled>−</button><output data-personen-tekst aria-live="polite">1 persoon</output><button type="button" data-stepper="1" aria-label="Eén persoon meer"' + (max <= 1 ? ' disabled' : '') + '>+</button>' +
      '<input type="hidden" name="personen" value="1" data-max="' + max + '"></div>' + (r.vrij != null ? '<small>Er ' + (r.vrij === 1 ? 'is nog 1 plek' : 'zijn nog ' + r.vrij + ' plekken') + ' vrij.</small>' : '') + '</div>' +
      '<fieldset class="veld"><legend>Kamer</legend><div class="keuzes">' + KAMERS.map(function (k, i) {
        return '<label><input type="radio" name="kamer" value="' + esc(k) + '"' + (i === 0 ? ' checked' : '') + '><span class="vak"><b>' + esc(k.replace(/ \(.*\)$/, '')) + '</b><small>' + esc(i === 0 ? 'Aparte bedden, de prijs vanaf ' + euro(r.prijs) + ' p.p.' : i === 1 ? 'Je deelt de kamer met wie je meeneemt' : 'Prijs op aanvraag, Juniska laat het je weten') + '</small></span></label>';
      }).join('') + '</div></fieldset>' +
      '<div class="veld" data-medereizigers hidden><label for="mede">Naam van je medereiziger(s)</label><input id="mede" name="medereizigers" maxlength="200" autocomplete="off"><small>Zo weet Juniska met wie je komt.</small></div>' +
      '<div class="veld"><label for="opm">Wil je Juniska iets laten weten? <small>(niet verplicht)</small></label><textarea id="opm" name="opmerking" maxlength="300" placeholder="Bijvoorbeeld een dieetwens of blessure"></textarea></div>' +
      codeVeld('') + (mij ? '' : gegevensVelden()) +
      '<div data-samenvat></div><div class="fout" data-fout hidden role="alert"></div>' +
      '<button class="knop knop-merk knop-breed" type="submit">Meld je aan ' + ic('pijl') + '</button>' +
      '<p class="voet" style="padding:.2rem 0 0">Je betaalt nu nog niets. Annuleren of wijzigen gaat via Juniska, bel of app haar gerust.</p></form></div></div>' + voet() + '</section>';
    toon(html);
    var form = scherm.querySelector('form');
    form._ctx = { soort: 'retraite', productId: r.id };
    form._samenvat = function (code) {
      var n = Number(form.querySelector('[name="personen"]').value) || 1;
      var kamer = (form.querySelector('[name="kamer"]:checked') || {}).value || KAMERS[0];
      var regels = [['Retraite', r.naam], ['Personen', n + ' × ' + euro(r.prijs)], ['Kamer', kamer.replace(/ \(.*\)$/, '')]];
      return samenvatHtml(regels, r.prijs * n, code, 'Indicatieprijs', (kamer === KAMERS[2] ? 'Voor een eenpersoonskamer geldt een toeslag; die hoor je van Juniska. ' : '') + 'Juniska bevestigt je plek en stuurt daarna de factuur.');
    };
    werkSamenvatBij(form);
    form.addEventListener('change', function (e) { if (e.target.name === 'kamer') werkSamenvatBij(form); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target; var data = formData(f);
      data.soort = 'retraite'; data.productId = r.id; data.personen = Number(data.personen) || 1;
      if (data.personen < 2) delete data.medereizigers;
      if (!mij && !controleerGegevens(f, data)) return;
      verstuur(f, 'boek', data, function (j) {
        if (j.klantToken) zetToken(j.klantToken);
        laadMij().then(function () { bevestiging('Je aanmelding is binnen', j.bericht, j.boeking, '<div class="rij" style="justify-content:center">' + contactKnoppen() + '</div>'); });
      });
    });
  }
  function stepper(knop) {
    var f = knop.closest('form'); var inp = f.querySelector('[name="personen"]');
    var max = Number(inp.dataset.max) || 6;
    var n = Math.max(1, Math.min(max, (Number(inp.value) || 1) + Number(knop.dataset.stepper)));
    inp.value = n;
    f.querySelector('[data-personen-tekst]').textContent = n + ' ' + (n === 1 ? 'persoon' : 'personen');
    f.querySelector('[data-stepper="-1"]').disabled = n <= 1;
    f.querySelector('[data-stepper="1"]').disabled = n >= max;
    f.querySelector('[data-medereizigers]').hidden = n < 2;
    veldFout(f, 'personen', '');
    werkSamenvatBij(f);
  }

  /* mij */
  function schermMij() {
    if (!token) { location.hash = '#inloggen'; return; }
    scherm.innerHTML = '<section class="scherm"><p class="laden">Je gegevens laden...</p></section>';
    laadMij().then(function (j) {
      if (!j) { location.hash = '#inloggen'; return; }
      var v = j.vandaag || vandaag();
      var komend = j.boekingen.filter(function (b) { return eindDatum(b) >= v && b.status !== 'geannuleerd'; }).sort(function (a, b) { return (a.datum + a.tijd).localeCompare(b.datum + b.tijd); });
      var eerder = j.boekingen.filter(function (b) { return eindDatum(b) < v || b.status === 'geannuleerd'; }).slice(0, 10);
      var abos = j.abonnementen || []; var wacht = j.wachtlijst || [];
      var open = j.facturen.filter(function (f) { return f.status === 'open'; });
      var html = '<section class="scherm">' + kopje('Mijn Cura Thai', 'hart', 'Hoi ' + voornaam(j.klant.naam), j.klant.email) +
        '<h2>Komende afspraken</h2>' + (komend.length ? komend.map(afspraakHtml).join('') : '<p class="leeg">Nog niets gepland. <a href="#lessen" style="color:var(--merk);font-weight:700">Kies een les</a> of <a href="#massage" style="color:var(--merk);font-weight:700">plan een massage</a>.</p>') +
        '<h2>Je credits</h2>' + (j.credits.length ? j.credits.map(function (c) { return '<div class="credit"><span class="knopje klein">' + ic(c.lesgroep ? 'yoga' : 'handen') + '</span><b>' + esc(c.omschrijving) + '</b><span class="tel">' + c.resterend + '<small>van ' + c.totaal + '</small></span><small>' + (c.geldigTot ? 'Geldig tot ' + esc(datumTekst(c.geldigTot, true)) : 'Onbeperkt geldig') + '</small></div>'; }).join('') : '<p class="leeg">Geen credits. <a href="#kaarten" style="color:var(--merk);font-weight:700">Bekijk de kaarten en abonnementen</a>.</p>') +
        (abos.length ? '<h2>Abonnement</h2>' + abos.map(function (a) {
          return '<div class="abo"><span class="knopje klein">' + ic('handen') + '</span><b>' + esc(a.naam) + '</b>' +
            (a.actief ? '<button class="knop knop-tekst knop-klein" type="button" data-opzeggen="' + esc(a.id) + '">Opzeggen</button>' : '<span class="badge grijs">Opgezegd</span>') +
            '<small>' + esc(a.actief ? euro(a.prijs) + ' per maand · volgende factuur ' + datumTekst(a.volgende, true) : 'Loopt tot en met ' + datumTekst(a.eindigtOp, true)) + '</small></div>';
        }).join('') : '') +
        (wacht.length ? '<h2>Wachtlijst</h2>' + wacht.map(function (w) {
          return '<div class="abo"><span class="knopje klein">' + ic('klok') + '</span><b>' + esc(w.activiteit) + '</b><button class="knop knop-tekst knop-klein" type="button" data-wacht-af="' + esc(w.sessieKey) + '">Van de wachtlijst af</button>' +
            '<small>' + esc(datumTekst(w.datum) + ' om ' + w.tijd + ' · ' + w.locatie) + (w.gemeld ? ' · <a href="#lessen" style="color:var(--merk);font-weight:700">Er is een plek vrij, meld je snel aan</a>' : '') + '</small></div>';
        }).join('') : '') +
        '<h2>Facturen</h2>' + (j.facturen.length ? j.facturen.map(function (f) {
          var st = { open: 'Nog te betalen', betaald: 'Betaald', vervallen: 'Vervallen' }[f.status] || f.status;
          return '<div class="factuur' + (f.status === 'vervallen' ? ' vervallen' : '') + '"><b>' + esc(f.omschrijving) + '</b><div class="acties">' + (f.status === 'open' && info.online ? '<a class="knop knop-merk knop-klein" href="../api/app/betaal/' + esc(f.id) + '">Betaal</a>' : '') + '<a class="knop knop-rand knop-klein" href="../api/app/factuur/' + esc(f.id) + '.pdf?k=' + encodeURIComponent(token) + '" target="_blank" rel="noopener">PDF</a></div><small>' + esc(f.id + ' · ' + (/^\d{4}-\d\d-\d\d$/.test(f.datum) ? datumLang(f.datum) : f.datum) + ' · ' + euro(f.totaal) + ' · ' + st) + '</small></div>';
        }).join('') : '<p class="leeg">Nog geen facturen.</p>') +
        (eerder.length ? '<h2>Eerder</h2>' + eerder.map(afspraakHtml).join('') : '') +
        '<div class="rij" style="justify-content:center;margin-top:.5rem"><a class="knop knop-rand" href="https://wa.me/31629129753">' + ic('whatsapp') + 'App Juniska</a><button class="knop knop-tekst" type="button" data-uitloggen>Uitloggen</button></div>' + voet() + '</section>';
      if (open.length && !info.online && melding && melding.betaald) melding = null;
      toon(html);
    });
  }
  function eindDatum(b) { return b.soort === 'retraite' && b.tot ? b.tot : b.datum; }
  function betaalNoot(b) {
    var n = [];
    if (b.betaalwijze === 'credit') n.push('met credit');
    else if (b.betaalwijze === 'proefles') n.push('gratis proefles');
    else if (b.betaalwijze === 'cadeaubon') n.push('Betaald met cadeaubon');
    return n;
  }
  function retraiteHtml(b) {
    var voorbij = eindDatum(b) < vandaag() || b.status === 'geannuleerd';
    var wat = [b.personen + ' ' + (b.personen === 1 ? 'persoon' : 'personen')];
    if (b.kamer) wat.push(String(b.kamer).replace(/ \(.*\)$/, ''));
    var noot = betaalNoot(b);
    if (b.tegoedTerug) noot.push('Het tegoed staat weer op je cadeaubon');
    return '<article class="afspraak' + (voorbij ? ' voorbij' : '') + '"><div class="tussen"><span class="wanneer">' + esc(periodeTekst(b.datum, b.tot)) + '</span>' + badge(b) + '</div>' +
      '<span class="wat">' + esc(b.productNaam) + '</span><span class="waar">' + esc(wat.join(' · ') + (b.locatie ? ' · ' + b.locatie : '')) + '</span>' +
      (noot.length ? '<span class="waar">' + esc(noot.join(' · ')) + '</span>' : '') +
      (!voorbij ? '<div class="rij" style="margin-top:.3rem">' + (b.status === 'wacht_op_betaling' && b.factuurId && info.online ? '<a class="knop knop-merk knop-klein" href="../api/app/betaal/' + esc(b.factuurId) + '">Betaal nu</a>' : '') + contactKnoppen() + '</div>' : '') + '</article>';
  }
  function afspraakHtml(b) {
    if (b.soort === 'retraite') return retraiteHtml(b);
    var les = b.soort === 'les'; var voorbij = b.datum < vandaag() || b.status === 'geannuleerd';
    var uren = urenTot(b.datum, b.tijd);
    var grens = les ? ((info.lessen && info.lessen.annulerenUren) || 2) : b.annulerenUren;
    var kan = !voorbij && ['bevestigd', 'aangevraagd', 'wacht_op_betaling'].indexOf(b.status) >= 0;
    var actie = '';
    if (kan) {
      if (b.status === 'wacht_op_betaling' && b.factuurId && info.online) actie += '<a class="knop knop-merk knop-klein" href="../api/app/betaal/' + esc(b.factuurId) + '">Betaal nu</a>';
      if (grens == null && !les) actie += '<a class="knop knop-rand knop-klein" href="https://wa.me/31629129753">' + ic('whatsapp') + 'Verzetten? App Juniska</a>';
      else if (uren >= grens) actie += '<button class="knop knop-tekst knop-klein" type="button" data-annuleer="' + esc(b.id) + '">' + (les ? 'Afmelden' : 'Annuleren') + '</button>';
      else actie += '<a class="knop knop-rand knop-klein" href="tel:+31629129753">' + ic('telefoon') + 'Verhinderd? Bel Juniska</a>';
    }
    return '<article class="afspraak' + (voorbij ? ' voorbij' : '') + '"><div class="tussen"><span class="wanneer">' + esc(datumTekst(b.datum)) + ' om ' + esc(b.tijd) + '</span>' + badge(b) + '</div><span class="wat">' + esc(les ? b.activiteit : b.productNaam) + '</span><span class="waar">' + esc(les ? b.locatie + ' · ' + b.adres : (info.massages && info.massages.locatie) || '') + (betaalNoot(b).length ? ' · ' + betaalNoot(b).join(' · ') : '') + '</span>' + (b.tegoedTerug ? '<span class="waar">Het tegoed staat weer op je cadeaubon.</span>' : '') + (actie ? '<div class="rij" style="margin-top:.3rem">' + actie + '</div>' : '') + '</article>';
  }
  function annuleer(b) {
    var les = b.soort === 'les';
    var html = '<div class="paneel-kop"><div><h2>' + (les ? 'Afmelden voor deze les?' : 'Afspraak annuleren?') + '</h2><p>' + esc((les ? b.activiteit : b.productNaam) + ', ' + datumTekst(b.datum) + ' om ' + b.tijd) + '</p></div><button class="sluitknop" type="button" data-sluit aria-label="Sluiten">' + ic('sluit') + '</button></div>' +
      '<p>' + (b.betaalwijze === 'credit' ? 'Je credit komt terug op je kaart.' : b.betaalwijze === 'proefles' ? 'Je gratis proefles blijft beschikbaar voor een andere keer.' : 'Juniska krijgt hiervan bericht.') + '</p><div class="fout" data-fout hidden role="alert"></div>' +
      '<div class="knoprij twee"><button class="knop knop-merk" type="button" data-bevestig-annuleer="' + esc(b.id) + '">Ja, ' + (les ? 'meld me af' : 'annuleer') + '</button><button class="knop knop-rand" type="button" data-sluit>Nee, laat staan</button></div>';
    openPaneel(html);
  }

  /* wachtlijst */
  function paneelWachtlijst(key) {
    var s = (sessies || []).filter(function (x) { return x.key === key; })[0];
    if (!s) return;
    var html = '<div class="paneel-kop"><div><span class="eyebrow">' + ic('klok') + 'Wachtlijst</span><h2>' + esc(s.activiteit) + '</h2><p>' + esc(datumTekst(s.datum) + ' om ' + s.tijd + ' · ' + s.locatie) + '</p></div><button class="sluitknop" type="button" data-sluit aria-label="Sluiten">' + ic('sluit') + '</button></div>' +
      '<form class="formulier" data-form="wachtlijst" novalidate><input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
      '<p>Deze les is vol. Komt er een plek vrij, dan krijg je meteen een mail. Wie dan het eerst reageert, heeft de plek.</p>' +
      (s.wachtlijst > 0 ? '<p class="melding info">' + esc(s.wachtlijst === 1 ? 'Er staat al 1 persoon op de wachtlijst.' : 'Er staan al ' + s.wachtlijst + ' mensen op de wachtlijst.') + '</p>' : '') +
      (mij ? '' : gegevensVelden()) +
      '<div class="fout" data-fout hidden role="alert"></div><button class="knop knop-merk knop-breed" type="submit">Zet me op de wachtlijst ' + ic('pijl') + '</button></form>';
    var p = openPaneel(html);
    p.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target; var data = formData(f); data.sessieKey = key;
      if (!mij && !controleerGegevens(f, data)) return;
      verstuur(f, 'wachtlijst', data, function (j) {
        sluitPaneel();
        if (j.klantToken) zetToken(j.klantToken);
        melding = { soort: 'goed', tekst: j.bericht || 'Je staat op de wachtlijst.' };
        laadMij().then(function () { sessies = null; schermLessen(); });
      });
    });
  }
  function vanWachtlijstAf(key, knop) {
    knop.disabled = true;
    api('wachtlijst/af', { sessieKey: key }).then(function (j) {
      melding = { soort: 'goed', tekst: j.bericht || 'Je staat niet meer op de wachtlijst.' };
      if ((location.hash || '').indexOf('#lessen') === 0) { sessies = null; schermLessen(); } else schermMij();
    }).catch(function (err) { knop.disabled = false; melding = { soort: 'fout', tekst: err.message }; if ((location.hash || '').indexOf('#lessen') === 0) tekenLessen(); else schermMij(); });
  }

  /* abonnement opzeggen */
  function paneelOpzeggen(id) {
    var a = mij && (mij.abonnementen || []).filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    var tot = a.volgende ? plusDagen(a.volgende, -1) : '';
    var html = '<div class="paneel-kop"><div><h2>Abonnement opzeggen?</h2><p>' + esc(a.naam) + '</p></div><button class="sluitknop" type="button" data-sluit aria-label="Sluiten">' + ic('sluit') + '</button></div>' +
      '<p>' + esc((tot ? 'Je lopende maand loopt gewoon door tot en met ' + datumTekst(tot, true) + '. ' : '') + 'Daarna krijg je geen nieuwe factuur meer. Je credits blijven geldig tot hun vervaldatum.') + '</p>' +
      '<div class="fout" data-fout hidden role="alert"></div>' +
      '<div class="knoprij twee"><button class="knop knop-merk" type="button" data-bevestig-opzeggen="' + esc(a.id) + '">Ja, zeg op</button><button class="knop knop-rand" type="button" data-sluit>Nee, laat lopen</button></div>';
    openPaneel(html);
  }

  /* inloggen */
  function schermInloggen() {
    toon('<section class="scherm">' + kopje('Inloggen', 'mail', 'Je inloglink', 'Vul je e-mailadres in. Je krijgt een link waarmee je meteen in je eigen Cura Thai app zit, zonder wachtwoord.') +
      '<div class="kaart"><div class="binnen"><form class="formulier" data-form="login" novalidate><div class="veld"><label for="lemail">E-mailadres</label><input id="lemail" name="email" type="email" autocomplete="email" inputmode="email" required></div><div class="fout" data-fout hidden role="alert"></div><button class="knop knop-merk knop-breed" type="submit">Stuur mijn inloglink ' + ic('pijl') + '</button></form></div></div>' +
      '<div class="kaart vlak"><div class="binnen"><h3>Nog nooit geboekt?</h3><p>Je account ontstaat vanzelf bij je eerste boeking.</p><div class="knoprij twee"><a class="knop knop-rand" href="#lessen">Les boeken</a><a class="knop knop-rand" href="#massage">Massage boeken</a></div></div></div>' + voet() + '</section>');
    scherm.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target; var d = formData(f);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) { veldFout(f, 'email', 'Vul een geldig e-mailadres in.'); return; }
      veldFout(f, 'email', '');
      verstuur(f, 'login', { email: d.email }, function (j) { f.innerHTML = '<div class="melding ' + (j.verzonden ? 'goed' : 'info') + '" role="status">' + esc(j.bericht) + '</div>'; });
    });
  }

  /* ---------- paneel ---------- */
  function openPaneel(html) {
    paneelHouder.innerHTML = '<div class="paneel-achter" data-achter><div class="paneel" role="dialog" aria-modal="true"><div class="greep" aria-hidden="true"></div>' + html + '</div></div>';
    document.body.style.overflow = 'hidden';
    var eerste = paneelHouder.querySelector('input:not([type=hidden]):not([type=radio]), button[type=submit]'); if (eerste) setTimeout(function () { eerste.focus(); }, 50);
    return paneelHouder.querySelector('.paneel');
  }
  function sluitPaneel() { paneelHouder.innerHTML = ''; document.body.style.overflow = ''; }

  /* ---------- klikken ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-sluit],[data-achter],[data-aanmelden],[data-afmelden],[data-filter],[data-product],[data-datum],[data-tijd],[data-maand],[data-stap],[data-koop],[data-annuleer],[data-bevestig-annuleer],[data-uitloggen],[data-tip-sluit],[data-wacht],[data-wacht-af],[data-opzeggen],[data-bevestig-opzeggen],[data-code-toepassen],[data-stepper]');
    if (!t) return;
    if (t.hasAttribute('data-achter') && e.target !== t) return;
    if (t.hasAttribute('data-sluit') || t.hasAttribute('data-achter')) return sluitPaneel();
    if (t.dataset.aanmelden) return paneelAanmelden(t.dataset.aanmelden);
    if (t.dataset.afmelden) return afmelden(t.dataset.afmelden);
    if (t.dataset.filter) { lesFilter[t.dataset.filter] = lesFilter[t.dataset.filter] === t.dataset.waarde ? '' : t.dataset.waarde; if (t.dataset.filter === 'activiteit' && !t.dataset.waarde) lesFilter.locatie = ''; return tekenLessen(); }
    if (t.dataset.product) { massage.product = info.producten.filter(function (p) { return p.id === t.dataset.product; })[0]; massage.datum = massage.tijd = null; return schermMassage(); }
    if (t.dataset.datum) { massage.datum = t.dataset.datum; massage.tijd = null; return schermMassage(); }
    if (t.dataset.tijd) { massage.tijd = t.dataset.tijd; return schermMassage(); }
    if (t.dataset.maand) { var p = massage.maand.split('-').map(Number); var d = new Date(p[0], p[1] - 1 + Number(t.dataset.maand), 1); massage.maand = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); return tekenKalender(); }
    if (t.dataset.stap) { var s = Number(t.dataset.stap); if (s <= 1) massage.product = null; if (s <= 2) massage.datum = null; if (s <= 3) massage.tijd = null; return schermMassage(); }
    if (t.dataset.koop) return paneelKoop(t.dataset.koop);
    if (t.dataset.annuleer) { var b = mij && mij.boekingen.filter(function (x) { return x.id === t.dataset.annuleer; })[0]; if (b) annuleer(b); return; }
    if (t.dataset.bevestigAnnuleer) {
      t.disabled = true;
      api('annuleer', { boekingId: t.dataset.bevestigAnnuleer }).then(function () { sluitPaneel(); melding = { soort: 'goed', tekst: 'Geregeld. Je afspraak is geannuleerd.' }; if (location.hash === '#lessen') { sessies = null; schermLessen(); } else schermMij(); })
        .catch(function (err) { t.disabled = false; var f = paneelHouder.querySelector('[data-fout]'); if (f) { f.textContent = err.message; f.hidden = false; } });
      return;
    }
    if (t.dataset.wacht) return paneelWachtlijst(t.dataset.wacht);
    if (t.dataset.wachtAf) return vanWachtlijstAf(t.dataset.wachtAf, t);
    if (t.dataset.opzeggen) return paneelOpzeggen(t.dataset.opzeggen);
    if (t.dataset.bevestigOpzeggen) {
      t.disabled = true;
      api('abonnement/opzeggen', { abonnementId: t.dataset.bevestigOpzeggen }).then(function (j) { sluitPaneel(); melding = { soort: 'goed', tekst: j.bericht || 'Je abonnement is opgezegd.' }; schermMij(); })
        .catch(function (err) { t.disabled = false; var f = paneelHouder.querySelector('[data-fout]'); if (f) { f.textContent = err.message; f.hidden = false; } });
      return;
    }
    if (t.hasAttribute('data-code-toepassen')) return codeToepassen(t.closest('form'));
    if (t.dataset.stepper) return stepper(t);
    if (t.hasAttribute('data-uitloggen')) { zetToken(''); mij = null; melding = { soort: 'info', tekst: 'Je bent uitgelogd. Tot de volgende keer!' }; location.hash = '#home'; return; }
    if (t.hasAttribute('data-tip-sluit')) { try { localStorage.setItem('ct_tip', '1'); } catch (x) {} document.querySelector('[data-tip]').innerHTML = ''; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && paneelHouder.firstChild) sluitPaneel();
    if (e.key === 'Enter' && e.target.name === 'kortingscode' && e.target.form) { e.preventDefault(); codeToepassen(e.target.form); }
  });
  document.addEventListener('input', function (e) { if (e.target.name === 'kortingscode' && e.target.form) codeGewijzigd(e.target.form); });
  /* foto bestaat (nog) niet: terugvallen op een vaste foto, zonder inline onerror (CSP) */
  document.addEventListener('error', function (e) { var img = e.target; if (img && img.tagName === 'IMG' && img.dataset.terugval && img.getAttribute('src') !== img.dataset.terugval) img.src = img.dataset.terugval; }, true);

  /* ---------- routing ---------- */
  var routes = { home: schermHome, lessen: schermLessen, massage: schermMassage, kaarten: schermKaarten, retraites: schermRetraites, mij: schermMij, inloggen: schermInloggen };
  var laatsteHash = null;
  function route() {
    if (location.hash === laatsteHash) return; /* dubbele hashchange na een redirect niet twee keer tekenen */
    laatsteHash = location.hash;
    var delen_ = (location.hash || '#home').slice(1).split('?')[0].split('/');
    var naam = delen_[0]; var arg = delen_.slice(1).join('/') ? decodeURIComponent(delen_.slice(1).join('/')) : '';
    if (!routes[naam]) { naam = 'home'; arg = ''; }
    sluitPaneel();
    document.querySelectorAll('[data-tab]').forEach(function (a) { var actief = a.dataset.tab === naam || ((naam === 'kaarten' || naam === 'retraites') && a.dataset.tab === 'home') || (naam === 'inloggen' && a.dataset.tab === 'mij'); if (actief) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    routes[naam](arg);
  }
  window.addEventListener('hashchange', route);

  /* ---------- start ---------- */
  var url = new URL(location.href); var verander = false;
  if (url.searchParams.get('k')) { zetToken(url.searchParams.get('k')); url.searchParams.delete('k'); verander = true; if (!location.hash) location.hash = '#mij'; }
  var betaald = url.searchParams.get('betaald');
  if (betaald) { url.searchParams.delete('betaald'); verander = true; melding = { soort: 'goed', betaald: true, tekst: 'Betaling ontvangen, dankjewel! Je bevestiging komt per mail.' }; location.hash = '#mij'; }
  if (verander) history.replaceState(null, '', url.pathname + url.search + location.hash);

  api('info').then(function (j) { info = j; return laadMij(); }).then(function () { route(); iosTip(); })
    .catch(function () { terugval(); });

  /* Geen backend bereikbaar (statische hosting of storing): één nette melding, geen app. */
  function terugval() {
    var tabs = document.querySelector('[data-tabs]'); if (tabs) tabs.hidden = true;
    var acc = document.querySelector('[data-account]'); if (acc) acc.hidden = true;
    document.body.style.paddingBottom = '0';
    scherm.innerHTML = '<section class="scherm"><div class="kaart"><div class="binnen bevestiging"><span class="knopje">' + ic('bloem') + '</span>' +
      '<h1>Online boeken staat hier nog niet aan</h1>' +
      '<p>Een afspraak voor een massage of les maak je nu gewoon rechtstreeks met Juniska. Stuur een WhatsApp of bel even, dan plant zij een moment met je in.</p>' +
      '<div class="knoprij twee" style="width:100%"><a class="knop knop-merk" href="https://wa.me/31629129753">' + ic('whatsapp') + 'Stuur een WhatsApp</a><a class="knop knop-rand" href="tel:+31629129753">' + ic('telefoon') + 'Bel 06 29129753</a></div>' +
      '<a class="knop knop-tekst" href="../">Terug naar de website</a></div></div>' + voet() + '</section>';
  }

  function iosTip() {
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    var standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    var gezien = false; try { gezien = !!localStorage.getItem('ct_tip'); } catch (e) {}
    if (!ios || standalone || gezien) return;
    document.querySelector('[data-tip]').innerHTML = '<div class="tip" role="status"><span class="knopje klein">' + ic('plus') + '</span><span><b>Zet de app op je beginscherm:</b> tik op Delen en kies "Zet op beginscherm".</span><button type="button" data-tip-sluit aria-label="Tip sluiten">' + ic('sluit') + '</button></div>';
  }
  if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
})();
