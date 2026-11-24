'use strict';
/* The Weigh-In: de scan-API van TitleShot. Eén serverless functie (Vercel) of
   lokaal via server.js. Haalt echte gegevens op bij Google; de sleutel blijft
   op de server (GOOGLE_PLACES_KEY, dezelfde als de Mettafel-scan).

   GET /api/scan?actie=suggest&q=...        suggesties terwijl je typt
   GET /api/scan?actie=profiel&id=PLACE_ID  profiel, reviews, foto's, concurrenten, kaartpositie
   GET /api/scan?actie=site&id=PLACE_ID     kwaliteitsmeting van de eigen website (PageSpeed) en socials
   GET /api/scan?actie=kaart&lat=&lng=      kaartbeeld (proxy, zonder sleutel in de browser)

   Veiligheid: de browser stuurt nooit een url mee. De server zoekt de website
   zelf op bij Google aan de hand van de place_id. Per bezoeker geldt een limiet. */

const BASIS = 'https://places.googleapis.com/v1';
const KEY = () => process.env.GOOGLE_PLACES_KEY || '';
const ZOOM = 13, KAART_B = 640, KAART_H = 400;
const STRAAL_M = 8000;

const koppen = (mask) => ({ 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY(), 'X-Goog-FieldMask': mask });

async function json(url, opties = {}, ms = 8000) {
  const stop = new AbortController();
  const t = setTimeout(() => stop.abort(), ms);
  try {
    const r = await fetch(url, Object.assign({}, opties, { signal: stop.signal }));
    const data = await r.json().catch(() => null);
    return { ok: r.ok, data };
  } catch (e) { return { ok: false, data: null }; } finally { clearTimeout(t); }
}

/* ---------- limiet per bezoeker (in het geheugen van de functie) ---------- */
const bezoek = new Map();
function teVaak(req, max, groep) {
  const ip = (groep || 'a') + ':' + String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'x').split(',')[0].trim();
  const nu = Date.now();
  const lijst = (bezoek.get(ip) || []).filter((t) => nu - t < 10 * 60 * 1000);
  lijst.push(nu); bezoek.set(ip, lijst);
  if (bezoek.size > 5000) bezoek.clear();
  return lijst.length > max;
}

const geldigeId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{10,200}$/.test(id);

