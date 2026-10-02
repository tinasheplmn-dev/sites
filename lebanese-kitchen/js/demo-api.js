/* Demomodus voor statische hosting (bijv. GitHub Pages), powered by Mettafel.
   Draait de site zonder server.js, dan beantwoordt dit script de /api-aanroepen
   zelf, zodat bestellen, reserveren en het contactformulier toch te proberen zijn.
   Gegevens blijven dan alleen in deze browser (localStorage). Met server.js
   erbij gaat alles gewoon naar de echte backend. */
(function () {
  'use strict';
  var echt = window.fetch.bind(window);
  var PREFIX = { bestelling: 'B', reservering: 'R', aanvraag: 'V' };
  var CAPACITEIT = 30;

  function lees(soort) { try { return JSON.parse(localStorage.getItem('lebanese-kitchen-demo-' + soort)) || []; } catch (e) { return []; } }
  function schrijf(soort, lijst) { try { localStorage.setItem('lebanese-kitchen-demo-' + soort, JSON.stringify(lijst)); } catch (e) {} }
  function antwoord(status, data) {
    return new Response(JSON.stringify(data), { status: status, headers: { 'Content-Type': 'application/json' } });
  }

  function nep(url, opties) {
    var u = new URL(url, location.href);
    var pad = u.pathname.replace(/^.*\/api\//, '');
    if (pad === 'beschikbaarheid') {
      var datum = u.searchParams.get('datum');
      var bezet = {};
      lees('reservering').forEach(function (r) {
        if (r.datum === datum && r.status !== 'waitlist') bezet[r.tijd] = (bezet[r.tijd] || 0) + (parseInt(r.personen, 10) || 0);
      });
      return antwoord(200, { ok: true, datum: datum, capaciteitPerSlot: CAPACITEIT, bezet: bezet, demo: true });
    }
    if (PREFIX[pad]) {
      var item = {};
      try { item = JSON.parse((opties && opties.body) || '{}'); } catch (e) {}
      var lijst = lees(pad);
      item.status = 'new';
      if (pad === 'reservering') {
        var som = lijst.filter(function (r) { return r.datum === item.datum && r.tijd === item.tijd && r.status !== 'waitlist'; })
          .reduce(function (s, r) { return s + (parseInt(r.personen, 10) || 0); }, 0);
        if (som + (parseInt(item.personen, 10) || 0) > CAPACITEIT) {
          if (item.wachtlijst !== true && item.wachtlijst !== 'ja') {
            return antwoord(409, { ok: false, vol: true, fout: 'This time is full. Pick another time, or join the waiting list.' });
          }
          item.status = 'waitlist';
        }
      }
      item.id = PREFIX[pad] + '-' + new Date().getFullYear() + '-' + String(lijst.length + 1).padStart(4, '0');
      lijst.unshift(item);
      schrijf(pad, lijst);
      return antwoord(201, { ok: true, id: item.id, status: item.status, demo: true });
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
