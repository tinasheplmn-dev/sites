/* ============================================================
   MOTION & GEDRAG · "de tekening tekent zichzelf"
   Eén concept: al het lijnwerk tekent zichzelf zodra het in
   beeld komt. Getallen tellen op, stempels stempelen.
   ============================================================ */
(function () {
  'use strict';

  /* ?statisch in de URL zet alle beweging uit (handig voor tests en previews) */
  var statisch = /statisch/.test(window.location.search + window.location.hash);
  if (statisch) document.documentElement.classList.add('statisch');
  var beweegOk = !statisch && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header ---------- */
  var kop = document.querySelector('.site-kop');
  function kopStand() {
    if (window.scrollY > 24) kop.classList.add('vast');
    else kop.classList.remove('vast');
  }
  window.addEventListener('scroll', kopStand, { passive: true });
  kopStand();

  /* ---------- mobiel menu ---------- */
  var menuKnop = document.querySelector('.menu-knop');
  var mobielMenu = document.querySelector('.mobiel-menu');
  if (menuKnop && mobielMenu) {
    menuKnop.addEventListener('click', function () {
      var open = mobielMenu.classList.toggle('open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobielMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobielMenu.classList.remove('open');
        menuKnop.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- mobiele belbalk ---------- */
  var actieBalk = document.querySelector('.mobiel-actie');
  if (actieBalk) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) actieBalk.classList.add('zichtbaar');
      else actieBalk.classList.remove('zichtbaar');
    }, { passive: true });
  }

  /* ---------- zelf-tekenend lijnwerk ---------- */
  function bereidTekeningVoor(svg) {
    var vormen = svg.querySelectorAll('path, circle, line, rect, ellipse, polyline');
    vormen.forEach(function (el) {
      if (el.classList.contains('vlak') || el.classList.contains('vlak-donker')) return;
      var lengte = 0;
      try { lengte = el.getTotalLength(); } catch (e) { return; }
      if (!lengte) return;
      el.dataset.lengte = lengte;
      el.style.strokeDasharray = lengte + ' ' + lengte;
      el.style.strokeDashoffset = lengte;
    });
    svg.querySelectorAll('text, .vlak, .vlak-donker').forEach(function (t) {
      t.style.opacity = '0';
      t.style.transition = 'opacity .6s ease';
    });
  }

  function tekenUit(svg) {
    var vormen = svg.querySelectorAll('path, circle, line, rect, ellipse, polyline');
    var i = 0;
    vormen.forEach(function (el) {
      if (!el.dataset.lengte) return;
      var duur = Math.min(1.6, 0.35 + el.dataset.lengte / 900);
      el.style.transition = 'stroke-dashoffset ' + duur + 's cubic-bezier(.45,.05,.35,1) ' + (i * 0.09) + 's';
      el.style.strokeDashoffset = '0';
      i++;
    });
    var wacht = Math.min(1400, 350 + i * 90);
    setTimeout(function () {
      svg.querySelectorAll('text, .vlak, .vlak-donker').forEach(function (t, j) {
        t.style.transitionDelay = (j * 0.07) + 's';
        t.style.opacity = '';
        t.style.removeProperty('opacity');
        t.style.opacity = '1';
      });
    }, wacht);
  }

  var tekeningen = [];
  if (beweegOk) {
    document.querySelectorAll('svg.tekenlijn').forEach(function (svg) {
      bereidTekeningVoor(svg);
      tekeningen.push(svg);
    });
  }

  /* ---------- tellers ---------- */
  function telOp(el) {
    var doel = parseFloat(el.dataset.tel.replace(',', '.'));
    var decimalen = (el.dataset.tel.indexOf(',') > -1 || el.dataset.tel.indexOf('.') > -1) ? 1 : 0;
    var duur = 1600;
    var start = null;
    function stap(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / duur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var waarde = doel * eased;
      el.textContent = decimalen
        ? waarde.toFixed(1).replace('.', ',')
        : Math.round(waarde).toLocaleString('nl-NL');
      if (p < 1) requestAnimationFrame(stap);
    }
    requestAnimationFrame(stap);
  }

  /* ---------- waarnemer: reveals, tekeningen, tellers, stempels ---------- */
  var waarnemer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('in-beeld');
      if (el.matches('svg.tekenlijn') && beweegOk) tekenUit(el);
      if (el.dataset && el.dataset.tel && !el.dataset.geteld) {
        el.dataset.geteld = '1';
        if (beweegOk) telOp(el); else el.textContent = el.dataset.tel;
      }
      el.querySelectorAll && el.querySelectorAll('.stempel').forEach(function (s) {
        s.classList.add('stempel--gestempeld');
      });
      if (el.classList.contains('stempel')) el.classList.add('stempel--gestempeld');
      waarnemer.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-groep, section, svg.tekenlijn, [data-tel]').forEach(function (el) {
    waarnemer.observe(el);
  });

  /* ---------- maatlat (tijdlijn) vulling ---------- */
  var maatlat = document.querySelector('.maatlat');
  if (maatlat) {
    var vulling = maatlat.querySelector('.vulling');
    function vulMaatlat() {
      var r = maatlat.getBoundingClientRect();
      var vh = window.innerHeight;
      var voortgang = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      vulling.style.height = (voortgang * 100) + '%';
    }
    window.addEventListener('scroll', vulMaatlat, { passive: true });
    vulMaatlat();
  }

  /* ---------- hero: raster-parallax en muis-diepte ---------- */
  var heroRaster = document.querySelector('.hero-raster');
  var heroTekening = document.querySelector('.hero-tekening');
  if (beweegOk && heroRaster) {
    var rasterTikt = false;
    window.addEventListener('scroll', function () {
      if (rasterTikt) return;
      rasterTikt = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) {
          heroRaster.style.transform = 'translateY(' + y * 0.18 + 'px)';
        }
        rasterTikt = false;
      });
    }, { passive: true });
  }
  if (beweegOk && heroTekening && window.matchMedia('(pointer: fine)').matches) {
    heroTekening.style.transition = 'transform 1.1s cubic-bezier(.22,.8,.28,1)';
    document.querySelector('.hero').addEventListener('mousemove', function (e) {
      var r = heroTekening.getBoundingClientRect();
      var dx = ((e.clientX - r.left) / r.width - 0.5) * 10;
      var dy = ((e.clientY - r.top) / r.height - 0.5) * 6;
      heroTekening.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    document.querySelector('.hero').addEventListener('mouseleave', function () {
      heroTekening.style.transform = 'translate(0,0)';
    });
  }

  /* ---------- reviews renderen ---------- */
  function reviewKaart(r) {
    var art = document.createElement('article');
    art.className = 'review-kaart kader';
    var typeTekst = r.type === 'be' ? 'Aanhanger BE' : (r.type === 'auto' ? 'Autorijbewijs B' : 'Google review');
    art.innerHTML =
      '<span class="hoek"></span>' +
      '<div class="sterren" aria-label="5 van 5 sterren">★★★★★</div>' +
      '<p>' + r.tekst + '</p>' +
      '<div class="review-meta">' +
      '<div><div class="naam">' + r.naam + '</div><div class="type-label">' + typeTekst + '</div></div>' +
      (r.geslaagd ? '<span class="stempel">In 1x geslaagd</span>' : '') +
      '</div>';
    return art;
  }

  function vulReviews(selector, filter, max) {
    var houder = document.querySelector(selector);
    if (!houder || typeof REVIEWS === 'undefined') return;
    var lijst = REVIEWS.filter(filter || function () { return true; });
    if (max) lijst = lijst.slice(0, max);
    lijst.forEach(function (r) {
      var kaart = reviewKaart(r);
      houder.appendChild(kaart);
      waarnemer.observe(kaart);
    });
  }

  vulReviews('[data-reviews="uitgelicht"]', function (r) { return r.uitgelicht; }, 3);
  vulReviews('[data-reviews="be"]', function (r) { return r.type === 'be'; });
  vulReviews('[data-reviews="be-kort"]', function (r) { return r.type === 'be'; }, 3);
  vulReviews('[data-reviews="auto-kort"]', function (r) { return r.type === 'auto'; }, 3);
  vulReviews('[data-reviews="overig"]', function (r) { return r.type !== 'be'; });

  /* ---------- geslaagdenmuur ---------- */
  var muur = document.querySelector('[data-geslaagden]');
  if (muur && typeof GESLAAGDEN !== 'undefined') {
    if (GESLAAGDEN.length) {
      GESLAAGDEN.forEach(function (g) {
        var d = document.createElement('figure');
        d.className = 'geslaagde';
        if (g.foto) {
          d.innerHTML = '<img src="' + g.foto + '" alt="' + g.naam + ', geslaagd voor rijbewijs ' + (g.rijbewijs || 'B') + '">' +
            '<figcaption class="naam-label">' + g.naam + ' · ' + (g.rijbewijs || 'B') + '</figcaption>';
        } else {
          d.classList.add('leeg');
          d.innerHTML = '<span>★</span><span>' + g.naam + '</span><span>' + (g.rijbewijs || 'B') + ' · ' + (g.plaats || '') + '</span>';
        }
        muur.appendChild(d);
      });
    }
  }

  /* ---------- nieuws ---------- */
  var nieuwsHouder = document.querySelector('[data-nieuws]');
  if (nieuwsHouder && typeof NIEUWS !== 'undefined' && NIEUWS.length) {
    var leegBlok = document.querySelector('[data-nieuws-leeg]');
    if (leegBlok) leegBlok.remove();
    NIEUWS.forEach(function (n) {
      var art = document.createElement('article');
      art.className = 'kader reveal';
      var datum = new Date(n.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
      art.innerHTML = '<span class="hoek"></span><span class="annotatie annotatie--zacht">' + datum + '</span>' +
        '<h3 style="margin:.4rem 0">' + n.titel + '</h3><p style="color:var(--tekst-zacht)">' + n.tekst + '</p>';
      nieuwsHouder.appendChild(art);
      waarnemer.observe(art);
    });
  }

  /* ---------- proefles-formulier: opent WhatsApp met ingevuld bericht ---------- */
  var form = document.querySelector('#proefles-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var voertuig = d.get('voertuig') || 'auto';
      var regels = [
        'Hoi Marc, ik wil graag een proefles aanvragen.',
        'Naam: ' + (d.get('naam') || ''),
        'Telefoon: ' + (d.get('telefoon') || ''),
        'Ik wil lessen voor: ' + voertuig + (voertuig === 'auto' ? ' (' + (d.get('transmissie') || 'schakel') + ')' : ''),
        d.get('bericht') ? 'Extra info: ' + d.get('bericht') : ''
      ].filter(Boolean);
      var url = 'https://wa.me/31654256481?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
      var melding = document.querySelector('.form-melding');
      if (melding) melding.textContent = 'WhatsApp opent met je aanvraag. Liever mailen? Stuur je gegevens naar info@rijles4you.nl.';
    });
    var voertuigKnoppen = form.querySelectorAll('input[name="voertuig"]');
    var transmissieVeld = form.querySelector('[data-transmissie]');
    voertuigKnoppen.forEach(function (kn) {
      kn.addEventListener('change', function () {
        if (transmissieVeld) transmissieVeld.style.display = (kn.value === 'aanhanger (BE)' && kn.checked) ? 'none' : '';
      });
    });
  }

  /* ---------- jaartal in footer ---------- */
  document.querySelectorAll('[data-jaar]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
