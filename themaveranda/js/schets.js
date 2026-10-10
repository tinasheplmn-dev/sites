/* Isometrische tekening van de veranda, live meegroeiend met de keuzes.
   tekenVeranda(svg, cfg) met cfg = { b, d (cm), dak, kleur, voorkant, links, rechts, extra[] }
   Vaste schaal, zodat de bezoeker de veranda echt ziet groeien. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  var SCHAAL = 34, VB_B = 600, VB_H = 440;
  var HB = 2.7, HF = 2.3, HUIS = 3.4;

  var KLEUR = { ral7024: '#6c7177', ral9005: '#2b2c30', ral9001: '#e8dfcf', ral9016: '#f2f2ee' };
  var DAK = {
    'poly-helder': ['rgba(205, 228, 240, .18)', 'rgba(205, 228, 240, .55)'],
    'poly-opaal': ['rgba(243, 240, 233, .55)', 'rgba(243, 240, 233, .8)'],
    'glas-helder': ['rgba(170, 215, 235, .16)', 'rgba(200, 235, 250, .7)'],
    'glas-getint': ['rgba(40, 46, 52, .7)', 'rgba(140, 150, 160, .6)']
  };

  function el(naam, attrs, ouder) {
    var e = document.createElementNS(NS, naam);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (ouder) ouder.appendChild(e);
    return e;
  }

  window.tekenVeranda = function (svg, cfg) {
    var B = Math.max(2.5, cfg.b / 100), D = Math.max(2, cfg.d / 100);
    var W = (B + D) * C * SCHAAL, H = (B + D) * S * SCHAAL + HUIS * SCHAAL;
    var ox = (VB_B - W) / 2 + D * C * SCHAAL;
    var oy = (VB_H - H) / 2 + HUIS * SCHAAL;
    function p(x, y, z) { return [ox + (x - y) * C * SCHAAL, oy + ((x + y) * S - z) * SCHAAL]; }
    function pts(lijst) { return lijst.map(function (q) { var r = p(q[0], q[1], q[2]); return r[0].toFixed(1) + ',' + r[1].toFixed(1); }).join(' '); }
    function lijn(a, b, cls, extra, ouder) { var A = p(a[0], a[1], a[2]), Bp = p(b[0], b[1], b[2]); var o = { x1: A[0], y1: A[1], x2: Bp[0], y2: Bp[1] }; for (var k in extra) o[k] = extra[k]; return el('line', o, ouder); }

    svg.setAttribute('viewBox', '0 0 ' + VB_B + ' ' + VB_H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = el('defs', {}, svg);
    var gl = el('radialGradient', { id: 'led-gloed' }, defs);
    el('stop', { offset: '0', 'stop-color': '#ffe2a8', 'stop-opacity': '1' }, gl);
    el('stop', { offset: '1', 'stop-color': '#ffe2a8', 'stop-opacity': '0' }, gl);

    var frame = KLEUR[cfg.kleur] || KLEUR.ral7024;
    var dak = DAK[cfg.dak] || DAK['poly-helder'];
    var g = el('g', {}, svg);

    // grond en huisgevel
    el('polygon', { points: pts([[0, 0, 0], [B, 0, 0], [B, D, 0], [0, D, 0]]), fill: 'rgba(92,196,149,.07)', stroke: 'rgba(92,196,149,.35)', 'stroke-dasharray': '4 5' }, g);
    el('polygon', { points: pts([[-.4, 0, 0], [B + .4, 0, 0], [B + .4, 0, HUIS], [-.4, 0, HUIS]]), fill: 'rgba(244,240,232,.05)', stroke: 'rgba(244,240,232,.18)' }, g);
    for (var hz = .5; hz < HUIS; hz += .5) lijn([-.4, 0, hz], [B + .4, 0, hz], '', { stroke: 'rgba(244,240,232,.05)' }, g);

    // linkerwand (achter, eerst tekenen)
    function zijwand(x, soort) {
      if (soort === 'open') return;
      var poly = [[x, 0, 0], [x, D, 0], [x, D, HF], [x, 0, HB]];
      if (soort === 'glas') {
        el('polygon', { points: pts(poly), fill: 'rgba(180,220,240,.12)', stroke: 'rgba(200,235,250,.45)' }, g);
        for (var y = 1; y < D; y += 1) lijn([x, y, 0], [x, y, HB - (HB - HF) * y / D], '', { stroke: 'rgba(200,235,250,.35)' }, g);
      } else {
        el('polygon', { points: pts(poly), fill: frame, 'fill-opacity': '.85', stroke: frame }, g);
        for (var z = .25; z < HF; z += .25) lijn([x, 0, z], [x, D, z], '', { stroke: 'rgba(0,0,0,.28)' }, g);
      }
    }
    zijwand(0, cfg.links);

    // staanders
    var aantal = Math.max(1, Math.ceil(B / 4));
    var xs = [];
    for (var i = 0; i <= aantal; i++) xs.push(B * i / aantal);

    // voorkant: schuifwanden
    if (cfg.voorkant && cfg.voorkant !== 'open') {
      var getint = cfg.voorkant === 'schuif-getint';
      el('polygon', { points: pts([[0, D, 0], [B, D, 0], [B, D, HF], [0, D, HF]]), fill: getint ? 'rgba(30,36,40,.62)' : 'rgba(180,220,240,.12)', stroke: 'rgba(200,235,250,.4)' }, g);
      for (var px = .95; px < B; px += .95) lijn([px, D, 0], [px, D, HF], '', { stroke: getint ? 'rgba(160,170,180,.35)' : 'rgba(200,235,250,.35)' }, g);
    }

    // dak
    el('polygon', { points: pts([[0, 0, HB], [B, 0, HB], [B, D, HF], [0, D, HF]]), fill: dak[0], stroke: dak[1], 'stroke-width': '1.2' }, g);
    var sporen = Math.max(2, Math.round(B / .8));
    for (var s = 0; s <= sporen; s++) {
      var sx = B * s / sporen;
      lijn([sx, 0, HB], [sx, D, HF], '', { stroke: frame, 'stroke-width': '2' }, g);
    }
    // verlichting
    var licht = cfg.extra && (cfg.extra.indexOf('led') > -1 || cfg.extra.indexOf('dimbaar') > -1);
    if (licht) {
      for (var l = 0; l < sporen; l++) {
        var lx = B * (l + .5) / sporen;
        [.33, .72].forEach(function (f) {
          var q = p(lx, D * f, HB - (HB - HF) * f - .02);
          el('circle', { cx: q[0], cy: q[1], r: 9, fill: 'url(#led-gloed)', opacity: '.8' }, g);
          el('circle', { cx: q[0], cy: q[1], r: 1.8, fill: '#fff6dc' }, g);
        });
      }
    }

    // muurbalk, goot en staanders (frame, met lichte rand voor contrast)
    function balk(a, b, dikte) {
      lijn(a, b, '', { stroke: 'rgba(244,240,232,.22)', 'stroke-width': dikte + 2, 'stroke-linecap': 'round' }, g);
      lijn(a, b, '', { stroke: frame, 'stroke-width': dikte, 'stroke-linecap': 'round' }, g);
    }
    balk([0, 0, HB], [B, 0, HB], 3);
    xs.forEach(function (x) { balk([x, D, 0], [x, D, HF], 4); });
    balk([0, D, HF], [B, D, HF], 6);
    balk([B, 0, HB], [B, D, HF], 3);
    balk([0, 0, HB], [0, D, HF], 3);
    zijwand(B, cfg.rechts);
    if (cfg.rechts !== 'open') { balk([B, D, 0], [B, D, HF], 4); balk([B, D, HF], [B, 0, HB], 3); }

    // maatlijnen
    var m1 = p(0, D + .55, 0), m2 = p(B, D + .55, 0);
    el('line', { x1: m1[0], y1: m1[1], x2: m2[0], y2: m2[1], stroke: '#d8b073', 'stroke-width': '1' }, g);
    var mt = p(B / 2, D + 1.05, 0);
    var t1 = el('text', { x: mt[0], y: mt[1], fill: '#f1dcae', 'font-size': '14', 'font-weight': '600', 'text-anchor': 'middle', 'font-family': 'Onest, sans-serif' }, g);
    t1.textContent = cfg.b + ' cm';
    var n1 = p(B + .55, 0, 0), n2 = p(B + .55, D, 0);
    el('line', { x1: n1[0], y1: n1[1], x2: n2[0], y2: n2[1], stroke: '#d8b073', 'stroke-width': '1' }, g);
    var nt = p(B + 1.1, D / 2, 0);
    var t2 = el('text', { x: nt[0], y: nt[1], fill: '#f1dcae', 'font-size': '14', 'font-weight': '600', 'font-family': 'Onest, sans-serif' }, g);
    t2.textContent = cfg.d + ' cm';
  };
})();
