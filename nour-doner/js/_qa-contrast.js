/**
 * Contrastmeting in de browser.
 *
 * Statisch CSS lezen zegt niets over de echte achtergrond onder een tekst.
 * Dit script meet de opgemaakte pagina, dus het klopt wel.
 *
 * Gebruik: plak de hele inhoud in de console van de geopende pagina
 * (of voer hem uit via javascript_tool). Doe dit op elke pagina, licht en donker.
 */
(function () {
  function rgb(s) {
    var m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var d = m[1].split(/[,/\s]+/).filter(Boolean).map(parseFloat);
    return { r: d[0], g: d[1], b: d[2], a: d[3] === undefined ? 1 : d[3] };
  }

  function meng(voor, achter) {
    if (voor.a >= 1) return voor;
    return {
      r: voor.r * voor.a + achter.r * (1 - voor.a),
      g: voor.g * voor.a + achter.g * (1 - voor.a),
      b: voor.b * voor.a + achter.b * (1 - voor.a),
      a: 1,
    };
  }

  function lum(c) {
    var f = function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }

  function ratio(a, b) {
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  /* echte achtergrond: klim omhoog tot je iets ondoorzichtigs vindt */
  function achtergrondVan(el) {
    var stapel = [];
    var n = el;
    while (n && n.nodeType === 1) {
      var bg = rgb(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) {
        stapel.unshift(bg);
        if (bg.a >= 1) break;
      }
      n = n.parentElement;
    }
    var uit = { r: 255, g: 255, b: 255, a: 1 };
    for (var i = 0; i < stapel.length; i++) uit = meng(stapel[i], uit);
    return uit;
  }

  function pad(el) {
    var d = el.tagName.toLowerCase();
    if (el.id) return d + '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      d += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    }
    return d;
  }

  var problemen = [];
  var gezien = new Set();

  document.querySelectorAll('body *').forEach(function (el) {
    var eigenTekst = Array.prototype.filter
      .call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim().length > 1; })
      .map(function (n) { return n.textContent.trim(); })
      .join(' ');
    if (!eigenTekst) return;

    var s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') return;
    if (parseFloat(s.opacity) === 0) return;
    var doos = el.getBoundingClientRect();
    if (!doos.width || !doos.height) return;

    var voor = rgb(s.color);
    if (!voor) return;
    var achter = achtergrondVan(el);

    /* doorzichtigheid van dit element en zijn ouders telt mee */
    var alfa = 1, n = el;
    while (n && n.nodeType === 1) {
      alfa *= parseFloat(getComputedStyle(n).opacity);
      n = n.parentElement;
    }
    voor = meng({ r: voor.r, g: voor.g, b: voor.b, a: voor.a * alfa }, achter);

    var r = ratio(voor, achter);
    var grootte = parseFloat(s.fontSize);
    var dik = parseInt(s.fontWeight, 10) >= 700;
    var groot = grootte >= 24 || (grootte >= 18.66 && dik);
    var lat = groot ? 4.5 : 7;

    if (r >= lat) return;

    var sleutel = pad(el) + '|' + s.color + '|' + Math.round(r * 10);
    if (gezien.has(sleutel)) return;
    gezien.add(sleutel);

    problemen.push({
      element: pad(el),
      tekst: eigenTekst.slice(0, 55),
      contrast: Math.round(r * 10) / 10,
      lat: lat,
      grootte: Math.round(grootte) + 'px',
      kleur: s.color,
      opAchtergrond: 'rgb(' + [achter.r, achter.g, achter.b].map(Math.round).join(', ') + ')',
      ernst: r < (groot ? 3 : 4.5) ? 'ONLEESBAAR' : 'te licht',
    });
  });

  problemen.sort(function (a, b) { return a.contrast - b.contrast; });

  var uitkomst = {
    pagina: location.pathname,
    breedte: window.innerWidth,
    aantal: problemen.length,
    problemen: problemen.slice(0, 40),
  };
  if (typeof console !== 'undefined' && console.table && problemen.length) console.table(problemen.slice(0, 40));
  return uitkomst;
})();
