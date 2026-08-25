/* ============================================================
   "OP DE WEG" — first-person rit in de hero.
   Pseudo-3D tweebaansweg in de schemer: wegmarkering die op je
   af komt, hectometerpaaltjes met reflectoren, horizongloed.
   Meesturen met de muis, gas geven op scroll. Canvas 2D — licht
   genoeg voor mobiel.
   ============================================================ */
(function () {
  const canvas = document.getElementById('weg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1;
  let horizonY = 0;

  // rijstate
  let afstand = 0;            // afgelegde weg (voor strepen/paaltjes)
  let snelheid = 55;          // "km/u" — basistempo
  let doelSnelheid = 55;
  let stuur = 0;              // -1..1, gestuurde bochtinvloed (muis)
  let stuurDoel = 0;
  let bocht = 0;              // huidige bocht van de weg zelf
  let schok = 0;              // camerashake bij type-slam
  let boost = 0;              // scroll-boost
  let t = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    horizonY = H * 0.42;
  }
  resize();
  window.addEventListener('resize', resize);

  // muis stuurt mee (desktop)
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') {
      stuurDoel = (e.clientX / W - 0.5) * 1.6;
    }
  }, { passive: true });

  // scroll = gas geven
  let vorigeScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const d = window.scrollY - vorigeScroll;
    vorigeScroll = window.scrollY;
    boost = Math.min(140, boost + Math.abs(d) * 0.55);
  }, { passive: true });

  // publieke haakjes voor de type-slam (main.js)
  window.WEG = {
    schakel(kracht) {          // versnelling erin: klap + sprint
      schok = Math.min(1, schok + kracht);
      doelSnelheid += 42;
    },
    kruissnelheid() { doelSnelheid = 96; },
  };

  // projectie: wegpositie (z in [0..1], 0 = bij kijker) → scherm
  function project(z, offsetX) {
    // niet-lineair voor perspectiefgevoel
    const p = Math.pow(z, 2.1);
    const y = horizonY + (H - horizonY) * (1 - p) ;
    // bochtverloop: verschuiving neemt kwadratisch toe richting horizon
    const buiging = (bocht + stuur * 0.55) * 240 * Math.pow(p, 1.8);
    const x = W / 2 + offsetX * wegBreedte(z) + buiging;
    return { x, y };
  }
  // breedte van de weg op diepte z (z=0 dichtbij → breed)
  function wegBreedte(z) {
    const p = Math.pow(z, 2.1);
    return (W * 0.78) * (1 - p) + 2;
  }

  function teken() {
    t += 1 / 60;

    // state bijwerken
    stuur += (stuurDoel - stuur) * 0.045;
    bocht = Math.sin(t * 0.11) * 0.5 + Math.sin(t * 0.043 + 2.1) * 0.35;
    boost *= 0.94;
    snelheid += ((doelSnelheid + boost) - snelheid) * 0.035;
    doelSnelheid += (96 - doelSnelheid) * 0.008; // zakt terug naar kruissnelheid
    afstand += snelheid * 0.0022;
    schok *= 0.86;

    const shakeX = (Math.random() - 0.5) * 14 * schok;
    const shakeY = (Math.random() - 0.5) * 10 * schok;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.clearRect(-20, -20, W + 40, H + 40);

    // --- lucht: schemer met oranje horizongloed ---
    const lucht = ctx.createLinearGradient(0, 0, 0, horizonY);
    lucht.addColorStop(0, '#08090c');
    lucht.addColorStop(0.62, '#101019');
    lucht.addColorStop(1, '#2b1712');
    ctx.fillStyle = lucht;
    ctx.fillRect(-20, -20, W + 40, horizonY + 21);

    // horizongloed (stadslicht Den Bosch in de verte)
    const gloedX = W / 2 + (bocht + stuur * 0.55) * 150;
    const gloed = ctx.createRadialGradient(gloedX, horizonY, 0, gloedX, horizonY, W * 0.55);
    gloed.addColorStop(0, 'rgba(255, 93, 28, 0.34)');
    gloed.addColorStop(0.4, 'rgba(255, 93, 28, 0.09)');
    gloed.addColorStop(1, 'rgba(255, 93, 28, 0)');
    ctx.fillStyle = gloed;
    ctx.fillRect(-20, -20, W + 40, horizonY + 21);

    // skyline-silhouet: lage stadsrand met een enkele toren (Sint-Jan in de verte)
    ctx.fillStyle = '#0a0b0e';
    ctx.beginPath();
    ctx.moveTo(-20, horizonY + 1);
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * (W + 40) - 20;
      let hgt = 4 + (Math.sin(i * 2.3) * 0.5 + 0.5) * 7 + (Math.sin(i * 0.9 + 4) * 0.5 + 0.5) * 5;
      if (i === 29) hgt += 26;            // de toren
      if (i === 28 || i === 30) hgt += 10;
      ctx.lineTo(x, horizonY + 1 - hgt);
      ctx.lineTo(x + (W + 40) / n, horizonY + 1 - hgt);
    }
    ctx.lineTo(W + 20, horizonY + 1);
    ctx.closePath();
    ctx.fill();

    // --- berm/asfaltvlak ---
    const grond = ctx.createLinearGradient(0, horizonY, 0, H);
    grond.addColorStop(0, '#101114');
    grond.addColorStop(1, '#0b0c0e');
    ctx.fillStyle = grond;
    ctx.fillRect(-20, horizonY, W + 40, H - horizonY + 20);

    // --- wegdek (donkerder vlak tussen de kantlijnen) ---
    ctx.beginPath();
    const stappen = 34;
    for (let i = 0; i <= stappen; i++) {
      const z = i / stappen;
      const p = project(z, -0.5);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    for (let i = stappen; i >= 0; i--) {
      const z = i / stappen;
      const p = project(z, 0.5);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    const asfaltGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    asfaltGrad.addColorStop(0, '#17181d');
    asfaltGrad.addColorStop(1, '#131418');
    ctx.fillStyle = asfaltGrad;
    ctx.fill();

    // --- kantlijnen (doorgetrokken) ---
    for (const kant of [-0.5, 0.5]) {
      ctx.beginPath();
      for (let i = 0; i <= stappen; i++) {
        const z = i / stappen;
        const p = project(z, kant);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(236, 232, 223, 0.5)';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // --- middenstrepen: segmenten die op je af komen ---
    // diepte d: 0 = bij de kijker, 1 = horizon. afstand schuift ze naar de kijker.
    const streepLengte = 0.05;
    const cyclus = 0.13;
    const faze = afstand % cyclus;
    for (let d0 = -faze; d0 < 1; d0 += cyclus) {
      const na = Math.max(0.001, d0);            // dichtstbijzijnde punt van de streep
      const ver = Math.min(0.999, d0 + streepLengte);
      if (ver <= na) continue;
      const a = project(na, 0);
      const b = project(ver, 0);
      const w0 = Math.max(1, wegBreedte(na) * 0.011);
      const w1 = Math.max(1, wegBreedte(ver) * 0.011);
      // dichterbij = feller
      ctx.fillStyle = 'rgba(236, 232, 223, ' + (0.25 + 0.65 * (1 - na)) + ')';
      ctx.beginPath();
      ctx.moveTo(a.x - w0, a.y);
      ctx.lineTo(a.x + w0, a.y);
      ctx.lineTo(b.x + w1, b.y);
      ctx.lineTo(b.x - w1, b.y);
      ctx.closePath();
      ctx.fill();
    }

    // --- hectometerpaaltjes met reflector ---
    const paalCyclus = 0.24;
    const paalFaze = (afstand * 0.55) % paalCyclus;
    for (let s = -paalFaze; s < 1; s += paalCyclus) {
      const d = Math.max(0.005, s);
      if (d >= 0.96) continue;
      for (const kant of [-0.6, 0.6]) {
        const voet = project(d, kant);
        const hoogte = Math.max(2, (1 - Math.pow(d, 2.1)) * 40);
        const dikte = Math.max(1.5, hoogte * 0.1);
        ctx.fillStyle = 'rgba(220, 216, 206, ' + (0.15 + 0.4 * (1 - d)) + ')';
        ctx.fillRect(voet.x - dikte / 2, voet.y - hoogte, dikte, hoogte);
        // reflector
        ctx.fillStyle = 'rgba(255, 93, 28, ' + (0.35 + 0.6 * (1 - d)) + ')';
        ctx.fillRect(voet.x - dikte / 2, voet.y - hoogte, dikte, Math.max(1.5, hoogte * 0.2));
      }
    }

    // --- snelheidsgevoel: lichte vignette + speedlines bij boost ---
    if (snelheid > 110) {
      const kracht = Math.min(1, (snelheid - 110) / 90);
      ctx.strokeStyle = `rgba(236, 232, 223, ${0.06 * kracht})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const hoekY = Math.random() * H;
        const lang = 40 + Math.random() * 140;
        const x = Math.random() < 0.5 ? Math.random() * W * 0.22 : W - Math.random() * W * 0.22;
        ctx.beginPath();
        ctx.moveTo(x, hoekY);
        ctx.lineTo(x + (x < W / 2 ? -lang : lang) * 0.4, hoekY + lang);
        ctx.stroke();
      }
    }

    const vignette = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.28, W / 2, H * 0.55, H * 0.95);
    vignette.addColorStop(0, 'rgba(11, 12, 14, 0)');
    vignette.addColorStop(1, 'rgba(11, 12, 14, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    ctx.restore();
  }

  if (reduceMotion) {
    // één statisch frame
    teken();
    return;
  }

  // alleen renderen als de hero in beeld is
  let inBeeld = true;
  new IntersectionObserver((entries) => {
    inBeeld = entries[0].isIntersecting;
  }).observe(canvas);

  (function frame() {
    if (inBeeld) teken();
    requestAnimationFrame(frame);
  })();
})();
