/* Restaurant Rhodos: paginagedrag. Fail-open: zonder JavaScript staat alles er al. */
(function () {
  'use strict';

  /* ---------- live openstatus ----------
     ma t/m vr en zo: 15.30-22.00, za: 11.30-22.00 (lunch tot 15.00). */
  function openVenster(dag) { return dag === 6 ? [11 * 60 + 30, 22 * 60] : [15 * 60 + 30, 22 * 60]; }
  var DAGNAAM = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var EN = document.documentElement.lang === 'en';
  var DAGNAAM_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function uurTekst(min) {
    var u = Math.floor(min / 60), m = min % 60;
    return (EN ? u + ':' : u + '.') + String(m).padStart(2, '0');
  }

  document.querySelectorAll('[data-openstatus]').forEach(function (chip) {
    var tekst = chip.querySelector('[data-openstatus-tekst]');
    if (!tekst) return;
    try {
      var nu = new Date();
      var minuten = nu.getHours() * 60 + nu.getMinutes();
      var venster = openVenster(nu.getDay());
      if (minuten >= venster[0] && minuten < venster[1]) {
        tekst.textContent = EN
          ? 'Open now, until ' + uurTekst(venster[1])
          : 'Nu geopend, tot ' + uurTekst(venster[1]) + ' uur';
      } else if (minuten < venster[0]) {
        tekst.textContent = EN
          ? 'Opens today at ' + uurTekst(venster[0])
          : 'Vandaag geopend vanaf ' + uurTekst(venster[0]) + ' uur';
      } else {
        var morgen = (nu.getDay() + 1) % 7;
        var mv = openVenster(morgen);
        tekst.textContent = EN
          ? 'Closed for today, ' + DAGNAAM_EN[morgen] + ' open from ' + uurTekst(mv[0])
          : 'Vandaag gesloten, ' + DAGNAAM[morgen] + ' weer open vanaf ' + uurTekst(mv[0]) + ' uur';
        chip.classList.add('dicht');
      }
    } catch (e) { /* de vaste tekst blijft staan */ }
  });

  /* vandaag uitlichten in de openingstijden-tabel */
  try {
    var dag = new Date().getDay();
    document.querySelectorAll('[data-tijden] .rij').forEach(function (rij) {
      var d = rij.getAttribute('data-dag');
      var vandaag = (d === '1' && dag >= 1 && dag <= 5) || (d === '6' && dag === 6) || (d === '0' && dag === 0);
      rij.classList.toggle('vandaag', vandaag);
    });
  } catch (e) {}

  /* jaartal */
  document.querySelectorAll('[data-jaar]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- mobiel menu ---------- */
  var menuknop = document.querySelector('[data-menuknop]');
  var mobielmenu = document.querySelector('[data-mobielmenu]');
  if (menuknop && mobielmenu) {
    function zet(open) {
      mobielmenu.classList.toggle('open', open);
      menuknop.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    menuknop.addEventListener('click', function () { zet(!mobielmenu.classList.contains('open')); });
    mobielmenu.addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target.closest('[data-menusluit]') || e.target.closest('[data-reserveer-open]')) zet(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zet(false); });
  }

  /* ---------- mobiele actiebalk: tonen zodra de hero uit beeld is ---------- */
  var actiebalk = document.querySelector('[data-actiebalk]');
  var hero = document.querySelector('.hero-vol, .hero, .paginakop');
  if (actiebalk) {
    if (!hero) { actiebalk.classList.add('zichtbaar'); }
    else {
      var toonBalk = function () {
        var onder = hero.getBoundingClientRect().bottom;
        var bijVoet = document.querySelector('.voet') && document.querySelector('.voet').getBoundingClientRect().top < window.innerHeight;
        actiebalk.classList.toggle('zichtbaar', onder < 0 && !bijVoet);
      };
      window.addEventListener('scroll', toonBalk, { passive: true });
      toonBalk();
    }
  }

  /* ---------- lichtslinger: lampen gloeien aan wanneer hij in beeld komt ---------- */
  var slingers = document.querySelectorAll('[data-slinger]');
  if (slingers.length) {
    if ('IntersectionObserver' in window) {
      var kijker = new IntersectionObserver(function (items) {
        items.forEach(function (item) {
          if (item.isIntersecting) { item.target.classList.add('aan'); kijker.unobserve(item.target); }
        });
      }, { threshold: 0.4 });
      slingers.forEach(function (s) { kijker.observe(s); });
      /* vangnet: na 2 seconden gaan ze sowieso aan als ze in beeld staan */
      setTimeout(function () {
        slingers.forEach(function (s) {
          var r = s.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) s.classList.add('aan');
        });
      }, 2000);
    } else {
      slingers.forEach(function (s) { s.classList.add('aan'); });
    }
  }

  /* ---------- lichte parallax op de zwevende boogkaders (alleen muis) ---------- */
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var dieptes = Array.prototype.slice.call(document.querySelectorAll('[data-diepte]'));
    if (dieptes.length) {
      var raf = null;
      window.addEventListener('scroll', function () {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var mid = window.innerHeight / 2;
          dieptes.forEach(function (el) {
            var f = parseFloat(el.getAttribute('data-diepte')) || 0;
            var r = el.getBoundingClientRect();
            var afstand = (r.top + r.height / 2) - mid;
            el.style.transform = 'translateY(' + (afstand * f * -1).toFixed(1) + 'px)';
          });
        });
      }, { passive: true });
    }
  }

  /* ---------- menukaart: categoriechips volgen de scroll; mobiel klapt in ---------- */
  var kaartnav = document.querySelector('.kaart-nav');
  if (kaartnav) {
    var links = kaartnav.querySelectorAll('a[href^="#"]');
    var secties = Array.prototype.map.call(links, function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    var zetActief = function () {
      var beste = null;
      secties.forEach(function (s) { if (s.getBoundingClientRect().top < 190) beste = s; });
      links.forEach(function (a) { a.classList.toggle('actief', beste && a.getAttribute('href') === '#' + beste.id); });
    };
    window.addEventListener('scroll', zetActief, { passive: true });
    zetActief();
    /* een ankerlink naar een categorie klapt hem open */
    function openDoel() {
      var doel = location.hash && document.querySelector('.kaart-categorie' + location.hash.replace(/[^#\w-]/g, ''));
      if (doel) doel.setAttribute('open', '');
    }
    window.addEventListener('hashchange', openDoel);
    openDoel();
    kaartnav.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var doel = document.getElementById(a.getAttribute('href').slice(1));
      if (doel) doel.setAttribute('open', '');
    });
    /* op mobiel klappen alle categorieën behalve de eerste dicht */
    if (window.matchMedia('(max-width: 860px)').matches) {
      document.querySelectorAll('.kaart-categorie[open]').forEach(function (d, i) {
        if (i > 0) d.removeAttribute('open');
      });
    }
  }
})();

