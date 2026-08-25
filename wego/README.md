# WeGo Academy, website

Statische website voor autorijschool WeGo Academy ('s-Hertogenbosch): rijles van instructeur Hikmat Alsabagh, schakel en automaat, ook op zondag.

## Lokaal draaien

```bash
node server.js
```

Daarna: http://localhost:8086 (of via `.claude/launch.json`, configuratie `wego-website`).

## Deployen

De site is volledig statisch (HTML + CSS + JS, fonts en foto's lokaal). Elke statische host werkt: Vercel, Netlify, of een gewone webserver. Upload de hele map, klaar. Pas vóór livegang de placeholder-domeinnaam `https://www.wegoacademy.nl` aan in: alle vier de HTML-bestanden (canonical + og-tags + JSON-LD), `sitemap.xml` en `robots.txt`.

## Tarieven aanpassen (één handeling)

Alle bedragen staan in `js/prices.js` in het object `WEGO_PRIJZEN`. Wijzig ze daar en elke prijs op de site verandert mee. De prijzen zijn bevestigd door de opdrachtgever via de tarievenposter (automaat) en gelden volgens de opdrachtgever ook voor schakel.

## Logo vervangen

Het wordmark is één herhaald HTML-blok (`<a class="logo">…</a>`) boven in elke pagina en in de footer. Komt er een definitief logo, vervang dan de inhoud van dat blok door een `<img>`. De favicon staat in `assets/favicon.svg`.

## Structuur

- `index.html`: home (hero, de professor, zondag, aanbod, reviews-teaser)
- `rijlessen.html`: traject, pakketten, losse tarieven, schakel/automaat
- `reviews.html`: reviewmuur (11 originele reviews, woordelijk) + geslaagdenmuur
- `proefles.html`: formulier (naam + telefoon, verstuurt via WhatsApp), contact, lestijden
- `js/prices.js`: alle tarieven
- `js/site.js`: motion (gouden lijn, reveals, menu) en het WhatsApp-formulier
- `assets/foto/`: geselecteerde klantfoto's (2 foto's met een EduCar-bord zijn bewust weggelaten)

## Redactionele keuzes

Het woord "professor" uit de reviews is nergens als merkverhaal gebruikt: het is de vertaling van het gangbare Arabische/Turkse woord voor instructeur en zegt niets onderscheidends over deze school. In de drie reviews waar het letterlijk stond, is het teruggebracht naar "meneer Hikmat".

Koppen staan op de kern (rijbewijs halen in Den Bosch, alles inbegrepen, zondag open). Headerteksten onder een titel blijven kort: alleen wat aanvult en overtuigt.

## Nog open (checklist opdrachtgever)

- E-mailadres van de school (nu niet op de site, er is geen adres bekend)
- Tweede reviewset ("extra reviews in dezelfde stijl") mag pas geplaatst na akkoord; staat nu NIET op de site
- Google-bedrijfsprofiel met score en aantal reviews voor een "Bekijk alle reviews"-knop en aggregateRating in de structured data
- Definitief logo (zie hierboven), definitieve domeinnaam
