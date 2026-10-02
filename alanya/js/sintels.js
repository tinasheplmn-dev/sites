/* Sintels: gloeiende vonkjes die uit de houtskool omhoog dwarrelen, over de hero.
   Puur decoratief (aria-hidden), stopt buiten beeld en bij "minder beweging". */
(function () {
  'use strict';
  var doek = document.querySelector('[data-sintels]');
  if (!doek || !doek.getContext || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = doek.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var b = 0, h = 0, vonken = [], zichtbaar = true;
  var mobiel = window.matchMedia('(max-width: 640px)').matches;
  var AANTAL = mobiel ? 26 : 60;

  function maat() {
    var r = doek.getBoundingClientRect();
    b = r.width; h = r.height;
    doek.width = b * dpr; doek.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function nieuw(start) {
    return {
      x: b * (0.35 + Math.random() * 0.65),
      y: start ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.35 + Math.random() * 0.9,
      vx: -0.2 + Math.random() * 0.4,
      fase: Math.random() * 6.28,
      leven: 0.55 + Math.random() * 0.45,
    };
  }
  function stap() {
    if (!zichtbaar) return;
    ctx.clearRect(0, 0, b, h);
    for (var i = 0; i < vonken.length; i++) {
      var v = vonken[i];
      v.y -= v.vy; v.fase += 0.03; v.x += v.vx + Math.sin(v.fase) * 0.35;
      var hoogte = 1 - v.y / h;
      var a = Math.max(0, v.leven - hoogte * 0.9);
      if (v.y < -10 || a <= 0) { vonken[i] = nieuw(false); continue; }
      var g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, v.r * 4);
      g.addColorStop(0, 'rgba(255,214,140,' + a + ')');
      g.addColorStop(0.35, 'rgba(255,128,40,' + a * 0.7 + ')');
      g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 4, 0, 6.29); ctx.fill();
    }
    requestAnimationFrame(stap);
  }
  maat();
  for (var i = 0; i < AANTAL; i++) vonken.push(nieuw(true));
  window.addEventListener('resize', maat);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      var was = zichtbaar; zichtbaar = e[0].isIntersecting;
      if (zichtbaar && !was) requestAnimationFrame(stap);
    }).observe(doek);
  }
  requestAnimationFrame(stap);
})();
