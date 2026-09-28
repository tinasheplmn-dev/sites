/**
 * Ontwerpmeting in de browser.
 *
 * Toetst de opgemaakte pagina tegen de getallen uit references/ontwerp.md.
 * Draai dit naast assets/contrast.js, op elke pagina, op 1440 en op 390 breed.
 *
 * Gebruik: voer de hele inhoud uit via javascript_tool op de geopende pagina.
 */
(function () {
  const uit = [];
  const px = (v) => parseFloat(v) || 0;

  function toets(naam, geslaagd, gemeten, verwacht) {
    uit.push({ regel: naam, oordeel: geslaagd ? 'ok' : 'ZAKT', gemeten, verwacht });
  }

  const breedte = window.innerWidth;
  const mobiel = breedte < 700;

  /* ---------- hoofdkop ---------- */
  const h1 = document.querySelector('h1');
  if (h1) {
    const s = getComputedStyle(h1);
    const grootte = px(s.fontSize);
    const lh = px(s.lineHeight) / grootte;
    const ls = px(s.letterSpacing) / grootte;

    toets('kopgrootte', mobiel ? grootte >= 30 : grootte >= 44,
      Math.round(grootte) + 'px', mobiel ? 'minimaal 30px' : '44 tot 110px, liefst 60+');
    toets('regelafstand kop', lh <= 1.15,
      lh.toFixed(2), 'hoogstens 1,15');

    /* spatiëring hangt af van het lettertype */
    const serif = /serif|playfair|cormorant|garamond|fraunces|erupha|seasons/i.test(s.fontFamily);
    const kapitaal = s.textTransform === 'uppercase' || /small-caps|SC\b/i.test(s.fontFamily + s.fontVariant);
    if (serif || kapitaal) {
      toets('letterspatiëring kop', ls >= -0.005 && ls <= 0.03,
        ls.toFixed(3) + 'em', 'serif of kapitaal: 0 tot +0,02em');
    } else {
      toets('letterspatiëring kop', ls <= -0.005,
        ls.toFixed(3) + 'em', 'sans: -0,01 tot -0,03em');
    }

    const woorden = h1.textContent.trim().split(/\s+/).length;
    toets('woorden in de kop', woorden <= 9, woorden, 'hoogstens 9');
  } else {
    toets('hoofdkop aanwezig', false, 'geen h1', 'precies één h1');
  }

  /* ---------- bodytekst ---------- */
  const alineas = [...document.querySelectorAll('p')]
    .filter((p) => p.textContent.trim().split(/\s+/).length > 12 && p.getBoundingClientRect().width);
  if (alineas.length) {
    const s = getComputedStyle(alineas[0]);
    const grootte = px(s.fontSize);
    const lh = px(s.lineHeight) / grootte;
    toets('bodygrootte', grootte >= 16, Math.round(grootte) + 'px', 'minimaal 16px, ook op mobiel');
    toets('regelafstand body', lh >= 1.5 && lh <= 1.9, lh.toFixed(2), '1,55 tot 1,85');

    /* leesbreedte in tekens, geschat via de breedte van een teken */
    const meet = document.createElement('span');
    meet.textContent = 'abcdefghijklmnopqrstuvwxyz';
    meet.style.cssText = `position:absolute;visibility:hidden;font:${s.font}`;
    document.body.appendChild(meet);
    const tekenbreedte = meet.getBoundingClientRect().width / 26;
    meet.remove();
    const tekens = Math.round(alineas[0].getBoundingClientRect().width / tekenbreedte);
    toets('leesbreedte', mobiel ? tekens >= 30 : tekens >= 45 && tekens <= 85,
      tekens + ' tekens', mobiel ? 'minimaal 30' : '65 tot 75');
  }

  /* ---------- ruimte ---------- */
  const secties = [...document.querySelectorAll('section, .sectie')].filter((s) => s.getBoundingClientRect().height > 200);
  if (secties.length) {
    const paddings = secties.map((s) => px(getComputedStyle(s).paddingTop)).filter((v) => v > 0);
    const gem = paddings.length ? paddings.reduce((a, b) => a + b, 0) / paddings.length : 0;
    toets('sectiepadding', mobiel ? gem >= 40 : gem >= 64,
      Math.round(gem) + 'px', mobiel ? '40 tot 80px' : 'ongeveer containerbreedte gedeeld door 14');
    toets('secties met eigen padding', paddings.length >= secties.length * 0.7,
      `${paddings.length} van ${secties.length}`, 'ruimte hoort op de sectie, niet op losse blokken');
  }

  const wrappers = [...document.querySelectorAll('.wrap, .container, main > *')]
    .map((e) => e.getBoundingClientRect().width)
    .filter((w) => w > 300);
  if (wrappers.length && !mobiel) {
    const uniek = [...new Set(wrappers.map((w) => Math.round(w / 10) * 10))];
    toets('één containerbreedte', uniek.length <= 2,
      uniek.join(', ') + 'px', 'één breedte, anders lijnen sectieranden niet uit');
  }

  /* ---------- navigatie ---------- */
  const nav = document.querySelector('nav, header nav, [data-menu]');
  if (nav) {
    const items = nav.querySelectorAll('a').length;
    toets('menu-items', items >= 2 && items <= 9, items, '2 tot 7 zichtbare items');
  }

  /* ---------- horizontale scroll ---------- */
  const scrollt = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  let boosdoener = null;
  if (scrollt) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 && r.width > 0) {
        boosdoener = (el.tagName + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '')).slice(0, 50);
        break;
      }
    }
  }
  toets('geen horizontale scroll', !scrollt,
    scrollt ? `${document.documentElement.scrollWidth}px breed, eerste boosdoener ${boosdoener}` : 'geen', 'nooit');

  /* ---------- tikdoelen ---------- */
  const klein = [...document.querySelectorAll('a, button, [role="button"], input, select')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const lat = mobiel ? 44 : 24;
      return r.width < lat || r.height < lat;
    });
  toets('tikdoelen groot genoeg', klein.length === 0,
    klein.length ? `${klein.length} te klein, bijvoorbeeld ${klein[0].tagName.toLowerCase()} "${(klein[0].textContent || '').trim().slice(0, 20)}"` : 'alle',
    mobiel ? '44 bij 44' : '24 bij 24');

  /* ---------- verborgen inhoud ---------- */
  const verborgen = [...document.querySelectorAll('body *')].filter((el) => {
    const s = getComputedStyle(el);
    return (s.visibility === 'hidden' || parseFloat(s.opacity) === 0) &&
      el.getBoundingClientRect().height > 20 &&
      el.textContent.trim().length > 20;
  });
  toets('geen onzichtbare inhoud', verborgen.length === 0,
    verborgen.length ? `${verborgen.length} blokken met tekst zijn onzichtbaar` : 'geen',
    'reveals moeten fail-open zijn');

  /* ---------- omvang ---------- */
  const knopen = document.querySelectorAll('*').length;
  toets('aantal DOM-elementen', knopen < 900, knopen, 'onder de 500 is snel, boven de 900 wordt het traag');

  const beelden = [...document.querySelectorAll('img')];
  const zonderMaat = beelden.filter((i) => !i.getAttribute('width') || !i.getAttribute('height'));
  toets('beelden met width en height', zonderMaat.length === 0,
    `${beelden.length - zonderMaat.length} van ${beelden.length}`, 'alle, anders verspringt de pagina');

  /* ---------- rapport ---------- */
  const gezakt = uit.filter((r) => r.oordeel === 'ZAKT');
  if (console.table) console.table(uit);
  return {
    pagina: location.pathname,
    breedte,
    geslaagd: uit.length - gezakt.length,
    gezakt: gezakt.length,
    problemen: gezakt,
  };
})();
