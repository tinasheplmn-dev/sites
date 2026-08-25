# UWillGO Autorijschool - website

Volledig statische website voor UWillGO Autorijschool in Tilburg (rijles in Tilburg, Goirle,
Hilvarenbeek en Udenhout). Geen build-stap, geen dependencies.

## Lokaal draaien

```bash
node server.js
```

De site staat dan op http://localhost:8103. Elke andere statische server werkt ook
(bijv. `npx serve .`).

## Deployen

De hele map is de site. Uploaden naar elke statische host (Vercel, Netlify, gewone
webhosting) is genoeg. `server.js` is alleen voor lokale preview en hoeft niet mee.

Nette URL's (zonder `.html`) werken op hosts die dat standaard afhandelen (Vercel/Netlify).
De canonical-URL's en de sitemap gaan uit van `https://www.uwillgo.nl/`.

## Opbouw

- `index.html` - home met hero (geanimeerde perspectiefweg), pakketten, reviews, geslaagden-strip
- `aanpak.html` - Ron, de coaching-aanpak, rij-angst, de Golf 8, theorie
- `tarieven.html` - pakketten Try/Start/Drive/Go, basic-varianten, losse tarieven, FAQ
- `stappenplan.html` - leeftijden en 10 stappen met scroll-tijdlijn
- `geslaagden.html` - beeldmuur (22 foto's) gekoppeld aan reviews + alle tekstreviews
- `proefles.html` - aanmeldformulier (opent WhatsApp met ingevuld bericht) + contact
- `css/style.css` - het volledige designsysteem (tokens bovenin)
- `js/main.js` - menu, reveals, routelijn, carrousel, formulier
- `assets/geslaagden/` - foto's van de oude site, lokaal gedownload (900px, met toestemming)
- `assets/img/` - logo (aangeleverd ontwerp, transparante PNG), OG-beeld
- `assets/favicon.svg` - het wiel uit de logo-O

## Ontwerp

- Palet (klant-eis): donkerroze `#E6007E`, donkerblauw `#2C2E87`, wit. Roze is de onderscheider,
  blauw is ondersteunend.
- Typografie: Bricolage Grotesque (koppen) + Schibsted Grotesk (tekst), via Google Fonts.
- Motion-concept: "de route tekent zich". Geanimeerde wegmarkering in de hero, gestreepte
  routelijn-segmenten tussen secties, tijdlijn die meetekent op scroll. Alles respecteert
  `prefers-reduced-motion`.

## Vóór livegang checken met de opdrachtgever

- Tarieven en de actie (€ 49,95 korting + € 50 aanbreng-premie) bevestigen.
- Google-reviewlink toevoegen als die er is (nu alleen score 5,0 / 27 reviews als tekst).
- Formulier verstuurt via WhatsApp; wil de klant e-mailafhandeling, dan een formdienst koppelen.
