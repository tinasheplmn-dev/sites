/* Demomodus voor statische hosting (GitHub Pages), powered by Mettafel.
   Draait de site zonder server.js, dan beantwoordt dit script de /api-aanroepen
   zelf, zodat reserveren en het contactformulier toch te proberen zijn.
   De gegevens blijven alleen in deze browser (localStorage). Met server.js
   erbij gaat alles gewoon naar de echte backend. */
(function () {
  'use strict';
  var echt = window.fetch.bind(window);
  var PREFIX = { reservering: 'R', aanvraag: 'V' };

  function lees(soort) {
    try { return JSON.parse(localStorage.getItem('chezminee-demo-' + soort)) || []; } catch (e) { return []; }
  }
  function schrijf(soort, lijst) {
    try { localStorage.setItem('chezminee-demo-' + soort, JSON.stringify(lijst)); } catch (e) {}
  }
  function antwoord(status, data) {
    return new Response(JSON.stringify(data), { status: status, headers: { 'Content-Type': 'application/json' } });
  }

  window.fetch = function (bron, opties) {
    var url = typeof bron === 'string' ? bron : (bron && bron.url) || '';
    if (url.indexOf('/api/') === -1) return echt(bron, opties);
    var soort = url.replace(/^.*\/api\//, '').split(/[?\/]/)[0];
    if (!PREFIX[soort]) return echt(bron, opties);

    var item = {};
    try { item = JSON.parse((opties && opties.body) || '{}'); } catch (e) {}
    var lijst = lees(soort);
    var jaar = new Date().getFullYear();
    item.id = PREFIX[soort] + '-' + jaar + '-' + String(lijst.length + 1).padStart(4, '0');
    item.status = 'nieuw';
    item.ontvangen = new Date().toISOString();
    lijst.unshift(item);
    schrijf(soort, lijst);
    return Promise.resolve(antwoord(201, { ok: true, id: item.id, status: item.status, demo: true }));
  };
})();
