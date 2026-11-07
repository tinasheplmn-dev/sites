/* register.js: interesselijst, registratie in vier stappen, en de bevestigingspagina.
   Taal volgt <html lang>. Fail-open: zonder script staat het formulier er gewoon, bij een
   mislukte verzending krijgt de bezoeker een duidelijke melding. Voortgang wordt lokaal
   bewaard (localStorage) en hersteld; velden worden bij verlaten gecontroleerd. */
(function () {
  'use strict';
  var lang = document.documentElement.lang === 'nl' ? 'nl' : 'en';
  var base = document.querySelector('link[rel="stylesheet"]').getAttribute('href').replace(/css\/style\.css.*$/, '');
  var S = {
    en: {
      netwerk: 'We could not send your details. Check your connection and try again. If it keeps failing, contact the camp team.',
      teSnel: 'That was quick. Please check your details and send again.',
      vulIn: 'Please check the highlighted fields.',
      akkoord: 'Please confirm you have read the terms and the privacy notice.',
      hersteld: 'We restored what you filled in earlier on this device.',
      ticket: 'Ticket', type: 'Registering as', naam: 'Name', email: 'Email', telefoon: 'Mobile', land: 'Country', kerk: 'District / assembly',
      leeftijd: 'Age', volwassen: '18 or older', minder: 'Under 18', voogd: 'Parent or guardian', wachtlijst: 'Waitlist',
      cop: 'COP attendee', guest: 'Guest or non-member', pas: 'Full camp pass, EUR 149.99', ja: 'Yes',
      wa: 'Hi! I registered for MIMYC\'27 (Maximum Impact Makers Youth Camp, 14-17 July 2027). As my parent/guardian, can you confirm permission through this secure link? ',
      ics: 'Maximum Impact Makers Youth Camp 2027', gekopieerd: 'Copied', kopieer: 'Copy link',
    },
    nl: {
      netwerk: 'We konden je gegevens niet versturen. Controleer je verbinding en probeer het opnieuw. Blijft het misgaan, neem dan contact op met het kampteam.',
      teSnel: 'Dat ging snel. Controleer je gegevens en verstuur opnieuw.',
      vulIn: 'Controleer de gemarkeerde velden.',
      akkoord: 'Bevestig dat je de voorwaarden en de privacyverklaring hebt gelezen.',
      hersteld: 'We hebben teruggezet wat je eerder op dit apparaat invulde.',
      ticket: 'Ticket', type: 'Ik schrijf me in als', naam: 'Naam', email: 'E-mail', telefoon: 'Mobiel', land: 'Land', kerk: 'District / gemeente',
      leeftijd: 'Leeftijd', volwassen: '18 of ouder', minder: 'Onder de 18', voogd: 'Ouder of voogd', wachtlijst: 'Wachtlijst',
      cop: 'COP-lid', guest: 'Gast of niet-lid', pas: 'Volledig kamppas, EUR 149,99', ja: 'Ja',
      wa: 'Hoi! Ik heb me ingeschreven voor MIMYC\'27 (Maximum Impact Makers Youth Camp, 14-17 juli 2027). Kun jij als mijn ouder/voogd de toestemming bevestigen via deze beveiligde link? ',
      ics: 'Maximum Impact Makers Youth Camp 2027', gekopieerd: 'Gekopieerd', kopieer: 'Kopieer link',
    },
  }[lang];

  var q = new URLSearchParams(location.search);
  var meet = function (naam, props) { try { if (window.plausible) window.plausible(naam, props ? { props: props } : undefined); } catch (e) {} };
  var opslag = { get: function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };

  /* ---------- hulpjes ---------- */
  function veld(input) { return input.closest('.veld') || input.closest('.vink'); }
  function geldigEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function geldigTel(v) { return v.replace(/[^\d+]/g, '').length >= 8; }
  function isFout(i) {
    var leeg = i.type === 'checkbox' ? !i.checked : !i.value.trim();
    return leeg || (i.type === 'email' && !geldigEmail(i.value)) || (i.type === 'tel' && !geldigTel(i.value));
  }
  function toets(inputs) {
    var ok = true, eerste = null;
    inputs.forEach(function (i) {
      var v = veld(i); if (!v) return;
      var fout = isFout(i);
      v.classList.toggle('fout', fout);
      if (fout) { ok = false; if (!eerste) eerste = i; }
    });
    if (eerste) eerste.focus();
    return ok;
  }
  function melding(el, tekst) { if (!el) return; el.querySelector('span').textContent = tekst; el.hidden = !tekst; }
  function post(pad, data) {
    return fetch(base + 'api/' + pad, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) { var e = new Error(j.fout || 'fout'); e.code = r.status; throw e; } return j; }); });
  }
  function foutTekst(err) { return err && err.code === 429 ? S.teSnel : (err && err.message && err.message !== 'fout' && err.code !== 500 ? err.message : S.netwerk); }
  /* validatie bij het verlaten van een veld, en de fout weghalen zodra er getypt wordt */
  document.querySelectorAll('.veld input, .veld select').forEach(function (i) {
    i.addEventListener('input', function () { var v = veld(i); if (v) v.classList.remove('fout'); });
    i.addEventListener('blur', function () { if (!i.required && !i.value) return; var v = veld(i); if (v && i.value) v.classList.toggle('fout', isFout(i)); });
  });
  /* tijdstempel voor de bot-drempel */
  document.querySelectorAll('input[name="t0"]').forEach(function (i) { i.value = String(Date.now()); });

  /* ---------- voorvertoning van de open stand: ?preview=open of ?preview=waitlist ---------- */
  var preview = q.get('preview');
  var regForm = document.querySelector('[data-reg-form]');
  if (preview && regForm && (preview === 'open' || preview === 'waitlist')) {
    document.querySelectorAll('[data-reg-soon], [data-reg-closed]').forEach(function (el) { el.hidden = true; });
    regForm.hidden = false;
    regForm.dataset.state = preview;
    var kopH1 = document.querySelector('.pagina-kop h1'), kopP = document.querySelector('.pagina-kop h1 + p');
    var PV = { en: { open: ['Register for MIMYC\'27', 'Preview of the open state. Registration is open.'], waitlist: ['Join the waitlist', 'Preview of the waitlist state.'] },
               nl: { open: ['Schrijf je in voor MIMYC\'27', 'Voorbeeld van de open stand. De inschrijving is open.'], waitlist: ['Zet me op de wachtlijst', 'Voorbeeld van de wachtlijststand.'] } }[lang][preview];
    if (kopH1) kopH1.textContent = PV[0];
    if (kopP) kopP.textContent = PV[1];
  }

  /* ---------- interesselijst ---------- */
  var interesse = document.querySelector('[data-interest]');
  if (interesse) {
    interesse.addEventListener('submit', function (e) {
      e.preventDefault();
      var fout = interesse.querySelector('[data-fout]');
      melding(fout, '');
      if (!toets([interesse.naam, interesse.email])) { melding(fout, S.vulIn); return; }
      var knop = interesse.querySelector('[type="submit"]'); knop.disabled = true;
      post('interest', { naam: interesse.naam.value.trim(), email: interesse.email.value.trim(), type: interesse.type.value, taal: lang, website: interesse.website.value, t0: interesse.t0.value })
        .then(function () { interesse.hidden = true; var k = interesse.parentElement.querySelector('[data-klaar]'); if (k) { k.hidden = false; k.focus && k.setAttribute('tabindex', '-1'); k.focus(); } meet('interest'); })
        .catch(function (err) { melding(fout, foutTekst(err)); knop.disabled = false; });
    });
  }

  /* ---------- registratie in stappen ---------- */
  if (regForm) {
    var SLEUTEL = 'mim-reg-draft';
    var stappen = [].slice.call(regForm.querySelectorAll('[data-stap]'));
    var tabs = [].slice.call(regForm.querySelectorAll('[data-stap-tab]'));
    var huidig = 1;
    var isCop = function () { return regForm.type.value === 'cop'; };
    var isMinor = function () { return regForm.minderjarig.value === 'yes'; };
    var BEWAAR = ['type', 'voornaam', 'achternaam', 'email', 'telefoon', 'land', 'woonplaats', 'district', 'assembly', 'leider', 'minderjarig', 'voogdNaam', 'voogdRelatie', 'voogdEmail', 'voogdTelefoon', 'noodNaam', 'noodTelefoon'];

    function bewaar() {
      var d = {};
      BEWAAR.forEach(function (n) { var el = regForm.elements[n]; if (el) d[n] = el.value; });
      d._stap = huidig; d._op = Date.now();
      opslag.set(SLEUTEL, d);
    }
    function herstel() {
      var d = opslag.get(SLEUTEL);
      if (!d || !d._op || Date.now() - d._op > 7 * 864e5) return false;
      var iets = false;
      BEWAAR.forEach(function (n) { var el = regForm.elements[n]; if (el && d[n]) { el.value = d[n]; iets = true; } });
      if (iets) { var h = regForm.querySelector('[data-hersteld]'); if (h) { h.querySelector('span').textContent = S.hersteld; h.hidden = false; } }
      return iets;
    }
    regForm.addEventListener('input', bewaar);
    regForm.addEventListener('change', bewaar);
    var opnieuw = regForm.querySelector('[data-opnieuw]');
    if (opnieuw) opnieuw.addEventListener('click', function () {
      opslag.del(SLEUTEL);
      BEWAAR.forEach(function (n) { var el = regForm.elements[n]; if (el && el.type !== 'radio') el.value = ''; });
      regForm.querySelector('[name="type"][value="cop"]').checked = true;
      regForm.querySelector('[name="minderjarig"][value="no"]').checked = true;
      regForm.querySelector('[data-hersteld]').hidden = true;
      copVelden(); toonStap(1);
    });

    function toonStap(n) {
      huidig = n;
      stappen.forEach(function (s) { s.hidden = Number(s.dataset.stap) !== n; });
      tabs.forEach(function (t) {
        var k = Number(t.dataset.stapTab);
        if (k === n) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
        t.classList.toggle('klaar', k < n);
        if (k === 3) t.style.opacity = isMinor() ? '' : '.45';
      });
      if (n === 4) vulOverzicht();
      var kaart = regForm.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: kaart, behavior: 'smooth' });
      var kop = stappen[n - 1].querySelector('h2');
      if (kop) { kop.setAttribute('tabindex', '-1'); setTimeout(function () { kop.focus({ preventScroll: true }); }, 350); }
      meet('registration-step', { step: String(n) });
      bewaar();
    }
    function copVelden() {
      var blok = regForm.querySelector('[data-cop-velden]');
      blok.hidden = !isCop();
      regForm.querySelectorAll('[data-cop]').forEach(function (i) { i.required = isCop(); });
    }
    regForm.querySelectorAll('[name="type"]').forEach(function (r) { r.addEventListener('change', copVelden); });
    herstel();
    copVelden();

    function toetsStap(n) {
      if (n === 2) {
        var lijst = [regForm.voornaam, regForm.achternaam, regForm.email, regForm.telefoon, regForm.woonplaats];
        if (isCop()) lijst.push(regForm.district, regForm.assembly);
        return toets(lijst);
      }
      if (n === 3) return toets([].slice.call(regForm.querySelectorAll('[data-minor]')));
      return true;
    }
    regForm.querySelectorAll('[data-volgende]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!toetsStap(huidig)) return;
        var volgende = huidig + 1;
        if (volgende === 3 && !isMinor()) volgende = 4;
        toonStap(volgende);
      });
    });
    regForm.querySelectorAll('[data-terug]').forEach(function (b) {
      b.addEventListener('click', function () {
        var vorige = huidig - 1;
        if (vorige === 3 && !isMinor()) vorige = 2;
        toonStap(vorige);
      });
    });

    function rij(dt, dd) { return '<dt>' + dt + '</dt><dd>' + String(dd).replace(/[<>]/g, '') + '</dd>'; }
    function vulOverzicht() {
      var o = regForm.querySelector('[data-overzicht]');
      var html = rij(S.ticket, S.pas) + rij(S.type, isCop() ? S.cop : S.guest)
        + rij(S.naam, regForm.voornaam.value + ' ' + regForm.achternaam.value)
        + rij(S.email, regForm.email.value) + rij(S.telefoon, regForm.telefoon.value)
        + rij(S.land, regForm.land.value + ', ' + regForm.woonplaats.value);
      if (isCop()) html += rij(S.kerk, regForm.district.value + ' / ' + regForm.assembly.value);
      html += rij(S.leeftijd, isMinor() ? S.minder : S.volwassen);
      if (isMinor()) html += rij(S.voogd, regForm.voogdNaam.value + ' (' + regForm.voogdRelatie.value + ')');
      if (regForm.dataset.state === 'waitlist') html += rij(S.wachtlijst, S.ja);
      o.innerHTML = html;
    }

    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fout = regForm.querySelector('[data-stap="4"] [data-fout]');
      melding(fout, '');
      var akkoord = regForm.akkoord;
      if (!akkoord.checked) { akkoord.closest('.vink').classList.add('fout'); melding(fout, S.akkoord); return; }
      akkoord.closest('.vink').classList.remove('fout');
      var knop = regForm.querySelector('[data-verstuur]'); knop.disabled = true;
      var data = {
        taal: lang, ticket: 'full', type: regForm.type.value, waitlist: regForm.dataset.state === 'waitlist',
        voornaam: regForm.voornaam.value.trim(), achternaam: regForm.achternaam.value.trim(), naam: (regForm.voornaam.value + ' ' + regForm.achternaam.value).trim(),
        email: regForm.email.value.trim(), telefoon: regForm.telefoon.value.trim(), land: regForm.land.value, woonplaats: regForm.woonplaats.value.trim(),
        district: isCop() ? regForm.district.value.trim() : '', assembly: isCop() ? regForm.assembly.value.trim() : '', leider: isCop() ? regForm.leider.value.trim() : '',
        minderjarig: isMinor(), media: regForm.media.checked, akkoord: true,
        website: regForm.website.value, t0: regForm.t0.value,
      };
      if (isMinor()) {
        data.voogdNaam = regForm.voogdNaam.value.trim(); data.voogdRelatie = regForm.voogdRelatie.value;
        data.voogdEmail = regForm.voogdEmail.value.trim(); data.voogdTelefoon = regForm.voogdTelefoon.value.trim();
        data.noodNaam = regForm.noodNaam.value.trim(); data.noodTelefoon = regForm.noodTelefoon.value.trim();
      }
      post('registration', data)
        .then(function (j) {
          opslag.del(SLEUTEL);
          try { sessionStorage.setItem('mim-reg', JSON.stringify({ id: j.id, naam: data.voornaam, token: j.guardianToken || '', minor: isMinor(), waitlist: data.waitlist })); } catch (e2) {}
          meet('registration-sent', { minor: isMinor() ? 'yes' : 'no', type: data.type });
          location.href = 'registered.html?id=' + encodeURIComponent(j.id) + (j.guardianToken ? '&g=' + encodeURIComponent(j.guardianToken) : '');
        })
        .catch(function (err) { melding(fout, foutTekst(err)); knop.disabled = false; });
    });
  }

  /* ---------- bevestigingspagina ---------- */
  var regId = document.querySelector('[data-reg-id]');
  if (regId) {
    var id = q.get('id') || '';
    var token = q.get('g') || '';
    var opgeslagen = {};
    try { opgeslagen = JSON.parse(sessionStorage.getItem('mim-reg') || '{}'); } catch (e3) {}
    if (!id && opgeslagen.id) { id = opgeslagen.id; token = opgeslagen.token || ''; }
    if (id) { regId.textContent = id; var id2 = document.querySelector('[data-reg-id-2]'); if (id2) id2.textContent = id; }
    var naamEl = document.querySelector('[data-reg-naam]');
    if (naamEl && opgeslagen.naam && opgeslagen.id === id) naamEl.textContent = opgeslagen.naam + (lang === 'nl' ? ', we hebben je inschrijving ontvangen.' : ', we have received your registration.');
    var pay = document.querySelector('[data-pay]');
    if (pay && id) pay.href = pay.getAttribute('href').replace(/\{\{id\}\}/g, encodeURIComponent(id));
    if (token) {
      var link = location.origin + location.pathname.replace(/registered\.html$/, 'guardian.html') + '?t=' + token;
      document.querySelector('[data-voogd-blok]').hidden = false;
      document.querySelectorAll('[data-stap-voogd], [data-stap-voogd-2]').forEach(function (el) { el.hidden = false; });
      document.querySelector('[data-voogd-link]').textContent = link;
      document.querySelector('[data-voogd-wa]').href = 'https://wa.me/?text=' + encodeURIComponent(S.wa + link);
      var kop = document.querySelector('[data-kopieer]');
      kop.addEventListener('click', function () {
        var klaar = function () { kop.lastChild.textContent = S.gekopieerd; setTimeout(function () { kop.lastChild.textContent = S.kopieer; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(link).then(klaar); else { window.prompt(S.kopieer, link); }
      });
    }
    var ics = document.querySelector('[data-ics]');
    if (ics) {
      var tekst = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MIMYC27//EN', 'BEGIN:VEVENT', 'UID:mimyc27-' + (id || 'camp') + '@mimyc27',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z/, 'Z'),
        'DTSTART;VALUE=DATE:20270714', 'DTEND;VALUE=DATE:20270718', 'SUMMARY:' + S.ics,
        'LOCATION:De Hoof\\, De Hoof 18\\, 5712 LM Someren\\, Netherlands', 'DESCRIPTION:' + (id ? 'Registration ' + id : ''), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      ics.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(tekst);
    }
  }
})();
