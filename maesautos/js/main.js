/* main.js: Maes Auto's. Showroom-kiezer met slingerend sleutellabel,
   voorraadfilter, reviewcarrousel, WhatsApp-widget, openstatus en formulier.
   Alles is fail-open: zonder dit script staat er een complete pagina. */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var muis = window.matchMedia('(pointer: fine)').matches;
  var WA = '31657288660';

  /* ---------- Het slingerende label ----------
     Een gedempte slinger: scrollen en wisselen geven een tikje,
     de muis duwt zachtjes. Draait alleen zolang er beweging is. */
  var slinger = document.querySelector('[data-slinger]');
  var hoek = 0, snelheid = 0, loopt = false;
  function stap() {
    snelheid += -hoek * 0.035;      // veer terug naar het midden
    snelheid *= 0.955;              // demping
    hoek += snelheid;
    if (hoek > 18) hoek = 18; if (hoek < -18) hoek = -18;
    slinger.style.setProperty('--hoek', hoek.toFixed(2) + 'deg');
    if (Math.abs(hoek) < 0.03 && Math.abs(snelheid) < 0.03) { hoek = 0; slinger.style.setProperty('--hoek', '0deg'); loopt = false; return; }
    requestAnimationFrame(stap);
  }
  function tik(kracht) {
    if (!slinger || kalm) return;
    snelheid += kracht;
    if (!loopt) { loopt = true; requestAnimationFrame(stap); }
  }
  if (slinger && !kalm) {
    setTimeout(function () { tik(2.6); }, 650);
    var vorigeY = window.scrollY;
    window.addEventListener('scroll', function () {
      var dy = window.scrollY - vorigeY; vorigeY = window.scrollY;
      if (window.scrollY < window.innerHeight * 1.2) tik(Math.max(-1.2, Math.min(1.2, dy * 0.03)));
    }, { passive: true });
    if (muis) {
      var hero = document.querySelector('.hero');
      var vorigeX = null;
      hero.addEventListener('mousemove', function (e) {
        if (vorigeX !== null) tik(Math.max(-.5, Math.min(.5, (e.clientX - vorigeX) * 0.012)));
        vorigeX = e.clientX;
      });
      hero.addEventListener('mouseleave', function () { vorigeX = null; });
    }
  }

  /* ---------- Showroom-kiezer ---------- */
  var dataEl = document.getElementById('hero-data');
  var foto = document.querySelector('[data-wand-foto]');
  var label = document.querySelector('[data-label]');
  var kiesKnoppen = [].slice.call(document.querySelectorAll('[data-kies]'));
  var autos = [];
  try { autos = JSON.parse(dataEl.textContent); } catch (e) { autos = []; }
  var huidig = 0, timer = null, aangeraakt = false;

  function toon(i, doorGebruiker) {
    if (!autos[i] || i === huidig) return;
    huidig = i;
    var a = autos[i];
    kiesKnoppen.forEach(function (k, n) { k.setAttribute('aria-pressed', String(n === i)); });
    // foto: nieuwe laag erover, oude weg
    var nieuw = new Image();
    nieuw.src = a.groot; nieuw.srcset = a.klein + ' 640w, ' + a.groot + ' 1400w';
    nieuw.sizes = foto.sizes; nieuw.alt = a.alt; nieuw.width = 1400; nieuw.height = 1050;
    nieuw.className = 'weg';
    var oud = foto;
    oud.parentNode.insertBefore(nieuw, oud.nextSibling);
    foto = nieuw;
    var klaar = function () {
      setTimeout(function () { nieuw.classList.remove('weg'); oud.classList.add('weg'); }, 30);
      setTimeout(function () { oud.remove(); }, 900);
    };
    if (nieuw.complete) klaar(); else { nieuw.onload = klaar; nieuw.onerror = klaar; }
    // label draait even weg en komt terug met de nieuwe auto
    label.classList.add('draait');
    setTimeout(function () { label.innerHTML = a.label; label.classList.remove('draait'); }, kalm ? 0 : 230);
    tik(doorGebruiker ? 3.4 : 2.2);
  }
  kiesKnoppen.forEach(function (k) {
    k.addEventListener('click', function () { aangeraakt = true; clearInterval(timer); toon(+k.dataset.kies, true); });
  });
  if (autos.length > 1 && !kalm) {
    timer = setInterval(function () {
      if (aangeraakt || document.hidden) return;
      var hero = document.querySelector('.hero').getBoundingClientRect();
      if (hero.bottom < 0) return;
      toon((huidig + 1) % autos.length, false);
    }, 6500);
    var showroom = document.querySelector('.showroom');
    if (showroom) showroom.addEventListener('mouseenter', function () { aangeraakt = true; });
  }

  /* ---------- Voorraadfilter ---------- */
  var filters = [].slice.call(document.querySelectorAll('[data-filter]'));
  var kaarten = [].slice.call(document.querySelectorAll('.voorraad .auto:not([data-altijd])'));
  var leeg = document.querySelector('[data-leeg]');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      var k = f.dataset.filter, n = 0;
      filters.forEach(function (x) { x.setAttribute('aria-pressed', String(x === f)); });
      kaarten.forEach(function (c) {
        var past = k === 'alles' || c.dataset.groep === k || c.dataset.soort === k;
        c.hidden = !past; if (past) n++;
      });
      if (leeg) leeg.classList.toggle('toon', n === 0);
    });
  });

  /* ---------- Reviewcarrousel: pijlen ---------- */
  var rij = document.querySelector('[data-carrousel]');
  document.querySelectorAll('[data-schuif]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!rij) return;
      var kaart = rij.firstElementChild;
      var w = kaart ? kaart.getBoundingClientRect().width + 16 : 300;
      rij.scrollBy({ left: w * +b.dataset.schuif, behavior: kalm ? 'auto' : 'smooth' });
    });
  });

  /* ---------- WhatsApp-widget ---------- */
  var waBox = document.querySelector('[data-wa]');
  if (waBox) {
    var waKnop = waBox.querySelector('[data-wa-knop]');
    var zet = function (open) {
      waBox.classList.toggle('open', open);
      waKnop.setAttribute('aria-expanded', String(open));
      waKnop.setAttribute('aria-label', open ? 'WhatsApp sluiten' : 'WhatsApp openen');
      if (open) waKnop.classList.remove('puls');
    };
    waKnop.addEventListener('click', function () { zet(!waBox.classList.contains('open')); });
    waBox.querySelector('[data-wa-sluit]').addEventListener('click', function () { zet(false); waKnop.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zet(false); });
  }

  /* ---------- Openstatus en vandaag in de tabel ---------- */
  var TIJDEN = { 1: [9, 17], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 17], 6: [10, 16], 0: null };
  var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var nu = new Date(), dag = nu.getDay(), uur = nu.getHours() + nu.getMinutes() / 60;
  var rijVandaag = document.querySelector('.tijden tr[data-dag="' + dag + '"]');
  if (rijVandaag) rijVandaag.classList.add('vandaag');
  var chip = document.querySelector('[data-open]');
  if (chip) {
    var t = TIJDEN[dag], tekst, open = false;
    var u = function (h) { return (h < 10 ? '0' : '') + h + '.00'; };
    if (t && uur >= t[0] && uur < t[1]) { open = true; tekst = 'Nu open, tot ' + u(t[1]) + ' uur'; }
    else if (t && uur < t[0]) { tekst = 'Vandaag open vanaf ' + u(t[0]) + ' uur'; }
    else {
      var d = (dag + 1) % 7; while (!TIJDEN[d]) d = (d + 1) % 7;
      tekst = (d === (dag + 1) % 7 ? 'Morgen' : DAGEN[d].charAt(0).toUpperCase() + DAGEN[d].slice(1)) + ' weer open vanaf ' + u(TIJDEN[d][0]) + ' uur';
    }
    chip.innerHTML = '<span class="stip' + (open ? '' : ' dicht') + '"></span>' + tekst;
  }

  /* ---------- Formulier: bericht klaarzetten in WhatsApp ---------- */
  var form = document.querySelector('[data-formulier]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      [['naam', 'Vul je naam in, dan weten we wie we spreken.'], ['tel', 'Vul je telefoonnummer in, zodat we je kunnen terugbellen.']].forEach(function (p) {
        var veld = form.elements[p[0]], fout = veld.parentNode.querySelector('.fout');
        var leegVeld = !veld.value.trim() || (p[0] === 'tel' && veld.value.replace(/\D/g, '').length < 9);
        fout.textContent = leegVeld ? p[1] : '';
        veld.setAttribute('aria-invalid', String(leegVeld));
        if (leegVeld && ok) { veld.focus(); ok = false; }
      });
      if (!ok) return;
      var tekst = "Hoi Maes Auto's,\n\nOnderwerp: " + form.elements.over.value +
        (form.elements.bericht.value.trim() ? '\n' + form.elements.bericht.value.trim() : '') +
        '\n\nNaam: ' + form.elements.naam.value.trim() + '\nTelefoon: ' + form.elements.tel.value.trim();
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(tekst), '_blank', 'noopener');
    });
  }

  /* ---------- Knoppen naar pagina's die nog komen ----------
     De homepage is een voorproef: links naar #, .html-pagina's bestaan nog niet.
     Klik op zo'n knop doet niets in plaats van een 404. */
  document.querySelectorAll('a[href="#"], a[href$=".html"]:not([href="index.html"])').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();
