/* Reviewcarrousel: scroll-snap in CSS, deze knoppen schuiven één kaart verder.
   Werkt ook zonder dit script (dan swipe of scroll je zelf). */
(function () {
  'use strict';
  var rij = document.querySelector('[data-carrousel]');
  if (!rij) return;
  function stap(r) {
    var kaart = rij.firstElementChild;
    var breedte = kaart ? kaart.getBoundingClientRect().width + 16 : rij.clientWidth * 0.8;
    rij.scrollBy({ left: r * breedte, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-carrousel-terug]').forEach(function (b) { b.addEventListener('click', function () { stap(-1); }); });
  document.querySelectorAll('[data-carrousel-verder]').forEach(function (b) { b.addEventListener('click', function () { stap(1); }); });
})();
