# Grace's Kitchen, one-pager

Website voor Grace's Kitchen: authentieke West-Afrikaanse gerechten uit de Gambiaanse keuken, 100% halal, bestellen via WhatsApp (06 87 54 81 55), catering en evenementen op maat, omgeving Den Bosch.

## Concept

**Proef Gambia, vers uit Grace's pot.** De site draait om één vraag van de bezoeker: wat kan ik eten en hoe bestel ik het? Het antwoord staat in het eerste scherm.

- **Signatuur: het draaiende bord.** Rechts in de hero draait een groot bord elke 4 seconden naar het volgende gerecht (Jollof, Egusi, Domoda, Okra), met naam, inbegrepen bijgerechten en prijs op een kaartje. Links kies je zelf een gerecht; de WhatsApp-knop neemt dat gerecht dan meteen mee in het voorgevulde bericht. Pauzeert bij hover en focus.
- **Afrikaanse twist: het Gambiaanse lint.** Rood, blauw en groen uit de vlag (en uit het logo) lopen als lint langs het oranje vlak in de hero, als band tussen secties, als kopregel van de USP-stofstalen en onder de uitgelichte review. Het oranje vlak en de TikTok-sectie hebben een subtiel wax-printpatroon.
- **Kleur:** oranje `#F58A2E` (vlakken), donkeroranje `#8A2C07` (tekst), geel `#F7A21B`, inkt `#2B1307` (het bruin van de logo-omlijning), wit. Vlagkleuren alleen als accent.
- **Typografie:** Shrikhand (koppen, sluit aan op de dikke cursieve letter van het logo) en Albert Sans (tekst). Beide zelf gehost.

## Opbouw

Topbalk, header, hero met draaiend bord, drie USP-stofstalen, menu (4 gerechten met prijs, inbegrepen en vleeskeuze, elk met eigen WhatsApp-knop), zo bestel je (3 stappen), TikTok-collage (5 echte video's, spelen in een eigen speler pas na een klik), reviews, catering (donker), footer. WhatsApp-widget rechtsonder.

## Gemaakte keuzes

- Headervraag niet beantwoord, daarna kwam het voorbeeld (bord rechts dat wisselt). Gebouwd volgens dat voorbeeld met de aanbevolen kernzin.
- Gerechtfoto's: Jollof is de foto die de opdrachtgever aanleverde, de rest zijn stockfoto's (Unsplash en Pexels). Bronnen in `_bouw/stock/bronnen.md`.
- USP's onder de header zijn door de opdrachtgever bepaald: altijd vers bereid, grote porties, 100% halal. Daarom staat halal niet meer als hero-bullet maar "kip, vis of beef naar keuze".
- TikTok-omslagen zijn bijgesneden zodat de oude prijzen (€12, €14) in beeld wegvallen.
- Bestellen gaat volledig via WhatsApp (`wa.me`-links met voorgevulde tekst), geen eigen bestelsysteem.

## Draaien en uitrollen

```bash
node server.js            # http://localhost:8213
node _bouw/bouw.mjs       # bouwt index.html opnieuw uit _bouw/index.tpl.html
```

Menu, TikTok-video's en reviews staan als data bovenin `_bouw/bouw.mjs`; pas ze daar aan en draai het bouwscript. Uitrollen: de map zoals hij is naar Vercel of een statische host (`vercel.json` staat klaar). Live op https://tinasheplmn-dev.github.io/sites/grace-kitchen/ (repo tinasheplmn-dev/sites, map grace-kitchen). Bij een eigen domein: vervang die link in `_bouw/index.tpl.html`, `_bouw/bouw.mjs`, `sitemap.xml` en `robots.txt`.

## Open punten (voor livegang)

1. **Reviews zijn voorbeeldreviews** (op verzoek gemaakt). Nep-reviews tonen als echte klantbeoordelingen is in Nederland niet toegestaan (oneerlijke handelspraktijk). Vervang ze door echte reviews (WhatsApp-berichten met toestemming, Google-reviews) of zet er duidelijk "voorbeeld" bij. Er staat bewust geen sterrenscore in de structured data.
2. **Afhalen of bezorgen?** Op TikTok staat "afhalen" en "omgeving Den Bosch". Bevestig of er ook bezorgd wordt, en of er een vast afhaaladres en vaste dagen/tijden zijn.
3. **Jollof-foto**: aangeleverd door de opdrachtgever. Controleer of die vrij gebruikt mag worden (eigen foto of rechtenvrij).
4. **Domeinnaam** en eventueel een e-mailadres.
5. **Eigen gerechtfoto's**: de stockfoto's tonen het gerecht, niet Grace's eigen bord. Een korte fotoshoot (bovenaanzicht, wit bord) past direct in het draaiende bord.
6. **Het West-Afrikaanse sap** dat Grace op TikTok aanbiedt staat niet op het menu. Toevoegen?
7. Prijzen (€16 en €17) komen uit de opdracht; laat ze bevestigen.

## Controle

- Keuring (`keuring.mjs`): 0 fouten. Waarschuwingen: README ontbrak (nu aanwezig), favicon-PNG zonder webp (bewust, favicons zijn PNG), "geen duidelijke knop in de hero" (vals alarm: de WhatsApp-knop staat er).
- Contrast gemeten in de browser op 1440 en 375 breed: 0 problemen (na het donkerder maken van het tekstoranje en het iets lichter maken van het vlakoranje).
- Ontwerpmeting: alle koppen op één regel op desktop, geen horizontale scroll. Resterende meldingen gaan over het dichtgeklapte mobiele menu en korte kaartteksten.
- Getest: wisselend bord (automatisch en via de kiezer), WhatsApp-link per gerecht, widget open/dicht, TikTok-speler (laadt en speelt), alle ankerlinks.
