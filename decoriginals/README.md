# Decoriginals, nieuwe website

Specialisten in beurzen, congressen en evenementen ('s-Hertogenbosch). Gebouwd op 20 oktober 2026 met de skill
website-bouwen, op basis van een volledige uitlezing van decoriginals.nl (alle 26 pagina's), de vijf reviewvideo's en de agenda.

## Het concept: de laserlijn
Decoriginals lijnt elke positie op de beursvloer met lasertechniek tot op de millimeter uit. Die rode laserlijn is de
signatuur van de site:
- **Hero**: de eigen bedrijfsvideo full-bleed op de achtergrond. Een laserpunt trekt de rode markeerbalk achter
  "volle beursvloer" (dezelfde gemarkeerde kopwoorden als in hun huidige huisstijl).
- **De plattegrond** (home): een sticky hal-plattegrond die bij elke stap van de aanpak verder wordt ingericht:
  lege hal, standindeling, laserscan en vrachtwagen, opgebouwde stands met truss en licht, bezoekers.
- **Tijdlijn** (aanpak): een rode laser die meeloopt terwijl je door de vijf stappen scrollt.
- **De monitorwand**: de vijf videoreviews spelen af in hun eigen kader, met geluid, met het citaat uit de video ernaast.
- **Beursbadges**: de drie USP's (innovatief, persoonlijk, duurzaam) als exposantenpassen aan een rood lanyard.
- **Agenda-ticker**: hun eigen archief van 231 beurzen loopt als lichtkrant onder de hero.

## Keuzes
- Kleur: merkrood #e62336 blijft het merk (markering, laser, logo). Knoppen en rode tekst krijgen een diepere tint
  #a00d22, omdat wit op het originele rood maar 4,5:1 haalt. Op donker gebruiken we #ff95a0 voor rode tekst.
  Donker #121517, tekst #1b2023, papier #fcfcfb. Alle tekst haalt 7:1.
- Type: Red Hat Display (koppen, 800-900) en Lexend Deca (tekst, hun huidige huisletter). Zelf gehost.
- Vorm: de "deco-hoek" uit hun huisstijl (0 28px 28px 0) op beeld, kaarten en nummers; pil-knoppen.
- De oude sollicitatielinks (Tool2Match-plugin op de oude site) verdwijnen met de oude site. Daarom een eigen
  sollicitatieformulier op Werken bij. Wil de klant Tool2Match houden, dan vervang je de knoppen door hun
  Tool2Match-links.
- Formulieren (contact en sollicitatie) draaien op het eigen Mettafel-systeem (`server.js`): inzendingen komen in
  `_data/`, de beheerpagina staat op `/beheer?token=...`. Zonder server valt het formulier terug op mailto.
- Teksten in je-vorm, kort, in hun eigen woorden waar dat kon. Alle feiten komen van de huidige site of uit de video's.

## Pagina's
`index.html`, `aanpak.html`, `team.html` (alle 24 collega's per discipline), `werken-bij.html` (vacatures met salaris),
`agenda.html` (alle 231 beurzen, filterbaar per regio), `contact.html`, `privacy.html`, `voorwaarden.html` (volledige teksten).

## Beeld en video
- Hero-video: hun Vimeo-video "DECORIGINALS HOME", fragment 0:20 tot 0:43 (laden, rijden, bouwen, plattegrond,
  opgebouwde hal, beursvloer), 1280 breed 2,7 MB en 854 breed 1,9 MB voor mobiel. Bij "minder beweging" of
  databesparing speelt hij niet automatisch. Origineel (4K) staat in `_bouw/bron/hero.mp4`.
- Reviewvideo's: de vijf testimonials van de huidige site, opnieuw gecodeerd (0,6 tot 2,5 MB), laden pas bij klikken.
- Deco Systems-animatie: `usps.mp4` van de huidige site, laadt pas in beeld.
- Foto's: allemaal eigen fotografie van de huidige site (FvD en Bas Haans Fotografie). Teamfoto's van de teampagina.
- Klantlogo's: de 13 partnerlogo's van de huidige site.

## Draaien en uitrollen
```bash
node _bouw/bouw.mjs          # bouwt alle pagina's, css en js opnieuw uit _bouw/
PORT=8320 node server.js     # lokale preview op http://localhost:8320
```
Pagina's bewerk je in `_bouw/paginas/*.html`, stijl in `_bouw/basis.css`, gedrag in `_bouw/site.js`, en daarna
`node _bouw/bouw.mjs`. De agenda komt uit `_bouw/agenda.json`.
Uitrollen: als statische site kan het overal (Vercel, `vercel.json` staat klaar), maar de formulieren hebben de
Node-server nodig (bijvoorbeeld Railway of Render met `node server.js`, en `BEHEER_TOKEN` als omgevingsvariabele).

## Keuring
- `keuring.mjs`: 0 fouten. Eerst 2 fouten (hero-video's van 10 en 3 MB), opgelost door een strak fragment van 23 seconden.
- Laatste waarschuwingen, bewust gelaten: totale media 14 MB (vooral de reviewvideo's, die pas laden als je klikt);
  "geen knop in de hero" (vals alarm, de knoppen staan er); accentkleur rood komt vaker voor (opgelegd door de klant).
- Browser (1440 en 390): contrast gerepareerd (rode tekst op donker, eyebrows op foto's, omlijnde knoppen in paginakoppen,
  formulier in donkere sectie), tikdoelen in topbalk en footer vergroot, geen horizontale scroll, formulier getest tot
  en met bevestiging (testdata verwijderd).

## Open punten (eigenaar)
- Functietitels van Bas van Gent (Group Exhibition Director, Easyfairs) en Estelle Verschoor (Project Manager Event
  Services, Easyfairs) zijn afgelezen van een wazige titel in de video: graag bevestigen.
- Geen foto van Freek Staps, Veda Verberne en Joran Leenders (nu initialen).
- "Je kunt ons vinden op" (komende beurzen) is leeg op de huidige site; aanleveren als je komende beurzen wilt tonen.
- Geen Google-reviewscore gevonden. Is die er, dan kan hij in de topbalk.
- De Deco Systems-folder (PDF) is niet overgenomen; link of bestand aanleveren als die terug moet.
- Bij livegang `BEHEER_TOKEN` instellen en eventueel `MELDING_URL` voor een melding bij nieuwe aanvragen.

## Ronde 2 (21 okt 2026, feedback eigenaar)
- Hero-video laadde niet: de lokale server leverde geen Range-verzoeken (Safari speelt dan geen video) en alleen
  JavaScript zette de bron. Nu: Range-ondersteuning in `server.js`, `<source>`-elementen direct in de HTML, en de video
  speelt altijd gedempt af (ook bij "minder beweging"), met pauzeknop.
- Rode kader achter "volle beursvloer" weg; de tweede regel krijgt nu een rode laserstreep met lichtpunt eronder, met
  ruimte zodat niets meer overlapt. Dezelfde streep vervangt de markering op de subpagina's.
- Hero-bullets zijn vier tegels met verloop-omlijning en rode icoontegels; alle merkbullets op de site in dezelfde stijl.
- Chip "Preferred supplier rigging" verwijderd.
- Cijfers onder de hero zijn nu vier kaarten (icoon, coördinaat, groot getal, laserlijn), met de agenda-lichtkrant eronder.
- Deco Systems: nieuwe kop op twee regels ("Standaard systeem, eigen uitstraling") en een donker podium met grote
  video, laserscan, zwevende foto en drie kaarten die over de video vallen.
- Agenda: hallen als filterkaarten met teller en balk, 24 projecten zichtbaar en een knop voor alle 231.
