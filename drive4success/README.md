# Drive4Success · rijschoolwebsite

Nieuwe site voor Rijschool Drive4Success (Breda, Bergen op Zoom, Tholen). Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

## Concept

**"In één keer."** De hele site is gebouwd rond het succes-verhaal: 5,0 op Google uit 87 reviews, 93% BE-slagingspercentage en "in één keer geslaagd" als terugkerende reviewzin. Het motion-concept is de **succeslijn**: een oranje route die zich tekent terwijl je scrolt, van proefles tot geslaagd-stempel.

- Kleuren: diep petrolgroen (#0A2725), champagne-ivoor (#F6EFE2), vermiljoen-oranje (#FF4D1C) met amber (#FFB25A). Bewust anders dan Marco Pas (licht oranje/zwart), MS Rijco en Henk (zwart/oranje).
- Typografie: Clash Display (koppen) + General Sans (body), lokaal in `assets/fonts/` (Fontshare, gratis licentie).
- Logo: `assets/logo.svg` (licht, voor donkere ondergrond) en `assets/logo-donker.svg`. Overal via `<img>` ingeladen: definitief logo aanleveren = beide bestanden vervangen, klaar.

## Lokaal draaien

```bash
node server.js
```

Site draait dan op http://localhost:8082 (of zet `PORT`). Via de launch-config: naam `drive4success-website`.

## Deployen

Volledig statisch: upload de map (zonder `server.js`) naar elke host, of `vercel deploy` / Netlify drop. Geen environment-variabelen nodig.

## Pagina's

| Bestand | Inhoud |
|---|---|
| `index.html` | Home: succesbelofte, cijfers met bron, aanbod, route, Jasmin, reviews, werkgebied |
| `rijbewijs-b.html` | Opbouw opleiding, lesrapport, RIS, tussentijdse toets, 2todrive, FAQ |
| `be-aanhanger.html` | BE-dagopleiding (93% in één keer, bron clickdrive.nl), dagindeling, FAQ |
| `bijzondere-rijopleidingen.html` | Faalangst, autisme/ADHD, opfris, spoed |
| `tarieven.html` | Tarievenlijst 2026 + pakketten + actie gratis rijles |
| `reviews.html` | Volledige muur: 50 reviews verbatim + Google-knop |
| `proefles.html` | Hoofdconversie: formulier (opent mail), bel/WhatsApp/mail-chips |

## Voor livegang bevestigen bij de opdrachtgever

- **Tarieven**: overgenomen van de Tarievenlijst 2026 van de oude site (screenshot in de briefing). Vóór livegang laten bevestigen, inclusief de vraag of de actie (gratis rijles per aangebrachte inschrijving, max. 2) nog loopt.
- **Foto's**: Jasmin, de lesauto en de BE-combinatie (VW Transporter + aanhanger) ontbreken. Op drie plekken staan gemarkeerde placeholders (`.placeholder`); vervang de inhoud van de `.media-frame` door een `<img>` zodra beeld er is.
- **Formulier**: het proefles-formulier opent nu het mailprogramma van de bezoeker (mailto naar info@drive4success.nl); er is geen backend. Wil de opdrachtgever aanvragen direct in een inbox zonder mail-stap, koppel dan een formulierdienst (bijv. Formspree) in `js/main.js`.
- KVK-nummer en voorwaarden voor de footer.

## Bronnen van de cijfers (niet wijzigen zonder nieuwe bron)

- 5,0 uit 87 reviews: Google (opdrachtgever bevestigd).
- 93% BE eerste examen (118 examens) en 62% B eerste examen (969 examens): clickdrive.nl, officiële CBR-cijfers.
- Zo'n 20 jaar ervaring: clickdrive.nl.
