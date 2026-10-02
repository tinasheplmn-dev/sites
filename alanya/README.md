# Alanya Turkish Fusion, Roman Road (London E3)

Engelstalige one-pager met eigen bestelsysteem (afhalen én bezorgen, 0% commissie) en eigen reserveersysteem voor Alanya Turkish Fusion, 510A Roman Road, Bow, London E3 5ES. Ze verkopen nu via Uber Eats en Just Eat en hebben geen eigen site. Powered by Mettafel. Onderzoek: `_bouw/onderzoek.md`.

## Concept

**Zwart marmer en goud, met de Seltsjoekse ster.** Hun tafels zijn zwart marmer (zichtbaar op elke gastfoto) en hun logo is een gouden achtpuntige rozet. Alanya zelf staat bekend om de achthoekige Seltsjoekse Rode Toren.
- **Achthoekige gouden kaders** voor beeld, medailles, stappen en pijlknoppen; de rozet als scheiding.
- **Wow:** gloeiende sintels (canvas) dwarrelen uit de houtskool omhoog over de hero. Stopt buiten beeld en bij "minder beweging".
- **Kleur:** nacht #0D0B09, goud #D9B566 (iets lichter dan het logogoud, voor contrast), goud-diep #5E430F voor goud op ivoor, ivoor #F6EFE2 / #ECE3D1 voor de menukaart en bezoek, gloed #FF8F66 alleen in labels en pepers.
- **Typografie:** Marcellus (display, Romeinse inscriptieletter) + Jost (body), zelf gehost.
- **Logo:** rozet als inline-SVG + "ALANYA" gespatieerd, één component. Hun logo is alleen als 100x100 px gevonden (`_bouw/logo.png`); vraag het origineel op.

## Opbouw

1. Hero: stockfoto lamskoteletten op houtskool + sintels, kop "Turkish charcoal grill, in the heart of Roman Road", vier bullets, openstatus, 4,7 · 1.000+ reviews, "Order online" + "Book a table"
2. Gouden bewijsband: 4,7 Google, hygiëne 5, 100% halal, gratis brood/salade bij eten in de zaak, houtskoolgrill
3. Vijf favorieten van de grill met directe "Add"-knop (Mix Platter for 2 groot in het midden)
4. Fusion spice: mild/medium/hot (hun eigen optiegroep) + de rode Alanya Special Spicy Sauce
5. **De volledige kaart is de bestellijst**: 68 gerechten in 14 groepen, zoeken, categoriechips, keuzepanelen (pittigheid, rijst), plakkende bestelkaart op desktop
6. Dine in: brood en salade van het huis, rustig en halal met nasheeds, ruimte voor families
7. Reviews: uitgelichte review (Dulal Kamali) + 11 kaarten met de aangeleverde klantfoto's in een carrousel
8. Reserveren + groepen/iftar-formulier
9. Bezoek: adres, tijden, kaart, FAQ (FAQPage-JSON-LD)
10. "From our grill to your door": stappen + "Order online" en "Order at the counter" met zwevende kaart

## Systemen

- `js/bestellen.js`: gedeelde bestelmotor (uit Cafe Deccan), nu met `bezorgen: true`. Afhalen of bezorgen, tijden per kwartier binnen de openingstijden, 30 min bereidtijd, account op het toestel, "Order again", tip voor de spicy sauce. Betalen bij afhalen of bezorging.
- `js/kaart-data.js` + kaart-HTML: gegenereerd met `node _bouw/genereer.mjs` uit `_bouw/menu.json` (Just Eat-lijstprijzen, lager dan Uber Eats).
- `js/reserveer-widget.js`: ma-do 16:00-21:30, vr-zo 13:00-21:30, 1-8 personen online, capaciteit 30 per halfuur (demo-aanname), groepen vanaf 9 via het formulier.
- `js/sintels.js`: de hero-vonken. `server.js`: bestellingen, reserveringen, aanvragen in `_data/`, beheer op `/beheer?token=...`.
- Getest: bestelling B-2026-0001 (Lamb Chops "Hot" + Houmous, bezorging) kwam binnen; testdata daarna gewist.

## Draaien

```bash
node sites/alanya/server.js
```

Of via de preview `alanya` (poort 8232). Beheer: `http://localhost:8232/beheer?token=mettafel`.

## Beeld

- **Klantfoto's** (zip) alleen bij de reviews.
- **Al het andere beeld is Pexels-stock**, gekozen op donker, warm licht zonder mensen of handen: `_bouw/stock/BRONNEN.md`. 21 van 68 gerechten hebben een passende stockfoto; de rest toont de rozet. Burger- en wrapfoto's staan alleen bij de gerechten die ze echt tonen.

## Keuring

- `keuring.mjs`: 0 fouten; waarschuwing "geen duidelijke knop in de hero" is een scriptbeperking.
- Contrast 1440 en 375: oranje labels en het Veg-label donkerder/lichter gezet tot boven 7:1.
- Meten: DOM ~2.000 door de volledige kaart (68 gerechten); groepen staan dicht op mobiel en beelden laden lazy. Mobiele kop 27 px om hem op twee regels te houden.

## Open punten (voor de eigenaar)

1. **Openingstijden** bevestigen (platforms verschillen; nu ma-do 16-23, vr-za 13-23:30, zo 13-23).
2. **Prijzen** bevestigen (Just Eat-lijstprijzen, okt 2026).
3. **Bezorggebied, bezorgkosten en minimum**: nog niet in de bestelflow; de site zegt "rond Bow en Roman Road, we bellen als je adres erbuiten valt".
4. **Beschrijvingen** van Halloumi, Lamb Shish with Yoghurt en Josh Wrap stonden fout op de platforms; nu neutraal, graag controleren.
5. **Iftar-service** (dadels en water klaar) komt uit een review; bevestigen dat ze dit standaard aanbieden.
6. **Desserts, milk cakes en mocktails** worden in reviews genoemd maar staan niet op de kaart; aanleveren als ze er zijn.
7. **Logo in hoge resolutie**, eigen foto's van gerechten en zaak (vervangen de stock via dezelfde bestandsnamen), e-mailadres.
8. Zitplaatsen per halfuur voor de widget; `BEHEER_TOKEN` bij livegang.
