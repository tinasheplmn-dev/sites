/* Rancho Bravo: site-eigen laag bovenop motion.js. Powered by Mettafel.
   1. Het brandmerk: de filmische opening (eenmalig per sessie), die zelf
      overgaat in de homepage.
   2. Live openstatus: elke dag open (ma-do 16.30-22.00, vr-zo 16.00-22.30).
   3. De vitrine: cut kiezen, gewicht op de liniaal, beeld en prijs gaan mee.
   4. Sluitknop in het mobiele menu (motion.js bindt alleen de hoofdknop).
   5. Video's spelen alleen in beeld.
   6. Sectiekoppen op één regel: de lettergrootte schaalt mee met de ruimte.
   Alles fail-open: zonder JavaScript staat er een complete site. */

/* ---------- 1. de filmische opening ---------- */
(function () {
  'use strict';
  var intro = document.querySelector('[data-intro]');
  if (!intro) return;
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gezien = false;
  try { gezien = sessionStorage.getItem('rb-intro') === '1'; } catch (e) {}
  function weg() {
    if (!intro.parentNode || intro.classList.contains('weg')) return;
    intro.classList.add('weg');
    document.body.style.overflow = '';
    try { sessionStorage.setItem('rb-intro', '1'); } catch (e) {}
    setTimeout(function () { intro.remove(); }, 900);
  }
  if (gezien || kalm) { intro.remove(); return; }
  intro.hidden = false;
  document.body.style.overflow = 'hidden';
  var video = intro.querySelector('video');
  if (video) {
    /* een halve tel voor het einde al openen, zodat het logo in de site overloopt */
    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime > video.duration - .45) weg();
    });
    video.addEventListener('ended', weg);
    var spelen = video.play();
    if (spelen && spelen.catch) spelen.catch(weg);
  }
  intro.addEventListener('click', weg);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') weg(); });
  setTimeout(weg, 4000);   /* vangnet: nooit langer dan de film zelf */
})();

/* ---------- 2. live openstatus ---------- */
(function () {
  'use strict';
  var els = document.querySelectorAll('[data-open-status]');
  if (!els.length) return;
  var EN = document.documentElement.lang === 'en';
  var nu = new Date();
  var dag = nu.getDay();
  var weekend = dag === 0 || dag === 5 || dag === 6;   /* vr, za, zo */
  var openVanaf = weekend ? 16 : 16.5;
  var openTot = weekend ? 22.5 : 22;
  var totTekst = weekend ? '22.30' : '22.00';
  var vanafTekst = weekend ? '16.00' : '16.30';
  var uur = nu.getHours() + nu.getMinutes() / 60;
  var tekst, kleur;
  if (uur >= openVanaf && uur < openTot) {
    tekst = EN ? 'Open now, until ' + totTekst : 'Nu geopend, tot ' + totTekst + ' uur';
    kleur = 'var(--ok)';
  } else if (uur < openVanaf) {
    tekst = EN ? 'Open tonight from ' + vanafTekst : 'Vanavond geopend vanaf ' + vanafTekst + ' uur';
    kleur = 'var(--ok)';
  } else {
    var morgenWeekend = (dag + 1) % 7 === 0 || (dag + 1) % 7 === 5 || (dag + 1) % 7 === 6;
    var morgenVanaf = morgenWeekend ? '16.00' : '16.30';
    tekst = EN ? 'Closed for tonight, open again tomorrow from ' + morgenVanaf : 'Vandaag zijn we dicht, morgen weer open vanaf ' + morgenVanaf + ' uur';
    kleur = 'var(--dicht)';
  }
  els.forEach(function (el) {
    el.innerHTML = '<span class="stip" aria-hidden="true" style="background:' + kleur + '"></span> ' + tekst;
  });
})();

