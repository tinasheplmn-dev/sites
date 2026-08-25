# Rijschool GP · website

Volledig statische site voor Rijschool GP (Gijs Peters, Rosmalen). Geen build-stap,
geen dependencies: HTML + CSS + vanilla JS, fonts en beelden lokaal.

## Lokaal draaien

```bash
node server.js
```

De site draait dan op http://localhost:8093 (poort aanpasbaar via `PORT=...`).
Of via de launch-config: naam `gp-website` in `.claude/launch.json`.

## Deployen

Upload de hele map naar elke statische host (Netlify, Vercel, Cloudflare Pages,
klassieke hosting). Interne links zijn extensieloos (`/tarieven`); zet daarvoor
"clean URLs" aan (Netlify: standaard; Apache: `Options +MultiViews` of een
rewrite van `/x` naar `/x.html`). Verder is niets nodig.

## Logo vervangen

Het wordmark staat als HTML in elke pagina in `<span class="logo-merk">` (header
en footer). Definitief logo ontvangen? Vervang die span door
`<img src="/assets/logo.svg" alt="Rijschool GP" height="34">` en zet het bestand
in `assets/`. Zoek-en-vervang over de vijf html-bestanden is voldoende.

## Voor livegang nog bevestigen door de opdrachtgever

- Tarieven 2025 bevestigd als actueel (bron: huidige site, akkoord gegeven).
- Google-score 4,8 uit 23 reviews: check vlak voor livegang of dit nog klopt
  (staat in de vertrouwensstrip, de geslaagden-pagina en de structured data
  in `index.html`).
- Instagram-link in de footer is nog een placeholder (instagram.com): exacte
  profiel-URL aanleveren.
- Openingstijden onbekend; daarom bewust weggelaten (ook uit structured data).
- Foto `assets/img/geslaagd-01.jpg` is verwijderd: het aangeleverde screenshot
  toonde een dakbord van een andere rijschool (Rob Moggré) en hoort niet bij GP.

## Structuur

- `index.html`: home (hero met werkgebied-kaart en dakbord, routelijn-sectie)
- `over-gijs.html`: verhaal, aanpak, RIS-methode
- `tarieven.html`: lessen, proefles-regeling, examens in mensentaal
- `geslaagden.html`: muur met 24 foto's + alle 20 reviews
- `proefles.html`: aanvraagformulier (opent WhatsApp), contact, werkgebied
- `css/style.css`: volledig designsysteem (papierwit / oranje / inktblauw)
- `js/main.js`: motion: routelijn, dakbord-tilt, marquee, reveals, formulier
- `assets/`: fonts (lokaal), beelden (lokaal), favicon, logo
