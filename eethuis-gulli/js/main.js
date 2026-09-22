/* Eethuis GULLI: site-eigen laag bovenop motion.js. Powered by Mettafel.
   1. De knipoog: de smile in het merkteken tekent zich een keer bij laden.
   2. Live openstatus: ma t/m za 11.00-19.30, zondag gesloten.
   3. Sluitknop in het mobiele menu (motion.js bindt alleen de hoofdknop).
   4. Mobiele actiebalk verschijnt zodra de hero uit beeld is.
   Alles fail-open: zonder JavaScript staat er een complete site. */

/* ---------- 1. de knipoog ---------- */
(function () {
  'use strict';
  var balk = document.querySelector('.kop-balk');
  if (!balk) return;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { balk.classList.add('gelachen'); });
  });
})();

/* ---------- 2. live openstatus ---------- */
(function () {
  'use strict';
  var els = document.querySelectorAll('[data-open-status]');
  if (!els.length) return;
  var nu = new Date();
  var dag = nu.getDay();                    /* 0 = zondag */
  var uur = nu.getHours() + nu.getMinutes() / 60;
  var tekst, kleur;
  if (dag === 0) {
    tekst = 'Vandaag gesloten, morgen weer open vanaf 11.00 uur';
    kleur = 'var(--dicht)';
  } else if (uur >= 11 && uur < 19.5) {
    tekst = 'Nu geopend, tot 19.30 uur';
    kleur = 'var(--ok)';
  } else if (uur < 11) {
    tekst = 'Vandaag geopend vanaf 11.00 uur';
    kleur = 'var(--ok)';
  } else if (dag === 6) {
    tekst = 'Gesloten, maandag weer open vanaf 11.00 uur';
    kleur = 'var(--dicht)';
  } else {
    tekst = 'Gesloten, morgen weer open vanaf 11.00 uur';
    kleur = 'var(--dicht)';
  }
  els.forEach(function (el) {
    el.innerHTML = '<span class="stip" aria-hidden="true" style="background:' + kleur + '"></span> ' + tekst;
  });
})();

/* ---------- 3. sluitknop in het mobiele menu ---------- */
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

/* ---------- 4. mobiele actiebalk ---------- */
(function () {
  'use strict';
  var balk = document.querySelector('[data-mobielcta]');
  if (!balk) return;
  var drempel = (document.querySelector('.hero') || document.querySelector('.pagina-kop') || { offsetHeight: 320 }).offsetHeight;
  var voet = document.querySelector('footer.voet');
  function toets() {
    var y = window.scrollY;
    var bijVoet = voet && voet.getBoundingClientRect().top < window.innerHeight - 60;
    balk.classList.toggle('zichtbaar', y > drempel * .7 && !bijVoet);
  }
  window.addEventListener('scroll', toets, { passive: true });
  toets();
})();
