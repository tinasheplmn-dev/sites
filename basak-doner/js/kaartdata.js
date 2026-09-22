/* Bossche Başak Döner: de volledige menukaart als data.
   Bron: aangeleverde kaart van de opdrachtgever (sept 2026), gelijk aan de
   menukaart-pagina van de oude site. Prijzen bevestigt de eigenaar vóór
   livegang (zie README). foto: null betekent nette "foto volgt"-beeldplek. */
window.KAART = [
  { id: 'kapsalons', naam: 'Kapsalons', sub: 'Met döner of kipdöner', items: [
    { id: 'kapsalon-klein', naam: 'Kapsalon klein', prijs: 7.00, oms: 'Patat, döner of kipdöner, salade, gesmolten kaas en saus naar keuze.', foto: null },
    { id: 'kapsalon-groot', naam: 'Kapsalon groot', prijs: 9.50, oms: 'Patat, döner of kipdöner, salade, gesmolten kaas en saus naar keuze.', foto: null },
  ]},
  { id: 'schotels', naam: 'Schotels', sub: 'Groot, klein en mix', items: [
    { id: 'doner-schotel-klein', naam: 'Döner schotel klein', prijs: 11.00, oms: 'Döner met groente, frietjes en saus naar keuze.', foto: null },
    { id: 'doner-schotel-groot', naam: 'Döner schotel groot', prijs: 12.50, oms: 'Döner met groente, frietjes en saus naar keuze.', foto: null },
    { id: 'kip-schotel-klein', naam: 'Kipdöner schotel klein', prijs: 11.00, oms: 'Kipdöner met groente, frietjes en saus naar keuze.', foto: null },
    { id: 'kip-schotel-groot', naam: 'Kipdöner schotel groot', prijs: 12.50, oms: 'Kipdöner met groente, frietjes en saus naar keuze.', foto: null },
    { id: 'schnitzel-schotel-klein', naam: 'Kipschnitzel schotel klein', prijs: 11.00, oms: 'Kipschnitzel met friet, salade en saus naar keuze.', foto: null },
    { id: 'schnitzel-schotel-groot', naam: 'Kipschnitzel schotel groot', prijs: 12.50, oms: 'Kipschnitzel met friet, salade en saus naar keuze.', foto: null },
    { id: 'mix-schotel', naam: 'Mix schotel', prijs: 13.50, oms: 'Gemengd vlees met groente, frietjes en saus.', foto: null },
  ]},
  { id: 'broodjes', naam: 'Broodjes', sub: 'Op echt Turks brood', items: [
    { id: 'br-doner', naam: 'Broodje döner', prijs: 5.50, oms: 'Döner met groente en saus naar keuze.', foto: null },
    { id: 'br-kipdoner', naam: 'Broodje kipdöner', prijs: 5.50, oms: 'Kipdöner met groente en saus naar keuze.', foto: null },
    { id: 'br-hamburger', naam: 'Broodje hamburger', prijs: 5.50, oms: 'Hamburger met saus.', foto: null },
    { id: 'br-schnitzel', naam: 'Broodje kipschnitzel', prijs: 5.50, oms: 'Kipschnitzel met groente en saus naar keuze.', foto: null },
    { id: 'br-kaas', naam: 'Broodje gesmolten kaas', prijs: 5.00, oms: 'Broodje met gesmolten kaas.', foto: null },
    { id: 'br-falafel', naam: 'Broodje falafel', prijs: 5.50, oms: 'Vegetarisch broodje falafel.', foto: null, veg: true },
    { id: 'extra-vlees', naam: 'Extra vlees', prijs: 2.50, oms: 'Extra vlees op je broodje.', foto: null },
  ]},
  { id: 'durum', naam: 'Dürüm', sub: 'Wraps van de spies', items: [
    { id: 'durum-doner', naam: 'Dürüm döner', prijs: 6.50, oms: 'Wrap met döner, groente en saus naar keuze.', foto: null },
    { id: 'durum-kipdoner', naam: 'Dürüm kipdöner', prijs: 6.50, oms: 'Wrap met kipdöner, groente en saus naar keuze.', foto: null },
    { id: 'durum-extra', naam: 'Extra kaas of extra saus', prijs: 1.00, oms: 'Voor bij je dürüm.', foto: null },
  ]},
  { id: 'turkse-pizza', naam: 'Turkse pizza', sub: 'Lahmacun, vers gerold', items: [
    { id: 'tp', naam: 'Turkse pizza', prijs: 4.00, oms: 'Turkse pizza met groente.', foto: null, veg: true },
    { id: 'tp-kaas', naam: 'Turkse pizza met gesmolten kaas', prijs: 5.00, oms: 'Turkse pizza met gesmolten kaas.', foto: null, veg: true },
    { id: 'tp-doner', naam: 'Turkse pizza met döner', prijs: 8.00, oms: 'Turkse pizza met döner en groente.', foto: null },
    { id: 'tp-kipdoner', naam: 'Turkse pizza met kipdöner', prijs: 8.00, oms: 'Turkse pizza met kipdöner en groente.', foto: null },
    { id: 'tp-extra-kaas', naam: 'Extra kaas', prijs: 1.00, oms: 'Voor op je Turkse pizza.', foto: null },
  ]},
  { id: 'frisdrank', naam: 'Frisdrank', sub: 'Koud uit de koeling', items: [
    { id: 'ayran', naam: 'Ayran', prijs: 2.50, oms: 'De klassieker bij elke döner.', foto: null },
    { id: 'cola', naam: 'Coca-Cola', prijs: 2.50, oms: 'Ook als Coca-Cola Zero.', foto: null },
    { id: 'cherry-coke', naam: 'Cherry Coke', prijs: 2.50, oms: '', foto: null },
    { id: 'fanta', naam: 'Fanta Sinas', prijs: 2.50, oms: '', foto: null },
    { id: 'cassis', naam: 'Fanta Cassis', prijs: 3.00, oms: '', foto: null },
    { id: 'chocomel', naam: 'Chocomel', prijs: 3.00, oms: '', foto: null },
    { id: 'fristi', naam: 'Fristi', prijs: 3.00, oms: '', foto: null },
    { id: 'aa-drink', naam: 'AA Drink', prijs: 3.00, oms: '', foto: null },
    { id: 'ice-tea', naam: 'Ice Tea', prijs: 3.00, oms: '', foto: null },
    { id: 'fernandes', naam: 'Fernandes', prijs: 3.00, oms: '', foto: null },
    { id: 'red-bull', naam: 'Red Bull', prijs: 3.50, oms: '', foto: null },
  ]},
];
