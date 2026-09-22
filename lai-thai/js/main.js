/* Lai Thai: site-eigen laag bovenop motion.js.
   Live openstatus: di t/m zo 16.00-20.00, maandag gesloten. Zonder
   JavaScript blijft de vaste tekst met de openingstijden staan. */
(function () {
  'use strict';
  var elementen = document.querySelectorAll('[data-open-status]');
  if (!elementen.length) return;
  var nu = new Date();
  var dag = nu.getDay();               /* 0 = zondag, 1 = maandag */
  var open = dag !== 1;
  var uur = nu.getHours() + nu.getMinutes() / 60;
  var tekst, kleur;
  if (open && uur >= 16 && uur < 20) {
    tekst = 'Nu geopend, tot 20.00 uur'; kleur = 'var(--groen)';
  } else if (open && uur < 16) {
    tekst = 'Vanmiddag geopend vanaf 16.00 uur'; kleur = 'var(--groen)';
  } else {
    /* na sluitingstijd of maandag: wanneer weer open? */
    var d = new Date(nu); d.setDate(d.getDate() + 1);
    while (d.getDay() === 1) d.setDate(d.getDate() + 1);
    var morgen = new Date(nu); morgen.setDate(morgen.getDate() + 1);
    var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    var wanneer = d.toDateString() === morgen.toDateString() ? 'morgen' : DAGEN[d.getDay()];
    tekst = (dag === 1 ? 'Vandaag gesloten, ' : 'Nu gesloten, ') + wanneer + ' weer open om 16.00 uur';
    kleur = 'var(--rood-status)';
  }
  elementen.forEach(function (el) {
    el.innerHTML = '<span class="stip" aria-hidden="true" style="background:' + kleur + '"></span> ' + tekst;
  });
})();

/* Footer-kolommen: open in de HTML (fail-open); op mobiel klappen ze dicht */
(function () {
  'use strict';
  if (window.matchMedia('(max-width: 640px)').matches) {
    document.querySelectorAll('footer .voet-vouw').forEach(function (d) { d.open = false; });
  }
})();
