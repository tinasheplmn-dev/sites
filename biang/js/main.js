/* Biang: pagina-gedrag. Header, menutabs, contactformulier.
   Bestellen zit in order.js. */
(function () {
  'use strict';
  var kop = document.querySelector('[data-kop]');
  function kopStand() { kop.classList.toggle('is-vast', window.scrollY > 30); }
  window.addEventListener('scroll', kopStand, { passive: true });
  kopStand();

  /* menutabs */
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
      doel.open = true; actief(t.dataset.tab);
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

  /* "Order online" met een leeg mandje: eerst naar het menu */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open-cart]');
    if (!b) return;
    var teller = document.querySelector('[data-cart-count]');
    if (!teller || teller.hidden) {
      e.stopImmediatePropagation(); e.preventDefault();
      document.getElementById('menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, true);

  /* contactformulier */
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
        fout.textContent = 'That did not go through. Please try again, or call 020 7718 8700.'; fout.hidden = false;
      }
      knop.disabled = false;
    });
  }
})();
