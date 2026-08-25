# Verkeersschool DOEN · website

Volledig statische site (HTML/CSS/JS, geen build-stap) voor Verkeersschool DOEN in Tilburg (prompt 47).

## Concept

De naam is het merk en de leerlingen leverden de slogan: drie reviews eindigen letterlijk met "Ik zeg: DOEN". De hele site is daarom gebouwd als aansporing: poster-typografie in gebiedende wijs, elke CTA is het woord DOEN zelf, en de O van DOEN is een stuur dat meedraait met je scroll (het merkteken, ook de favicon). Omdat de school lesgeeft volgens RIS (Rijopleiding in Stappen) is het hele ontwerpsysteem opgezet in genummerde stappen: methode en vormgeving vallen samen.

- Kleuren: ultramarijn (#1226e0, bewust anders dan alle andere blauwe scholen in de reeks), warm papierwit (#f4f1e9), inktzwart (#10131a), nachtblauw (#05093f) voor de footer
- Typografie: Anton (display, posterletters) + Archivo (body), via Google Fonts
- Motion-concept: "de aansporing": woorden stempelen binnen (stamp-reveal met overshoot), het stuur draait mee met de scroll, werkwoord-marquees tussen secties; prefers-reduced-motion wordt gerespecteerd
- Logo: eigen wordmark als component (`.logo` in elke pagina + `assets/favicon.svg`); een later aangeleverd logo kan het wordmark 1-op-1 vervangen

## Pagina's

index · rijlessen · spoedcursus · theorie-tarieven · reviews (21 Google-reviews verbatim, de drie "Ik zeg: DOEN"-quotes prominent) · proefles (formulier opent WhatsApp met vooringevuld bericht; geen backend)

## Lokaal draaien

```bash
node websites/doen-website/server.js
```

Draait op http://localhost:8081 (launch-config `doen-website`).

## Deployen

Statisch, dus elke host werkt (Vercel: map als project koppelen, geen build command, output = deze map).

## Vóór livegang bevestigen door de opdrachtgever

- Tarieven (overgenomen van de huidige site, augustus 2026), inclusief spoedcursus vanaf €1.289 (15 lessen 60 min + praktijkexamen, van de huidige spoedcursus-pagina)
- WhatsApp-nummer: de site gebruikt nu wa.me/31132032456 (het vaste nummer); klopt dat, of is er een apart 06-nummer met WhatsApp?
- Openingstijden zijn onbekend en staan bewust niet op de site (ook niet in de JSON-LD); aanvullen zodra bekend
- Achternaam van instructeur Kamresh (site gebruikt alleen de voornaam, zoals in de reviews)
- Echte foto's aanleveren (instructeur, lesauto, geslaagden): de instructeur-visual op de homepage is nu een stuur-illustratie met een duidelijk plek-label en kan dan vervangen worden

Al bevestigd door de opdrachtgever: 4,8/5 uit 24 Google-reviews (bron clickdrive.nl) en de claim 350+ geslaagden.

## SEO

- Unieke title/meta description per pagina, plaatsnamen (Tilburg, Reeshof, Goirle, Waalwijk enz.) natuurlijk verwerkt
- JSON-LD `DrivingSchool` met adres, geo, areaServed en aggregateRating (4,8 uit 24) op de homepage
- sitemap.xml + robots.txt, OG-tags, semantische HTML met één h1 per pagina, skip-link
