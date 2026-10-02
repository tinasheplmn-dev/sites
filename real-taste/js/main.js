/* Real Taste: zaakgegevens, live openstatus (ook na middernacht), de nachtklok,
   de nachtbalk met de openingstijden en het team- & party-formulier.
   Laadt vóór bestellen.js (die leest window.ZAAK). Motion zit in motion.js. */
(function () {
  'use strict';

  /* Openingstijden (Uber Eats + Google, okt 2026). tot > 24 = na middernacht.
     zo 11:00-23:00, ma-wo 11:00-00:30, do-za 11:00-02:00. Bevestigen bij de eigenaar. */
  var UREN = { 0: { van: 11, tot: 23 }, 1: { van: 11, tot: 24.5 }, 2: { van: 11, tot: 24.5 }, 3: { van: 11, tot: 24.5 }, 4: { van: 11, tot: 26 }, 5: { van: 11, tot: 26 }, 6: { van: 11, tot: 26 } };
  function uren(dag) { return UREN[dag] || null; }

  var ADRES = '185 East India Dock Road, E14 0EA';
  window.ZAAK = {
    naam: 'Real Taste',
    sleutel: 'realtaste',
    bezorgen: true,
    bereidtijd: 20,
    uren: uren,
    tip: { item: 'chilli-sauce', tekst: 'Add a tub of our chilli sauce?' },
    afhaalNoot: 'Collect at ' + ADRES + '. Pay at the counter.',
    bezorgNoot: 'We call you to confirm your address is in our delivery area, and any delivery charge, before we cook. Pay on delivery.',
    bevestigAfhalen: function (naam, n, tot, tijd) { return 'Thanks ' + naam + '! Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') goes in the fryer and will be ready ' + tijd + '. Collect it at 185 East India Dock Road and pay at the counter.'; },
    bevestigBezorgen: function (naam, n, tot, tijd) { return 'Thanks ' + naam + '! We have your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') for ' + tijd + '. We call you shortly to confirm your address, then it goes in the fryer. Pay on delivery.'; },
  };

  /* ---------- live openstatus, ook na middernacht ---------- */
  var DAGEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function hhmm(u) { u = u % 24; var h = Math.floor(u), m = Math.round((u - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function status(nu) {
    nu = nu || new Date();
    var t = nu.getHours() + nu.getMinutes() / 60;
    var dag = nu.getDay();
    var gister = uren((dag + 6) % 7);
    if (gister && gister.tot > 24 && t < gister.tot - 24) return { open: true, tot: gister.tot - 24, tekst: 'Open now until ' + hhmm(gister.tot) };
    var u = uren(dag);
    if (u && t >= u.van && t < u.tot) return { open: true, tot: u.tot, tekst: 'Open now until ' + hhmm(u.tot) + (u.tot > 24 ? ' tonight' : '') };
    if (u && t < u.van) return { open: false, tekst: 'Opens today at ' + hhmm(u.van) };
    for (var d = 1; d < 7; d++) {
      var v = uren((dag + d) % 7);
      if (v) return { open: false, tekst: 'Closed now, open ' + (d === 1 ? 'tomorrow' : DAGEN[(dag + d) % 7]) + ' from ' + hhmm(v.van) };
    }
    return { open: false, tekst: 'Closed now' };
  }
  window.RealTasteStatus = status;
  function toonStatus() {
    var s = status();
    document.querySelectorAll('[data-openstatus]').forEach(function (el) {
      var t = el.querySelector('[data-openstatus-tekst]') || el;
      t.textContent = s.tekst;
      el.classList.toggle('dicht', !s.open);
    });
    /* de dag die nu loopt (na middernacht hoort 01:00 nog bij gisteravond) */
    var nu = new Date(), dag = nu.getDay();
    var gister = uren((dag + 6) % 7), t = nu.getHours() + nu.getMinutes() / 60;
    var lopend = gister && gister.tot > 24 && t < gister.tot - 24 ? (dag + 6) % 7 : dag;
    document.querySelectorAll('[data-dag]').forEach(function (r) { r.classList.toggle('vandaag', +r.getAttribute('data-dag') === lopend); });
    tekenNachtbalk(lopend, t < 6 && lopend !== dag ? t + 24 : t);
  }

  /* ---------- de nachtbalk: per dag een balk van 11:00 tot sluiting, over middernacht heen ---------- */
  var BEGIN = 10, EIND = 27; /* schaal 10:00 tot 03:00 */
  function pct(u) { return ((u - BEGIN) / (EIND - BEGIN) * 100).toFixed(2) + '%'; }
  function tekenNachtbalk(lopend, t) {
    var balk = document.querySelector('[data-nachtbalk]');
    if (!balk) return;
    balk.style.setProperty('--middernacht', pct(24));
    balk.querySelectorAll('[data-balkdag]').forEach(function (rij) {
      var d = +rij.getAttribute('data-balkdag'), u = uren(d);
      var staaf = rij.querySelector('.staaf');
      if (!u || !staaf) return;
      staaf.style.left = pct(u.van);
      staaf.style.width = ((u.tot - u.van) / (EIND - BEGIN) * 100).toFixed(2) + '%';
      rij.classList.toggle('vandaag', d === lopend);
      var nu = rij.querySelector('.nu-streep');
      if (nu) {
        var zichtbaar = d === lopend && t >= BEGIN && t <= EIND;
        nu.hidden = !zichtbaar;
        if (zichtbaar) nu.style.left = pct(t);
      }
    });
  }

  toonStatus();
  setInterval(toonStatus, 60000);

  /* ---------- de nachtklok: echte tijd in Londen, wijzers lopen mee ---------- */
  var klokken = document.querySelectorAll('[data-klok]');
  function zetKlok() {
    var nu = new Date();
    var h = nu.getHours() % 12, m = nu.getMinutes(), s = nu.getSeconds();
    klokken.forEach(function (k) {
      k.style.setProperty('--uur', (h * 30 + m * 0.5) + 'deg');
      k.style.setProperty('--min', (m * 6 + s * 0.1) + 'deg');
    });
  }
  if (klokken.length) { zetKlok(); setInterval(zetKlok, 15000); }

  /* ---------- vaste actiebalk (mobiel) pas na de hero ---------- */
  var heroEl = document.querySelector('.hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { document.documentElement.classList.toggle('voorbij-hero', !e[0].isIntersecting); }, { rootMargin: '-40% 0px 0px 0px' }).observe(heroEl);
  } else document.documentElement.classList.add('voorbij-hero');
  var voet = document.querySelector('.voet');
  if (voet && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { document.documentElement.classList.toggle('bij-voet', e[0].isIntersecting); }).observe(voet);
  }

  /* ---------- mobiel menu: ook de sluitknop in het menu ---------- */
  var menu = document.querySelector('[data-menu]');
  var knop = document.querySelector('[data-menuknop]');
  document.querySelectorAll('[data-menu-sluit]').forEach(function (s) {
    s.addEventListener('click', function () {
      if (!menu) return;
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (knop) knop.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- team- & party-orders: aanvraag naar /api/aanvraag ---------- */
  var team = document.querySelector('[data-team-form]');
  if (team) {
    var datum = team.querySelector('[name="datum"]');
    if (datum) { var d0 = new Date(); datum.min = d0.toISOString().slice(0, 10); }
    var fout = function (naam, tekst) {
      var el = team.querySelector('[data-fout="' + naam + '"]');
      if (el) { el.textContent = tekst || ''; el.hidden = !tekst; }
      var veld = team.querySelector('[name="' + naam + '"]');
      if (veld) { veld.setAttribute('aria-invalid', tekst ? 'true' : 'false'); var l = veld.closest('.veld'); if (l) l.classList.toggle('heeft-fout', !!tekst); }
    };
    team.addEventListener('submit', async function (e) {
      e.preventDefault();
      ['naam', 'telefoon', 'aantal', 'datum', 'algemeen'].forEach(function (n) { fout(n, ''); });
      var f = team.elements;
      var naam = f.naam.value.trim(), tel = f.telefoon.value.trim(), aantal = parseInt(f.aantal.value, 10), dt = f.datum.value, tijd = f.tijd.value;
      var eerste = null;
      function mis(n, t) { fout(n, t); if (!eerste) eerste = f[n]; }
      if (!naam) mis('naam', 'Fill in your name.');
      if (!/^[+\d][\d\s\-()]{8,}$/.test(tel)) mis('telefoon', 'Fill in a phone number we can call you on.');
      if (!(aantal >= 10)) mis('aantal', 'Team and party orders start at 10 boxes.');
      if (!dt) mis('datum', 'Pick a day for your order.');
      if (eerste) { eerste.focus(); return; }
      var knopje = team.querySelector('[type="submit"]');
      var oud = knopje.innerHTML;
      knopje.disabled = true; knopje.textContent = 'Sending...';
      try {
        var body = { naam: naam, telefoon: tel, aantal: aantal, datum: dt, tijd: tijd, bericht: f.bericht.value.trim() };
        var res = await fetch('api/aanvraag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        var j = await res.json();
        if (!j.ok) throw new Error(j.fout || res.status);
        var dag = new Date(dt + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
        var klaar = team.parentNode.querySelector('[data-team-klaar]');
        klaar.querySelector('[data-team-nummer]').textContent = 'Request ' + j.id;
        klaar.querySelector('[data-team-tekst]').textContent = 'Thanks ' + naam.split(' ')[0] + '! We have your request for ' + aantal + ' boxes on ' + dag + (tijd ? ' at ' + tijd : '') + '. We call you on ' + tel + ' to confirm what goes in the boxes and the price.';
        team.hidden = true; klaar.hidden = false;
        klaar.focus();
      } catch (err) {
        fout('algemeen', 'Sending did not work (' + err.message + '). Please try again, or call 07378 251430.');
      }
      knopje.disabled = false; knopje.innerHTML = oud;
    });
    var opnieuw = document.querySelector('[data-team-opnieuw]');
    if (opnieuw) opnieuw.addEventListener('click', function () { team.reset(); team.hidden = false; opnieuw.closest('[data-team-klaar]').hidden = true; team.querySelector('input').focus(); });
  }
})();

/* Menukaart: alleen de eerste groep open (fail-open: de HTML zet de eerste open) */
(function () {
  document.querySelectorAll('.kaart-groep').forEach(function (d, i) { if (i > 0) d.removeAttribute('open'); });
})();
