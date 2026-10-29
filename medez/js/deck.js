/* De stapel podiumkaartjes in de hero. Zonder JavaScript liggen de eerste
   drie kaartjes gewoon op elkaar. Met JavaScript schuift elke 4,5 seconde
   het bovenste kaartje weg naar achteren; met de pijlen blader je zelf.
   Pauzeert bij hover en focus, en staat stil bij minder beweging. */
(function () {
  'use strict';
  var deck = document.querySelector('[data-deck]');
  if (!deck) return;
  var kaarten = [].slice.call(deck.querySelectorAll('[data-kaart]'));
  var teller = document.querySelector('[data-deck-teller]');
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var volgorde = kaarten.map(function (_, i) { return i; });
  var standen = [
    { x: '0px', y: '0px', r: '-3deg', s: 1, o: 1 },
    { x: '26px', y: '8px', r: '5deg', s: 1, o: 1 },
    { x: '-24px', y: '16px', r: '-9deg', s: 1, o: 1 },
  ];

  function zet() {
    volgorde.forEach(function (kaartIndex, plek) {
      var k = kaarten[kaartIndex];
      var st = standen[plek] || { x: '0px', y: '24px', r: '2deg', s: .94, o: 0 };
      k.style.setProperty('--x', st.x);
      k.style.setProperty('--y', st.y);
      k.style.setProperty('--r', st.r);
      k.style.setProperty('--s', st.s);
      k.style.opacity = st.o;
      k.style.visibility = st.o ? 'visible' : 'hidden';
      k.style.zIndex = String(kaarten.length - plek);
      k.setAttribute('aria-hidden', plek === 0 ? 'false' : 'true');
      var img = k.querySelector('img');
      if (plek < 3 && img && img.loading === 'lazy') img.loading = 'eager';
    });
    if (teller) teller.textContent = (volgorde[0] + 1) + ' / ' + kaarten.length;
  }

  function volgende() {
    var boven = kaarten[volgorde[0]];
    if (!kalm) {
      boven.style.transition = 'transform .5s cubic-bezier(.65,0,.35,1), opacity .4s ease';
      boven.style.setProperty('--x', '-120%');
      boven.style.setProperty('--r', '-18deg');
      boven.style.opacity = '0';
      setTimeout(function () {
        boven.style.transition = '';
        volgorde.push(volgorde.shift());
        zet();
      }, 420);
    } else {
      volgorde.push(volgorde.shift());
      zet();
    }
  }
  function vorige() {
    volgorde.unshift(volgorde.pop());
    zet();
  }

  zet();
  var vk = document.querySelector('[data-deck-volgende]');
  var vg = document.querySelector('[data-deck-vorige]');
  if (vk) vk.addEventListener('click', function () { volgende(); herstart(); });
  if (vg) vg.addEventListener('click', function () { vorige(); herstart(); });

  /* klik op het bovenste kaartje bladert ook door */
  deck.addEventListener('click', function () { volgende(); herstart(); });

  var klok = null, pauze = false;
  function herstart() {
    clearInterval(klok);
    if (kalm) return;
    klok = setInterval(function () { if (!pauze && !document.hidden) volgende(); }, 4500);
  }
  deck.parentElement.addEventListener('pointerenter', function () { pauze = true; });
  deck.parentElement.addEventListener('pointerleave', function () { pauze = false; });
  deck.parentElement.addEventListener('focusin', function () { pauze = true; });
  deck.parentElement.addEventListener('focusout', function () { pauze = false; });

  /* alleen draaien als de hero in beeld is */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { pauze = !e[0].isIntersecting; }).observe(deck);
  }

  /* lichte kanteling met de muis */
  if (!kalm && window.matchMedia('(pointer: fine)').matches) {
    deck.addEventListener('pointermove', function (e) {
      var r = deck.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      deck.style.transform = 'perspective(1100px) rotateY(' + (dx * 7).toFixed(2) + 'deg) rotateX(' + (-dy * 6).toFixed(2) + 'deg)';
    });
    deck.addEventListener('pointerleave', function () { deck.style.transform = ''; });
    deck.style.transition = 'transform .4s cubic-bezier(.22,1,.36,1)';
  }
  herstart();
})();
