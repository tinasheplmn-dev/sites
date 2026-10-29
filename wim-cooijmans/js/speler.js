/* Audiospeler: één fragment tegelijk, de voortgang loopt als een rij
   toetsjes vol. Audio laadt pas bij de eerste klik (preload="none"). */
(function () {
  'use strict';
  var sporen = [].slice.call(document.querySelectorAll('[data-speler] .spoor'));
  if (!sporen.length) return;
  var actief = null;

  function tijd(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  sporen.forEach(function (spoor) {
    var audio = spoor.querySelector('audio');
    var knop = spoor.querySelector('.spoor-knop');
    var balk = spoor.querySelector('.spoor-balk');
    var vul = balk && balk.querySelector('i');
    var tijdEl = spoor.querySelector('.spoor-tijd');
    var titel = knop.getAttribute('aria-label').replace(/^Speel /, '').replace(/ af$/, '');
    var vast = tijdEl ? tijdEl.textContent : '';

    function stop() {
      audio.pause();
      spoor.classList.remove('speelt');
      knop.setAttribute('aria-label', 'Speel ' + titel + ' af');
    }
    spoor._stop = stop;

    knop.addEventListener('click', function () {
      if (!audio.paused) { stop(); return; }
      if (actief && actief !== spoor) actief._stop();
      actief = spoor;
      audio.play().catch(function () {});
      spoor.classList.add('speelt');
      knop.setAttribute('aria-label', 'Pauzeer ' + titel);
    });
    audio.addEventListener('timeupdate', function () {
      if (!audio.duration) return;
      if (vul) vul.style.setProperty('--p', (audio.currentTime / audio.duration * 100) + '%');
      if (tijdEl) tijdEl.textContent = tijd(audio.duration - audio.currentTime);
    });
    audio.addEventListener('ended', function () {
      stop();
      if (vul) vul.style.setProperty('--p', '0%');
      if (tijdEl) tijdEl.textContent = vast;
    });
    if (balk) balk.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var r = balk.getBoundingClientRect();
      audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
    });
  });
})();
