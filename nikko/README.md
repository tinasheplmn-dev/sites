# Nikko Sports: webshop (nikko.nl)

Nieuwe webshop-site voor **Nikko Sports**, vechtsportwinkel en eigen merk uit Eindhoven (sinds 1985).
Zwart, rood en wit zoals het merk al is, nu met de discipline van een topmerk: donkere merksecties,
witte productkaarten, rood alleen voor actie en nadruk. Barlow Condensed (koppen, labels, prijzen) en
DM Sans (body), zelf gehost.

**Het idee: "De keuze van kampioenen".** De eigen slogan (#ChoiceOfChampions) draagt elke sectie: de
hero met de atleet in de eigen set (wisselt elke zeven seconden tussen Black Edition, White Edition en
Women), de drie USP-kaarten (verzending, kampioenen, advies), het merkverhaal met de gesponsorde
vechters, de Trustpilot-collage (4,9 uit 670 reviews) en het Instagram-blok.

**Signatuur: de diagonaal van de N.** De schuine streep uit het logo keert terug als snede in de hero,
als schuine rode band tussen de secties, als skew in de sale-badges, als afgeschuinde hoek op knoppen en
als rode streep die onder een productkaart uitschuift bij hover.

## Lokaal draaien

```bash
node server.js        # http://localhost:9060, beheer: http://localhost:9060/beheer?token=nikko
```

Of via de launch-config `nikko-website` (poort 9060). Geen build-stap, geen dependencies.

## Structuur

```
index.html                 home
shop.html                  alle producten met filters (sport, categorie, maat, merk, prijs), zoeken, toon-meer
boksen/kickboksen/mma/training/kleding/kids.html   per sport, zelfde filters
p-[slug].html              150 productpagina's (galerij, maatkeuze, aantal, in winkelwagen, specificaties)
winkelwagen.html, afrekenen.html, bedankt.html     de bestelflow
over-ons.html, klantenservice.html, zakelijk.html, contact.html, 404.html
css/style.css              designsysteem en componenten; css/motion.css de motionlaag
js/catalogus.js            gegenereerd: compacte catalogus voor filters en winkelwagen
js/shop.js                 winkelwagen (localStorage), productpagina, filters, afrekenen, formulieren
js/main.js                 zoeken, menu, hero-collecties, openstatus, chatwidget
js/motion.js               reveals, hero-opening, parallax, zweven (uit de skill, crossfade op 7 s)
assets/iconen.svg          eigen iconenset (sprite)
assets/img/p/              160 productfoto's (webp 900 px, uit de Store API van nikko.nl)
assets/img/                atleten (bijlage), Holzken, rode-rook-beeld, og.jpg
_bouw/bouw.mjs             de generator; _bouw/catalogus.json de productdata; _bouw/dossier.md het onderzoek
server.js                  statische server plus Mettafel-backend (bestellingen, aanvragen, berichten)
```

## Pagina's opnieuw bouwen

Alle HTML komt uit `_bouw/bouw.mjs`. Pas de generator of `_bouw/catalogus.json` aan en draai:

```bash
node _bouw/bouw.mjs
```

De catalogus (150 producten) komt uit de WooCommerce Store API van nikko.nl
(`/wp-json/wc/store/v1/products`), ruw bewaard in `_bouw/store_api_ruw.json`. De selectie
(`_bouw/keuze.json`) is gemaakt uit 35 categoriepagina's: per categorie de Nikko-producten eerst, maximaal
twee kleurvarianten per model. Tunturi Fitness, XXL Nutrition, Gym en merchandise zijn bewust weggelaten.

## Bestellen, aanvragen en berichten (powered by Mettafel)

`server.js` is de Mettafel-backend uit de skill. Routes:

- `POST /api/bestelling`: de afrekenpagina stuurt naam, e-mail, telefoon, bezorging (thuis of afhalen),
  betaalmethode, regels en totaal. Opslag in `_data/bestelling.json`, nummer `NK-2026-0001` enzovoort.
- `POST /api/aanvraag`: zakelijk account (zakelijk.html). `POST /api/bericht`: contactformulier.
- `GET /beheer?token=...`: beheerpagina met statusknoppen (nieuw, bevestigd, verzonden, afgehaald).

Omgevingsvariabelen: `PORT`, `BEHEER_TOKEN` (verplicht in productie), `MELDING_URL` (webhook voor een
melding bij elke nieuwe bestelling). De winkelwagen leeft in `localStorage` (`nikko_mand`); de
klantgegevens worden op het toestel onthouden (`nikko_klant`) zodat een vaste klant niet opnieuw hoeft te typen.

**Betaling is nog niet gekoppeld.** De klant kiest een betaalmethode, de bestelling komt binnen in het beheer,
en de bedankpagina zegt dat er een betaallink volgt. Mollie (iDEAL, PayPal, Bancontact) koppelen is de
logische vervolgstap: in `js/shop.js` na het `POST /api/bestelling` doorsturen naar de Mollie-checkout.

## Uitrollen

De site heeft een Node-host nodig voor de bestelflow (Railway, Render, Fly, VPS): `node server.js` met
`BEHEER_TOKEN` gezet. Puur statisch (Vercel, Netlify) werkt ook, maar dan slaan afrekenen en de formulieren
niets op; `vercel.json` staat klaar voor cleanUrls.

## Beeld

- Drie studiofoto's van atleten in Nikko-sets (bijlage van de eigenaar, 1080x1350): hero, USP-kaart, Instagram-blok, over-ons.
- Nieky Holzken "White Edition" (OG-beeld van nikko.nl, 2200x1203): USP-kaart en merkverhaal.
- Rode-rook-productbeeld: de rechterhelft van de Black Friday-banner van nikko.nl, zonder tekst.
- Productfoto's: originelen uit de Store API, verkleind naar 900 px webp.
- Logo: `Nikko-logo-2015-wit.png` van de site, vrijstaand gemaakt in een donkere en een lichte variant (240 px). De grote varianten staan in `_bouw/orig/`.
- Geen stockbeeld, geen AI-beeld.

## Keuzes

- Hero: optie A uit de vragenronde (atleet op zwart, wisselend), met alleen "De keuze van kampioenen." als kop; "Sinds 1985", de sterren en de verzendbelofte staan in de topbalk.
- Rood: de tint van nikko.nl (#d23f34) is gehouden maar verdiept. `--merk` #d8261b voor accenten, `--cta` #ad170d voor rode vlakken met witte tekst (7:1), `--merk-op-donker` #ff7b70 voor rode tekst op zwart (7:1).
- Chatwidget op verzoek: beantwoordt de veelgestelde vragen (maat, verzending, retour, winkel, zakelijk, betalen) met trefwoorden en verwijst daarna naar WhatsApp of telefoon. Geen externe dienst, geen AI; dat staat er ook bij.
- Reviews: Trustpilot (4,9 uit 670, gezien 18 november 2026), 28 reviews verbatim in `_bouw/reviews.json`. Geen klantfoto's in de bijlage, dus initialen-avatars.
- Prijzen zijn de actieprijzen van november 2026 uit de Store API; de reguliere prijs staat doorgestreept.

## Keuring

`node ~/.claude/skills/website-bouwen/scripts/keuring.mjs websites/nikko-website`: 0 fouten. Opgelost
tijdens de keuring: dubbele titels en beschrijvingen van kleurvarianten (nu met kleur, maten, prijs en
artikelnummer), de logo-PNG's van 800 kB uit assets, en-dashes in productteksten. Browsermetingen
(contrast.js, meten.js) op 375 en 1440: alle tekst minimaal 7:1 (buttons en labels op rood via `--cta`),
geen horizontale scroll, tikdoelen 44 px op mobiel. Resterende waarschuwingen: geen JSON-LD op winkelwagen en
zakelijk (bewust), winkelwagen/afrekenen/bedankt/404 niet in de sitemap (noindex).

## Open punten (bevestigen door Nikko)

1. **Prijzen**: de catalogus bevat de Black Friday-prijzen van november 2026. Vóór livegang de actuele prijzen laden (generator opnieuw draaien met verse Store API-data).
2. **Verzendkosten onder € 100**: staan nergens op nikko.nl. Invullen in `js/catalogus.js` (`NIKKO_CONFIG.verzendkosten`, nu `null`; de site zegt dan "volgt in de bevestiging").
3. **Betaling koppelen** (Mollie) en de bevestigingsmail (nu alleen opslag in het beheer).
4. **Retouradres en -termijn** bevestigen (nu 14 dagen uit de algemene voorwaarden) en de 3 maanden garantie.
5. **Vechters**: de sponsorlijst komt uit de eigen Over Ons-tekst. Rechtenvrij beeld van de atleten maakt het merkverhaal sterker; nu alleen Holzken (bestaand sitebeeld).
6. **Collectie uitbreiden**: 150 van de 553 artikelen staan erin. Tunturi, XXL Nutrition en merchandise toevoegen = quota in `_bouw/bouw.mjs` en opnieuw selecteren.
7. **Kaart op contact**: OpenStreetMap-embed; vervangen door Google Maps als de eigenaar dat wil.
8. **Domein en e-mail**: de site gaat uit van nikko.nl en info@nikko.nl.
