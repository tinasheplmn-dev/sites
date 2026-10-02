# Shankeys, Hackney (London E9)

Engelstalige one-pager met eigen reserveersysteem voor Shankeys, 221 Well Street, London E9 6RG: Iers-Indiase small plates en Ierse cocktails in een oud wedkantoor. Shankeys heeft geen werkende eigen site (shankeys.co.uk is verlopen) en reserveert nu via Tock. Powered by Mettafel. Onderzoek: `_bouw/onderzoek.md`.

## Concept

**Oma's bloemetjesservies.** Alle gerechten bij Shankeys komen op vintage porselein met bloemranden; dat is de vormentaal.
- Elke sectie begint met de **geschulpte rand van een oud bord** met een stippelrand eronder (signatuur).
- Gerechten staan in **porseleinen borden** met een bloemrand die meedraait als je scrolt.
- **Kleur:** bordeaux #6E1423 (merk, klantopdracht), donker bordeaux #5C0F1D en #3E0913 voor de donkere secties, linnen #F8F1E7 en #F0E4D2 voor licht, flessengroen #1F4D3B (Iers) en saffraan #EDB75F (Indiaas) als kruiden. Contrastwaarden staan bovenin `css/style.css`.
- **Typografie:** Gloock (display) + Albert Sans (body), zelf gehost.
- **Logo:** er is geen logobestand gevonden. Het woordmerk "Shankeys" in Gloock met een rond S-zegel is één component (header, menu, footer) en kan één op één vervangen worden.

## Opbouw

1. Hero: eigen professionele foto (gedekte tafel), kop "Irish-Indian small plates, in the heart of Hackney" (formule keuken + plek), vier bullets met eigen iconen, live openstatus, 4,9 uit 516 reviews, knoppen "Book a table" en "See the menu"
2. Persband: Time Out 5/5, The Infatuation 8.6, Palate 17/20, Andi Oliver, Google
3. Vier signatuurgerechten in porseleinen borden (Cauli Cheese, Buttered Spuds, Saag Burrata, Gulab Jamun) + oesterregel
4. Voorbeeldkaart (inklapbaar, op mobiel alleen de eerste groep open)
5. Drinks: drie cocktails in boogkaders, flessenrij en het Joyce-citaat van hun muur
6. Verhaal: Sacha Henry en Eoghan Shankey, bookies → Loafing → Shankeys
7. Reviews: uitgelichte review + 12 kaarten met de aangeleverde klantfoto's (carrousel op mobiel)
8. Reserveren: widget vast op de pagina + zwevend paneel
9. Groepen en privédiners: aanvraagformulier
10. Bezoek: adres, tijden, kaart, FAQ (met FAQPage-JSON-LD)
11. Afsluiter "Booking online is easy": drie stappen + "Book a table" en "Find us on Well Street"

## Systemen

- `js/reserveer-widget.js`: Mettafel-reserveerwidget. Wo-vr tijden 18:00-21:30, za 15:00-21:30, zo-di dicht, 1-8 personen online, wachtlijst alleen als de gast hem aanvinkt, .ics-agendabestand, groepen vanaf 9 via het formulier.
- `server.js`: reserveringen en aanvragen in `_data/*.json`, beheer op `/beheer?token=...`, capaciteit 12 nieuwe gasten per halfuur (demo-aanname, 6-7 tafels).
- `js/demo-api.js`: zonder server werkt alles toch (opslag in de browser), voor de publieke demo-link.
- Getest: reservering R-2026-0001 kwam binnen; testdata daarna gewist.

## Draaien

```bash
node sites/shankeys/server.js
```

Of via de preview `shankeys` in `.claude/launch.json` (poort 8231). Beheer: `http://localhost:8231/beheer?token=mettafel`. In productie `BEHEER_TOKEN` zetten.

## Beeld

- **Professionele content** (aangeleverde zip, fotograaf Aleksandra Boruch) staat overal op de site. Twee foto's in die zip (`Sporting_Club_De_Londres_Exterior...`) tonen een andere zaak en zijn bewust niet gebruikt.
- **Klantfoto's** alleen bij de reviews (`assets/klant/`), elk bij de review over hetzelfde gerecht.
- Geen stockfoto's nodig: het eigen materiaal dekt alles.

## Keuring

- `keuring.mjs`: 0 fouten. Waarschuwingen: "geen duidelijke knop in de hero" (scriptbeperking, er staan er twee), accentkleur lijkt op eerdere sites (bordeaux is de klantkleur).
- Contrast 1440 en 375: alleen meldingen op de uitgelichte review, waar het script de verloop-rand als achtergrond leest (tekst staat op donker bordeaux, 12:1).
- Meten: leesbreedte meldt korte kaartteksten, DOM ~990 elementen, mobiele kop 28 px om hem op twee regels te houden.

## Open punten (voor de eigenaar)

1. **Prijzen en kaart**: komen van een ongedateerde derde bron (menueat); Saag Burrata £10 en Executive Lamb £32 komen uit een zoeksamenvatting. Graag de actuele kaart.
2. **Openingstijden**: wo-vr 18:00-22:30, za 15:00-22:30 (Google). Tock toonde 21:30 als laatste tijd.
3. **Telefoon en e-mail** ontbreken: er is nergens een nummer gevonden.
4. **Logo** (bestand) en **zitplaatsen** per halfuur voor de widget.
5. **Hondvriendelijk** komt uit één review en staat alleen in die review, niet als claim.
6. **Tock**: na livegang de Tock-link in Instagram vervangen door deze site, of beide naast elkaar laten draaien.
7. `BEHEER_TOKEN` instellen bij livegang.
