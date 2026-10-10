/* Prijzen van Thema Veranda, overgenomen van de huidige site (oktober 2026).
   Basisprijs per maat (breedte x diepte in cm) plus de toeslagen uit de
   oude configurator. Dit is de enige plek waar prijzen staan: pas hier aan
   en de rekenmodule op home en de configurator rekenen meteen mee.
   OPEN PUNT: bevestigen of dit incl. btw en montage is. */
(function () {
  'use strict';

  var breedtes = [300, 400, 500, 600, 700, 800];
  var dieptes = [200, 250, 300, 350, 400, 450, 500];
  var tabel = {
    300: [929, 1031, 1153, 1300, 1475, 1750, 1883],
    400: [1076, 1221, 1378, 1500, 1647, 1941, 2039],
    500: [1266, 1411, 1613, 1736, 1905, 2240, 2397],
    600: [1411, 1590, 1736, 1960, 2139, 2508, 2721],
    700: [1624, 1758, 1915, 2150, 2251, 2834, 3136],
    800: [1769, 1915, 2061, 2274, 2419, 3079, 3471]
  };

  var opties = {
    dak: {
      'poly-helder': ['Polycarbonaat helder', 0],
      'poly-opaal': ['Polycarbonaat opaal', 250],
      'glas-helder': ['Helder glas', 900],
      'glas-getint': ['Getint glas', 1100]
    },
    kleur: {
      'ral7024': ['Antraciet RAL 7024 mat', 0],
      'ral9005': ['Zwart RAL 9005 mat', 150],
      'ral9001': ['Crème RAL 9001', 150],
      'ral9016': ['Wit RAL 9016', 150]
    },
    afwerking: {
      'standaard': ['Standaard afwerking', 0],
      'sierlijst': ['Luxe sierlijst', 350],
      'vlak': ['Modern vlak', 300]
    },
    montage: {
      'gevel': ['Tegen de gevel', 0],
      'vrijstaand': ['Vrijstaand', 650],
      'advies': ['Graag advies', 0]
    },
    voorkant: {
      'open': ['Open', 0],
      'schuif-helder': ['Glazen schuifwanden helder', 1800],
      'schuif-getint': ['Glazen schuifwanden getint', 2100]
    },
    zijkant: {
      'open': ['Open', 0],
      'glas': ['Glaswand', 850],
      'rabat': ['Aluminium rabatdelen', 650]
    },
    extra: {
      'led': ['LED-verlichting', 350],
      'dimbaar': ['Dimbare verlichting', 240],
      'zonwering': ['Zonwering', 950],
      'heater': ['Voorbereiding heater', 220],
      'afvoer': ['Weggewerkte afvoer', 180],
      'stopcontact': ['Voorbereiding stopcontact', 190],
      'inmeten': ['Inmeten op locatie', 0],
      'afvoeradvies': ['Advies over afvoer', 0]
    }
  };

  /* Ronde maat naar boven af op de prijstabel. Buiten de tabel: geen indicatie. */
  function basis(b, d) {
    var bi = breedtes.find(function (x) { return x >= b; });
    var di = dieptes.find(function (x) { return x >= d; });
    if (!bi || !di) return null;
    return { prijs: tabel[bi][dieptes.indexOf(di)], b: bi, d: di };
  }

  function toeslag(groep, sleutel) {
    var o = opties[groep] && opties[groep][sleutel];
    return o ? o[1] : 0;
  }

  /* cfg: { b, d, dak, kleur, afwerking, montage, voorkant, links, rechts, extra: [] } */
  function indicatie(cfg) {
    var bas = basis(cfg.b, cfg.d);
    if (!bas) return null;
    var som = bas.prijs;
    som += toeslag('dak', cfg.dak);
    som += toeslag('kleur', cfg.kleur);
    som += toeslag('afwerking', cfg.afwerking);
    som += toeslag('montage', cfg.montage);
    som += toeslag('voorkant', cfg.voorkant);
    som += toeslag('zijkant', cfg.links);
    som += toeslag('zijkant', cfg.rechts);
    (cfg.extra || []).forEach(function (e) { som += toeslag('extra', e); });
    return som;
  }

  function euro(n) {
    return '€ ' + Math.round(n).toLocaleString('nl-NL');
  }

  window.TV = { breedtes: breedtes, dieptes: dieptes, tabel: tabel, opties: opties, indicatie: indicatie, euro: euro, basis: basis };
})();
