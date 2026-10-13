/* Site-eigen gedrag bovenop motion.js. Alles fail-open: zonder JavaScript
   staat het rooster, de tekst en de poster van elke video er gewoon. */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dagen = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

  /* ---------- volgende groepsles in de hero ---------- */
  var rooster = [];
  try { rooster = JSON.parse(document.body.getAttribute('data-rooster') || '[]'); } catch (e) { rooster = []; }
  function min(t) { var d = t.split(':'); return +d[0] * 60 + +d[1]; }
  var chip = document.querySelector('[data-volgende-les] .tekst');
  if (chip && rooster.length) {
    var nu = new Date(), dag = nu.getDay(), m = nu.getHours() * 60 + nu.getMinutes();
    var beste = null;
    for (var i = 0; i < 8 && !beste; i++) {
      var d = (dag + i) % 7;
      rooster.filter(function (r) { return r.d === d; }).forEach(function (r) {
        if (beste) return;
        if (i === 0 && m >= min(r.e)) return;
        beste = { r: r, i: i, bezig: i === 0 && m >= min(r.s) };
      });
    }
    if (beste) {
      var wanneer = beste.i === 0 ? 'vandaag' : beste.i === 1 ? 'morgen' : dagen[beste.r.d];
      chip.textContent = beste.bezig
        ? 'Nu bezig: ' + beste.r.les + ', tot ' + beste.r.e
        : 'Volgende les: ' + wanneer + ' ' + beste.r.s + ', ' + beste.r.les.toLowerCase();
    }
  }
  var vandaag = document.querySelector('.dag[data-dag="' + new Date().getDay() + '"]');
  if (vandaag) vandaag.classList.add('vandaag');

  /* ---------- hero-video: kleinere versie op smalle schermen ---------- */
  var hv = document.querySelector('.hero video');
  if (hv) {
    if (kalm) { hv.removeAttribute('autoplay'); hv.pause(); }
    else if (window.matchMedia('(max-width: 860px)').matches && hv.dataset.bronKlein) {
      hv.src = hv.dataset.bronKlein; hv.play().catch(function () {});
    }
  }

  /* ---------- collagevideo's spelen alleen in beeld ---------- */
  var vids = document.querySelectorAll('video[data-speel]');
  if (vids.length && 'IntersectionObserver' in window && !kalm) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: .2 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- manifest: woorden lichten op terwijl je scrolt ---------- */
  var q = document.querySelector('[data-woorden]');
  if (q && !kalm) {
    var woorden = [];
    [].slice.call(q.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { q.insertBefore(document.createTextNode(w), n); return; }
          var s = document.createElement('span'); s.textContent = w; q.insertBefore(s, n); woorden.push(s);
        });
        q.removeChild(n);
      } else if (n.nodeType === 1) {
        var tekst = n.textContent; n.textContent = '';
        tekst.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { n.appendChild(document.createTextNode(w)); return; }
          var s = document.createElement('span'); s.className = 'accent'; s.textContent = w; n.appendChild(s); woorden.push(s);
        });
        n.classList.remove('accent');
      }
    });
    var tik = false;
    var update = function () {
      tik = false;
      var r = q.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .55)));
      var n = Math.round(p * woorden.length);
      woorden.forEach(function (w, i) { w.classList.toggle('aan', i < n); });
    };
    window.addEventListener('scroll', function () { if (!tik) { tik = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  } else if (q) {
    q.querySelectorAll('span').forEach(function (s) { s.classList.add('aan'); });
  }

  /* ---------- reviewcarrousel ---------- */
  var car = document.querySelector('[data-carrousel]');
  if (car) {
    var stap = function (r) { var k = car.firstElementChild; car.scrollBy({ left: r * (k ? k.getBoundingClientRect().width + 16 : 300), behavior: 'smooth' }); };
    var v = document.querySelector('[data-vorige]'), n2 = document.querySelector('[data-volgende]');
    if (v) v.addEventListener('click', function () { stap(-1); });
    if (n2) n2.addEventListener('click', function () { stap(1); });
  }

  /* ---------- proefles-formulier: bericht klaarzetten in mail of WhatsApp ---------- */
  var f = document.querySelector('[data-intake]');
  if (f) {
    var maak = function () {
      var g = function (n) { var el = f.elements[n]; return el ? (el.value || '').trim() : ''; };
      var doel = f.querySelector('input[name="doel"]:checked');
      var vorm = f.querySelector('input[name="vorm"]:checked');
      return 'Hoi Winners Circle,%0A%0AIk wil graag beginnen.%0A' +
        'Naam: ' + encodeURIComponent(g('voornaam') + ' ' + g('achternaam')) + '%0A' +
        'E-mail: ' + encodeURIComponent(g('email')) + '%0A' +
        'Telefoon: ' + encodeURIComponent(g('telefoon')) + '%0A' +
        'Mijn doel: ' + encodeURIComponent(doel ? doel.value : '') + '%0A' +
        'Trainen met: ' + encodeURIComponent(vorm ? vorm.value : '');
    };
    var check = function () {
      var ok = true;
      ['voornaam', 'email'].forEach(function (n) {
        var el = f.elements[n], fout = f.querySelector('[data-fout="' + n + '"]');
        var goed = el.value.trim() && (n !== 'email' || /\S+@\S+\.\S+/.test(el.value));
        if (fout) fout.hidden = !!goed;
        el.setAttribute('aria-invalid', goed ? 'false' : 'true');
        if (!goed) ok = false;
      });
      return ok;
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check()) return;
      window.location.href = 'mailto:info@winnerscirclegym.nl?subject=' + encodeURIComponent('Aanmelding proefles') + '&body=' + maak();
      f.hidden = true;
      document.querySelector('[data-bedankt]').hidden = false;
    });
    var wa = f.querySelector('[data-wa]');
    if (wa) wa.addEventListener('click', function () {
      if (!check()) return;
      window.open('https://wa.me/31620390657?text=' + maak(), '_blank', 'noopener');
      f.hidden = true;
      document.querySelector('[data-bedankt]').hidden = false;
    });
  }
})();
