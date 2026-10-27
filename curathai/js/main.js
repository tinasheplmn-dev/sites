/* main.js: Cura Thai-eigen dingen. Alles fail-open. */
(function () {
  'use strict';
  var sluitKnop = document.querySelector('[data-menusluit]');
  var menuKnop = document.querySelector('[data-menuknop]');
  if (sluitKnop && menuKnop) sluitKnop.addEventListener('click', function () { menuKnop.click(); });

  /* welkomstcode kopiëren */
  document.querySelectorAll('[data-kopieer]').forEach(function (knop) {
    knop.addEventListener('click', function () {
      var tekst = knop.getAttribute('data-kopieer');
      var label = knop.querySelector('[data-label]');
      var klaar = function () { if (label) { label.textContent = 'Gekopieerd'; setTimeout(function () { label.textContent = 'Kopieer'; }, 1800); } };
      if (navigator.clipboard) navigator.clipboard.writeText(tekst).then(klaar, klaar); else klaar();
    });
  });

  /* lange lijsten op mobiel inklappen: open in de HTML, dicht op kleine schermen (behalve de eerste) */
  if (window.matchMedia('(max-width: 640px)').matches) {
    document.querySelectorAll('[data-mobiel-dicht]').forEach(function (d) { d.open = false; });
  }
})();
