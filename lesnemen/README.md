# Rijschool Lesnemen · website

Volledig statische site (HTML/CSS/JS, geen build-stap) voor Motorrijschool Lesnemen in Goirle, actief in de hele regio Tilburg.

## Concept

**"Het plan."** De kern van deze school is planmatig vakmanschap: Bart plant direct na de proefles je examens in en werkt daar les voor les naartoe. De site is daarom vormgegeven als een precisie-lesplan: papierwit met millimeterraster, technische annotaties in monospace (FIG.-nummers, maatlijnen zoals "190 m eigen asfalt"), en één doorlopend motion-concept: **de planlijn**, een rail links in beeld die zich al scrollend vult en etappes afvinkt (proefles, AVB, AVD, rijbewijs). In de hero tekent een slalomlijn zichzelf door de pionnen.

- Kleuren: papier (#f5f3ec), inkt (#10182b), **Lesnemen-ultramarijn (#0031c6, de knoppen: klant-eis "uniek blauw")**, fluor-hesje-accent (#d8ef2c, van de echte hesjes op de leerlingenfoto)
- Typografie: Archivo (variabel, brede display-snit voor koppen) + IBM Plex Mono (annotaties)
- Iconen: eigen getekende lijniconen (inline SVG), geen bibliotheek
- Logo: eigen wordmark als component (`.logo` in elke pagina + `assets/favicon.svg`); een later aangeleverd logo kan het wordmark in één handeling vervangen

## Pagina's

`index` · `werkwijze` (traject in 5 fases + motorkeuze-widget A/A2) · `tarieven` · `reviews` (volledige muur, verbatim van Google) · `proefles` (formulier stuurt via WhatsApp of mail naar Bart)

## Lokaal draaien

```bash
node websites/lesnemen-website/server.js
```

Draait op http://localhost:8087 (launch-config `lesnemen-website`).

## Deployen

De map is as-is te hosten op elke statische host (Netlify, Vercel, Cloudflare Pages). Interne links zijn extensieloos (`/werkwijze`); zet "clean URLs" aan of laat de host `.html` afhandelen. `sitemap.xml`, `robots.txt`, OG-tags en JSON-LD (DrivingSchool met aggregateRating 5,0 uit 98) staan erin.

## Vóór livegang bevestigen bij de opdrachtgever

- Tarieven (van de oude site overgenomen): proefles/losse les € 60, pakket € 1.325, AVB € 175, AVD € 360, theorie € 48,75
- Clickdrive-cijfer op de site: 93% AVB in één keer (1.133 examens), met bronvermelding
- Openingstijden (ma t/m vr 09:00-22:00, za 09:00-18:00, zo gesloten)
- Oefenterrein-adres (Oude Rielseweg 2-4, Tilburg) staat bewust NIET op de site; op de proeflespagina staat "adres krijg je bij het inplannen". Toevoegen kan in `proefles.html`.

## Geslaagdenmuur: foto's plaatsen

Op de homepagina (in de reviewsectie) en op `/werkwijze` staat een geslaagdenmuur met vier fotokaarten. De foto's zijn nog placeholders ("FOTO VOLGT"). Zodra er beeld is:

1. Zet de foto in `assets/` (staand, ongeveer 4:5, minimaal 800 px breed).
2. Vervang in de betreffende `<figure class="geslaagd">` het hele blok `<div class="foto-plek">…</div>` door:
   `<img class="geslaagd-foto" src="/assets/geslaagd-naam.jpg" alt="Naam, geslaagd voor het motorrijbewijs bij Rijschool Lesnemen">`
3. Naam, doorlooptijd en citaat in `.kaart-voet` aanpassen als de foto bij een andere leerling hoort.

Op mobiel is de muur een swipe-carrousel, op desktop een rij van vier. Er is geen aanpassing nodig aan de CSS.

## Beeldmateriaal (actie voor de opdrachtgever)

Van de oude site was maar één echte foto bruikbaar: het oefenterrein met de twee Honda's (`assets/oefenterrein.jpg`, 1600 px). De leerlingenfoto (`assets/leerlingen-onderweg.jpg`) is lage resolutie (650 px) en daarom nu niet geplaatst. Gevraagd aan de opdrachtgever: echte foto's van het terrein (hoofdrol), de Honda's, en Bart zelf; portret van Bart kan direct een plek krijgen in de werkwijze-pagina. `assets/rijder-weg.jpg` is een stockbeeld van de oude site en staat als reserve in de map, bewust niet gebruikt.
