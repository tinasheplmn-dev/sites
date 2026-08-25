# Smartersoft B.V. — website

Volledig statische site (7 pagina's) voor Smartersoft B.V., Eindhoven.
Artdirection: **"Het levende systeemdiagram"** — engineering-papier (warm wit)
met grafiet-inkt en signaalrood; canvas-diagrammen waarin datapakketjes live
over technisch correcte routes stromen (OAuth2-flow, API-flow, CI/CD-pipeline).

## Pagina's

| Bestand | Inhoud |
|---|---|
| `index.html` | Home: hero + levend systeemdiagram, diensten, spec-sheet, Stephan, code, blog, CTA |
| `api-ontwikkeling.html` | Dienst: API's — aanpak, deliverables, techniek, prijzen (€3.000 / €7.000 / custom) |
| `single-sign-on.html` | Dienst: SSO / identity management (projectbasis) |
| `devops.html` | Dienst: Azure DevOps / CI-CD (projectbasis) |
| `over-stephan.html` | Profiel, MVP-uitleg, tijdlijn, community |
| `blog.html` | Blogindex met de drie bestaande artikelen als voorbeelditems |
| `contact.html` | Formulier (mailto naar stephan@smartersoft.nl), tel, adres + gestileerde kaart Strijp-S |

## Lokaal draaien

```bash
node server.js        # → http://localhost:8069
```

Of elke andere statische server (`npx serve`, `python3 -m http.server`, …) vanuit deze map.

## Deployen

De site is 100% statisch: upload de hele map naar elke host (Netlify, Vercel,
Cloudflare Pages, klassieke webhosting). Geen build-stap, geen dependencies.
`server.js` is alleen voor lokale preview.

## Techniek & afspraken

- Vanilla HTML/CSS/JS, progressive enhancement: alles leesbaar zonder JS,
  motion uit bij `prefers-reduced-motion` en in capture-context (webdriver /
  verborgen tab) zodat SEO en screenshots de volledige inhoud zien.
- Fonts via Google Fonts: Archivo (display, expanded), Instrument Sans (tekst),
  JetBrains Mono (code/annotaties).
- Diagram-engine in `js/main.js` (`SPECS`): per pagina een spec met nodes en
  edges — nieuwe diagrammen toevoegen = spec toevoegen + `<canvas data-diagram="...">`.
- Contactformulier werkt via `mailto:` (geen backend). Wil je later een echte
  form-handler: vervang de submit-handler onderin `js/main.js`.
- Foto Stephan: `assets/stephan.webp` (400×400, aangeleverd). Vervangbaar door
  een grotere versie zonder verdere aanpassingen.
