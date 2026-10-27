/* reviews.js: filter, "toon alle" en carrouselpijlen voor de reviewmuur.
   Zonder JavaScript staan alle reviews gewoon onder elkaar. */
(function () {
  'use strict';
  var muur = document.querySelector('[data-reviews]');
  if (!muur) return;
  var meer = document.querySelector('[data-meer]');
  var alles = false;
  var filter = 'alles';
  var reviews = [].slice.call(muur.querySelectorAll('.review'));
  function toon() {
    var n = 0;
    reviews.forEach(function (r) {
      var past = filter === 'alles' || r.getAttribute('data-soort') === filter;
      if (past) n++;
      r.hidden = !past;
      r.classList.toggle('verborgen', past && !alles && filter === 'alles' && n > 9);
    });
    if (meer) meer.hidden = alles || filter !== 'alles';
  }
  document.querySelectorAll('[data-filter]').forEach(function (knop) {
    knop.addEventListener('click', function () {
      filter = knop.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (k) { k.setAttribute('aria-pressed', String(k === knop)); });
      muur.scrollLeft = 0;
      toon();
    });
  });
  if (meer) meer.addEventListener('click', function () { alles = true; toon(); });
  document.querySelectorAll('[data-scroll]').forEach(function (knop) {
    knop.addEventListener('click', function () {
      var kaart = muur.querySelector('.review:not([hidden])');
      var stap = kaart ? kaart.getBoundingClientRect().width + 16 : 300;
      muur.scrollBy({ left: stap * Number(knop.getAttribute('data-scroll')), behavior: 'smooth' });
    });
  });
  toon();
})();
