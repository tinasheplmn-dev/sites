/* Aanbod: filteren en sorteren van de kaarten die al in de HTML staan.
   Zonder JavaScript staan alle auto's er gewoon. De stand wordt in de URL
   bewaard (?merk=Kia&prijs=10000) zodat een link deelbaar is. */
(function () {
  'use strict';
  var raster = document.querySelector('[data-voorraad]');
  if (!raster) return;
  var kaarten = [].slice.call(raster.querySelectorAll('.wagen'));
  var filters = [].slice.call(document.querySelectorAll('[data-filter]'));
  var sorteer = document.querySelector('[data-sorteer]');
  var aantal = document.querySelector('[data-aantal]');
  var leeg = document.querySelector('[data-leeg]');
  var reset = document.querySelector('[data-reset]');

  var params = new URLSearchParams(location.search);
  filters.forEach(function (f) { var v = params.get(f.dataset.filter); if (v) f.value = v; });
  if (sorteer && params.get('sorteer')) sorteer.value = params.get('sorteer');

  function pas() {
    var w = {};
    filters.forEach(function (f) { w[f.dataset.filter] = f.value; });
    var n = 0;
    kaarten.forEach(function (k) {
      var d = k.dataset;
      var toon = (!w.merk || d.merk === w.merk)
        && (!w.prijs || Number(d.prijs) <= Number(w.prijs))
        && (!w.jaar || Number(d.jaar) >= Number(w.jaar))
        && (!w.km || Number(d.km) <= Number(w.km))
        && (!w.trans || d.trans === w.trans)
        && (!w.car || d.car === w.car);
      k.classList.toggle('weg', !toon);
      if (toon) n++;
    });
    if (aantal) aantal.textContent = n;
    if (leeg) leeg.classList.toggle('aan', n === 0);

    var s = sorteer ? sorteer.value : 'nieuw';
    var sleutel = { 'prijs-op': ['prijs', 1], 'prijs-af': ['prijs', -1], 'jaar-af': ['jaar', -1], 'km-op': ['km', 1], 'nieuw': ['id', -1] }[s] || ['id', -1];
    kaarten.slice().sort(function (a, b) { return (Number(a.dataset[sleutel[0]]) - Number(b.dataset[sleutel[0]])) * sleutel[1]; })
      .forEach(function (k) { raster.appendChild(k); });

    var p = new URLSearchParams();
    filters.forEach(function (f) { if (f.value) p.set(f.dataset.filter, f.value); });
    if (s !== 'nieuw') p.set('sorteer', s);
    var q = p.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q : ''));
  }
  filters.forEach(function (f) { f.addEventListener('change', pas); });
  if (sorteer) sorteer.addEventListener('change', pas);
  if (reset) reset.addEventListener('click', function () { filters.forEach(function (f) { f.value = ''; }); if (sorteer) sorteer.value = 'nieuw'; pas(); });
  pas();
})();
