/* Rijschool van Venrooij : interactie
   1. navigatie (mobiel menu)
   2. scroll-reveals
   3. de route: een gele middenstreep door de pagina met een
      rijdend Puma'tje dat de scrollpositie volgt (het ene
      grote motion-idee van deze site)
   4. 3D-tilt op het gele woordbord in de hero
   5. proefles-formulier naar WhatsApp
   6. kleine grappen (claxon op de lesauto)
*/
(function () {
  'use strict';

  var verminderd = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. navigatie ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.hoofdnav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 2. reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('binnen');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('binnen'); });
  }

  /* ---------- 3. de route ---------- */
  var laag = document.getElementById('route-laag');
  if (laag && !verminderd) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    var padToe = document.createElementNS(NS, 'path');   /* nog te rijden: licht */
    var padAf = document.createElementNS(NS, 'path');    /* afgelegd: vol geel */
    var auto = document.createElementNS(NS, 'g');
    svg.setAttribute('aria-hidden', 'true');

    [padToe, padAf].forEach(function (p) {
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-dasharray', '16 14');
    });
    padToe.setAttribute('stroke', 'rgba(23,24,28,.13)');
    padToe.setAttribute('stroke-width', '4');
    padAf.setAttribute('stroke', '#F0B400');
    padAf.setAttribute('stroke-width', '5');
    padAf.setAttribute('id', 'route-pad-af');

    /* Puma'tje in bovenaanzicht, met geel L-daklicht */
    auto.innerHTML =
      '<g transform="translate(-19,-40)">' +
      '<rect x="2" y="6" width="34" height="68" rx="15" fill="#C7CBD1" stroke="#17181C" stroke-width="3"/>' +
      '<rect x="-2" y="26" width="6" height="14" rx="2.5" fill="#17181C"/>' +
      '<rect x="34" y="26" width="6" height="14" rx="2.5" fill="#17181C"/>' +
      '<path d="M7 22 Q19 14 31 22 L29.5 32 Q19 26 8.5 32 Z" fill="#17181C" opacity=".82"/>' +
      '<path d="M7 60 Q19 66 31 60 L30 52 Q19 57 8 52 Z" fill="#17181C" opacity=".82"/>' +
      '<rect x="9" y="34" width="20" height="16" rx="4" fill="#FFD21E" stroke="#17181C" stroke-width="2.5"/>' +
      '<text x="19" y="46.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="#17181C">L</text>' +
      '</g>';
    auto.setAttribute('id', 'route-auto');

    svg.appendChild(padToe);
    svg.appendChild(padAf);
    svg.appendChild(auto);
    laag.appendChild(svg);

    var padLengte = 0;
    var klaarVoorTekenen = false;
    var autoSchaal = 1;

    function bouwRoute() {
      var main = document.querySelector('main');
      var stops = document.querySelectorAll('[data-route]');
      if (!main || stops.length < 2) return;
      var mainRect = main.getBoundingClientRect();
      var mainTop = mainRect.top + window.scrollY;
      var W = main.offsetWidth;
      var H = main.offsetHeight;
      var mobiel = W < 900;
      autoSchaal = W < 640 ? 0.8 : 1;

      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

      /* waypoints: per gemarkeerd element een punt in de vrije ruimte */
      var punten = [];
      stops.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var y = r.top + window.scrollY - mainTop + r.height * (parseFloat(el.dataset.routeY || '0.5'));
        var kant = el.dataset.route;
        var x;
        if (mobiel) {
          x = kant === 'links' ? W * 0.08 : kant === 'rechts' ? W * 0.92 : W * 0.5;
          if (parseFloat(el.dataset.routeY || '0.5') >= 0.95) y += 46;
        } else {
          x = kant === 'links' ? W * 0.06 : kant === 'rechts' ? W * 0.94 : W * 0.5;
        }
        punten.push({ x: x, y: y });
      });

      /* vloeiende curve door de punten (catmull-rom naar bezier) */
      var d = 'M ' + punten[0].x + ' ' + punten[0].y;
      for (var i = 0; i < punten.length - 1; i++) {
        var p0 = punten[i - 1] || punten[i];
        var p1 = punten[i];
        var p2 = punten[i + 1];
        var p3 = punten[i + 2] || p2;
        var c1x = p1.x + (p2.x - p0.x) / 6;
        var c1y = p1.y + (p2.y - p0.y) / 6;
        var c2x = p2.x - (p3.x - p1.x) / 6;
        var c2y = p2.y - (p3.y - p1.y) / 6;
        d += ' C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + p2.x + ' ' + p2.y;
      }
      padToe.setAttribute('d', d);
      padAf.setAttribute('d', d);
      padLengte = padAf.getTotalLength();
      padAf.setAttribute('stroke-dasharray', padLengte);
      padAf.setAttribute('stroke-dashoffset', padLengte);
      klaarVoorTekenen = true;
      teken(true);
    }

    var doelVoortgang = 0, huidig = 0, rafBezig = false;

    function scrollVoortgang() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / docH));
    }

    function teken(direct) {
      if (!klaarVoorTekenen) return;
      doelVoortgang = scrollVoortgang();
      if (direct) huidig = doelVoortgang;
      if (!rafBezig) { rafBezig = true; requestAnimationFrame(stap); }
    }

    function stap() {
      huidig += (doelVoortgang - huidig) * 0.09;
      if (Math.abs(doelVoortgang - huidig) < 0.0004) huidig = doelVoortgang;
      var len = huidig * padLengte;
      padAf.setAttribute('stroke-dashoffset', Math.max(0, padLengte - len));
      var punt = padAf.getPointAtLength(len);
      var voor = padAf.getPointAtLength(Math.min(padLengte, len + 2));
      var achter = padAf.getPointAtLength(Math.max(0, len - 2));
      var hoek = Math.atan2(voor.y - achter.y, voor.x - achter.x) * 180 / Math.PI + 90;
      auto.setAttribute('transform', 'translate(' + punt.x + ',' + punt.y + ') rotate(' + hoek + ') scale(' + autoSchaal + ')');
      if (huidig !== doelVoortgang) requestAnimationFrame(stap);
      else rafBezig = false;
    }

    var herbouwTimer;
    window.addEventListener('resize', function () {
      clearTimeout(herbouwTimer);
      herbouwTimer = setTimeout(bouwRoute, 180);
    });
    window.addEventListener('scroll', function () { teken(false); }, { passive: true });
    window.addEventListener('load', function () { setTimeout(bouwRoute, 60); });
    if (document.readyState === 'complete') setTimeout(bouwRoute, 60);
  }

  /* ---------- 4. tilt op het woordbord ---------- */
  var bordje = document.querySelector('.woordbord');
  if (bordje && !verminderd) {
    var fijn = window.matchMedia('(pointer: fine)').matches;
    if (fijn) {
      window.addEventListener('mousemove', function (e) {
        var r = bordje.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        var dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        bordje.style.transform =
          'perspective(700px) rotateY(' + (dx * 14) + 'deg) rotateX(' + (dy * -12) + 'deg) rotate(-2deg)';
      });
    } else {
      bordje.style.animation = 'bord-wiebel 5s ease-in-out infinite';
      var stijl = document.createElement('style');
      stijl.textContent = '@keyframes bord-wiebel{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(1.5deg) translateY(-3px)}}';
      document.head.appendChild(stijl);
    }
  }

  /* ---------- 5. proefles-formulier ---------- */
  var form = document.getElementById('proefles-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return (form.querySelector('#' + id) || {}).value || ''; };
      var regels = [
        'Hoi Frank! Ik wil graag een proefles.',
        'Naam: ' + v('f-naam'),
        'Telefoon: ' + v('f-tel')
      ];
      if (v('f-plaats')) regels.push('Woonplaats: ' + v('f-plaats'));
      if (v('f-bericht')) regels.push('Over mij: ' + v('f-bericht'));
      var url = 'https://wa.me/31639482555?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------- 6. claxon ---------- */
  document.querySelectorAll('[data-toet]').forEach(function (el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      var bubbel = document.createElement('div');
      bubbel.className = 'toet';
      bubbel.textContent = 'tuut tuut!';
      var r = el.getBoundingClientRect();
      bubbel.style.left = (e.clientX - r.left - 20) + 'px';
      bubbel.style.top = (e.clientY - r.top - 46) + 'px';
      el.style.position = 'relative';
      el.appendChild(bubbel);
      requestAnimationFrame(function () { bubbel.classList.add('zichtbaar'); });
      setTimeout(function () { bubbel.remove(); }, 1400);
    });
  });

  /* ---------- jaartal in de voet ---------- */
  document.querySelectorAll('[data-jaar]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
