/* Rijles Mera · motion & interactie
   Eén concept, overal doorgevoerd: de route tekent zichzelf.
   Vanilla JS, geen dependencies. Respecteert prefers-reduced-motion. */
(function () {
  'use strict';

  var beperkt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!beperkt) document.body.classList.add('anim');

  /* ---------- Sticky header schaduw ---------- */
  var kop = document.querySelector('.kop');
  function kopSchaduw() {
    if (kop) kop.classList.toggle('zweeft', window.scrollY > 8);
  }
  window.addEventListener('scroll', kopSchaduw, { passive: true });
  kopSchaduw();

  /* ---------- Mobiel menu ---------- */
  var menuknop = document.querySelector('.menuknop');
  var mobielMenu = document.querySelector('.mobiel-menu');
  if (menuknop && mobielMenu) {
    menuknop.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      mobielMenu.classList.toggle('open', open);
      menuknop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobielMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        mobielMenu.classList.remove('open');
        menuknop.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveals ---------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('zichtbaar');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

  /* ---------- Hero: woorden + route bij laden ---------- */
  document.querySelectorAll('.woord > span').forEach(function (s, i) {
    s.style.setProperty('--wi', i);
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add('is-klaar'); });
  });

  /* ---------- Route-paden ----------
     Elk element [data-route] bevat een <path class="teken-pad">.
     data-teken="load"  : tekent zichzelf na laden
     data-teken="scroll": tekent mee met scrollpositie van de sectie */
  function zetKlaar(pad) {
    var lengte = pad.getTotalLength();
    pad.style.strokeDasharray = lengte + ' ' + lengte;
    pad.style.strokeDashoffset = lengte;
    return lengte;
  }

  document.querySelectorAll('[data-route]').forEach(function (wrap) {
    var pad = wrap.querySelector('.teken-pad');
    if (!pad) return;
    var lengte = zetKlaar(pad);
    var modus = wrap.getAttribute('data-teken') || 'scroll';

    if (beperkt) { pad.style.strokeDashoffset = 0; return; }

    if (modus === 'load') {
      pad.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.6,.05,.25,1) .35s';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { pad.style.strokeDashoffset = 0; });
      });
    } else {
      var sectie = wrap.closest('.routeblok') || wrap.parentElement;
      function tekenen() {
        var r = sectie.getBoundingClientRect();
        var vh = window.innerHeight;
        var voortgang = (vh * 0.72 - r.top) / (r.height);
        voortgang = Math.max(0, Math.min(1, voortgang));
        pad.style.strokeDashoffset = lengte * (1 - voortgang);
        wrap.dispatchEvent(new CustomEvent('routevoortgang', { detail: voortgang }));
      }
      window.addEventListener('scroll', tekenen, { passive: true });
      window.addEventListener('resize', tekenen);
      tekenen();
    }
  });

  /* ---------- Punt-routelijn vult zich met scroll ---------- */
  document.querySelectorAll('.routeblok').forEach(function (blok) {
    var vul = blok.querySelector('.routelijn-vul');
    if (!vul) return;
    if (beperkt) { vul.style.height = '100%'; return; }
    function vullen() {
      var r = blok.getBoundingClientRect();
      var voortgang = (window.innerHeight * 0.7 - r.top) / r.height;
      voortgang = Math.max(0, Math.min(1, voortgang));
      vul.style.height = (voortgang * 100) + '%';
    }
    window.addEventListener('scroll', vullen, { passive: true });
    window.addEventListener('resize', vullen);
    vullen();
  });

  /* ---------- Haltes lichten op zodra de route ze passeert ---------- */
  var halteObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('actief');
    });
  }, { threshold: 0.55, rootMargin: '0px 0px -18% 0px' });
  document.querySelectorAll('.halte').forEach(function (h) { halteObs.observe(h); });

  /* ---------- Zachte parallax op heldfoto (alleen desktop, muis) ---------- */
  var heldBeeld = document.querySelector('.held-beeld');
  if (heldBeeld && !beperkt && window.matchMedia('(pointer: fine)').matches) {
    var foto = heldBeeld.querySelector('.held-foto');
    document.querySelector('.held').addEventListener('mousemove', function (ev) {
      var r = heldBeeld.getBoundingClientRect();
      var dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
      foto.style.transform = 'rotate(1.5deg) translate(' + (dx * 8) + 'px,' + (dy * 8) + 'px)';
    });
  }

  /* ---------- Proefles-formulier: opent WhatsApp met ingevuld bericht ---------- */
  var formulier = document.getElementById('proefles-formulier');
  if (formulier) {
    formulier.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var naam = (formulier.querySelector('#veld-naam').value || '').trim();
      var tel = (formulier.querySelector('#veld-tel').value || '').trim();
      var voorkeur = formulier.querySelector('input[name="voorkeur"]:checked');
      var tekst = 'Hoi Mera! Ik wil graag een proefles plannen.'
        + (naam ? ' Mijn naam is ' + naam + '.' : '')
        + (tel ? ' Je kunt me bereiken op ' + tel + '.' : '')
        + (voorkeur ? ' Ik ben het best bereikbaar ' + voorkeur.value + '.' : '');
      window.open('https://wa.me/31687506600?text=' + encodeURIComponent(tekst), '_blank', 'noopener');
    });
  }

  /* ---------- Huidige pagina markeren in nav ---------- */
  var hier = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-lijst a, .mobiel-menu a').forEach(function (a) {
    var doel = a.getAttribute('href');
    if (doel === hier) a.classList.add('hier');
  });
})();
