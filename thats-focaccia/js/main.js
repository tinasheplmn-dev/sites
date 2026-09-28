/* That's Focaccia: kleine paginalogica naast motion.js.
   Live openstatus-chip (fail-open: zonder JavaScript staat de vaste
   openingstijdenregel er al), mobiele actiebalk, footer-accenten. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';

  /* ---------- openingstijden: wo t/m zo 10:00-15:30 ---------- */
  function openDag(d) { return d === 0 || (d >= 3 && d <= 6); }
  var DAGEN = EN
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

  function status() {
    var nu = new Date();
    var d = nu.getDay();
    var minuten = nu.getHours() * 60 + nu.getMinutes();
    var van = 10 * 60, tot = 15 * 60 + 30;
    if (openDag(d) && minuten >= van && minuten < tot) {
      return { open: true, tekst: EN ? 'Open now, until 15:30' : 'Nu geopend, tot 15.30 uur' };
    }
    if (openDag(d) && minuten < van) {
      return { open: false, tekst: EN ? 'Opens today at 10:00' : 'Vandaag open vanaf 10.00 uur' };
    }
    for (var i = 1; i <= 7; i++) {
      var v = (d + i) % 7;
      if (openDag(v)) {
        var wanneer = i === 1 ? (EN ? 'tomorrow' : 'morgen') : DAGEN[v];
        return { open: false, tekst: EN ? ('Closed, open again ' + wanneer + ' 10:00') : ('Nu gesloten, ' + wanneer + ' weer open om 10.00 uur') };
      }
    }
    return null;
  }

  document.querySelectorAll('[data-openstatus]').forEach(function (chip) {
    var s = status();
    if (!s) return;
    var tekst = chip.querySelector('[data-openstatus-tekst]');
    if (tekst) tekst.textContent = s.tekst;
    chip.classList.toggle('dicht', !s.open);
  });

  /* footer: de rij van vandaag oplichten */
  var vandaag = new Date().getDay();
  document.querySelectorAll('[data-dag]').forEach(function (li) {
    if (Number(li.getAttribute('data-dag')) === vandaag) li.classList.add('vandaag');
  });

  /* ---------- mobiele actiebalk: tonen zodra de hero uit beeld is ---------- */
  var balk = document.querySelector('[data-mobielcta]');
  var hero = document.querySelector('.hero, .pagina-kop');
  if (balk && hero) {
    var toon = function () {
      var r = hero.getBoundingClientRect();
      var voet = document.querySelector('.voet');
      var bijVoet = voet && voet.getBoundingClientRect().top < window.innerHeight - 40;
      balk.classList.toggle('zichtbaar', r.bottom < 0 && !bijVoet);
    };
    window.addEventListener('scroll', toon, { passive: true });
    toon();
  }

  /* jaartal in de footer */
  document.querySelectorAll('[data-jaar]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
