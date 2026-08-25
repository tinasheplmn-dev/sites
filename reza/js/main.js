/* Rijschool Reza · motion op ademtempo.
   Eén principe: alles komt langzaam, niets schrikt. */
(function () {
  'use strict';

  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* foto=1: statische weergave voor screenshots; anders krijgt <html> de js-klasse
     en doen de reveals mee. Zonder JavaScript blijft alles gewoon zichtbaar. */
  var foto = /[?&]foto=1/.test(location.search);
  if (!foto) document.documentElement.classList.add('js');

  /* ---------- Header-schaduw bij scroll ---------- */
  var balk = document.querySelector('.balk');
  function schaduw() {
    if (balk) balk.classList.toggle('zweeft', window.scrollY > 10);
  }
  window.addEventListener('scroll', schaduw, { passive: true });
  schaduw();

  /* ---------- Mobiel menu ---------- */
  var hap = document.querySelector('.hap');
  var links = document.querySelector('.balk-links');
  if (hap && links) {
    hap.addEventListener('click', function () {
      var open = hap.getAttribute('aria-expanded') === 'true';
      hap.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hap.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Hero: woorden ontwaken op ademritme ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var kop = hero.querySelector('h1');
    if (kop && !kalm && !foto) {
      var tekst = kop.innerHTML;
      // splits op woorden, behoud <em>-accenten
      kop.innerHTML = tekst
        .split(/(<em>.*?<\/em>[^\s<]*|\s+)/)
        .filter(function (d) { return d && d.trim(); })
        .map(function (w) { return '<span class="w"><span>' + w + '</span></span>'; })
        .join(' ');
      var ws = kop.querySelectorAll('.w > span');
      ws.forEach(function (s, i) { s.style.transitionDelay = (0.15 + i * 0.11) + 's'; });
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('wakker'); });
    });
    setTimeout(function () { hero.classList.add('wakker'); }, 400);
  }

  /* ---------- De weg die zichzelf tekent ---------- */
  var streep = document.querySelector('.hero-weg .streep');
  if (streep && !kalm) {
    var lengte = streep.getTotalLength();
    streep.style.strokeDasharray = lengte;
    streep.style.strokeDashoffset = lengte;
    streep.getBoundingClientRect();
    streep.style.transition = 'stroke-dashoffset 3.4s cubic-bezier(0.4, 0, 0.2, 1) 0.6s';
    streep.style.strokeDashoffset = '0';
    streep.addEventListener('transitionend', function () {
      // daarna weer wegmarkering worden
      streep.style.strokeDasharray = '14 18';
      streep.style.strokeDashoffset = '';
      streep.style.transition = '';
    });
  }

  /* ---------- Tellers (78 reviews, 5,0) ---------- */
  /* De HTML bevat de eindwaarde; de animatie telt er alleen naartoe.
     Draait de animatie niet, dan staat het juiste getal er dus gewoon. */
  function tel(el) {
    if (el.dataset.geteld) return;
    el.dataset.geteld = '1';
    var doel = parseFloat(el.dataset.tel.replace(',', '.'));
    var komma = el.dataset.tel.indexOf(',') !== -1;
    var start = null;
    var duur = 1800;
    function stapje(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / duur, 1);
      var z = 1 - Math.pow(1 - p, 3);
      var n = doel * z;
      el.textContent = komma ? n.toFixed(1).replace('.', ',') : Math.round(n);
      if (p < 1) requestAnimationFrame(stapje);
    }
    if (kalm) { el.textContent = el.dataset.tel; return; }
    requestAnimationFrame(stapje);
  }

  /* ---------- Reveals: fail-open ----------
     Zichtbaar worden mag nooit van één mechanisme afhangen. Drie lagen:
     1. directe controle bij laden (alles binnen beeld verschijnt meteen),
     2. scroll/resize-controle via getBoundingClientRect,
     3. IntersectionObserver als die beschikbaar is.
     Zonder JavaScript is er geen js-klasse en is alles sowieso zichtbaar. */
  var wachtend = [].slice.call(document.querySelectorAll('.komt'));
  function onthulNu(el) {
    el.classList.add('zichtbaar');
    [].slice.call(el.querySelectorAll('[data-tel]')).forEach(tel);
    if (el.hasAttribute && el.hasAttribute('data-tel')) tel(el);
  }
  function controleer() {
    if (!wachtend.length) return;
    var grens = window.innerHeight * 0.95;
    wachtend = wachtend.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < grens) { onthulNu(el); return false; }
      return true;
    });
  }
  var tik = false;
  function vraagControle() {
    if (tik) return;
    tik = true;
    requestAnimationFrame(function () { tik = false; controleer(); });
  }
  window.addEventListener('scroll', vraagControle, { passive: true });
  window.addEventListener('resize', vraagControle, { passive: true });
  window.addEventListener('load', vraagControle);
  window.addEventListener('pageshow', vraagControle);
  if ('IntersectionObserver' in window) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) {
          var i = wachtend.indexOf(it.target);
          if (i !== -1) wachtend.splice(i, 1);
          onthulNu(it.target);
          kijker.unobserve(it.target);
        }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
    wachtend.forEach(function (el) { kijker.observe(el); });
  }
  controleer();

  /* ---------- Proefles-formulier: opent WhatsApp met nette tekst ---------- */
  var form = document.getElementById('proefles-formulier');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var naam = (d.get('naam') || '').toString().trim();
      var tel = (d.get('telefoon') || '').toString().trim();
      var bak = (d.get('bak') || 'Weet ik nog niet').toString();
      var extra = (d.get('extra') || '').toString().trim();
      var regels = [
        'Hoi Reza, ik wil graag een proefles plannen.',
        'Naam: ' + naam,
        'Telefoon: ' + tel,
        'Schakel of automaat: ' + bak
      ];
      if (extra) regels.push('Goed om te weten: ' + extra);
      var url = 'https://wa.me/31648739807?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
      var dank = document.getElementById('formulier-dank');
      if (dank) { dank.hidden = false; }
    });
  }
})();
