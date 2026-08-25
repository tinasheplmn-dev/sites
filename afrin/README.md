# Rijschool Afrin · website

Volledig nieuwe site voor Rijschool Afrin (instructeur Hydar, Tilburg). Eerste digitale gezicht van het merk: er was nog geen website. Statische multi-page site, geen build-stap.

## Artdirection

- **Palet:** donkergroen (knoppen, accenten) op een donkere, groenzwarte basis. Het groen komt van het bestaande daklicht en het geslaagd-bord; het blauw van het L-bordje wordt spaarzaam als tweede accent gebruikt.
- **Signatuur-motion:** "de middenstreep". Een wegmarkering loopt als rail langs de linkerkant van elke pagina; een klein autootje rijdt op scrolltempo mee van boven naar beneden. Verder: rustige reveals, tellers, de filmstrip in de hero en een lichtbak op de geslaagd-pagina.
- **Typografie:** Bricolage Grotesque (koppen) + Instrument Sans (tekst), via Google Fonts.
- **Wordmark:** het `.merk`-blok (daklicht-stijl badge met blauwe L) staat in de kop- en voettekst van elke pagina. Komt er later een echt logo, dan alleen dat blok vervangen.
- **Hoofdbewijsstuk:** de geslaagden-serie (zelfde bord, zelfde Golf, alle seizoenen), als filmstrip op de home en als seizoensgalerij op geslaagd.html.

## Draaien

```bash
node websites/afrin-website/server.js
```

Draait op http://localhost:8090 (ook als `afrin-website` in `.claude/launch.json`).

## Deployen

Volledig statisch: elke host werkt. Voor Vercel: map als project importeren, `vercel.json` (cleanUrls) zit erbij. Geen environment variables nodig.

## Bestanden

- `index.html`, `rijlessen.html`, `tarieven.html`, `geslaagd.html`, `over-hydar.html`, `proefles.html`
- `css/main.css` (volledig ontwerpsysteem), `js/main.js` (motion en interactie)
- `assets/img/geslaagd-01..14.jpg` (galerijformaat, ~1000px) + `-s.jpg` (filmstripformaat, 480px), `og.jpg`, `favicon.svg`
- `sitemap.xml`, `robots.txt`, `vercel.json`

Bronbeelden: `websites/klant-content/Rijscholen/Afrin/` (Instagram-screenshots, bijgesneden: 6% van de hoogte en 1% van de breedte eraf tegen interface-restjes). Volgorde is een seizoensverloop: 01 lente, 02-08 zomer, 09-11 herfst, 12-14 winter.

## Feiten en bronnen op de site

- Google: 5,0 uit 78 reviews (door opdrachtgever aangeleverd, link: https://share.google/ITwttfa0OOQ3obj16)
- Trustoo: 9,5 uit 74 reviews (trustoo.nl/noord-brabant/tilburg/rijschool/rijschool-afrin/)
- Slagingspercentage 76,9% (CBR-cijfer, door opdrachtgever aangeleverd)
- 22 jaar ervaring, talen NL/EN/Koerdisch/Arabisch, openingstijden ma-vr 08:00-17:00 en za 08:00-13:00: alle door opdrachtgever bevestigd
- Aanbod (schakel/automaat, faalangst, ADD/ADHD, spoed, avond/weekend): uit de eigen Trustoo-vermelding van de school
- Alle reviews staan verbatim op de site (bron: `Reviews afrin.txt`)

## Open punten vóór livegang

1. **Domein:** overal staat `https://rijschoolafrin.nl` (canonical, OG, sitemap, robots, JSON-LD). Vervangen zodra het echte domein bekend is.
2. **E-mailadres:** opdrachtgever leverde `rijschoolafin@gmail.com` aan (zonder r in "afrin"). Mogelijk een typfout; vóór livegang bevestigen. Staat in: alle pagina's (voettekst), proefles.html, js/main.js (mailto van het formulier), index.html (JSON-LD).
3. **Tarieven:** bedragen ontbreken bewust ("prijs op aanvraag"). Zodra de prijzen er zijn: `tarieven.html` invullen.
4. **Foto van Hydar:** de portretkaart op `over-hydar.html` is een vormgegeven plaatsvervanger (daklicht-mockup). Vervangen zodra er een echte foto is.
5. **Facebook en Snapchat** staan op het daklicht maar zijn zonder links; alleen Instagram en TikTok staan op de site.
