/* Thema Veranda: site-eigen gedrag. motion.js doet reveals, menu en header.
   Alles is fail-open: zonder JavaScript staan alle panelen, stappen en
   prijzen gewoon in de HTML, en verzenden valt terug op een gewone link. */
(function () {
  'use strict';

  var WA = 'https://wa.me/31684142487';
  var MAIL = 'info@themaveranda.nl';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- WhatsApp-uitnodiging ---------- */
  var waKnop = document.querySelector('[data-wa-knop]');
  var waKaart = document.getElementById('wa-kaart');
  if (waKnop && waKaart) {
    var zetWa = function (open) { waKaart.hidden = !open; waKnop.setAttribute('aria-expanded', String(open)); };
    waKnop.addEventListener('click', function () { zetWa(waKaart.hidden); });
    document.querySelector('[data-wa-sluit]').addEventListener('click', function () { zetWa(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zetWa(false); });
  }

  /* ---------- kies je uitvoering ---------- */
  document.querySelectorAll('[data-kiezer]').forEach(function (k) {
    var tabs = [].slice.call(k.querySelectorAll('[role="tab"]'));
    var panelen = [].slice.call(k.querySelectorAll('.paneel'));
    var beelden = [].slice.call(k.querySelectorAll('.kiezer-beeld img'));
    var vanaf = k.querySelector('[data-vanaf]');
    var kies = function (i, focus) {
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panelen.forEach(function (p, j) { p.classList.toggle('aan', i === j); });
      beelden.forEach(function (b, j) { b.classList.toggle('aan', i === j); });
      if (vanaf) vanaf.textContent = tabs[i].dataset.vanaf;
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { kies(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') kies((i + 1) % tabs.length, true);
        if (e.key === 'ArrowLeft') kies((i - 1 + tabs.length) % tabs.length, true);
      });
    });
    kies(0);
  });

  /* ---------- licht aan: schakelaar, gaat vanzelf aan zodra hij in beeld komt ---------- */
  document.querySelectorAll('[data-licht]').forEach(function (s) {
    var knop = s.querySelector('[data-schakel]');
    var zet = function (aan) { s.classList.toggle('aan', aan); knop.setAttribute('aria-checked', String(aan)); };
    knop.addEventListener('click', function () { zet(!s.classList.contains('aan')); });
    if ('IntersectionObserver' in window && !kalm) {
      var io = new IntersectionObserver(function (items) {
        items.forEach(function (it) { if (it.isIntersecting) { setTimeout(function () { zet(true); }, 650); io.disconnect(); } });
      }, { threshold: .45 });
      io.observe(s.querySelector('.licht-foto'));
    } else zet(true);
  });

  /* ---------- schuifbalken: gevulde baan ---------- */
  function vulBaan(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
  document.querySelectorAll('input[type="range"]').forEach(function (r) { vulBaan(r); r.addEventListener('input', function () { vulBaan(r); }); });

  /* ---------- prijs rolt soepel door naar het nieuwe bedrag ---------- */
  function rolPrijs(el, doel) {
    if (doel == null) { el.textContent = 'Op maat'; el.dataset.waarde = ''; return; }
    var van = parseFloat(el.dataset.waarde) || doel;
    el.dataset.waarde = doel;
    if (kalm || van === doel) { el.textContent = window.TV.euro(doel); return; }
    var start = null;
    cancelAnimationFrame(el._raf);
    var stap = function (t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 550, 1), z = 1 - Math.pow(1 - p, 3);
      el.textContent = window.TV.euro(van + (doel - van) * z);
      if (p < 1) el._raf = requestAnimationFrame(stap);
    };
    el._raf = requestAnimationFrame(stap);
  }

  function cm(v) { return v + ' cm'; }
  function lees(form) {
    var f = new FormData(form);
    return {
      b: parseInt(f.get('b'), 10), d: parseInt(f.get('d'), 10),
      dak: f.get('dak') || 'poly-helder', kleur: f.get('kleur') || 'ral7024',
      afwerking: f.get('afwerking') || 'standaard', montage: f.get('montage') || 'gevel',
      voorkant: f.get('voorkant') || 'open', links: f.get('links') || 'open', rechts: f.get('rechts') || 'open',
      extra: f.getAll('extra')
    };
  }
  function teken(form, c) {
    var svg = form.querySelector('[data-iso]');
    if (svg && window.tekenVeranda) window.tekenVeranda(svg, c);
  }

  /* ---------- rekenmodule op home ---------- */
  var mini = document.querySelector('[data-reken="mini"]');
  if (mini && window.TV) {
    var werkMini = function () {
      var c = lees(mini);
      mini.querySelector('#mini-b-uit').textContent = cm(c.b);
      mini.querySelector('#mini-d-uit').textContent = cm(c.d);
      rolPrijs(mini.querySelector('[data-prijs]'), window.TV.indicatie(c));
      teken(mini, c);
    };
    mini.addEventListener('input', werkMini);
    werkMini();
  }

  /* ---------- configurator ---------- */
  var conf = document.querySelector('[data-reken="vol"]');
  if (conf && window.TV) {
    var O = window.TV.opties;
    var q = new URLSearchParams(location.search);
    ['b', 'd'].forEach(function (k) {
      var v = parseInt(q.get(k), 10), r = conf.querySelector('input[name="' + k + '"]');
      if (r && v >= +r.min && v <= +r.max) { r.value = v; vulBaan(r); }
    });
    if (q.get('dak') && O.dak[q.get('dak')]) {
      var radio = conf.querySelector('input[name="dak"][value="' + q.get('dak') + '"]');
      if (radio) radio.checked = true;
    }

    /* stappen */
    var stapKnoppen = [].slice.call(conf.querySelectorAll('.stapper button'));
    var stapPanelen = [].slice.call(conf.querySelectorAll('.stap-paneel'));
    var huidig = 0;
    var naarStap = function (i, scroll) {
      huidig = Math.max(0, Math.min(stapPanelen.length - 1, i));
      stapPanelen.forEach(function (p, j) { p.classList.toggle('aan', j === huidig); });
      stapKnoppen.forEach(function (b, j) {
        if (j === huidig) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        b.classList.toggle('gedaan', j < huidig);
      });
      var vorige = conf.querySelector('[data-vorige]'), volgende = conf.querySelector('[data-volgende]');
      vorige.hidden = huidig === 0;
      volgende.hidden = huidig === stapPanelen.length - 1;
      if (scroll) conf.scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'start' });
    };
    stapKnoppen.forEach(function (b, i) { b.addEventListener('click', function () { naarStap(i); }); });
    conf.querySelector('[data-vorige]').addEventListener('click', function () { naarStap(huidig - 1, true); });
    conf.querySelector('[data-volgende]').addEventListener('click', function () { naarStap(huidig + 1, true); });
    naarStap(0);

    var uitPrijs = conf.querySelector('[data-prijs]');
    var uitNoot = conf.querySelector('[data-prijs-noot]');
    var uitLijst = conf.querySelector('[data-samenvatting]');
    var regels = function (c) {
      var r = [
        ['Maat', c.b + ' x ' + c.d + ' cm'], ['Dak', O.dak[c.dak][0]], ['Kleur', O.kleur[c.kleur][0]],
        ['Afwerking', O.afwerking[c.afwerking][0]], ['Plaatsing', O.montage[c.montage][0]],
        ['Voorkant', O.voorkant[c.voorkant][0]], ['Linkerzijde', O.zijkant[c.links][0]], ['Rechterzijde', O.zijkant[c.rechts][0]]
      ];
      if (c.extra.length) r.push(['Extra', c.extra.map(function (e) { return O.extra[e][0]; }).join(', ')]);
      return r;
    };
    var werk = function () {
      var c = lees(conf);
      conf.querySelector('#b-uit').textContent = cm(c.b);
      conf.querySelector('#d-uit').textContent = cm(c.d);
      teken(conf, c);
      var p = window.TV.indicatie(c);
      rolPrijs(uitPrijs, p);
      uitNoot.textContent = p
        ? 'Indicatie op basis van onze standaardprijzen. De definitieve prijs hoor je na het inmeten.'
        : 'Breder dan 8 meter of dieper dan 5 meter rekenen we persoonlijk voor je uit. Stuur je aanvraag gerust in.';
      uitLijst.innerHTML = regels(c).map(function (r) { return '<li><span>' + r[0] + '</span><span>' + r[1] + '</span></li>'; }).join('');
      return { c: c, p: p };
    };
    conf.addEventListener('input', werk);
    conf.addEventListener('change', werk);
    werk();

    var bericht = function () {
      var s = werk(), f = new FormData(conf);
      var t = 'Hallo Thema Veranda, ik heb mijn veranda samengesteld op de site:\n\n';
      regels(s.c).forEach(function (r) { t += r[0] + ': ' + r[1] + '\n'; });
      t += '\nIndicatie: ' + (s.p ? window.TV.euro(s.p) : 'op maat') + '\n';
      if (f.get('opmerking')) t += '\nOpmerking: ' + f.get('opmerking') + '\n';
      t += '\nNaam: ' + (f.get('naam') || '') + '\nTelefoon: ' + (f.get('telefoon') || '') + '\nPlaats: ' + (f.get('plaats') || '');
      return t;
    };
    var controleer = function () {
      var ok = true;
      ['naam', 'telefoon', 'plaats'].forEach(function (n) {
        var veld = conf.querySelector('[name="' + n + '"]'), fout = conf.querySelector('[data-fout="' + n + '"]');
        var leeg = !veld.value.trim();
        if (fout) fout.hidden = !leeg;
        veld.setAttribute('aria-invalid', String(leeg));
        if (leeg && ok) { naarStap(stapPanelen.length - 1); veld.focus(); ok = false; }
      });
      return ok;
    };
    conf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!controleer()) return;
      var via = (e.submitter && e.submitter.value) || 'whatsapp', t = bericht();
      var url = via === 'mail'
        ? 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Aanvraag veranda via de website') + '&body=' + encodeURIComponent(t)
        : WA + '?text=' + encodeURIComponent(t);
      window.open(url, via === 'mail' ? '_self' : '_blank', 'noopener');
      var bev = conf.querySelector('[data-bevestiging]');
      if (bev) { bev.hidden = false; bev.focus(); }
    });
  }

  /* ---------- contactformulier ---------- */
  var cf = document.querySelector('[data-contact]');
  if (cf) {
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(cf), ok = true;
      ['naam', 'telefoon', 'bericht'].forEach(function (n) {
        var veld = cf.querySelector('[name="' + n + '"]'), fout = cf.querySelector('[data-fout="' + n + '"]');
        var leeg = !veld.value.trim();
        if (fout) fout.hidden = !leeg;
        veld.setAttribute('aria-invalid', String(leeg));
        if (leeg && ok) { veld.focus(); ok = false; }
      });
      if (!ok) return;
      var t = 'Hallo Thema Veranda,\n\n' + f.get('bericht') + '\n\nOnderwerp: ' + f.get('onderwerp') + '\nNaam: ' + f.get('naam') + '\nTelefoon: ' + f.get('telefoon') + (f.get('plaats') ? '\nPlaats: ' + f.get('plaats') : '');
      var via = (e.submitter && e.submitter.value) || 'whatsapp';
      var url = via === 'mail'
        ? 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Vraag via de website: ' + f.get('onderwerp')) + '&body=' + encodeURIComponent(t)
        : WA + '?text=' + encodeURIComponent(t);
      window.open(url, via === 'mail' ? '_self' : '_blank', 'noopener');
      var bev = cf.querySelector('[data-bevestiging]');
      if (bev) { bev.hidden = false; bev.focus(); }
    });
  }
})();
