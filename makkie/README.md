# Rijschool Makkie · website

Nieuwe site voor Rijschool Makkie, autorijschool in Tilburg (instructrice Maja).
Volledig statisch: HTML + CSS + vanilla JS, zelf gehoste fonts, eigen iconenset.

## Huisstijl "De gouden route"

- Palet: warm beige canvas (`#F4EBDA`), koffiebruin anker (`#3A2A1A` / `#281C10`), goud accent (`#BC8434`). Blauw alleen voor het L-bordje.
- Typografie: Young Serif (koppen), Figtree (tekst), Caveat (marker-handschrift voor "makkie"-accenten).
- Motion-concept: een gouden routelijn tekent zich al scrollend over elke pagina, met een stip die de route rijdt (`js/makkie.js`). Reveals, marquee en polaroid-parallax ondersteunen dat ene idee.
- Merkritueel: het "GESLAAGD! Het was een... MAKKIE"-bord komt terug als CSS-component (`.bord`), in de fotomuur en in de hero.
- Logo: het daklicht van de lesauto, als één SVG-symbool (`#logo-daklicht`, staat in de sprite bovenin elke pagina). Komt er later een echt logo, vervang dan alleen dat ene symbool.

## Lokaal draaien

```bash
node server.js
```

Site draait dan op http://localhost:8080. Geen build-stap, geen dependencies.

## Deployen

Statische host naar keuze. Voor Vercel staat `vercel.json` klaar (cleanUrls):

```bash
npx vercel --prod
```

## Structuur

- `index.html`, `over-maja.html`, `tarieven.html`, `geslaagd.html`, `proefles.html`
- `css/makkie.css`: het volledige designsysteem
- `js/makkie.js`: routelijn, reveals, menu, slider, lightbox, WhatsApp-formulier
- `assets/img/geslaagd/`: 23 geslaagden-foto's (1000px) + `thumb/` (560px) voor de muur
- `assets/fonts/`: zelf gehoste woff2-fonts
- `sitemap.xml`, `robots.txt`, JSON-LD (DrivingSchool) op elke pagina

## Voor livegang bevestigen bij de opdrachtgever

- Tarieven (losse les €65 bevestigd; pakket €2.450, toetsen/examens van de oude site)
- Google-reviewlink voor een "Bekijk alle reviews"-knop (score 5,0 uit 17 staat er al)
- Eventueel portret en volledige naam van Maja voor de over-pagina
- Domeinkoppeling rijschoolmakkie.nl (canonicals staan op www.rijschoolmakkie.nl)
