/* Eigen bestelsysteem van Broodje Beekveld, powered by Mettafel.
   Zonder JavaScript blijft de kaart volledig leesbaar met prijzen en staat er
   een gewone belknop. Met JavaScript krijgt elk item plus/min-knoppen, komt
   de bestelbalk onderaan en opent het afrekenscherm in drie stappen:
   1. mandje controleren, 2. afhaaltijd en gegevens, 3. bevestiging.
   De bestelling gaat als JSON naar /api/bestelling op de eigen server
   (server.js); betalen gebeurt bij het afhalen. */
(function () {
  'use strict';

  var bron = document.getElementById('menudata');
  if (!bron) return;

  var menu = {};
  try {
    JSON.parse(bron.textContent).forEach(function (it) { menu[it.id] = it; });
  } catch (e) { return; }

  var TEL = '06 27 16 77 05';
  var TEL_HREF = 'tel:+31627167705';
  var APP_HREF = 'https://wa.me/31627167705?text=' + encodeURIComponent('Hoi Broodje Beekveld! Ik heb een vraag over mijn bestelling.');
  var OPEN_DAGEN = [2, 3, 4, 5, 6];      /* dinsdag t/m zaterdag */
  var EERSTE_SLOT = 10 * 60 + 15;        /* 10:15, een kwartier na opening */
  var LAATSTE_SLOT = 14 * 60 + 45;       /* 14:45, een kwartier voor sluiting */
  var MARGE = 20;                        /* minuten vanaf nu */

  var mand = {};
  try { mand = JSON.parse(sessionStorage.getItem('bb-mand') || '{}') || {}; } catch (e) { mand = {}; }
  Object.keys(mand).forEach(function (id) { if (!menu[id] || !(mand[id] > 0)) delete mand[id]; });

  var gegevens = { naam: '', telefoon: '', opmerking: '', dag: '', tijd: '' };
  var tellers = {};

  function euro(n) { return '€ ' + n.toFixed(2).replace('.', ','); }
  function ontsmet(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bewaar() { try { sessionStorage.setItem('bb-mand', JSON.stringify(mand)); } catch (e) {} }

  function telling() {
    var stuks = 0, totaal = 0;
    Object.keys(mand).forEach(function (id) {
      stuks += mand[id];
      totaal += mand[id] * menu[id].p;
    });
    return { stuks: stuks, totaal: Math.round(totaal * 100) / 100 };
  }

  function zet(id, aantal) {
    aantal = Math.max(0, Math.min(99, aantal));
    if (aantal) mand[id] = aantal; else delete mand[id];
    if (tellers[id]) {
      tellers[id].aantal.textContent = aantal;
      tellers[id].houder.classList.toggle('gevuld', aantal > 0);
    }
    bewaar();
    werkBalkBij();
  }

  /* ---------- plus/min-knoppen per item ---------- */
  function maakTelknop(id) {
    var houder = document.createElement('span');
    houder.className = 'telknop';
    houder.innerHTML =
      '<button type="button" data-min aria-label="Eén ' + ontsmet(menu[id].n) + ' minder">−</button>' +
      '<span class="aantal" aria-live="polite">' + (mand[id] || 0) + '</span>' +
      '<button type="button" data-plus aria-label="Eén ' + ontsmet(menu[id].n) + ' meer">+</button>';
    houder.querySelector('[data-plus]').addEventListener('click', function () { zet(id, (mand[id] || 0) + 1); });
    houder.querySelector('[data-min]').addEventListener('click', function () { zet(id, (mand[id] || 0) - 1); });
    return houder;
  }

  document.querySelectorAll('[data-bestel]').forEach(function (plek) {
    var id = plek.getAttribute('data-bestel');
    if (!menu[id]) return;
    var houder = maakTelknop(id);
    plek.appendChild(houder);
    tellers[id] = { houder: houder, aantal: houder.querySelector('.aantal') };
    houder.classList.toggle('gevuld', (mand[id] || 0) > 0);
  });

  /* ---------- bestelbalk ---------- */
  var balk = document.createElement('div');
  balk.className = 'bestelbalk';
  balk.setAttribute('aria-live', 'polite');
  balk.innerHTML = '<span class="info"><span data-samenvatting></span><small>Bestellen powered by Mettafel</small></span><button type="button" class="knop" data-open>Bestellen</button>';
  document.body.appendChild(balk);
  var balkInfo = balk.querySelector('[data-samenvatting]');

  function werkBalkBij() {
    var t = telling();
    document.body.classList.toggle('met-bestelbalk', t.stuks > 0);
    if (t.stuks === 0) { balk.classList.remove('zichtbaar'); return; }
    balkInfo.textContent = t.stuks + (t.stuks === 1 ? ' item' : ' items') + ' · ' + euro(t.totaal);
    balk.classList.add('zichtbaar');
  }
  werkBalkBij();

  document.querySelectorAll('[data-start-bestellen]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var doel = document.getElementById('broodjes');
      if (!doel) return;
      e.preventDefault();
      doel.setAttribute('open', '');
      doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- afhaaltijden: kwartierstappen binnen de openingstijden ---------- */
  var DAGNAMEN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  function twee(n) { return (n < 10 ? '0' : '') + n; }
  function datumKort(d) { return DAGNAMEN[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()]; }
  function datumIso(d) { return d.getFullYear() + '-' + twee(d.getMonth() + 1) + '-' + twee(d.getDate()); }

  function afhaaldagen() {
    var nu = new Date();
    var vroegst = new Date(nu.getTime() + MARGE * 60000);
    var uit = [];
    for (var i = 0; i < 9 && uit.length < 3; i++) {
      var d = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + i);
      if (OPEN_DAGEN.indexOf(d.getDay()) === -1) continue;
      var slots = [];
      for (var m = EERSTE_SLOT; m <= LAATSTE_SLOT; m += 15) {
        var slot = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(m / 60), m % 60);
        if (slot < vroegst) continue;
        slots.push(twee(Math.floor(m / 60)) + ':' + twee(m % 60));
      }
      if (!slots.length) continue;
      uit.push({
        iso: datumIso(d),
        kort: datumKort(d),
        woord: i === 0 ? 'vandaag' : (i === 1 ? 'morgen' : 'op ' + datumKort(d)),
        label: i === 0 ? 'Vandaag' : (i === 1 ? 'Morgen' : datumKort(d)),
        slots: slots
      });
    }
    return uit;
  }

  /* ---------- afrekenscherm ---------- */
  var dialoog = document.createElement('dialog');
  dialoog.className = 'besteldialoog';
  dialoog.setAttribute('aria-label', 'Bestellen voor afhalen');
  document.body.appendChild(dialoog);
  var sluitIcoon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';
  var sluitKnop = '<button type="button" class="sluit" data-sluit aria-label="Sluiten">' + sluitIcoon + '</button>';
  var pijl = '<svg aria-hidden="true"><use href="assets/iconen.svg#i-pijl"/></svg>';
  var vink = '<svg aria-hidden="true"><use href="assets/iconen.svg#i-vink"/></svg>';

  function toon(html) {
    dialoog.innerHTML = '<div class="binnen">' + sluitKnop + html + '</div>';
    dialoog.querySelectorAll('[data-sluit]').forEach(function (b) { b.addEventListener('click', function () { dialoog.close(); }); });
    var kop = dialoog.querySelector('h2');
    if (kop) { kop.setAttribute('tabindex', '-1'); kop.focus({ preventScroll: true }); }
    dialoog.querySelector('.binnen').scrollTop = 0;
  }

  function open() {
    if (!dialoog.open) {
      if (typeof dialoog.showModal === 'function') dialoog.showModal();
      else dialoog.setAttribute('open', '');
    }
  }

  /* stap 1: mandje controleren */
  function stap1() {
    var t = telling();
    if (!t.stuks) { dialoog.close(); return; }
    var regels = Object.keys(mand).map(function (id) {
      return '<div class="regel" data-regel="' + id + '"><span>' + ontsmet(menu[id].n) + '</span><span data-teller></span><span class="prijs">' + euro(mand[id] * menu[id].p) + '</span></div>';
    }).join('');
    toon(
      '<span class="stapnaam">Stap 1 van 3 · je mandje</span>' +
      '<h2>Klopt dit zo?</h2>' +
      '<div data-regels>' + regels + '</div>' +
      '<div class="totaal"><span>Totaal</span><span data-totaal>' + euro(t.totaal) + '</span></div>' +
      '<p class="hint">Betalen doe je bij het afhalen, contant of met pin. Allergie of wens? Dat kun je in de volgende stap kwijt.</p>' +
      '<div class="knoppen"><button type="button" class="knop knop-vol" data-verder>Kies je afhaaltijd' + pijl + '</button></div>'
    );
    dialoog.querySelectorAll('[data-regel]').forEach(function (rij) {
      var id = rij.getAttribute('data-regel');
      var tk = maakTelknop(id);
      rij.querySelector('[data-teller]').appendChild(tk);
      tk.classList.add('gevuld');
      tk.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          var t2 = telling();
          if (!mand[id]) { rij.remove(); } else {
            tk.querySelector('.aantal').textContent = mand[id];
            rij.querySelector('.prijs').textContent = euro(mand[id] * menu[id].p);
          }
          if (!t2.stuks) { dialoog.close(); return; }
          dialoog.querySelector('[data-totaal]').textContent = euro(t2.totaal);
        });
      });
    });
    dialoog.querySelector('[data-verder]').addEventListener('click', stap2);
  }

  /* stap 2: afhaaltijd en gegevens */
  function stap2() {
    var dagen = afhaaldagen();
    if (!dagen.length) {
      toon('<span class="stapnaam">Stap 2 van 3 · afhalen</span><h2>Even geen tijden</h2><p>We konden nu geen afhaaltijd vinden. Bel ons even, dan regelen we het zo.</p><div class="knoppen"><a class="knop knop-vol" href="' + TEL_HREF + '">Bel ' + TEL + '</a></div>');
      return;
    }
    if (!dagen.some(function (d) { return d.iso === gegevens.dag; })) { gegevens.dag = dagen[0].iso; gegevens.tijd = ''; }
    var dagOpties = dagen.map(function (d) { return '<option value="' + d.iso + '"' + (d.iso === gegevens.dag ? ' selected' : '') + '>' + d.label + '</option>'; }).join('');
    toon(
      '<span class="stapnaam">Stap 2 van 3 · afhalen</span>' +
      '<h2>Wanneer haal je het op?</h2>' +
      '<form novalidate data-form>' +
      '<div class="velden2">' +
      '<label class="veld"' + (dagen.length === 1 ? ' hidden' : '') + '>Dag<select name="dag" data-dag>' + dagOpties + '</select></label>' +
      '<label class="veld">Afhaaltijd<select name="tijd" data-tijd></select><span class="melding" data-fout="afhaaltijd"></span></label>' +
      '</div>' +
      '<p class="hint">Minimaal 20 minuten vanaf nu, in kwartierstappen. We zijn open van dinsdag tot en met zaterdag, 10.00 tot 15.00 uur.</p>' +
      '<label class="veld">Je naam<input type="text" name="naam" autocomplete="name" value="' + ontsmet(gegevens.naam) + '" required><span class="melding" data-fout="naam"></span></label>' +
      '<label class="veld">Telefoonnummer <span class="noot">(voor als er iets is met je bestelling)</span><input type="tel" name="telefoon" inputmode="tel" autocomplete="tel" value="' + ontsmet(gegevens.telefoon) + '" required><span class="melding" data-fout="telefoon"></span></label>' +
      '<label class="veld">Opmerking <span class="noot">(allergie, zonder rucola, wat je maar wilt)</span><textarea name="opmerking" rows="2">' + ontsmet(gegevens.opmerking) + '</textarea></label>' +
      '<div class="melding algemeen" data-fout="algemeen" hidden></div>' +
      '<div class="knoppen">' +
      '<button type="submit" class="knop knop-vol" data-plaats>Plaats je bestelling' + pijl + '</button>' +
      '<span class="mettafel">Bestellen powered by Mettafel</span>' +
      '<button type="button" class="terug" data-terug>' + pijl + 'Terug naar je mandje</button>' +
      '</div>' +
      '</form>'
    );
    var form = dialoog.querySelector('[data-form]');
    var dagVeld = form.querySelector('[data-dag]');
    var tijdVeld = form.querySelector('[data-tijd]');
    function vulTijden() {
      var dag = dagen.filter(function (d) { return d.iso === dagVeld.value; })[0] || dagen[0];
      gegevens.dag = dag.iso;
      tijdVeld.innerHTML = dag.slots.map(function (s) { return '<option value="' + s + '"' + (s === gegevens.tijd ? ' selected' : '') + '>' + s + '</option>'; }).join('');
      if (dag.slots.indexOf(gegevens.tijd) === -1) gegevens.tijd = dag.slots[0];
      tijdVeld.value = gegevens.tijd;
    }
    vulTijden();
    dagVeld.addEventListener('change', vulTijden);
    tijdVeld.addEventListener('change', function () { gegevens.tijd = tijdVeld.value; });
    ['naam', 'telefoon', 'opmerking'].forEach(function (naam) {
      form.querySelector('[name="' + naam + '"]').addEventListener('input', function (e) {
        gegevens[naam] = e.target.value;
        toonFout(naam, '');
      });
    });
    form.querySelector('[data-terug]').addEventListener('click', stap1);
    form.addEventListener('submit', function (e) { e.preventDefault(); verstuur(dagen); });
  }

  function toonFout(veld, tekst) {
    var el = dialoog.querySelector('[data-fout="' + veld + '"]');
    if (!el) return;
    el.textContent = tekst;
    if (veld === 'algemeen') { el.hidden = !tekst; el.innerHTML = tekst; return; }
    var label = el.closest('.veld');
    if (label) label.classList.toggle('mis', !!tekst);
  }

  function verstuur(dagen) {
    var fouten = 0;
    if (!gegevens.naam.trim()) { toonFout('naam', 'Vul je naam in, dan weten we voor wie het broodje is.'); fouten++; }
    if (gegevens.telefoon.replace(/\D/g, '').length < 10) { toonFout('telefoon', 'Vul een telefoonnummer in waarop we je kunnen bereiken.'); fouten++; }
    if (!gegevens.tijd) { toonFout('afhaaltijd', 'Kies een afhaaltijd.'); fouten++; }
    if (fouten) {
      var eerste = dialoog.querySelector('.veld.mis input, .veld.mis select');
      if (eerste) eerste.focus();
      return;
    }
    var dag = dagen.filter(function (d) { return d.iso === gegevens.dag; })[0] || dagen[0];
    var t = telling();
    var bestelling = {
      naam: gegevens.naam.trim(),
      telefoon: gegevens.telefoon.trim(),
      afhaaltijd: dag.kort + ' ' + gegevens.tijd,
      afhaaldatum: dag.iso,
      opmerking: gegevens.opmerking.trim(),
      regels: Object.keys(mand).map(function (id) {
        return { naam: menu[id].n, aantal: mand[id], prijs: menu[id].p, opties: [] };
      }),
      totaal: t.totaal
    };
    var knop = dialoog.querySelector('[data-plaats]');
    knop.disabled = true;
    knop.textContent = 'Even geduld...';
    toonFout('algemeen', '');

    var mislukt = function () {
      knop.disabled = false;
      knop.innerHTML = 'Plaats je bestelling' + pijl;
      toonFout('algemeen', 'Bestellen lukt nu even niet. Bel ons op <a href="' + TEL_HREF + '" style="text-decoration:underline">' + TEL + '</a>, dan regelen we het zo.');
    };

    fetch('/api/bestelling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bestelling)
    }).then(function (r) {
      return r.json().then(function (j) { return { status: r.status, j: j }; });
    }).then(function (uit) {
      var j = uit.j || {};
      if (j.ok && j.id) { stap3(j, dag); return; }
      knop.disabled = false;
      knop.innerHTML = 'Plaats je bestelling' + pijl;
      var velden = j.velden || {};
      var getoond = false;
      Object.keys(velden).forEach(function (v) {
        if (dialoog.querySelector('[data-fout="' + v + '"]')) { toonFout(v, velden[v]); getoond = true; }
      });
      if (!getoond) toonFout('algemeen', ontsmet(j.fout || 'Er ging iets mis. Probeer het nog eens of bel ons op ' + TEL + '.'));
      var eerste = dialoog.querySelector('.veld.mis input, .veld.mis select');
      if (eerste) eerste.focus();
    }).catch(mislukt);
  }

  /* stap 3: bevestiging */
  function stap3(antwoord, dag) {
    var naam = gegevens.naam.trim().split(/\s+/)[0];
    toon(
      '<span class="stapnaam">Stap 3 van 3 · gelukt</span>' +
      '<div class="klaar">' +
      '<span class="vink">' + vink + '</span>' +
      '<h2>Gelukt, ' + ontsmet(naam) + '!</h2>' +
      '<span class="nummer">Bestelnummer ' + ontsmet(antwoord.id) + '</span>' +
      '<span class="tijd">' + ontsmet(gegevens.tijd) + '</span>' +
      '<p>Je bestelling staat ' + ontsmet(dag.woord) + ' klaar om ' + ontsmet(gegevens.tijd) + ' aan de Stoofstraat 6. Betalen doe je bij het afhalen. Vragen? App ons.</p>' +
      '</div>' +
      '<div class="knoppen">' +
      '<a class="knop knop-vol" href="' + APP_HREF + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="assets/iconen.svg#i-app"/></svg>App ons bij vragen</a>' +
      '<button type="button" class="knop knop-lijn" data-sluit>Terug naar de kaart</button>' +
      '<span class="mettafel">Bestellen powered by Mettafel</span>' +
      '</div>'
    );
    /* mandje leeg: de bestelling is binnen */
    Object.keys(mand).forEach(function (id) { zet(id, 0); });
    gegevens.opmerking = '';
    gegevens.tijd = '';
  }

  balk.querySelector('[data-open]').addEventListener('click', function () { open(); stap1(); });

  dialoog.addEventListener('click', function (e) {
    if (e.target === dialoog) dialoog.close();
  });
})();
