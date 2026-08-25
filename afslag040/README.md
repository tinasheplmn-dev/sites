# Rijschool Afslag 040 · website

Volledig statische site (HTML/CSS/JS, geen build-stap) voor Rijschool Afslag 040 in Eindhoven.

## Concept

De naam is het merk: Afslag 040 is de snelweg-afslag naar Eindhoven. De site is opgezet als bewegwijzering bij nacht: kobaltblauwe borden, gouden wegmarkering, hectometerpaaltjes als sectienummers en een belijning aan de linkerkant (desktop) die met je scroll meerijdt. Kern-propositie uit de reviews: de rijschool van de tweede kans (veel overstappers die hier alsnog slaagden).

- Kleuren: nachtasfalt (#060b1c), signage-kobalt (#1d4ed8 / #16368f), goud (#e8b54a)
- Typografie: Overpass (display, ontworpen naar Highway Gothic), Overpass Mono (route-labels), Instrument Sans (body)
- Logo: eigen wordmark als component (`.logo` in elke pagina + `assets/favicon.svg`); het aangeleverde blauw/gouden logo kan het wordmark 1-op-1 vervangen zodra er een strak bestand is

## Lokaal draaien

```bash
node websites/afslag040-website/server.js
```

Draait op http://localhost:8078 (launch-config `afslag040-website`).

## Deployen

Statisch, dus elke host werkt (Vercel: map als project koppelen, geen build command, output = deze map).

## Vóór livegang bevestigen door de opdrachtgever

- Tarieven (overgenomen van de tijdelijke jouwweb-pagina, augustus 2026)
- E-mailadres: aangeleverd als "Info@rijschoolAfslag040" (onvolledig); site gebruikt nu info@rijschoolafslag040.nl
- Facebook-link ontbreekt (bewust weggelaten, geen URL bekend)
- Definitief logobestand aanleveren en het wordmark vervangen

## Content

- 14 geslaagden-foto's: `assets/img/geslaagd-01..14.jpg` (uit klant-content/Rijscholen/Media afslag040, verkleind naar 1000px)
- 36 Google-reviews verbatim op geslaagden.html
- Proefles-formulier opent WhatsApp (hoofdkanaal) met vooringevuld bericht; er is geen backend
