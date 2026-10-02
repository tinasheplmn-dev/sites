/* Hour House Bistro: pagina-gedrag. Header, de klok (signatuur), menutabs,
   contactformulier. Bestellen zit in order.js, reserveren in booking.js. */
(function () {
  'use strict';
  var html = document.documentElement;

  /* header: transparant op de hero, crème zodra je scrolt */
  var kop = document.querySelector('[data-kop]');
  function kopStand() { kop.classList.toggle('is-vast', window.scrollY > 40); }
  window.addEventListener('scroll', kopStand, { passive: true });
  kopStand();

  /* ---------- de klok ----------
     Wijzerplaat met 12 uur, de open uren van vandaag als gouden boog,
     wijzers op de echte tijd (Londen). De kop zegt wat er nu op tafel kan. */
  var UREN = (window.SHOP && window.SHOP.hours) || {};
  var plaat = document.querySelector('[data-wijzerplaat]');
  function londen() {
    try { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })); } catch (e) { return new Date(); }
  }
  function pt(uur, r) { var a = (uur % 12) / 12 * Math.PI * 2 - Math.PI / 2; return [200 + r * Math.cos(a), 200 + r * Math.sin(a)]; }
  if (plaat) {
    var nu0 = londen(), vandaag = UREN[nu0.getDay()];
    var cijfers = '', streepjes = '';
    for (var u = 1; u <= 12; u++) {
      var p = pt(u, 146);
      cijfers += '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '">' + u + '</text>';
    }
    for (var m = 0; m < 60; m++) {
      if (m % 5 === 0) continue;
      var a1 = pt(m / 5, 170), a2 = pt(m / 5, 162);
      streepjes += '<line x1="' + a1[0].toFixed(1) + '" y1="' + a1[1].toFixed(1) + '" x2="' + a2[0].toFixed(1) + '" y2="' + a2[1].toFixed(1) + '"/>';
    }
    plaat.querySelector('[data-wp-cijfers]').innerHTML = cijfers;
    plaat.querySelector('[data-wp-streepjes]').innerHTML = streepjes;
    /* gouden boog: de tijd die je nog hebt voor een roast (nu tot sluit), of
       bij gesloten het eerstvolgende open venster; maximaal 12 uur op de plaat */
    function boog() {
      var n = londen(), uur = n.getHours() + n.getMinutes() / 60, w = UREN[n.getDay()], van, tot;
      if (w && uur >= w[0] && uur < w[1]) { van = uur; tot = w[1]; }
      else { var vlg = (w && uur < w[0]) ? w : (UREN[(n.getDay() + 1) % 7] || [8, 20]); van = vlg[0]; tot = vlg[1]; }
      tot = Math.min(tot, van + 11.95);
      var r = 188, b = pt(van, r), e = pt(tot, r), groot = (tot - van) > 6 ? 1 : 0;
      plaat.querySelector('[data-wp-open]').setAttribute('d', 'M200 200 L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + groot + ' 1 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + ' Z');
    }
    var kopEl = document.querySelector('[data-klok-kop]'), nuEl = document.querySelector('[data-klok-nu]');
    function tik() {
      var n = londen(), h = n.getHours(), mi = n.getMinutes();
      plaat.querySelector('[data-wp-uur]').style.transform = 'rotate(' + ((h % 12) * 30 + mi * .5) + 'deg)';
      plaat.querySelector('[data-wp-min]').style.transform = 'rotate(' + (mi * 6) + 'deg)';
      var t = String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
      plaat.querySelector('[data-wp-tijd]').textContent = t;
      var w = UREN[n.getDay()], uur = h + mi / 60;
      if (w && uur >= w[0] && uur < w[1]) {
        kopEl.textContent = 'The roast is on.';
        nuEl.textContent = "It's " + t + ': brunch and the full roast are served right now, until ' + String(w[1]).padStart(2, '0') + ':00 tonight.';
      } else {
        var morgen = UREN[(n.getDay() + (uur >= (w ? w[1] : 0) ? 1 : 0)) % 7] || [8];
        kopEl.textContent = 'Back at ' + String(morgen[0]).padStart(2, '0') + ':00.';
        nuEl.textContent = "It's " + t + ' and we are closed. We open again with brunch and the full roast, and you can already order ahead.';
      }
    }
    tik(); boog();
    setInterval(function () { tik(); boog(); }, 20000);
    var vandaagLi = document.querySelector('[data-uren] [data-dag="' + nu0.getDay() + '"]');
    if (vandaagLi) vandaagLi.classList.add('vandaag');
  }

  /* ---------- menutabs: open de juiste categorie en markeer waar je bent ---------- */
  var tabs = [].slice.call(document.querySelectorAll('[data-tab]'));
  var cats = [].slice.call(document.querySelectorAll('.menu-cat'));
  function actief(id) {
    tabs.forEach(function (t) {
      var aan = t.dataset.tab === id;
      t.classList.toggle('actief', aan);
      if (aan && t.parentNode.scrollTo) t.parentNode.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      var doel = document.getElementById('cat-' + t.dataset.tab);
      if (!doel) return;
      doel.open = true;
      actief(t.dataset.tab);
      doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) actief(it.target.id.replace('cat-', '')); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    cats.forEach(function (c) { io.observe(c); });
  }
  if (tabs[0]) tabs[0].classList.add('actief');

  /* "Order online" opent het mandje als er iets in zit, anders eerst naar het menu */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open-cart]');
    if (!b) return;
    var teller = document.querySelector('[data-cart-count]');
    var leeg = !teller || teller.hidden;
    if (leeg) {
      e.stopImmediatePropagation(); e.preventDefault();
      var menu = document.getElementById('menu');
      if (menu) menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, true);

  /* ---------- contactformulier ---------- */
  var form = document.querySelector('[data-contact]');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var fout = form.querySelector('[data-contact-fout]'), klaar = form.querySelector('[data-contact-klaar]');
      fout.hidden = true;
      if (!form.naam.value.trim() || !form.contact.value.trim() || !form.bericht.value.trim()) {
        fout.textContent = 'Fill in your name, how we can reach you and your message.'; fout.hidden = false; return;
      }
      var knop = form.querySelector('button[type="submit"]');
      knop.disabled = true;
      try {
        var r = await fetch('api/aanvraag', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ naam: form.naam.value.trim(), contact: form.contact.value.trim(), bericht: form.bericht.value.trim() }) });
        var j = await r.json();
        if (!j.ok) throw new Error(j.fout || r.status);
        form.reset(); klaar.hidden = false;
      } catch (err) {
        fout.textContent = 'That did not go through. Please try again, or email HourHouseBistro@outlook.com.'; fout.hidden = false;
      }
      knop.disabled = false;
    });
  }
})();
