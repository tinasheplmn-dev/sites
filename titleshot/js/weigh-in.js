/* The Weigh-In: gym kiezen, negen vragen, de weging (voorstelling met echte
   gegevens van Google) en de uitslag. Werkt ook zonder de scan-API: dan weegt
   de voorstelling alleen de eigen antwoorden en blijven de Google-stappen op
   "niet gemeten". Niets wordt opgeslagen of verstuurd behalve de gekozen
   place_id naar de eigen scan-API. */
(function () {
  'use strict';
  var weging = document.querySelector('[data-weging]');
  if (!weging) return;

  var G = JSON.parse(document.querySelector('[data-weeg-data]').textContent);
  var T = G.t;
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var snel = /[?&]snel=1/.test(location.search);            /* voor tests: korte voorstelling */
  var tempo = snel ? 0.12 : 1;
  var vragen = [].slice.call(weging.querySelectorAll('[data-vraag]'));
  var teller = weging.querySelector('[data-weeg-teller]');
  var balkVul = weging.querySelector('[data-weeg-balk]');
  var foutje = weging.querySelector('[data-weeg-fout]');
  var veld = weging.querySelector('#w-gym');
  var lijst = weging.querySelector('#w-sug');
  var noot = weging.querySelector('[data-gymnoot]');
  var show = document.querySelector('[data-show]');
  var uitslag = document.querySelector('[data-uitslag]');
  var sectie = document.querySelector('[data-weeg-sectie]');

  function el(tag, klasse, tekst) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }
  function vul(s, waarden) { return s.replace(/\{(\w+)\}/g, function (_, k) { return waarden[k]; }); }
  function wacht(ms) { return new Promise(function (r) { setTimeout(r, ms * tempo); }); }
  function getal(n) { return String(n).replace('.', G.taal === 'nl' ? ',' : '.'); }
  function api(vraag) {
    return fetch(G.api + '?taal=' + G.taal + '&' + vraag, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function binnen(belofte, ms) {
    return Promise.race([belofte, new Promise(function (r) { setTimeout(function () { r(null); }, ms); })]);
  }

  /* ---------- gym kiezen, met suggesties van Google ---------- */
  var gekozen = null;          /* { id, naam, adres } */
  var profielP = null, siteP = null;
  var zoekTimer = null, zoekNr = 0, actief = -1;

  function sluitLijst() { lijst.hidden = true; lijst.textContent = ''; veld.setAttribute('aria-expanded', 'false'); actief = -1; }
  function kies(s) {
    gekozen = s;
    veld.value = s.naam;
    sluitLijst();
    noot.textContent = T.gekozen + ': ' + s.naam + (s.adres ? ', ' + s.adres : '');
    noot.classList.add('gevonden');
    /* de metingen starten nu al, terwijl de eigenaar de vragen beantwoordt */
    profielP = api('actie=profiel&id=' + encodeURIComponent(s.id)).then(function (p) {
      /* beelden alvast laden, zodat ze er staan als de scène begint */
      if (p) {
        (p.fotos || []).slice(0, 4).forEach(function (src) { var im = new Image(); im.referrerPolicy = 'no-referrer'; im.src = src; });
        if (p.kaart) { var k = new Image(); k.src = kaartSrc(p); }
      }
      return p;
    });
    siteP = api('actie=site&id=' + encodeURIComponent(s.id));
  }
  function toonLijst(items) {
    lijst.textContent = '';
    if (!items.length) { sluitLijst(); return; }
    items.forEach(function (s, i) {
      var li = el('li'); li.setAttribute('role', 'option'); li.id = 'w-sug-' + i;
      li.appendChild(el('strong', '', s.naam));
      if (s.adres) li.appendChild(el('span', '', s.adres));
      li.addEventListener('mousedown', function (e) { e.preventDefault(); kies(s); });
      lijst.appendChild(li);
    });
    lijst.hidden = false; veld.setAttribute('aria-expanded', 'true'); actief = -1;
    lijst._items = items;
  }
  veld.addEventListener('input', function () {
    gekozen = null; profielP = null; siteP = null;
    noot.textContent = T.kies; noot.classList.remove('gevonden');
    clearTimeout(zoekTimer);
    var q = veld.value.trim();
    if (q.length < 3) { sluitLijst(); return; }
    var nr = ++zoekNr;
    zoekTimer = setTimeout(function () {
      api('actie=suggest&q=' + encodeURIComponent(q)).then(function (d) {
        if (nr !== zoekNr || !d || document.activeElement !== veld) return;
        toonLijst(d.suggesties || []);
      });
    }, 260);
  });
  veld.addEventListener('keydown', function (e) {
    if (lijst.hidden) return;
    var opties = lijst.children;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      actief = (actief + (e.key === 'ArrowDown' ? 1 : -1) + opties.length) % opties.length;
      [].forEach.call(opties, function (o, i) { o.classList.toggle('actief', i === actief); });
      veld.setAttribute('aria-activedescendant', opties[actief].id);
    } else if (e.key === 'Enter' && actief > -1) {
      e.preventDefault(); kies(lijst._items[actief]);
    } else if (e.key === 'Escape') sluitLijst();
  });
  veld.addEventListener('blur', function () { setTimeout(sluitLijst, 120); });

  /* ---------- vragen ---------- */
  function antwoorden() {
    return vragen.map(function (g) {
      var c = g.querySelector('input:checked');
      return c ? parseInt(c.value, 10) : null;
    });
  }
  function werkBij() {
    var n = antwoorden().filter(function (a) { return a !== null; }).length;
    teller.textContent = n + ' / ' + vragen.length;
    balkVul.style.setProperty('--p', (n / vragen.length).toFixed(3));
    if (n === vragen.length && veld.value.trim()) foutje.hidden = true;
  }
  weging.addEventListener('change', werkBij);
  werkBij();

  /* ---------- de weging: voorstelling ---------- */
  var podium = show.querySelector('[data-show-podium]');
  var stappenEl = show.querySelector('[data-show-stappen]');
  var tijdEl = show.querySelector('[data-show-tijd]');
  var showBalk = show.querySelector('[data-show-balk]');
  var huidige = null;

  function scene(klasse) {
    var s = el('div', 'scene ' + klasse);
    podium.appendChild(s);
    var vorige = huidige; huidige = s;
    if (vorige) { vorige.classList.remove('aan'); vorige.classList.add('uit'); setTimeout(function () { vorige.remove(); }, 600); }
    requestAnimationFrame(function () { requestAnimationFrame(function () { s.classList.add('aan'); }); });
    return s;
  }
  function stap(i, staat) {            /* bezig | klaar | over */
    var li = stappenEl.children[i];
    if (!li) return;
    li.className = staat;
    if (staat === 'over') li.querySelector('small').textContent = T.nietGemeten;
  }
  function telOp(e, doel, duur, decimalen) {
    if (kalm || snel) { e.textContent = getal(doel.toFixed(decimalen || 0)); return; }
    var t0 = null;
    (function tik(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / duur, 1), z = 1 - Math.pow(1 - p, 3);
      e.textContent = getal((doel * z).toFixed(decimalen || 0));
      if (p < 1) requestAnimationFrame(tik);
    })(performance.now());
  }
  function sterren(n) {
    var s = el('span', 'sterren'); s.setAttribute('aria-hidden', 'true');
    s.textContent = '★★★★★'.slice(0, Math.round(n || 0));
    return s;
  }
  function meter(naam, waarde) {
    var m = el('div', 'meter');
    var ring = el('div', 'meter-ring'); var b = el('b', '', '0'); ring.appendChild(b);
    ring.classList.add(waarde >= 90 ? 'goed' : waarde >= 50 ? 'matig' : 'zwak');
    m.appendChild(ring); m.appendChild(el('span', '', naam));
    setTimeout(function () { ring.style.setProperty('--w', waarde); telOp(b, waarde, 1100); }, 250 * tempo);
    return m;
  }
  function kaartSrc(p) { return G.api + '?actie=kaart&s=2&lat=' + p.lat.toFixed(5) + '&lng=' + p.lng.toFixed(5); }
  function mercator(lat, lng, zoom) {
    var schaal = 256 * Math.pow(2, zoom), s = Math.sin(lat * Math.PI / 180);
    return { x: (lng + 180) / 360 * schaal, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * schaal };
  }

  var S = {
    intro: function (naam, p) {
      var s = scene('s-intro');
      s.appendChild(el('p', 'scene-label', T.opDeSchaal));
      s.appendChild(el('p', 'intro-naam', naam));
      if (p) {
        if (p.adres) s.appendChild(el('p', 'intro-adres', p.adres));
        var rij = el('div', 'intro-score');
        if (p.score) {
          var b = el('b', '', '0'); rij.appendChild(b); rij.appendChild(sterren(p.score));
          rij.appendChild(el('span', '', vul(T.reviews, { n: p.aantal })));
          setTimeout(function () { telOp(b, p.score, 1200, 1); }, 500 * tempo);
        } else rij.appendChild(el('span', '', T.geenReviews));
        s.appendChild(rij);
      }
    },
    reviews: function (p) {
      var s = scene('s-reviews');
      s.appendChild(el('p', 'scene-label', T.watZeZeggen));
      var rij = el('div', 'review-rij');
      p.reviews.forEach(function (r, i) {
        var k = el('article', 'review'); k.style.setProperty('--n', i);
        var kop = el('div', 'review-kop');
        kop.appendChild(el('span', 'avatar', (r.auteur || '?').charAt(0).toUpperCase()));
        var wie = el('div'); wie.appendChild(el('strong', '', r.auteur)); wie.appendChild(sterren(r.score));
        kop.appendChild(wie); kop.appendChild(el('span', 'bron', 'Google'));
        k.appendChild(kop); k.appendChild(el('p', '', r.tekst));
        rij.appendChild(k);
      });
      s.appendChild(rij);
    },
    fotos: function (p) {
      var s = scene('s-fotos');
      s.appendChild(el('p', 'scene-label', T.fotoKop));
      var stapel = el('div', 'polaroids');
      p.fotos.slice(0, 4).forEach(function (src, i) {
        var f = el('figure', 'polaroid'); f.style.setProperty('--n', i);
        var im = new Image(); im.alt = ''; im.referrerPolicy = 'no-referrer'; im.src = src;
        f.appendChild(im); stapel.appendChild(f);
      });
      s.appendChild(stapel);
      s.appendChild(el('p', 'scene-noot', vul(T.fotoTel, { n: p.fotos.length })));
    },
    kaart: function (p) {
      var s = scene('s-kaart');
      s.appendChild(el('p', 'scene-label', T.kaartKop));
      var vlak = el('div', 'kaart');
      var im = new Image(); im.alt = ''; im.src = kaartSrc(p);
      vlak.appendChild(im);
      var midden = mercator(p.lat, p.lng, p.kaart.zoom);
      p.concurrenten.forEach(function (c, i) {
        var m = mercator(c.lat, c.lng, p.kaart.zoom);
        var links = 50 + (m.x - midden.x) / p.kaart.b * 100, boven = 50 + (m.y - midden.y) / p.kaart.h * 100;
        if (links < 3 || links > 97 || boven < 6 || boven > 96) return;
        var pin = el('span', 'pin'); pin.style.left = links + '%'; pin.style.top = boven + '%'; pin.style.setProperty('--n', i + 1);
        pin.appendChild(el('i', '', c.naam.length > 22 ? c.naam.slice(0, 21) + '…' : c.naam));
        vlak.appendChild(pin);
      });
      var eigen = el('span', 'pin eigen'); eigen.style.left = '50%'; eigen.style.top = '50%'; eigen.style.setProperty('--n', 0);
      eigen.appendChild(el('i', '', T.jij)); vlak.appendChild(eigen);
      var rij2 = el('div', 'kaart-rij'); rij2.appendChild(vlak); s.appendChild(rij2);
      var rang = el('ol', 'ranglijst');
      var rijen = p.concurrenten.map(function (c) { return { naam: c.naam, score: c.score, aantal: c.aantal, plek: c.plek }; });
      if (p.plek) rijen.push({ naam: p.naam, score: p.score, aantal: p.aantal, plek: p.plek, eigen: true });
      rijen.sort(function (a, b) { return a.plek - b.plek; });
      var top = rijen.slice(0, 5);
      if (p.plek && !top.some(function (r) { return r.eigen; })) top[4] = rijen.filter(function (r) { return r.eigen; })[0];
      top.forEach(function (r, i) {
        var li = el('li', r.eigen ? 'eigen' : ''); li.style.setProperty('--n', i);
        li.appendChild(el('b', '', String(r.plek)));
        li.appendChild(el('span', '', r.naam));
        li.appendChild(el('em', '', r.score ? getal(r.score.toFixed(1)) + ' ★ · ' + r.aantal : ''));
        rang.appendChild(li);
      });
      rij2.appendChild(rang);
      s.appendChild(el('p', 'scene-noot', vul(p.plek ? T.plek : T.geenPlek, { n: p.plek, term: p.zoekterm })));
    },
    site: function (w, p) {
      var s = scene('s-site');
      s.appendChild(el('p', 'scene-label', T.siteKop + (w.host ? ' · ' + w.host : '')));
      var rij = el('div', 'site-rij');
      if (w.screenshot) {
        var tel = el('div', 'telefoon'); var im = new Image(); im.alt = ''; im.src = w.screenshot; tel.appendChild(im);
        tel.appendChild(el('span', 'scanlijn')); rij.appendChild(tel);
      }
      var kant = el('div', 'site-kant');
      if (w.scores) {
        var meters = el('div', 'meters');
        [['snelheid', 0], ['gebruik', 1], ['techniek', 2], ['vindbaar', 3]].forEach(function (k) {
          if (w.scores[k[0]] != null) meters.appendChild(meter(T.normen[k[1]], w.scores[k[0]]));
        });
        kant.appendChild(meters);
      }
      var ul = el('ul', 'vondsten');
      var regel = function (goed, tekst, n) { var li = el('li', goed ? 'ja' : 'nee', tekst); li.style.setProperty('--n', n); ul.appendChild(li); };
      if (w.proefles != null) regel(w.proefles, w.proefles ? T.proeflesJa : T.proeflesNee, 0);
      if (w.boeken != null) regel(w.boeken, w.boeken ? T.boekJa : T.boekNee, 1);
      if (w.whatsapp) regel(true, T.waJa, 2);
      if (w.social && w.social.length) regel(true, T.socialKop + ': ' + w.social.map(function (x) { return x.naam; }).join(', '), 3);
      kant.appendChild(ul); rij.appendChild(kant); s.appendChild(rij);
    },
    antwoorden: function (a) {
      var s = scene('s-antw');
      s.appendChild(el('p', 'scene-label', T.antwKop));
      var kaart = el('ol', 'scorebrief');
      a.forEach(function (w, i) {
        var li = el('li', ['nee', 'deels', 'ja'][w]); li.style.setProperty('--n', i);
        li.appendChild(el('b', '', '0' + (i + 1)));
        li.appendChild(el('span', '', G.kort[i]));
        li.appendChild(el('em', '', [T.nee, T.deels, T.ja][w]));
        kaart.appendChild(li);
      });
      s.appendChild(kaart);
    },
    jury: function () {
      var s = scene('s-jury');
      s.appendChild(el('p', 'jury-kop', T.jury));
      var d = el('div', 'jury-kaarten'); [0, 1, 2].forEach(function (i) { var k = el('span'); k.style.setProperty('--n', i); d.appendChild(k); });
      s.appendChild(d);
    }
  };

  function voorstelling(naam, a) {
    weging.hidden = true; show.hidden = false;
    sectie.classList.add('in-show');
    show.querySelector('[data-show-naam]').textContent = naam;
    stappenEl.textContent = ''; podium.textContent = ''; huidige = null;
    T.stappen.forEach(function (t) { var li = el('li'); li.appendChild(el('span', '', t)); li.appendChild(el('small', '')); stappenEl.appendChild(li); });
    show.scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'start' });
    show.focus({ preventScroll: true });

    var start = Date.now(), geschat = gekozen ? 21 : 9;
    var klok = setInterval(function () {
      var rest = Math.round(geschat - (Date.now() - start) / 1000 / (snel ? 0.12 : 1));
      tijdEl.textContent = rest > 2 ? vul(T.nog, { n: rest }) : T.klaar;
      showBalk.style.setProperty('--p', Math.min(1, (Date.now() - start) / 1000 / (snel ? 0.12 : 1) / geschat).toFixed(3));
    }, 250);

    var p = null, w = null;
    return (async function () {
      stap(0, 'bezig');
      S.intro(naam, null);
      p = profielP ? await binnen(profielP, 6000) : null;
      if (p) { S.intro(p.naam || naam, p); await wacht(3000); stap(0, 'klaar'); }
      else { await wacht(1600); stap(0, 'over'); }

      if (p && p.reviews.length) { stap(1, 'bezig'); S.reviews(p); await wacht(3800); stap(1, 'klaar'); } else stap(1, 'over');
      if (p && p.fotos.length > 1) { stap(2, 'bezig'); S.fotos(p); await wacht(3000); stap(2, 'klaar'); } else stap(2, 'over');
      if (p && p.kaart && p.concurrenten.length) { stap(3, 'bezig'); S.kaart(p); await wacht(4400); stap(3, 'klaar'); } else stap(3, 'over');

      if (siteP) {
        stap(4, 'bezig');
        w = await binnen(siteP, snel ? 30000 : Math.max(1500, 26000 - (Date.now() - start)));
      }
      if (w && w.heeftSite && (w.scores || w.proefles != null)) { S.site(w, p); await wacht(4400); stap(4, 'klaar'); } else stap(4, 'over');

      stap(5, 'bezig'); S.antwoorden(a); await wacht(2800); stap(5, 'klaar');
      stap(6, 'bezig'); S.jury(); await wacht(1500); stap(6, 'klaar');
      clearInterval(klok);
      return { p: p, w: w };
    })().catch(function () { clearInterval(klok); return { p: p, w: w }; });
  }

  /* ---------- uitslag ---------- */
  function toonUitslag(naam, a, bron) {
    var som = a.reduce(function (x, y) { return x + y; }, 0);
    var score = Math.round(som / (vragen.length * 2) * 100);
    var klasse = G.klassen[0];
    G.klassen.forEach(function (k) { if (score >= k[0]) klasse = k; });
    uitslag.querySelector('[data-uitslag-gym]').textContent = naam;
    uitslag.querySelector('[data-klasse]').textContent = klasse[1];
    uitslag.querySelector('[data-oordeel]').textContent = klasse[2];

    var tape = uitslag.querySelector('[data-tape]');
    tape.textContent = ''; tape.hidden = true;
    var p = bron.p, w = bron.w;
    var tegel = function (kop, groot, klein) {
      var t = el('div', 'tape-tegel'); t.appendChild(el('span', '', kop)); t.appendChild(el('b', '', groot)); t.appendChild(el('small', '', klein || '')); tape.appendChild(t);
    };
    if (p) {
      if (p.score) tegel(T.tape.score, getal(p.score.toFixed(1)) + ' ★', vul(T.tape.uit, { n: p.aantal }));
      if (p.zoekterm) tegel(T.tape.kaart, p.plek ? '#' + p.plek : T.tape.buiten, vul(T.tape.voor, { term: p.zoekterm }));
      var buur = p.concurrenten.slice().sort(function (x, y) { return (y.score || 0) * Math.log(2 + y.aantal) - (x.score || 0) * Math.log(2 + x.aantal); })[0];
      if (buur) tegel(T.tape.buur, buur.score ? getal(buur.score.toFixed(1)) + ' ★' : '', buur.naam + (buur.aantal ? ' · ' + buur.aantal + ' reviews' : ''));
    }
    if (w && w.scores && w.scores.snelheid != null) tegel(T.tape.snel, String(w.scores.snelheid), T.tape.van100);
    if (tape.children.length) tape.hidden = false;

    var kansen = a.map(function (v, i) { return { w: v, i: i }; })
      .filter(function (k) { return k.w < 2; })
      .sort(function (x, y) { return x.w - y.w || x.i - y.i; }).slice(0, 3);
    var ul = uitslag.querySelector('[data-kansen]');
    ul.textContent = '';
    if (!kansen.length) ul.appendChild(el('li', 'geen', G.geenKansen));
    kansen.forEach(function (k, n) {
      var g = G.kansen[k.i];
      var li = el('li'), link = el('a'); link.href = g.l;
      link.appendChild(el('b', '', '0' + (n + 1)));
      var mid = el('div'); mid.appendChild(el('strong', '', g.t)); mid.appendChild(el('span', '', g.p)); link.appendChild(mid);
      var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), pad = document.createElementNS(ns, 'path');
      svg.setAttribute('viewBox', '0 0 48 48'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '3'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
      pad.setAttribute('d', 'M8 24h30M27 13l11 11-11 11'); svg.appendChild(pad); link.appendChild(svg);
      li.appendChild(link); ul.appendChild(li);
    });

    show.hidden = true; uitslag.hidden = false;
    sectie.classList.remove('in-show');
    telOp(uitslag.querySelector('[data-score]'), score, 1200);
    uitslag.focus({ preventScroll: true });
    uitslag.scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'start' });
  }

  weging.addEventListener('submit', function (e) {
    e.preventDefault();
    var naam = veld.value.trim(), a = antwoorden(), open = a.indexOf(null);
    if (!naam) { foutje.textContent = T.foutGym; foutje.hidden = false; veld.focus(); return; }
    if (open !== -1) {
      foutje.textContent = T.foutVragen; foutje.hidden = false;
      vragen[open].scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    voorstelling(gekozen ? gekozen.naam : naam, a).then(function (bron) { toonUitslag(gekozen ? gekozen.naam : naam, a, bron); });
  });

  uitslag.querySelector('[data-opnieuw]').addEventListener('click', function () {
    weging.reset(); gekozen = null; profielP = null; siteP = null;
    noot.textContent = T.kies; noot.classList.remove('gevonden');
    werkBij();
    uitslag.hidden = true; weging.hidden = false;
    weging.scrollIntoView({ behavior: kalm ? 'auto' : 'smooth', block: 'start' });
  });
})();
