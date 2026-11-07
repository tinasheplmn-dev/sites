# Larz, The Energy Man, website

Nieuwe site voor larz.nl: Lars Schuijling, "Larz", Nike Master Trainer, event energizer en dj uit Amsterdam. Gebouwd op 7 november 2026 met de skill `website-bouwen`, zonder tussentijdse vragen (op verzoek), voor presentatie op Maximum Potential diezelfde dag.

## Concept

**Energie die je kunt zien.** Larz is trainer én dj; zijn vak is een zaal op een beat krijgen. De site vertaalt dat in één motief, de **equalizer**:

- In de hero pulseren lime balken onderlangs de full-bleed video (eigen beeld van de Brabanthallen).
- De scrollbalk bovenin is een niveau-meter van lichtsegmenten.
- Elke bullet is een mini-equalizer in een lime cirkel; eyebrows en sectiekoppen dragen een pulserende variant.
- Kaarten (de "backstage-passen" onder de hero, de formats, de dagkaarten) hebben een lime-naar-magenta lichtrand als een podiumspot.
- De slotband herhaalt de equalizer groot en licht, als echo.

Kopregel: **Energie die een hele zaal in beweging zet.** Afgeleid van zijn eigen Instagram-regel "Energy that moves people. From classes to crowds."

Kleur: zaalzwart #0b0b10 en #14141c, gebroken wit #f4f3ee, lime #c8f53c (energie, knoppen, accentwoord), magenta #ff3d8a alleen in lichtranden. Het zwart-wit komt uit zijn eigen logo; de accentkleur is bewust geen oranje of rood (samen 124 keer in het archief) maar podiumlicht.
Typografie: Big Shoulders Display 900 (koppen, atletiek-affiche) en Barlow (tekst). Zelf gehost in `assets/fonts/`.
Taal: Nederlands, met Larz' Engelse merkregels behouden. Zijn huidige site is Engels; een volledige Engelse versie staat als open punt.

## Pagina's

