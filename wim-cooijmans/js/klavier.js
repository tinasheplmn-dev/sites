/* Het klavier onderaan de hero. Zonder JavaScript staat er een getekend
   klavier (CSS-achtergrond). Met JavaScript worden het echte toetsen die
   de kop "spelen": bij elke regel die binnenkomt gaat er een akkoord aan,
   daarna een loopje naar de knop. Met de muis kun je er zacht overheen
   strijken. Geen geluid, geen klikbediening. Uit bij minder beweging. */
(function () {
  'use strict';
  var plek = document.querySelector('[data-klavier]');
  if (!plek) return;
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* per octaaf 7 witte toetsen; zwart na C, D, F, G, A */
  var zwartNa = [true, true, false, true, true, true, false];
  var witten = [];
  var zwarten = [];

  function bouw() {
    var breed = plek.clientWidth;
    var doelBreedte = breed < 640 ? 30 : 38;
    var aantal = Math.max(14, Math.round(breed / doelBreedte));
    plek.textContent = '';
    witten = []; zwarten = [];
    for (var i = 0; i < aantal; i++) {
      var w = document.createElement('span');
      w.className = 'wit';
      if (zwartNa[i % 7] && i < aantal - 1) {
        var z = document.createElement('span');
        z.className = 'zwart';
        w.appendChild(z);
        zwarten[i] = z;
      }
      plek.appendChild(w);
      witten.push(w);
    }
    plek.classList.add('gebouwd');
  }

  function druk(el, duur) {
    if (!el) return;
    el.classList.add('aan');
    setTimeout(function () { el.classList.remove('aan'); }, duur || 420);
  }

  /* akkoord: grondtoon, terts, kwint (in witte toetsen: 0, 2, 4) */
  function akkoord(start, duur) {
    [0, 2, 4].forEach(function (s) { druk(witten[start + s], duur); });
  }

  function speelIntro() {
    var n = witten.length;
    var midden = Math.floor(n * 0.18);
    /* twee akkoorden op de twee regels van de kop */
    setTimeout(function () { akkoord(midden, 700); }, 260);
    setTimeout(function () { akkoord(midden + 3, 700); }, 560);
    /* daarna een loopje omhoog, met een zwarte toets ertussen */
    var stap = 0;
    for (var i = midden + 2; i < Math.min(n, midden + 2 + Math.round(n * 0.55)); i++) {
      (function (idx, t) {
        setTimeout(function () {
          druk(witten[idx], 360);
          if (idx % 3 === 0) druk(zwarten[idx], 300);
        }, t);
      })(i, 1050 + stap * 55);
      stap++;
    }
  }

  bouw();
  var vorigeBreedte = plek.clientWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(plek.clientWidth - vorigeBreedte) > 60) { vorigeBreedte = plek.clientWidth; bouw(); }
  });
  if (kalm) return;

  if (document.readyState === 'complete') speelIntro();
  else window.addEventListener('load', function () { setTimeout(speelIntro, 60); });

  /* met de muis: de toets onder de cursor gaat zacht aan */
  if (window.matchMedia('(pointer: fine)').matches) {
    var laatste = null;
    plek.parentElement.addEventListener('pointermove', function (e) {
      var r = plek.getBoundingClientRect();
      if (e.clientY < r.top - 10 || e.clientY > r.bottom) return;
      var idx = Math.floor((e.clientX - r.left) / (r.width / witten.length));
      var doel = witten[idx];
      if (e.clientY < r.top + r.height * 0.6 && zwarten[idx] && (e.clientX - r.left) % (r.width / witten.length) > (r.width / witten.length) * 0.7) doel = zwarten[idx];
      if (doel && doel !== laatste) { druk(doel, 380); laatste = doel; }
    });
  }
})();
