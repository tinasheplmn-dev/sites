# Verkeersschool Weber · website

Vlaggenschip-site uit de rijscholenreeks (prompt 67). Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

## Draaien

```bash
node server.js
```

Site draait dan op http://localhost:8077 (of via de launch-config `weber-website`).

## Deployen

Statische host naar keuze. Voor Vercel: map koppelen en klaar (`vercel.json` regelt nette URL's zonder `.html`).

## Opbouw

- `index.html` + 7 subpagina's (autorijlessen, motorrijlessen, theorie, videos, over-weber, samenwerkingen, contact) + `privacy.html`
- `css/style.css`: het volledige designsysteem (concept "Vooruitkijken": groen routespoor als lijndraad, kilometerpaal-secties, tellers)
- `js/main.js`: routespoor-scrollvoortgang, tellers, reveals, hero-parallax, video-facades (speler laadt pas bij klik), reviewtabs, rekenhulp, mailto-formulieren
- `assets/beeldmerk.svg`: het Weber-beeldmerk als SVG (ook favicon). Vervangbaar door een aangeleverd vectorlogo in één handeling.
- `assets/iconen.svg`: eigen lijniconenset (sprite)
- `assets/img/`: lokaal opgeslagen beelden, incl. YouTube-posterframes (geen hotlinks naar de oude site)
- `assets/mediakit-verkeersschool-weber-2026.pdf`: de echte mediakit, gekoppeld op de samenwerkingenpagina

## Voor livegang bevestigen bij de opdrachtgever

- Tarieven (overgenomen van de oude site, 2026)
- Google-score staat op 4,8 uit 78 reviews (bevestigd); aggregateRating staat in de JSON-LD van home en contact
- Formulieren werken nu via mailto; koppel desgewenst een formulierdienst of eigen endpoint (zie `data-mailform` in `js/main.js`)