/* ---------- 3. de vitrine ---------- */
(function () {
  'use strict';
  var wortel = document.querySelector('[data-cutkiezer]');
  if (!wortel) return;
  var EN = document.documentElement.lang === 'en';
  var CUTS = window.CUTS || [];
  var gekozen = wortel.querySelector('[data-cut][aria-pressed="true"]');
  var actief = (gekozen && CUTS.filter(function (c) { return c.id === gekozen.dataset.cut; })[0]) || CUTS[0];
  var gewicht = null;

  var naamEl = wortel.querySelector('[data-cut-naam]');
  var subEl = wortel.querySelector('[data-cut-sub]');
  var karakterEl = wortel.querySelector('[data-cut-karakter]');
  var gewichtWrap = wortel.querySelector('[data-cut-gewichten]');
  var duim = wortel.querySelector('[data-cut-duim]');
  var prijsEl = wortel.querySelector('[data-cut-prijs]');
  var gramEl = wortel.querySelector('[data-cut-gram]');
  var malsEl = wortel.querySelector('[data-cut-mals]');
  var smaakEl = wortel.querySelector('[data-cut-smaak]');

  function euro(n) { return '€ ' + (n % 1 ? n.toFixed(2).replace('.', ',') : n); }
  function gramLabel(g) { return g >= 1000 ? '1 kg' : g + ' gr'; }
  function stippen(el, n) {
    if (!el) return;
    el.querySelectorAll('i').forEach(function (i, k) { i.classList.toggle('aan', k < n); });
    el.setAttribute('aria-label', n + ' / 5');
  }

  function toonCut() {
    naamEl.textContent = actief.naam;
    subEl.textContent = EN ? actief.en : actief.nl;
    karakterEl.textContent = EN ? actief.karakter_en : actief.karakter;
    stippen(malsEl, actief.mals);
    stippen(smaakEl, actief.smaak);
    wortel.querySelectorAll('[data-cut-beeld]').forEach(function (img) {
      img.classList.toggle('actief', img.dataset.cutBeeld === actief.id);
    });
    var gewichten = Object.keys(actief.gewichten);
    if (gewichten.indexOf(gewicht) === -1) gewicht = gewichten.indexOf('300') !== -1 ? '300' : gewichten[0];
    gewichtWrap.innerHTML = gewichten.map(function (g) {
      return '<button type="button" class="streep" data-g="' + g + '" aria-pressed="' + (g === gewicht) + '"><span>' + gramLabel(+g) + '</span></button>';
    }).join('');
    toonPrijs();
  }
  function toonPrijs() {
    prijsEl.textContent = euro(actief.gewichten[gewicht]);
    gramEl.textContent = gramLabel(+gewicht);
    prijsEl.classList.remove('pop'); void prijsEl.offsetWidth; prijsEl.classList.add('pop');
    var knop = gewichtWrap.querySelector('[data-g="' + gewicht + '"]');
    if (duim && knop) {
      duim.style.setProperty('--duim-x', (knop.offsetLeft + knop.offsetWidth / 2) + 'px');
      duim.hidden = false;
    }
  }

  wortel.querySelectorAll('[data-cut]').forEach(function (knop) {
    knop.addEventListener('click', function () {
      actief = CUTS.filter(function (c) { return c.id === knop.dataset.cut; })[0] || actief;
      wortel.querySelectorAll('[data-cut]').forEach(function (k) { k.setAttribute('aria-pressed', String(k === knop)); });
      toonCut();
    });
  });
  gewichtWrap.addEventListener('click', function (e) {
    var b = e.target.closest('[data-g]');
    if (!b) return;
    gewicht = b.dataset.g;
    gewichtWrap.querySelectorAll('[data-g]').forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
    toonPrijs();
  });
  window.addEventListener('resize', function () { if (gewicht) toonPrijs(); });
  toonCut();
})();

/* ---------- 4. sluitknop in het mobiele menu ---------- */
(function () {
  'use strict';
  var sluit = document.querySelector('[data-menu-sluit]');
  var knop = document.querySelector('[data-menuknop]');
  var menu = document.querySelector('[data-menu]');
  if (!sluit || !knop || !menu) return;
  sluit.addEventListener('click', function () {
    knop.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  });
})();

/* ---------- 5. video's en zicht ----------
   Films met geluid pauzeren zodra ze uit beeld raken; stille sfeervideo's
   spelen juist alleen als ze in beeld staan (sommige browsers pauzeren ze
   zelf buiten beeld en starten ze niet opnieuw). */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var films = document.querySelectorAll('[data-film]');
  if (films.length) {
    var kijker = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting && !e.target.paused) e.target.pause();
      });
    }, { threshold: .1 });
    films.forEach(function (f) { kijker.observe(f); });
  }
  var stil = document.querySelectorAll('video[autoplay]');
  if (stil.length) {
    /* Sommige telefoons weigeren automatisch afspelen, ook bij een stille film:
       de spaarstand van iOS doet dat altijd. Lukt het niet, dan proberen we het
       opnieuw zodra de bezoeker iets doet (tikken, scrollen, toets) of zodra hij
       terugkomt op het tabblad. Die handeling telt als toestemming. */
    var tikWacht = false;
    var tikSoorten = ['pointerdown', 'touchstart', 'keydown', 'scroll'];

    function inBeeld(v) {
      var r = v.getBoundingClientRect();
      return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
    }
    function probeer(v) {
      v.muted = true;
      v.playsInline = true;
      var p = v.play();
      if (p && p.catch) p.catch(wachtOpHandeling);
    }
    function nogmaals() {
      tikSoorten.forEach(function (s) { document.removeEventListener(s, nogmaals); });
      tikWacht = false;
      [].forEach.call(stil, function (v) { if (v.paused && inBeeld(v)) probeer(v); });
    }
    function wachtOpHandeling() {
      if (tikWacht) return;
      tikWacht = true;
      tikSoorten.forEach(function (s) { document.addEventListener(s, nogmaals, { passive: true }); });
    }

    var sfeer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && v.paused) probeer(v);
        else if (!e.isIntersecting && !v.paused) v.pause();
      });
    }, { threshold: .05 });
    stil.forEach(function (v) { sfeer.observe(v); });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      [].forEach.call(stil, function (v) { if (v.paused && inBeeld(v)) probeer(v); });
    });
  }
})();

/* ---------- 6. sectiekoppen op één regel ---------- */
(function () {
  'use strict';
  var koppen = [].slice.call(document.querySelectorAll('.kop-blok h2, [data-een-regel]'));
  if (!koppen.length) return;
  function pas() {
    koppen.forEach(function (h) {
      h.classList.add('een-regel');
      h.style.fontSize = '';
      var ruimte = h.parentElement.clientWidth;
      var cs = getComputedStyle(h.parentElement);
      ruimte -= parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      var nodig = h.scrollWidth;
      if (nodig > ruimte && ruimte > 0) {
        var maat = parseFloat(getComputedStyle(h).fontSize);
        h.style.fontSize = Math.floor(maat * (ruimte / nodig) * .98 * 10) / 10 + 'px';
      }
    });
  }
  var wacht = null;
  pas();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pas);
  window.addEventListener('load', pas);
  window.addEventListener('resize', function () { clearTimeout(wacht); wacht = setTimeout(pas, 120); });
})();
