# Rijschool De Draak — website

Volledig statische site (HTML/CSS/JS, geen build-stap) voor Rijschool De Draak, 's-Hertogenbosch/Rosmalen. Concept: Bosch' zwart en goud met de draak als merkdrager. Signaturen: het drakenoog in de hero (volgt de muis, knippert), de drakenstaart-lijn met pijlpunt die zichzelf tekent bij scroll, subtiel schubbenpatroon en de Bossche skyline in de footer.

## Lokaal draaien

```bash
node server.js
```

Site draait dan op http://localhost:8091 (of gebruik de launch-config `draak-website`).

## Deployen

De site is volledig statisch: upload de hele map (zonder `server.js` en `README.md`) naar elke host, of zet hem op Netlify/Vercel/Cloudflare Pages zonder configuratie. `sitemap.xml` en `robots.txt` staan klaar; pas de domeinnaam daarin aan als het domein anders wordt dan www.rijschooldedraak.nl.

## Structuur

- `index.html` — home (hero met drakenoog, cijfers, keuze auto/motor, William, werkwijze, reviews, geslaagden, CTA)
- `autorijles.html` — modulair lesplan, 2toDrive, tussentijdse toets, examendag, FAQ
- `motorrijles.html` — 120-minutenblokken, Kawasaki Z650, A/A2/A1/code 80, AVB/AVD, uitrusting
- `tarieven.html` — auto- en motorpakketten plus losse tarieven
- `geslaagden.html` — fotomuur (19 foto's) + alle 21 reviews
- `proefles.html` — gratis proefles: contact + formulier (opent WhatsApp met ingevuld bericht)
- `css/style.css`, `js/main.js`, `assets/img/` (foto's), `assets/favicon.svg`

## Logo vervangen

Het logo is één herhaald SVG-blok in de header en footer van elke pagina, gemarkeerd met het commentaar `Logo-component`. Komt er een definitief beeldmerk, vervang dan dat SVG-blok (of zet er een `<img>` voor in de plaats) in de 6 pagina's. Het aangeleverde AI-logo uit de briefing had spelfouten in de tekst ("DE DRAAKL") en is daarom niet gebruikt; de stijl ervan (gouden draak, L-bord, kathedraal) is wel de basis van de artdirection.

## Vóór livegang bevestigen bij de opdrachtgever

1. **Tarieven** — overgenomen van de huidige site (auto A/B/C €2350/€2685/€2995, extra 10 lessen €675, losse les €70, TTT en examen €300 incl. 1 rijles; motor A/B/C €1175/€1850/€2525, AVB €195, AVD €305).
2. **"Meest gekozen"** — op de tarievenpagina staan Pakket Auto B en Pakket Motor B gemarkeerd als "Meest gekozen"; laten bevestigen of anders aanpassen.
3. **CBR-examinator-achtergrond van William** — claim van de huidige site, prominent gebruikt op home en autorijles-pagina.
4. **Clickdrive-cijfers** — 5,0/5 uit 9 reviews; TTT 100% (43/43); praktijkexamen 85% (29/34). Bron staat overal vermeld; clickdrive ververst periodiek, dus vlak voor livegang nog eens controleren.
5. **Adres en openingstijden** — nergens op de oude site gevonden; daarom nog niet op de site en niet in de structured data. Toevoegen zodra bekend (footer + JSON-LD in `index.html`).
6. **Korting Motoport Den Bosch** — vermeld op motorrijles-pagina (van de oude site); bevestigen dat die afspraak nog loopt.

## SEO

- Unieke title/description per pagina, plaatsnamen (Rosmalen, Den Bosch, Empel, Berlicum, Hintham) in koppen en teksten
- JSON-LD `DrivingSchool` met aggregateRating op de homepage (adres/openingstijden nog aanvullen)
- Sitemap, robots.txt, OG-tags, alt-teksten, één h1 per pagina, lazy loading op beelden
