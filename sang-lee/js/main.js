/* Sang Lee: site-eigen laag bovenop motion.js.
   1. Live openstatus-chip (di t/m zo 12.00-20.00, tweetalig). Zonder
      JavaScript blijft de vaste openingstijdenregel staan (fail-open).
   2. Het signatuur-effect: het draaiplateau in de hero. Het plateau draait
      heel rustig door en draait mee met het scrollen; de borden draaien
      tegengesteld zodat het eten rechtop blijft (dat doet de CSS).
      Fail-open: zonder script staat er gewoon een stilstaand plateau. */
(function () {
  'use strict';
  var lijst = document.querySelectorAll('[data-open-status]');
  if (!lijst.length) return;
  var EN = document.documentElement.lang === 'en';
  var nu = new Date();
  var dag = nu.getDay();
  var open = dag !== 1;               /* alleen maandag dicht */
  var uur = nu.getHours() + nu.getMinutes() / 60;
  var tekst, kleur;
  if (open && uur >= 12 && uur < 20) {
    tekst = EN ? 'Open now, until 20.00' : 'Nu geopend, tot 20.00 uur'; kleur = '#2E7D46';
  } else if (open && uur < 12) {
    tekst = EN ? 'Open today from 12.00' : 'Vandaag geopend vanaf 12.00 uur'; kleur = '#2E7D46';
  } else {
    /* dicht: vanavond na sluiting, of maandag */
    var d = new Date(nu); d.setDate(d.getDate() + 1);
    while (d.getDay() === 1) d.setDate(d.getDate() + 1);
    var morgen = new Date(nu); morgen.setDate(morgen.getDate() + 1);
    var DAGEN = EN ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                   : ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    var wanneer = d.toDateString() === morgen.toDateString() ? (EN ? 'tomorrow' : 'morgen') : DAGEN[d.getDay()];
    tekst = EN ? 'Closed now, open again ' + wanneer + ' from 12.00'
               : 'Nu gesloten, ' + wanneer + ' vanaf 12.00 uur weer open';
    kleur = '#B3543F';
  }
  var merk = '<span class="stip" aria-hidden="true" style="background:' + kleur + '"></span> ' + tekst;
  lijst.forEach(function (el) { el.innerHTML = merk; });
})();

(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var plateau = document.querySelector('[data-plateau]');
  if (!plateau || kalm) return;

  var basis = 0;          /* langzame eigen draai */
  var vorige = null;
  var scrollFactor = 0.06;

  function stap(t) {
    if (vorige !== null) basis += (t - vorige) * 0.0016;   /* ± 1,6 graden per seconde */
    vorige = t;
    var hoek = basis + window.scrollY * scrollFactor;
    plateau.style.setProperty('--plateau-hoek', hoek.toFixed(2) + 'deg');
    requestAnimationFrame(stap);
  }
  requestAnimationFrame(stap);
})();

/* De sluitknop bínnen het mobiele menu: motion.js bindt alleen de eerste
   menuknop (die in de header), dus deze krijgt hier zijn eigen handler. */
(function () {
  'use strict';
  var menu = document.querySelector('[data-menu]');
  var eerste = document.querySelector('[data-menuknop]');
  if (!menu || !eerste) return;
  menu.querySelectorAll('[data-menuknop]').forEach(function (k) {
    k.addEventListener('click', function () {
      eerste.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    });
  });
})();

/* Footer-kolommen: open in de HTML (fail-open); op mobiel klappen ze dicht */
(function () {
  'use strict';
  if (window.matchMedia('(max-width: 640px)').matches) {
    document.querySelectorAll('footer .voet-vouw').forEach(function (d) { d.open = false; });
  }
})();

/* De vitrine op de homepage: bladeren door de huisnummers.
   Fail-open: zonder script staat het eerste nummer gewoon open en zijn de
   andere bladen verborgen; de knoppen linken dan nergens heen, dus de
   tabknoppen krijgen hun rol pas hier. */
(function () {
  'use strict';
  var vitrine = document.querySelector('[data-vitrine]');
  if (!vitrine) return;
  var tabs = Array.prototype.slice.call(vitrine.querySelectorAll('.vitrine-tab'));
  var bladen = Array.prototype.slice.call(vitrine.querySelectorAll('.vitrine-blad'));
  if (!tabs.length || tabs.length !== bladen.length) return;

  function toon(i, verplaatsFocus) {
    tabs.forEach(function (t, n) {
      var aan = n === i;
      t.classList.toggle('aan', aan);
      t.setAttribute('aria-selected', aan ? 'true' : 'false');
      t.tabIndex = aan ? 0 : -1;
    });
    bladen.forEach(function (b, n) {
      var aan = n === i;
      b.classList.toggle('aan', aan);
      b.hidden = !aan;
    });
    if (verplaatsFocus) tabs[i].focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { toon(i, false); });
    t.addEventListener('keydown', function (e) {
      var nieuw = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nieuw = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nieuw = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') nieuw = 0;
      if (e.key === 'End') nieuw = tabs.length - 1;
      if (nieuw === null) return;
      e.preventDefault();
      toon(nieuw, true);
    });
  });
})();
