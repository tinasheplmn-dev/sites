/* Çiğköftem Den Bosch: site-eigen laag bovenop motion.js.
   1. Live openstatus: ma t/m za 12.00-22.00, zondag gesloten (werkhypothese
      uit het Google-profiel; eigenaar bevestigt, zie README). Zonder
      JavaScript blijft de vaste tekst met de openingstijden staan.
   2. Sticky header-schaduw en het mobiele menu.
   3. De gekantelde fotokaarten in de hero-collage volgen de muis in lagen
      (alleen pointer: fine). Fail-open en uit bij prefers-reduced-motion. */
(function () {
  'use strict';

  /* ---------- 1. live openstatus ---------- */
  var statusEls = document.querySelectorAll('[data-open-status]');
  if (statusEls.length) {
    var nu = new Date();
    var dag = nu.getDay();               /* 0 = zondag */
    var open = dag !== 0;
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var tekst, dicht = false;
    if (open && uur >= 12 && uur < 22) {
      tekst = 'Nu geopend, tot 22.00 uur';
    } else if (open && uur < 12) {
      tekst = 'Vandaag geopend vanaf 12.00 uur';
    } else {
      var d = new Date(nu); d.setDate(d.getDate() + 1);
      while (d.getDay() === 0) d.setDate(d.getDate() + 1);
      var morgen = new Date(nu); morgen.setDate(morgen.getDate() + 1);
      var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
      var wanneer = d.toDateString() === morgen.toDateString() ? 'morgen' : DAGEN[d.getDay()];
      tekst = (dag === 0 && uur < 22 ? 'Vandaag gesloten, ' : 'Nu gesloten, ') + wanneer + ' weer open om 12.00 uur';
      dicht = true;
    }
    statusEls.forEach(function (el) {
      el.classList.toggle('dicht', dicht);
      el.innerHTML = '<span class="stip" aria-hidden="true"></span> ' + tekst;
    });
  }

  /* ---------- 2. header en mobiel menu ---------- */
  var balk = document.querySelector('[data-balk]');
  if (balk) {
    var zetVast = function () { balk.classList.toggle('vast', window.scrollY > 12); };
    window.addEventListener('scroll', zetVast, { passive: true });
    zetVast();
  }
  var menu = document.querySelector('[data-menu]');
  document.querySelectorAll('[data-menuknop]').forEach(function (k) {
    k.addEventListener('click', function () {
      var openNu = !menu.classList.contains('open');
      menu.classList.toggle('open', openNu);
      document.querySelectorAll('[data-menuknop]').forEach(function (b) { b.setAttribute('aria-expanded', String(openNu)); });
      document.body.style.overflow = openNu ? 'hidden' : '';
    });
  });
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- 3. zwevende fotokaarten in de hero-collage ---------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroBeeld = document.querySelector('[data-ingredienten]');
  if (heroBeeld && !reduced && window.matchMedia('(pointer: fine)').matches) {
    var mx = 0, my = 0, x = 0, y = 0, raf = null;
    var lagen = heroBeeld.querySelectorAll('[data-laag]');
    var loop = function () {
      x += (mx - x) * 0.08;
      y += (my - y) * 0.08;
      lagen.forEach(function (l) {
        var f = parseFloat(l.getAttribute('data-laag')) || 10;
        l.style.transform = 'translate3d(' + (x * f) + 'px,' + (y * f) + 'px,0)';
      });
      if (Math.abs(mx - x) > 0.002 || Math.abs(my - y) > 0.002) raf = requestAnimationFrame(loop);
      else raf = null;
    };
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }
})();

/* Footer-kolommen: open in de HTML (fail-open); op mobiel klappen ze dicht */
(function () {
  'use strict';
  if (window.matchMedia('(max-width: 640px)').matches) {
    document.querySelectorAll('footer .voet-vouw').forEach(function (d) { d.open = false; });
  }
})();
