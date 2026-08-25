/* RIJSCHOOL ERIK · motion & interactie
   Eén motion-concept: het pasje. Op desktop kantelt het mee met je muis,
   op mobiel met je scroll. Verder alleen lichte reveals en een actiebalk. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav ---------- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.burger');
  var mm = document.querySelector('.mm');

  function navScroll() { if (nav) nav.classList.toggle('solid', window.scrollY > 8); }
  navScroll();
  window.addEventListener('scroll', navScroll, { passive: true });

  if (burger && mm) {
    burger.addEventListener('click', function () {
      var open = mm.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.classList.toggle('lock', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        mm.querySelectorAll('nav a').forEach(function (a, i) { a.style.transitionDelay = (0.05 + i * 0.045) + 's'; });
      }
    });
    mm.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mm.classList.remove('open');
        burger.classList.remove('open');
        document.body.classList.remove('lock');
      });
    });
  }

  /* ---------- Reveals ---------- */
  var rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  function reveal() {
    var vh = window.innerHeight;
    rv = rv.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh - 30 && r.bottom > 0) { el.classList.add('in'); return false; }
      return true;
    });
  }
  if (reduce) {
    rv.forEach(function (el) { el.classList.add('in'); });
    rv = [];
  } else {
    reveal();
    window.addEventListener('scroll', function () { requestAnimationFrame(reveal); }, { passive: true });
    window.addEventListener('resize', reveal);
  }

  /* ---------- Het pasje ---------- */
  var stage = document.querySelector('.pass-stage');
  var pass = document.querySelector('.pass');

  function setPass(rx, ry, glare) {
    if (!pass) return;
    pass.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    pass.style.setProperty('--glare', glare.toFixed(1) + '%');
  }

  if (pass && !reduce) {
    var fine = window.matchMedia('(pointer: fine)').matches;

    if (fine && stage) {
      /* desktop: kantelt met de muis */
      setPass(6, -12, -30);
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        setPass(-y * 18, x * 24, x * 120);
      });
      stage.addEventListener('mouseleave', function () { setPass(6, -12, -30); });
    } else {
      /* mobiel: kantelt met de scroll */
      var tick = false;
      var passScroll = function () {
        var r = pass.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (r.top + r.height / 2 - vh / 2) / vh;   /* -1 .. 1 */
        p = Math.max(-1, Math.min(1, p));
        setPass(p * 12, -p * 16, p * -110);
        tick = false;
      };
      passScroll();
      window.addEventListener('scroll', function () {
        if (!tick) { tick = true; requestAnimationFrame(passScroll); }
      }, { passive: true });
    }
  }

  /* ---------- Geslaagden-strip ---------- */
  var track = document.querySelector('.wall-tr');
  document.querySelectorAll('[data-wall]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!track) return;
      var card = track.querySelector('.wc');
      var step = card ? card.getBoundingClientRect().width + 12 : 260;
      track.scrollBy({ left: (btn.getAttribute('data-wall') === 'next' ? 1 : -1) * step, behavior: 'smooth' });
    });
  });

  /* ---------- Mobiele actiebalk ---------- */
  var bar = document.querySelector('.bar');
  if (bar) {
    var barScroll = function () { bar.classList.toggle('show', window.scrollY > 420); };
    barScroll();
    window.addEventListener('scroll', barScroll, { passive: true });
  }

  /* ---------- Proefles-formulier ---------- */
  var form = document.getElementById('proefles-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (n) { var f = form.querySelector('[name="' + n + '"]'); return f ? f.value : ''; };
      var txt = 'Hoi Erik, ik wil graag een gratis proefles.'
        + '\nNaam: ' + val('naam')
        + '\nTelefoon: ' + val('telefoon')
        + (val('start') ? '\nStarten: ' + val('start') : '')
        + (val('bericht') ? '\nBericht: ' + val('bericht') : '');
      window.open('https://wa.me/31614367941?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      var ok = document.querySelector('.fok');
      if (ok) ok.classList.add('on');
    });
  }
})();
