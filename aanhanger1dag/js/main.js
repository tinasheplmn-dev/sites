/* Aanhangerrijbewijs in 1 dag — interactie
   Eén motion-concept: "de lijn van de dag". Verder: reveals, header, nav, formulier. */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- header */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ------------------------------------------------------ mobiel menu */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------- reveals */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function revealCheck() {
    if (!revealEls.length) return;
    var vh = window.innerHeight;
    revealEls = revealEls.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) {
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
  }
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
    /* directe check als vangnet: elementen die al in beeld staan verschijnen
       meteen, ook als de observer (nog) niet gevuurd heeft */
    window.addEventListener('scroll', revealCheck, { passive: true });
    window.addEventListener('resize', revealCheck);
    revealCheck();
  }

  /* --------------------------------------- de lijn van de dag (route) */
  var timeline = document.querySelector('.day-timeline');
  var route = document.querySelector('.day-route');
  var marker = document.querySelector('.day-marker');
  var steps = document.querySelectorAll('.day-step');

  function updateRoute() {
    if (!timeline || !route) return;
    var rect = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    /* voortgang: 0 als de bovenkant het midden van het scherm raakt,
       1 als de onderkant het midden raakt */
    var total = rect.height;
    var passed = (vh * 0.55) - rect.top;
    var p = Math.max(0, Math.min(1, passed / total));
    route.style.setProperty('--route-progress', p.toFixed(4));
    if (marker) {
      marker.style.top = (p * 100) + '%';
    }
    steps.forEach(function (step) {
      var sRect = step.getBoundingClientRect();
      step.classList.toggle('is-passed', sRect.top + 20 < vh * 0.55);
    });
  }
  if (timeline && !reduceMotion) {
    window.addEventListener('scroll', updateRoute, { passive: true });
    window.addEventListener('resize', updateRoute);
    updateRoute();
  } else if (timeline) {
    route.style.setProperty('--route-progress', 1);
    if (marker) marker.style.display = 'none';
    steps.forEach(function (s) { s.classList.add('is-passed'); });
  }

  /* --------------------------------------------- openingstijden: vandaag */
  var hoursRows = document.querySelectorAll('.contact-hours tr[data-day]');
  if (hoursRows.length) {
    var today = new Date().getDay(); /* 0 = zondag */
    hoursRows.forEach(function (row) {
      if (parseInt(row.getAttribute('data-day'), 10) === today) row.classList.add('today');
    });
  }

  /* ------------------------------------------------------- formulier */
  var form = document.querySelector('#aanvraag-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var naam = (data.get('naam') || '').toString().trim();
      var tel = (data.get('telefoon') || '').toString().trim();
      var pakket = (data.get('pakket') || '1-daagse cursus').toString();
      var periode = (data.get('periode') || '').toString().trim();
      if (!naam || !tel) {
        form.reportValidity();
        return;
      }
      var msg = 'Hallo, ik wil graag een cursusdag aanvragen.\n'
        + 'Naam: ' + naam + '\n'
        + 'Telefoon: ' + tel + '\n'
        + 'Pakket: ' + pakket
        + (periode ? '\nGewenste periode: ' + periode : '');
      var url = 'https://wa.me/31643404288?text=' + encodeURIComponent(msg);
      window.open(url, '_blank', 'noopener');
      var ok = form.querySelector('.form-success');
      if (ok) {
        ok.classList.add('is-visible');
        ok.focus && ok.focus();
      }
    });
  }

  /* ----------------------------------------- footer: huidig jaartal */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
