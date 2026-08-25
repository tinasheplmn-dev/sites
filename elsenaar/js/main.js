/* Rijschool Elsenaar — interactie & motion
   Eén concept: de doorgetekende route. Alle andere beweging is ondersteunend. */
(function () {
  'use strict';

  const beweegt = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobiel menu ---------- */
  const navKnop = document.querySelector('.nav-knop');
  if (navKnop) {
    navKnop.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      navKnop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobiel-nav a').forEach((a) =>
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        navKnop.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- header-schaduw bij scroll ---------- */
  const kop = document.querySelector('.site-kop');
  const zetSchaduw = () => kop && kop.classList.toggle('zweeft', window.scrollY > 8);
  zetSchaduw();
  window.addEventListener('scroll', zetSchaduw, { passive: true });

  /* ---------- onthullingen ---------- */
  const rvObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('zichtbaar');
          rvObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.rv').forEach((el) => rvObserver.observe(el));

  /* vangnet: alles wat boven de onderrand van het scherm staat (of al gepasseerd is)
     wordt getoond, ook als de observer een sprong miste */
  function toonGepasseerde() {
    const vh = window.innerHeight;
    document.querySelectorAll('.rv:not(.zichtbaar)').forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add('zichtbaar');
    });
  }
  window.addEventListener('scroll', toonGepasseerde, { passive: true });
  window.addEventListener('load', toonGepasseerde);

  /* ---------- hero-kop: woord voor woord ---------- */
  document.querySelectorAll('[data-woorden]').forEach((el) => {
    const delen = el.innerHTML.trim().split(/\s+(?![^<]*>)/);
    let i = 0;
    el.innerHTML = delen
      .map((w) => {
        const vertraging = 0.15 + i++ * 0.06;
        return `<span class="w"><span style="animation-delay:${vertraging}s">${w}</span></span>`;
      })
      .join(' ');
  });

  /* ---------- de doorgetekende route ----------
     Elke svg[data-route] tekent zijn paden op scroll-voortgang van zijn sectie.
     Optioneel reist een stip (de lesauto) mee over het hoofdpad. */
  const routes = [];
  document.querySelectorAll('svg[data-route]').forEach((svg) => {
    const paden = Array.from(svg.querySelectorAll('path')).map((p) => {
      const lengte = p.getTotalLength();
      p.style.strokeDasharray =
        p.classList.contains('streep') ? `14 18` : `${lengte}`;
      if (!p.classList.contains('streep')) p.style.strokeDashoffset = `${lengte}`;
      return { p, lengte };
    });
    const stip = svg.parentElement.querySelector('[data-stip]') || svg.querySelector('[data-stip]');
    const hoofdpad = svg.querySelector('path.weg') || paden[0]?.p;
    routes.push({ svg, paden, stip, hoofdpad });
  });

  function tekenRoutes() {
    const vh = window.innerHeight;
    routes.forEach(({ svg, paden, stip, hoofdpad }) => {
      const doos = (svg.closest('[data-route-scope]') || svg).getBoundingClientRect();
      /* voortgang: 0 als de sectie onderin beeld komt, 1 als hij boven verdwenen is */
      let t = (vh * 0.85 - doos.top) / (doos.height + vh * 0.55);
      t = Math.max(0, Math.min(1, t));
      paden.forEach(({ p, lengte }) => {
        if (p.classList.contains('streep')) {
          /* middenstreep: rijdt mee door zijn dashoffset te verschuiven */
          p.style.strokeDashoffset = `${-t * 260}`;
          p.style.opacity = t > 0.02 ? 1 : 0;
        } else {
          p.style.strokeDashoffset = `${lengte * (1 - t)}`;
        }
      });
      if (stip && hoofdpad) {
        const l = hoofdpad.getTotalLength() * t;
        const punt = hoofdpad.getPointAtLength(l);
        stip.setAttribute('transform', `translate(${punt.x} ${punt.y})`);
        stip.style.opacity = t > 0.01 ? 1 : 0;
      }
    });
  }

  if (beweegt && routes.length) {
    let bezig = false;
    const plan = () => {
      if (bezig) return;
      bezig = true;
      requestAnimationFrame(() => {
        tekenRoutes();
        bezig = false;
      });
    };
    window.addEventListener('scroll', plan, { passive: true });
    window.addEventListener('resize', plan);
    plan();
  } else {
    /* zonder motion: alles gewoon getekend laten staan */
    routes.forEach(({ paden }) =>
      paden.forEach(({ p }) => {
        p.style.strokeDashoffset = '0';
        p.style.opacity = 1;
      })
    );
  }

  /* ---------- tellers ---------- */
  const telObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        telObserver.unobserve(el);
        const eind = parseFloat(el.dataset.tel.replace(',', '.'));
        const decimalen = (el.dataset.tel.split(',')[1] || '').length;
        const duur = 1400;
        const start = performance.now();
        const tik = (nu) => {
          const t = Math.min(1, (nu - start) / duur);
          const zacht = 1 - Math.pow(1 - t, 3);
          el.textContent = (eind * zacht)
            .toFixed(decimalen)
            .replace('.', ',');
          if (t < 1) requestAnimationFrame(tik);
        };
        if (beweegt) requestAnimationFrame(tik);
        else el.textContent = el.dataset.tel;
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-tel]').forEach((el) => telObserver.observe(el));

  /* ---------- review-strip: baan verdubbelen voor naadloze loop ---------- */
  document.querySelectorAll('.review-baan').forEach((baan) => {
    if (!beweegt) return;
    baan.innerHTML += baan.innerHTML;
  });

  /* ---------- aanmeldformulier: opent een kant-en-klare mail ---------- */
  const formulier = document.querySelector('#aanmeldformulier');
  if (formulier) {
    formulier.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(formulier);
      const regels = [
        `Naam: ${d.get('naam') || ''}`,
        `Telefoon: ${d.get('telefoon') || ''}`,
        `E-mail: ${d.get('email') || ''}`,
        `Waarvoor: ${d.get('onderwerp') || ''}`,
        '',
        `${d.get('bericht') || ''}`,
      ];
      const onderwerp = encodeURIComponent(`Aanmelding via de website: ${d.get('naam') || ''}`);
      const inhoud = encodeURIComponent(regels.join('\n'));
      window.location.href = `mailto:info@rijschoolelsenaar.nl?subject=${onderwerp}&body=${inhoud}`;
      const status = document.querySelector('.form-status');
      if (status) {
        status.classList.add('zichtbaar');
        status.focus?.();
      }
    });
  }

  /* ---------- jaartal in de footer ---------- */
  document.querySelectorAll('[data-jaar]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
