/* Broodje Beekveld - motion en interactie.
   Gebaseerd op assets/motion.js uit de website-bouwen skill, getrimd tot wat
   deze site gebruikt: reveals met vier vangnetten, stagger, hero-opening,
   zwevende beeldkaders, scroll-voortgang (de tegelrand die meeloopt), plus
   header, mobiel menu, menukaart, reviewrail en de WhatsApp-uitnodiging.

   Uitgangspunt: zichtbaarheid hangt nooit van een mechanisme af. Gaat
   JavaScript stuk, dan staat er gewoon een complete, leesbare site.
   Bij prefers-reduced-motion draaien de reveals mee als zachte fades
   zonder verplaatsing (de fade-variant in de CSS); zwevende delen en de
   scroll-gekoppelde tegelvoortgang staan dan stil. */
(function () {
  'use strict';

  var html = document.documentElement;
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ?foto=1 zet alles statisch neer (screenshots, controle). De js-klasse is
     de schakelaar: de verbergregels in CSS staan achter html.js:not(.klaar). */
  var foto = /[?&]foto=1/.test(location.search);
  if (!foto) html.classList.add('js');

  /* Geeft het script op, dan zet .klaar alles zichtbaar. Liever een gemiste
     animatie dan een onzichtbare kop. */
  function geefOp() { html.classList.add('klaar'); }
  window.addEventListener('error', geefOp);
  window.addEventListener('beforeprint', geefOp);

  function perFrame(fn) {
    var bezig = false;
    return function () {
      if (bezig) return;
      bezig = true;
      requestAnimationFrame(function () { bezig = false; fn(); });
    };
  }

  /* ---------- Header: schaduw zodra je scrolt ---------- */
  var balk = document.querySelector('[data-balk]');
  function balkStand() {
    if (balk) balk.classList.toggle('zweeft', window.scrollY > 10);
  }
  window.addEventListener('scroll', perFrame(balkStand), { passive: true });
  balkStand();

  /* ---------- Mobiel menu ---------- */
  var knop = document.querySelector('[data-menuknop]');
  var menu = document.querySelector('[data-menu]');
  if (knop && menu) {
    var sluit = function () {
      knop.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    };
    knop.addEventListener('click', function () {
      var open = knop.getAttribute('aria-expanded') === 'true';
      if (open) { sluit(); return; }
      knop.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    });
    menu.querySelectorAll('a, [data-sluit]').forEach(function (a) {
      a.addEventListener('click', sluit);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sluit();
    });
  }

  /* ---------- Stagger: --i per kind ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (ouder) {
    [].slice.call(ouder.children).forEach(function (kind, i) {
      kind.style.setProperty('--i', i);
    });
  });
  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    hero.querySelectorAll('[data-hero-item]').forEach(function (item, i) {
      if (!item.style.getPropertyValue('--i')) item.style.setProperty('--i', i);
    });
  });

  /* ---------- Reveals, fail-open ----------
     Vier vangnetten: directe controle, scroll/resize/load/pageshow,
     IntersectionObserver, en een waakhond die elke 800 ms controleert en na
     1,2 s toetst of iets dat in beeld hoort te zijn nog verborgen is.
     De tegelrand doet mee: die tekent zich als hij in beeld komt. */
  var wachtend = [].slice.call(document.querySelectorAll('[data-rev], .tegelrand'));

  function rondAf(el) {
    setTimeout(function () { el.classList.add('af'); }, 1300);
  }
  function onthul(el) {
    el.classList.add('in');
    rondAf(el);
  }
  function inBeeld(el, grens) {
    var r = el.getBoundingClientRect();
    return r.top < grens && r.bottom > -40;
  }
  function controleer() {
    if (!wachtend.length) return;
    var grens = window.innerHeight * 0.92;
    wachtend = wachtend.filter(function (el) {
      if (inBeeld(el, grens)) { onthul(el); return false; }
      return true;
    });
  }

  /* Bij verminder-beweging draaien de reveals gewoon mee: de CSS maakt er
     dan zachte fades zonder verplaatsing van (de fade-variant). Alleen
     ?foto=1 zet alles direct neer. */
  if (foto) {
    wachtend.forEach(onthul);
    wachtend = [];
    geefOp();
  } else {
    var vraagControle = perFrame(controleer);
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
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
      wachtend.forEach(function (el) { kijker.observe(el); });
    }

    controleer();

    var waakhond = setInterval(function () {
      controleer();
      if (!wachtend.length) clearInterval(waakhond);
    }, 800);

    setTimeout(function () {
      var vast = [].slice.call(document.querySelectorAll('[data-rev]:not(.in)'))
        .some(function (el) { return inBeeld(el, window.innerHeight); });
      if (vast) {
        document.querySelectorAll('[data-rev]:not(.in), .tegelrand:not(.in)').forEach(onthul);
        wachtend = [];
        geefOp();
      }
    }, 1200);
  }

  /* ---------- Hero-opening: .in binnen twee frames, hoe dan ook na 400 ms ---------- */
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('in'); });
    });
    setTimeout(function () { hero.classList.add('in'); }, 400);
    rondAf(hero);
  }

  /* ---------- Scroll-voortgang: de tegelrand onder de balk loopt mee ----------
     --scroll (0 tot 1) op <html>; de CSS vult de tegels tegel voor tegel. */
  if (!kalm && document.querySelector('.tegelvoortgang')) {
    var voortgang = function () {
      var max = html.scrollHeight - html.clientHeight;
      html.style.setProperty('--scroll', max > 0 ? (html.scrollTop / max).toFixed(4) : 0);
    };
    var vraagVoortgang = perFrame(voortgang);
    window.addEventListener('scroll', vraagVoortgang, { passive: true });
    window.addEventListener('resize', vraagVoortgang, { passive: true });
    window.addEventListener('load', vraagVoortgang);
    voortgang();
  }

  /* ---------- Zwevende beeldkaders: eigen fase en duur per element ---------- */
  if (!kalm) {
    document.querySelectorAll('[data-zweef]').forEach(function (el, i) {
      var afstand = parseFloat(el.dataset.zweef);
      if (!isNaN(afstand)) el.style.setProperty('--zweef-afstand', (-Math.abs(afstand)) + 'px');
      el.style.setProperty('--zweef-fase', (-(i * 1.3) % 6).toFixed(2) + 's');
      el.style.setProperty('--zweef-duur', (5.5 + (i % 3) * 0.8).toFixed(1) + 's');
      el.classList.add('zweef');
    });
  }

  /* ---------- Vaste actiebalk op mobiel ---------- */
  var actiebalk = document.querySelector('[data-mobielcta]');
  if (actiebalk) {
    var anker = hero || document.querySelector('.paginakop');
    var toon = function () {
      var voorbij = anker ? anker.getBoundingClientRect().bottom < 0 : window.scrollY > 400;
      var voet = document.querySelector('footer.voet');
      var bijVoet = voet && voet.getBoundingClientRect().top < window.innerHeight;
      actiebalk.classList.toggle('zichtbaar', voorbij && !bijVoet);
    };
    window.addEventListener('scroll', perFrame(toon), { passive: true });
    window.addEventListener('resize', perFrame(toon), { passive: true });
    toon();
  }

  /* ---------- Reviewcarrousel ---------- */
  document.querySelectorAll('[data-rail]').forEach(function (band) {
    var rail = band.querySelector('.reviewrail');
    if (!rail) return;
    var stap = function () {
      var kaart = rail.firstElementChild;
      return kaart ? kaart.getBoundingClientRect().width + 24 : 320;
    };
    band.querySelectorAll('[data-vorige]').forEach(function (b) {
      b.addEventListener('click', function () { rail.scrollBy({ left: -stap(), behavior: kalm ? 'auto' : 'smooth' }); });
    });
    band.querySelectorAll('[data-volgende]').forEach(function (b) {
      b.addEventListener('click', function () { rail.scrollBy({ left: stap(), behavior: kalm ? 'auto' : 'smooth' }); });
    });
  });

  /* ---------- Menukaart: categorieën inklappen ----------
     In de HTML staan alle categorieën open (fail-open). Met JavaScript blijft
     de eerste categorie open en klappen de rest dicht. Een ankerlink naar een
     categorie klapt die categorie weer open. */
  var kaartgroepen = [].slice.call(document.querySelectorAll('details.kaartgroep'));
  if (kaartgroepen.length) {
    kaartgroepen.forEach(function (d, i) {
      if (i > 0) d.removeAttribute('open');
    });
    var openDoel = function () {
      if (!location.hash) return;
      var doel;
      try { doel = document.querySelector(location.hash); } catch (e) { return; }
      if (!doel) return;
      var groep = doel.closest ? doel.closest('details.kaartgroep') : null;
      if (groep) {
        groep.setAttribute('open', '');
        groep.scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'start' });
      }
    };
    window.addEventListener('hashchange', openDoel);
    openDoel();
  }

  /* ---------- WhatsApp-widget: uitnodiging voor vragen, geen chatbot ---------- */
  var widget = document.querySelector('[data-appwidget]');
  var appknop = document.querySelector('[data-appknop]');
  if (widget && appknop) {
    appknop.addEventListener('click', function () {
      var open = widget.classList.toggle('open');
      appknop.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && widget.classList.contains('open')) {
        widget.classList.remove('open');
        appknop.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
