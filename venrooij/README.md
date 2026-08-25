# Rijschool van Venrooij, Rosmalen

Nieuwe website rond het concept **"Het gele bord"**: de hele site rijdt richting het moment
dat je het GESLAAGD-bord vasthoudt. Branding: bord-geel, inkt en roomwit; typografie
Bricolage Grotesque + Instrument Sans + Caveat (Franks aantekeningen in de kantlijn).
Motion-signatuur: één doorlopende gele routelijn over de homepage waar een getekend
Puma'tje (bovenaanzicht, met L-daklicht) overheen rijdt op scroll, van de hero tot de
finish-CTA. Volledig statisch, geen build-stap, geen externe afhankelijkheden.

## Draaien

```bash
node server.js
```

Site draait dan op http://localhost:8083 (of PORT-omgevingsvariabele).
Via de launch-config: naam `venrooij-website`.

## Deployen

Volledig statische site: elke host werkt. Voor Vercel staat `vercel.json` klaar
(clean urls, cache-headers). Map uploaden of `vercel deploy` in deze map is genoeg.

## Structuur

- `index.html`, `over-frank.html`, `rijlessen.html`, `tarieven.html`, `geslaagd.html`, `proefles.html`
- `css/style.css` : volledig designsysteem (fonts, bordjes, route, kaarten)
- `js/main.js` : nav, reveals, routelijn + Puma'tje, tilt op het woordbord, formulier naar WhatsApp, claxon-grapje
- `assets/` : lokaal opgeslagen beelden (niets gehotlinkt), logo-mark, favicon
- `fonts/` : self-hosted variabele woff2-fonts

## Logo vervangen

Het logo is bewust één asset + één identiek markup-blokje:

- Beeldmerk: vervang `assets/logo-mark.svg` (wordt ook in de footer gebruikt).
- Wordmark-tekst: het `<a class="logo">`-blok staat identiek in alle zes pagina's;
  in één zoek-en-vervang aan te passen.
- Vraag aan de opdrachtgever uitstaand: moet het bestaande rood/blauwe daklicht-logo
  leidend worden, of vervangt dit nieuwe wordmark het?

## Vóór livegang bevestigen (opdrachtgever)

1. **Tarieven**: aangeleverd en verwerkt (les €69, TTT €275, praktijkexamen €305,
   herexamen €305, faalangst €345, BNOR €345, CBR-kosten €46,90 / €50,50).
   Pakketten zijn exacte optelsommen (20/30/40 lessen: €1.685 / €2.650 / €3.340),
   gepresenteerd als "geen kleine lettertjes". Even laten bevestigen.
2. **Clickdrive-cijfers**: 5,0★ uit 10 reviews en 38/38 tussentijdse toetsen staan
   op de site mét bronvermelding (Clickdrive, aug 2026), en de 5,0 zit in de JSON-LD
   aggregateRating. Akkoord bevestigen, anders verwijderen.
3. **Openingstijden**: verwerkt volgens het Google-profiel (ma t/m do 08-20, vr 08-18,
   za 08-12, zo dicht).
4. **Werkgebied-dorpen**: Empel, Nuland, Vinkel, Berlicum en Kruisstraat worden als
   voorbeeld genoemd ("in overleg"); checken of Frank daar inderdaad ophaalt.
5. **Betaling** (contant/bankoverschrijving volgens Clickdrive): staat bewust niet op
   de site; toevoegen indien gewenst.
6. **Google-bedrijfsprofiel**: er is een profiel met 40 reviews; als de eigenaar de
   link aanlevert kan er een "Bekijk alle reviews"-knop bij.

## Contentbronnen

- Reviews: `websites/klant-content/Rijscholen/Van venrooij/Van venrooij reviews.txt` (34 stuks, verbatim op de site)
- Foto's: zelfde map, submap `Media/` (lokaal gekopieerd naar `assets/`)
- Feiten: dossier in de bouwprompt + aanvullingen opdrachtgever (tarieven, tijden, schakelauto)
