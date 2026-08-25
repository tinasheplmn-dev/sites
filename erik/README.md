# Rijschool Erik — website

Nieuwe site voor Rijschool Erik (Eindhoven). De site draait om wat de bezoeker wil: zijn rijbewijs halen.

Concept: **"Het pasje."** Het rijbewijs is het visuele hart van de site (een 3D-kaart die op desktop met je muis meekantelt en op mobiel met je scroll), en het is ook de rode draad in de teksten: kort, doelgericht, geen verhalen over de rijschool zelf. Palet: koel papierwit met diep marineblauw en signaalrood. Typografie: Clash Display (display) + Switzer (tekst), lokaal gehost. Mobile-first opgebouwd: de basis-CSS is de telefoon, media queries schalen naar tablet (640px) en desktop (900px).

## Lokaal draaien

```bash
node websites/erik-website/server.js
```

Draait op http://localhost:8096 (ook als `erik-website` in `.claude/launch.json`). Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

De HTML wordt gegenereerd (nav, footer en CTA zijn gedeeld). Het generatorscript staat in de scratchpad van de bouwsessie; de gegenereerde HTML in deze map is de bron van waarheid en kan gewoon met de hand verder bewerkt worden.

## Deployen

Elke statische host werkt (Vercel/Netlify: deze map als root). `server.js` is alleen voor lokale preview.

## Structuur

- `index.html` — hero met het 3D-pasje, trustbalk, drie stappen, tarieven-preview, geslaagden, drie reviews, CTA
- `tarieven.html` — vijf pakketten, losse les, herexamen, korte FAQ
- `werkwijze.html` — zes stappen van proefles tot examen
- `over-erik.html` — kort verhaal + geteld welke woorden terugkomen in de reviews
- `reviews.html` — alle 30 reviews + Google-knop (5,0 uit 86)
- `proefles.html` — hoofdconversie: formulier dat een ingevuld WhatsApp-bericht opent, plus tel/mail, lestijden, werkgebied
- `css/styles.css` — ontwerpsysteem, tokens bovenin, mobile-first
- `js/main.js` — het pasje (muis/scroll), reveals, mobiel menu, mobiele actiebalk, formulier
- `assets/logo.svg` — **vervangbaar merkteken; vervang dit ene bestand (en `assets/favicon.svg`) zodra het definitieve logo er is**
- `assets/img/geslaagden/` — 7 geoptimaliseerde foto's uit de klant-contentmap
- `assets/img/bron/` — origineel beeld van de oude site (alleen referentie, uitgesloten in robots.txt)
- `sitemap.xml`, `robots.txt`, JSON-LD `DrivingSchool` (met echte aggregateRating 5,0/86) op home, reviews en proefles

## Mobiel

Mobiel is leidend. Vaste actiebalk onderin (proefles + WhatsApp) die verschijnt zodra je scrollt, telefoonknop in de navigatie, formuliervelden van minimaal 50px hoog, knoppen over de volle breedte. Gemeten op 375px: geen horizontale scroll (`scrollWidth` = `clientWidth` = 375).

## Vóór livegang bevestigen bij de opdrachtgever

1. **Tarieven** (van de oude site): A 20u €1.643 · B 25u €1.968 · C 30u €2.293 · D 35u €2.615 · E 40u €2.943 (alle incl. praktijkexamen + theoriecursus) · losse les 60 min €69 · herexamen €343.
2. **Betalen in termijnen** staat als mogelijkheid op de site; exacte voorwaarden bespreekt Erik zelf.
3. **Lestijden**: ma t/m za 9:00-20:00, zo gesloten (aangeleverd door opdrachtgever).
4. **Foto van Erik ontbreekt**: alle aangeleverde beelden zijn geslaagden-foto's. Een portret van Erik en een goede foto van de Mokka zouden home en de over-pagina sterker maken.
5. **Geen slagingspercentage-claims** op de site (bewust). Het bewijs leunt op de 5,0 uit 86 en de reviews zelf. De tellingen op de over-pagina ("18× in één keer geslaagd", "15× duidelijke uitleg", "13× gezellig/humor", "11× geduldig") zijn geteld op het aangeleverde reviews-document met 30 reviews.
6. Domeinkoppeling: canonicals en sitemap staan op https://www.rijschoolerik.nl/.
