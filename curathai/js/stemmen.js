/* stemmen.js: afspeelknoppen bij de citaten uit Málaga. Zonder JavaScript toont de browser de gewone audiospeler. */
(function () {
  'use strict';
  var knoppen = document.querySelectorAll('[data-speel]');
  if (!knoppen.length) return;
  var actief = null;
  function stop(knop) {
    var audio = knop.parentNode.querySelector('audio');
    audio.pause(); knop.setAttribute('aria-pressed', 'false');
    knop.querySelector('[data-label]').textContent = knop.getAttribute('data-tekst');
  }
  knoppen.forEach(function (knop) {
    var audio = knop.parentNode.querySelector('audio');
    if (!audio) return;
    knop.setAttribute('data-tekst', knop.querySelector('[data-label]').textContent);
    knop.closest('.stem').classList.add('met-speler');
    knop.addEventListener('click', function () {
      if (actief && actief !== knop) stop(actief);
      if (audio.paused) {
        actief = knop; knop.setAttribute('aria-pressed', 'true'); knop.querySelector('[data-label]').textContent = 'Pauze';
        audio.play().catch(function () { stop(knop); });
      } else stop(knop);
    });
    audio.addEventListener('timeupdate', function () {
      if (audio.duration) knop.querySelector('.rond').style.setProperty('--voortgang', audio.currentTime / audio.duration);
    });
    audio.addEventListener('ended', function () { stop(knop); knop.querySelector('.rond').style.setProperty('--voortgang', 0); });
  });
})();
