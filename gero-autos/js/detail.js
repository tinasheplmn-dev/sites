/* Detailpagina: galerij met thumbs, pijlen, toetsenbord, swipe en lichtbak. */
(function () {
  'use strict';
  var gal = document.querySelector('[data-galerij]');
  if (!gal) return;
  var groot = gal.querySelector('[data-groot]');
  var thumbs = [].slice.call(gal.querySelectorAll('[data-thumb]'));
  var nr = gal.querySelector('[data-nr]');
  var lb = document.querySelector('[data-lichtbak]');
  var lbImg = lb && lb.querySelector('[data-lb-img]');
  var lbNr = lb && lb.querySelector('[data-lb-nr]');
  var i = 0;
  var alt = groot.alt.replace(/, foto \d+$/, '');

  function toon(n) {
    i = (n + thumbs.length) % thumbs.length;
    groot.src = thumbs[i].dataset.src;
    groot.alt = alt + ', foto ' + (i + 1);
    thumbs.forEach(function (t, j) { t.classList.toggle('actief', j === i); });
    if (nr) nr.textContent = i + 1;
    thumbs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (lb && lb.classList.contains('open')) { lbImg.src = groot.src; lbImg.alt = groot.alt; if (lbNr) lbNr.textContent = i + 1; }
    /* volgende alvast laden */
    var vlg = new Image(); vlg.src = thumbs[(i + 1) % thumbs.length].dataset.src;
  }
  thumbs.forEach(function (t, j) { t.addEventListener('click', function () { toon(j); }); });
  gal.querySelector('[data-vorige]').addEventListener('click', function () { toon(i - 1); });
  gal.querySelector('[data-volgende]').addEventListener('click', function () { toon(i + 1); });

  /* swipe op het grote beeld */
  var startX = null;
  groot.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  groot.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) toon(dx < 0 ? i + 1 : i - 1);
    startX = null;
  });

  /* lichtbak */
  if (lb) {
    function open() { lb.hidden = false; lb.classList.add('open'); lbImg.src = groot.src; lbImg.alt = groot.alt; if (lbNr) lbNr.textContent = i + 1; document.body.style.overflow = 'hidden'; }
    function sluit() { lb.classList.remove('open'); lb.hidden = true; document.body.style.overflow = ''; }
    groot.addEventListener('click', open);
    lb.querySelector('[data-sluit]').addEventListener('click', sluit);
    lb.querySelector('[data-lb-vorige]').addEventListener('click', function () { toon(i - 1); });
    lb.querySelector('[data-lb-volgende]').addEventListener('click', function () { toon(i + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) sluit(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sluit();
      if (e.key === 'ArrowRight') toon(i + 1);
      if (e.key === 'ArrowLeft') toon(i - 1);
    });
  }
})();
