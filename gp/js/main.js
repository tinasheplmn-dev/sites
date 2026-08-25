/* Rijschool GP · motion en interactie
   Eén concept: de routelijn. Alles beweegt alsof het rustig meerijdt. */
(function () {
  'use strict';

  var minderBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header ---------- */
  var kopBalk = document.querySelector('.kop-balk');
  function zetKopBalk() {
    if (window.scrollY > 10) kopBalk.classList.add('vast');
    else kopBalk.classList.remove('vast');
  }
  zetKopBalk();
  window.addEventListener('scroll', zetKopBalk, { passive: true });

  /* ---------- Mobiel menu ---------- */
  var menuKnop = document.querySelector('.menu-knop');
  if (menuKnop) {
    menuKnop.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mobiel-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }
  /* Menu-links licht gefaseerd binnen laten komen */
  document.querySelectorAll('.mobiel-menu nav a').forEach(function (a, i) {
    a.style.transitionDelay = (0.05 + i * 0.05) + 's';
  });

  /* ---------- Reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-links, .reveal-rechts, .reveal-zoom');
  if ('IntersectionObserver' in window && !minderBeweging) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-beeld');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-beeld'); });
  }

  /* ---------- Hero: woorden een voor een ---------- */
  var heroKop = document.querySelector('[data-woorden]');
  if (heroKop) {
    var delen = [];
    heroKop.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/\s+/).forEach(function (w) {
          if (w) delen.push({ tekst: w, accent: false });
        });
      } else if (node.nodeType === 1) {
        node.textContent.split(/\s+/).forEach(function (w) {
          if (w) delen.push({ tekst: w, accent: node.classList.contains('accent') });
        });
      }
    });
    heroKop.textContent = '';
    delen.forEach(function (d, i) {
      var span = document.createElement('span');
      span.className = 'w' + (d.accent ? ' accent' : '');
      span.textContent = d.tekst;
      span.style.transitionDelay = (0.12 + i * 0.055) + 's';
      heroKop.appendChild(span);
      heroKop.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { document.body.classList.add('klaar'); });
    });
  } else {
    document.body.classList.add('klaar');
  }

  /* ---------- Dakbord: 3D-tilt met traagheid ---------- */
  var dakbord = document.querySelector('.dakbord');
  var hero = document.querySelector('.hero');
  if (dakbord && hero && !minderBeweging && window.matchMedia('(pointer: fine)').matches) {
    var doelX = 0, doelY = 0, huidigX = 0, huidigY = 0, tiltActief = false;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      doelY = ((e.clientX - r.left) / r.width - 0.5) * 26;
      doelX = ((e.clientY - r.top) / r.height - 0.5) * -18;
      if (!tiltActief) { tiltActief = true; tiltStap(); }
    });
    hero.addEventListener('mouseleave', function () { doelX = 0; doelY = 0; });
    var tiltStap = function () {
      huidigX += (doelX - huidigX) * 0.07;
      huidigY += (doelY - huidigY) * 0.07;
      dakbord.style.transform = 'rotateX(' + huidigX.toFixed(2) + 'deg) rotateY(' + huidigY.toFixed(2) + 'deg)';
      requestAnimationFrame(tiltStap);
    };
  } else if (dakbord && !minderBeweging) {
    dakbord.classList.add('dakbord-zweef');
  }

  /* ---------- Marquee: rustig meerijden ---------- */
  document.querySelectorAll('.marquee').forEach(function (mq) {
    var inhoud = mq.innerHTML;
    mq.innerHTML = inhoud + inhoud;
    if (minderBeweging) return;
    var x = 0, snelheid = 0.45, pauze = false;
    mq.addEventListener('mouseenter', function () { pauze = true; });
    mq.addEventListener('mouseleave', function () { pauze = false; });
    function stap() {
      if (!pauze) {
        x -= snelheid;
        if (-x >= mq.scrollWidth / 2) x = 0;
        mq.style.transform = 'translateX(' + x + 'px)';
      }
      requestAnimationFrame(stap);
    }
    stap();
  });

  /* ---------- Autootje dat van links naar rechts rijdt terwijl je scrolt ---------- */
  var routeSectie = document.querySelector('.route-sectie');
  if (routeSectie) {
    var auto = document.createElement('div');
    auto.className = 'route-auto';
    auto.setAttribute('aria-hidden', 'true');
    auto.innerHTML = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="11" fill="#F0641A"/><circle cx="20" cy="20" r="16" fill="none" stroke="#F0641A" stroke-opacity="0.3" stroke-width="2"/><path d="M14.5 21.5 l3-5.5 a2 2 0 0 1 1.7-1 h1.6 a2 2 0 0 1 1.7 1 l3 5.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M13.5 22 h13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
    routeSectie.appendChild(auto);

    function updateAuto() {
      var r = routeSectie.getBoundingClientRect();
      var zicht = window.innerHeight;
      var voortgang = Math.min(1, Math.max(0, (zicht * 0.72 - r.top) / (r.height)));
      var maxX = window.innerWidth - 60;
      var x = maxX * voortgang;
      var y = r.height * voortgang * 0.3;
      auto.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      auto.style.opacity = voortgang > 0.01 && voortgang < 0.995 ? 1 : 0;
    }
    if (!minderBeweging) {
      window.addEventListener('scroll', updateAuto, { passive: true });
      window.addEventListener('resize', updateAuto);
      window.addEventListener('load', updateAuto);
      setTimeout(updateAuto, 800);
    }
  }

  /* ---------- Kaart in de hero: routes rijden naar Rosmalen ---------- */
  var kaart = document.querySelector('.werkgebied-kaart');
  if (kaart && !minderBeweging) {
    kaart.querySelectorAll('.kaart-route').forEach(function (pad, i) {
      var len = pad.getTotalLength();
      pad.style.strokeDasharray = len;
      pad.style.strokeDashoffset = len;
      pad.style.transition = 'stroke-dashoffset 1.6s ' + (0.4 + i * 0.18) + 's cubic-bezier(0.22,1,0.36,1)';
    });
    var kaartIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        kaart.querySelectorAll('.kaart-route').forEach(function (pad) {
          pad.style.strokeDashoffset = 0;
        });
        /* autootje blijft rondjes rijden over de hoofdroute */
        var rijPad = kaart.querySelector('.kaart-hoofdroute');
        var stip = kaart.querySelector('.kaart-auto');
        if (rijPad && stip) {
          var lengte = rijPad.getTotalLength();
          var start = null;
          function rijd(ts) {
            if (!start) start = ts;
            var t = ((ts - start) / 9000) % 1;
            var heen = t < 0.5 ? t * 2 : (1 - t) * 2;
            var soepel = heen * heen * (3 - 2 * heen);
            var p = rijPad.getPointAtLength(soepel * lengte);
            stip.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ')');
            requestAnimationFrame(rijd);
          }
          requestAnimationFrame(rijd);
        }
        kaartIo.disconnect();
      });
    }, { threshold: 0.35 });
    kaartIo.observe(kaart);
  }

  /* ---------- Reviewschuif ---------- */
  document.querySelectorAll('[data-schuif]').forEach(function (blok) {
    var schuif = blok.querySelector('.review-schuif');
    var vorige = blok.querySelector('[data-vorige]');
    var volgende = blok.querySelector('[data-volgende]');
    if (!schuif) return;
    function stapGrootte() {
      var kaartEl = schuif.querySelector('.review-kaart');
      return kaartEl ? kaartEl.getBoundingClientRect().width + 19 : 400;
    }
    if (vorige) vorige.addEventListener('click', function () { schuif.scrollBy({ left: -stapGrootte(), behavior: 'smooth' }); });
    if (volgende) volgende.addEventListener('click', function () { schuif.scrollBy({ left: stapGrootte(), behavior: 'smooth' }); });
  });

  /* ---------- Proefles-formulier: opent WhatsApp met een nette boodschap ---------- */
  var form = document.getElementById('proefles-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = form.querySelector('#naam').value.trim();
      var telefoon = form.querySelector('#telefoon').value.trim();
      var woonplaats = form.querySelector('#woonplaats').value;
      var bericht = form.querySelector('#bericht').value.trim();
      var regels = [
        'Hoi Gijs, ik wil graag een proefles aanvragen.',
        'Naam: ' + naam,
        'Telefoon: ' + telefoon,
        'Woonplaats: ' + woonplaats
      ];
      if (bericht) regels.push('Extra: ' + bericht);
      var url = 'https://wa.me/31617412216?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
      var melding = document.getElementById('form-melding');
      if (melding) {
        melding.textContent = 'WhatsApp opent met je aanvraag. Versturen kan je daar met een tik. Liever bellen? 06 17 41 22 16.';
        melding.style.display = 'block';
      }
    });
  }

  /* ---------- Jaartal in de footer ---------- */
  document.querySelectorAll('[data-jaar]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
