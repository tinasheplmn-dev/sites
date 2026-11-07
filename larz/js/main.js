/* Site-eigen gedrag voor larz.nl. Alles fail-open: zonder dit script staat
   er een complete pagina met poster, statische agenda en werkende links. */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zuinig = navigator.connection && navigator.connection.saveData;

  /* ---------- Equalizers: elke balk een eigen hoogte, tempo en fase ---------- */
  function vulEq(el, n) {
    if (el.children.length) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var b = document.createElement('i');
      var h = 0.25 + Math.abs(Math.sin(i * 1.7) * 0.5) + (i % 3) * 0.08;
      b.style.setProperty('--h', Math.min(1, h).toFixed(2));
      b.style.setProperty('--t', (0.9 + ((i * 37) % 11) / 10).toFixed(2) + 's');
      b.style.setProperty('--f', '-' + (((i * 53) % 17) / 10).toFixed(2) + 's');
      frag.appendChild(b);
    }
    el.appendChild(frag);
  }
  document.querySelectorAll('[data-eq]').forEach(function (el) {
    var n = parseInt(el.dataset.eq, 10) || 40;
    if (el.classList.contains('hero-eq') && window.innerWidth < 640) n = Math.round(n * 0.6);
    if (el.classList.contains('slot-eq') && window.innerWidth < 640) n = Math.round(n * 0.7);
    vulEq(el, n);
    if (!kalm) el.classList.add('leeft');
  });

  /* ---------- Hero-video: kies de maat, speel alleen als het kan ---------- */
  var video = document.querySelector('[data-hero-video]');
  if (video) {
    var knop = document.querySelector('[data-video-knop]');
    if (kalm || zuinig) {
      video.remove();
      if (knop) knop.remove();
    } else {
      var bron = window.innerWidth > 900 ? video.dataset.groot : video.dataset.klein;
      video.src = bron;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      var speel = video.play();
      if (speel && speel.catch) speel.catch(function () { if (knop) knop.remove(); });
      video.addEventListener('playing', function () { video.classList.add('speelt'); }, { once: true });
      if (knop) {
        knop.addEventListener('click', function () {
          var pauzeert = !video.paused;
          if (pauzeert) video.pause(); else video.play();
          knop.setAttribute('aria-label', pauzeert ? 'Video afspelen' : 'Video pauzeren');
          knop.querySelector('use').setAttribute('href', 'assets/iconen.svg#' + (pauzeert ? 'i-speel' : 'i-pauze'));
        });
      }
    }
  }

  /* ---------- Agenda: vandaag en voorbij markeren ---------- */
  var nu = new Date();
  var vandaagStr = nu.getFullYear() + '-' + String(nu.getMonth() + 1).padStart(2, '0') + '-' + String(nu.getDate()).padStart(2, '0');
  var eerstvolgende = null;
  document.querySelectorAll('[data-datum]').forEach(function (rij) {
    var d = rij.dataset.datum;        /* YYYY-MM-DD, eventueel tot YYYY-MM-DD in data-tot */
    var tot = rij.dataset.tot || d;
    var tag = rij.querySelector('.agenda-tag span:not(.eq)');
    if (tot < vandaagStr) {
      rij.classList.add('voorbij');
      if (tag) tag.textContent = 'Geweest';
    } else if (d <= vandaagStr && tot >= vandaagStr) {
      rij.classList.add('vandaag');
      if (tag) tag.textContent = 'Vandaag';
      if (!eerstvolgende) eerstvolgende = rij;
    } else if (!eerstvolgende) {
      eerstvolgende = rij;
      if (tag) tag.textContent = 'Eerstvolgend';
    }
  });
  var chip = document.querySelector('[data-agenda-chip]');
  if (chip && eerstvolgende) {
    var titel = eerstvolgende.querySelector('h3');
    var kort = eerstvolgende.dataset.kort || (titel ? titel.textContent.trim() : '');
    var stad = eerstvolgende.dataset.stad || '';
    var is = eerstvolgende.classList.contains('vandaag');
    chip.textContent = (is ? 'Vandaag: ' : 'Binnenkort: ') + kort + (stad ? ', ' + stad : '');
  }

  /* ---------- Rooster: vandaag uitlichten ---------- */
  var dagen = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var vandaagDag = dagen[nu.getDay()];
  document.querySelectorAll('[data-dag]').forEach(function (el) {
    if (el.dataset.dag === vandaagDag) {
      el.classList.add('vandaag');
      var k = el.querySelector('h3 small');
      if (k) k.textContent = 'Vandaag';
    }
  });

  /* ---------- Video-kaarten: YouTube pas laden bij klik ---------- */
  document.querySelectorAll('[data-yt]').forEach(function (kaart) {
    kaart.addEventListener('click', function (e) {
      e.preventDefault();
      var id = kaart.dataset.yt;
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      frame.title = kaart.getAttribute('aria-label') || 'Video van Larz';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      frame.setAttribute('allowfullscreen', '');
      kaart.appendChild(frame);
      kaart.classList.add('speelt');
    });
  });

  /* ---------- Spotify-speler pas laden bij klik ---------- */
  document.querySelectorAll('[data-spotify]').forEach(function (knop) {
    knop.addEventListener('click', function () {
      var doel = document.getElementById(knop.getAttribute('aria-controls'));
      if (!doel) return;
      var frame = document.createElement('iframe');
      frame.src = 'https://open.spotify.com/embed/playlist/' + knop.dataset.spotify + '?utm_source=generator&theme=0';
      frame.title = 'Spotify-playlist van Larz';
      frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      frame.loading = 'lazy';
      doel.innerHTML = '';
      doel.appendChild(frame);
    });
  });

  /* ---------- Aanvraagformulier: bouwt een nette mail ---------- */
  var form = document.querySelector('[data-aanvraag]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (veld) {
        var wrap = veld.closest('.veld');
        var leeg = !veld.value.trim() || (veld.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(veld.value));
        if (wrap) wrap.classList.toggle('mis', leeg);
        if (leeg) ok = false;
      });
      if (!ok) { var eerste = form.querySelector('.veld.mis input, .veld.mis textarea'); if (eerste) eerste.focus(); return; }
      var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var soort = v('soort');
      var regels = [
        'Hoi Larz,', '',
        'Ik wil je graag boeken.', '',
        'Naam: ' + v('naam'),
        'E-mail: ' + v('email'),
        'Event: ' + v('event'),
        'Aantal mensen: ' + v('aantal'),
        soort ? 'Wat ik zoek: ' + soort : '',
        v('bericht') ? '' : null,
        v('bericht') ? 'Toelichting:\n' + v('bericht') : null,
        '', 'Groet,', v('naam'),
      ].filter(function (r) { return r !== null; });
      var onderwerp = 'Aanvraag event: ' + (v('event') || 'nieuw event') + (soort ? ' (' + soort + ')' : '');
      window.location.href = 'mailto:info@larz.nl?subject=' + encodeURIComponent(onderwerp) + '&body=' + encodeURIComponent(regels.join('\n'));
      var klaar = document.querySelector('[data-bevestiging]');
      if (klaar) {
        form.hidden = true;
        klaar.hidden = false;
        klaar.setAttribute('tabindex', '-1');
        klaar.focus();
      }
    });
    form.querySelectorAll('[required]').forEach(function (veld) {
      veld.addEventListener('input', function () { var w = veld.closest('.veld'); if (w) w.classList.remove('mis'); });
    });
  }
})();
