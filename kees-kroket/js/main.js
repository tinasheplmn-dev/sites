/* Restaria Kees Kroket. Basislaag: fail-open reveals, menu, actiebalk.
   Site-eigen: open-status uit de echte openingstijden, kaartnav-markering. */
(function () {
  'use strict';

  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var foto = /[?&]foto=1/.test(location.search);
  if (!foto) document.documentElement.classList.add('js');

  /* ---------- Header ---------- */
  var balk = document.querySelector('[data-balk]');
  function schaduw() {
    if (balk) balk.classList.toggle('zweeft', window.scrollY > 10);
  }
  window.addEventListener('scroll', schaduw, { passive: true });
  schaduw();

  /* ---------- Mobiel menu ---------- */
  var knop = document.querySelector('[data-menuknop]');
  var menu = document.querySelector('[data-menu]');
  if (knop && menu) {
    var sluit = function () {
      knop.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    };
    knop.addEventListener('click', function () {
      var open = knop.getAttribute('aria-expanded') === 'true';
      if (open) { sluit(); return; }
      knop.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    menu.querySelectorAll('a, button').forEach(function (a) {
      a.addEventListener('click', sluit);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sluit();
    });
  }

  /* ---------- Open-status ----------
     Uren per dag (0 = zondag): [open, dicht] in uren, dicht > 24 loopt de nacht in.
     De volledige tabel staat gewoon in de HTML; dit voegt alleen de live regel toe. */
  var uren = {
    0: [13, 24],
    1: [11, 23],
    2: [11, 23],
    3: [11, 24],
    4: [11, 25.5],
    5: [11, 25.5],
    6: [11, 25.5]
  };
  function urenTekst(u) {
    var h = Math.floor(u % 24);
    var m = Math.round((u % 1) * 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function status() {
    var nu = new Date();
    var dag = nu.getDay();
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var gisteren = (dag + 6) % 7;
    if (uren[gisteren][1] > 24 && uur < uren[gisteren][1] - 24) {
      return { open: true, tot: urenTekst(uren[gisteren][1]) };
    }
    if (uur >= uren[dag][0] && uur < uren[dag][1]) {
      return { open: true, tot: urenTekst(uren[dag][1]) };
    }
    if (uur < uren[dag][0]) {
      return { open: false, om: urenTekst(uren[dag][0]) };
    }
    var morgen = (dag + 1) % 7;
    return { open: false, om: urenTekst(uren[morgen][0]), morgen: true };
  }
  document.querySelectorAll('[data-status]').forEach(function (el) {
    var s = status();
    var bol = el.querySelector('.bol');
    var tekst = el.querySelector('.status-tekst');
    if (!tekst) return;
    if (s.open) {
      tekst.textContent = 'Nu open, vandaag tot ' + s.tot + ' uur';
      if (bol) bol.style.background = '#7ab648';
    } else {
      tekst.textContent = 'Nu gesloten, ' + (s.morgen ? 'morgen ' : '') + 'open om ' + s.om + ' uur';
      if (bol) bol.style.background = '#c96f6f';
    }
  });
  var dagNu = new Date().getDay();
  document.querySelectorAll('[data-dag]').forEach(function (li) {
    if (parseInt(li.getAttribute('data-dag'), 10) === dagNu) li.classList.add('vandaag');
  });

  /* ---------- Kaartnav: actieve categorie markeren ---------- */
  var kaartnav = document.querySelector('[data-kaartnav]');
  if (kaartnav) {
    var links = [].slice.call(kaartnav.querySelectorAll('a[href^="#"]'));
    var secties = links.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    function markeer() {
      var beste = null;
      secties.forEach(function (s) {
        if (s.getBoundingClientRect().top < 220) beste = s;
      });
      links.forEach(function (a) {
        a.classList.toggle('actief', !!beste && a.getAttribute('href') === '#' + beste.id);
      });
    }
    window.addEventListener('scroll', markeer, { passive: true });
    markeer();
  }

  /* ---------- Lange lijsten inklappen op mobiel ----------
     Het open-attribuut staat in de HTML. Zonder JavaScript en op desktop
     staat de hele kaart dus gewoon open; hier klappen we hem alleen
     op een smal scherm dicht. */
  var smal = window.matchMedia('(max-width: 860px)');
  var vouwbaar = document.querySelectorAll('details.menugroep');
  function stemVouwers() {
    vouwbaar.forEach(function (d) { d.open = !smal.matches; });
  }
  if (vouwbaar.length) {
    stemVouwers();
    if (smal.addEventListener) smal.addEventListener('change', stemVouwers);
    else if (smal.addListener) smal.addListener(stemVouwers);
  }

  /* ---------- Carrousel (reviews op mobiel) ---------- */
  document.querySelectorAll('[data-carrousel]').forEach(function (kast) {
    var baan = kast.querySelector('.carrousel-baan');
    var vorige = kast.querySelector('[data-vorige]');
    var volgende = kast.querySelector('[data-volgende]');
    if (!baan || !vorige || !volgende) return;
    function stap() {
      var kaart = baan.firstElementChild;
      if (!kaart) return baan.clientWidth;
      var gat = parseFloat(getComputedStyle(baan).columnGap) || 0;
      return kaart.getBoundingClientRect().width + gat;
    }
    function schuif(richting) {
      baan.scrollBy({ left: richting * stap(), behavior: kalm ? 'auto' : 'smooth' });
    }
    vorige.addEventListener('click', function () { schuif(-1); });
    volgende.addEventListener('click', function () { schuif(1); });
  });

  /* ---------- Tellers ---------- */
  function tel(el) {
    if (el.dataset.geteld) return;
    el.dataset.geteld = '1';
    var doelTekst = el.dataset.tel;
    var doel = parseFloat(doelTekst.replace('.', '').replace(',', '.'));
    if (isNaN(doel)) return;
    var komma = doelTekst.indexOf(',') !== -1;
    var duizend = doelTekst.indexOf('.') !== -1;
    if (kalm) { el.textContent = doelTekst; return; }
    var start = null;
    var duur = 1400;
    function maak(n) {
      if (komma) return n.toFixed(1).replace('.', ',');
      var r = String(Math.round(n));
      if (duizend && r.length > 3) r = r.slice(0, -3) + '.' + r.slice(-3);
      return r;
    }
    function stapje(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / duur, 1);
      var z = 1 - Math.pow(1 - p, 3);
      el.textContent = maak(doel * z);
      if (p < 1) requestAnimationFrame(stapje);
      else el.textContent = doelTekst;
    }
    requestAnimationFrame(stapje);
  }

  /* ---------- Reveals, fail-open: vier vangnetten ---------- */
  var wachtend = [].slice.call(document.querySelectorAll('[data-rev]'));

  function onthul(el) {
    el.classList.add('in');
    [].slice.call(el.querySelectorAll('[data-tel]')).forEach(tel);
    if (el.hasAttribute('data-tel')) tel(el);
  }

  function controleer() {
    if (!wachtend.length) return;
    var grens = window.innerHeight * 0.95;
    wachtend = wachtend.filter(function (el) {
      if (el.getBoundingClientRect().top < grens) { onthul(el); return false; }
      return true;
    });
  }

  var tik = false;
  function vraagControle() {
    if (tik) return;
    tik = true;
    requestAnimationFrame(function () { tik = false; controleer(); });
  }

  window.addEventListener('scroll', vraagControle, { passive: true });
  window.addEventListener('resize', vraagControle, { passive: true });
  window.addEventListener('load', vraagControle);
  window.addEventListener('pageshow', vraagControle);

  if ('IntersectionObserver' in window) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (!it.isIntersecting) return;
        var i = wachtend.indexOf(it.target);
        if (i !== -1) wachtend.splice(i, 1);
        onthul(it.target);
        kijker.unobserve(it.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
    wachtend.forEach(function (el) { kijker.observe(el); });
  }

  controleer();

  setTimeout(function () {
    document.querySelectorAll('[data-rev]:not(.in)').forEach(onthul);
    document.documentElement.classList.add('klaar');
  }, 1200);

  /* ---------- Hero ---------- */
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('in'); });
    });
    setTimeout(function () { hero.classList.add('in'); }, 400);
  }

  /* ---------- Vaste actiebalk op mobiel ---------- */
  var balkje = document.querySelector('[data-mobielcta]');
  if (balkje) {
    var anker = hero || document.querySelector('main .sectie');
    var toon = function () {
      var voorbij = anker ? anker.getBoundingClientRect().bottom < 0 : window.scrollY > 500;
      var footer = document.querySelector('footer');
      var bijFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
      balkje.classList.toggle('zichtbaar', voorbij && !bijFooter);
    };
    window.addEventListener('scroll', toon, { passive: true });
    window.addEventListener('resize', toon, { passive: true });
    toon();
  }
})();
