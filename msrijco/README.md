# M&S Rijopleidingen — website

Nieuwe site voor M&S Rijopleidingen en Coaching (Den Bosch): auto, motor en de voortgezette motorrijopleiding.

## Concept

"De ideale lijn": een licht porseleinen canvas waarop één doorlopende oranje lijn (de rijlijn die je hier leert) zich al scrollend door elke pagina tekent. Zwart is precisie (typografie, meetstreepjes), oranje is de lijn. Bewust het tegenovergestelde van rauw/asfalt: chirurgisch en coachend.

- Fonts: Clash Display (koppen) + Satoshi (tekst), via Fontshare.
- Motion: SVG-lijnen met stroke-dash die zich tekenen (`data-teken`), rijdende stip via SMIL `animateMotion`, reveal-systeem met IntersectionObserver, reviewmarquee. Respecteert `prefers-reduced-motion`.
- Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

## Draaien

```bash
node server.js
```

Draait op http://localhost:8075 (of via de launch-config `msrijco-website`). Extensieloze URL's (`/autorijlessen`) worden door de server naar `.html` gemapt.

## Deployen

Statische host volstaat. Voor Vercel staat `vercel.json` klaar (`cleanUrls` zodat `/autorijlessen` werkt):

```bash
vercel --prod
```

## Later aanvullen (staat klaar)

- **Foto's Sahar & Mehran**: in de `figure.portret`-blokken (home + over-ons) een `<img src="..." alt="...">` als eerste kind toevoegen; de placeholder (monogram + "Foto volgt") valt er dan automatisch achter weg. Zoek op `data-foto`.
- **Logo**: het wordmark is één component (`.wordmark` in elke pagina, styling in css/style.css). Echte logo aangeleverd? Vervang de inhoud van de `<a class="wordmark">`-blokken door één `<img>`.
- **Google-score/aantal**: pas dan `aggregateRating` toevoegen aan de JSON-LD (bewust weggelaten, geen cijfers zonder bron).
- **Openingstijden**: nog niet aangeleverd; dan toevoegen aan JSON-LD (`openingHoursSpecification`) en de contactpagina.
- **Formulier**: opent WhatsApp met vooringevuld bericht (geen backend nodig). Wil de klant e-mail-ontvangst, koppel dan een form-service.

## Bronnen

Content komt van de oude site (msrijco.nl) en het reviews-document in `websites/klant-content/Rijscholen/M&S R/`. Tarieven zijn door de opdrachtgever aangeleverd/bevestigd (aug 2026). Geen CBR-cijfers of Google-score gebruikt: niet aangeleverd.
