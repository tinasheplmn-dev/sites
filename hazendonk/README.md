# Hazendonk Rijopleidingen · website

Nieuwe site voor Verkeersschool Marc van Hazendonk (voorheen online als "Rijles4You"), Rosmalen.
Concept: **De Blauwdruk**. Wit tekenpapier, eigen inktblauw, technisch lijnwerk dat zichzelf tekent,
maatlijnen en stempels. Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

## Lokaal draaien

```bash
node server.js
```

Site draait dan op http://localhost:8100 (of zet `PORT=...` ervoor).

## Deployen

Alles in deze map is productieklaar statisch bestand. Uploaden naar elke host
(Vercel, Netlify, klassieke hosting) volstaat. Geen dependencies, geen build.

## Content bijwerken (bewust makkelijk gemaakt)

- **Reviews, geslaagden, nieuws:** alles staat in `js/data.js`. Eén blokje toevoegen aan de
  juiste lijst is genoeg; de pagina's renderen het automatisch (reviewmuur, geslaagdenmuur,
  nieuwssectie). Foto's van geslaagden in `assets/geslaagden/` zetten en het pad invullen.
- **Logo:** de opdrachtgever levert mogelijk later een definitief logo. Vervang dan alleen
  `assets/logo-monogram.svg` (en `assets/favicon.svg`); het logo verandert overal mee.
- **Foto's:** `assets/foto/` bevat de twee bruikbare foto's van de oude site (de echte
  lescombinatie). Placeholder-slots voor Marc, de lesauto en geslaagden zijn gemarkeerd
  in de vulblokken op de site.

## Door de opdrachtgever te bevestigen vóór livegang

- Pakketprijzen (overgenomen van rijles4you.nl/prijzen.html, prijspeil 2026: 2.150 / 2.500 / 2.750 / 3.225).
- De badge "Meest gekozen" staat nu op Compleet plus; dat is een aanname, laat Marc kiezen welk pakket hem verdient.
- Losse-lesprijs, BE-tarief, losse examenprijzen (staan nu als "tarief op aanvraag").
- Lesdagen/openingstijden (oude site vermeldde 09:30 tot 18:00; site zegt nu "in overleg").
- Google-reviewscore 5,0 uit 11 (bron clickdrive.nl, aug 2026). Het `aggregateRating`-blok
  in de JSON-LD op `index.html` staat klaar in een commentaarblok en wordt pas actief gemaakt
  na akkoord.
- Domeinnaam: alle SEO-tags verwijzen naar https://www.hazendonkrijopleidingen.nl/
  (de naam die ook op de aanhanger staat). Wordt het toch rijles4you.nl, dan de canonical-,
  OG- en sitemap-URL's aanpassen.
- E-mailadres blijft info@rijles4you.nl tot er een nieuw adres is.

## Structuur

- `index.html` · home (blad 01)
- `autorijles.html` · rijbewijs B (blad 02)
- `aanhanger.html` · BE-landingspagina (blad 03)
- `maatwerk.html` · faalangst, autisme, ADHD, rijangst (blad 04)
- `tarieven.html` · pakketten en losse tarieven (blad 05)
- `reviews.html` · reviewmuur, geslaagdenmuur, nieuws (blad 06)
- `contact.html` · proefles-formulier, opent WhatsApp met ingevulde aanvraag (blad 07)
