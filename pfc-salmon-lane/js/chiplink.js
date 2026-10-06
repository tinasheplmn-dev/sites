/* Tegels die naar een menugroep springen: groep openklappen en erheen scrollen.
   Zonder dit script werkt de gewone ankerlink nog steeds. */
(function () {
  'use strict';
  document.querySelectorAll('[data-chip-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var doel = document.getElementById(a.getAttribute('data-chip-link'));
      if (!doel) return;
      e.preventDefault();
      if (doel.tagName === 'DETAILS') doel.open = true;
      doel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  });
})();
