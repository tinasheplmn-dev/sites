# Maes Auto's, Berlicum

Homepage voor occasionhandel Maes Auto's (Milrooijseweg 47-b, Berlicum). Gebouwd als voorproef: alleen de homepage is af. Knoppen naar pagina's die nog komen (auto-detail, inruilen, financieren, verzekeren, privacy, cookies, wettelijke garantie) staan op `href="#"` met `data-pagina="..."` en doen bewust nog niets.

## Concept

**Kernbelofte:** "Wat je ziet, is wat je rijdt." Een betaalbare occasion die precies is wat de advertentie zegt, met eerlijk advies en hulp na de koop. Komt rechtstreeks uit de reviews ("precies zoals in de advertentie, dus geen verrassingen", "precies zoals beschreven", "precies zoals de foto's").

**Signatuur: het sleutellabel.** Het manilla label dat bij elke dealer aan de autosleutel hangt, met model, prijs en wat er gedaan is.
- Hero: het label hangt aan een stalen ring over de rand van de foto en slingert (gedempte slinger die reageert op scrollen, de muis en het wisselen van auto). Onder de foto kies je uit de 7 auto's die te koop staan; foto en label wisselen mee, en zonder interactie draait hij elke 6,5 seconde door.
- USP's: drie labels aan een sleutelbord (stalen stang met haakjes), met gradient-omlijning.
- Voorraad: elke kaart draagt een klein label met prijs en APK-datum.
- Werkbon: telt wat er in de laatste 30 advertenties stond (15x nieuwe APK, 13x airco, 12x NAP, 6x riem of koppeling nieuw), met een Rijklaar-stempel.
- Bullets zijn mini-labels (blauw met ponsgaatje) met eigen iconen.

**Huisstijl:** Maes-blauw #174f83 uit de huidige site en het logo, koel staalwit (de golfplaatwand waar elke auto voor gefotografeerd wordt), diepe navy #0d1724 en manilla #efe3c6 voor het label. Lettertypen Hubot Sans (koppen, smal via de breedte-as) en Mona Sans (tekst), zelf gehost; geen van beide eerder in het archief als hoofdkeuze. Logo opnieuw opgebouwd als HTML/CSS-component (`.logo-plaat`): het origineel is een wit woordmerk van 360 px breed op een blauw vlak. Eén component, dus in één keer te vervangen.

**Volgorde homepage:** topbalk (score, bellen, WhatsApp), header, hero met showroom-kiezer, USP-sleutelbord, voorraad (7 auto's + zoekopdrachtkaart, filters), recent verkocht (23 auto's in twee lopende banden), werkbon, diensten (proefrit, financieren, verzekeren, auto verkopen), reviews (score, uitgelicht met klantfoto, 8 kaarten), vier stappen, bezoek en contactformulier, footer. WhatsApp-widget rechtsonder, mobiele actiebalk (Bel, App, Voorraad).

## Collectie

De volledige voorraad van maesautos.nl/occasions (18-11-2026) staat in `_bouw/catalogus.json`: 30 auto's met alle specificaties, opties en foto-URL's. 7 te koop (alle foto's lokaal, 1400 en 640 breed), 23 verkocht (eerste foto lokaal). De verkochte auto's staan als "Recent verkocht" op de pagina.

## Draaien en bijwerken

```bash
node server.js                # http://localhost:9070 (ook als maesautos-website in .claude/launch.json)
python3 _bouw/scrape.py       # voorraad opnieuw ophalen van maesautos.nl (VWE)
python3 _bouw/parse.py        # ruwe data naar _bouw/catalogus.json
python3 _bouw/fotos.py        # foto's downloaden en naar webp
node _bouw/bouw.mjs           # index.html opnieuw genereren
```

Reviews staan in `_bouw/reviews.json`, bedrijfsgegevens en openingstijden bovenin `_bouw/bouw.mjs` (en de tijden ook in `js/main.js` voor de openstatus). Uitrollen: statisch, bijvoorbeeld Vercel (`vercel.json` staat klaar).

## Beeld

- Voorraadfoto's: VWE-CDN van de huidige site, lokaal als webp.
- Klantfoto's bij reviews: uit de aangeleverde bijlage (`_bouw/reviews-bijlage.docx`), 201 px, daarom alleen klein (avatar, polaroid, duimnagels).
- Sfeer: Unsplash, koel nabewerkt, zie `_bouw/stock/bronnen.md`.

## Keuring

`keuring.mjs`: 0 fouten. Twee waarschuwingen bewust laten staan: 23 MB media (alle foto's van de 7 auto's staan klaar voor de detailpagina's; de homepage laadt er per auto maar twee) en een blauw accent dat vaker voorkomt (dat is de eigen huisstijlkleur; het onderscheid zit in het label-concept en het manilla). Gemeten in de browser op 1440 en 390: geen horizontale scroll, groene WhatsApp-knoppen met tekst verdonkerd naar #0d6332 (7,4:1), tikdoelen op mobiel 44 px. Bewust afwijkend: 1478 DOM-elementen (vooral de dubbele lopende band met 23 verkochte auto's en de iconen).

## Open punten

1. **Openingstijden bevestigen.** De eigen site toont ze niet; nu overgenomen van Cylex/autokopen.nl: ma 09.00-17.00, di t/m do 09.00-18.00, vr 09.00-17.00, za 10.00-16.00, zo gesloten.
2. **Google-score 4,7 uit 73 reviews** komt van het Marktplaats-dealerprofiel (dat Google toont). Graag de directe link naar het Google-profiel; nu linkt de score naar een Google Maps-zoekopdracht.
3. **Alfa Romeo Spider** heeft een prijs (€ 1.500) maar "VERKOCHT!" in de titel: staat bij verkocht. Klopt dat?
4. **Prijzen en APK-data** zijn overgenomen van de huidige site; bevestigen voor livegang. Bij een paar auto's (Kia Sportage, Fiat Doblò) zegt de titel "nieuw APK" terwijl de APK-datum in de data verlopen is; daar tonen we geen datum.
5. **Onderhoud en reparatie:** reviews noemen onderhoud en keuren, de huidige site niet. Als Maes dat aanbiedt, verdient het een eigen dienstkaart.
6. **Logo in hoge resolutie of als vector** aanleveren; nu nagebouwd.
7. **Eigen foto's van het pand en de eigenaar** zouden de bezoeksectie sterker maken (nu sfeerbeeld koffie).
8. De verzekeringsrekentool (dealerservices.eu, DealerId 15384) en de FinancialLease-calculator komen op de eigen pagina's van het volledige ontwerp.
9. Twee negatieve reviews (2021 en 2026) staan bewust niet op de site.
