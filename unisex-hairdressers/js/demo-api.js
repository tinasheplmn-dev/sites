/* Demomodus voor statische hosting (bijv. GitHub Pages), powered by Mettafel.
   Draait de site zonder server.js, dan beantwoordt dit script /api/beschikbaar
   en /api/boeking zelf, met dezelfde regels als de server (openingstijden,
   geen dubbele boeking per stylist). Afspraken blijven dan alleen in deze
   browser (localStorage). Met server.js erbij gaat alles naar de echte backend. */
(function () {
  'use strict';
  var echt = window.fetch.bind(window);
  var SLEUTEL = 'unisexhair-demo-boekingen';
  var NAMEN = { oksana: 'Oksana', angela: 'Angela', galina: 'Galina', tania: 'Tania' };

  function lees() { try { return JSON.parse(localStorage.getItem(SLEUTEL)) || []; } catch (e) { return []; } }
  function schrijf(l) { try { localStorage.setItem(SLEUTEL, JSON.stringify(l)); } catch (e) {} }
  function antwoord(status, data) { return new Response(JSON.stringify(data), { status: status, headers: { 'Content-Type': 'application/json' } }); }
  function min(t) { var r = /^(\d{2}):(\d{2})$/.exec(t || ''); return r ? +r[1] * 60 + +r[2] : NaN; }
  function p2(n) { return String(n).padStart(2, '0'); }
  function uren(dag) { return dag === 0 ? { van: 10, tot: 17 } : dag === 6 ? { van: 9, tot: 18 } : { van: 9, tot: 19 }; }
  function dagVan(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]).getDay(); }
  function bezetVoor(datum) {
    var b = {}; Object.keys(NAMEN).forEach(function (n) { b[n] = []; });
    lees().forEach(function (x) { if (x.datum === datum && x.status !== 'geannuleerd' && b[x.stylist]) { var s = min(x.tijd); b[x.stylist].push([s, s + (+x.duur || 0)]); } });
    return b;
  }
  function overlapt(bl, s, e) { return bl.some(function (x) { return s < x[1] && e > x[0]; }); }

  function nep(url, opties) {
    var u = new URL(url, location.href);
    var pad = u.pathname.replace(/^.*\/api\//, '');
    if (pad === 'beschikbaar') {
      var datum = u.searchParams.get('datum') || '';
      return antwoord(200, { ok: true, datum: datum, bezet: bezetVoor(datum), demo: true });
    }
    if (pad === 'boeking' && opties && opties.method === 'POST') {
      var v = {}; try { v = JSON.parse(opties.body || '{}'); } catch (e) {}
      var duur = Math.max(15, +v.duur || 30), s = min(v.tijd), e = s + duur, h = uren(dagVan(v.datum || '2000-01-01'));
      if (!v.naam || !v.telefoon || isNaN(s) || s < h.van * 60 || e > h.tot * 60) return antwoord(400, { ok: false, fout: 'Please check your details.' });
      var bezet = bezetVoor(v.datum), stylist = v.stylist;
      if (stylist === 'any') {
        var vrij = Object.keys(NAMEN).filter(function (n) { return !overlapt(bezet[n], s, e); });
        vrij.sort(function (a, b) { return bezet[a].length - bezet[b].length; });
        stylist = vrij[0];
        if (!stylist) return antwoord(409, { ok: false, vol: true, fout: 'Sorry, that time was just taken. Please pick another slot.' });
      } else if (!NAMEN[stylist] || overlapt(bezet[stylist], s, e)) {
        return antwoord(409, { ok: false, vol: true, fout: 'Sorry, ' + (NAMEN[stylist] || 'that stylist') + ' was just booked at that time. Please pick another slot.' });
      }
      var lijst = lees(), jaar = new Date().getFullYear();
      var id = 'U-' + jaar + '-' + String(lijst.length + 1).padStart(4, '0');
      var eind = p2(Math.floor(e / 60)) + ':' + p2(e % 60);
      lijst.unshift({ id: id, status: 'nieuw', datum: v.datum, tijd: v.tijd, eind: eind, duur: duur, stylist: stylist, naam: v.naam, telefoon: v.telefoon, behandelingen: v.behandelingen });
      schrijf(lijst);
      return antwoord(201, { ok: true, id: id, stylist: stylist, stylistNaam: NAMEN[stylist], datum: v.datum, tijd: v.tijd, eind: eind, duur: duur, demo: true });
    }
    return antwoord(404, { ok: false });
  }

  window.fetch = function (invoer, opties) {
    var url = typeof invoer === 'string' ? invoer : (invoer && invoer.url) || '';
    if (!/(^|\/)api\//.test(url.replace(location.origin, ''))) return echt(invoer, opties);
    return echt(invoer, opties).then(function (r) {
      var type = r.headers.get('content-type') || '';
      if (type.indexOf('application/json') === -1 || r.status === 404 || r.status === 405) return nep(url, opties);
      return r;
    }, function () { return nep(url, opties); });
  };
})();
