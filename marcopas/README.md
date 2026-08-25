# Autorijschool Marco Pas · marcopas.nl

Volledig statische site (HTML + CSS + vanilla JS), geen buildstap. Artdirection: warm papier,
licht oranje en warm zwart; Fraunces voor de koppen, Instrument Sans voor de rest, met de route
(asstreep + hectometerpaaltjes) als terugkerend motief.

## Twee uitgangspunten in de teksten

- **De klant staat vooraan.** Koppen gaan over wat de bezoeker wil bereiken (snel en zeker je
  rijbewijs), niet over Marco. Zijn 22 jaar en de reviewcijfers zijn het bewijs eronder, niet de
  belofte erboven.
- **Kort.** Eén tot twee zinnen per blok. Wie meer wil weten, klikt door.

## Mobiel

Mobiel is leidend. Kaartenrijen (waarden, aanbod, reviews, pakketten) zijn op schermen tot 759px
horizontale carrousels met scroll-snap: korte rijen krijgen stipjes, rijen van meer dan zes items
een voortgangsbalkje. Vanaf 760px worden het weer gewone rasters en verdwijnt de navigatie
eronder. Onderaan staat een vaste actiebalk met bellen, WhatsApp en de proefles-CTA.

## Lokaal draaien

```
node server.js
```

Site draait dan op http://localhost:8085. Of via de launch-config: `marcopas-website`.

## Deployen

Statisch, dus elke host werkt. Voor Vercel: map deployen, `vercel.json` regelt nette URL's
zonder `.html` en caching van assets. De links in de site zijn relatief (`pagina.html`), met
`cleanUrls` werken zowel `/tarieven` als `/tarieven.html`.

## Structuur

- `index.html` · home met hero (lesauto rijdt in), route-sectie, reviews, cijfers
- `rijlessen.html` · schakel (#schakel), automaat (#automaat), theorie (#theorie), extra begeleiding
- `tarieven.html` · pakketten 35/40/45 uur + losse tarieven
- `over-marco.html` · verhaal sinds 2004 + tijdlijn
- `reviews.html` · alle 17 Google-reviews + knoppen naar Google en Klantenvertellen
- `faq.html` · veelgestelde vragen, met FAQPage structured data
- `proefles.html` · hoofdconversie: formulier (opent WhatsApp met ingevuld bericht) + contact
- `assets/logo.svg` en `assets/logo-donker.svg` · wordmark; vervang deze twee bestanden zodra
  het definitieve logo er is, verder hoeft er niets aangepast te worden
- `assets/lesauto.webp` · vrijstaande lesauto, lokaal gedownload van de oude site (hoge resolutie)

## Voor livegang bevestigen bij de opdrachtgever

- Tarieven en actieprijzen 2026 (nu overgenomen van de huidige site: pakketinhoud volgens de
  tarievenpagina daar; tussentijdse toets zit bij géén pakket inbegrepen, theorie online alleen
  bij 40 en 45 uur)
- Openingstijden: Google vermeldt zondag "24 uur geopend", dat is niet overgenomen
  (ma t/m vr 8:00-19:00 en za 8:00-13:00 staan op de site en in de structured data)
- Foto's van Marco zelf (placeholders staan klaar op home en over-marco)
- Geo-coördinaten in de JSON-LD zijn benaderd op basis van het adres; exacte waarden
  overnemen uit Google Business Profile
