# Chez Minée: Franse bistro, bar en terras in Den Bosch

Nieuwe site voor https://chezminee.nl/ (Orthenseweg 1, 's-Hertogenbosch). Vier pagina's plus een eigen reserveringssysteem, powered by Mettafel.

## Het concept

**"La vie en rose": de schulprand.** Chez Minée serveert op geschulpte borden en heeft een geschulpt logo-embleem. Die golvende rand is de signatuur van de site: als onderrand van de header, als sectiescheider, als vorm van fotokaders, de scorebadge en het danscafé-embleem. Daaromheen: hun eigen kleuren (donkerroze op licht crème, diep bordeaux als inkt), en **levende collages**: fotokaders die om de paar seconden rustig crossfaden (hero en Instagram-sectie), naar het dynamische gevoel van de oude site.

- Kernzin: "Even in Parijs, gewoon in Den Bosch" (keuze gebruiker), gebouwd op hun eigen introtekst.
- Typografie: Yeseva One (display, warm Frans-vintage), Asap (body), Corinthia (script-accent, hun éigen menukaartletter) voor kleine Franse woorden.
- Kleuren: #d50057 (hun roze, voor koppen en vormen), #8f0038 (knoppen en roze leestekst-varianten, 7:1+), #430c25 (bordeaux-inkt), #fff6e9 / #f6e7ce (hun crème). Alles gemeten op de oude site met kleuren.mjs; alleen contrastvast gemaakt.
- Hero (ronde 2, na feedback): "het viertal", vier vierkante vakken als een bord in vieren met de naden als kruis en het Chez Minée-embleem in het midden. De vakken wisselen om de beurt met de klok mee van foto (mensen, geschulpte borden, proosten, Frans ontbijt), elk met een zachte zoom.
- USP's in het verhaalblok als Franse postzegels (geperforeerde rand, stippelkader, Corinthia-woord, eigen icoon): Proef van alles, Alles kan vraag maar, Groepen welkom, Gastvrijheid ten top.
- Danscafé als eigen roze band met een draaiende grammofoonplaat (schulp-label "chez!") en zwevende muzieknootjes; bodytekst op één regel desktop, twee regels mobiel.
- Uniek onderdeel: de kaartverkenner "Van croissant tot laatste wijntje" markeert live het huidige dagmoment ("nu"-chip) en de openstatus-chip in de hero rekent met de echte openingstijden.

## Pagina's

