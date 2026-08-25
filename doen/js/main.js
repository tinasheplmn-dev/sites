/* Verkeersschool DOEN · interactie
   Eén motion-concept: de aansporing. Woorden stempelen binnen,
   het stuur (de O van DOEN) draait mee met je scroll. */

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- het stuur draait mee met de scroll --- */
  var wielen = document.querySelectorAll('.wheel');
  if (wielen.length && !reduceMotion) {
    var laatste = -1;
    var tekenen = function () {
      var rot = (window.scrollY * 0.22) % 360;
      if (rot !== laatste) {
        for (var i = 0; i < wielen.length; i++) {
          wielen[i].style.setProperty('--rot', rot + 'deg');
        }
        laatste = rot;
      }
    };
    window.addEventListener('scroll', function () {
      window.requestAnimationFrame(tekenen);
    }, { passive: true });
    tekenen();
  }

  /* --- header krijgt schaduw zodra je scrolt --- */
  var kop = document.querySelector('.site-kop');
  if (kop) {
    var zetSchaduw = function () {
      kop.classList.toggle('zweeft', window.scrollY > 8);
    };
    window.addEventListener('scroll', zetSchaduw, { passive: true });
    zetSchaduw();
  }

  /* --- reveals: secties stempelen binnen --- */
  var teOnthullen = document.querySelectorAll('.reveal, .stamp');
  if ('IntersectionObserver' in window && teOnthullen.length) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          item.target.classList.add('zichtbaar');
          kijker.unobserve(item.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '10000px 0px -40px 0px' });
    teOnthullen.forEach(function (el) { kijker.observe(el); });
  } else {
    teOnthullen.forEach(function (el) { el.classList.add('zichtbaar'); });
  }

  /* --- mobiel menu --- */
  var menuKnop = document.querySelector('.nav-knop');
  var menu = document.querySelector('.mobiel-menu');
  var menuSluit = document.querySelector('.menu-sluit');
  if (menuKnop && menu) {
    var zetMenu = function (open) {
      menu.classList.toggle('open', open);
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuKnop.addEventListener('click', function () { zetMenu(true); });
    if (menuSluit) menuSluit.addEventListener('click', function () { zetMenu(false); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { zetMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') zetMenu(false);
    });
  }

  /* --- proefles-formulier: opent WhatsApp met een kant-en-klaar bericht --- */
  var formulier = document.getElementById('proefles-formulier');
  if (formulier) {
    formulier.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = (formulier.querySelector('#veld-naam') || {}).value || '';
      var telefoon = (formulier.querySelector('#veld-telefoon') || {}).value || '';
      var wens = formulier.querySelector('input[name="wens"]:checked');
      var bericht = (formulier.querySelector('#veld-bericht') || {}).value || '';

      var regels = [
        'Hoi Verkeersschool DOEN! Ik wil een proefles plannen.',
        'Naam: ' + naam.trim(),
        'Telefoon: ' + telefoon.trim(),
        'Ik wil: ' + (wens ? wens.value : 'nog niet gekozen')
      ];
      if (bericht.trim()) regels.push('Extra: ' + bericht.trim());

      var url = 'https://wa.me/31132032456?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');

      var melding = document.getElementById('formulier-status');
      if (melding) {
        melding.textContent = 'WhatsApp opent met je bericht. Verstuur hem daar en je hoort snel van ons.';
      }
    });
  }
})();
