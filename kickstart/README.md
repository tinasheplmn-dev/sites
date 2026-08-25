# Rijschool Kickstart · website

Volledig statische site (HTML/CSS/JS, geen build-stap) voor Rijschool Kickstart in Tilburg, prompt 46 uit de rijscholen-reeks.

## Concept

De naam is het concept: de vliegende start. De hero opent met een verkeerslicht dat aftelt naar groen, waarna de typografie met een launch-beweging binnenkomt; elke sectie op de site vertrekt met diezelfde beweging uit stilstand, en de "toerenteller" (oranje voortgangsbalk bovenin) loopt met je scroll mee. Eén motion-idee, overal doorgevoerd.

- Kleuren: nardo-grijs `#d8dbde` (de kleur van de lesauto, nergens anders in de reeks), inkt `#0b0d11`, ontstekingsoranje `#ff5400` met gradient/gloed als eigen behandeling van het klant-oranje
- Typografie: Saira Extra Condensed 800 (display, geskewd), Saira SemiCondensed (labels), Manrope (body)
- Signatuur: schuine "slipstream"-strepen (115°), startstreep-dividers als wegmarkering, geskewde clip-path-knoppen, eigen SVG-iconenset (stroke, hoekig)
- Logo: eigen wordmark als component (`.logo` in elke pagina + `assets/favicon.svg`); het bestaande zwart/oranje Kickstart-logo kan het wordmark 1-op-1 vervangen zodra er een strak bestand is

## Lokaal draaien

```bash
node websites/kickstart-website/server.js
```

Draait op http://localhost:8084 (launch-config `kickstart-website`).

## Deployen

Statisch, dus elke host werkt (Vercel: map als project koppelen, geen build command, output = deze map).

## Vóór livegang bevestigen door de opdrachtgever

- Pakketprijzen en -inhoud staan erop zoals aangeleverd (aug 2026): Budget €800 / Basis €1.612,50 / Top €2.660 / Master €3.038. Let op: de oorspronkelijke briefing sprak van "gratis praktijkexamen bij Top en Master", de aangeleverde pakketdata van "€50 korting op het praktijkexamen" plus 1 gereserveerde les; de site volgt de aangeleverde pakketdata. Even bevestigen welke formulering klopt.
- Reviewscore staat op 5,0 uit 106 (aangeleverd) met de share.google-link; loopt het aantal op, dan op drie plekken per pagina updaten (zoek op "106").
- Annuleren tot 24 uur en tegoed 1 jaar geldig: overgenomen van de huidige site, even herbevestigen.
- E-mailadres ontbreekt (niet aangeleverd); site gebruikt bewust alleen telefoon/WhatsApp/socials.
- Achternaam van Bekir opvragen (nu alleen voornaam, ook in structured data geen persoon opgenomen).
- Portretfoto van Bekir ontbreekt; de over-pagina gebruikt nu het aangeleverde beeld van de beklede lesauto. Een echte foto van Bekir maakt die pagina af.
- JSON-LD bevat bewust geen geo-coördinaten (niet geverifieerd beschikbaar); Google geocodeert zelf op het adres. Wil je ze erin, dan exacte coördinaten aanleveren.

## Content

- 15 geslaagden-foto's: `assets/img/geslaagd-01..15.jpg` (uit klant-content/Rijscholen/Kickstart, verkleind naar 1100px)
- `assets/img/bekir-auto.webp`: de beklede lesauto (over-pagina)
- 50 Google-reviews verbatim op reviews.html (licht rechtgetrokken spelling, namen behouden)
- Proefles-formulier opent WhatsApp (+31 6 87899608) met vooringevuld bericht; er is geen backend
- OG-beeld: `assets/img/og-image.jpg` (1200×630, uit geslaagden-serie)
