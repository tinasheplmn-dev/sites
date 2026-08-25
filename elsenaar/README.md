# Rijschool Elsenaar — website

Nieuwe site voor Autorijschool Elsenaar (Geldrop, sinds 1991, sinds april 2026 van Jessica).
Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

## Branding

- Kleuren: diep petrol (#0F3536), warm linnen (#F6F2E8), koper (#C06B36). Bewust uniek binnen de rijscholen-reeks en passend bij de oranje lesauto's.
- Typografie: Fraunces (display) + Instrument Sans (tekst), via Google Fonts.
- Motion-concept: "de doorgetekende route" — SVG-routelijnen die op scroll tekenen, met meereizende stip (de lesauto). Zie `js/main.js`.
- Logo: eigen beeldmerk in `assets/beeldmerk.svg` (één asset, overal via `<img>`); levert de klant later een logo, dan alleen dat bestand vervangen.
- Eigen iconenset in `assets/iconen.svg` (SVG-sprite).

## Draaien

```bash
node server.js
```

Site op http://localhost:8079. Of via de launch-config `elsenaar-website` (poort 8079).

## Deployen

Statische host volstaat. Voor Vercel: map deployen, `vercel.json` regelt cleanUrls.

## Pagina's

index (home) · rijlessen · theorie · tarieven · team · reviews · aanmelden
Plus: sitemap.xml, robots.txt, JSON-LD (DrivingSchool + aggregateRating 4,9/221) op elke pagina.

## Open punten voor de opdrachtgever

- Tarieven 2026 bevestigen vóór livegang (overgenomen van de oude site).
- Portretfoto's team + betere teamfoto/lesauto-foto's aanleveren; huidige teamfoto (`assets/img/lesauto.jpg`, 1252×403 van de oude site) is aan de lage kant voor retina.
- Definitief logo (optioneel): vervang `assets/beeldmerk.svg`.
- Aanmeldformulier werkt nu via mailto; desgewenst later koppelen aan een formulier-backend.
- PlanGo-link controleren (nu plangoapp.com).
