/* Kickboxing University: site-eigen laag bovenop motion.js. Powered by Mettafel.
   1. Rooster uit data (js/rooster-data.js): weekrooster met filters, "vandaag"-strook.
   2. Sluitknop mobiel menu.
   3. Proefles boeken: les, dag, gegevens -> /api/proefles, met bevestiging.
   4. Contactformulier -> /api/aanvraag.
   5. WhatsApp-kaartje.
   Alles fail-open: zonder JavaScript staat er een complete site (het rooster staat ook als tekst in de HTML). */

/* ---------- 1. rooster ---------- */
(function () {
  'use strict';
  var R = window.ROOSTER || [], DAGEN = window.DAGEN || [], NIVEAU = window.NIVEAU || {};
  var vandaag = (new Date().getDay() + 6) % 7;

  var week = document.querySelector('[data-rooster]');
  if (week) {
    var filter = 'alle';
    function bouw() {
      week.innerHTML = DAGEN.map(function (naam, d) {
        var lessen = R.filter(function (l) { return l.d === d && (filter === 'alle' || l.groep === filter || (filter === 'jeugd' && l.groep === 'kids')); });
        return '<div class="dag' + (d === vandaag ? ' vandaag' : '') + '" data-dag="' + d + '"><h3>' + naam + (d === vandaag ? ' <span class="tape klein">vandaag</span>' : '') + '</h3>' +
          (lessen.length ? lessen.map(function (l) {
            return '<a class="blok-les ' + l.niveau + '" href="lessen.html#' + l.pagina + '"><span class="tijd">' + l.van.replace(':', '.') + '-' + l.tot.replace(':', '.') + '</span><span class="naam">' + l.les + '</span><span class="niveau">' + NIVEAU[l.niveau] + '</span></a>';
          }).join('') : '<p class="leeg">Geen les</p>') + '</div>';
      }).join('');
    }
    bouw();
    document.querySelectorAll('[data-rooster-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.dataset.roosterFilter;
        document.querySelectorAll('[data-rooster-filter]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        bouw();
      });
    });
    /* op mobiel: dagen uitklappen door op de dagnaam te tikken */
    week.addEventListener('click', function (e) {
      var h = e.target.closest('h3');
      if (!h || !window.matchMedia('(max-width: 640px)').matches) return;
      h.parentElement.classList.toggle('open');
    });
  }

  var strook = document.querySelector('[data-vandaag]');
  if (strook) {
    var lessen = R.filter(function (l) { return l.d === vandaag; });
    var naamEl = strook.querySelector('[data-vandaag-dag]');
    var lijst = strook.querySelector('[data-vandaag-lessen]');
    if (naamEl) naamEl.textContent = DAGEN[vandaag];
    if (lijst) lijst.innerHTML = lessen.length
      ? lessen.map(function (l) { return '<span><b>' + l.van.replace(':', '.') + '</b>' + l.les + '</span>'; }).join('')
      : '<span>Vandaag geen les. Morgen weer.</span>';
  }
})();

/* ---------- 2. sluitknop mobiel menu ---------- */
(function () {
  'use strict';
  var sluit = document.querySelector('[data-menu-sluit]');
  var knop = document.querySelector('[data-menuknop]');
  if (sluit && knop) sluit.addEventListener('click', function () { if (knop.getAttribute('aria-expanded') === 'true') knop.click(); });
})();

