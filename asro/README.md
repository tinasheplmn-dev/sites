# Rijschool Asro · website

Volledig statische site (HTML/CSS/JS, geen build-stap) voor Rijschool Asro in Den Bosch.
Concept: **de school van het bewijs**. Signatuur: het roterende "IN ÉÉN KEER"-stempel en
de routelijn die zich al scrollend tekent van gratis proefles naar het checkpoint Geslaagd.

## Lokaal draaien

```bash
node server.js
```

Site draait dan op http://localhost:8074. Ook opgenomen in `.claude/launch.json` als `asro-website`.

## Deployen

Volledig statisch: de map kan 1-op-1 naar elke host (Vercel, Netlify, gewone webruimte).
`server.js` is alleen voor lokale preview en hoeft niet mee.

## Structuur

- `index.html` – home: hero, bewijs-tellers, route-sectie, Taylan, geslaagden-carrousel, tarieven-preview, faalangst/spoed, CTA
- `werkwijze.html` – aanpak, spoedcursus (#spoedcursus), faalangst (#faalangst), On My Way app, werkgebied
- `tarieven.html` – pakketten, losse diensten, spelregels
- `geslaagden.html` – volledige reviewmuur met foto-koppeling + Google-reviewknop
- `proefles.html` – proeflesformulier (opent WhatsApp met ingevuld bericht), contact, lestijden
- `css/style.css` – volledig ontwerpsysteem (kleuren, typografie, motion)
- `js/main.js` – routelijn, tellers, carrousel, reveals, menu, formulier
- `assets/geslaagden/` – foto's van geslaagde leerlingen (bestandsnaam = reviewernaam)

Op mobiel (max 640px) staat onderaan een vaste actiebalk met WhatsApp + proefles-knop
(op de proeflespagina: bellen + WhatsApp), zoals op de andere recente rijschoolsites.
Paginakoppen volgen de koppenregel van 19 aug 2026: titel direct op het rijbewijs,
korte headertekst (± 100 tekens), boventitels met extra informatie in plaats van de paginanaam.

## Logo vervangen (als de klant een definitief logo aanlevert)

Het wordmark is één herhaald blok in elke pagina (header en footer):

```html
<a class="logo" href="index.html" ...>
  <span class="logo-naam">ASRO<span class="logo-blok"></span></span>
  <span class="logo-sub">Rijschool Den Bosch</span>
</a>
```

Vervang de twee spans door `<img src="assets/logo.svg" alt="Rijschool Asro" height="40">`
via zoek-en-vervang over de 5 HTML-bestanden. Klaar.

## Vóór livegang bevestigen bij de opdrachtgever

1. **Tarieven** (overgenomen van de huidige site, geverifieerd 7 aug 2026): pakketten €362,50 / €725 / €2.175 / €2.900, losse les €75, examens €280 tot €370.
2. **E-mailadres**: rijschoolasro@gmail.com.
3. **Schakel of automaat**: de oude site is er niet eenduidig over. Het proeflesformulier vraagt nu neutraal naar de voorkeur (schakel / automaat / nog geen idee); de sitetekst claimt nergens dat beide worden aangeboden. Aanpassen zodra bevestigd.
4. **Foto van Taylan**: nog niet beschikbaar; de portret-plek op de home is een nette, gemarkeerde placeholder ("Foto van Taylan volgt").
5. **Google-reviewlink**: verwijst nu naar de Google Maps-zoekopdracht van de school. Met het echte place-id kan dit een directe reviewlink worden (https://search.google.com/local/reviews?placeid=...).
6. **CBR-cijfers**: 77% eerste examen (299), 86% herexamen (63), 100% tussentijdse toets (317), bron CBR via Clickdrive; periodiek verversen. De oude "93%"-claim is bewust NIET overgenomen.
7. **og.png** (social share-afbeelding): staat in `assets/og.png` (1200x630, gegenereerd 20 aug 2026). Vervangen kan door gewoon het bestand te overschrijven.

## SEO

- Unieke title + meta description per pagina, plaatsnamen (Den Bosch, Rosmalen, Vught, Vlijmen) natuurlijk verwerkt
- JSON-LD `DrivingSchool` op de home met adres, geo, openingstijden en aggregateRating (4,9 / 131)
- `sitemap.xml` + `robots.txt` (domein: rijschoolasro.nl, aanpassen als het definitieve domein anders wordt)
- Eén h1 per pagina, alt-teksten op alle beelden, width/height tegen layout-shift, lazy loading
