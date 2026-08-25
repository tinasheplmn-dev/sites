# Verkeersschool M. van Heugten — website

Volledig nieuwe site voor de allround verkeersschool van Michael van Heugten (Den Bosch/Rosmalen): licht canvas, verkeersrood als actiekleur, het blauwe L-hexagon als merkanker en kenteken-chips voor de bewijsvoering. Motion-concept: de routelijn (wegmarkering die met de scroll meetekent) plus scroll-reveals en een geslaagden-fotowaaier.

## Draaien

```bash
node server.js
```

Site draait dan op http://localhost:8101 (of gebruik de launch-config `heugten-website`). Statische site: geen build-stap, geen dependencies.

## Deployen

Vercel: map `websites/heugten-website` als project koppelen, klaar (`vercel.json` staat klaar met cleanUrls). Elke andere statische host werkt ook: hele map uploaden.

## Structuur

- `index.html` — home (hero, USP's, opleidingen-hub, route, cijfers, verhaal, team, reviews, geslaagd-muur, FAQ-preview, CTA)
- Categoriepagina's: `autorijles`, `spoedcursus`, `motorrijles`, `scooter`, `brommobiel`, `aanhanger-be`, `taxi`, `theorie` (elk met pakketten + officiële CBR-examenvideo)
- `tarieven.html`, `team.html`, `reviews.html` (filterbaar per categorie), `faq.html` (met FAQPage structured data), `contact.html` (proefles-formulier via mailto)
- `css/style.css` + `js/main.js` — gedeeld designsysteem en motion
- SEO: unieke titles/descriptions, JSON-LD DrivingSchool (home) met adres/openingstijden/rating, `sitemap.xml`, `robots.txt`, OG-tags

## Logo vervangen

Het merk staat als inline SVG (`.brand__mark`, blauw hexagon met L) in de header/footer van elke pagina plus `assets/favicon.svg`. Definitief logo later: één zoek-en-vervang op het `<svg class="brand__mark">`-blok.

## Teamfoto's toevoegen

In `team.html` staat per instructeur een commentaarregel in de kaart: zet de foto in `assets/img/team/` en vervang de `<span class="member__initial">` door de `<img>` uit het commentaar.

## Vóór livegang bevestigen door de opdrachtgever

1. **Alle tarieven** (overgenomen van de huidige site): auto €2.745 / €2.845 / spoed €3.225, motor €112,50 / €1.495 / €2.095, scooter €475 / €645 / €649, brommobiel €645 / €925 / €1.195, BE €849 / €1.125, theorie €125 / €175 (actietarieven).
2. **Motorpakketten**: inhoud (12 resp. 20 uur les, AVB + AVD) komt van de pakketkaarten op de huidige site.
3. **Theorie-actietarief**: doorgestreepte prijzen (€150/€200) alleen tonen zolang de actie loopt.
4. E-mailadres en Google-reviewlink staan erin zoals aangeleverd.