/* ---------- 3. proefles boeken ---------- */
(function () {
  'use strict';
  var form = document.querySelector('[data-proefles]');
  if (!form) return;
  var R = window.ROOSTER || [], DAGEN = window.DAGEN || [];
  var lesKeuze = form.querySelector('[data-les-keuze]');
  var dagKeuze = form.querySelector('[data-dag-keuze]');
  var klaar = document.querySelector('[data-proefles-klaar]');
  var gekozenLes = null, gekozenDag = null;

  /* unieke lessen, in roostervolgorde */
  var lessen = [];
  R.forEach(function (l) { if (!lessen.some(function (x) { return x.les === l.les; })) lessen.push(l); });
  lesKeuze.innerHTML = lessen.map(function (l) { return '<button type="button" class="slot" data-les="' + l.les + '" aria-pressed="false">' + l.les + '</button>'; }).join('');

  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function toonDagen() {
    if (!gekozenLes) { dagKeuze.innerHTML = '<p class="nootje">Kies eerst een les.</p>'; return; }
    var momenten = R.filter(function (l) { return l.les === gekozenLes; });
    var uit = [];
    var d = new Date(); d.setDate(d.getDate() + 1);
    for (var i = 0; i < 21 && uit.length < 6; i++) {
      var wd = (d.getDay() + 6) % 7;
      momenten.filter(function (m) { return m.d === wd; }).forEach(function (m) {
        uit.push({ iso: iso(d), label: DAGEN[wd].slice(0, 2) + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + ' · ' + m.van.replace(':', '.') });
      });
      d = new Date(d); d.setDate(d.getDate() + 1);
    }
    dagKeuze.innerHTML = uit.map(function (o) { return '<button type="button" class="slot" data-dag="' + o.iso + '" data-label="' + o.label + '" aria-pressed="false">' + o.label + '</button>'; }).join('');
  }
  toonDagen();

  lesKeuze.addEventListener('click', function (e) {
    var b = e.target.closest('[data-les]'); if (!b) return;
    gekozenLes = b.dataset.les; gekozenDag = null;
    lesKeuze.querySelectorAll('.slot').forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
    fout('les', ''); toonDagen();
  });
  dagKeuze.addEventListener('click', function (e) {
    var b = e.target.closest('[data-dag]'); if (!b) return;
    gekozenDag = { iso: b.dataset.dag, label: b.dataset.label };
    dagKeuze.querySelectorAll('.slot').forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
    fout('dag', '');
  });

  /* les uit de URL (lessen.html linkt door met ?les=...) */
  var q = new URLSearchParams(location.search).get('les');
  if (q) { var k = lesKeuze.querySelector('[data-les="' + q + '"]'); if (k) k.click(); }

  function fout(naam, tekst) {
    var el = form.querySelector('[data-fout="' + naam + '"]'); if (!el) return;
    el.textContent = tekst || ''; el.hidden = !tekst;
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['les', 'dag', 'naam', 'telefoon', 'algemeen'].forEach(function (v) { fout(v, ''); });
    var naam = form.naam.value.trim(), telefoon = form.telefoon.value.trim(), leeftijd = form.leeftijd.value.trim(), ervaring = form.ervaring.value;
    var ok = true;
    if (!gekozenLes) { fout('les', 'Kies een les.'); ok = false; }
    if (!gekozenDag) { fout('dag', 'Kies een dag en tijd.'); ok = false; }
    if (!naam) { fout('naam', 'Vul je naam in.'); ok = false; }
    if (!/^[\d+][\d\s\-()]{7,}$/.test(telefoon)) { fout('telefoon', 'Vul een telefoonnummer in waarop we je kunnen bereiken.'); ok = false; }
    if (!ok) return;
    var knop = form.querySelector('button[type="submit"]');
    knop.disabled = true; knop.textContent = 'Versturen...';
    try {
      var r = await fetch('/api/proefles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ naam: naam, telefoon: telefoon, les: gekozenLes, datum: gekozenDag.iso, moment: gekozenDag.label, leeftijd: leeftijd, ervaring: ervaring }) });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');
      form.hidden = true;
      if (klaar) {
        klaar.hidden = false;
        var nr = klaar.querySelector('[data-nummer]'); if (nr) nr.textContent = 'Proefles ' + j.id;
        var t = klaar.querySelector('[data-tekst]'); if (t) t.textContent = 'Bedankt ' + naam + ', je proefles ' + gekozenLes + ' staat genoteerd voor ' + gekozenDag.label + ' uur. Je krijgt een bevestiging per telefoon of WhatsApp op ' + telefoon + '. Kom een kwartier eerder, in sportkleding; handschoenen zijn er om te lenen.';
        klaar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      fout('algemeen', 'Versturen lukte niet (' + err.message + '). Probeer het zo nog eens, of stuur een WhatsApp naar 06-55113371.');
      knop.disabled = false; knop.textContent = 'Plan mijn proefles';
    }
  });
})();