function afstandM(a, b) {
  if (!a || !b) return null;
  const R = 6371000, rad = (x) => x * Math.PI / 180;
  const dLat = rad(b.latitude - a.latitude), dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function plaatsUit(comp) {
  const vind = (t) => (comp || []).find((c) => (c.types || []).includes(t));
  const c = vind('locality') || vind('postal_town') || vind('administrative_area_level_2');
  return c ? c.longText : '';
}

/* ---------- suggesties ---------- */
async function suggest(q, taal) {
  const r = await json(`${BASIS}/places:autocomplete`, {
    method: 'POST', headers: koppen('suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat'),
    body: JSON.stringify({ input: q, languageCode: taal, includedRegionCodes: ['nl', 'be'] }),
  }, 6000);
  if (!r.ok || !r.data || !r.data.suggestions) return [];
  return r.data.suggestions.filter((s) => s.placePrediction).slice(0, 5).map((s) => ({
    id: s.placePrediction.placeId,
    naam: s.placePrediction.structuredFormat.mainText.text,
    adres: (s.placePrediction.structuredFormat.secondaryText || {}).text || '',
  }));
}

/* ---------- profiel ---------- */
const DETAIL = 'id,displayName,formattedAddress,addressComponents,location,rating,userRatingCount,websiteUri,googleMapsUri,photos,reviews,primaryTypeDisplayName,businessStatus';

async function detail(id, taal) {
  const r = await json(`${BASIS}/places/${encodeURIComponent(id)}?languageCode=${taal}`, { headers: koppen(DETAIL) }, 8000);
  return r.ok && r.data && r.data.id ? r.data : null;
}

async function fotoUrl(naam) {
  const r = await json(`${BASIS}/${naam}/media?maxWidthPx=700&skipHttpRedirect=true&key=${KEY()}`, {}, 6000);
  return r.ok && r.data && r.data.photoUri ? r.data.photoUri : null;
}

/* De volgorde van Text Search is de volgorde op de kaart: zo weten we de plek
   van de gym voor "vechtsportschool [plaats]" en wie de buren zijn. */
async function kaartlijst(d, plaats, taal) {
  const term = (taal === 'en' ? 'martial arts gym ' : 'vechtsportschool ') + plaats;
  const r = await json(`${BASIS}/places:searchText`, {
    method: 'POST', headers: koppen('places.id,places.displayName,places.rating,places.userRatingCount,places.location'),
    body: JSON.stringify({ textQuery: term, languageCode: taal, maxResultCount: 20, locationBias: { circle: { center: d.location, radius: 5000 } } }),
  }, 8000);
  const lijst = (r.ok && r.data && r.data.places ? r.data.places : []).map((p, i) => ({
    id: p.id, plek: i + 1, naam: p.displayName ? p.displayName.text : '', score: p.rating || null, aantal: p.userRatingCount || 0, loc: p.location || null,
  }));
  return { term, lijst };
}

async function profiel(id, taal) {
  const d = await detail(id, taal);
  if (!d) return null;
  const plaats = plaatsUit(d.addressComponents);
  const [fotos, kaart] = await Promise.all([
    Promise.all((d.photos || []).slice(0, 4).map((f) => fotoUrl(f.name).catch(() => null))),
    d.location && plaats ? kaartlijst(d, plaats, taal).catch(() => ({ term: null, lijst: [] })) : { term: null, lijst: [] },
  ]);
  const eigen = kaart.lijst.find((p) => p.id === d.id);
  const buren = kaart.lijst.filter((p) => p.id !== d.id && p.loc)
    .map((p) => Object.assign(p, { afstand: afstandM(d.location, p.loc) }))
    .filter((p) => p.afstand != null && p.afstand <= STRAAL_M)
    .slice(0, 8)
    .map((p) => ({ naam: p.naam, score: p.score, aantal: p.aantal, afstand: p.afstand, plek: p.plek, lat: p.loc.latitude, lng: p.loc.longitude }));
  return {
    id: d.id,
    naam: d.displayName ? d.displayName.text : '',
    soort: d.primaryTypeDisplayName ? d.primaryTypeDisplayName.text : '',
    adres: d.formattedAddress || '',
    plaats,
    score: d.rating || null,
    aantal: d.userRatingCount || 0,
    heeftSite: !!d.websiteUri,
    siteHost: d.websiteUri ? hostVan(d.websiteUri) : null,
    maps: d.googleMapsUri || null,
    lat: d.location ? d.location.latitude : null,
    lng: d.location ? d.location.longitude : null,
    reviews: (d.reviews || []).filter((r) => r.text && r.text.text && r.rating >= 4).slice(0, 3).map((r) => ({
      auteur: r.authorAttribution ? r.authorAttribution.displayName : '', score: r.rating, wanneer: r.relativePublishTimeDescription || '',
      tekst: r.text.text.length > 240 ? r.text.text.slice(0, 237).replace(/\s+\S*$/, '') + '...' : r.text.text,
    })),
    fotos: fotos.filter(Boolean),
    zoekterm: kaart.term,
    plek: eigen ? eigen.plek : null,
    totaal: kaart.lijst.length,
    concurrenten: buren,
    kaart: d.location ? { zoom: ZOOM, b: KAART_B, h: KAART_H } : null,
  };
}

/* ---------- kwaliteitsmeting van de website ---------- */
function hostVan(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return null; } }

function veiligeUrl(url) {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return null;
    const h = u.hostname;
    if (h === 'localhost' || /^[\d.]+$/.test(h) || h.includes(':') || !h.includes('.') || /\.(local|internal|lan)$/.test(h)) return null;
    return u.toString();
  } catch (e) { return null; }
}

async function leesPagina(url) {
  const stop = new AbortController();
  const t = setTimeout(() => stop.abort(), 9000);
  try {
    const r = await fetch(url, { signal: stop.signal, redirect: 'follow', headers: { 'User-Agent': 'TitleShot-WeighIn/1.0', Accept: 'text/html' } });
    if (!r.ok || !/text\/html/.test(r.headers.get('content-type') || '')) return '';
    return (await r.text()).slice(0, 600000);
  } catch (e) { return ''; } finally { clearTimeout(t); }
}

