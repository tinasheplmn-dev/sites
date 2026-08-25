/* Verkeersschool Weber · interactielaag
   Eén motion-concept: het routespoor. Alles wat beweegt, beweegt langs de route:
   het spoor vult op scroll, tellers tellen naar hun bestemming, secties rijden binnen. */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */
  const header = document.querySelector(".site-header");
  let vorigeScroll = 0;
  function opScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-gescrold", y > 24);
    // verberg bij scrollen omlaag, toon bij omhoog (niet als menu open is)
    if (!document.body.classList.contains("nav-open")) {
      header.classList.toggle("is-verborgen", y > 420 && y > vorigeScroll);
    }
    vorigeScroll = y;
    updateRoutespoor();
  }
  window.addEventListener("scroll", opScroll, { passive: true });

  const navKnop = document.querySelector(".nav-knop");
  if (navKnop) {
    navKnop.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      navKnop.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".hoofdnav a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        navKnop.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- routespoor: scrollvoortgang als weg ---------- */
  const spoorVulling = document.querySelector(".routespoor-vulling");
  const spoorStip = document.querySelector(".routespoor-stip");
  function updateRoutespoor() {
    if (!spoorVulling) return;
    const totaal = document.documentElement.scrollHeight - window.innerHeight;
    const p = totaal > 0 ? Math.min(1, window.scrollY / totaal) : 0;
    const pct = (p * 100).toFixed(2) + "%";
    spoorVulling.style.height = pct;
    if (spoorStip) spoorStip.style.top = pct;
  }

  /* ---------- reveals ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-zichtbaar");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

  /* ---------- tellers ---------- */
  function formatteer(waarde, decimalen, scheiding) {
    let s = waarde.toFixed(decimalen);
    if (decimalen > 0) s = s.replace(".", ",");
    // puntjes voor duizendtallen
    const delen = s.split(",");
    delen[0] = delen[0].replace(/\B(?=(\d{3})+(?!\d))/g, scheiding ? "." : ".");
    return delen.join(",");
  }
  const telObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        telObserver.unobserve(e.target);
        const el = e.target;
        const doel = parseFloat(el.dataset.tel);
        const decimalen = parseInt(el.dataset.decimalen || "0", 10);
        const duur = reducedMotion ? 0 : 1900;
        if (duur === 0) { el.textContent = formatteer(doel, decimalen, true); return; }
        const start = performance.now();
        function stap(nu) {
          const t = Math.min(1, (nu - start) / duur);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = formatteer(doel * eased, decimalen, true);
          if (t < 1) requestAnimationFrame(stap);
        }
        requestAnimationFrame(stap);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-tel]").forEach((el) => telObserver.observe(el));

  /* ---------- hero-parallax (muis + scroll) ---------- */
  const heroLagen = document.querySelectorAll("[data-laag]");
  if (heroLagen.length && !reducedMotion && matchMedia("(pointer: fine)").matches) {
    let doelX = 0, doelY = 0, huidigX = 0, huidigY = 0, bezig = false;
    window.addEventListener("mousemove", (e) => {
      doelX = (e.clientX / window.innerWidth - 0.5) * 2;
      doelY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!bezig) { bezig = true; requestAnimationFrame(animeer); }
    });
    function animeer() {
      huidigX += (doelX - huidigX) * 0.06;
      huidigY += (doelY - huidigY) * 0.06;
      heroLagen.forEach((laag) => {
        const kracht = parseFloat(laag.dataset.laag) || 6;
        laag.style.transform = `translate(${(-huidigX * kracht).toFixed(2)}px, ${(-huidigY * kracht * 0.6).toFixed(2)}px)`;
      });
      if (Math.abs(doelX - huidigX) > 0.001 || Math.abs(doelY - huidigY) > 0.001) {
        requestAnimationFrame(animeer);
      } else { bezig = false; }
    }
  }

  /* ---------- video-facades: speler pas bij klik ---------- */
  document.querySelectorAll("[data-video]").forEach((kaart) => {
    kaart.addEventListener("click", () => {
      const id = kaart.dataset.video;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = kaart.querySelector(".video-titel")?.textContent || "Video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      kaart.appendChild(iframe);
      kaart.setAttribute("aria-pressed", "true");
    }, { once: true });
  });

  /* ---------- reviewtabs ---------- */
  document.querySelectorAll("[data-review-tabs]").forEach((blok) => {
    const tabs = blok.querySelectorAll(".review-tab");
    const panelen = blok.querySelectorAll("[data-stroom]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
        const stroom = tab.dataset.kies;
        panelen.forEach((p) => {
          const past = stroom === "alles" || p.dataset.stroom === stroom;
          p.style.display = past ? "" : "none";
        });
      });
    });
  });

  /* ---------- rekenhulp ---------- */
  const slider = document.querySelector("#reken-slider");
  if (slider) {
    const uurprijs = parseFloat(slider.dataset.uurprijs);
    const vast = parseFloat(slider.dataset.vast || "0");
    const aantalEl = document.querySelector("#reken-aantal");
    const totaalEl = document.querySelector("#reken-totaal");
    function reken() {
      const n = parseInt(slider.value, 10);
      aantalEl.textContent = n;
      const totaal = n * uurprijs + vast;
      totaalEl.textContent = "€ " + totaal.toLocaleString("nl-NL");
    }
    slider.addEventListener("input", reken);
    reken();
  }

  /* ---------- formulieren: mailto-compositie ---------- */
  document.querySelectorAll("form[data-mailform]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const onderwerp = form.dataset.onderwerp || "Bericht via de website";
      let regels = [];
      d.forEach((waarde, naam) => {
        if (naam === "akkoord") return;
        if (String(waarde).trim() === "") return;
        regels.push(`${naam}: ${waarde}`);
      });
      const body = encodeURIComponent(regels.join("\n"));
      window.location.href = `mailto:info@verkeersschoolweber.nl?subject=${encodeURIComponent(onderwerp)}&body=${body}`;
      const melding = form.querySelector(".form-melding");
      if (melding) melding.classList.add("zichtbaar");
    });
  });

  /* funnel: ?type=proefles of #zakelijk vult het onderwerpveld */
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  if (type) {
    const veld = document.querySelector("#onderwerp");
    if (veld) {
      const opties = { proefles: "Proefles aanvragen", motor: "Motorrijlessen", auto: "Autorijlessen", zakelijk: "Zakelijke samenwerking" };
      if (opties[type]) veld.value = opties[type];
    }
  }

  /* ---------- openingstijden: markeer vandaag ---------- */
  const vandaagRij = document.querySelector(`.tijden-tabel tr[data-dag="${new Date().getDay()}"]`);
  if (vandaagRij) vandaagRij.classList.add("vandaag");

  /* ---------- lint dupliceren voor naadloze loop ---------- */
  document.querySelectorAll(".lint-baan").forEach((baan) => {
    baan.innerHTML += baan.innerHTML;
  });

  opScroll();
})();
