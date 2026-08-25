/* Rijschool De Draak - interactie en motion.
   Eén motion-concept: goud dat oplicht uit het zwart. Alles respecteert
   prefers-reduced-motion en blijft licht op mobiel. */
(function () {
  "use strict";

  const beweegOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navigatie ---------- */
  const nav = document.querySelector(".nav");
  const zetNav = () => nav && nav.classList.toggle("vast", window.scrollY > 24);
  zetNav();
  window.addEventListener("scroll", zetNav, { passive: true });

  const hamburger = document.querySelector(".hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobiel-menu a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        hamburger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Reveal-choreografie ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        /* Ook onthullen als het element al boven de viewport uit is gescrold,
           anders blijft het onzichtbaar voor wie snel scrolt. */
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add("in-beeld");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".reveal, .route-stap").forEach((el) => io.observe(el));

  /* ---------- Tellers in de vertrouwensstrip ---------- */
  const telIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        telIo.unobserve(e.target);
        const el = e.target;
        const eind = parseFloat(el.dataset.tel.replace(",", "."));
        const decimalen = (el.dataset.tel.split(",")[1] || "").length;
        const duur = 1400;
        const start = performance.now();
        const stap = (nu) => {
          const t = Math.min((nu - start) / duur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (eind * eased).toFixed(decimalen).replace(".", ",");
          if (t < 1) requestAnimationFrame(stap);
        };
        if (beweegOk) requestAnimationFrame(stap);
        else el.textContent = el.dataset.tel;
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-tel]").forEach((el) => telIo.observe(el));

  /* ---------- Routevoortgang (werkwijze) ---------- */
  const route = document.querySelector(".route");
  if (route) {
    const pad = route.querySelector(".route-pad");
    const zetVoortgang = () => {
      const r = route.getBoundingClientRect();
      const vh = window.innerHeight;
      const voortgang = Math.min(Math.max((vh * 0.72 - r.top) / r.height, 0), 1);
      pad.style.setProperty("--voortgang", voortgang.toFixed(3));
    };
    zetVoortgang();
    window.addEventListener("scroll", zetVoortgang, { passive: true });
  }

  /* ---------- Reviewrail ---------- */
  const rail = document.querySelector(".review-rail");
  if (rail) {
    const kaartBreedte = () => {
      const kaart = rail.querySelector(".review-kaart");
      return kaart ? kaart.getBoundingClientRect().width + 19 : 320;
    };
    document.querySelector("[data-review-vorige]")?.addEventListener("click", () =>
      rail.scrollBy({ left: -kaartBreedte(), behavior: "smooth" })
    );
    document.querySelector("[data-review-volgende]")?.addEventListener("click", () =>
      rail.scrollBy({ left: kaartBreedte(), behavior: "smooth" })
    );
  }

  /* ---------- Proefles-formulier: opent WhatsApp met ingevuld bericht ---------- */
  const formulier = document.getElementById("proefles-formulier");
  if (formulier) {
    formulier.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(formulier);
      const naam = (data.get("naam") || "").toString().trim();
      const tel = (data.get("telefoon") || "").toString().trim();
      const les = data.get("lestype") || "autorijles";
      const status = formulier.querySelector(".formulier-status");
      if (!naam || !tel) {
        status.textContent = "Vul je naam en telefoonnummer in, dan kan William je bereiken.";
        return;
      }
      const bericht =
        `Hoi William, ik wil graag een gratis proefles ${les === "motorrijles" ? "op de motor" : "in de auto"}. ` +
        `Mijn naam is ${naam} en mijn nummer is ${tel}.`;
      status.textContent = "WhatsApp opent met je bericht. Versturen en klaar!";
      window.open(`https://wa.me/31629805240?text=${encodeURIComponent(bericht)}`, "_blank", "noopener");
    });
  }
})();
