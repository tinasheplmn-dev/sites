/* Rijschool Makkie · motion & interactie
   Concept "De gouden route": een gouden lijn tekent zich al scrollend
   over de pagina, met een stip die de route rijdt. Vanilla JS, geen libraries. */
(function () {
  'use strict';

  var beweegOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header ---------- */
  var kop = document.querySelector('.kop-balk');
  function zetKop() {
    if (kop) kop.classList.toggle('vast', window.scrollY > 24);
  }
  zetKop();
  window.addEventListener('scroll', zetKop, { passive: true });

  /* ---------- Mobiel menu ---------- */
  var menuKnop = document.querySelector('.menu-knop');
  if (menuKnop) {
    menuKnop.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.menu-vlak a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        menuKnop.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Hero intro ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('klaar'); });
    });
    // Vangnet: in verborgen tabbladen loopt requestAnimationFrame niet.
    setTimeout(function () { hero.classList.add('klaar'); }, 350);
  }

  /* ---------- Reveal bij scroll ----------
     Bewust geen IntersectionObserver: die vuurt niet in elke (embedded)
     browser betrouwbaar. Een directe meting doet het overal. */
  var teOnthullen = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], [data-reveal-groep]'));
  function onthul() {
    if (!teOnthullen.length) return;
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    teOnthullen = teOnthullen.filter(function (el) {
      var r = el.getBoundingClientRect();
      // Ook onthullen als de sectie al gepasseerd is (snelle scroll of sprong).
      if (r.top < vh * 0.92) {
        el.classList.add('in');
        return false;
      }
      return true;
    });
  }
  window.addEventListener('scroll', onthul, { passive: true });
  window.addEventListener('resize', onthul, { passive: true });
  window.addEventListener('load', onthul);
  // Vangnet voor trage layout/fonts en browsers zonder vroege events.
  var onthulTimer = setInterval(function () {
    onthul();
    if (!teOnthullen.length) clearInterval(onthulTimer);
  }, 450);
  onthul();

  /* ---------- De gouden route ---------- */
  var routeHouder = document.getElementById('route');
  if (routeHouder && beweegOk) {
    var pad = null, stip = null, gloed = null, padLengte = 0;
    var doel = 0, huidig = 0, tikt = false;

    var bouwPoging = 0;
    function bouwRoute() {
      var main = document.querySelector('main');
      if (!main) return;
      var b = main.offsetHeight;
      var w = document.documentElement.clientWidth || window.innerWidth;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if ((!w || !vh || !b) && bouwPoging < 20) {
        // Viewport nog niet bekend (bijv. embedded browser): probeer zo opnieuw.
        bouwPoging++;
        return setTimeout(bouwRoute, 150);
      }
      var mobiel = w < 760;
      var marge = mobiel ? w * 0.1 : w * 0.16;
      var links = marge, rechts = w - marge;
      var midden = w / 2;

      // Slingerende route: start onder de hero, golft links-rechts naar beneden.
      var y = Math.min(vh * 0.92, b * 0.2);
      var stapH = mobiel ? 620 : 760;
      var d = 'M ' + midden + ' ' + Math.round(y * 0.55);
      var kant = true;
      d += ' C ' + midden + ' ' + Math.round(y * 0.8) + ', ' + rechts + ' ' + Math.round(y * 0.9) + ', ' + rechts + ' ' + Math.round(y + stapH * 0.35);
      y += stapH * 0.35;
      while (y < b - stapH * 0.9) {
        var x1 = kant ? rechts : links;
        var x2 = kant ? links : rechts;
        var ny = y + stapH;
        d += ' C ' + x1 + ' ' + Math.round(y + stapH * 0.55) + ', ' + x2 + ' ' + Math.round(y + stapH * 0.45) + ', ' + x2 + ' ' + Math.round(ny);
        y = ny;
        kant = !kant;
      }
      var eindX = kant ? links : rechts;
      d += ' C ' + eindX + ' ' + Math.round(y + 200) + ', ' + midden + ' ' + Math.round(b - 160) + ', ' + midden + ' ' + Math.round(b - 40);

      routeHouder.setAttribute('viewBox', '0 0 ' + w + ' ' + b);
      routeHouder.innerHTML =
        '<path d="' + d + '" stroke-width="' + (mobiel ? 2.5 : 3) + '"/>' +
        '<circle class="route-gloed" r="' + (mobiel ? 11 : 14) + '" cx="-99" cy="-99"/>' +
        '<circle class="route-stip" r="' + (mobiel ? 4.5 : 5.5) + '" cx="-99" cy="-99"/>';
      pad = routeHouder.querySelector('path');
      stip = routeHouder.querySelector('.route-stip');
      gloed = routeHouder.querySelector('.route-gloed');
      padLengte = pad.getTotalLength();
      pad.style.strokeDasharray = padLengte;
      pad.style.strokeDashoffset = padLengte;
      zetDoel();
      huidig = doel;
      tekenRoute();
    }

    function zetDoel() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var voortgang = docH > 0 ? window.scrollY / docH : 0;
      doel = Math.min(1, Math.max(0, voortgang * 1.12));
    }

    function tekenRoute() {
      if (!pad) return;
      var lengte = padLengte * huidig;
      pad.style.strokeDashoffset = Math.max(0, padLengte - lengte);
      if (lengte > 2) {
        var punt = pad.getPointAtLength(lengte);
        stip.setAttribute('cx', punt.x); stip.setAttribute('cy', punt.y);
        gloed.setAttribute('cx', punt.x); gloed.setAttribute('cy', punt.y);
      }
    }

    function loop() {
      huidig += (doel - huidig) * 0.08;
      if (Math.abs(doel - huidig) < 0.0005) { huidig = doel; tikt = false; }
      tekenRoute();
      if (tikt) requestAnimationFrame(loop);
    }

    window.addEventListener('scroll', function () {
      if (!pad) return bouwRoute();
      zetDoel();
      if (!tikt) { tikt = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && !pad) bouwRoute();
    });

    var herbouwTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(herbouwTimer);
      herbouwTimer = setTimeout(bouwRoute, 200);
    });
    window.addEventListener('load', function () { setTimeout(bouwRoute, 60); });
    // Lazy images veranderen de paginahoogte: hou de route in de pas.
    var gebouwdVoorHoogte = 0;
    var origBouw = bouwRoute;
    bouwRoute = function () {
      var main = document.querySelector('main');
      if (main) gebouwdVoorHoogte = main.offsetHeight;
      origBouw();
    };
    setInterval(function () {
      var main = document.querySelector('main');
      if (main && Math.abs(main.offsetHeight - gebouwdVoorHoogte) > 250) bouwRoute();
    }, 900);
    bouwRoute();
  } else if (routeHouder && !beweegOk) {
    routeHouder.remove();
  }

  /* ---------- Polaroid-parallax (alleen desktop met muis) ---------- */
  var heroBeeld = document.querySelector('.hero-beeld');
  if (heroBeeld && beweegOk && window.matchMedia('(pointer: fine)').matches) {
    var polas = heroBeeld.querySelectorAll('.polaroid');
    var basis = [-5, 4, -2];
    document.querySelector('.hero').addEventListener('mousemove', function (e) {
      if (!document.querySelector('.hero.klaar')) return;
      var r = heroBeeld.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      polas.forEach(function (p, i) {
        var diepte = (3 - i) * 5;
        p.style.transform = 'rotate(' + basis[i] + 'deg) translate(' + (dx * diepte) + 'px, ' + (dy * diepte) + 'px)';
      });
    });
  }

  /* ---------- Review-slider ---------- */
  var slider = document.querySelector('.review-slider');
  if (slider) {
    var stapBreedte = function () {
      var kaart = slider.querySelector('.review-kaart');
      return kaart ? kaart.offsetWidth + 21 : 340;
    };
    document.querySelectorAll('[data-slider-vorige]').forEach(function (b) {
      b.addEventListener('click', function () { slider.scrollBy({ left: -stapBreedte(), behavior: 'smooth' }); });
    });
    document.querySelectorAll('[data-slider-volgende]').forEach(function (b) {
      b.addEventListener('click', function () { slider.scrollBy({ left: stapBreedte(), behavior: 'smooth' }); });
    });
  }

  /* ---------- Marquee: rijen dupliceren voor naadloze loop ---------- */
  document.querySelectorAll('.marquee-rij').forEach(function (rij) {
    rij.innerHTML += rij.innerHTML;
  });

  /* ---------- Lightbox op de geslaagden-muur ---------- */
  var muur = document.querySelector('.muur');
  if (muur) {
    var bak = document.createElement('div');
    bak.className = 'lichtbak';
    bak.setAttribute('role', 'dialog');
    bak.setAttribute('aria-label', 'Foto vergroot');
    bak.innerHTML =
      '<button class="lichtbak-pijl vorige" aria-label="Vorige foto"><svg class="icoon" aria-hidden="true"><use href="#i-pijl-links"/></svg></button>' +
      '<img alt="">' +
      '<button class="lichtbak-pijl volgende" aria-label="Volgende foto"><svg class="icoon" aria-hidden="true"><use href="#i-pijl"/></svg></button>' +
      '<button class="lichtbak-sluit" aria-label="Sluiten">&times;</button>';
    document.body.appendChild(bak);
    var bakImg = bak.querySelector('img');
    var fotos = Array.prototype.slice.call(muur.querySelectorAll('figure img'));
    var index = 0;

    function toon(i) {
      index = (i + fotos.length) % fotos.length;
      var src = fotos[index].getAttribute('data-groot') || fotos[index].src;
      bakImg.src = src;
      bakImg.alt = fotos[index].alt;
    }
    fotos.forEach(function (img, i) {
      img.closest('figure').addEventListener('click', function () {
        toon(i);
        bak.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    function sluit() { bak.classList.remove('open'); document.body.style.overflow = ''; }
    bak.querySelector('.lichtbak-sluit').addEventListener('click', sluit);
    bak.querySelector('.vorige').addEventListener('click', function (e) { e.stopPropagation(); toon(index - 1); });
    bak.querySelector('.volgende').addEventListener('click', function (e) { e.stopPropagation(); toon(index + 1); });
    bak.addEventListener('click', function (e) { if (e.target === bak) sluit(); });
    document.addEventListener('keydown', function (e) {
      if (!bak.classList.contains('open')) return;
      if (e.key === 'Escape') sluit();
      if (e.key === 'ArrowLeft') toon(index - 1);
      if (e.key === 'ArrowRight') toon(index + 1);
    });
  }

  /* ---------- Proefles-formulier: opent WhatsApp met ingevuld bericht ---------- */
  var form = document.getElementById('proefles-formulier');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = form.querySelector('#f-naam').value.trim();
      var tel = form.querySelector('#f-tel').value.trim();
      var taal = form.querySelector('input[name="taal"]:checked');
      var wens = form.querySelector('#f-wens').value;
      var bericht = form.querySelector('#f-bericht').value.trim();

      var regels = [];
      regels.push('Hoi Maja! Ik wil graag een proefles plannen.');
      regels.push('Naam: ' + naam);
      if (tel) regels.push('Telefoon: ' + tel);
      if (wens) regels.push('Ik zoek: ' + wens);
      regels.push('Lestaal: ' + (taal ? taal.value : 'Nederlands'));
      if (bericht) regels.push('Extra: ' + bericht);

      var url = 'https://wa.me/31654117229?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');

      form.querySelector('.form-velden').style.display = 'none';
      form.querySelector('.form-succes').classList.add('zichtbaar');
    });
  }
})();
