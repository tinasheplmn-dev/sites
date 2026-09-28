/* Bolwerk Den Bosch: gedrag van de site (header, menu, openstatus,
   waterspiegelingen, actiebalk, loper). Alles fail-open. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';

  /* ---------- header wordt wit bij scrollen ---------- */
  var header = document.querySelector('.hoofd-header');
  function headerStand() {
    if (header) header.classList.toggle('vast', window.scrollY > 30 || !document.querySelector('.hero, .pagina-hero'));
  }
  window.addEventListener('scroll', headerStand, { passive: true });
  headerStand();

  /* ---------- mobiel menu ---------- */
  var menuKnop = document.querySelector('.menu-knop');
  var mobielMenu = document.querySelector('.mobiel-menu');
  if (menuKnop && mobielMenu) {
    function zetMenu(open) {
      mobielMenu.classList.toggle('open', open);
      menuKnop.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    menuKnop.addEventListener('click', function () { zetMenu(!mobielMenu.classList.contains('open')); });
    mobielMenu.addEventListener('click', function (e) {
      if (e.target.closest('[data-menu-sluit]') || e.target.closest('a')) zetMenu(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zetMenu(false); });
  }

  /* ---------- live openstatus ----------
     Openingstijden (van de huidige site en het Google-profiel; de eigenaar
     bevestigt ze voor livegang, zie README):
     ma vanaf 11:30, di t/m zo vanaf 10:00, sluit 22:00. Elke dag open. */
  function openVenster(d) {
    return { van: d.getDay() === 1 ? 11.5 : 10, tot: 22 };
  }
  document.querySelectorAll('[data-openstatus]').forEach(function (el) {
    try {
      var nu = new Date();
      var uur = nu.getHours() + nu.getMinutes() / 60;
      var v = openVenster(nu);
      var open = uur >= v.van && uur < v.tot;
      var tekstEl = el.querySelector('[data-openstatus-tekst]') || el;
      function t(u) { var h = Math.floor(u), m = Math.round((u - h) * 60); return h + (EN ? ':' : '.') + String(m).padStart(2, '0'); }
      if (open) {
        tekstEl.textContent = EN ? 'Open now until ' + t(v.tot) : 'Nu geopend tot ' + t(v.tot) + ' uur';
      } else if (uur < v.van) {
        tekstEl.textContent = EN ? 'Opens today at ' + t(v.van) : 'Vandaag geopend vanaf ' + t(v.van) + ' uur';
        el.classList.add('dicht');
      } else {
        var m = new Date(nu); m.setDate(m.getDate() + 1);
        var vm = openVenster(m);
        tekstEl.textContent = EN ? 'Closed, open tomorrow from ' + t(vm.van) : 'Gesloten, morgen open vanaf ' + t(vm.van) + ' uur';
        el.classList.add('dicht');
      }
    } catch (e) { /* fail-open: de vaste tekst blijft staan */ }
  });

  /* ---------- dagdelen: welk moment is nu? ---------- */
  document.querySelectorAll('[data-dagdeel]').forEach(function (el) {
    try {
      var nu = new Date();
      var uur = nu.getHours() + nu.getMinutes() / 60;
      var start = nu.getDay() === 1 ? 11.5 : 10;
      var m = el.getAttribute('data-dagdeel');
      var actief =
        (m === 'ontbijt' && uur >= start && uur < 11.5) ||
        (m === 'lunch' && uur >= 11.5 && uur < 16.5) ||
        (m === 'borrel' && uur >= start && uur < 22) ||
        (m === 'diner' && uur >= 16 && uur < 22);
      if (actief) el.classList.add('nu');
    } catch (e) { /* geen chip is prima */ }
  });

  /* ---------- waterspiegeling onder fotokaders (decor) ---------- */
  document.querySelectorAll('.spiegelkader').forEach(function (kader) {
    var img = kader.querySelector('.kader img');
    if (!img || kader.querySelector('.spiegeling')) return;
    var spiegel = document.createElement('div');
    spiegel.className = 'spiegeling';
    spiegel.setAttribute('aria-hidden', 'true');
    var kopie = img.cloneNode(false);
    kopie.alt = ''; kopie.removeAttribute('id'); kopie.loading = 'lazy';
    spiegel.appendChild(kopie);
    kader.appendChild(spiegel);
  });

  /* ---------- mobiele actiebalk: tonen zodra de hero uit beeld is ---------- */
  var actiebalk = document.querySelector('.actiebalk');
  var hero = document.querySelector('.hero, .pagina-hero');
  if (actiebalk) {
    function balkStand() {
      var voorbijHero = !hero || hero.getBoundingClientRect().bottom < 80;
      var voet = document.querySelector('.voetregel');
      var bijVoet = voet && voet.getBoundingClientRect().top < window.innerHeight - 40;
      actiebalk.classList.toggle('zichtbaar', voorbijHero && !bijVoet);
    }
    window.addEventListener('scroll', balkStand, { passive: true });
    balkStand();
  }

  /* ---------- loper: inhoud verdubbelen voor de doorloop ---------- */
  document.querySelectorAll('.loper-band').forEach(function (band) {
    var kopie = document.createElement('span');
    kopie.setAttribute('aria-hidden', 'true');
    kopie.style.display = 'contents';
    kopie.innerHTML = band.innerHTML;
    band.appendChild(kopie);
  });
})();
