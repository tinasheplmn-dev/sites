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
  function euro(n) { n = Number(n || 0); return '€ ' + n.toFixed(2).replace('.', ',').replace(/,00$/, ''); }
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
      '<a class="tegel klein" href="#kaarten"><span class="knopje">' + ic('cadeau') + '</span><div><h2>Rittenkaart kopen</h2><span>Voordeliger per les ' + ic('pijl') + '</span></div></a>';
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
      else if (s.vol) actie = '<button class="knop knop-rand knop-klein" type="button" disabled>Vol</button>';
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
    }
    if (!mij) html += gegevensVelden();
    html += '<div class="veld"><label for="opm">Wil je Juniska iets laten weten? <small>(niet verplicht)</small></label><input id="opm" name="opmerking" maxlength="300" placeholder="Bijvoorbeeld een blessure"></div>' +
      '<div class="fout" data-fout hidden role="alert"></div><button class="knop knop-merk knop-breed" type="submit">Bevestig je aanmelding ' + ic('pijl') + '</button><p class="voet" style="padding:.2rem 0 0">Afmelden kan tot ' + esc((info.lessen && info.lessen.annulerenUren) || 2) + ' uur voor de les.</p></form>';
    var p = openPaneel(html);
    p.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target; var data = formData(f);
      if (data.betaalwijze === 'kopen') { var r = f.querySelector('input[name="betaalwijze"]:checked'); data.kaartId = r ? r.dataset.kaart : ''; }
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
      if (e.veld === 'proefles') { var r = f.querySelector('input[value="proefles"]'); if (r) { r.closest('label').remove(); var eerste = f.querySelector('input[name="betaalwijze"]'); if (eerste) eerste.checked = true; } }
      if (!veldFout(f, e.veld, e.message) && fout) { fout.textContent = e.message; fout.hidden = false; fout.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
  }
  function bevestiging(titel, tekst, b) {
    toon('<section class="scherm"><div class="kaart"><div class="binnen bevestiging"><span class="knopje">' + ic('check') + '</span><h1>' + esc(titel) + '</h1>' + (b ? '<p><b>' + esc(b.soort === 'les' ? b.activiteit : b.productNaam) + '</b><br>' + esc(datumTekst(b.datum, true)) + ' om ' + esc(b.tijd) + '</p>' : '') + '<p>' + esc(tekst) + '</p><a class="knop knop-merk" href="#mij">Bekijk je afspraken</a><a class="knop knop-tekst" href="#home">Terug naar het begin</a></div></div>' + voet() + '</section>');
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
          '<div class="veld"><label for="code">Kortingscode <small>(niet verplicht)</small></label><input id="code" name="kortingscode" autocomplete="off" autocapitalize="none" value="' + esc(m.code) + '">' + (korting ? '<small>' + esc(korting.code) + ': ' + esc(euro(korting.bedrag)) + ' korting' + (korting.alleenNieuw ? ' op je eerste massage' : '') + (korting.productIds ? ' van 90 minuten' : '') + '.</small>' : '') + '</div>') +
        '<div class="veld"><label for="opm">Klachten of wensen <small>(niet verplicht)</small></label><textarea id="opm" name="opmerking" maxlength="300" placeholder="Bijvoorbeeld: last van mijn onderrug"></textarea></div>' +
        '<div class="samenvat"><div class="totaal"><span>' + (cr4 ? 'Te betalen' : info.online ? 'Je betaalt nu online' : 'Te betalen na bevestiging') + '</span><b>' + (cr4 ? '1 credit' : euro(m.product.prijs)) + '</b></div></div>' +
        '<div class="fout" data-fout hidden role="alert"></div><button class="knop knop-merk knop-breed" type="submit">' + (cr4 ? 'Bevestig je afspraak' : info.online ? 'Naar betalen' : 'Vraag je afspraak aan') + ' ' + ic('pijl') + '</button>' +
        '<p class="voet" style="padding:.2rem 0 0">' + esc(info.online ? 'Na betaling staat je afspraak vast.' : 'Juniska bevestigt je afspraak zo snel mogelijk. Daarna krijg je de factuur en een betaalverzoek.') + '</p></form>';
    }
    html += voet() + '</section>';
    toon(html);
    if (stap === 2) laadKalender();
    if (stap === 3) laadSlots();
    if (stap === 4) {
      scherm.querySelector('form').addEventListener('submit', function (e) {
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
    var html = '<section class="scherm">' + kopje('Rittenkaarten', 'cadeau', 'Vaker komen, minder per les', 'Je credits staan meteen na betaling in de app.') +
      '<div class="tegels">' + kaarten.map(function (p) {
        return '<div class="kaart"><div class="binnen"><span class="knopje">' + ic(p.lesgroep === 'prive' ? 'hart' : 'yoga') + '</span><h3>' + esc(p.naam) + '</h3><p>' + esc(p.omschrijving || '') + '</p><span class="prijs">' + euro(p.prijs) + ' <small>' + esc(p.credits + ' credits · ' + p.geldigMaanden + ' mnd geldig') + '</small></span><button class="knop knop-merk" type="button" data-koop="' + esc(p.id) + '">Koop deze kaart</button></div></div>';
      }).join('') + '</div>' + voet() + '</section>';
    toon(html);
  }
  function paneelKoop(id) {
    var p = info.producten.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var html = '<div class="paneel-kop"><div><span class="eyebrow">' + ic('cadeau') + 'Rittenkaart</span><h2>' + esc(p.naam) + '</h2><p>' + esc(p.credits + ' credits, ' + p.geldigMaanden + ' maanden geldig.') + '</p></div><button class="sluitknop" type="button" data-sluit aria-label="Sluiten">' + ic('sluit') + '</button></div>' +
      '<form class="formulier" data-form="koop" novalidate>' + (mij ? '' : gegevensVelden()) +
      '<div class="samenvat"><div class="totaal"><span>Te betalen</span><b>' + euro(p.prijs) + '</b></div></div><div class="fout" data-fout hidden role="alert"></div>' +
      '<button class="knop knop-merk knop-breed" type="submit">' + (info.online ? 'Naar betalen' : 'Bestel en ontvang een betaalverzoek') + ' ' + ic('pijl') + '</button></form>';
    var pan = openPaneel(html);
    pan.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target; var data = formData(f); data.productId = p.id;
      if (!mij && !controleerGegevens(f, data)) return;
      verstuur(f, 'koop', data, function (j) { sluitPaneel(); if (j.klantToken) zetToken(j.klantToken); laadMij().then(function () { bevestiging('Je bestelling is binnen', j.bericht, null); }); });
    });
  }

  /* mij */
  function schermMij() {
    if (!token) { location.hash = '#inloggen'; return; }
    scherm.innerHTML = '<section class="scherm"><p class="laden">Je gegevens laden...</p></section>';
    laadMij().then(function (j) {
      if (!j) { location.hash = '#inloggen'; return; }
      var v = j.vandaag || vandaag();
      var komend = j.boekingen.filter(function (b) { return b.datum >= v && b.status !== 'geannuleerd'; }).sort(function (a, b) { return (a.datum + a.tijd).localeCompare(b.datum + b.tijd); });
      var eerder = j.boekingen.filter(function (b) { return b.datum < v || b.status === 'geannuleerd'; }).slice(0, 10);
      var open = j.facturen.filter(function (f) { return f.status === 'open'; });
      var html = '<section class="scherm">' + kopje('Mijn Cura Thai', 'hart', 'Hoi ' + voornaam(j.klant.naam), j.klant.email) +
        '<h2>Komende afspraken</h2>' + (komend.length ? komend.map(afspraakHtml).join('') : '<p class="leeg">Nog niets gepland. <a href="#lessen" style="color:var(--merk);font-weight:700">Kies een les</a> of <a href="#massage" style="color:var(--merk);font-weight:700">plan een massage</a>.</p>') +
        '<h2>Je credits</h2>' + (j.credits.length ? j.credits.map(function (c) { return '<div class="credit"><span class="knopje klein">' + ic(c.lesgroep ? 'yoga' : 'handen') + '</span><b>' + esc(c.omschrijving) + '</b><span class="tel">' + c.resterend + '<small>van ' + c.totaal + '</small></span><small>' + (c.geldigTot ? 'Geldig tot ' + esc(datumTekst(c.geldigTot, true)) : 'Onbeperkt geldig') + '</small></div>'; }).join('') : '<p class="leeg">Geen credits. <a href="#kaarten" style="color:var(--merk);font-weight:700">Bekijk de rittenkaarten</a>.</p>') +
        '<h2>Facturen</h2>' + (j.facturen.length ? j.facturen.map(function (f) {
          return '<div class="factuur"><b>' + esc(f.omschrijving) + '</b><div class="acties">' + (f.status === 'open' && info.online ? '<a class="knop knop-merk knop-klein" href="../api/app/betaal/' + esc(f.id) + '">Betaal</a>' : '') + '<a class="knop knop-rand knop-klein" href="../api/app/factuur/' + esc(f.id) + '.pdf?k=' + encodeURIComponent(token) + '" target="_blank" rel="noopener">PDF</a></div><small>' + esc(f.id + ' · ' + f.datum + ' · ' + euro(f.totaal) + ' · ' + (f.status === 'open' ? 'nog te betalen' : f.status)) + '</small></div>';
        }).join('') : '<p class="leeg">Nog geen facturen.</p>') +
        (eerder.length ? '<h2>Eerder</h2>' + eerder.map(afspraakHtml).join('') : '') +
        '<div class="rij" style="justify-content:center;margin-top:.5rem"><a class="knop knop-rand" href="https://wa.me/31629129753">' + ic('whatsapp') + 'App Juniska</a><button class="knop knop-tekst" type="button" data-uitloggen>Uitloggen</button></div>' + voet() + '</section>';
      if (open.length && !info.online) melding = null;
      toon(html);
    });
  }
  function afspraakHtml(b) {
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
    return '<article class="afspraak' + (voorbij ? ' voorbij' : '') + '"><div class="tussen"><span class="wanneer">' + esc(datumTekst(b.datum)) + ' om ' + esc(b.tijd) + '</span>' + badge(b) + '</div><span class="wat">' + esc(les ? b.activiteit : b.productNaam) + '</span><span class="waar">' + esc(les ? b.locatie + ' · ' + b.adres : (info.massages && info.massages.locatie) || '') + (b.betaalwijze === 'credit' ? ' · met credit' : b.betaalwijze === 'proefles' ? ' · gratis proefles' : '') + '</span>' + (actie ? '<div class="rij" style="margin-top:.3rem">' + actie + '</div>' : '') + '</article>';
  }
  function annuleer(b) {
    var les = b.soort === 'les';
    var html = '<div class="paneel-kop"><div><h2>' + (les ? 'Afmelden voor deze les?' : 'Afspraak annuleren?') + '</h2><p>' + esc((les ? b.activiteit : b.productNaam) + ', ' + datumTekst(b.datum) + ' om ' + b.tijd) + '</p></div><button class="sluitknop" type="button" data-sluit aria-label="Sluiten">' + ic('sluit') + '</button></div>' +
      '<p>' + (b.betaalwijze === 'credit' ? 'Je credit komt terug op je kaart.' : b.betaalwijze === 'proefles' ? 'Je gratis proefles blijft beschikbaar voor een andere keer.' : 'Juniska krijgt hiervan bericht.') + '</p><div class="fout" data-fout hidden role="alert"></div>' +
      '<div class="knoprij twee"><button class="knop knop-merk" type="button" data-bevestig-annuleer="' + esc(b.id) + '">Ja, ' + (les ? 'meld me af' : 'annuleer') + '</button><button class="knop knop-rand" type="button" data-sluit>Nee, laat staan</button></div>';
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
    var t = e.target.closest('[data-sluit],[data-achter],[data-aanmelden],[data-afmelden],[data-filter],[data-product],[data-datum],[data-tijd],[data-maand],[data-stap],[data-koop],[data-annuleer],[data-bevestig-annuleer],[data-uitloggen],[data-tip-sluit]');
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
    if (t.hasAttribute('data-uitloggen')) { zetToken(''); mij = null; melding = { soort: 'info', tekst: 'Je bent uitgelogd. Tot de volgende keer!' }; location.hash = '#home'; return; }
    if (t.hasAttribute('data-tip-sluit')) { try { localStorage.setItem('ct_tip', '1'); } catch (x) {} document.querySelector('[data-tip]').innerHTML = ''; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && paneelHouder.firstChild) sluitPaneel(); });

  /* ---------- routing ---------- */
  var routes = { home: schermHome, lessen: schermLessen, massage: schermMassage, kaarten: schermKaarten, mij: schermMij, inloggen: schermInloggen };
  var laatsteHash = null;
  function route() {
    if (location.hash === laatsteHash) return; /* dubbele hashchange na een redirect niet twee keer tekenen */
    laatsteHash = location.hash;
    var naam = (location.hash || '#home').slice(1).split('?')[0];
    if (!routes[naam]) naam = 'home';
    sluitPaneel();
    document.querySelectorAll('[data-tab]').forEach(function (a) { var actief = a.dataset.tab === naam || (naam === 'kaarten' && a.dataset.tab === 'home') || (naam === 'inloggen' && a.dataset.tab === 'mij'); if (actief) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    routes[naam]();
  }
  window.addEventListener('hashchange', route);

  /* ---------- start ---------- */
  var url = new URL(location.href); var verander = false;
  if (url.searchParams.get('k')) { zetToken(url.searchParams.get('k')); url.searchParams.delete('k'); verander = true; if (!location.hash) location.hash = '#mij'; }
  var betaald = url.searchParams.get('betaald');
  if (betaald) { url.searchParams.delete('betaald'); verander = true; melding = { soort: 'goed', tekst: 'Betaling ontvangen, dankjewel! Je bevestiging komt per mail.' }; location.hash = '#mij'; }
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
