/* Sun Kitchen: table booking, powered by Mettafel.
   One widget, two forms:
   - a compact panel that opens bottom-right from the floating button
     (the rest of the page stays visible and usable)
   - the same widget fixed on the page, inside [data-reserveer-widget]
   Flow: people -> day (featured day chips or own date) -> time
   (live availability, remaining seats when nearly full) -> details
   -> instant confirmation with calendar file (.ics).
   The waiting list is the guest's choice, never automatic. */
(function () {
  'use strict';

  var CONTACT = '#contact';
  var T = {
    personen: 'How many people?', personenLabel: 'Number of people',
    dag: 'Which day?', dagLabel: 'Pick a day', vandaag: 'Today', morgen: 'Tomorrow', anders: 'Another date', andersLabel: 'Another date',
    tijd: 'What time?', tijdLabel: 'Available times', kiesDag: 'Pick a day first.', kiesDatum: 'Pick a date above.',
    laden: 'Checking availability...',
    geenTijden: 'No more online times for today. Pick another day.',
    vol: 'full', nog: function (n) { return n + ' left'; },
    wachtKop: 'This time is full.',
    wachtTekst: "Pick another time, or join the waiting list: if a table frees up, we'll be in touch straight away.",
    wachtVink: 'Put me on the waiting list for this time',
    naam: 'Your name', telefoon: 'Phone number', opmerking: 'Comments', optioneel: '(optional)',
    opmerkingPlaceholder: 'For example: birthday, high chair, allergy',
    verstuur: 'Confirm booking', versturen: 'Sending...',
    groep: 'For groups of 9 or more, <a href="' + CONTACT + '" data-rw-contact style="font-weight:700">send us a message</a> and we will confirm personally.',
    groepFout: 'For groups of 9 or more, send us a message and we will confirm personally.',
    kiesDagFout: 'Pick a day.', kiesTijdFout: 'Pick a time.',
    naamFout: 'Pop your name in, so the table is booked under it.',
    telFout: 'Please add a UK phone number we can reach you on.',
    netVol: 'This time has just filled up. Pick another time, or tick the waiting list and confirm again.',
    misluk: function (m) { return 'Sending did not work (' + m + '). Please try again in a moment.'; },
    klaar: 'All booked',
    wachtlijstTekst: function (datum, tijd, p, tel) { return "You're on the waiting list for " + datum + ' at ' + tijd + ' for ' + p + (p === 1 ? ' person' : ' people') + ". If a table frees up, we'll call you straight away on " + tel + '.'; },
    bevestigd: function (naam, p, datum, tijd) { return 'Lovely, ' + naam + '! Your table for ' + p + (p === 1 ? ' person' : ' people') + ' is booked for ' + datum + ' at ' + tijd + '. See you at 261 Mare Street.'; },
    reservering: 'Booking ', agenda: 'Add to your calendar',
    titel: 'Book a table', zwever: 'Book a table', sluiten: 'Close', powered: 'Booking system powered by',
    icsTitel: 'Sun Kitchen',
  };

  var CAPACITEIT = 40;
  var LAATSTE_TAFEL = '21:30';
  /* opening time per weekday (0 = Sunday); open every day */
  var OPEN = { 0: '12:00', 1: '12:00', 2: '12:00', 3: '12:00', 4: '12:00', 5: '12:00', 6: '12:00' };
  var DAGKORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MAANDKORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var IK_KRUIS = '<svg class="ikoon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var IK_BESTEK = '<svg class="ikoon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M5 3v7a2 2 0 0 0 2 2M17 21V3c-2 1.5-3 4-3 7 0 2 1 3 3 3"/></svg>';
  var IK_KALENDER = '<svg class="ikoon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* booking slots every 30 minutes from opening time until the last table */
  function slotsVoor(d) {
    var van = OPEN[d.getDay()].split(':');
    var tot = LAATSTE_TAFEL.split(':');
    var m = (+van[0]) * 60 + (+van[1]);
    var eind = (+tot[0]) * 60 + (+tot[1]);
    var uit = [];
    for (; m <= eind; m += 30) {
      uit.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
    }
    return uit;
  }

  /* true if a slot on this day is still bookable online (45 minutes notice) */
  function heeftTijd(d, nu) {
    var s = slotsVoor(d);
    var l = s[s.length - 1].split(':');
    var laatste = new Date(d); laatste.setHours(+l[0], +l[1], 0, 0);
    return laatste.getTime() >= nu.getTime() + 45 * 60000;
  }

  /* the next days, for the featured day chips */
  function dagOpties(aantal) {
    var uit = [];
    var nu = new Date();
    var d = new Date(nu);
    for (var i = 0; i < 21 && uit.length < aantal; i++) {
      if (i > 0 || heeftTijd(d, nu)) {
        var label = i === 0 ? T.vandaag : i === 1 ? T.morgen : DAGKORT[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDKORT[d.getMonth()];
        uit.push({ iso: iso(d), label: label });
      }
      d = new Date(d); d.setDate(d.getDate() + 1);
    }
    return uit;
  }

  var MARKUP = '' +
    '<div class="rw" data-rw>' +
    '  <div class="rw-stap" data-rw-stap="kies">' +
    '    <div class="veld">' +
    '      <span class="rw-label">' + T.personen + '</span>' +
    '      <div class="slot-raster" data-rw-personen role="group" aria-label="' + T.personenLabel + '">' +
    [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
      return '<button type="button" class="slot" data-p="' + n + '" aria-pressed="' + (n === 2) + '">' + n + '</button>';
    }).join('') +
    '        <button type="button" class="slot" data-p="9" aria-pressed="false">9+</button>' +
    '      </div>' +
    '      <p class="rw-groep dim" data-rw-groep hidden>' + T.groep + '</p>' +
    '    </div>' +
    '    <div class="veld">' +
    '      <span class="rw-label">' + T.dag + '</span>' +
    '      <div class="slot-raster" data-rw-dagen role="group" aria-label="' + T.dagLabel + '"></div>' +
    '      <input type="date" data-rw-datum hidden aria-label="' + T.andersLabel + '">' +
    '      <p class="fout" data-rw-fout="datum" hidden></p>' +
    '    </div>' +
    '    <div class="veld">' +
    '      <span class="rw-label">' + T.tijd + '</span>' +
    '      <div class="slot-raster" data-rw-tijden role="group" aria-label="' + T.tijdLabel + '" aria-live="polite"><p class="dim rw-tip">' + T.kiesDag + '</p></div>' +
    '      <p class="fout" data-rw-fout="tijd" hidden></p>' +
    '    </div>' +
    '    <div class="wachtlijst-kader" data-rw-wacht hidden>' +
    '      <strong>' + T.wachtKop + '</strong>' +
    '      <p class="rw-tip" style="color:inherit">' + T.wachtTekst + '</p>' +
    '      <label class="rw-vink"><input type="checkbox" data-rw-wachtvink> ' + T.wachtVink + '</label>' +
    '    </div>' +
    '    <div class="veld"><label>' + T.naam + '<input data-rw-naam autocomplete="name" required></label><p class="fout" data-rw-fout="naam" hidden></p></div>' +
    '    <div class="veld"><label>' + T.telefoon + '<input data-rw-telefoon type="tel" autocomplete="tel" inputmode="tel" required></label><p class="fout" data-rw-fout="telefoon" hidden></p></div>' +
    '    <div class="veld"><label>' + T.opmerking + ' <span class="rw-optioneel">' + T.optioneel + '</span><textarea data-rw-opmerking rows="2" placeholder="' + T.opmerkingPlaceholder + '"></textarea></label></div>' +
    '    <button type="button" class="knop knop-vol rw-verstuur" data-rw-verstuur>' + T.verstuur + '</button>' +
    '    <p class="fout" data-rw-fout="algemeen" hidden></p>' +
    '    <p class="mettafel-noot">' + T.powered + ' <a href="https://mettafel.nl" rel="noopener" target="_blank">Mettafel</a></p>' +
    '  </div>' +
    '  <div class="bevestiging" data-rw-stap="klaar" hidden>' +
    '    <span class="eyebrow">' + T.klaar + '</span>' +
    '    <p class="nummer" data-rw-nummer></p>' +
    '    <p data-rw-tekst></p>' +
    '    <a class="knop knop-lijn" data-rw-agenda hidden download="sun-kitchen.ics">' + IK_KALENDER + ' ' + T.agenda + '</a>' +
    '  </div>' +
    '</div>';

  function Widget(wortel) {
    var q = function (sel) { return wortel.querySelector(sel); };
    var personen = 2, datum = null, tijd = null, bezet = {}, capaciteit = CAPACITEIT;
    var dagenWrap = q('[data-rw-dagen]');
    var datumVeld = q('[data-rw-datum]');
    var tijdenWrap = q('[data-rw-tijden]');
    var wachtKader = q('[data-rw-wacht]');
    var wachtVink = q('[data-rw-wachtvink]');
    var groepNoot = q('[data-rw-groep]');

    function fout(veld, tekst) {
      var el = q('[data-rw-fout="' + veld + '"]');
      if (!el) return;
      el.textContent = tekst || '';
      el.hidden = !tekst;
    }

    var opties = dagOpties(4);
    dagenWrap.innerHTML = opties.map(function (o) {
      return '<button type="button" class="slot" data-dag="' + o.iso + '" aria-pressed="false">' + o.label + '</button>';
    }).join('') + '<button type="button" class="slot" data-dag="anders" aria-pressed="false">' + T.anders + '</button>';

    var vandaag = new Date();
    datumVeld.min = iso(vandaag);
    var max = new Date(vandaag); max.setDate(max.getDate() + 60);
    datumVeld.max = iso(max);

    dagenWrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dag]');
      if (!b) return;
      fout('datum', '');
      dagenWrap.querySelectorAll('.slot').forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
      if (b.dataset.dag === 'anders') {
        datumVeld.hidden = false;
        datumVeld.focus();
        datum = datumVeld.value || null;
        if (datum) kiesDatum(datum); else tijdenWrap.innerHTML = '<p class="dim rw-tip">' + T.kiesDatum + '</p>';
        return;
      }
      datumVeld.hidden = true;
      kiesDatum(b.dataset.dag);
    });

    datumVeld.addEventListener('change', function () {
      if (!datumVeld.value) return;
      fout('datum', '');
      kiesDatum(datumVeld.value);
    });

    function kiesDatum(nieuwe) {
      datum = nieuwe;
      tijd = null;
      wachtKader.hidden = true;
      laadBeschikbaarheid();
    }

    async function laadBeschikbaarheid() {
      tijdenWrap.innerHTML = '<p class="dim rw-tip">' + T.laden + '</p>';
      bezet = {};
      try {
        var r = await fetch('api/beschikbaarheid?datum=' + encodeURIComponent(datum));
        var j = await r.json();
        if (j.ok) { bezet = j.bezet || {}; capaciteit = j.capaciteitPerSlot || capaciteit; }
      } catch (e) { /* server unreachable: show the times without occupancy */ }
      toonTijden();
    }

    function toonTijden() {
      if (!datum) return;
      var nu = new Date();
      var isVandaag = datum === iso(nu);
      var slots = slotsVoor(new Date(datum + 'T12:00'));
      tijdenWrap.innerHTML = slots.map(function (t) {
        if (isVandaag) {
          var um = t.split(':');
          var slotTijd = new Date(nu); slotTijd.setHours(+um[0], +um[1], 0, 0);
          if (slotTijd.getTime() < nu.getTime() + 45 * 60000) return '';
        }
        var rest = capaciteit - (bezet[t] || 0);
        var vol = rest < personen;
        var extra = vol ? ' · ' + T.vol : (rest <= 8 ? ' · ' + T.nog(rest) : '');
        return '<button type="button" class="slot' + (vol ? ' vol wacht' : '') + '" data-t="' + t + '" data-vol="' + vol + '" aria-pressed="false">' + t + extra + '</button>';
      }).join('');
      if (!tijdenWrap.querySelector('.slot')) {
        tijdenWrap.innerHTML = '<p class="dim rw-tip">' + T.geenTijden + '</p>';
      }
    }

    tijdenWrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-t]');
      if (!b) return;
      fout('tijd', '');
      tijd = b.dataset.t;
      tijdenWrap.querySelectorAll('.slot').forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
      var vol = b.dataset.vol === 'true';
      wachtKader.hidden = !vol;          /* waiting list is a choice: only shown, never pre-ticked */
      wachtVink.checked = false;
      b.classList.remove('vol');
    });

    q('[data-rw-personen]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]');
      if (!b) return;
      personen = parseInt(b.dataset.p, 10);
      this.querySelectorAll('.slot').forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
      groepNoot.hidden = personen < 9;
      if (datum) toonTijden();
    });

    q('[data-rw-verstuur]').addEventListener('click', async function () {
      ['datum', 'tijd', 'naam', 'telefoon', 'algemeen'].forEach(function (v) { fout(v, ''); });
      var naam = q('[data-rw-naam]').value.trim();
      var telefoon = q('[data-rw-telefoon]').value.trim();
      var ok = true;
      if (personen >= 9) { fout('algemeen', T.groepFout); ok = false; }
      if (!datum) { fout('datum', T.kiesDagFout); ok = false; }
      if (datum && !tijd) { fout('tijd', T.kiesTijdFout); ok = false; }
      if (!naam) { fout('naam', T.naamFout); ok = false; }
      if (!/^(\+44\s?|0)[\d\s]{9,13}$/.test(telefoon)) { fout('telefoon', T.telFout); ok = false; }
      if (!ok) return;

      var knop = this;
      knop.disabled = true; knop.textContent = T.versturen;

      try {
        var r = await fetch('api/reservering', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            naam: naam, telefoon: telefoon, datum: datum, tijd: tijd, personen: personen,
            opmerking: q('[data-rw-opmerking]').value.trim(),
            wachtlijst: wachtVink.checked,
          }),
        });
        var j = await r.json();
        if (r.status === 409 && j.vol) {
          wachtKader.hidden = false;
          fout('algemeen', T.netVol);
          laadBeschikbaarheid();
          knop.disabled = false; knop.textContent = T.verstuur;
          return;
        }
        if (!j.ok) throw new Error(j.fout || '?');

        var d = new Date(datum + 'T12:00');
        var datumTekst = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
        var wacht = j.status === 'waitlist';
        q('[data-rw-nummer]').textContent = T.reservering + j.id;
        q('[data-rw-tekst]').textContent = wacht
          ? T.wachtlijstTekst(datumTekst, tijd, personen, telefoon)
          : T.bevestigd(naam, personen, datumTekst, tijd);

        /* calendar file, only for a real confirmation */
        var agenda = q('[data-rw-agenda]');
        if (agenda && !wacht) {
          var stamp = datum.replace(/-/g, '') + 'T' + tijd.replace(':', '') + '00';
          var eind = new Date(datum + 'T' + tijd + ':00');
          eind.setHours(eind.getHours() + 2);
          var eindStamp = iso(eind).replace(/-/g, '') + 'T' + String(eind.getHours()).padStart(2, '0') + String(eind.getMinutes()).padStart(2, '0') + '00';
          var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mettafel//Sun Kitchen//EN', 'BEGIN:VEVENT',
            'UID:' + j.id + '@sunkitchen',
            'DTSTART:' + stamp, 'DTEND:' + eindStamp,
            'SUMMARY:' + T.icsTitel + ' (' + j.id + ')',
            'LOCATION:261 Mare Street\\, London E8 3NS',
            'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
          agenda.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
          agenda.hidden = false;
        }

        q('[data-rw-stap="kies"]').hidden = true;
        q('[data-rw-stap="klaar"]').hidden = false;
      } catch (err) {
        fout('algemeen', T.misluk(err.message));
        knop.disabled = false; knop.textContent = T.verstuur;
      }
    });
  }

  /* ---------- fixed on the page ---------- */
  var inline = document.querySelector('[data-reserveer-widget]');
  if (inline) {
    inline.innerHTML = MARKUP;
    Widget(inline);
  }

  /* ---------- compact panel bottom-right ---------- */
  if (!inline) {
    var overlay = document.createElement('div');
    overlay.className = 'rw-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="rw-paneel" role="dialog" aria-modal="true" aria-label="' + T.titel + '">' +
      '  <div class="rw-paneel-kop">' +
      '    <div><span class="eyebrow">Sun Kitchen</span><h2>' + T.titel + '</h2></div>' +
      '    <button type="button" class="rw-sluit" data-rw-sluit aria-label="' + T.sluiten + '">' + IK_KRUIS + '</button>' +
      '  </div>' + MARKUP +
      '</div>';
    document.body.appendChild(overlay);
    Widget(overlay);

    /* the floating button, except where a basket button already floats */
    if (!document.querySelector('[data-mandje-zwever]')) {
      var zwever = document.createElement('button');
      zwever.type = 'button';
      zwever.className = 'knop knop-vol reserveer-zwever';
      zwever.setAttribute('data-reserveer-open', '');
      zwever.innerHTML = IK_BESTEK + ' ' + T.zwever;
      document.body.appendChild(zwever);
    }

    /* the panel opens and closes; the page underneath stays usable */
    function toon(open) {
      overlay.hidden = !open;
      if (open) {
        var eerste = overlay.querySelector('.slot[aria-pressed="true"], .slot');
        if (eerste) eerste.focus({ preventScroll: true });
      }
    }
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-reserveer-open]');
      if (opener) { toon(overlay.hidden); return; }
      if (e.target.closest('[data-rw-sluit]')) { toon(false); return; }
      /* the group link jumps to the contact section, so close the panel first */
      if (e.target.closest('[data-rw-contact]')) toon(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) { toon(false); return; }
      /* keep focus cycling inside the open panel */
      if (e.key === 'Tab' && !overlay.hidden) {
        var f = overlay.querySelectorAll('button, [href], input, select, textarea');
        f = [].filter.call(f, function (el) { return !el.hidden && el.offsetParent !== null; });
        if (!f.length) return;
        var eerste = f[0], laatste = f[f.length - 1];
        if (e.shiftKey && document.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
        else if (!e.shiftKey && document.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
        else if (!overlay.contains(document.activeElement)) { e.preventDefault(); eerste.focus(); }
      }
    });
    /* links with href="#book" also open the panel */
    document.querySelectorAll('a[href="#book"]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); toon(overlay.hidden); });
    });
  }
})();