/* ---------- 4. contactformulier ---------- */
(function () {
  'use strict';
  var form = document.querySelector('[data-contactformulier]');
  if (!form) return;
  var klaar = document.querySelector('[data-contact-klaar]');
  function fout(naam, tekst) { var el = form.querySelector('[data-fout="' + naam + '"]'); if (!el) return; el.textContent = tekst || ''; el.hidden = !tekst; }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['naam', 'telefoon', 'bericht', 'algemeen'].forEach(function (v) { fout(v, ''); });
    var naam = form.naam.value.trim(), telefoon = form.telefoon.value.trim(), bericht = form.bericht.value.trim();
    var ok = true;
    if (!naam) { fout('naam', 'Vul je naam in.'); ok = false; }
    if (!/^[\d+][\d\s\-()]{7,}$/.test(telefoon)) { fout('telefoon', 'Vul een telefoonnummer in.'); ok = false; }
    if (!bericht) { fout('bericht', 'Vertel kort waar het over gaat.'); ok = false; }
    if (!ok) return;
    var knop = form.querySelector('button[type="submit"]');
    knop.disabled = true; knop.textContent = 'Versturen...';
    try {
      var r = await fetch('/api/aanvraag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ naam: naam, telefoon: telefoon, bericht: bericht }) });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');
      form.hidden = true;
      if (klaar) { klaar.hidden = false; var nr = klaar.querySelector('[data-nummer]'); if (nr) nr.textContent = 'Bericht ' + j.id; }
    } catch (err) {
      fout('algemeen', 'Versturen lukte niet (' + err.message + '). Stuur anders een WhatsApp naar 06-55113371.');
      knop.disabled = false; knop.textContent = 'Verstuur je bericht';
    }
  });
})();

/* ---------- 5. WhatsApp-kaartje ---------- */
(function () {
  'use strict';
  var knop = document.querySelector('[data-wa-knop]');
  var kaart = document.querySelector('[data-wa-kaart]');
  if (!knop || !kaart) return;
  knop.addEventListener('click', function () {
    var open = !kaart.hidden;
    kaart.hidden = open;
    knop.setAttribute('aria-expanded', String(!open));
  });
  var sluit = kaart.querySelector('[data-wa-sluit]');
  if (sluit) sluit.addEventListener('click', function () { kaart.hidden = true; knop.setAttribute('aria-expanded', 'false'); });
})();

/* ---------- 6. reels: levende previews en een speler met geluid ----------
   Fail-open: elke kaart is een gewone link naar de reel op Instagram.
   Desktop: alle previews spelen stil zodra de sectie in beeld is.
   Mobiel: alleen de kaart in het midden speelt (scheelt data).
   Minder beweging: alleen posters, geen autoplay. */
