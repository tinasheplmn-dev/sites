/* Smartersoft — gedeelde interactie & motion
   Signatuur: het levende systeemdiagram. Canvas-diagrammen met
   pakketjes die technisch correcte routes afleggen, een scroll-
   route langs de pagina, boot-opening (1x per sessie), reveals
   en een typende statusregel. Progressive enhancement: alles
   werkt zonder JS; effecten uit bij reduced motion en in
   capture-context (webdriver / verborgen tab) zodat SEO en
   screenshots de volledige inhoud zien. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var capture = navigator.webdriver || document.visibilityState === 'hidden';
  if (capture) document.body.classList.add('capture');
  var mobiel = window.matchMedia('(max-width: 768px)').matches;

  /* ---------- opening: boot-sequence, 1x per sessie ---------- */
  (function opening() {
    var el = document.getElementById('opening');
    if (!el) return;
    var klaar = false;
    function weg() {
      if (klaar) return; klaar = true;
      el.classList.add('weg');
      document.body.classList.add('onthullen');
      setTimeout(function () { el.remove(); }, 800);
    }
    if (capture || reducedMotion || sessionStorage.getItem('ss-open')) {
      el.remove();
      document.body.classList.add('onthullen');
      return;
    }
    sessionStorage.setItem('ss-open', '1');
    var regels = el.querySelectorAll('.opening-regel');
    regels.forEach(function (r, i) {
      setTimeout(function () { r.classList.add('zichtbaar'); }, 120 + i * 260);
    });
    setTimeout(weg, 120 + regels.length * 260 + 500);
    el.addEventListener('click', weg);
  })();
  if (!document.getElementById('opening')) document.body.classList.add('onthullen');

  /* ---------- header verbergen bij scrollen ---------- */
  (function header() {
    var kop = document.querySelector('.site-header');
    if (!kop) return;
    var vorige = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > 140 && y > vorige && !document.body.classList.contains('menu-open')) kop.classList.add('verborgen');
      else kop.classList.remove('verborgen');
      vorige = y;
    }, { passive: true });
  })();

  /* ---------- mobiel menu ---------- */
  (function menu() {
    var knop = document.querySelector('.menu-knop');
    var doek = document.querySelector('.menu-doek');
    if (!knop || !doek) return;
    knop.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      knop.setAttribute('aria-expanded', open ? 'true' : 'false');
      knop.querySelector('.menu-label').textContent = open ? 'sluit' : 'menu';
      doek.querySelectorAll('nav a').forEach(function (a, i) {
        a.style.transitionDelay = open ? (0.1 + i * 0.05) + 's' : '0s';
      });
    });
    if (location.hash === '#menu-open') knop.click(); /* dev-aid: menu headless bekijken */
    doek.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        knop.setAttribute('aria-expanded', 'false');
        knop.querySelector('.menu-label').textContent = 'menu';
      });
    });
  })();

  /* ---------- reveals ---------- */
  (function reveals() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (capture || reducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('zichtbaar'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('zichtbaar'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- typende statusregel (hero) ---------- */
  (function statusregel() {
    var el = document.querySelector('.hero-status');
    if (!el) return;
    var regels = JSON.parse(el.getAttribute('data-regels') || '[]');
    if (capture || reducedMotion) {
      el.innerHTML = regels.map(function (r) { return '<span class="regel">' + r + '</span>'; }).join('');
      return;
    }
    el.innerHTML = '';
    var ri = 0;
    function typRegel() {
      if (ri >= regels.length) return;
      var span = document.createElement('span');
      span.className = 'regel';
      el.appendChild(span);
      var vol = regels[ri];
      /* typ zonder de html-tags mee te typen: eerst platte tekst, dan html */
      var plat = vol.replace(/<[^>]+>/g, '');
      var ci = 0;
      var cursor = document.createElement('span');
      cursor.className = 'cursor';
      span.after(cursor);
      (function tik() {
        ci++;
        span.textContent = plat.slice(0, ci);
        if (ci < plat.length) setTimeout(tik, 18 + Math.random() * 30);
        else {
          span.innerHTML = vol;
          ri++;
          if (ri < regels.length) setTimeout(function () { cursor.remove(); typRegel(); }, 420);
        }
      })();
    }
    setTimeout(typRegel, sessionStorage.getItem('ss-open') && !document.getElementById('opening') ? 700 : 1900);
  })();

  /* ---------- scroll-voortgang + route-rail ---------- */
  (function route() {
    var voortgang = document.querySelector('.scroll-voortgang');
    var rail = document.querySelector('.route-rail');
    var haltes = [];
    if (rail) {
      var spoor = rail.querySelector('.spoor');
      var secties = document.querySelectorAll('[data-halte]');
      secties.forEach(function (s) {
        var dot = document.createElement('span');
        dot.className = 'halte';
        dot.innerHTML = '<span class="tip">' + s.getAttribute('data-halte') + '</span>';
        spoor.appendChild(dot);
        haltes.push({ el: s, dot: dot });
      });
    }
    function meet() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var p = docH > 0 ? window.scrollY / docH : 0;
      if (voortgang) voortgang.style.width = (p * 100) + '%';
      if (rail) {
        rail.querySelector('.vulling').style.height = (p * 100) + '%';
        rail.querySelector('.pakket').style.top = (p * 100) + '%';
        haltes.forEach(function (h) {
          var top = h.el.getBoundingClientRect().top + window.scrollY;
          var hp = docH > 0 ? Math.min(1, Math.max(0, (top - window.innerHeight * 0.4) / docH)) : 0;
          h.dot.style.top = (hp * 100) + '%';
          h.dot.classList.toggle('actief', p >= hp - 0.01);
        });
      }
      raf = null;
    }
    var raf = null;
    function vraag() { if (!raf) raf = requestAnimationFrame(meet); }
    window.addEventListener('scroll', vraag, { passive: true });
    window.addEventListener('resize', vraag);
    meet();
  })();

  /* ---------- magnetische knoppen (desktop) ---------- */
  (function magnetisch() {
    if (mobiel || reducedMotion || capture) return;
    document.querySelectorAll('.knop').forEach(function (k) {
      k.addEventListener('pointermove', function (e) {
        var r = k.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        k.style.transform = 'translate(' + dx * 6 + 'px,' + dy * 5 + 'px)';
      });
      k.addEventListener('pointerleave', function () { k.style.transform = ''; });
    });
  })();

  /* ============================================================
     Diagram-engine: levend systeemdiagram op canvas.
     Coördinaten in een 100 × H eenhedenvlak, geschaald naar het
     element. Pakketjes reizen over orthogonale routes; bij
     aankomst een pulsring. Muis licht het dichtstbijzijnde
     knooppunt op. Pauzeert buiten beeld.
     ============================================================ */
  var INKT = '#14181D', INKT2 = '#3B424B', INKT3 = '#6C7481',
      PAPIER = '#F7F5F0', KAART = '#FCFBF7', LIJN = '#CDC7B7',
      ROOD = '#E23B24', GROEN = '#177A54';

  function Diagram(canvas, spec) {
    var ctx = canvas.getContext('2d');
    var W, H, schaal, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var muis = null;
    var pakketten = [];
    var pulsen = [];
    var t0 = performance.now(), zichtbaar = true, raf = null;
    var nodeMap = {};
    spec.nodes.forEach(function (n) { nodeMap[n.id] = n; });

    function maat() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      schaal = Math.min(W / 100, H / spec.h);
    }

    function px(p) {
      /* centreer het eenhedenvlak in het element */
      return {
        x: (W - 100 * schaal) / 2 + p[0] * schaal,
        y: (H - spec.h * schaal) / 2 + p[1] * schaal
      };
    }

    function routePunten(edge) {
      var van = nodeMap[edge.van], naar = nodeMap[edge.naar];
      var pts = [[van.x, van.y]];
      (edge.via || []).forEach(function (v) { pts.push(v); });
      pts.push([naar.x, naar.y]);
      return pts;
    }

    function routeLengte(pts) {
      var L = 0;
      for (var i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      return L;
    }

    function puntOpRoute(pts, d) {
      for (var i = 1; i < pts.length; i++) {
        var seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (d <= seg) {
          var f = seg === 0 ? 0 : d / seg;
          return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
        }
        d -= seg;
      }
      return pts[pts.length - 1];
    }

    /* pakketjes plannen */
    spec.edges.forEach(function (e, i) {
      e._pts = routePunten(e);
      e._len = routeLengte(e._pts);
      e._volgende = 600 + i * 700 + Math.floor(e._len * 8);
    });

    function spawn(e) {
      pakketten.push({ e: e, d: 0, snelheid: (e.snelheid || 22) });
    }

    function tekenNode(n, tijd) {
      var p = px([n.x, n.y]);
      var fokus = 0;
      if (muis) {
        var afst = Math.hypot(muis.x - p.x, muis.y - p.y);
        fokus = Math.max(0, 1 - afst / (90));
      }
      ctx.save();
      if (n.vorm === 'punt') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2 * schaalF() + fokus * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = n.accent ? ROOD : INKT;
        ctx.fill();
      } else {
        var bw = (n.w || 20) * schaal, bh = (n.hh || 9) * schaal;
        var x = p.x - bw / 2, y = p.y - bh / 2, r = 5 * schaalF();
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, r);
        ctx.fillStyle = n.accent ? INKT : KAART;
        ctx.fill();
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = fokus > 0.25 ? ROOD : INKT2;
        ctx.stroke();
        if (fokus > 0.25) {
          ctx.beginPath();
          ctx.roundRect(x - 4, y - 4, bw + 8, bh + 8, r + 4);
          ctx.strokeStyle = 'rgba(226,59,36,' + (0.35 * fokus) + ')';
          ctx.stroke();
        }
        /* schild-icoon */
        if (n.icoon === 'schild') {
          var ix = x + bw * 0.14, iy = p.y;
          ctx.beginPath();
          var s = Math.min(bh * 0.3, 10);
          ctx.moveTo(ix, iy - s);
          ctx.lineTo(ix + s * 0.9, iy - s * 0.55);
          ctx.lineTo(ix + s * 0.9, iy + s * 0.25);
          ctx.quadraticCurveTo(ix + s * 0.9, iy + s * 0.85, ix, iy + s);
          ctx.quadraticCurveTo(ix - s * 0.9, iy + s * 0.85, ix - s * 0.9, iy + s * 0.25);
          ctx.lineTo(ix - s * 0.9, iy - s * 0.55);
          ctx.closePath();
          ctx.strokeStyle = n.accent ? PAPIER : ROOD;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.fillStyle = n.accent ? PAPIER : INKT;
        ctx.font = '500 ' + Math.max(9, 10.5 * schaalF()) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = n.sub ? 'bottom' : 'middle';
        var tx = p.x + (n.icoon === 'schild' ? bw * 0.07 : 0);
        ctx.fillText(n.label, tx, n.sub ? p.y - 0.5 : p.y + 1);
        if (n.sub) {
          ctx.fillStyle = n.accent ? 'rgba(247,245,240,0.55)' : INKT3;
          ctx.font = Math.max(7.5, 8.5 * schaalF()) + 'px "JetBrains Mono", monospace';
          ctx.textBaseline = 'top';
          ctx.fillText(n.sub, tx, p.y + 1.5);
        }
      }
      ctx.restore();
    }

    function schaalF() { return Math.max(0.7, Math.min(1.15, schaal / 6.2)); }

    function teken(tijd) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      /* verbindingen */
      spec.edges.forEach(function (e) {
        ctx.beginPath();
        e._pts.forEach(function (pt, i) {
          var p = px(pt);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = LIJN;
        ctx.lineWidth = 1.1;
        ctx.stroke();
        if (e.label) {
          var m = px(puntOpRoute(e._pts, e._len * (e.labelPos || 0.5)));
          ctx.fillStyle = INKT3;
          ctx.font = Math.max(8, 9 * schaalF()) + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(e.label, m.x, m.y - 4);
        }
      });

      /* pakketjes */
      for (var i = pakketten.length - 1; i >= 0; i--) {
        var pk = pakketten[i];
        pk.d += pk.snelheid / 60;
        if (pk.d >= pk.e._len) {
          pulsen.push({ p: pk.e._pts[pk.e._pts.length - 1], t: tijd, ok: pk.e.ok });
          pakketten.splice(i, 1);
          continue;
        }
        var pos = px(puntOpRoute(pk.e._pts, pk.d));
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = ROOD;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(226,59,36,0.18)';
        ctx.fill();
      }

      /* pulsringen bij aankomst */
      for (var j = pulsen.length - 1; j >= 0; j--) {
        var pu = pulsen[j];
        var lt = (tijd - pu.t) / 700;
        if (lt >= 1) { pulsen.splice(j, 1); continue; }
        var pp = px(pu.p);
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 6 + lt * 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + (pu.ok ? '23,122,84' : '226,59,36') + ',' + (0.5 * (1 - lt)) + ')';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        if (pu.ok && lt < 0.75) {
          ctx.fillStyle = GROEN;
          ctx.font = '500 ' + Math.max(8, 9 * schaalF()) + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('200', pp.x, pp.y - 12 - lt * 6);
        }
      }

      /* nodes bovenop */
      spec.nodes.forEach(function (n) { tekenNode(n, tijd); });
      ctx.restore();
    }

    function loop(tijd) {
      spec.edges.forEach(function (e) {
        if (tijd - t0 > e._volgende) {
          spawn(e);
          e._volgende += (e.elke || 3200) + Math.random() * 900;
        }
      });
      teken(tijd);
      if (zichtbaar && !capture && !reducedMotion) raf = requestAnimationFrame(loop);
      else raf = null;
    }

    maat();
    window.addEventListener('resize', function () { maat(); teken(performance.now()); });

    if (!mobiel) {
      canvas.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        muis = { x: e.clientX - r.left, y: e.clientY - r.top };
      });
      canvas.addEventListener('pointerleave', function () { muis = null; });
    }

    if (capture || reducedMotion) {
      /* één statisch frame met wat pakketjes halverwege */
      spec.edges.forEach(function (e) { pakketten.push({ e: e, d: e._len * 0.55, snelheid: 0 }); });
      teken(performance.now());
      return;
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        zichtbaar = en[0].isIntersecting;
        if (zichtbaar && !raf) raf = requestAnimationFrame(loop);
      }, { threshold: 0.05 }).observe(canvas);
    }
    raf = requestAnimationFrame(loop);
  }

  /* ---------- diagram-specs per pagina ---------- */
  var SPECS = {
    home: {
      h: 82,
      nodes: [
        { id: 'client', x: 16, y: 14, w: 24, hh: 11, label: 'client', sub: 'web · app' },
        { id: 'idp', x: 62, y: 14, w: 30, hh: 11, label: 'entra id', sub: 'OAuth2 / OIDC', icoon: 'schild' },
        { id: 'api', x: 38, y: 44, w: 30, hh: 11, label: 'api', sub: 'dotnet · REST', accent: true },
        { id: 'graph', x: 80, y: 44, w: 26, hh: 11, label: 'graph api', sub: 'microsoft 365' },
        { id: 'db', x: 20, y: 70, w: 22, hh: 10, label: 'data', sub: 'sql · blob' },
        { id: 'devops', x: 66, y: 70, w: 32, hh: 10, label: 'azure devops', sub: 'build → deploy' }
      ],
      edges: [
        { van: 'client', naar: 'idp', label: 'POST /token', elke: 4200, snelheid: 20 },
        { van: 'idp', naar: 'api', via: [[62, 30], [38, 30]], label: 'JWT', labelPos: 0.72, elke: 4200, snelheid: 20, ok: true },
        { van: 'api', naar: 'graph', via: [[80, 44]], label: 'GET /users', elke: 5200, snelheid: 24 },
        { van: 'api', naar: 'db', via: [[20, 44]], elke: 4600, snelheid: 22, ok: true },
        { van: 'devops', naar: 'api', via: [[66, 57], [38, 57]], label: 'release', labelPos: 0.35, elke: 6400, snelheid: 26 }
      ]
    },
    api: {
      h: 74,
      nodes: [
        { id: 'jullie', x: 17, y: 37, w: 26, hh: 12, label: 'jullie app', sub: 'de bron' },
        { id: 'api', x: 50, y: 37, w: 26, hh: 12, label: 'api', sub: 'OpenAPI · JWT', accent: true },
        { id: 'partner', x: 84, y: 12, w: 24, hh: 10, label: 'partner', sub: 'integratie' },
        { id: 'mobiel', x: 84, y: 37, w: 24, hh: 10, label: 'mobiele app', sub: 'iOS · Android' },
        { id: 'koppel', x: 84, y: 62, w: 24, hh: 10, label: 'koppeling', sub: 'crm · erp' }
      ],
      edges: [
        { van: 'jullie', naar: 'api', label: 'data', elke: 3800, snelheid: 20 },
        { van: 'api', naar: 'partner', via: [[68, 37], [68, 12]], label: 'GET /v1', labelPos: 0.6, elke: 4400, snelheid: 22, ok: true },
        { van: 'api', naar: 'mobiel', label: 'JSON', elke: 3600, snelheid: 24, ok: true },
        { van: 'api', naar: 'koppel', via: [[68, 37], [68, 62]], elke: 5000, snelheid: 22, ok: true }
      ]
    },
    sso: {
      h: 74,
      nodes: [
        { id: 'wie', x: 15, y: 37, w: 24, hh: 12, label: 'collega', sub: '1× inloggen' },
        { id: 'idp', x: 48, y: 37, w: 28, hh: 13, label: 'entra id', sub: 'MFA · beleid', icoon: 'schild', accent: true },
        { id: 'a1', x: 84, y: 11, w: 24, hh: 10, label: 'crm', sub: 'saml' },
        { id: 'a2', x: 84, y: 37, w: 24, hh: 10, label: 'intranet', sub: 'oidc' },
        { id: 'a3', x: 84, y: 63, w: 24, hh: 10, label: 'gitlab', sub: 'saml' }
      ],
      edges: [
        { van: 'wie', naar: 'idp', label: 'login + MFA', elke: 4400, snelheid: 18 },
        { van: 'idp', naar: 'a1', via: [[67, 37], [67, 11]], label: 'token', labelPos: 0.62, elke: 3800, snelheid: 22, ok: true },
        { van: 'idp', naar: 'a2', label: 'token', elke: 4600, snelheid: 24, ok: true },
        { van: 'idp', naar: 'a3', via: [[67, 37], [67, 63]], elke: 5200, snelheid: 22, ok: true }
      ]
    },
    devops: {
      h: 72,
      nodes: [
        { id: 'commit', x: 13, y: 18, w: 22, hh: 10, label: 'commit', sub: 'git push' },
        { id: 'build', x: 45, y: 18, w: 22, hh: 10, label: 'build', sub: 'pipeline' },
        { id: 'test', x: 78, y: 18, w: 22, hh: 10, label: 'tests', sub: 'automatisch' },
        { id: 'release', x: 45, y: 52, w: 24, hh: 10, label: 'release', sub: 'goedkeuring', accent: true },
        { id: 'prod', x: 81, y: 52, w: 24, hh: 10, label: 'productie', sub: 'azure' },
        { id: 'staging', x: 13, y: 52, w: 22, hh: 10, label: 'staging', sub: 'acceptatie' }
      ],
      edges: [
        { van: 'commit', naar: 'build', elke: 4200, snelheid: 22 },
        { van: 'build', naar: 'test', label: 'ci', elke: 4200, snelheid: 22, ok: true },
        { van: 'test', naar: 'release', via: [[78, 35], [45, 35]], label: 'artifact', labelPos: 0.4, elke: 4600, snelheid: 22 },
        { van: 'release', naar: 'staging', elke: 5000, snelheid: 22, ok: true },
        { van: 'release', naar: 'prod', label: 'cd', elke: 5000, snelheid: 22, ok: true }
      ]
    }
  };

  document.querySelectorAll('canvas[data-diagram]').forEach(function (c) {
    var spec = SPECS[c.getAttribute('data-diagram')];
    if (spec) {
      /* wacht tot het mono-font er is zodat canvas-labels kloppen */
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { Diagram(c, spec); });
      } else Diagram(c, spec);
    }
  });

  /* ---------- contactformulier → mailto ---------- */
  (function formulier() {
    var form = document.getElementById('contactformulier');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var onderwerpen = d.getAll('onderwerp');
      var regels = [
        'Naam: ' + (d.get('naam') || ''),
        'Organisatie: ' + (d.get('organisatie') || '-'),
        'E-mail: ' + (d.get('email') || ''),
        'Telefoon: ' + (d.get('telefoon') || '-'),
        'Onderwerp: ' + (onderwerpen.length ? onderwerpen.join(', ') : '-'),
        '',
        d.get('bericht') || ''
      ];
      var mailto = 'mailto:stephan@smartersoft.nl'
        + '?subject=' + encodeURIComponent('Technische kennismaking · ' + (d.get('organisatie') || d.get('naam') || 'aanvraag via site'))
        + '&body=' + encodeURIComponent(regels.join('\n'));
      var status = form.querySelector('.form-status');
      if (status) status.textContent = '→ je e-mailprogramma opent met dit bericht · verzenden doe je daar';
      window.location.href = mailto;
    });
  })();
})();
