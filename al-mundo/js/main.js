/* Al Mundo: site-eigen laag bovenop motion.js.
   Live openstatus (di t/m zo 17.00-22.00, tweetalig), mobiel menu,
   de mobiele actiebalk, footer-uitklappers en de "vandaag"-markering
   in de openingstijdentabel. Alles fail-open: zonder JavaScript staat
   de vaste openingstijdenregel er gewoon. */
(function () {
  'use strict';
  var el = document.querySelector('[data-open-status]');
  if (!el) return;
  var EN = document.documentElement.lang === 'en';
  var nu = new Date();
  var open = nu.getDay() !== 1;   /* di t/m zo; maandag dicht */
  var uur = nu.getHours() + nu.getMinutes() / 60;
  var tekst, kleur;
  if (open && uur >= 17 && uur < 22) {
    tekst = EN ? 'Open now, until 22.00' : 'Nu geopend, tot 22.00 uur'; kleur = '#1d7a4a';
  } else if (open && uur < 17) {
    tekst = EN ? 'Open tonight from 17.00' : 'Vanavond geopend vanaf 17.00 uur'; kleur = '#1d7a4a';
  } else {
    var d = new Date(nu); d.setDate(d.getDate() + 1);
    while (d.getDay() === 1) d.setDate(d.getDate() + 1);
    var DAGEN = EN ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                   : ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    var morgen = new Date(nu); morgen.setDate(morgen.getDate() + 1);
    var wanneer = d.toDateString() === morgen.toDateString() ? (EN ? 'tomorrow' : 'morgen') : DAGEN[d.getDay()];
    tekst = EN ? 'Closed now, open again ' + wanneer + ' from 17.00' : 'Nu gesloten, ' + wanneer + ' weer open vanaf 17.00 uur';
    kleur = '#b3552e';
  }
  el.innerHTML = '<span class="stip" aria-hidden="true" style="background:' + kleur + '"></span> ' + tekst;
})();

/* mobiel menu */
(function () {
  'use strict';
  var knop = document.querySelector('[data-menuknop]');
  var menu = document.querySelector('.mobiel-menu');
  if (!knop || !menu) return;
  function zet(open) {
    menu.classList.toggle('open', open);
    knop.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  knop.addEventListener('click', function () { zet(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-sluit]') || e.target.closest('a')) zet(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) zet(false);
  });
})();

/* mobiele actiebalk: verschijnt zodra de hero uit beeld is, weg bij de footer */
(function () {
  'use strict';
  var balk = document.querySelector('[data-mobielcta]');
  if (!balk) return;
  var hero = document.querySelector('.hero') || document.querySelector('.pagina-kop');
  var voet = document.querySelector('footer.voet');
  function toets() {
    var voorbijHero = !hero || hero.getBoundingClientRect().bottom < 0;
    var bijFooter = voet && voet.getBoundingClientRect().top < window.innerHeight;
    balk.classList.toggle('zichtbaar', voorbijHero && !bijFooter);
    document.body.classList.toggle('cta-zichtbaar', voorbijHero && !bijFooter);
  }
  window.addEventListener('scroll', toets, { passive: true });
  window.addEventListener('resize', toets);
  toets();
})();

/* footer-kolommen: open in de HTML (fail-open); op mobiel klappen ze dicht */
(function () {
  'use strict';
  if (window.matchMedia('(max-width: 640px)').matches) {
    document.querySelectorAll('footer .voet-vouw').forEach(function (d) { d.open = false; });
  }
})();

/* sfeervideo's: alleen spelen in beeld; bij verminderde beweging blijft de poster staan */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('video[data-sfeer]').forEach(function (v) {
    v.muted = true;
    if (kalm) { v.removeAttribute('autoplay'); v.pause(); return; }
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.15 }).observe(v);
  });
})();

/* sectiekoppen die op één regel horen: krimp de lettergrootte tot ze passen.
   Fail-open: zonder JavaScript staat er gewoon een kop die mag afbreken. */
(function () {
  'use strict';
  var koppen = [].slice.call(document.querySelectorAll('.kop-regel'));
  if (!koppen.length) return;
  koppen.forEach(function (k) { k.dataset.basis = parseFloat(getComputedStyle(k).fontSize); });
  function pas() {
    koppen.forEach(function (k) {
      var basis = parseFloat(k.dataset.basis);
      k.style.fontSize = basis + 'px';
      var ruimte = k.parentElement.getBoundingClientRect().width;
      if (!ruimte || !k.scrollWidth) return;
      if (k.scrollWidth > ruimte) {
        k.style.fontSize = Math.max(17, Math.floor(basis * (ruimte / k.scrollWidth) * 0.99)) + 'px';
      }
    });
  }
  window.addEventListener('resize', pas);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pas);
  window.addEventListener('load', pas);
  pas();
})();

/* gastenboek: pijlen bladeren door de reviewrij */
(function () {
  'use strict';
  var rij = document.querySelector('[data-gb-rij]');
  if (!rij) return;
  document.querySelectorAll('[data-gb]').forEach(function (knop) {
    knop.addEventListener('click', function () {
      var kaart = rij.querySelector('.gb-kaart');
      var stap = kaart ? kaart.getBoundingClientRect().width + 16 : 300;
      rij.scrollBy({ left: stap * parseInt(knop.dataset.gb, 10), behavior: 'smooth' });
    });
  });
})();

/* openingstijdentabel: de rij van vandaag licht op */
(function () {
  'use strict';
  var rij = document.querySelector('.tijden-tabel tr[data-dag="' + new Date().getDay() + '"]');
  if (rij) rij.classList.add('vandaag');
})();
