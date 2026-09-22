/* Bossche Başak Döner: site-eigen laag bovenop motion.js.
   1. Live openstatus-chip. Openingstijden: elke dag 10.00-20.00, vrijdag
      tot 21.00 (bron: huidige site; eigenaar bevestigt, zie README).
      Fail-open: zonder JavaScript blijft de vaste openingstijdenregel staan.
   2. Mobiel menu (aria-expanded, focus terug op de knop bij sluiten).
   De korenaar-voortgang onder de header draait volledig op --scroll
   uit motion.js en heeft hier geen eigen code nodig. */
(function () {
  'use strict';

  /* ---------- openstatus ---------- */
  function sluitUur(dag) { return dag === 5 ? 21 : 20; }   /* vr tot 21.00 */
  document.querySelectorAll('[data-open-status]').forEach(function (el) {
    var nu = new Date();
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var dicht = sluitUur(nu.getDay());
    var tekst, open;
    if (uur >= 10 && uur < dicht) {
      tekst = 'Nu geopend, tot ' + dicht + '.00 uur'; open = true;
    } else if (uur < 10) {
      tekst = 'Vandaag geopend vanaf 10.00 uur'; open = true;
    } else {
      tekst = 'Voor vandaag gesloten, morgen vanaf 10.00 uur'; open = false;
    }
    var stip = el.querySelector('.stip');
    var label = el.querySelector('[data-open-tekst]');
    if (label) label.textContent = tekst;
    if (stip) stip.classList.toggle('dicht', !open);
  });

  /* ---------- mobiel menu ---------- */
  var knop = document.querySelector('[data-menu-knop]');
  var menu = document.getElementById('mobiel-menu');
  if (knop && menu) {
    var sluitKnop = menu.querySelector('[data-menu-sluit]');
    function zet(openen) {
      menu.classList.toggle('open', openen);
      knop.setAttribute('aria-expanded', String(openen));
      document.body.style.overflow = openen ? 'hidden' : '';
      if (openen) { (sluitKnop || menu).focus(); } else { knop.focus(); }
    }
    knop.addEventListener('click', function () { zet(!menu.classList.contains('open')); });
    if (sluitKnop) sluitKnop.addEventListener('click', function () { zet(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) zet(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) zet(false);
    });
  }
})();
