# Motorrijschool Henk van der Eerden — website

Statische website (5 pagina's) voor Motorrijschool Henk van der Eerden, Den Bosch.
Artdirection **"Wegdek"**: asfaltzwart + wegmarkering-wit + signaal-oranje, met
hesje-geel en L-bord-blauw (uit de eigen lesfoto's) als micro-accenten.
Typografie: Archivo (variabele breedte-as — koppen "accelereren" van smal naar
breed) · Switzer · JetBrains Mono.

Signatuur-motion **"Op de weg"**: een first-person canvas-rit in de hero
(schemer, wegmarkering die op je af komt, hectometerpaaltjes met oranje
reflectoren, skyline met Sint-Jan-silhouet). De muis stuurt mee, scrollen geeft
gas, en de type-slam "DIRECT. EERLIJK. EN DAAROM HAAL JIJ HET." schakelt
letterlijk op het canvas (snelheidsboost + camera-schok per woord, 1× per
sessie voluit). De wegstreep loopt als stippellijn-signatuur door de hele site.

## Pagina's

| Bestand | Inhoud |
|---|---|
| `index.html` | Home: canvas-hero, ticker, 3-uursblok-visual (5 lessen → 1 blok), stats, waarom Henk, lesmotoren, reviews-teaser, CTA |
| `motorrijles.html` | Traject AVB → AVD, anatomie van een blokles, AVB-clusters + achtje-diagram, pakketten & tarieven, alles-inbegrepen-uitrusting, theorie |
| `over-henk.html` | Het verhaal (14 jaar → circuit → 25 jaar rijschool), de aanpak, motorverkoop, autorijles-verwijzing |
| `reviews.html` | Muur met 13 reviews + patroon "elders gezakt, bij Henk gehaald" |
| `contact.html` | Grote belnummers, mailto-formulier met chips, gestileerde SVG-kaart, route-CTA, pandfoto |

## Lokaal draaien

```bash
node server.js        # http://localhost:8060
```

Of via de launch-config `henk-website` (poort 8060).

## Deployen

De site is volledig statisch: upload de map (zonder `server.js`) naar elke
host — Netlify, Vercel of klassieke webhosting. Geen build-stap nodig.
Fonts laden via Google Fonts (Archivo, JetBrains Mono) en Fontshare (Switzer).

## Content-bronnen

- Lesconcept, examens, tarieven, theorie (Speedtheorie), motorverkoop en
  contactgegevens: overgenomen van https://henkvandereerden.nl (juli 2026).
- Foto's: 10 foto's van de huidige site (`assets/img/`), 800px breed.
- Reviews: 13 stuks, aangeleverd.
- Logo: nieuw ontworpen wordmark + H-monogram met wegstreep (het oude
  blauw/oranje badge-logo is bewust vervangen; staat los van deze site).

## Openstaand / te bevestigen door de klant

- **Tarieven bevestigen** (nu zoals gepubliceerd op de huidige site):
  blok 3 uur € 195 · 8 blokuren incl. examens € 2.049 · 10 blokuren incl.
  examens € 2.439 · AVB € 197,50 · AVD € 307,50 · theoriecursus € 109 ·
  theorie-examen € 75.
- **Portretfoto van Henk** aanleveren voor de Over Henk-pagina (nu een
  sfeerfoto van de huidige site). Nieuwe, scherpere foto's (min. 1600px)
  van lesmotoren/lessen zouden de site nog flink optillen.
- Bevestigen dat het mobiele nummer (06 24 71 74 78) ook voor WhatsApp
  gebruikt mag worden — dan kan er een appknop bij.
- Formulier werkt via mailto naar info@henkvandereerden.nl; desgewenst later
  vervangen door een echte formulier-backend (bijv. Formspree).
- Openingstijden staan nergens gepubliceerd; nu opgelost met "tijden in
  overleg". Aanleveren indien gewenst.
