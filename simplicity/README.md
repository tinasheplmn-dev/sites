# Rijschool Simplicity — website

Volledig statische, tweetalige site (NL + EN) voor Rijschool Simplicity in Eindhoven.
Ontwerpconcept: "De vaste hand" — papier, inkt en diep petrol, met Fraunces + Instrument Sans
(lokaal gehost in `assets/fonts/`). Geen build-stap, geen dependencies.

## Lokaal draaien

```
node server.js
```

Daarna: http://localhost:8099 (of via de launch-config `simplicity-website`).
De server ondersteunt nette URL's zonder `.html` (bijv. `/tarieven`, `/en/prices`).

## Structuur

- NL: `index.html`, `rijlessen.html`, `engelse-rijlessen.html`, `tarieven.html`, `reviews.html`, `proefles.html`
- EN: `en/index.html`, `en/lessons.html`, `en/english-lessons.html`, `en/prices.html`, `en/reviews.html`, `en/trial-lesson.html`
- Taalwissel zit in de header; de keuze wordt onthouden (localStorage) en elke pagina heeft
  correcte `hreflang`-paren. `sitemap.xml` bevat beide talen.
- Het proeflesformulier opent WhatsApp (06 14 35 08 54) met een vooringevuld bericht; er is geen backend nodig.

## Logo vervangen

Het logo staat op één plek: `assets/logo.svg` (badge). Vervang dat bestand door het
definitieve logo en het wisselt overal mee (header, footer, alle pagina's). Het
tekstgedeelte ("Simplicity / Rijschool Eindhoven") staat als HTML in de headers en
footers; pas het zo nodig aan met zoeken en vervangen.

## Deployen (Vercel)

De site is volledig statisch. `vercel.json` staat klaar met `cleanUrls`. Importeer de map
als project in Vercel en klaar. Elke andere statische host werkt ook.

## Vóór livegang bevestigen met de opdrachtgever

- Tarieven (overgenomen van de huidige site, per 01-07-2026)
- Google-score en aantal reviews (nu: 4,9 uit 77) in teksten, JSON-LD en de reviewknop
- E-mailadres (nu niet op de site; alleen telefoon/WhatsApp)
