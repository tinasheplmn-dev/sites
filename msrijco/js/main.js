/* M&S Rijopleidingen : interactie
   Eén motion-concept: de lijn die zich tekent terwijl jij scrolt. */
(function () {
  'use strict';

  var verminderd = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- header: vast bij scroll, verbergen bij omlaag scrollen ----- */
  var kop = document.querySelector('.kop-balk');
  var vorigeY = window.scrollY;
  function opScroll() {
    var y = window.scrollY;
    if (kop) {
      kop.classList.toggle('vast', y > 24);
      if (y > 320 && y > vorigeY + 6 && !document.body.classList.contains('menu-open')) {
        kop.classList.add('weg');
      } else if (y < vorigeY - 6 || y < 320) {
        kop.classList.remove('weg');
      }
    }
    vorigeY = y;
  }
  window.addEventListener('scroll', opScroll, { passive: true });
  opScroll();

  /* ----- mobiel menu ----- */
  var menuKnop = document.querySelector('.menu-knop');
  if (menuKnop) {
    menuKnop.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.doek a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        menuKnop.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- reveal-systeem ----- */
  var revs = document.querySelectorAll('.rev');
  if ('IntersectionObserver' in window && !verminderd) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revs.forEach(function (el) { io.observe(el); });
    /* vangnet: als IO niet vuurt (bijv. verborgen tabblad of prerender),
       onthult een simpele scroll-check alles wat in beeld staat */
    var laatsteCheck = 0;
    var vangnet = function () {
      var nu = Date.now();
      if (nu - laatsteCheck < 120) return;
      laatsteCheck = nu;
      var grens = window.innerHeight * 0.96;
      document.querySelectorAll('.rev:not(.in)').forEach(function (el) {
        if (el.getBoundingClientRect().top < grens) el.classList.add('in');
      });
      document.querySelectorAll('[data-teken]').forEach(function (pad) {
        if (pad.style.strokeDashoffset !== '0' && pad.getBoundingClientRect().top < grens) {
          pad.style.strokeDashoffset = '0';
        }
      });
    };
    window.addEventListener('scroll', vangnet, { passive: true });
  } else {
    revs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ----- de lijn die zich tekent (SVG paths met data-teken) ----- */
  var paden = document.querySelectorAll('[data-teken]');
  paden.forEach(function (pad) {
    var lengte;
    try { lengte = pad.getTotalLength(); } catch (err) { return; }
    pad.style.strokeDasharray = lengte + ' ' + lengte;
    pad.style.strokeDashoffset = lengte;
    pad.getBoundingClientRect(); /* forceer layout zodat de transitie pakt */
  });
  if (paden.length) {
    if ('IntersectionObserver' in window && !verminderd) {
      var lijnIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var vertraging = parseFloat(e.target.getAttribute('data-teken')) || 0;
            setTimeout(function () { e.target.style.strokeDashoffset = '0'; }, vertraging * 1000);
            lijnIo.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      paden.forEach(function (pad) { lijnIo.observe(pad); });
    } else {
      paden.forEach(function (pad) { pad.style.strokeDashoffset = '0'; });
    }
  }

  /* ----- hero: zachte parallax op het raster (alleen fijne pointers) ----- */
  var raster = document.querySelector('.held-raster');
  if (raster && !verminderd && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      var dx = (e.clientX / window.innerWidth - 0.5) * 14;
      var dy = (e.clientY / window.innerHeight - 0.5) * 10;
      raster.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    }, { passive: true });
  }

  /* ----- proefles-formulier: opent WhatsApp met ingevuld bericht ----- */
  var form = document.getElementById('proefles-formulier');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var naam = (d.get('naam') || '').toString().trim();
      var tel = (d.get('telefoon') || '').toString().trim();
      var les = d.get('lestype') || 'auto';
      var taal = d.get('taal') || 'Nederlands';
      var bericht = (d.get('bericht') || '').toString().trim();
      var regels = [
        (taal === 'English' ? 'Hi M&S, I would like to book a trial lesson.' : 'Hoi M&S, ik wil graag een proefles aanvragen.'),
        (taal === 'English' ? 'Name: ' : 'Naam: ') + naam,
        (taal === 'English' ? 'Phone: ' : 'Telefoon: ') + tel,
        (taal === 'English' ? 'Lesson type: ' : 'Lestype: ') + les,
        (taal === 'English' ? 'Language: English' : 'Taal: Nederlands')
      ];
      if (bericht) regels.push((taal === 'English' ? 'Message: ' : 'Bericht: ') + bericht);
      var url = 'https://wa.me/31618963711?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
      var melding = document.getElementById('form-melding');
      if (melding) {
        melding.hidden = false;
        melding.textContent = taal === 'English'
          ? 'WhatsApp opens with your message ready to send. No WhatsApp? Call 06 18963711 or email info@msrijco.nl.'
          : 'WhatsApp opent met je bericht klaar om te versturen. Geen WhatsApp? Bel 06 18963711 of mail naar info@msrijco.nl.';
      }
    });
  }

  /* ----- jaartal in de footer ----- */
  var jaar = document.getElementById('jaar');
  if (jaar) jaar.textContent = new Date().getFullYear();
})();
