/* Rooster Kickboxing University. Bron: roosterafbeelding op kickboxinguniversity.nl/rooster (31-10-2025).
   d: 0 = maandag t/m 6 = zondag. niveau: beg (beginners), gev (gevorderden), alle.
   groep: kids, jeugd, volw, dames, ochtend, buiten. Late avondblokken staan als 20.10-21.10
   (de Ladies Only-pagina noemt die tijd); check bij oplevering. Aanpassen = één regel wijzigen. */
window.ROOSTER = [
  { d: 0, van: '18:00', tot: '19:00', les: 'Kickboksen 12-15 jaar', niveau: 'beg', groep: 'jeugd', pagina: 'jeugd' },
  { d: 0, van: '19:00', tot: '20:00', les: 'Kickboksen 16+', niveau: 'beg', groep: 'volw', pagina: 'volwassenen' },
  { d: 0, van: '20:10', tot: '21:10', les: 'Kickboksen 16+', niveau: 'gev', groep: 'volw', pagina: 'volwassenen' },
  { d: 1, van: '18:00', tot: '19:00', les: 'Kickboksen 16+', niveau: 'gev', groep: 'volw', pagina: 'university' },
  { d: 1, van: '19:00', tot: '20:00', les: 'Zaktraining 16+', niveau: 'alle', groep: 'volw', pagina: 'zaktraining' },
  { d: 1, van: '20:10', tot: '21:10', les: 'Ladies Only', niveau: 'alle', groep: 'dames', pagina: 'ladies' },
  { d: 2, van: '09:30', tot: '10:30', les: 'Pads-training', niveau: 'alle', groep: 'ochtend', pagina: 'ochtend' },
  { d: 2, van: '16:00', tot: '17:00', les: 'Kids Kata 7-11 jaar', niveau: 'beg', groep: 'kids', pagina: 'kids' },
  { d: 2, van: '18:00', tot: '19:00', les: 'Kickboksen 12-15 jaar', niveau: 'beg', groep: 'jeugd', pagina: 'jeugd' },
  { d: 2, van: '19:00', tot: '20:00', les: 'Kickboksen 16+', niveau: 'beg', groep: 'volw', pagina: 'volwassenen' },
  { d: 2, van: '20:10', tot: '21:10', les: 'Kickboksen 16+', niveau: 'gev', groep: 'volw', pagina: 'volwassenen' },
  { d: 3, van: '16:00', tot: '17:00', les: 'Kids Kata 7-11 jaar', niveau: 'beg', groep: 'kids', pagina: 'kids' },
  { d: 3, van: '18:00', tot: '19:00', les: 'Kickboksen 16+', niveau: 'gev', groep: 'volw', pagina: 'university' },
  { d: 3, van: '19:00', tot: '20:00', les: 'Zaktraining 16+', niveau: 'alle', groep: 'volw', pagina: 'zaktraining' },
  { d: 3, van: '20:10', tot: '21:10', les: 'Ladies Only', niveau: 'alle', groep: 'dames', pagina: 'ladies' },
  { d: 4, van: '09:30', tot: '10:30', les: 'Kracht en uithouding', niveau: 'alle', groep: 'ochtend', pagina: 'ochtend' },
  { d: 4, van: '18:30', tot: '19:30', les: 'Kickboksen 12+', niveau: 'alle', groep: 'volw', pagina: 'techniek' },
  { d: 5, van: '10:00', tot: '11:00', les: 'Sparren', niveau: 'gev', groep: 'volw', pagina: 'university' },
  { d: 6, van: '09:30', tot: '10:30', les: 'Hardlopen Drunense Duinen', niveau: 'alle', groep: 'buiten', pagina: 'ochtend' },
];
window.DAGEN = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
window.NIVEAU = { beg: 'Beginners', gev: 'Gevorderden', alle: "Alle niveaus" };
