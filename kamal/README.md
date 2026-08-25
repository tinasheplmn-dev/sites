# Autorijschool Kamal · website

Site uit de rijscholenreeks (prompt 60). Volledig statisch: HTML + CSS + vanilla JS, geen build-stap.

## Draaien

```bash
node server.js
```

Site draait dan op http://localhost:8092 (of via de launch-config `kamal-website`).

## Deployen

Statische host naar keuze. Voor Vercel: map koppelen en klaar (`vercel.json` regelt nette URL's zonder `.html`).

## Concept

"Schakel voor schakel": het H-schakelpatroon van de handgeschakelde Polo is de visuele signatuur. Palet: petrol-nachtblauw (#062033) + aquamunt (#2ee6b0). Typografie: Fraunces (koppen) + Archivo (tekst), lokaal gehost in `assets/fonts/`.

- `index.html` + 6 subpagina's: rijlessen, rijangst, opfris, tarieven, geslaagden, proefles
- `css/style.css`: het volledige designsysteem
- `js/main.js`: hero-intro, sticky schakelsectie (5 versnellingen), reveals, tellers, reviewband, tilt op de geslaagdenmuur, proefles-formulier dat een WhatsApp-bericht opstelt
- `assets/beeldmerk.svg`: beeldmerk (H-patroon met muntgroene knop), ook favicon. Vervangbaar door een aangeleverd logo in één handeling (zelfde bestandsnaam, of de twee `<img src="/assets/beeldmerk.svg">` per pagina aanpassen).
- `assets/iconen.svg`: eigen lijniconenset (sprite)
- `assets/img/`: 12 geslaagdenfoto's, lokaal verwerkt uit de aangeleverde screenshots (geen hotlinks naar de oude site)

## Voor livegang bevestigen bij de opdrachtgever

- **Tarieven** (overgenomen van de oude site en de aangeleverde screenshot): losse rijles €65 · Medium 20 lessen €1.535 · Large 30 lessen €2.200 · XXL 40 lessen €2.525, alle pakketten incl. praktijkexamen en gratis eerste proefles. Voorwaarde: geen terugbetaling bij voortijdige beëindiging.
- **Cijfers**: 60% in één keer geslaagd en 90% zonder proefexamen zijn door de opdrachtgever bevestigd ("ja klopt"). Google-score 5,0 uit 116 met de aangeleverde reviewlink verwerkt in de tekst én in de JSON-LD (aggregateRating); bijwerken zodra het aantal reviews groeit.
- **Openingstijden**: ma t/m vr 9:00-17:00, za 9:00-12:00 (aangeleverd). Verwerkt in footer, contactpagina en JSON-LD.
- **Adres**: Cantecleerstraat 18, 5625 GR Eindhoven (aangeleverd).
- Formulier werkt via WhatsApp (wa.me/31641999646): de bezoeker verstuurt het bericht zelf. Geen e-mailadres bekend; zodra dat er is, kan een mailoptie erbij.
- Geen portretfoto van Kamal beschikbaar; de site werkt bewust met de geslaagdenfoto's. Een portret kan later op de homepagina bij "De man achter de rijschool".