/* ---------- koppen op vaste regels ----------
   Meet de breedte van elke .kopregel met canvas en schaal de lettergrootte
   zodat de regel past. Zonder JavaScript geldt gewoon de CSS-maat. */
(function () {
  'use strict';
  var koppen = [].slice.call(document.querySelectorAll('[data-kop-vast]'));
  if (!koppen.length) return;
  var ctx = document.createElement('canvas').getContext('2d');
  function zet() {
    koppen.forEach(function (k) {
      var regels = k.querySelectorAll('.kopregel');
      if (!regels.length) return;
      k.style.fontSize = '';
      var s = getComputedStyle(k);
      var maat = parseFloat(s.fontSize);
      var lsEm = (parseFloat(s.letterSpacing) || 0) / maat;
      ctx.font = s.fontStyle + ' ' + s.fontWeight + ' 100px ' + s.fontFamily;
      var breedste = 0;
      regels.forEach(function (r) {
        var tekst = r.textContent;
        if (s.textTransform === 'uppercase') tekst = tekst.toUpperCase();
        var w = ctx.measureText(tekst).width + tekst.length * lsEm * 100;
        if (w > breedste) breedste = w;
      });
      var ruimte = k.clientWidth;
      if (!breedste || !ruimte) return;
      var past = ruimte / (breedste / 100) * 0.985;
      /* nooit onder de leesbare ondergrens: dan mag de regel liever omlopen */
      if (past < maat) k.style.fontSize = Math.max(past, 30).toFixed(1) + 'px';
    });
  }
  var klaar = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  klaar.then(zet);
  zet();
  var wacht;
  window.addEventListener('resize', function () { clearTimeout(wacht); wacht = setTimeout(zet, 120); });
})();
