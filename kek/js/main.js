/* KEK: site-eigen interactie. motion.js doet reveals, menu, header, tellers en actiebalk. */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* logo bouwt zich op uit zijn balken zodra de pagina er staat */
  requestAnimationFrame(function () { document.body.classList.add('geladen'); });

  /* ---------- hero: projecten wisselen, maatlijn en label lopen mee ---------- */
  var dias = [].slice.call(document.querySelectorAll('[data-dia]'));
  if (dias.length) {
    var knoppen = [].slice.call(document.querySelectorAll('[data-dia-knop]'));
    var label = document.querySelector('[data-dia-label]');
    var nu = 0, klok;
    var toon = function (i) {
      dias[nu].classList.remove('aan');
      knoppen[nu].removeAttribute('aria-current');
      nu = (i + dias.length) % dias.length;
      dias[nu].classList.add('aan');
      knoppen[nu].setAttribute('aria-current', 'true');
      if (label) label.textContent = dias[nu].querySelector('figcaption span').textContent;
      var img = dias[nu].querySelector('img');
      if (img && img.loading === 'lazy') img.loading = 'eager';
    };
    var start = function () { if (!kalm) { clearInterval(klok); klok = setInterval(function () { toon(nu + 1); }, 5200); } };
    knoppen.forEach(function (k, i) { k.addEventListener('click', function () { toon(i); start(); }); });
    start();
  }

  /* ---------- werkwijze: de rode lijn groeit mee met het scrollen ---------- */
  document.querySelectorAll('[data-stappen]').forEach(function (lijst) {
    var stappen = [].slice.call(lijst.children);
    var bezig = false;
    var meet = function () {
      bezig = false;
      var r = lijst.getBoundingClientRect();
      var midden = window.innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (midden - r.top) / r.height));
      lijst.style.setProperty('--voortgang', p.toFixed(3));
      stappen.forEach(function (s) { s.classList.toggle('bereikt', s.getBoundingClientRect().top + 30 < midden); });
    };
    window.addEventListener('scroll', function () { if (!bezig) { bezig = true; requestAnimationFrame(meet); } }, { passive: true });
    meet();
  });

  /* ---------- tabs: afbouwdisciplines ---------- */
  document.querySelectorAll('[data-afbouw] [role="tablist"]').forEach(function (lijst) {
    var tabs = [].slice.call(lijst.querySelectorAll('[role="tab"]'));
    var kies = function (tab, focus) {
      tabs.forEach(function (t) {
        var aan = t === tab;
        t.setAttribute('aria-selected', aan);
        t.tabIndex = aan ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).toggleAttribute('data-dicht', !aan);
      });
      if (focus) tab.focus();
      if (window.innerWidth < 860) {
        var paneel = document.getElementById(tab.getAttribute('aria-controls'));
        paneel.scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'nearest' });
      }
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { kies(t); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!n) return;
        e.preventDefault();
        kies(tabs[(i + n + tabs.length) % tabs.length], true);
      });
    });
  });

  /* ---------- projectfilter ---------- */
  var filter = document.querySelector('[data-filter]');
  if (filter) {
    var kaarten = [].slice.call(document.querySelectorAll('[data-projecten] .pkaart'));
    filter.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      filter.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var f = b.dataset.f;
      kaarten.forEach(function (k) { k.classList.toggle('weg', f !== 'alle' && k.dataset.cat !== f); });
    });
  }

  /* ---------- carrousel-pijlen op mobiel ---------- */
  document.querySelectorAll('[data-carrousel]').forEach(function (rij) {
    var knop = rij.closest('.wrap').querySelector('.carrousel-knoppen');
    if (!knop) return;
    var stap = function (r) {
      var kaart = rij.firstElementChild;
      rij.scrollBy({ left: r * (kaart ? kaart.getBoundingClientRect().width + 16 : rij.clientWidth * 0.8), behavior: 'smooth' });
    };
    knop.querySelector('[data-car-vorige]').addEventListener('click', function () { stap(-1); });
    knop.querySelector('[data-car-volgende]').addEventListener('click', function () { stap(1); });
  });

  /* ---------- reviews: stempel slaat erop zodra een vel in beeld komt ---------- */
  var vellen = [].slice.call(document.querySelectorAll('[data-vel]'));
  if (vellen.length) {
    var stempel = function (el) { el.classList.add('gestempeld'); };
    if (kalm || !('IntersectionObserver' in window)) vellen.forEach(stempel);
    else {
      var oog = new IntersectionObserver(function (items) {
        items.forEach(function (it) { if (it.isIntersecting) { stempel(it.target); oog.unobserve(it.target); } });
      }, { threshold: 0.55 });
      vellen.forEach(function (v) { oog.observe(v); });
      /* vangnet: wat na 4 seconden nog niet gestempeld is maar wel in beeld staat, alsnog */
      setTimeout(function () { vellen.forEach(function (v) { var r = v.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) stempel(v); }); }, 4000);
    }
  }

  /* ---------- reviews: rail met pijlen, voortgangsmaatlijn en slepen met de muis ---------- */
  var rail = document.querySelector('[data-rev-rail]');
  if (rail) {
    var balkje = document.querySelector('[data-rev-voortgang]');
    var vorige = document.querySelector('[data-rail-vorige]');
    var volgende = document.querySelector('[data-rail-volgende]');
    var stand = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      var p = max > 0 ? rail.scrollLeft / max : 0;
      if (balkje) { balkje.parentElement.style.setProperty('--p', p.toFixed(3)); balkje.parentElement.style.setProperty('--w', Math.min(1, rail.clientWidth / rail.scrollWidth).toFixed(3)); }
      vorige.disabled = rail.scrollLeft < 8;
      volgende.disabled = rail.scrollLeft > max - 8;
    };
    var schuif = function (r) {
      var vel = rail.querySelector('.vel');
      rail.scrollBy({ left: r * (vel ? vel.getBoundingClientRect().width + 24 : 360), behavior: kalm ? 'auto' : 'smooth' });
    };
    vorige.addEventListener('click', function () { schuif(-1); });
    volgende.addEventListener('click', function () { schuif(1); });
    rail.addEventListener('scroll', function () { requestAnimationFrame(stand); }, { passive: true });
    window.addEventListener('resize', stand);
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); schuif(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); schuif(-1); }
    });
    if (window.matchMedia('(pointer: fine)').matches) {
      var x0 = 0, s0 = 0, bezig = false, verschoven = false;
      rail.addEventListener('pointerdown', function (e) { if (e.button) return; bezig = true; verschoven = false; x0 = e.clientX; s0 = rail.scrollLeft; });
      window.addEventListener('pointermove', function (e) {
        if (!bezig) return;
        var dx = e.clientX - x0;
        if (Math.abs(dx) > 4) { verschoven = true; rail.classList.add('sleept'); }
        rail.scrollLeft = s0 - dx;
      });
      window.addEventListener('pointerup', function () { if (!bezig) return; bezig = false; rail.classList.remove('sleept'); if (verschoven) schuif(0); });
    }
    stand();
  }

  /* ---------- lightbox voor de projectgalerij ---------- */
  var links = [].slice.call(document.querySelectorAll('[data-lightbox]'));
  if (links.length) {
    var doos, beeld, teller, huidig = 0, terug;
    var sluit = function () { if (doos) { doos.remove(); doos = null; document.removeEventListener('keydown', toets); if (terug) terug.focus(); } };
    var zet = function (i) {
      huidig = (i + links.length) % links.length;
      beeld.src = links[huidig].getAttribute('href');
      beeld.alt = links[huidig].querySelector('img').alt;
      teller.textContent = (huidig + 1) + ' / ' + links.length;
    };
    var toets = function (e) {
      if (e.key === 'Escape') sluit();
      if (e.key === 'ArrowRight') zet(huidig + 1);
      if (e.key === 'ArrowLeft') zet(huidig - 1);
    };
    var knopje = function (cls, label, icoon, fn) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label);
      b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="assets/iconen.svg#i-' + icoon + '"/></svg>';
      b.addEventListener('click', fn);
      return b;
    };
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        terug = a;
        doos = document.createElement('div');
        doos.className = 'lightbox';
        doos.setAttribute('role', 'dialog');
        doos.setAttribute('aria-modal', 'true');
        doos.setAttribute('aria-label', 'Foto vergroot');
        beeld = document.createElement('img');
        teller = document.createElement('span');
        teller.className = 'lb-teller';
        var sluitKnop = knopje('lb-sluit', 'Sluiten', 'sluit', sluit);
        doos.append(beeld, knopje('lb-vorige', 'Vorige foto', 'pijl-l', function () { zet(huidig - 1); }), knopje('lb-volgende', 'Volgende foto', 'pijl', function () { zet(huidig + 1); }), sluitKnop, teller);
        doos.addEventListener('click', function (ev) { if (ev.target === doos) sluit(); });
        document.body.appendChild(doos);
        document.addEventListener('keydown', toets);
        zet(i);
        sluitKnop.focus();
      });
    });
  }

  /* ---------- contactformulier naar het eigen aanvraagsysteem (Mettafel) ---------- */
  var form = document.querySelector('[data-aanvraag]');
  if (form) {
    var q = new URLSearchParams(location.search);
    if (q.get('project')) form.elements.bericht.value = 'Ik zag het project ' + q.get('project') + ' en wil graag iets vergelijkbaars bespreken.';

    var fout = function (t) { var el = form.querySelector('[data-formfout]'); el.textContent = t || ''; el.hidden = !t; };
    var invoer = form.querySelector('input[type="file"]');
    var lijst = form.querySelector('[data-upload-lijst]');
    var gekozen = [];
    var toonLijst = function () {
      lijst.innerHTML = '';
      gekozen.forEach(function (f) { var li = document.createElement('li'); li.textContent = f.name; lijst.appendChild(li); });
    };
    var voegToe = function (bestanden) {
      [].slice.call(bestanden).forEach(function (f) {
        if ((/^image\//.test(f.type) || f.type === 'application/pdf') && gekozen.length < 5) gekozen.push(f);
      });
      toonLijst();
    };
    invoer.addEventListener('change', function () { voegToe(invoer.files); invoer.value = ''; });
    var vlak = form.querySelector('.upload');
    ['dragenter', 'dragover'].forEach(function (t) { vlak.addEventListener(t, function (e) { e.preventDefault(); vlak.classList.add('sleept'); }); });
    ['dragleave', 'drop'].forEach(function (t) { vlak.addEventListener(t, function (e) { e.preventDefault(); vlak.classList.remove('sleept'); }); });
    vlak.addEventListener('drop', function (e) { voegToe(e.dataTransfer.files); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var leeg = [].slice.call(form.querySelectorAll('[required]')).filter(function (v) { var m = !v.value.trim(); v.setAttribute('aria-invalid', m); return m; });
      if (leeg.length) { fout('Vul je naam en telefoonnummer in, dan kunnen we je bereiken.'); leeg[0].focus(); return; }
      fout('');
      var data = new FormData();
      ['naam', 'bedrijf', 'telefoon', 'email', 'bericht'].forEach(function (n) { data.append(n, form.elements[n].value.trim()); });
      var soort = form.querySelector('input[name="soort"]:checked');
      data.append('soort_project', soort ? soort.value : '');
      gekozen.forEach(function (f, i) { data.append('bijlage' + i, f, f.name); });
      var knop = form.querySelector('button[type="submit"]');
      knop.disabled = true;
      fetch('/api/aanvraag', { method: 'POST', body: data })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          knop.disabled = false;
          if (!j.ok) throw new Error(j.fout);
          [].slice.call(form.children).forEach(function (el) { if (!el.hasAttribute('data-klaar')) el.hidden = true; });
          var k = form.querySelector('[data-klaar]');
          k.querySelector('[data-aanvraagnr]').textContent = j.id;
          k.hidden = false;
          form.scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'center' });
        })
        .catch(function () {
          knop.disabled = false;
          fout('Versturen lukte niet. Bel ons gerust op 073-2600002 of mail naar contact@kekbv.nl.');
        });
    });
  }
})();