function leesKenmerken(html) {
  const laag = html.toLowerCase();
  const social = [];
  const kanaal = (naam, re) => { const m = html.match(re); if (m) social.push({ naam, handle: m[1].replace(/\/$/, '') }); };
  kanaal('Instagram', /instagram\.com\/([A-Za-z0-9_.]{2,40})\/?["'?]/);
  kanaal('Facebook', /facebook\.com\/([A-Za-z0-9_.-]{2,60})\/?["'?]/);
  kanaal('TikTok', /tiktok\.com\/@([A-Za-z0-9_.]{2,40})/);
  kanaal('YouTube', /youtube\.com\/(@[A-Za-z0-9_.-]{2,60}|channel\/[A-Za-z0-9_-]{5,40})/);
  return {
    social: social.filter((s) => !/^(sharer|share|tr|plugins|p|reel|explore)$/i.test(s.handle)),
    proefles: /proefles|proeftraining|gratis les|trial class|free trial|free class|probetraining/.test(laag),
    boeken: /boek|inschrijven|aanmelden|book now|sign up|rooster|schedule/.test(laag),
    whatsapp: /wa\.me\/|api\.whatsapp\.com/.test(laag),
  };
}

async function site(id, taal) {
  const r = await json(`${BASIS}/places/${encodeURIComponent(id)}`, { headers: koppen('id,websiteUri') }, 8000);
  const url = r.ok && r.data && r.data.websiteUri ? veiligeUrl(r.data.websiteUri) : null;
  if (!url) return { heeftSite: false };
  const uit = { heeftSite: true, host: hostVan(url), https: url.startsWith('https:'), scores: null, lcp: null, screenshot: null, social: [], proefles: null, boeken: null, whatsapp: null };
  const meting = json(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&locale=${taal}&key=${KEY()}`, {}, 50000);
  const pagina = leesPagina(url);
  const [m, html] = await Promise.all([meting, pagina]);
  const lr = m.ok && m.data ? m.data.lighthouseResult : null;
  if (lr) {
    const c = lr.categories || {}, a = lr.audits || {};
    const pct = (x) => (x && typeof x.score === 'number' ? Math.round(x.score * 100) : null);
    uit.scores = { snelheid: pct(c.performance), gebruik: pct(c.accessibility), techniek: pct(c['best-practices']), vindbaar: pct(c.seo) };
    uit.lcp = (a['largest-contentful-paint'] || {}).displayValue || null;
    const shot = ((a['final-screenshot'] || {}).details || {}).data || null;
    uit.screenshot = shot && /^data:image\/(jpeg|png|webp);base64,/.test(shot) && shot.length <= 260000 ? shot : null;
  }
  if (html) Object.assign(uit, leesKenmerken(html));
  return uit;
}

/* ---------- kaart ---------- */
const KAART_STIJL = [
  'feature:all|element:geometry|color:0x1f1b18', 'feature:all|element:labels.text.fill|color:0x8f8780', 'feature:all|element:labels.text.stroke|color:0x0d0b0a',
  'feature:all|element:labels.icon|visibility:off', 'feature:poi|visibility:off', 'feature:transit|visibility:off',
  'feature:road|element:geometry|color:0x3a322c', 'feature:road.highway|element:geometry|color:0x8a5a00', 'feature:road|element:labels|visibility:off',
  'feature:water|element:geometry|color:0x0d0b0a', 'feature:landscape.natural|element:geometry|color:0x1c1916', 'feature:administrative|element:geometry.stroke|color:0x2c2622',
];
function kaartGoogleUrl(lat, lng) {
  const delen = [`center=${lat},${lng}`, `zoom=${ZOOM}`, `size=${KAART_B}x${KAART_H}`, 'scale=2', 'maptype=roadmap', ...KAART_STIJL.map((x) => 'style=' + x.replace(/\|/g, '%7C')), `key=${KEY()}`];
  return 'https://maps.googleapis.com/maps/api/staticmap?' + delen.join('&');
}

/* ---------- de functie ---------- */
function stuur(res, status, data, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.end(JSON.stringify(data));
}

module.exports = async function scan(req, res) {
  try {
    if (req.method !== 'GET') return stuur(res, 405, { fout: 'alleen GET' });
    const u = new URL(req.url, 'http://x');
    const actie = u.searchParams.get('actie');
    const taal = u.searchParams.get('taal') === 'en' ? 'en' : 'nl';
    if (!KEY()) return stuur(res, 503, { fout: 'geen koppeling' });

    if (actie === 'suggest') {
      const q = String(u.searchParams.get('q') || '').trim().slice(0, 80);
      if (q.length < 3) return stuur(res, 200, { suggesties: [] });
      if (teVaak(req, 200)) return stuur(res, 429, { fout: 'te vaak' });
      return stuur(res, 200, { suggesties: await suggest(q, taal) });
    }

    if (actie === 'kaart') {
      const lat = parseFloat(u.searchParams.get('lat')), lng = parseFloat(u.searchParams.get('lng'));
      if (!(lat > 49 && lat < 54.5 && lng > 2 && lng < 8)) return stuur(res, 400, { fout: 'buiten bereik' });
      if (teVaak(req, 200)) return stuur(res, 429, { fout: 'te vaak' });
      const r = await fetch(kaartGoogleUrl(lat.toFixed(5), lng.toFixed(5)));
      if (!r.ok) return stuur(res, 502, { fout: 'geen kaart' });
      res.statusCode = 200;
      res.setHeader('Content-Type', r.headers.get('content-type') || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.end(Buffer.from(await r.arrayBuffer()));
    }

    const id = u.searchParams.get('id');
    if (!geldigeId(id)) return stuur(res, 400, { fout: 'ongeldige id' });
    if (teVaak(req, 16, 'zwaar')) return stuur(res, 429, { fout: 'te vaak' });
    if (actie === 'profiel') {
      const p = await profiel(id, taal);
      return p ? stuur(res, 200, p, 'private, max-age=600') : stuur(res, 404, { fout: 'niet gevonden' });
    }
    if (actie === 'site') return stuur(res, 200, await site(id, taal), 'private, max-age=600');
    return stuur(res, 400, { fout: 'onbekende actie' });
  } catch (e) {
    return stuur(res, 500, { fout: 'er ging iets mis' });
  }
};
