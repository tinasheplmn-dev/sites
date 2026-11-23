# KEK B.V.: nieuwe website

Vernieuwde site voor kekbv.nl (interieurbouw en afbouw, Den Bosch). 42 pagina's: 7 hoofdpagina's en 35 projectpagina's. Platte HTML/CSS/JS, eigen aanvraagsysteem powered by Mettafel.

## Concept: volledig geregeld, tot op de centimeter
- **Donkergrijs als basis, lichtcrème als tweede vlak, rood alleen als accent** (zoals gevraagd). Licht en donker wisselen per sectie.
- **Maatlijnen als signatuur**: de dunne maatvoering uit een werktekening (lijn met eindstreepjes en label) tekent zich bij het scrollen rond de hero, de cijfers, de werkplaatsbeelden en elke paginakop.
- **Het logo als vector**: exact nagetekend uit het officiële logo (#E41F28). In de header valt het bij het laden uit zijn eigen balken op zijn plek; in de slotband schuiven de delen van boven en onder in elkaar. De drie balken van de E zijn het merkteken voor alle bullets; schuin afgesneden hoeken (uit de K) komen terug op beeld en knoppen.
- **Hero**: grote typografie plus een wisselend projectkader (Panenka, Heijmans, Peel en Maas, Via Via, Janzen) met maatlijn en projectnaam die meeloopt.
- Verder: staalkaart-USP's (KEK-01 tot KEK-03, met kantenband), projectmozaïek, werkwijze met een rode lijn die meegroeit tijdens het scrollen, afbouwkiezer met tien disciplines, projectfilter per branche, galerij met lightbox, lopende band met opdrachtgevers.

Lettertypen: **Antonio** (koppen, smal en technisch zoals het logo) en **Geologica** (tekst), zelf gehost.

## Kleuren
| Token | Waarde | Waarom |
|---|---|---|
| `--merk` | #e41f28 | Exact logo-rood, voor logo, balken en vlakken |
| `--cta` | #ad1119 | Knoprood: witte tekst haalt 7,3:1 (logo-rood haalt maar 4,6:1) |
| `--rood-tekst` | #ff4048 | Rood als tekst op donker, alleen in grote koppen |
| `--inkt` | #151618 | Donkergrijze basis |
| `--papier` | #f2ece2 | Lichtcrème, afgeleid van het zandbeige #e8dcca van de oude site |

## Inhoud
Alles van de oude site is meegenomen: beide diensten, alle tien afbouwdisciplines, de zes stappen, het verhaal van familie Kuiper, kernwaarden, werkplaats, MVO-cijfers met link naar het CO2-certificaat, zes actuele vacatures en 35 projecten. Projectteksten zijn ingekort maar feitelijk gelijk aan de bron; bij projecten zonder tekst staat alleen een feitelijke regel plus de galerij. Data: `_bouw/projecten.json`. Pagina's opnieuw bouwen: `node _bouw/bouw.mjs`.

Beeld: allemaal eigen projectfoto's van kekbv.nl, lokaal gedownload en omgezet naar webp (1600 en 800 breed). Geen stock. Originelen in `_bouw/bron-beeld/`.

## Aanvragen (powered by Mettafel)
Het contactformulier stuurt naar `server.js` (opslag in `_data/aanvraag.json`, bijlagen als PDF of beeld in `_data/uploads/`). Beheer op `/beheer?token=...` met statussen nieuw, gebeld, opname gepland, offerte verstuurd, opdracht, afgerond. Zet in productie `BEHEER_TOKEN` en eventueel `MELDING_URL`. Vanaf een projectpagina vult de knop "Ook zo'n project?" het bericht alvast in.

## Draaien en uitrollen
```bash
cd websites/kek-website && node server.js
```
Poort 8401 (ook in `.claude/launch.json` als `kek-website`). Uitrollen op een Node-host voor het formulier; puur statisch kan ook, dan werkt het formulier niet.

## Keuring
- `keuring.mjs`: 0 fouten. Waarschuwingen die blijven: accentkleur rood lijkt op eerdere sites (opgelegd door het logo, het concept draagt het onderscheid), totaal beeld 33 MB verspreid over 42 pagina's (per pagina ruim binnen budget), `--rood-tekst` alleen voor grote koppen.
- Gerepareerd: knoprood van 6,1 naar 7,3:1, geselecteerde tab en filter van wit-op-rood naar inkt-op-crème, h1 in de hero van vier naar twee regels, subkoppen in halve kolommen naar één regel, hero-bullets op mobiel naar één regel, zes beelden onder 300 kB, 42 ongebruikte beelden verwijderd, een klassenaam-botsing die de USP-sectie een rode rand gaf, tikdoel van het logo.
- Mobiel (375): geen horizontale scroll op alle pagina's. Formulier met PDF-bijlage getest tot en met de bevestiging, testdata verwijderd. Lightbox, filter en afbouwtabs getest.

## Open punten
1. **Adres en openingstijden bevestigen**: Graaf van Solmsweg 111 en ma-do 07-17, vr 07-16 komen van LinkedIn en openingstijden.nl, niet van de huidige site.
2. Link naar het Google-profiel toevoegen (nu "5 sterren op Google" zonder aantal; zeven reviews is te weinig om het aantal te noemen).
3. Logo's van opdrachtgevers aanleveren voor de lopende band (nu namen in tekst).
4. Bureaubladenlijn en toeleverancier: bewust weggelaten (niet in het menu van de oude site). Wil KEK die zichtbaar, dan komt er een eigen pagina.
5. Vacatureteksten zijn samengevat; volledige teksten of een koppeling met het vacaturesysteem.
6. Projecten zonder eigen tekst (Panenka, Heijmans, Maxim's, Served, SEB, HAS, Durlinger Rosmalen, Kind & Co, HeyDay, Tony's): een paar zinnen per project maakt die pagina's sterker.
7. Plaats bij SEB Professional, HAS green academy, Pot & Vaas en Kind & Co is onbekend.
8. KvK-nummer voor de footer.
