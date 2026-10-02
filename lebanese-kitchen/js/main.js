/* Lebanese Kitchen: pagina-gedrag. Header, menu en reveals zitten in motion.js,
   bestellen in order.js. Hier: de kop passend maken, actieve menutab. */
(function () {
  'use strict';

  /* Hero-kop: elke regel (.r) blijft op één regel; de lettergrootte schaalt
     zo dat de breedste regel precies in de kolom past (max 2 regels totaal). */
  var kop = document.querySelector('[data-pas]');
  function pas() {
    if (!kop) return;
    kop.style.fontSize = '';
    var max = parseFloat(getComputedStyle(kop).fontSize);
    var breed = kop.parentElement.clientWidth;
    if (window.innerWidth > 1180) breed = Math.min(breed, kop.parentElement.clientWidth - 330);
    var regels = kop.querySelectorAll('.r'), w = 0;
    regels.forEach(function (r) { w = Math.max(w, r.scrollWidth); });
    if (breed < 200 || !w) return;
    if (w > breed) kop.style.fontSize = Math.max(26, Math.floor(max * breed / w * 0.98)) + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pas);
  pas();
  window.addEventListener('resize', pas, { passive: true });

  /* Menutabs: actieve categorie oplichten, en een tab opent zijn categorie */
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
          if (aan && t.scrollIntoView && window.innerWidth < 960) t.parentElement.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.menu-cat').forEach(function (c) { io.observe(c); });
  }
})();
