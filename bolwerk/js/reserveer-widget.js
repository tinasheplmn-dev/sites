/* Bolwerk Den Bosch: reserveringswidget, powered by Mettafel. Tweetalig (nl/en).
   Motor gebaseerd op de Mettafel-reserveerwidget; huid en regels op maat:
   - eerst kiezen waarvoor je komt (lunch, diner, of borrel & gebak), want
     tussen 11:30 en 15:30 reserveert Bolwerk alleen voor de lunch
   - het terras is vrije inloop: reserveren geldt voor binnen (vaste noot)
   - elke dag open (maandag vanaf 11:30)
   - vanaf 9 personen gaat het via het groepenformulier
   - wachtlijst is een keuze van de gast, nooit automatisch
   Eén widget, twee gedaanten: compact paneel rechtsonder (zwevende knop) of
   vast op de pagina in [data-reserveer-widget]. */
(function () {
  'use strict';

  var EN = document.documentElement.lang === 'en';
  var GROEPEN = EN ? 'groepen-en.html' : 'groepen.html';
  var T = EN ? {
    moment: 'What are you coming for?', momentLabel: 'Type of visit',
    momenten: { lunch: 'Lunch', diner: 'Dinner', borrel: 'Drinks & pastry' },
    momentTip: { lunch: 'Lunch reservations between 11:30 and 15:00.', diner: 'Dinner from 16:00.', borrel: 'Between 11:30 and 15:30 we only take lunch reservations, so drinks slots start at 15:30.' },
    personen: 'How many people?', personenLabel: 'Number of people',
    dag: 'Which day?', dagLabel: 'Pick a day', vandaag: 'Today', morgen: 'Tomorrow', anders: 'Another date', andersLabel: 'Another date',
    tijd: 'What time?', tijdLabel: 'Available times', kiesDag: 'Pick a day first.', kiesDatum: 'Pick a date above.',
    laden: 'Checking availability...',
    geenTijden: 'No more online times for today. Pick another day.',
    vol: 'full', nog: function (n) { return n + ' left'; },
    wachtKop: 'This time is full.',
    wachtTekst: "Pick another time, or join the waiting list: if a table frees up, we'll call you right away.",
    wachtVink: 'Put me on the waiting list for this time',
    naam: 'Your name', telefoon: 'Phone number', opmerking: 'Comments', optioneel: '(optional)',
    opmerkingPlaceholder: 'For example: window table, birthday, allergy, wheelchair',
    verstuur: 'Confirm reservation', versturen: 'Sending...',
    groep: 'For groups of 9 or more we confirm personally: use the <a href="' + GROEPEN + '" style="font-weight:700">group request form</a>.',
    groepFout: 'For groups of 9 or more: send us a group request and we\'ll confirm personally.',
    kiesDagFout: 'Pick a day.', kiesTijdFout: 'Pick a time.',
    naamFout: 'Fill in your name, so the table is in your name.',
    telFout: 'Fill in a phone number we can reach you on.',
    netVol: 'This time just filled up. Pick another time, or tick the waiting list and confirm again.',
    misluk: function (m) { return 'Sending failed (' + m + '). Please try again in a moment.'; },
    klaar: 'See you at the water!',
    wachtlijstTekst: function (datum, tijd, p, tel) { return 'You are on the waiting list for ' + datum + ' at ' + tijd + ' for ' + p + (p === 1 ? ' person' : ' people') + ". If a table frees up, we'll call you right away on " + tel + '.'; },
    bevestigd: function (naam, p, datum, tijd) { return 'Thank you ' + naam + '! Your table for ' + p + (p === 1 ? ' person' : ' people') + ' is confirmed for ' + datum + ' at ' + tijd + '. See you at Sint Janssingel 25!'; },
    reservering: 'Reservation ', agenda: 'Add to your calendar',
    titel: 'Book a table', zwever: 'Book a table', sluiten: 'Close', powered: 'Reservation system powered by',
    terrasNoot: 'The waterside terrace is walk-in only: this reservation is for a table inside. Booking ahead is never required, walking in is always welcome.',
    icsTitel: 'Bolwerk Den Bosch',
  } : {
    moment: 'Waarvoor kom je?', momentLabel: 'Soort bezoek',
    momenten: { lunch: 'Lunch', diner: 'Diner', borrel: 'Borrel & gebak' },
    momentTip: { lunch: 'Lunchreserveringen tussen 11:30 en 15:00.', diner: 'Diner vanaf 16:00.', borrel: 'Tussen 11:30 en 15:30 reserveren we alleen voor de lunch; borreltijden beginnen daarom om 15:30.' },
    personen: 'Met hoeveel personen?', personenLabel: 'Aantal personen',
    dag: 'Welke dag?', dagLabel: 'Kies een dag', vandaag: 'Vandaag', morgen: 'Morgen', anders: 'Andere datum', andersLabel: 'Andere datum',
    tijd: 'Hoe laat?', tijdLabel: 'Beschikbare tijden', kiesDag: 'Kies eerst een dag.', kiesDatum: 'Kies hierboven een datum.',
    laden: 'Beschikbaarheid ophalen...',
    geenTijden: 'Voor vandaag zijn er online geen tijden meer. Kies een andere dag.',
    vol: 'vol', nog: function (n) { return 'nog ' + n; },
    wachtKop: 'Dit tijdstip is vol.',
    wachtTekst: 'Kies een andere tijd, of laat je op de wachtlijst zetten: komt er een tafel vrij, dan bellen we je meteen.',
    wachtVink: 'Zet mij op de wachtlijst voor dit tijdstip',
    naam: 'Je naam', telefoon: 'Telefoonnummer', opmerking: 'Opmerking', optioneel: '(niet verplicht)',
    opmerkingPlaceholder: 'Bijvoorbeeld: tafel bij het raam, verjaardag, allergie, rolstoel',
    verstuur: 'Bevestig reservering', versturen: 'Versturen...',
    groep: 'Vanaf 9 personen bevestigen we persoonlijk: gebruik het <a href="' + GROEPEN + '" style="font-weight:700">groepenformulier</a>.',
    groepFout: 'Vanaf 9 personen: stuur ons een groepsaanvraag, dan bevestigen we persoonlijk.',
    kiesDagFout: 'Kies een dag.', kiesTijdFout: 'Kies een tijd.',
    naamFout: 'Vul je naam in, dan staat de tafel op jouw naam.',
    telFout: 'Vul een telefoonnummer in waarop we je kunnen bereiken.',
    netVol: 'Dit tijdstip is net vol geraakt. Kies een andere tijd, of vink de wachtlijst aan en bevestig opnieuw.',
    klaar: 'Tot aan het water!',
    misluk: function (m) { return 'Versturen lukte niet (' + m + '). Probeer het zo nog eens.'; },
    wachtlijstTekst: function (datum, tijd, p, tel) { return 'Je staat op de wachtlijst voor ' + datum + ' om ' + tijd + ' met ' + p + (p === 1 ? ' persoon' : ' personen') + '. Komt er een tafel vrij, dan bellen we je meteen op ' + tel + '.'; },
    bevestigd: function (naam, p, datum, tijd) { return 'Dank je wel ' + naam + '! Je tafel voor ' + p + (p === 1 ? ' persoon' : ' personen') + ' staat vast op ' + datum + ' om ' + tijd + ' uur. Tot dan, aan de Sint Janssingel 25!'; },
    reservering: 'Reservering ', agenda: 'Zet in je agenda',
    titel: 'Reserveer een tafel', zwever: 'Reserveer een tafel', sluiten: 'Sluiten', powered: 'Reserveringssysteem powered by',
    terrasNoot: 'Het terras aan het water is vrije inloop: deze reservering geldt voor een tafel binnen. Reserveren is nooit verplicht, binnenlopen mag altijd.',
    icsTitel: 'Bolwerk Den Bosch',
  };

  var CAPACITEIT = 24;
  /* tijdsloten per soort bezoek; lunch-only-venster 11:30-15:30 gerespecteerd */
  var SLOTS = {
    lunch: ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'],
    diner: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
    borrel: ['10:00', '10:30', '11:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'],
  };
  function openVanaf(d) { return d.getDay() === 1 ? 11.5 : 10; } /* maandag vanaf 11:30, elke dag open */
  var DAGKORT = EN ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var MAANDKORT = EN ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function dagOpties(aantal) {
    var uit = [];
    var d = new Date();
    for (var i = 0; i < 21 && uit.length < aantal; i++) {
      var laatste = new Date(d); laatste.setHours(20, 0, 0, 0);
      if (i > 0 || new Date() < laatste) {
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
    '    <p class="terras-noot"><svg class="ikoon" aria-hidden="true"><use href="assets/iconen.svg#i-parasol"/></svg><span>' + T.terrasNoot + '</span></p>' +
    '    <div class="veld">' +
    '      <span class="rw-label">' + T.moment + '</span>' +
    '      <div class="slot-raster" data-rw-moment role="group" aria-label="' + T.momentLabel + '">' +
    ['lunch', 'diner', 'borrel'].map(function (m) {
      return '<button type="button" class="slot" data-m="' + m + '" aria-pressed="' + (m === 'diner') + '">' + T.momenten[m] + '</button>';
    }).join('') +
    '      </div>' +
    '      <p class="rw-tip dim" data-rw-moment-tip>' + T.momentTip.diner + '</p>' +
    '    </div>' +
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
    '    <a class="knop knop-lijn" data-rw-agenda hidden download="bolwerk.ics"><svg class="ikoon" aria-hidden="true"><use href="assets/iconen.svg#i-kalender"/></svg> ' + T.agenda + '</a>' +
    '  </div>' +
    '</div>';

  function Widget(wortel) {
    var q = function (sel) { return wortel.querySelector(sel); };
    var personen = 2, datum = null, tijd = null, moment = 'diner', bezet = {}, capaciteit = CAPACITEIT;
    var dagenWrap = q('[data-rw-dagen]');
    var datumVeld = q('[data-rw-datum]');
    var tijdenWrap = q('[data-rw-tijden]');
    var wachtKader = q('[data-rw-wacht]');
    var wachtVink = q('[data-rw-wachtvink]');
    var groepNoot = q('[data-rw-groep]');
    var momentTip = q('[data-rw-moment-tip]');

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

    q('[data-rw-moment]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-m]');
      if (!b) return;
      moment = b.dataset.m;
      this.querySelectorAll('.slot').forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
      if (momentTip) momentTip.textContent = T.momentTip[moment];
      tijd = null;
      wachtKader.hidden = true;
      if (datum) toonTijden();
    });

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
        var r = await fetch('/api/beschikbaarheid?datum=' + encodeURIComponent(datum));
        var j = await r.json();
        if (j.ok) { bezet = j.bezet || {}; capaciteit = j.capaciteitPerSlot || capaciteit; }
      } catch (e) { /* server onbereikbaar: toon de tijden zonder bezetting */ }
      toonTijden();
    }

    function toonTijden() {
      if (!datum) return;
      var nu = new Date();
      var isVandaag = datum === iso(nu);
      var d = new Date(datum + 'T12:00');
      var start = openVanaf(d);
      tijdenWrap.innerHTML = SLOTS[moment].map(function (t) {
        var um = t.split(':');
        var slotUur = +um[0] + (+um[1]) / 60;
        if (slotUur < start) return '';
        if (isVandaag) {
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
      wachtKader.hidden = !vol;          /* wachtlijst is een keuze: alleen tonen, nooit aanvinken */
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
      if (!/^[\d+][\d\s\-()]{7,}$/.test(telefoon)) { fout('telefoon', T.telFout); ok = false; }
      if (!ok) return;

      var knop = this;
      knop.disabled = true; knop.textContent = T.versturen;

      try {
        var r = await fetch('/api/reservering', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            naam: naam, telefoon: telefoon, datum: datum, tijd: tijd, personen: personen,
            moment: T.momenten[moment],
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
        var datumTekst = d.toLocaleDateString(EN ? 'en-GB' : 'nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
        q('[data-rw-nummer]').textContent = T.reservering + j.id;
        q('[data-rw-tekst]').textContent = j.status === 'wachtlijst'
          ? T.wachtlijstTekst(datumTekst, tijd, personen, telefoon)
          : T.bevestigd(naam, personen, datumTekst, tijd);

        var agenda = q('[data-rw-agenda]');
        if (agenda && j.status !== 'wachtlijst') {
          var stamp = datum.replace(/-/g, '') + 'T' + tijd.replace(':', '') + '00';
          var eind = new Date(datum + 'T' + tijd + ':00');
          eind.setHours(eind.getHours() + 2);
          var eindStamp = iso(eind).replace(/-/g, '') + 'T' + String(eind.getHours()).padStart(2, '0') + String(eind.getMinutes()).padStart(2, '0') + '00';
          var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mettafel//Bolwerk//NL', 'BEGIN:VEVENT',
            'UID:' + j.id + '@bolwerkdenbosch.nl',
            'DTSTART:' + stamp, 'DTEND:' + eindStamp,
            'SUMMARY:' + T.icsTitel + ' (' + j.id + ')',
            'LOCATION:Sint Janssingel 25\\, 5211 DA \'s-Hertogenbosch',
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

  /* ---------- vast op de pagina (reserveren.html) ---------- */
  var inline = document.querySelector('[data-reserveer-widget]');
  if (inline) {
    inline.innerHTML = MARKUP;
    Widget(inline);
  }

  /* ---------- compact paneel rechtsonder, op elke andere pagina ---------- */
  if (!inline) {
    var overlay = document.createElement('div');
    overlay.className = 'rw-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="rw-paneel" role="dialog" aria-modal="true" aria-label="' + T.titel + '">' +
      '  <div class="rw-paneel-kop">' +
      '    <div><span class="eyebrow">Bolwerk</span><h2>' + T.titel + '</h2></div>' +
      '    <button type="button" class="rw-sluit" data-rw-sluit aria-label="' + T.sluiten + '"><svg class="ikoon" aria-hidden="true"><use href="assets/iconen.svg#i-kruis"/></svg></button>' +
      '  </div>' + MARKUP +
      '</div>';
    document.body.appendChild(overlay);
    Widget(overlay);

    var zwever = document.createElement('button');
    zwever.type = 'button';
    zwever.className = 'knop knop-vol reserveer-zwever';
    zwever.setAttribute('data-reserveer-open', '');
    zwever.innerHTML = '<svg class="ikoon" aria-hidden="true"><use href="assets/iconen.svg#i-parasol"/></svg> ' + T.zwever;
    document.body.appendChild(zwever);

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
      if (e.target.closest('[data-rw-sluit]')) toon(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) { toon(false); return; }
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
    var reserveerPad = EN ? 'reserveren-en.html' : 'reserveren.html';
    document.querySelectorAll('a[href="' + reserveerPad + '"]').forEach(function (a) {
      if (a.closest('footer') || a.closest('.mobiel-menu')) return;
      a.addEventListener('click', function (e) { e.preventDefault(); toon(overlay.hidden); });
    });
  }
})();
