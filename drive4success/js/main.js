/* Drive4Success · interactie en motion
   Concept: de succeslijn tekent zich terwijl je scrolt, van proefles tot geslaagd. */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  /* ---------- reveals ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal], .stagger').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- tellers ---------- */
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countObserver.unobserve(e.target);
      var el = e.target;
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = (el.getAttribute('data-count').split(',')[1] || '').length;
      if (el.getAttribute('data-count').indexOf(',') > -1) {
        target = parseFloat(el.getAttribute('data-count').replace(',', '.'));
      }
      var suffix = el.getAttribute('data-suffix') || '';
      if (prefersReduced) {
        el.textContent = formatNum(target, decimals) + suffix;
        return;
      }
      var start = null;
      var dur = 1600;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatNum(target * eased, decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  function formatNum(n, decimals) {
    return decimals > 0 ? n.toFixed(decimals).replace('.', ',') : Math.round(n).toString();
  }
  document.querySelectorAll('[data-count]').forEach(function (el) {
    countObserver.observe(el);
  });

  /* ---------- succeslijn: paden tekenen op scroll ---------- */
  var routePaths = [];
  document.querySelectorAll('.route-svg .route-draw').forEach(function (path) {
    var len = path.getTotalLength();
    path.style.strokeDasharray = len + ' ' + len;
    path.style.strokeDashoffset = len;
    routePaths.push({ path: path, len: len, svg: path.closest('.route-svg') });
  });
  function drawRoutes() {
    var vh = window.innerHeight;
    routePaths.forEach(function (r) {
      var rect = r.svg.getBoundingClientRect();
      /* voortgang: 0 als de svg onderin beeld komt, 1 als hij 80% voorbij is */
      var p = (vh * 0.85 - rect.top) / (rect.height + vh * 0.5);
      p = Math.max(0, Math.min(1, p));
      r.path.style.strokeDashoffset = r.len * (1 - p);
    });
  }
  if (routePaths.length) {
    if (prefersReduced) {
      routePaths.forEach(function (r) { r.path.style.strokeDashoffset = 0; });
    } else {
      window.addEventListener('scroll', function () { requestAnimationFrame(drawRoutes); }, { passive: true });
      window.addEventListener('resize', drawRoutes);
      drawRoutes();
    }
  }

  /* ---------- routestappen oplichten ---------- */
  var stepObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('lit');
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.route-step').forEach(function (s) { stepObserver.observe(s); });

  /* ---------- hero glow volgt de muis (alleen desktop, subtiel) ---------- */
  var glow = document.querySelector('.hero-glow');
  if (glow && !prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    var hero = glow.closest('.hero');
    var gx = 0, gy = 0, tx = 0, ty = 0, raf = null;
    hero.addEventListener('mousemove', function (ev) {
      var rect = hero.getBoundingClientRect();
      tx = ev.clientX - rect.left;
      ty = ev.clientY - rect.top;
      if (!raf) loop();
    });
    function loop() {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else { raf = null; }
    }
  }

  /* ---------- review-marquee: dupliceer voor naadloze loop ---------- */
  document.querySelectorAll('.review-track').forEach(function (track) {
    if (prefersReduced) return;
    track.innerHTML += track.innerHTML;
  });

  /* ---------- review-muur: meer laden ---------- */
  var wall = document.querySelector('.review-wall');
  var moreBtn = document.querySelector('[data-more-reviews]');
  if (wall && moreBtn) {
    var batch = 12;
    var cards = Array.prototype.slice.call(wall.querySelectorAll('.review-card'));
    var shown = batch;
    function apply() {
      cards.forEach(function (c, i) { c.classList.toggle('is-hidden', i >= shown); });
      if (shown >= cards.length) moreBtn.style.display = 'none';
      moreBtn.textContent = 'Laad meer reviews (' + Math.max(cards.length - shown, 0) + ' resterend)';
    }
    moreBtn.addEventListener('click', function () { shown += batch; apply(); });
    apply();
  }

  /* ---------- proefles-formulier: opent mail met ingevulde aanvraag ---------- */
  var form = document.getElementById('proefles-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var naam = data.get('naam') || '';
      var tel = data.get('telefoon') || '';
      var doel = data.get('doel') || 'Rijbewijs B';
      var plaats = data.get('plaats') || '';
      var bericht = data.get('bericht') || '';
      var body = 'Hoi Jasmin,%0D%0A%0D%0AIk wil graag een gratis proefles aanvragen.%0D%0A%0D%0A' +
        'Naam: ' + encodeURIComponent(naam) + '%0D%0A' +
        'Telefoon: ' + encodeURIComponent(tel) + '%0D%0A' +
        'Ik wil halen: ' + encodeURIComponent(doel) + '%0D%0A' +
        (plaats ? 'Woonplaats: ' + encodeURIComponent(plaats) + '%0D%0A' : '') +
        (bericht ? '%0D%0A' + encodeURIComponent(bericht) + '%0D%0A' : '') +
        '%0D%0AGroeten,%0D%0A' + encodeURIComponent(naam);
      window.location.href = 'mailto:info@drive4success.nl?subject=' +
        encodeURIComponent('Aanvraag gratis proefles: ' + naam) + '&body=' + body;
      var note = document.getElementById('form-feedback');
      if (note) {
        note.textContent = 'Je mailprogramma opent met je aanvraag. Liever direct contact? Bel of app 06 2428 0404.';
        note.style.display = 'block';
      }
    });
  }

  /* ---------- actieve navigatie ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here) a.classList.add('active');
  });
})();
