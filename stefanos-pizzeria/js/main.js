/* Stefano's: site-eigen laag bovenop motion.js (dat regelt al reveals,
   header-schaduw, het mobiele menu via de eerste menuknop, parallax en zweef).
   Hier: live openstatus, de sluitknop ín het menu, de actiebalk en de footer.
   Openstatus: dagelijks open 16.30; zo t/m wo tot 21.00, do t/m za tot 21.30.
   Zonder JavaScript blijft de vaste openingstijdentekst staan (fail-open). */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';

  function sluitUur(dag) { return (dag >= 4 && dag <= 6) ? 21.5 : 21; }
  function sluitTekst(dag) { return (dag >= 4 && dag <= 6) ? (EN ? '9.30 pm' : '21.30 uur') : (EN ? '9 pm' : '21.00 uur'); }

  /* Op telefoon is de ruimte krap: daar een korte variant van dezelfde boodschap. */
  var KRAP = window.matchMedia('(max-width: 640px)').matches;

  document.querySelectorAll('[data-open-status]').forEach(function (el) {
    var nu = new Date();
    var dag = nu.getDay();
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var tekst, kleur;
    if (uur >= 16.5 && uur < sluitUur(dag)) {
      tekst = EN ? (KRAP ? 'Open until ' + sluitTekst(dag) : 'Open now, until ' + sluitTekst(dag))
                 : (KRAP ? 'Nu open tot ' + sluitTekst(dag).replace(' uur', '') : 'Nu geopend, tot ' + sluitTekst(dag));
      kleur = 'var(--groen)';
    } else if (uur < 16.5) {
      tekst = EN ? (KRAP ? 'Open from 4.30 pm' : 'Open tonight from 4.30 pm')
                 : (KRAP ? 'Open vanaf 16.30' : 'Vanavond geopend vanaf 16.30 uur');
      kleur = 'var(--groen)';
    } else {
      tekst = EN ? (KRAP ? 'Open again tomorrow 4.30 pm' : 'Closed for tonight, open again tomorrow from 4.30 pm')
                 : (KRAP ? 'Morgen open vanaf 16.30' : 'Vanavond gesloten, morgen weer open vanaf 16.30 uur');
      kleur = 'var(--rood-status)';
    }
    el.innerHTML = '<span class="stip" aria-hidden="true" style="background:' + kleur + ';box-shadow:0 0 8px ' + kleur + '"></span> ' + tekst;
  });

  /* de sluitknop bínnen het mobiele menu (motion.js bindt alleen de eerste knop) */
  var menu = document.querySelector('[data-menu]');
  if (menu) {
    menu.querySelectorAll('[data-menuknop]').forEach(function (k) {
      k.addEventListener('click', function () {
        menu.classList.remove('open');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        document.querySelectorAll('[data-menuknop]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      });
    });
  }

  /* mobiele actiebalk: het tonen zelf doet motion.js; hier alleen de bodemruimte */
  if (document.querySelector('[data-mobielcta]')) {
    document.body.classList.add('heeft-actiebalk');
  }

  /* footer-kolommen: open in de HTML (fail-open); op mobiel dichtklappen */
  if (window.matchMedia('(max-width: 860px)').matches) {
    document.querySelectorAll('footer .voet-vouw').forEach(function (d) { d.open = false; });
  }
})();