- `index.html`: hero met het viertal, bewijsloper, kaartverkenner (4 momenten), terras, verhaal met bezoekvideo (portret-reel, geluid op verzoek), danscafé-strook, gastenboek (7 reviews + klantfoto's), Instagram-collage, reserveerband.
- `menukaart.html`: de VOLLEDIGE kaart (57 gerechten) als tekst, gegenereerd uit `_bouw/catalogus.json` met `node _bouw/genereer-menukaart.mjs`. Inklapbaar per categorie (mobiel: alleen de eerste open), Menu-JSON-LD.
- `reserveren.html`: het reserveringssysteem ingebed, plus praktisch.
- `contact.html`: gegevens, kaart, contactformulier (naar de eigen backend), FAQ met FAQPage-JSON-LD.

## Reserveringssysteem (powered by Mettafel)

- Compact paneel rechtsonder op elke pagina (verschijnt na de hero) én ingebed op reserveren.html. Dagchips (Vandaag/Morgen/komende open dagen/Andere datum), halfuurslots 9.00 t/m 21.00 binnen de echte openingstijden (dinsdag dicht), 1-8 gasten, groter dan 8 gaat naar het contactformulier.
- `POST /api/reservering` slaat op in `_data/reservering.json`; contactformulier gaat naar `POST /api/aanvraag`.
- Beheerpagina op `/beheer` (token via `BEHEER_TOKEN`, standaard "mettafel"): statussen nieuw → bevestigd → aan tafel → afgerond.
- Bevestiging op het scherm met reserveringsnummer en een agenda-bestand (.ics). Fail-open: is de server niet bereikbaar (statische host), dan valt het formulier terug op een voorgevulde mail naar info@chezminee.nl.
- Getest van klik tot bevestiging (R-2026-0001) en daarna opgeruimd.

## Draaien en uitrollen

```bash
node server.js            # http://localhost:8191, beheer op /beheer
```

Ook geregistreerd in `.claude/launch.json` als "chezminee". Uitrollen: het reserveringssysteem heeft een Node-host nodig (Railway/Render/Fly): `server.js` draaien met `BEHEER_TOKEN` (verplicht) en optioneel `MELDING_URL` (webhook bij nieuwe reserveringen). Puur statisch hosten kan óók: alles blijft werken, alleen valt reserveren dan terug op de mail-route.

## Beeld en bronnen

- Alle foto's zijn aangeleverde professionele content (40 stuks, in ronde 2 opnieuw omgezet naar webp op volle originele resolutie, 1179px breed, allemaal onder 300 kB). Elke uitsnede is per foto ingesteld met object-position en gecontroleerd op een proefvel (`_bouw/cropvel.py` met `_bouw/spec*.json`) plus 10 klantfoto's die ALLEEN bij reviews staan (opdracht; koppeling foto-review is willekeurig en wordt later gecorrigeerd).
- Video: aangeleverde bezoek-reel, gecomprimeerd naar 2,9 MB, speelt gedempt in beeld met een geluid-aan-knop.
- Logo en de menukaartteksten komen van de huidige site; de volledige kaart (april 2026) is regel voor regel getranscribeerd uit de menu-afbeeldingen.
- Elke review op de homepage heeft een klantfoto (ronde 2); de uitgelichte review heeft de foto over de volle resterende hoogte.
- Reviews verbatim uit het aangeleverde document (37 stuks); score 4,6 uit 262 reviews (opgave eigenaar, sep 2026).
- Instagram-sectie gebruikt hun eigen (branded) fotocontent en linkt naar @chez_minee; een echte insta-feed kan niet zonder API-koppeling.

## Keuring en metingen

- `keuring.mjs`: 0 fouten. Gemeld en opgelost tijdens de bouw: video van 6 MB (gecomprimeerd naar 2,9 MB), ontbrekende webp's (bronbestanden naar `_bouw/` verplaatst), JSON-LD op reserveren toegevoegd.
- `contrast.js` op alle vier pagina's, mobiel en desktop: 0 problemen. Daarvoor gefixt: sterren van goud naar merk-roze op licht, knop- en leesroze verdiept naar #8f0038/#970044, loper- en scorebadge-achtergrond verdiept.
- `meten.js`: tikdoelen opgelost (footer, topbalk, chips, inline links). Bewust blijven staan: (1) "4 blokken onzichtbaar" = het dichtgeklapte mobiele menu en het reserveerpaneel, legitieme UI-states; (2) "secties met eigen padding" op de subpagina's = de compacte intro-koppen, een bewuste keuze; (3) kopgrootte 42px gemeten in een 1024-paneel, op 1440 is de hero 59px.

## Open punten voor de eigenaar

1. **Prijzen bevestigen** vóór livegang (overgenomen van de kaart van april 2026).
2. **Reserveringsgrens en keukentijden checken**: online tot 21.00 uur en max 8 personen is een aanname.
3. **Danscafé-data**: de sectie noemt het ritme (1e zaterdag, zomerstop); concrete data kan het team zelf doorgeven.
4. **Ontbijt/brood om mee te nemen** stond op oude kladpagina's van de site; niet meegebouwd (gebruiker: geen bestelsysteem). Als die service nog bestaat is een klein bestelblok een logische vervolgstap.
5. **Oude kladpagina's offline halen** bij livegang: /chez-minee-2/ en /chez-minee-aanpassingen/ staan nu nog live met verkeerde openingstijden.
6. Koppeling klantfoto ↔ review corrigeren (staat nu willekeurig, zoals afgesproken).
7. `BEHEER_TOKEN` en eventueel `MELDING_URL` instellen bij livegang.
