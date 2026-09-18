/* Irakees Restaurant Bagdad: paginalogica. Powered by Mettafel.
   Openstatus (di t/m zo 17:00-22:00), mobiel menu (incl. sluitknop),
   sticky header, actiebalk, en het gouden girih-lijnwerk dat zichzelf tekent. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';

  /* ---------- live openstatus ---------- */
  /* Vaste tijden (bron: restaurantbagdad.nl): ma gesloten, di t/m zo 17:00-22:00. */
  var DAGEN = EN ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                 : ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  function open(dag) { return dag === 1 ? null : { van: 17, tot: 22 }; }

  function statusTekst() {
    var nu = new Date(), d = nu.getDay(), u = nu.getHours() + nu.getMinutes() / 60;
    var t = open(d);
    if (t && u >= t.van && u < t.tot) return { open: true, tekst: EN ? 'Open now until 22:00' : 'Nu geopend tot 22.00 uur' };
    if (t && u < t.van) return { open: false, tekst: EN ? 'Opens today at 17:00' : 'Vanavond geopend vanaf 17.00 uur' };
    var v = (d + 1) % 7; var stap = 1;
    while (!open(v)) { v = (v + 1) % 7; stap++; }
    var wanneer = stap === 1 ? (EN ? 'tomorrow' : 'morgen') : DAGEN[v];
    return { open: false, tekst: (EN ? 'Closed now, open ' : 'Nu gesloten, ') + wanneer + (EN ? ' from 17:00' : ' weer open om 17.00 uur') };
  }
  document.querySelectorAll('[data-openstatus]').forEach(function (el) {
    try {
      var s = statusTekst();
      el.classList.toggle('dicht', !s.open);
      var span = el.querySelector('span:last-child');
      if (span) span.textContent = s.tekst;
    } catch (e) { /* fail-open: de vaste openingstijden staan al in de HTML */ }
  });
  /* markeer vandaag in openingstijdenlijstjes */
  document.querySelectorAll('[data-uren]').forEach(function (lijst) {
    var d = new Date().getDay();
    var li = lijst.querySelector('[data-dag="' + d + '"]');
    if (li) li.classList.add('nu');
  });

  /* ---------- sticky header ---------- */
  var balk = document.querySelector('.hoofdbalk');
  var actiebalk = document.querySelector('.actiebalk');
  var voet = document.querySelector('.voet');
  function bijScroll() {
    var y = window.scrollY;
    if (balk) balk.classList.toggle('vast', y > 24);
    if (actiebalk) {
      var toon = y > 420;
      if (toon && voet) {
        var r = voet.getBoundingClientRect();
        if (r.top < window.innerHeight - 40) toon = false;
      }
      actiebalk.classList.toggle('zichtbaar', toon);
      document.body.classList.toggle('cta-zichtbaar', toon);
    }
  }
  window.addEventListener('scroll', bijScroll, { passive: true });
  bijScroll();

  /* ---------- mobiel menu (open én sluiten, beide knoppen) ---------- */
  var menu = document.querySelector('.mobiel-menu');
  var knopOpen = document.querySelector('[data-menuknop]');
  function zetMenu(openen) {
    if (!menu) return;
    menu.classList.toggle('open', openen);
    if (knopOpen) knopOpen.setAttribute('aria-expanded', String(openen));
    document.body.style.overflow = openen ? 'hidden' : '';
  }
  if (knopOpen) knopOpen.addEventListener('click', function () { zetMenu(!menu.classList.contains('open')); });
  document.querySelectorAll('[data-menusluit]').forEach(function (b) { b.addEventListener('click', function () { zetMenu(false); }); });
  if (menu) menu.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { zetMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zetMenu(false); });

  /* ---------- reviewwand: pijlen scrollen één kaart ---------- */
  var wand = document.querySelector('[data-wand]');
  if (wand) {
    var stap = function (richting) {
      var kaart = wand.querySelector('.gb-kaart');
      var breedte = kaart ? kaart.getBoundingClientRect().width + 24 : 320;
      wand.scrollBy({ left: richting * breedte, behavior: 'smooth' });
    };
    var vorige = document.querySelector('[data-wand-vorige]');
    var volgende = document.querySelector('[data-wand-volgende]');
    if (vorige) vorige.addEventListener('click', function () { stap(-1); });
    if (volgende) volgende.addEventListener('click', function () { stap(1); });
  }

  /* ---------- girih-lijnwerk dat zichzelf tekent ---------- */
  var tekenaars = [].slice.call(document.querySelectorAll('[data-teken]'));
  if (tekenaars.length && document.documentElement.classList.contains('js')) {
    tekenaars.forEach(function (svg) {
      svg.querySelectorAll('path, polyline, polygon, circle').forEach(function (vorm) {
        try {
          var len = vorm.getTotalLength ? vorm.getTotalLength() : 600;
          vorm.style.setProperty('--pad', Math.ceil(len));
        } catch (e) { /* laat de fallback van 600 staan */ }
      });
    });
    var start = function (svg) { svg.classList.add('getekend'); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { start(e.target); io.unobserve(e.target); } });
      }, { threshold: .25 });
      tekenaars.forEach(function (svg) { io.observe(svg); });
      setTimeout(function () { tekenaars.forEach(function (svg) {
        var r = svg.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) start(svg);
      }); }, 300);
    } else {
      tekenaars.forEach(start);
    }
    /* vangnet: na 4 s staat alles hoe dan ook getekend als het in beeld was */
    setTimeout(function () { tekenaars.forEach(function (svg) {
      var r = svg.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) start(svg);
    }); }, 4000);
  }

  /* ---------- contact- en cateringformulieren ---------- */
  document.querySelectorAll('[data-contactformulier]').forEach(function (cf) {
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var knop = cf.querySelector('button[type="submit"]');
      var extra = [];
      cf.querySelectorAll('[data-extra]').forEach(function (v) {
        if (v.value) extra.push(v.dataset.extra + ': ' + v.value);
      });
      var bericht = (cf.bericht.value || '').trim();
      if (extra.length) bericht = extra.join('\n') + '\n' + bericht;
      var data = {
        naam: (cf.naam.value || '').trim(),
        telefoon: (cf.telefoon ? cf.telefoon.value : '').trim(),
        email: (cf.email ? cf.email.value : '').trim(),
        onderwerp: cf.dataset.onderwerp || 'Contact',
        bericht: bericht,
      };
      if (!data.naam || !bericht) {
        toonMelding(cf, EN ? 'Please fill in your name and message.' : 'Vul in elk geval je naam en je bericht in.', true);
        return;
      }
      knop.disabled = true;
      fetch('/api/aanvraag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (uit) {
          if (!uit.ok) throw new Error(uit.fout || 'fout');
          cf.hidden = true;
          var klaar = cf.parentElement.querySelector('[data-contact-klaar]');
          if (klaar) {
            klaar.hidden = false;
            var naamEl = klaar.querySelector('[data-naam]');
            if (naamEl) naamEl.textContent = data.naam.split(' ')[0];
          }
        })
        .catch(function () {
          knop.disabled = false;
          toonMelding(cf, EN ? 'Sending failed. Please try again, or email info@restaurantbagdad.nl.' : 'Versturen lukte niet. Probeer het opnieuw, of mail naar info@restaurantbagdad.nl.', true);
        });
    });
  });
  function toonMelding(f, tekst, fout) {
    var el = f.querySelector('[data-melding]');
    if (!el) return;
    el.hidden = false; el.textContent = tekst;
    el.style.color = fout ? '#E0876B' : 'inherit';
  }
})();
