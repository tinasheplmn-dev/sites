# Rijles Mera · website

Volledig statische site voor Rijles Mera, autorijschool in 's-Hertogenbosch (prompt 37 uit de rijscholen-reeks).

## Concept

- **Verhaal:** simpel en professioneel, gericht op het rijbewijs ("Haal je rijbewijs in Den Bosch"). De site is gebouwd rond de route van proefles naar examen.
- **Foto's:** er is geen foto van Mera zelf; alle foto's zijn geslaagde leerlingen. De herofoto draagt daarom het label "Net geslaagd, leerling van Rijles Mera" zodat niemand de leerling voor de instructeur aanziet. Alle geslaagdenfoto's tonen op hun natuurlijke beeldverhouding (geen crops).
- **Branding:** diep petrol + honing-amber op warm room. Typografie: Fraunces (display) + Instrument Sans (tekst), lokaal gehost in `assets/fonts/`.
- **Motion:** één concept, overal doorgevoerd: de route tekent zichzelf (hero-lijn bij laden, punt-routelijn op scroll bij de haltes), plus richtingaanwijzer-knipper op de CTA-knoppen en reveals. `prefers-reduced-motion` wordt gerespecteerd.

## Draaien

```bash
node websites/rijlesmera-website/server.js
```

Daarna: http://localhost:8075 (of via de launch-config `rijlesmera-website`). De site is volledig statisch; `server.js` is alleen voor lokale preview.

## Deployen

Upload de hele map (zonder `server.js`) naar elke statische host (Vercel, Netlify, gewone webruimte). Geen buildstap nodig.

## Logo vervangen

Het logo bestaat uit twee bestanden plus een tekst-wordmark:
- `assets/img/logo-icoon.svg` (donkere versie, header + favicon)
- `assets/img/logo-icoon-licht.svg` (lichte versie, footer)

Definitief logo van de opdrachtgever? Vervang die twee SVG's (zelfde bestandsnamen) en klaar. De naam "Rijles Mera" naast het icoon is gewone tekst (`.logo-naam`).

## Structuur

| Bestand | Inhoud |
|---|---|
| `index.html` | Home: hero, marquee met reviewzinnen, route (4 haltes), waarom Mera, aanbod, reviews, geslaagden-strook, CTA |
| `rijlessen.html` | Traject in 5 haltes, schakelauto, op je gemak/taal, examenvormen |
| `tarieven.html` | Lestarieven, familievoordeel, examentarieven, zo werkt betalen |
| `geslaagden.html` | Muur met 11 foto's + alle 24 reviews (verbatim) |
| `over-mera.html` | Merhawi als persoon, feitenblok, werkgebied |
| `proefles.html` | Bel/app/mail/adres-kaarten + minimaal formulier dat een WhatsApp-bericht klaarzet |

SEO: unieke title/description per pagina, canonical, OG-tags, JSON-LD `DrivingSchool` op elke pagina (met Offers op de tarievenpagina), `sitemap.xml`, `robots.txt`, alt-teksten op alle beelden, fonts en beelden lokaal.

## Bewust weggelaten (afspraken uit de briefing)

- **Geen slagingspercentages of leerlingaantallen.** De cijfers op de oude site (896+, 98%, 5 sterren) bevatten template-restanten ("Replace large numbers with realistic") en zijn niet verifieerbaar; bewust niet overgenomen.
- **Geen aggregateRating in JSON-LD** zolang er geen geverifieerde reviewscore + aantal is.
- **Geen taalclaims** (Tigrinya/Engels): niet bevestigd door de opdrachtgever. Wel de veilige formulering "ook als Nederlands niet je eerste taal is".
- **Geen openingstijden** op de site of in JSON-LD: alleen "Open · sluit 17:00" bekend, zonder dagen.
- **Geen automaat-claim:** de oude site noemt alleen schakel.

## Vóór livegang door de opdrachtgever te bevestigen

1. Tarieven (€50 losse les, €100 lesblok, examens €250/€300/€350/€350) en de voorwaarden van het familievoordeel.
2. Adres Zesde Slagen 3 als publiek adres, en e-mail info@rijlesmera.nl (moet nog aangemaakt/gekoppeld worden).
3. Openingstijden per dag (voor site + JSON-LD `openingHours`).
4. Talen die Mera in de les spreekt (kan een USP-sectie worden).
5. Google-reviewscore + aantal (dan kan aggregateRating erbij).
6. Werkgebied-plaatsen (nu: Den Bosch, Rosmalen, Vught, Empel, Engelen, Maaspoort).
7. Domein rijlesmera.nl koppelen; alle canonicals/sitemap staan al op dat domein.

## Content

Foto's komen uit `websites/klant-content/Rijscholen/Rijschool Mera/` (lokaal verkleind naar `assets/img/`, max 1600px, geen hotlinks). Reviews woordelijk uit `Rijschool mera reviews.txt`.
