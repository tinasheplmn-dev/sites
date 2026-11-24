# TitleShot website

Statische site in Nederlands (root) en Engels (`/en/`), 8 pagina's per taal: home, website, boekingssysteem, merk, marketing, over ons, contact en The Weigh-In.

## Concept
Fight night. De site is een fight card: het aanbod als affiches, de zes methodes als bouts, het Masterplan in vier rondes, de pakketten als gewichtsklassen en de garanties als gouden riemplaten. Huisstijl volgt de merkgids (Gasoek One, Libre Franklin, Special Elite, leer en goud). Zie `_bouw/dossier.md`.

## Draaien en aanpassen
- Preview: `node server.js` (poort via `PORT`, standaard 8053).
- De HTML wordt gegenereerd. Teksten staan in `_bouw/paginas.mjs` als `x('Nederlands', 'English')`, de vaste onderdelen (menu, footer, iconen) in `_bouw/bouw.mjs`. Na een wijziging: `node _bouw/bouw.mjs`.
- Beeld opnieuw verwerken: `python3 -P _bouw/beeld.py` (bronnen in `_bouw/stock/origineel/`).
- Uitrollen: `~/sites-deploy/publiceer.sh titleshot`.

## Keuzes (en het alternatief)
- **Hero-kop "Volle matten. Geen giswerk."** Komt uit het voorbeeld in de merkgids. Alternatief: "Elke gym verdient een title shot."
- **Meerdere pagina's** in plaats van een one-pager, omdat het aanbod te groot is voor een pagina.
- **Marketing op een pagina** met een vaste methodebalk en de vier advertentiekanalen als uitklappers (eerste open). Alternatief: een pagina per methode.
- **The Weigh-In is een zelfscan** van negen vragen met score en de drie grootste kansen. Hij draait volledig in de browser en slaat niets op. Alternatief: een echte automatische scan van de site van de gym.
- **Knop bij het boekingssysteem heet "Vraag de demo aan"** en gaat naar het formulier, omdat er nog geen demo-link is. In de brontekst staat "Bekijk de demo".
- **Formulier opent het mailprogramma** met een ingevulde mail, omdat er geen server achter de site zit.
- **Jouw foto's** staan bescheiden: een portret op home ("Business with a fighter's mindset") en drie foto's onderaan Over ons. Op de bekerfoto is alleen jij in beeld gelaten.
- **Iconen** zijn zelf getekend in de stijl van het iconenpakket (dikke lijn, goud, rood accent, vonkjes). Ze staan in een sprite (`assets/iconen.svg`, gegenereerd in `bouw.mjs`) en zijn in een keer te vervangen.
- **Pakketten**: geen "meest gekozen"-label, want daar is geen bron voor.
- Niet op de site, zoals gevraagd: reviews, cases, gratis websiteconcept, Knowledge Vault, AI-medewerkers, prijs van de volledige versie.

## Open punten
1. **E-mailadres**: overal staat `info@titleshot.nl` als aanname. Pas `MAIL` aan in `_bouw/bouw.mjs`.
2. **Domein**: canonical, sitemap en OG wijzen naar de GitHub Pages-link. Pas `SITE` aan in `_bouw/bouw.mjs` zodra het eigen domein er is.
3. **Telefoon en WhatsApp** ontbreken, dus geen WhatsApp-knop en geen belknop. Lever een nummer aan en ze komen erbij.
4. **Bedrijfsgegevens** (KvK, btw, adres) en privacyverklaring ontbreken in de footer.
5. **Naam van de oprichter** staat nergens; de foto's dragen het label "Oprichter".
6. **Demo-link** van het boekingssysteem.
7. **Formulier**: werkt nu via het mailprogramma. Een echte verzending vraagt een server of formulierdienst.
8. **Iconen**: vervangen door de bronbestanden zodra die er zijn.
9. **Koppen op mobiel**: drie lange paginakoppen (website, boekingssysteem, Weigh-In) staan op 23 pixels om op twee regels te blijven; de merkverhaalkop op Over ons loopt op mobiel over drie regels.
10. Prijzen en garanties zijn letterlijk uit het concept van 24 november 2026 overgenomen: bevestig ze voor livegang op het eigen domein.

## Gecontroleerd
- Keuring (`keuring.mjs`): 0 fouten. Waarschuwing "geen knop in de hero" op home is een valse melding (er staan twee knoppen).
- In de browser gemeten op 1440 en 390 breed, alle acht pagina's: geen horizontale scroll, geen kapotte beelden, contrast in orde (alleen de bewust doorzichtige contourcijfers worden gemeld, die zijn decoratief).
- Getest: mobiel menu, The Weigh-In tot en met de uitslag, formuliervalidatie en voorselectie van het onderwerp.
