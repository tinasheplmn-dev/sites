/* UWillGO Autorijschool - interactie
   - header die meekleurt bij scroll
   - mobiel menu
   - reveals + routelijn die zich tekent
   - review-rol met pijlen
   - proefles-formulier naar WhatsApp
   - vaste actiebalk op mobiel */

(function () {
  'use strict';

  /* Previewhulp: ?kijk=1200 toont de pagina verschoven naar die positie
     (alleen voor screenshots tijdens het bouwen; heeft geen effect zonder parameter) */
  if (/[?&]menu=1/.test(location.search)) document.body.classList.add('menu-open');
  var kijk = location.search.match(/[?&]kijk=(\d+)/);
  if (kijk) {
    document.body.style.transform = 'translateY(-' + parseInt(kijk[1], 10) + 'px)';
    document.querySelectorAll('.reveal, .route-segment, .stap, .sectie-kop, .marker').forEach(function (el) {
      el.classList.add('in-beeld');
      el.style.transition = 'none';
    });
    var vul = document.querySelector('.tijdlijn-vulling');
    if (vul) { vul.style.transition = 'none'; vul.style.transform = 'scaleY(1)'; }
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      img.loading = 'eager';
    });
  }

  var kop = document.querySelector('.kop-balk');
  var menuKnop = document.querySelector('.menu-knop');
  var actieBalk = document.querySelector('.actie-balk');

  /* Header + actiebalk op scroll */
  function bijScroll() {
    var y = window.scrollY || 0;
    if (kop) kop.classList.toggle('vast', y > 24);
    if (actieBalk) actieBalk.classList.toggle('zichtbaar', y > 420);
  }
  window.addEventListener('scroll', bijScroll, { passive: true });
  bijScroll();

  /* Mobiel menu */
  if (menuKnop) {
    menuKnop.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.menu-doek a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        menuKnop.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Reveals en route-segmenten: IntersectionObserver met rect-fallback,
     zodat reveals ook werken als de observer (nog) niet vuurt */
  var teOnthullen = Array.prototype.slice.call(
    document.querySelectorAll('.reveal, .route-segment, .stap, .sectie-kop')
  );

  function onthul(el) {
    el.classList.add('in-beeld');
    var i = teOnthullen.indexOf(el);
    if (i !== -1) teOnthullen.splice(i, 1);
    if (kijker) kijker.unobserve(el);
  }

  var kijker = 'IntersectionObserver' in window ? new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (item.isIntersecting) onthul(item.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }) : null;

  teOnthullen.slice().forEach(function (el) { if (kijker) kijker.observe(el); });

  function checkZichtbaar() {
    var zicht = window.innerHeight;
    teOnthullen.slice().forEach(function (el) {
      var vak = el.getBoundingClientRect();
      if (vak.top < zicht - 30 && vak.bottom > 0) onthul(el);
    });
  }
  window.addEventListener('scroll', checkZichtbaar, { passive: true });
  window.addEventListener('resize', checkZichtbaar, { passive: true });
  checkZichtbaar();

  /* Tijdlijn-vulling tekent mee met scroll (stappenplan) */
  var vulling = document.querySelector('.tijdlijn-vulling');
  if (vulling) {
    var tijdlijn = vulling.parentElement;
    var tekenen = function () {
      var vak = tijdlijn.getBoundingClientRect();
      var zicht = window.innerHeight;
      var voortgang = (zicht * 0.72 - vak.top) / vak.height;
      voortgang = Math.max(0, Math.min(1, voortgang));
      vulling.style.transform = 'scaleY(' + voortgang + ')';
    };
    window.addEventListener('scroll', tekenen, { passive: true });
    tekenen();
  }

  /* Hero-parallax op de muis (alleen desktop, alleen zonder reduced motion) */
  var scene = document.querySelector('.weg-scene');
  var gloed = document.querySelector('.horizon-gloed');
  var magBewegen = window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (scene && magBewegen) {
    var held = document.querySelector('.held');
    held.addEventListener('mousemove', function (e) {
      var dx = (e.clientX / window.innerWidth - 0.5);
      var dy = (e.clientY / window.innerHeight - 0.5);
      scene.style.transform = 'translate(' + (dx * -14) + 'px,' + (dy * -8) + 'px)';
      if (gloed) gloed.style.transform = 'translate(-50%, -50%) translate(' + (dx * -34) + 'px,' + (dy * -16) + 'px)';
    });
  }

  /* Review-rol: pijlen schuiven één kaart op */
  document.querySelectorAll('.rol-wikkel').forEach(function (wikkel) {
    var rol = wikkel.querySelector('.rol');
    var links = wikkel.querySelector('.rol-links');
    var rechts = wikkel.querySelector('.rol-rechts');
    if (!rol) return;
    function stapje(kant) {
      var kaart = rol.firstElementChild;
      var breed = kaart ? kaart.getBoundingClientRect().width + 18 : 400;
      rol.scrollBy({ left: kant * breed, behavior: 'smooth' });
    }
    if (links) links.addEventListener('click', function () { stapje(-1); });
    if (rechts) rechts.addEventListener('click', function () { stapje(1); });
  });

  /* Proefles-formulier: opent WhatsApp met ingevuld bericht */
  var formulier = document.getElementById('proefles-formulier');
  if (formulier) {
    formulier.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (naam) {
        var el = formulier.querySelector('[name="' + naam + '"]');
        return el ? el.value.trim() : '';
      };
      var regels = [
        'Hoi Ron! Ik wil graag een gratis proefles plannen.',
        '',
        'Naam: ' + v('naam'),
        'Telefoon: ' + v('telefoon')
      ];
      if (v('email')) regels.push('E-mail: ' + v('email'));
      if (v('leeftijd')) regels.push('Leeftijd: ' + v('leeftijd'));
      if (v('bericht')) regels.push('', v('bericht'));
      var url = 'https://wa.me/31611537031?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
      var melding = document.getElementById('formulier-melding');
      if (melding) {
        melding.textContent = 'WhatsApp opent met je aanvraag. Verstuur het bericht daar en Ron reageert binnen 48 uur.';
        melding.style.display = 'block';
      }
    });
  }
})();
