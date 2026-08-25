/* Motorrijschool Henk van der Eerden — interactie & choreografie */
(function () {
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header ---------- */
  const header = document.querySelector('.site-header');
  const zetHeader = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  zetHeader();
  window.addEventListener('scroll', zetHeader, { passive: true });

  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobiel-menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      // gestaffelde items
      menu.querySelectorAll('a').forEach((a, i) => {
        a.style.transitionDelay = open ? (0.06 + i * 0.05) + 's' : '0s';
      });
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('open');
      document.body.classList.remove('menu-open');
    }));
  }

  /* ---------- scroll-reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .accel').forEach((el) => io.observe(el));

  // vangnet: alles zichtbaar maken als de observer niets doet (0x0 viewport e.d.)
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-in), .accel:not(.is-in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  }, 1600);

  /* ---------- accelererende koppen: wrap woorden ---------- */
  document.querySelectorAll('.accel').forEach((kop) => {
    if (kop.dataset.gewrapt) return;
    kop.dataset.gewrapt = '1';
    const loop = (node) => {
      [...node.childNodes].forEach((kind) => {
        if (kind.nodeType === 3 && kind.textContent.trim()) {
          const frag = document.createDocumentFragment();
          kind.textContent.split(/(\s+)/).forEach((deel) => {
            if (/^\s+$/.test(deel) || deel === '') {
              frag.appendChild(document.createTextNode(deel));
            } else {
              const s = document.createElement('span');
              s.className = 'accel-w';
              s.textContent = deel;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, kind);
        } else if (kind.nodeType === 1) loop(kind);
      });
    };
    loop(kop);
    kop.querySelectorAll('.accel-w').forEach((w, i) => {
      w.style.transitionDelay = (i * 0.07) + 's';
    });
  });

  /* ---------- hero type-slam: DIRECT. EERLIJK. EN DAAROM HAAL JIJ HET. ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    const slams = [...hero.querySelectorAll('.slam')];
    const klaar = () => hero.classList.add('klaar');
    if (reduceMotion || !slams.length) {
      slams.forEach((s) => s.classList.add('geland'));
      klaar();
    } else {
      const alGezien = sessionStorage.getItem('hvde-intro');
      const tempo = alGezien ? 0.45 : 1; // herhaalbezoek: vlotter
      const tijden = [520, 1030, 1650].map((ms) => ms * tempo + 260);
      slams.forEach((s, i) => {
        setTimeout(() => {
          s.classList.add('geland');
          hero.classList.remove('schok');
          void hero.offsetWidth; // herstart de shake-animatie
          hero.classList.add('schok');
          if (window.WEG) window.WEG.schakel(i === slams.length - 1 ? 0.9 : 0.6);
        }, tijden[i] || (tijden[tijden.length - 1] + 400 * i));
      });
      setTimeout(() => {
        klaar();
        if (window.WEG) window.WEG.kruissnelheid();
        sessionStorage.setItem('hvde-intro', '1');
      }, (tijden[tijden.length - 1] || 1600) + 450);
    }
  }

  /* ---------- odometer-tellers ---------- */
  const telIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      telIo.unobserve(e.target);
      const el = e.target;
      const doel = parseFloat(el.dataset.tel);
      const decimalen = (el.dataset.tel.split('.')[1] || '').length;
      const duur = 1400;
      const start = performance.now();
      const stap = (nu) => {
        const p = Math.min(1, (nu - start) / duur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (doel * eased).toFixed(decimalen);
        if (p < 1) requestAnimationFrame(stap);
      };
      if (reduceMotion) { el.textContent = el.dataset.tel; return; }
      requestAnimationFrame(stap);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-tel]').forEach((el) => telIo.observe(el));

  /* ---------- blok-visual: 5 losse lessen → 1 blok ---------- */
  document.querySelectorAll('.blok-visual').forEach((v) => {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => v.classList.add('samen'), 650);
        obs.disconnect();
      }
    }, { threshold: 0.6 }).observe(v);
  });

  /* ---------- marquees dupliceren voor naadloze loop ---------- */
  document.querySelectorAll('[data-marquee]').forEach((baan) => {
    baan.innerHTML += baan.innerHTML;
  });

  /* ---------- achtje-pad tekent zichzelf ---------- */
  document.querySelectorAll('.achtje-pad[data-teken]').forEach((pad) => {
    const lengte = pad.getTotalLength();
    pad.style.strokeDasharray = lengte;
    pad.style.strokeDashoffset = lengte;
    pad.style.transition = 'stroke-dashoffset 2.6s cubic-bezier(0.4, 0, 0.2, 1)';
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        pad.style.strokeDashoffset = '0';
        obs.disconnect();
      }
    }, { threshold: 0.4 }).observe(pad);
  });

  /* ---------- mailto-formulier ---------- */
  document.querySelectorAll('form[data-mailto]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const regels = [];
      for (const [k, v] of d.entries()) {
        if (String(v).trim()) regels.push(k + ': ' + v);
      }
      const onderwerp = form.dataset.onderwerp || 'Aanvraag via de website';
      const body = regels.join('\n') + '\n\n(Verzonden via henkvandereerden.nl)';
      window.location.href = 'mailto:' + form.dataset.mailto +
        '?subject=' + encodeURIComponent(onderwerp) +
        '&body=' + encodeURIComponent(body);
      const status = form.querySelector('.form-status');
      if (status) status.textContent = 'Je mailprogramma opent — versturen maar. Liever direct? Bel 073 623 12 12.';
    });
  });

  /* ---------- jaartal footer ---------- */
  document.querySelectorAll('[data-jaar]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
