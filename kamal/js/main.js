/* Autorijschool Kamal · main.js
   Eén motion-concept: de schakelbak. Verder: reveals, header, menu,
   reviewband, tellers en het proefles-formulier via WhatsApp. */

(function () {
  'use strict';

  const doc = document;
  if (location.search.indexOf('qa') !== -1) doc.documentElement.classList.add('qa');
  const qaScroll = location.search.match(/scroll=(\d+)/);
  if (qaScroll) {
    const puls = doc.createElement('div');
    puls.style.cssText = 'position:fixed;bottom:2px;left:2px;width:3px;height:3px;opacity:0.01;z-index:9999;background:#000;animation:qapuls 0.4s linear infinite';
    const st = doc.createElement('style');
    st.textContent = '@keyframes qapuls { to { transform: rotate(360deg) } }';
    window.addEventListener('load', () => setTimeout(() => {
      doc.head.appendChild(st); doc.body.appendChild(puls);
      window.scrollTo({ top: +qaScroll[1], behavior: 'instant' });
    }, 250));
  }
  const beweegOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: vast + verstoppen bij omlaag scrollen ---------- */
  const kop = doc.querySelector('.site-kop');
  let vorigeY = 0;
  function bijScroll() {
    const y = window.scrollY;
    kop.classList.toggle('vast', y > 24);
    if (y > 420 && y > vorigeY + 6 && !doc.body.classList.contains('menu-open')) {
      kop.classList.add('verstopt');
    } else if (y < vorigeY - 6 || y < 120) {
      kop.classList.remove('verstopt');
    }
    vorigeY = y;
  }
  window.addEventListener('scroll', bijScroll, { passive: true });
  bijScroll();

  /* ---------- mobiel menu ---------- */
  const menuKnop = doc.querySelector('.menu-knop');
  if (menuKnop) {
    menuKnop.addEventListener('click', () => {
      const open = doc.body.classList.toggle('menu-open');
      menuKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    doc.querySelectorAll('.menu-vlak a').forEach((a) =>
      a.addEventListener('click', () => doc.body.classList.remove('menu-open'))
    );
  }

  /* ---------- reveals ---------- */
  const revealWaarnemer = new IntersectionObserver(
    (items) => {
      items.forEach((item) => {
        if (item.isIntersecting) {
          item.target.classList.add('zichtbaar');
          revealWaarnemer.unobserve(item.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
  );
  doc.querySelectorAll('.reveal').forEach((el) => revealWaarnemer.observe(el));

  /* ---------- held: intro + parallax ---------- */
  const held = doc.querySelector('.held');
  if (held) {
    requestAnimationFrame(() => requestAnimationFrame(() => held.classList.add('klaar')));
    const bak = held.querySelector('.schakelbak');
    if (bak && beweegOk && window.matchMedia('(hover: hover)').matches) {
      held.addEventListener('pointermove', (e) => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 18;
        const dy = (e.clientY / window.innerHeight - 0.5) * 14;
        bak.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    } else if (bak && beweegOk) {
      window.addEventListener(
        'scroll',
        () => { bak.style.transform = `translateY(${window.scrollY * 0.12}px)`; },
        { passive: true }
      );
    }
  }

  /* ---------- schakelsectie: sticky choreografie ---------- */
  const track = doc.querySelector('.schakels-track');
  if (track) {
    const stappen = [...track.querySelectorAll('.schakel-stap')];
    const cijfers = [...track.querySelectorAll('.schakels-diagram .cijfer')];
    const balkjes = [...track.querySelectorAll('.schakel-voortgang i')];
    const knop = track.querySelector('.schakels-diagram .schakelknop');
    /* slotposities in viewBox-coördinaten: 1 t/m 5 */
    const slots = [
      { x: 60, y: 34 },
      { x: 60, y: 166 },
      { x: 150, y: 34 },
      { x: 150, y: 166 },
      { x: 240, y: 34 },
    ];
    let actief = -1;
    function zetStap(i) {
      if (i === actief) return;
      actief = i;
      stappen.forEach((s, n) => s.classList.toggle('actief', n === i));
      cijfers.forEach((c, n) => c.classList.toggle('actief', n <= i));
      balkjes.forEach((b, n) => b.classList.toggle('actief', n <= i));
      if (knop) knop.setAttribute('transform', `translate(${slots[i].x}, ${slots[i].y})`);
    }
    function bijSchakelScroll() {
      const r = track.getBoundingClientRect();
      const bereik = r.height - window.innerHeight;
      const voortgang = Math.min(1, Math.max(0, -r.top / bereik));
      zetStap(Math.min(stappen.length - 1, Math.floor(voortgang * stappen.length)));
    }
    window.addEventListener('scroll', bijSchakelScroll, { passive: true });
    bijSchakelScroll();
  }

  /* ---------- tellers ---------- */
  const telWaarnemer = new IntersectionObserver(
    (items) => {
      items.forEach((item) => {
        if (!item.isIntersecting) return;
        const el = item.target;
        telWaarnemer.unobserve(el);
        const doel = parseFloat(el.dataset.tel.replace(',', '.'));
        const decimalen = el.dataset.tel.includes(',') ? 1 : 0;
        const duur = 1400;
        const start = performance.now();
        function stap(nu) {
          const t = Math.min(1, (nu - start) / duur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (doel * eased).toFixed(decimalen).replace('.', ',');
          if (t < 1) requestAnimationFrame(stap);
        }
        if (beweegOk) requestAnimationFrame(stap);
        else el.textContent = el.dataset.tel;
      });
    },
    { threshold: 0.6 }
  );
  doc.querySelectorAll('[data-tel]').forEach((el) => telWaarnemer.observe(el));

  /* ---------- reviewband: pijlen ---------- */
  doc.querySelectorAll('.review-schuif').forEach((schuif) => {
    const band = schuif.querySelector('.review-band');
    const kaart = () => band.querySelector('.review-kaart').getBoundingClientRect().width + 16;
    schuif.querySelector('[data-vorige]')?.addEventListener('click', () =>
      band.scrollBy({ left: -kaart(), behavior: 'smooth' })
    );
    schuif.querySelector('[data-volgende]')?.addEventListener('click', () =>
      band.scrollBy({ left: kaart(), behavior: 'smooth' })
    );
  });

  /* ---------- proefles-formulier: opent WhatsApp met ingevuld bericht ---------- */
  const form = doc.querySelector('#proefles-formulier');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const naam = (d.get('naam') || '').toString().trim();
      const tel = (d.get('telefoon') || '').toString().trim();
      const type = d.get('lestype');
      const taal = d.get('taal');
      const bericht = (d.get('bericht') || '').toString().trim();
      let tekst = `Hoi Kamal! Ik wil graag een proefles aanvragen.\n\nNaam: ${naam}\nTelefoon: ${tel}\nType les: ${type}\nTaal: ${taal}`;
      if (bericht) tekst += `\n\n${bericht}`;
      window.open('https://wa.me/31641999646?text=' + encodeURIComponent(tekst), '_blank', 'noopener');
    });
  }

  /* ---------- geslaagdenmuur: lichte 3D-tilt op aanwijzer ---------- */
  if (window.matchMedia('(hover: hover)').matches && beweegOk) {
    doc.querySelectorAll('.muur-foto').forEach((foto) => {
      foto.addEventListener('pointermove', (e) => {
        const r = foto.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        foto.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
      });
      foto.addEventListener('pointerleave', () => { foto.style.transform = ''; });
    });
  }
})();
