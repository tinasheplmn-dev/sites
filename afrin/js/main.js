/* Rijschool Afrin · motion en interactie.
   Eén concept draagt alles: de middenstreep. Verder alleen rustige,
   dienende beweging: reveals, tellers, de filmstrip en de lichtbak. */

(function () {
  'use strict';

  var beweegOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Middenstreep: vulling en autootje op scrolltempo ---------- */
  var railVulling = document.querySelector('.wegrail-vulling');
  var railAuto = document.querySelector('.wegrail-auto');
  var ticking = false;

  function tekenRail() {
    ticking = false;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var p = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
    if (railVulling) railVulling.style.transform = 'scaleY(' + p + ')';
    if (railAuto) railAuto.style.top = (p * 100) + '%';
    document.documentElement.style.setProperty('--parallax', String(Math.min(1, window.scrollY / window.innerHeight)));
    var kop = document.querySelector('.kop-balk');
    if (kop) kop.classList.toggle('vast', window.scrollY > 24);
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(tekenRail); }
  }, { passive: true });
  tekenRail();

  /* ---------- Scroll-reveals ---------- */
  var onthullers = document.querySelectorAll('.onthul');
  if ('IntersectionObserver' in window && beweegOk) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          item.target.classList.add('zichtbaar');
          io.unobserve(item.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    onthullers.forEach(function (el) { io.observe(el); });
  } else {
    onthullers.forEach(function (el) { el.classList.add('zichtbaar'); });
  }

  /* ---------- Tellers (cijferstrip) ---------- */
  var tellers = document.querySelectorAll('[data-tel]');
  if (tellers.length && 'IntersectionObserver' in window) {
    var telIo = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (!item.isIntersecting) return;
        telIo.unobserve(item.target);
        var el = item.target;
        var doel = parseFloat(el.getAttribute('data-tel'));
        var decimalen = (el.getAttribute('data-tel').split(',')[1] || el.getAttribute('data-tel').split('.')[1] || '').length;
        var start = null;
        if (!beweegOk) { el.textContent = doel.toFixed(decimalen).replace('.', ','); return; }
        function stap(t) {
          if (!start) start = t;
          var v = Math.min(1, (t - start) / 1400);
          var eased = 1 - Math.pow(1 - v, 3);
          el.textContent = (doel * eased).toFixed(decimalen).replace('.', ',');
          if (v < 1) requestAnimationFrame(stap);
        }
        requestAnimationFrame(stap);
      });
    }, { threshold: 0.5 });
    tellers.forEach(function (el) {
      el.setAttribute('data-tel', el.textContent.trim());
      telIo.observe(el);
    });
  }

  /* ---------- Mobiel menu ---------- */
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

  /* ---------- Carrousels: pijltjes en stippen ---------- */
  document.querySelectorAll('.carrousel').forEach(function (car) {
    var spoor = car.querySelector('.carrousel-spoor');
    var stippenBak = car.querySelector('.carrousel-stippen');
    if (!spoor) return;
    var items = Array.prototype.slice.call(spoor.children);

    function stapGrootte() {
      if (!items.length) return spoor.clientWidth;
      var eerste = items[0].getBoundingClientRect();
      var tweede = items[1] ? items[1].getBoundingClientRect().left : eerste.right;
      return Math.max(1, tweede - eerste.left);
    }

    car.querySelectorAll('[data-car]').forEach(function (knop) {
      knop.addEventListener('click', function () {
        spoor.scrollBy({
          left: knop.getAttribute('data-car') === 'terug' ? -stapGrootte() : stapGrootte(),
          behavior: beweegOk ? 'smooth' : 'auto'
        });
      });
    });

    if (stippenBak && items.length > 1) {
      items.forEach(function (item, i) {
        var stip = document.createElement('button');
        stip.className = 'carrousel-stip' + (i === 0 ? ' actief' : '');
        stip.type = 'button';
        stip.setAttribute('aria-label', 'Ga naar item ' + (i + 1));
        stip.addEventListener('click', function () {
          spoor.scrollTo({ left: i * stapGrootte(), behavior: beweegOk ? 'smooth' : 'auto' });
        });
        stippenBak.appendChild(stip);
      });
      var stippen = Array.prototype.slice.call(stippenBak.children);
      var bezig = false;
      spoor.addEventListener('scroll', function () {
        if (bezig) return;
        bezig = true;
        requestAnimationFrame(function () {
          bezig = false;
          var actief = Math.round(spoor.scrollLeft / stapGrootte());
          stippen.forEach(function (s, i) { s.classList.toggle('actief', i === actief); });
        });
      }, { passive: true });
    }
  });

  /* ---------- Lichtbak (geslaagd-galerij) ---------- */
  var lichtbak = document.querySelector('.lichtbak');
  if (lichtbak) {
    var lichtbakImg = lichtbak.querySelector('img');
    document.querySelectorAll('.carrousel .foto-kaart').forEach(function (kaart) {
      kaart.addEventListener('click', function () {
        var img = kaart.querySelector('img');
        lichtbakImg.src = img.getAttribute('data-groot') || img.src;
        lichtbakImg.alt = img.alt;
        lichtbak.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    function sluitLichtbak() {
      lichtbak.classList.remove('open');
      document.body.style.overflow = '';
    }
    lichtbak.addEventListener('click', function (e) {
      if (e.target === lichtbak || e.target.classList.contains('lichtbak-sluit')) sluitLichtbak();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sluitLichtbak();
    });
  }

  /* ---------- Proefles-formulier: opent mail met kant-en-klaar bericht ---------- */
  var form = document.querySelector('.formulier');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = (form.querySelector('#naam') || {}).value || '';
      var tel = (form.querySelector('#telefoon') || {}).value || '';
      var bak = form.querySelector('input[name="bak"]:checked');
      var opm = (form.querySelector('#opmerking') || {}).value || '';
      if (!naam.trim() || !tel.trim()) {
        var status = form.querySelector('.form-status');
        if (status) status.textContent = 'Vul in elk geval je naam en telefoonnummer in, dan kan Hydar je terugbellen.';
        return;
      }
      var regels = [
        'Hoi Hydar,',
        '',
        'Ik wil graag een proefles inplannen.',
        '',
        'Naam: ' + naam,
        'Telefoon: ' + tel,
        'Voorkeur: ' + (bak ? bak.value : 'nog geen voorkeur'),
        opm ? 'Opmerking: ' + opm : ''
      ].filter(Boolean);
      window.location.href = 'mailto:rijschoolafin@gmail.com'
        + '?subject=' + encodeURIComponent('Proefles aanvragen · ' + naam)
        + '&body=' + encodeURIComponent(regels.join('\n'));
    });
  }
})();
