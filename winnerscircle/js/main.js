/* Site-eigen gedrag bovenop motion.js. Alles fail-open: zonder JavaScript
   staat het rooster, de tekst en de poster van elke video er gewoon. */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobiel = window.matchMedia('(max-width: 860px)').matches;
  var dagen = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var maanden = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

  /* ---------- sluitknop van het mobiele menu (geen inline script, vanwege de CSP) ---------- */
  var sluit = document.querySelector('[data-menusluit]');
  if (sluit) sluit.addEventListener('click', function () { var k = document.querySelector('[data-menuknop]'); if (k) k.click(); });

  /* ---------- rooster: eerstvolgende lessen ---------- */
  var rooster = [];
  try { rooster = JSON.parse(document.body.getAttribute('data-rooster') || '[]'); } catch (e) { rooster = []; }
  function min(t) { var d = t.split(':'); return +d[0] * 60 + +d[1]; }
  /* geeft de eerstvolgende n lessen met datum, vanaf nu */
  function volgende(n) {
    var uit = [], nu = new Date(), m = nu.getHours() * 60 + nu.getMinutes();
    for (var i = 0; i < 21 && uit.length < n; i++) {
      var dat = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + i);
      rooster.filter(function (r) { return r.d === dat.getDay(); }).forEach(function (r) {
        if (uit.length >= n) return;
        if (i === 0 && m >= min(r.e)) return;
        uit.push({ r: r, datum: dat, i: i, bezig: i === 0 && m >= min(r.s) });
      });
    }
    return uit;
  }
  window.wcVolgende = volgende;
  window.wcDatum = function (d) { return dagen[d.getDay()] + ' ' + d.getDate() + ' ' + maanden[d.getMonth()]; };

  var chip = document.querySelector('[data-volgende-les] .tekst');
  if (chip && rooster.length) {
    var beste = volgende(1)[0];
    if (beste) {
      var wanneer = beste.i === 0 ? 'vandaag' : beste.i === 1 ? 'morgen' : dagen[beste.r.d];
      chip.textContent = beste.bezig
        ? 'Nu bezig: ' + beste.r.les + ', tot ' + beste.r.e
        : 'Volgende les: ' + wanneer + ' ' + beste.r.s + ', ' + beste.r.les.toLowerCase();
    }
  }
  /* horizontaal centreren in een carrousel zonder de pagina zelf te verschuiven */
  function centreer(bak, el, zacht) {
    if (!bak || !el) return;
    var links = el.offsetLeft - (bak.clientWidth - el.offsetWidth) / 2;
    bak.scrollTo({ left: Math.max(0, links), behavior: zacht ? 'smooth' : 'auto' });
  }
  var vandaag = document.querySelector('[data-week] .kolom[data-dag="' + new Date().getDay() + '"]');
  if (vandaag) {
    vandaag.classList.add('vandaag');
    if (mobiel) centreer(vandaag.parentElement, vandaag, false);
  }

  /* ---------- ring-opening: vangnet, na 1,6 s staat het beeld hoe dan ook vol ---------- */
  var film = document.querySelector('[data-ring-open]');
  if (film) setTimeout(function () { film.classList.add('open'); }, 1600);

  /* ---------- hero-video: pas laden na de eerste tekening, kleiner op mobiel ---------- */
  var hv = document.querySelector('.hero video');
  if (hv && !kalm) {
    var laad = function () {
      hv.src = (mobiel && hv.dataset.bronKlein) ? hv.dataset.bronKlein : hv.dataset.bronGroot;
      hv.preload = 'auto';
      hv.play().catch(function () {});
    };
    if (document.readyState === 'complete') setTimeout(laad, 300);
    else window.addEventListener('load', function () { setTimeout(laad, 300); });
  }

  /* ---------- collagevideo's: op desktop spelen in beeld, op mobiel alleen de poster ---------- */
  var vids = document.querySelectorAll('video[data-speel]');
  if (vids.length && 'IntersectionObserver' in window && !kalm && !mobiel) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: .2 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- manifest: woorden lichten op terwijl je scrolt ---------- */
  var q = document.querySelector('[data-woorden]');
  if (q && !kalm) {
    var woorden = [];
    [].slice.call(q.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { q.insertBefore(document.createTextNode(w), n); return; }
          var s = document.createElement('span'); s.textContent = w; q.insertBefore(s, n); woorden.push(s);
        });
        q.removeChild(n);
      } else if (n.nodeType === 1) {
        var tekst = n.textContent; n.textContent = '';
        tekst.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { n.appendChild(document.createTextNode(w)); return; }
          var s = document.createElement('span'); s.className = 'accent'; s.textContent = w; n.appendChild(s); woorden.push(s);
        });
        n.classList.remove('accent');
      }
    });
    var tik = false;
    var update = function () {
      tik = false;
      var r = q.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .55)));
      var n = Math.round(p * woorden.length);
      woorden.forEach(function (w, i) { w.classList.toggle('aan', i < n); });
    };
    window.addEventListener('scroll', function () { if (!tik) { tik = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  } else if (q) {
    q.querySelectorAll('span').forEach(function (s) { s.classList.add('aan'); });
  }

  /* ---------- reviewcarrousel ---------- */
  var car = document.querySelector('[data-carrousel]');
  if (car) {
    var stap = function (r) { var k = car.firstElementChild; car.scrollBy({ left: r * (k ? k.getBoundingClientRect().width + 16 : 300), behavior: 'smooth' }); };
    var v = document.querySelector('[data-vorige]'), n2 = document.querySelector('[data-volgende]');
    if (v) v.addEventListener('click', function () { stap(-1); });
    if (n2) n2.addEventListener('click', function () { stap(1); });
  }

  /* ---------- tarievenschuif: welk plan past bij hoe vaak je traint ---------- */
  var schuif = document.querySelector('[data-tariefschuif]');
  var tarieven = document.querySelector('.rooster .tarieven');
  if (schuif && tarieven) {
    var kies = function () {
      var w = schuif.querySelector('input:checked');
      tarieven.classList.toggle('gekozen', !!w);
      tarieven.querySelectorAll('.tarief').forEach(function (t) { t.classList.toggle('past', !!w && t.dataset.plan === w.value); });
      var eerste = tarieven.querySelector('.tarief.past');
      if (eerste && mobiel) centreer(tarieven, eerste, true);
    };
    schuif.addEventListener('change', kies);
    kies();
  }

  /* ---------- keuzehulp: op mobiel ingeklapt tot je erop tikt ---------- */
  var khKnop = document.querySelector('[data-alleen-mobiel]');
  if (khKnop && mobiel) { var inh = document.getElementById(khKnop.getAttribute('aria-controls')); if (inh) inh.hidden = true; }

  /* ---------- keuzehulp: drie vragen, één advies ---------- */
  var kh = document.querySelector('[data-keuzehulp]');
  if (kh) {
    var kop = kh.querySelector('[data-kh-kop]'), tekst = kh.querySelector('[data-kh-tekst]'), knop = kh.querySelector('[data-kh-knop]');
    var adviseer = function () {
      var g = function (n) { var el = kh.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };
      var doel = g('kh-doel'), wie = g('kh-wie'), vaak = g('kh-vaak');
      var a;
      if (wie === 'duo') a = { k: 'Duo training', t: 'Samen trainen houdt je scherp en gemotiveerd. € 60 per sessie voor jullie twee, op een moment dat jullie past.', h: 'proefles.html#prive', l: 'Vraag een duo training aan' };
      else if (wie === 'groep' && doel === 'techniek') a = { k: 'Small group, of bokszaktraining', t: 'Met je eigen groepje (3 tot 6) krijg je de meeste technische aandacht. Liever openbaar? In de bokszaktraining zijn er nooit meer dan 8 mensen en kijken de trainers mee.', h: 'proefles.html', l: 'Plan je gratis proefles' };
      else if (wie === 'groep') a = vaak === '3'
        ? { k: 'Bokszaktraining, Unlimited', t: 'Drie keer of vaker per week: Unlimited (€ 54 per maand) of Unlimited 6 maanden (€ 49) is dan het voordeligst.', h: 'proefles.html', l: 'Probeer een les gratis' }
        : { k: 'Bokszaktraining, 8x per maand', t: 'Eén à twee keer per week in een groep van maximaal 8. Met 8x per maand (€ 39) zit je goed; train je minder, dan is de strippenkaart handig.', h: 'proefles.html', l: 'Probeer een les gratis' };
      else if (doel === 'techniek') a = { k: 'Personal training', t: 'Eén op één leer je het snelst: elke stoot wordt gezien en bijgestuurd. € 50 per sessie.', h: 'proefles.html#prive', l: 'Vraag een privétraining aan' };
      else if (doel === 'stok') a = { k: 'Personal training, of een vast lesmoment', t: 'Een afspraak met je trainer is de beste stok achter de deur. Liever in de groep? Kies dan één vaste les per week in het rooster.', h: 'proefles.html', l: 'Plan je gratis proefles' };
      else a = vaak === '1'
        ? { k: 'Bokszaktraining', t: 'Fitter worden met boksen en cardio in één les van 45 minuten, in een groep van maximaal 8. Begin met een gratis proefles.', h: 'proefles.html', l: 'Probeer een les gratis' }
        : { k: 'Bokszaktraining, Unlimited', t: 'Vaker dan één keer per week? Met Unlimited train je zo vaak als je wilt voor € 54 per maand.', h: 'proefles.html', l: 'Probeer een les gratis' };
      kop.textContent = a.k; tekst.textContent = a.t; knop.href = a.h;
      knop.firstChild.textContent = a.l + ' ';
    };
    kh.addEventListener('change', adviseer);
    adviseer();
  }

  /* ---------- ankerbalk en actiebalk volgen de sectie ---------- */
  var ankers = document.querySelectorAll('[data-ankerbalk] a');
  var ctaKnop = document.querySelector('[data-cta-knop]');
  var secties = [].slice.call(document.querySelectorAll('main section[id]'));
  if (secties.length && 'IntersectionObserver' in window) {
    var actief = null;
    var zet = function (sec) {
      if (sec === actief) return;
      actief = sec;
      ankers.forEach(function (a) { a.classList.toggle('actief', a.getAttribute('href') === '#' + sec.id); });
      var balk = document.querySelector('[data-ankerbalk]');
      var link = balk && balk.querySelector('a.actief');
      if (link && mobiel) centreer(balk, link, true);
      if (ctaKnop) {
        var t = sec.getAttribute('data-cta') || 'Gratis proefles';
        var h = sec.getAttribute('data-cta-href') || 'proefles.html';
        if (ctaKnop.querySelector('span').textContent !== t) {
          ctaKnop.classList.add('wissel');
          setTimeout(function () { ctaKnop.querySelector('span').textContent = t; ctaKnop.href = h; ctaKnop.classList.remove('wissel'); }, 200);
        }
      }
    };
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) zet(e.target); });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    secties.forEach(function (s) { so.observe(s); });
  }

  /* ---------- proefles-pagina: eerstvolgende lessen kiezen ---------- */
  var lessenLijst = document.querySelector('[data-volgende-lessen]');
  var f = document.querySelector('[data-intake]');
  if (lessenLijst && rooster.length) {
    volgende(3).forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lesknop';
      var wanneer = l.i === 0 ? 'Vandaag' : l.i === 1 ? 'Morgen' : dagen[l.datum.getDay()].charAt(0).toUpperCase() + dagen[l.datum.getDay()].slice(1);
      b.innerHTML = '<span class="wanneer">' + wanneer + ' ' + l.datum.getDate() + ' ' + maanden[l.datum.getMonth()] + '</span><span class="tijd">' + l.r.s + '</span><span class="les">' + l.r.les + '</span><span class="kies">Deze wil ik proberen</span>';
      b.addEventListener('click', function () {
        lessenLijst.querySelectorAll('.lesknop').forEach(function (x) { x.classList.remove('gekozen'); });
        b.classList.add('gekozen');
        if (!f) return;
        var les = f.elements.les;
        var y = l.datum.getFullYear(), mo = ('0' + (l.datum.getMonth() + 1)).slice(-2), da = ('0' + l.datum.getDate()).slice(-2);
        les.value = dagen[l.datum.getDay()] + ' ' + l.datum.getDate() + ' ' + maanden[l.datum.getMonth()] + ' ' + l.r.s + ', ' + l.r.les;
        les.dataset.start = y + mo + da + 'T' + l.r.s.replace(':', '') + '00';
        les.dataset.eind = y + mo + da + 'T' + l.r.e.replace(':', '') + '00';
        var groep = f.querySelector('input[name="vorm"][value="Openbare groepsles"]');
        if (groep) groep.checked = true;
        var kies = f.querySelector('[data-gekozen-les]');
        if (kies) { kies.hidden = false; kies.querySelector('strong').textContent = les.value; }
        f.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () { f.elements.voornaam.focus({ preventScroll: true }); }, 500);
      });
      lessenLijst.appendChild(b);
    });
  }

  /* ---------- proefles-formulier: bericht klaarzetten in mail of WhatsApp ---------- */
  if (f) {
    var g = function (n) { var el = f.elements[n]; return el ? (el.value || '').trim() : ''; };
    var maak = function () {
      var doel = f.querySelector('input[name="doel"]:checked');
      var vorm = f.querySelector('input[name="vorm"]:checked');
      return 'Hoi Winners Circle,%0A%0AIk wil graag beginnen.%0A' +
        'Naam: ' + encodeURIComponent(g('voornaam') + ' ' + g('achternaam')) + '%0A' +
        'E-mail: ' + encodeURIComponent(g('email')) + '%0A' +
        'Telefoon: ' + encodeURIComponent(g('telefoon')) + '%0A' +
        'Mijn doel: ' + encodeURIComponent(doel ? doel.value : '') + '%0A' +
        'Trainen met: ' + encodeURIComponent(vorm ? vorm.value : '') +
        (g('les') ? '%0ALes die ik wil proberen: ' + encodeURIComponent(g('les')) : '');
    };
    var check = function () {
      /* honeypot: een echt mens laat dit veld leeg */
      if (g('website')) return false;
      var ok = true;
      ['voornaam', 'email'].forEach(function (n) {
        var el = f.elements[n], fout = f.querySelector('[data-fout="' + n + '"]');
        var goed = el.value.trim() && (n !== 'email' || /\S+@\S+\.\S+/.test(el.value));
        if (fout) fout.hidden = !!goed;
        el.setAttribute('aria-invalid', goed ? 'false' : 'true');
        if (!goed) ok = false;
      });
      return ok;
    };
    var klaar = function () {
      f.hidden = true;
      var b = document.querySelector('[data-bedankt]');
      b.hidden = false;
      var ics = b.querySelector('[data-ics]');
      var les = f.elements.les;
      if (ics && les && les.dataset.start) {
        var inhoud = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Winners Circle//Proefles//NL', 'BEGIN:VEVENT',
          'UID:' + les.dataset.start + '@winnerscirclegym.nl', 'DTSTAMP:' + les.dataset.start,
          'DTSTART;TZID=Europe/Amsterdam:' + les.dataset.start, 'DTEND;TZID=Europe/Amsterdam:' + les.dataset.eind,
          'SUMMARY:Proefles Winners Circle', 'LOCATION:Bilderdijkstraat 20\\, 5216 JZ \'s-Hertogenbosch',
          'DESCRIPTION:' + les.value.replace(/,/g, '\\,') + '. Kom in sportkleding\\, neem water mee.',
          'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
        ics.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(inhoud);
        ics.download = 'proefles-winners-circle.ics';
        ics.hidden = false;
      }
      b.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check()) return;
      window.location.href = 'mailto:info@winnerscirclegym.nl?subject=' + encodeURIComponent('Aanmelding proefles') + '&body=' + maak();
      klaar();
    });
    var wa = f.querySelector('[data-wa]');
    if (wa) wa.addEventListener('click', function () {
      if (!check()) return;
      window.open('https://wa.me/31620390657?text=' + maak(), '_blank', 'noopener');
      klaar();
    });
  }
})();
