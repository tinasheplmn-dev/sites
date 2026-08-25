# Verkeersschool van den Broek · website

Volledig statische site (HTML/CSS/JS, geen build-stap) voor Verkeersschool van den Broek in Rosmalen.

## Concept

"Het instituut van Rosmalen": heritage-modern merk rond zestig jaar vakmanschap (sinds 1965).

- Kleuren: diep petrolgroen (#0E2B28), warm ivoor (#F6F1E7), koper (#C06E35)
- Typografie: Fraunces (display) + Archivo (tekst), via Google Fonts
- Motion-drager: analoge precisie-instrumenten. CBR-slagingscijfers als wijzerplaten waarvan de naald op scroll in beweging komt; de hero heeft een grote wijzerplaat die van 1965 naar vandaag zwaait.
- Eigen iconenset (inline SVG-symbolen bovenin elke pagina), eigen wordmark.

## Lokaal draaien

```bash
node server.js
```

Draait op http://localhost:8088 (of gebruik de launch-config `vdbroek-website`).

## Deployen

De site is volledig statisch: upload alle bestanden (behalve `server.js`) naar elke host
(Netlify, Vercel, klassieke webhosting). Pas vóór livegang het domein aan in
`sitemap.xml`, `robots.txt` en de canonical/OG-tags als het domein wijzigt.

## Logo vervangen

Het wordmark is één component: het `<a class="brand">`-blok (nav en footer, identiek
op elke pagina). Vervang de inline SVG met class `brand-mark` en de tekst in
`brand-text` door het definitieve logo. Favicon: `assets/favicon.svg`.

## Onderhoud

- De subpagina's zijn gegenereerd met een gedeeld header/footer-blok uit `index.html`.
  Wijzig je de navigatie of footer, doe dat dan op alle acht pagina's (of hergenereer).
- Tarieven staan op `tarieven.html` en zijn door de opdrachtgever bevestigd (aug 2026).
- Slagingscijfers: bron clickdrive.nl (CBR), peildatum augustus 2026. Staat als
  bronvermelding op de site; bij nieuwe cijfers ook de peildatum aanpassen.
- Het proefles-formulier opent WhatsApp: auto gaat naar Franc (06 47 40 48 44),
  motor en aanhanger naar Erico (06 54 27 24 90). Nummers staan in `js/main.js`.
