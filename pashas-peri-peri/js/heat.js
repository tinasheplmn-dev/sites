/* Pasha's: de hittemeter. Kies een hitte, zie het gerecht dat erbij past,
   en "Add" opent het keuzevenster met die hitte al aangevinkt.
   Zonder JavaScript staat "Hot" gewoon klaar met een werkende knop. */
(function () {
  'use strict';
  var root = document.querySelector('[data-heat]');
  if (!root) return;
  var NIVEAUS = [
    { naam: 'Mild', kort: 'mild', titel: 'All the flavour, gentle heat', zin: 'Peri peri without the burn. Good for kids and first-timers.', id: 'peri-peri-quarter-meal', dish: 'Peri Peri Quarter Meal', prijs: '£7.55', img: 'heat-mild' },
    { naam: 'Lemon & herb', kort: 'lemon & herb', titel: 'Zesty, fresh, a light kick', zin: 'Citrus and herbs first, a little warmth after.', id: 'peri-peri-half-chicken', dish: 'Peri Peri Half Chicken', prijs: '£8.10', img: 'heat-lemon' },
    { naam: 'Hot', kort: 'hot', titel: 'You feel it, you still taste it', zin: 'Proper heat with the chicken still front and centre. Good on wings.', id: 'peri-peri-wings-8-pieces', dish: 'Peri Peri Wings, 8 pieces', prijs: '£7.02', img: 'heat-hot' },
    { naam: 'Extra hot', kort: 'extra hot', titel: 'For the chilli people', zin: 'The top of the scale. Order a can with it.', id: 'peri-peri-strips-meal-6-pieces', dish: 'Peri Peri Strips Meal', prijs: '£8.63', img: 'heat-extra' }
  ];
  var knoppen = [].slice.call(root.querySelectorAll('.heat-knop'));
  var $ = function (s) { return root.querySelector(s); };
  var huidig = 2;
  function kies(n) {
    huidig = n; var v = NIVEAUS[n];
    knoppen.forEach(function (k, i) { k.setAttribute('aria-selected', i === n ? 'true' : 'false'); k.tabIndex = i === n ? 0 : -1; });
    root.style.setProperty('--niveau', n);
    root.dataset.niveau = n;
    $('[data-heat-label]').textContent = v.naam;
    $('[data-heat-titel]').textContent = v.titel;
    $('[data-heat-zin]').textContent = v.zin;
    $('[data-heat-dish]').textContent = v.dish;
    $('[data-heat-prijs]').textContent = v.prijs;
    $('[data-heat-kort]').textContent = v.kort;
    $('[data-heat-add]').setAttribute('data-add', v.id);
    var img = $('[data-heat-img]'); img.src = 'assets/img/' + v.img + '.webp';
  }
  knoppen.forEach(function (k, i) {
    k.addEventListener('click', function () { kies(i); });
    k.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var n = (huidig + (e.key === 'ArrowRight' ? 1 : 3)) % 4; kies(n); knoppen[n].focus(); e.preventDefault();
    });
  });
  /* na "Add" de gekozen hitte voorselecteren in het keuzevenster van order.js */
  $('[data-heat-add]').addEventListener('click', function () {
    var naam = NIVEAUS[huidig].naam;
    setTimeout(function () {
      document.querySelectorAll('.od-sheet .od-chip span').forEach(function (s) {
        if (s.textContent.trim().indexOf(naam) === 0) {
          var inp = s.previousElementSibling; inp.checked = true;
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }, 30);
  });
  kies(2);
})();