(function () {
  'use strict';
  var rij = document.querySelector('[data-reels]');
  if (!rij) return;
  var kaarten = [].slice.call(rij.querySelectorAll('.reel-kaart'));
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var smal = window.matchMedia('(max-width: 1020px)');

  function speel(v) { if (!v) return; if (v.preload !== 'auto') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function stop(v) { if (v && !v.paused) v.pause(); }

  /* voortgangsbalk onderaan elke kaart */
  kaarten.forEach(function (k) {
    var v = k.querySelector('video');
    v.addEventListener('timeupdate', function () { if (v.duration) k.style.setProperty('--p', (v.currentTime / v.duration).toFixed(3)); });
  });

  var inBeeld = false;
  function middelste() {
    var midden = window.innerWidth / 2, beste = null, afstand = Infinity;
    kaarten.forEach(function (k) { var r = k.getBoundingClientRect(); var d = Math.abs(r.left + r.width / 2 - midden); if (d < afstand) { afstand = d; beste = k; } });
    return beste;
  }
  function werkBij() {
    if (kalm || !inBeeld) { kaarten.forEach(function (k) { stop(k.querySelector('video')); }); return; }
    if (smal.matches) {
      var m = middelste();
      kaarten.forEach(function (k) { var aan = k === m; k.classList.toggle('actief', aan); if (aan) speel(k.querySelector('video')); else stop(k.querySelector('video')); });
    } else {
      kaarten.forEach(function (k) { k.classList.remove('actief'); speel(k.querySelector('video')); });
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { inBeeld = e[0].isIntersecting; werkBij(); }, { rootMargin: '200px 0px' }).observe(rij);
  }
  /* vangnet naast de observer: controleer bij scrollen of de rij in beeld is */
  function checkInBeeld() { var r = rij.getBoundingClientRect(); var nu = r.top < window.innerHeight + 200 && r.bottom > -200; if (nu !== inBeeld) { inBeeld = nu; werkBij(); } }
  window.addEventListener('scroll', function () { requestAnimationFrame(checkInBeeld); }, { passive: true });
  setTimeout(checkInBeeld, 300);
  var bezig = false;
  rij.addEventListener('scroll', function () { if (bezig) return; bezig = true; requestAnimationFrame(function () { bezig = false; werkBij(); }); }, { passive: true });
  window.addEventListener('resize', werkBij);
  /* op mobiel: begin bij de tweede kaart, zodat links en rechts een kaart te zien is */
  if (smal.matches && kaarten[1]) rij.scrollLeft = kaarten[1].offsetLeft - (rij.clientWidth - kaarten[1].offsetWidth) / 2;

  /* de speler */
  var dlg = document.querySelector('[data-reel-dialoog]');
  if (!dlg || typeof dlg.showModal !== 'function') return;     /* geen dialog-ondersteuning: de link gaat naar Instagram */
  var video = dlg.querySelector('[data-reel-video]');
  var huidig = 0;
  function zet(tekst, sel) { var el = dlg.querySelector(sel); if (el) el.textContent = tekst || ''; }
  function open(i) {
    huidig = (i + kaarten.length) % kaarten.length;
    var k = kaarten[huidig];
    zet(k.dataset.titel, '[data-reel-titel]'); zet(k.dataset.tekst, '[data-reel-tekst]'); zet(k.dataset.plaats, '[data-reel-plaats]');
    zet(k.dataset.views, '[data-reel-views]'); zet(k.dataset.datum, '[data-reel-datum]');
    dlg.querySelector('[data-reel-link]').href = k.href;
    video.poster = k.querySelector('video').poster;
    video.src = k.dataset.video;
    if (!dlg.open) dlg.showModal();
    var p = video.play(); if (p && p.catch) p.catch(function () {});
  }
  function sluit() { video.pause(); video.removeAttribute('src'); video.load(); dlg.close(); }
  kaarten.forEach(function (k, i) { k.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
  dlg.querySelector('[data-reel-sluit]').addEventListener('click', sluit);
  dlg.querySelector('[data-reel-vorige]').addEventListener('click', function () { open(huidig - 1); });
  dlg.querySelector('[data-reel-volgende]').addEventListener('click', function () { open(huidig + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) sluit(); });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); sluit(); });
  dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') open(huidig + 1); if (e.key === 'ArrowLeft') open(huidig - 1); });
  video.addEventListener('ended', function () { open(huidig + 1); });
})();

/* ---------- 7. losse video's die stil meespelen zodra ze in beeld zijn ---------- */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.querySelectorAll('video[data-autoplay]').forEach(function (v) {
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    }, { threshold: .25 }).observe(v);
  });
})();

/* ---------- 8. touchscreens: beeldkaders kleuren in zodra ze in beeld zijn (er is geen hover) ---------- */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return;
  document.querySelectorAll('.beeldkader img').forEach(function (img) {
    new IntersectionObserver(function (e) { img.classList.toggle('in-kleur', e[0].isIntersecting); }, { threshold: .6 }).observe(img);
  });
})();