| Pagina | Doel |
|---|---|
| `index.html` | Video-hero, lichtkrant met events en merken, cijfers, drie backstage-passen (USP's), drie podia (aanbod), showreel, agenda met live "vandaag"-chip, Larz, weekrooster, muziek |
| `event-energizer.html` | Vier formats, filmstroken, vier stappen, wat Larz nodig heeft, referenties, FAQ, aanvraagformulier |
| `lessen.html` | Holy Shred en Holy Box, weekrooster Saints & Stars, drie clubs, masterclasses voor festivals |
| `muziek.html` | Spotify-speler (laadt bij klik), SoundCloud-mixen, dj-set voor events, mixen voor trainers |
| `over-larz.html` | Verhaal, erkenning, eigen quote, filmstroken |
| `contact.html` | Drie kanalen, aanvraagformulier, socials |

Het formulier bouwt een nette mail aan info@larz.nl (geen backend; er is geen telefoonnummer bekend, dus geen bel- of WhatsApp-knop).

## Techniek

Platte HTML, CSS en JavaScript, geen dependencies. Pagina's worden gebouwd met `node _bouw/bouw.mjs` uit `_bouw/paginas/*.html`; menu, footer, formulier, JSON-LD en sitemap staan op één plek in `_bouw/bouw.mjs`. Motion volgens `css/motion.css` en `js/motion.js` (fail-open reveals, stagger, hero-opening, parallax, kantel). Site-eigen gedrag in `js/main.js`: equalizers, herovideo (kiest 960 of 1440 breed, uit bij Save-Data of minder beweging), agenda-markering en live chip, rooster-vandaag, YouTube en Spotify pas laden bij klik, formulier.

### Lokaal bekijken

```bash
node websites/larz-website/server.js
```

Daarna http://localhost:8640 (ook in `.claude/launch.json` als `larz-website`).

### Uitrollen

Statische host (Vercel, Netlify, Cloudflare Pages). `vercel.json` zet nette URL's aan; `.vercelignore` houdt `_bouw/` buiten de upload. Canonicals en sitemap wijzen naar https://larz.nl.

## Beeld en video

- **Herovideo**: 14 seconden uit "LARZ ENERGY WARM-UP, Crowd Control at Maximum Potential" van zijn eigen YouTube-kanaal (1080p-bron), zonder geluid: `hero-1600.mp4` (1440 breed, 2,6 MB) en `hero-960.mp4` (1,9 MB) plus poster. Gekozen omdat het het exacte event is waar hij de site presenteert en het beste beeld van een volle zaal.
- **Stills** uit vier eigen YouTube-video's (Maximum Potential 2025, Collar Run, Energy Moment, This Is Where It Starts).
- **Saints & Stars** (trainerpagina): portret zwart-wit met blauwe streep, dj-foto, groepsfoto, leren jas, blauw shirt.
- **larz.nl**: les in donkere hal (2048 px), Nike-buitentraining (2560 px), het logo (vrijgesneden uit een jpg naar `logo-wit.png`).
- Geen stock en geen AI-beeld. Instagram kon niet worden uitgelezen voor beeld (wel bio en aantallen).
- Bronbestanden staan in `_bouw/bron/` (niet mee uitrollen).

## Wat de keuring meldde en wat ik herstelde

- `keuring.mjs`: 0 fouten. Waarschuwingen: "geen knop in de hero" is vals alarm (twee knoppen aanwezig); title en meta van lessen.html ingekort; README was er toen nog niet.
- Variatie: Big Shoulders Display stond al in 6 van 216 sites (geen daarvan een fitnesspresenter), magenta lijkt op 6 eerdere accenten maar is hier alleen een lichtrand, de hoekradius 4 px is naar 2 px gegaan.
- Contrastmeting op alle 6 pagina's, 1440 en 390 breed, met `?foto=1`: twee echte fouten gevonden en hersteld. De slotband (licht) had witte knoptekst op wit omdat de `licht`-klasse ontbrak, en de voorbije agendarijen zaten op `opacity: .75` waardoor de maandlabels op 5,9:1 kwamen. Nu 0 meldingen, op het decoratieve omlijnde nummer bij de podia na (transparante vulling met lime contour, `aria-hidden`).
- Ontwerpmeting: topbalktekst van 14 naar 16 px, tikdoelen in topbalk, footer en agenda naar 44 px, mobiele hero compacter gemaakt zodat kop, drie bullets en beide knoppen in het eerste scherm van een telefoon staan (gemeten op 375 bij 812). De "onzichtbare inhoud"-melding gaat over het dichtgeklapte mobiele menu, niet over reveals.
- Mobiele actiebalk: op iOS Safari stond hij tijdens scrollen midden in beeld. Oorzaak: `backdrop-filter` plus een `transform`-overgang op een `position: fixed`-element, een bekende WebKit-fout. Nu een dekkende achtergrond en een opacity-overgang; niet op een echt iPhone getest (geen Xcode op deze machine), wel op 375 breed in de browser.
- Bullets: elk opsommingsteken heeft een eigen icoon dat bij de regel past (publiek, bliksem, koptelefoon, microfoon, wereldbol, klok, speld, ster, halter, ticket), in de lime cirkel.
- DOM van 1072 naar circa 800 elementen door statische equalizers als CSS-achtergrond te tekenen in plaats van vijf losse elementen.

## Open punten (voor Larz te bevestigen of aan te leveren)

1. **Exacte Nike-titel**: de site gebruikt "Nike Master Trainer" (zo noemt hij zich bij Saints & Stars en op Instagram); larz.nl zegt ook "Nike Elite Trainer".
2. **Awards**: "Entertainment Presenter of the Year, zes jaar op rij" en "Best ClassPass Instructor 2023" komen van larz.nl; uitreiker en jaren onbekend.
3. **Grootste publiek**: larz.nl zegt 5.000+, Your Sport Pro noemt conventies tot 10.000. Beide staan op de site met die bron; laten bevestigen.
4. **Agenda**: data op larz.nl kloppen niet overal (jaartallen 2024/2025 onder 2026-data; City Swim stond op 6 oktober, het event was 6 september). Voorbije events staan daarom alleen met maand. Volgende events toevoegen in `_bouw/paginas/index.html` (`data-datum`, `data-tot`, `data-kort`, `data-stad`).
5. **Rooster Saints & Stars**: overgenomen van larz.nl zonder datum; actueel maken. Adressen van de clubs komen van Saints & Stars en ClassPass.
6. **Telefoon of WhatsApp** voor boekingen: nu alleen info@larz.nl.
7. **Tarieven**: de FAQ zegt "prijs op maat". Een vanaf-prijs zou organisatoren helpen.
8. **The Energy Lab**: alleen bekend uit de Instagram-bio; wat het is en of het een pagina verdient.
9. **Tv-vermeldingen** (Idols, So You Think You Can Dance, Lucia Marthas, adidas en Puma) komen uit een blog van 2017 en Zuidas Magazine; laten bevestigen.
10. **Eigen beeld**: hoge-resolutie foto's van Instagram en een officiële showreel zouden de stills uit YouTube kunnen vervangen.
11. **Engelse versie** van de site voor de internationale Nike-rol.
12. **Vorige website** (WordPress) uitzetten en de domeinnaam naar de nieuwe host verwijzen bij livegang.
