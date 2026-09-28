/* Chez Minée: site-eigen laag bovenop motion.js.
   Levende collages, live openstatus, het nu-moment op de kaartverkenner,
   de loper en kleine interacties. Alles fail-open. */
(function () {
  'use strict';

  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var foto = /[?&]foto=1/.test(location.search);

  /* ---------- Openingstijden (bron: dossier, sep 2026) ----------
     dag 0 = zondag. null = gesloten. Tijden in uren (24u). */
  var TIJDEN = {
    0: { open: 8.5, dicht: 23 },
    1: { open: 8.5, dicht: 23 },
    2: null,
    3: { open: 8.5, dicht: 23 },
    4: { open: 8.5, dicht: 23 },
    5: { open: 8.5, dicht: 24 },
    6: { open: 8.5, dicht: 24 },
  };
  var DAGNAAM = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

  function uurTekst(u) {
    var heel = Math.floor(u);
    var min = Math.round((u - heel) * 60);
    if (heel === 24) heel = 0;
    return heel + '.' + (min < 10 ? '0' + min : min) + ' uur';
  }

  /* ---------- Live openstatus-chip ---------- */
  (function () {
    var chip = document.querySelector('[data-openstatus]');
    if (!chip) return;
    var nu = new Date();
    var dag = nu.getDay();
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var vandaag = TIJDEN[dag];
    var stip = chip.querySelector('.open-stip');
    var tekst;
    if (vandaag && uur >= vandaag.open && uur < vandaag.dicht) {
      tekst = 'Nu geopend, tot ' + uurTekst(vandaag.dicht);
    } else if (vandaag && uur < vandaag.open) {
      tekst = 'Vandaag open vanaf ' + uurTekst(vandaag.open);
      if (stip) stip.classList.add('dicht');
    } else {
      var d = dag;
      for (var i = 1; i <= 7; i++) {
        d = (dag + i) % 7;
        if (TIJDEN[d]) break;
      }
      var wanneer = (i === 1) ? 'morgen' : DAGNAAM[d];
      tekst = 'Nu gesloten, ' + wanneer + ' open vanaf ' + uurTekst(TIJDEN[d].open);
      if (stip) stip.classList.add('dicht');
    }
    chip.innerHTML = '';
    if (stip) chip.appendChild(stip);
    chip.appendChild(document.createTextNode(' ' + tekst));
  })();

  /* ---------- Het nu-moment op de kaartverkenner ---------- */
  (function () {
    var nu = new Date();
    if (!TIJDEN[nu.getDay()]) return;   /* dicht: geen nu-markering */
    var uur = nu.getHours() + nu.getMinutes() / 60;
    document.querySelectorAll('[data-moment]').forEach(function (kaart) {
      var van = parseFloat(kaart.dataset.van);
      var tot = parseFloat(kaart.dataset.tot);
      if (uur >= van && uur < tot) kaart.classList.add('nu');
    });
  })();

  /* ---------- Levende collages ----------
     Elk [data-wissel] bevat 2 of 3 beelden; er staat er altijd één .aan
     in de HTML (fail-open). Het script wisselt met een eigen tempo per
     kader, zodat nooit alles tegelijk verspringt. */
  /* Eén stap in een wisselkader. Het volgende beeld moet geladen zijn; zo
     niet, dan wordt het nu opgehaald en slaat dit kader een beurt over.
     Het oude beeld blijft (.was) onder het nieuwe staan tot de fade klaar is. */
  function volgende(kader) {
    var beelden = kader.querySelectorAll('img');
    if (beelden.length < 2) return false;
    var huidig = kader.querySelector('img.aan') || beelden[0];
    var nu = [].indexOf.call(beelden, huidig);
    var nieuw = beelden[(nu + 1) % beelden.length];
    var daarna = beelden[(nu + 2) % beelden.length];
    daarna.loading = 'eager';
    if (!(nieuw.complete && nieuw.naturalWidth)) { nieuw.loading = 'eager'; return false; }
    beelden.forEach(function (b) { b.classList.remove('was'); });
    huidig.classList.remove('aan');
    huidig.classList.add('was');
    nieuw.classList.add('aan');
    setTimeout(function () { huidig.classList.remove('was'); }, 1300);
    return true;
  }

  if (!kalm && !foto) {
    /* het viertal in de hero: de vakken wisselen om de beurt, met de klok mee */
    document.querySelectorAll('[data-wissel-groep]').forEach(function (groep) {
      var vakken = ['.vak-a', '.vak-b', '.vak-d', '.vak-c']
        .map(function (s) { return groep.querySelector(s + ' .wissel'); })
        .filter(Boolean);
      vakken.forEach(function (w) {
        var b = w.querySelectorAll('img');
        if (b[1]) b[1].loading = 'eager';
      });
      var beurt = 0;
      setTimeout(function () {
        setInterval(function () {
          if (document.hidden) return;
          volgende(vakken[beurt]);
          beurt = (beurt + 1) % vakken.length;
        }, 2300);
      }, 1800);
    });

    document.querySelectorAll('[data-wissel]').forEach(function (kader, i) {
      if (kader.querySelectorAll('img').length < 2) return;
      var pauze = parseInt(kader.dataset.pauze, 10) || 5000;
      setTimeout(function () {
        setInterval(function () {
          if (document.hidden) return;
          volgende(kader);
        }, pauze);
      }, (i % 5) * 700);
    });
  }

  /* ---------- Loper: inhoud verdubbelen voor de naadloze band ---------- */
  document.querySelectorAll('[data-loper]').forEach(function (band) {
    [].slice.call(band.children).forEach(function (kind) {
      var kopie = kind.cloneNode(true);
      kopie.setAttribute('aria-hidden', 'true');
      band.appendChild(kopie);
    });
  });

  /* ---------- Actiebalk op pagina's zonder hero ----------
     motion.js toont hem alleen als er een [data-hero] is; op de andere
     pagina's doet dit stukje hetzelfde vanaf 320 px scrollen. */
  (function () {
    var balk = document.querySelector('[data-mobielcta]');
    if (!balk || document.querySelector('[data-hero]')) return;
    var toon = function () {
      var footer = document.querySelector('footer');
      var bijFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
      balk.classList.toggle('zichtbaar', window.scrollY > 320 && !bijFooter);
    };
    window.addEventListener('scroll', toon, { passive: true });
    toon();
  })();

  /* ---------- Zwevende reserveerknop pas na de eerste viewport ---------- */
  (function () {
    var opener = document.querySelector('.paneel-opener');
    if (!opener) return;
    var toon = function () {
      opener.classList.toggle('zichtbaar', window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener('scroll', toon, { passive: true });
    toon();
  })();

  /* ---------- Extra sluitknop in het mobiele menu ---------- */
  var dichtKnop = document.querySelector('[data-menu-dicht]');
  var menuKnop = document.querySelector('[data-menuknop]');
  if (dichtKnop && menuKnop) {
    dichtKnop.addEventListener('click', function () {
      if (menuKnop.getAttribute('aria-expanded') === 'true') menuKnop.click();
    });
  }

  /* ---------- Bezoek-reel: speelt zachtjes in beeld, geluid op verzoek ---------- */
  (function () {
    var reel = document.querySelector('[data-reel]');
    if (!reel) return;
    var geluidKnop = document.querySelector('[data-reel-geluid]');
    if ('IntersectionObserver' in window && !kalm) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) reel.play().catch(function () {});
          else reel.pause();
        });
      }, { threshold: 0.35 });
      io.observe(reel);
    }
    if (geluidKnop) {
      geluidKnop.addEventListener('click', function () {
        reel.muted = !reel.muted;
        if (!reel.muted) { reel.currentTime = 0; reel.play().catch(function () {}); }
        geluidKnop.setAttribute('aria-label', reel.muted ? 'Geluid aanzetten' : 'Geluid uitzetten');
        geluidKnop.style.background = reel.muted ? 'rgba(67,12,37,.82)' : '#8f0038';
      });
    }
  })();
})();
