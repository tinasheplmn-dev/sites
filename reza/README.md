# Rijschool Reza · website

Nieuwe site voor Rijschool Reza (Eindhoven). Volledig statisch: HTML, CSS en een klein beetje JavaScript. Geen build-stap, geen dependencies.

## Concept

Professionele, cleane site voor iedereen die zijn rijbewijs wil halen. Babyblauw (#7EBCFC, uit het logo) en inktzwart, Fraunces voor de koppen, Schibsted Grotesk voor de tekst (beide lokaal gehost). Eén motion-concept: alles beweegt traag en zacht ("ademtempo"), met de ademende ring, de weg die zichzelf tekent onder de hero en de gestippelde wegstreep als terugkerend motief. Copy is bewust kort en breed; het rust-thema wordt alleen op de autisme/ADHD-pagina inhoudelijk uitgespeeld (klantkeuze, aug 2026). `prefers-reduced-motion` wordt gerespecteerd.

## Draaien

```bash
node server.js
```

Site draait dan op http://localhost:8080. Of via de launch-config `reza-website`.

## Deployen

Alles in deze map (behalve `server.js` en deze README) naar elke statische host kopiëren: Netlify, Vercel, Cloudflare Pages of klassieke hosting. De interne links werken zonder `.html` alleen als de host "clean URLs" ondersteunt (Netlify: standaard aan); anders werken de `.html`-links ook gewoon.

## Pagina's

- `index.html` — home
- `rijlessen.html` — schakel, automaat, faalangst, opfris, Engels
- `autisme-adhd-add.html` — de specialisatiepagina
- `werkwijze-en-tarieven.html` — traject, pakketten, losse tarieven
- `reviews.html` — reviewmuur (29 reviews) + Google-knop (78 reviews, 5,0)
- `proefles.html` — formulier (opent WhatsApp), contact, lestijden

## Vóór livegang bevestigen

- **Pakketprijzen**: 20 lessen €1990 · 30 lessen €2690 · 35 lessen €3040 · 40 lessen €3390, aangehouden als **gelijk voor schakel en automaat**. De twee prijsafbeeldingen op de oude site tonen identieke bedragen maar spreken elkaar tegen in de schakel/automaat-labels; graag dit "zelfde prijs"-uitgangspunt expliciet laten bevestigen (het staat ook zo op de homepage en tarievenpagina als USP).
- Losse tarieven (proefles €55, les €70, TTT €230, examen €300, herexamen €320, BNOR €320) en lestijden zijn van de oudesite overgenomen.
- Reviewscore 5,0 uit 78 is door de opdrachtgever bevestigd (aug 2026).
- E-mailadres info@rijschoolreza.nl stond op de oude site en is overgenomen.

## Nog open

- **Instagram-collage** (optioneel in de opdracht) is niet gebouwd: de posts zijn zonder login niet betrouwbaar op te halen en de beeldkwaliteit kon dus niet worden beoordeeld. Levert de klant zelf 6 à 9 geslaagden-foto's aan, dan is er een logische plek voor op de reviewspagina.
- Geen foto's van Reza of de lesauto's aangeleverd; de site is bewust typografisch/grafisch opgezet en heeft ze niet nodig. Komen er ooit goede foto's, dan kunnen die in de duo-secties.
- Het proefles-formulier verstuurt via WhatsApp (geen backend). Wil de klant e-mail, dan is een formdienst (bijv. Formspree) zo toegevoegd.

## Assets

- `assets/reza-logo.png` — aangeleverd origineel (op zwart)
- `assets/logo-vrijstaand.png` — zwart weggehaald (black-unmatte), bruikbaar op elke donkere ondergrond
- `assets/favicon-*.png`, `apple-touch-icon.png` — monogram-uitsnede
- `assets/og-image.jpg` — 1200×630 voor social shares
- `assets/fonts/` — Fraunces en Schibsted Grotesk, variabel, latin-subset
