/* Site-eigen interactie voor Grace's Kitchen. Alles fail-open: zonder JS werkt elke link gewoon. */
(function () {
  'use strict';

  var gerechten = window.GERECHTEN || [];

  /* ---------- Het draaiende bord in de hero ---------- */
  var bord = document.querySelector('[data-bord]');
  if (bord && gerechten.length) {
    var beelden = [].slice.call(bord.querySelectorAll('.bord-img'));
    var knoppen = [].slice.call(document.querySelectorAll('[data-gerecht]'));
    var label = document.querySelector('.bord-label');
    var naam = document.querySelector('[data-bord-naam]');
    var incl = document.querySelector('[data-bord-incl]');
    var prijs = document.querySelector('[data-bord-prijs]');
    var bestel = document.querySelector('[data-bestelknop]');
    var huidig = 0;
    var timer = null;

    var toon = function (n) {
      if (n === huidig) return;
      var oud = beelden[huidig];
      var nieuw = beelden[n];
      /* het nieuwe bord komt van links binnen, het oude draait rechts weg */
      nieuw.classList.remove('weg');
      oud.classList.remove('aan');
      oud.classList.add('weg');
      nieuw.classList.add('aan');
      setTimeout(function () { oud.classList.remove('weg'); }, 1000);
      huidig = n;

      var g = gerechten[n];
      naam.textContent = g.naam;
      incl.textContent = g.incl;
      prijs.textContent = '€' + g.prijs;
      if (bestel) bestel.href = g.bestel;
      label.classList.remove('wissel');
      void label.offsetWidth;
      label.classList.add('wissel');
      knoppen.forEach(function (k, i) { k.setAttribute('aria-pressed', String(i === n)); });
    };

    /* draait vanzelf door, rustig: elk gerecht blijft 5 seconden staan.
       Na een eigen keuze begint de telling opnieuw, zodat die keuze even blijft staan. */
    var start = function () {
      clearInterval(timer);
      timer = setInterval(function () { toon((huidig + 1) % beelden.length); }, 5000);
    };

    knoppen.forEach(function (k) {
      k.addEventListener('click', function () {
        toon(parseInt(k.dataset.gerecht, 10));
        start();
      });
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? clearInterval(timer) : start(); });
    start();
  }

  /* ---------- WhatsApp-widget ---------- */
  var wa = document.querySelector('[data-wa]');
  if (wa) {
    var open = wa.querySelector('[data-wa-open]');
    var kaart = wa.querySelector('.wa-kaart');
    var zet = function (aan) {
      kaart.hidden = !aan;
      wa.classList.toggle('open', aan);
      open.setAttribute('aria-expanded', String(aan));
    };
    open.addEventListener('click', function () { zet(kaart.hidden); });
    wa.querySelector('[data-wa-sluit]').addEventListener('click', function () { zet(false); open.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !kaart.hidden) zet(false); });
  }

  /* ---------- TikTok-speler: video pas laden bij een klik ---------- */
  var speler = document.querySelector('[data-speler]');
  if (speler) {
    var plek = speler.querySelector('[data-speler-plek]');
    var sluitKnop = speler.querySelector('[data-speler-sluit]');
    var vorige = null;
    var sluit = function () {
      speler.hidden = true;
      plek.innerHTML = '';
      document.body.style.overflow = '';
      if (vorige) vorige.focus();
    };
    document.querySelectorAll('[data-tiktok]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return; /* nieuw tabblad blijft gewoon werken */
        e.preventDefault();
        vorige = a;
        var f = document.createElement('iframe');
        f.src = 'https://www.tiktok.com/embed/v2/' + a.dataset.tiktok + '?lang=nl-NL';
        f.title = 'TikTok-video van Grace\'s Kitchen';
        f.allow = 'autoplay; encrypted-media; fullscreen';
        f.loading = 'eager';
        plek.appendChild(f);
        speler.hidden = false;
        document.body.style.overflow = 'hidden';
        sluitKnop.focus();
      });
    });
    sluitKnop.addEventListener('click', sluit);
    speler.addEventListener('click', function (e) { if (e.target === speler) sluit(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !speler.hidden) sluit(); });
  }

  /* ---------- jaartal ---------- */
  var jaar = document.querySelector('[data-jaar]');
  if (jaar) jaar.textContent = new Date().getFullYear();
})();
