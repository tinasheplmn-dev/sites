# Aanhangerrijbewijs in 1 dag — website

Nieuwe site voor **aanhangerrijbewijsin1dag.nl**, het BE-merk van Verkeersschool M. van Heugten (Den Bosch/Rosmalen). Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

## Draaien

```bash
node server.js
```

Site draait dan op http://localhost:8076. Of via de launch-config `aanhanger1dag-website` (poort 8076).

## Deployen

Alles in deze map (behalve `server.js` en deze README) naar elke statische host kopiëren: Vercel, Netlify, of gewone hosting. Geen dependencies, geen build.

## Artdirection (voor de zustersite, prompt 34)

- **Familietaal Van Heugten:** licht canvas `#F7F4EE`, rode CTA's `#C1272D`, Archivo (variabel, brede display-kapitalen) + Jost voor gespatieerde kapitalen.
- **Eigen accent van dit merk: "het zwarte bord".** Secties en kaarten als het zwarte aanhangerpaneel: diep zwart `#0C0D10` met alu-rand `#C9CBCE` en witte gespatieerde Jost-kapitalen met witte onderstreep, exact zoals de fysieke merkaanhanger op de foto's.
- **Motion-concept: "de lijn van de dag".** Eén streepjesroute door de homepage (hero → tijdlijn) met een auto+aanhanger-marker die op scroll meerijdt; in de hero rijdt de combinatie aan. Respecteert `prefers-reduced-motion`.

## Logo vervangen

Het merkteken staat in twee bestanden: `assets/logo.svg` (donker, header) en `assets/logo-wit.svg` (wit, footer). Definitief logo aangeleverd? Vervang die twee bestanden, klaar. De merknaam ernaast is HTML-tekst (`.brand-word`).

## Vóór livegang laten bevestigen door de opdrachtgever

- **Tarieven:** 1-daags €849 (van €899, tijdelijke actie) · 2-daags €1.225 (van €1.299, tijdelijke actie) · losse les €85 · intake €112,50 · caravantraining €200 (overgenomen van de huidige site).
- E-mailadres info@aanhangrijbewijsin1dag.nl (zonder "er") is volgens de opdrachtgever correct.
- Formulier verstuurt via WhatsApp (wa.me) met vooringevuld bericht; geen backend nodig. Gewenst e-mailalternatief met backend? Dan hosting met formulier-endpoint kiezen.

## SEO

- Unieke title/description per pagina, canonical, OG-tags, `sitemap.xml`, `robots.txt`.
- JSON-LD `DrivingSchool` op de homepage: adres Saffierborch 26 Rosmalen, telefoon, openingstijden, geo (afgerond), aggregateRating 5,0/31 (Clickdrive, moederschool; op de site altijd met bronvermelding).
- Doelzoekwoorden verwerkt: aanhangerrijbewijs Den Bosch, BE-rijbewijs in 1 dag, E achter B halen, caravan rijbewijs, plus Rosmalen/Vught/Oss/Waalwijk.

## Media

`assets/img/geslaagd-01..23.jpg`: screenshots uit de klantmap (socials), verkleind naar 1100px JPEG. Het zijn screenshots, geen originele foto's; voor druk- of hero-gebruik op grote schermen is de kwaliteit voldoende maar niet meer dan dat. Scherpere originelen van de leswagen en het oefenterrein blijven welkom.
