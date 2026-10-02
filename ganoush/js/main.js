/* Ganoush: pagina-gedrag. Header, menu en reveals zitten in motion.js,
   bestellen in order.js. Hier: kop passend maken, sintels in de hero,
   actieve menutab en het feestaanvraagformulier. */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero-kop: desktop één regel, mobiel twee (.r). Schaal zodat de breedste
     regel in de kolom past, nooit kleiner dan 26 px. */
  var kop = document.querySelector('[data-pas]');
  function pas() {
    if (!kop) return;
    kop.style.fontSize = '';
    var max = parseFloat(getComputedStyle(kop).fontSize);
    var breed = kop.parentElement.clientWidth;
    if (breed < 200) return;
    var mobiel = window.innerWidth <= 700, w = 0;
    if (mobiel) kop.querySelectorAll('.r').forEach(function (r) { w = Math.max(w, r.scrollWidth); });
    else w = kop.scrollWidth;
    if (w > breed) kop.style.fontSize = Math.max(26, Math.floor(max * breed / w * 0.98)) + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pas);
  pas();
  window.addEventListener('resize', pas, { passive: true });

  /* Sintels: een handvol gloeiende deeltjes die uit de grill opstijgen.
     Alleen als de hero in beeld is, uit bij reduced motion. */
  var doek = document.querySelector('[data-sintels]');
  if (doek && doek.getContext && !kalm) {
    var ctx = doek.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, deeltjes = [], zichtbaar = true, raf = null;
    var maat = function () { var r = doek.getBoundingClientRect(); W = r.width; H = r.height; doek.width = W * dpr; doek.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    var nieuw = function (start) {
      return { x: W * (0.35 + Math.random() * 0.65), y: start ? Math.random() * H : H + 10, r: 0.6 + Math.random() * 1.9, vy: 0.25 + Math.random() * 0.8, vx: (Math.random() - 0.5) * 0.25, fase: Math.random() * 6.28, leven: 0.5 + Math.random() * 0.5 };
    };
    maat();
    var aantal = W < 700 ? 26 : 54;
    for (var i = 0; i < aantal; i++) deeltjes.push(nieuw(true));
    var stap = function () {
      raf = null;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      deeltjes.forEach(function (d, k) {
        d.y -= d.vy; d.fase += 0.03; d.x += d.vx + Math.sin(d.fase) * 0.35;
        var hoogte = 1 - d.y / H;
        var a = Math.max(0, d.leven * (1 - hoogte * 0.9));
        if (d.y < -10 || a <= 0.02) { deeltjes[k] = nieuw(false); return; }
        var g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
        g.addColorStop(0, 'rgba(255, 214, 140,' + a + ')');
        g.addColorStop(0.35, 'rgba(240, 140, 50,' + a * 0.7 + ')');
        g.addColorStop(1, 'rgba(224, 90, 30, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 4, 0, 6.283); ctx.fill();
      });
      if (zichtbaar) raf = requestAnimationFrame(stap);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        zichtbaar = e[0].isIntersecting;
        if (zichtbaar && !raf) raf = requestAnimationFrame(stap);
      }).observe(doek);
    }
    window.addEventListener('resize', maat, { passive: true });
    raf = requestAnimationFrame(stap);
  }

  /* Menutabs: actieve categorie oplichten, een tab opent zijn categorie */
  var tabs = [].slice.call(document.querySelectorAll('.menu-tab'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var d = document.querySelector(t.getAttribute('href'));
      if (d && d.tagName === 'DETAILS') d.open = true;
    });
  });
  if ('IntersectionObserver' in window && tabs.length) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (!it.isIntersecting) return;
        tabs.forEach(function (t) {
          var aan = t.getAttribute('href') === '#' + it.target.id;
          t.classList.toggle('actief', aan);
          if (aan && window.innerWidth < 960) t.parentElement.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.menu-cat').forEach(function (c) { io.observe(c); });
  }

  /* Feestaanvraag -> /api/aanvraag (server.js of demo-api.js) */
  var form = document.querySelector('[data-feest]');
  if (form) {
    var fout = document.querySelector('[data-feest-fout]');
    var vandaag = new Date(); vandaag.setMinutes(vandaag.getMinutes() - vandaag.getTimezoneOffset());
    form.datum.min = vandaag.toISOString().slice(0, 10);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, mis = '';
      if (!f.naam.value.trim()) mis = 'Add your name so we know who to call.';
      else if (!/^[+0-9 ()-]{10,}$/.test(f.telefoon.value.trim())) mis = 'Add a UK phone number we can reach you on.';
      else if (!f.datum.value) mis = 'Pick the date of your party.';
      else if (!(+f.personen.value >= 5)) mis = 'How many guests? Party orders start from 5 people.';
      if (mis) { fout.textContent = mis; fout.hidden = false; return; }
      fout.hidden = true;
      var knop = form.querySelector('button[type="submit"]');
      knop.disabled = true; knop.textContent = 'Sending...';
      fetch('/api/aanvraag', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: f.naam.value.trim(), telefoon: f.telefoon.value.trim(), datum: f.datum.value, personen: f.personen.value,
          bericht: 'Party enquiry for ' + f.personen.value + ' guests on ' + f.datum.value + (f.bericht.value.trim() ? '. ' + f.bericht.value.trim() : '') })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j.ok) throw new Error(j.fout || 'error');
        document.querySelector('[data-feest-nr]').textContent = 'Enquiry ' + (j.id || j.nummer || '');
        form.hidden = true;
        document.querySelector('[data-feest-klaar]').hidden = false;
      }).catch(function () {
        fout.textContent = 'That did not go through. Try again, or call us on 020 3638 1055.';
        fout.hidden = false; knop.disabled = false; knop.textContent = 'Send my party enquiry';
      });
    });
  }
})();
