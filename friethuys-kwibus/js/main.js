/* Friethuys Kwibus: site-eigen laag bovenop motion.js.
   1. Live openstatus-chip (elke dag open: ma-vr 11.30-20.30, za-zo 16.30-20.30).
      Fail-open: zonder JavaScript blijft de vaste openingstijdenregel staan.
   2. Het signatuur-effect: het podium in de hero (zie hieronder). */
(function () {
  'use strict';
  var chips = document.querySelectorAll('[data-open-status]');
  if (!chips.length) return;
  var EN = document.documentElement.lang === 'en';
  var nu = new Date();
  var dag = nu.getDay();                        /* 0 = zondag */
  var doordeweeks = dag >= 1 && dag <= 5;
  var van = doordeweeks ? 11.5 : 16.5;
  var tot = 20.5;
  var uur = nu.getHours() + nu.getMinutes() / 60;
  var tekst, kleur;
  var vanTekst = doordeweeks ? '11.30' : '16.30';
  if (uur >= van && uur < tot) {
    tekst = EN ? 'Open now, until 20.30' : 'Nu geopend, tot 20.30 uur';
    kleur = 'var(--open-groen)';
  } else if (uur < van) {
    tekst = EN ? 'Open today from ' + vanTekst : 'Vandaag geopend vanaf ' + vanTekst + ' uur';
    kleur = 'var(--open-groen)';
  } else {
    var morgenDag = (dag + 1) % 7;
    var morgenVan = morgenDag >= 1 && morgenDag <= 5 ? '11.30' : '16.30';
    tekst = EN ? 'Closed for today, open tomorrow from ' + morgenVan : 'Vandaag gesloten, morgen weer open vanaf ' + morgenVan + ' uur';
    kleur = 'var(--dicht-rood)';
  }
  chips.forEach(function (el) {
    el.innerHTML = '<span class="stip" aria-hidden="true" style="background:' + kleur + '"></span> ' + tekst;
  });
})();

/* Het podium in de hero: de foto van de zaak opent bij scrollen van kader
   naar volle breedte (--open 0 tot 1) en de fotokaarten bewegen in diepte
   mee op scroll en muis. Fail-open: zonder script staat de foto gewoon in
   zijn kader. Minder beweging: foto direct open, geen parallax. */
(function () {
  'use strict';
  var podium = document.querySelector('[data-podium]');
  if (!podium) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    podium.style.setProperty('--open', 1);
    return;
  }
  var bezig = false;
  function meet() {
    var r = podium.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.9 - r.top) / (vh * 0.75);
    p = Math.max(0, Math.min(1, p));
    podium.style.setProperty('--open', p.toFixed(3));
    if (p > 0) podium.classList.add('volgt');
  }
  function vraag() {
    if (bezig) return;
    bezig = true;
    requestAnimationFrame(function () { bezig = false; meet(); });
  }
  window.addEventListener('scroll', vraag, { passive: true });
  window.addEventListener('resize', vraag);
  meet();

  if (window.matchMedia('(pointer: fine)').matches) {
    var hero = podium.closest('.hero') || podium;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      podium.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      podium.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      podium.style.setProperty('--mx', 0);
      podium.style.setProperty('--my', 0);
    });
  }
})();

/* Footer-kolommen: open in de HTML (fail-open); op mobiel klappen ze dicht */
(function () {
  'use strict';
  if (window.matchMedia('(max-width: 640px)').matches) {
    document.querySelectorAll('footer .voet-vouw').forEach(function (d) { d.open = false; });
  }
})();
