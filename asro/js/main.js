/* Rijschool Asro · motion-engine
   Eén concept: de examenroute. Scroll tekent de lijn, checkpoints lichten op,
   cijfers tellen, de geslaagden-carrousel sleept. Alles respecteert
   prefers-reduced-motion. Geen frameworks nodig. */

(function () {
  "use strict";

  var rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */
  var kop = document.querySelector(".kop-balk");
  function kopStand() {
    if (window.scrollY > 24) kop.classList.add("vast");
    else kop.classList.remove("vast");
  }
  window.addEventListener("scroll", kopStand, { passive: true });
  kopStand();

  /* ---------- mobiel menu ---------- */
  var menuKnop = document.querySelector(".menu-knop");
  if (menuKnop) {
    menuKnop.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      menuKnop.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mob-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        menuKnop.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- reveals ---------- */
  var kijker = new IntersectionObserver(
    function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) {
          it.target.classList.add("zichtbaar");
          kijker.unobserve(it.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".rv, .teller, .checkpoint").forEach(function (el) {
    kijker.observe(el);
  });

  /* hero-intro */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("klaar");
    });
  });

  /* ---------- tellers ---------- */
  function telOp(el) {
    var doel = parseFloat(el.dataset.doel);
    var decimalen = el.dataset.decimalen ? parseInt(el.dataset.decimalen, 10) : 0;
    var duur = 1600;
    var start = null;
    if (rustig) {
      el.textContent = doel.toFixed(decimalen).replace(".", ",");
      return;
    }
    function stap(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / duur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (doel * eased).toFixed(decimalen).replace(".", ",");
      if (p < 1) requestAnimationFrame(stap);
    }
    requestAnimationFrame(stap);
  }
  var telKijker = new IntersectionObserver(
    function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) {
          telOp(it.target);
          telKijker.unobserve(it.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-doel]").forEach(function (el) {
    telKijker.observe(el);
  });

  /* ---------- de routelijn ---------- */
  var routeWikkel = document.querySelector(".route-wikkel");
  var routePad = document.querySelector(".route-svg .rijdend");
  var routePunt = document.querySelector(".route-svg .route-punt");
  var routeSpoor = document.querySelector(".route-svg .spoor");

  function bouwRoute() {
    if (!routeWikkel || !routePad) return;
    var svg = document.querySelector(".route-svg");
    var b = routeWikkel.getBoundingClientRect();
    var w = b.width;
    var h = routeWikkel.offsetHeight;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);

    var bollen = routeWikkel.querySelectorAll(".cp-bol, .cp-einde .stempel");
    var punten = [];
    bollen.forEach(function (bol) {
      var r = bol.getBoundingClientRect();
      punten.push({
        x: r.left - b.left + r.width / 2,
        y: r.top - b.top + r.height / 2,
      });
    });
    if (punten.length < 2) return;

    var d = "M " + punten[0].x + " " + punten[0].y;
    for (var i = 1; i < punten.length; i++) {
      var vorige = punten[i - 1];
      var nu = punten[i];
      var midY = (vorige.y + nu.y) / 2;
      d += " C " + vorige.x + " " + midY + ", " + nu.x + " " + midY + ", " + nu.x + " " + nu.y;
    }
    routePad.setAttribute("d", d);
    routeSpoor.setAttribute("d", d);

    var lengte = routePad.getTotalLength();
    routePad.style.strokeDasharray = lengte;
    routePad.style.strokeDashoffset = lengte;
    routePad.dataset.lengte = lengte;
  }

  function tekenRoute() {
    if (!routeWikkel || !routePad || !routePad.dataset.lengte) return;
    var lengte = parseFloat(routePad.dataset.lengte);
    var r = routeWikkel.getBoundingClientRect();
    var vh = window.innerHeight;
    var voortgang = (vh * 0.75 - r.top) / (r.height + vh * 0.35);
    voortgang = Math.max(0, Math.min(1, voortgang));
    if (rustig) voortgang = 1;
    var offset = lengte * (1 - voortgang);
    routePad.style.strokeDashoffset = offset;
    if (routePunt && voortgang > 0.01 && voortgang < 1) {
      var p = routePad.getPointAtLength(lengte * voortgang);
      routePunt.setAttribute("cx", p.x);
      routePunt.setAttribute("cy", p.y);
      routePunt.setAttribute("r", 9);
    } else if (routePunt) {
      routePunt.setAttribute("r", 0);
    }
  }

  if (routeWikkel) {
    bouwRoute();
    tekenRoute();
    window.addEventListener("scroll", tekenRoute, { passive: true });
    var herbouwTimer;
    window.addEventListener("resize", function () {
      clearTimeout(herbouwTimer);
      herbouwTimer = setTimeout(function () {
        bouwRoute();
        tekenRoute();
      }, 150);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        bouwRoute();
        tekenRoute();
      });
    }
  }

  /* ---------- carrousel ---------- */
  document.querySelectorAll("[data-carrousel]").forEach(function (blok) {
    var baan = blok.querySelector(".carrousel");
    var vulling = blok.querySelector(".car-balk .vulling");
    var vorige = blok.querySelector("[data-vorige]");
    var volgende = blok.querySelector("[data-volgende]");

    function balk() {
      if (!vulling) return;
      var max = baan.scrollWidth - baan.clientWidth;
      var p = max > 0 ? baan.scrollLeft / max : 0;
      vulling.style.width = Math.max(4, p * 100) + "%";
    }
    baan.addEventListener("scroll", balk, { passive: true });
    balk();

    function kaartBreedte() {
      var kaart = baan.querySelector(".g-kaart");
      return kaart ? kaart.getBoundingClientRect().width + 20 : 340;
    }
    if (vorige) vorige.addEventListener("click", function () { baan.scrollBy({ left: -kaartBreedte(), behavior: "smooth" }); });
    if (volgende) volgende.addEventListener("click", function () { baan.scrollBy({ left: kaartBreedte(), behavior: "smooth" }); });

    /* muis-slepen (touch werkt native) */
    var sleept = false, startX = 0, startScroll = 0, bewogen = false;
    baan.addEventListener("mousedown", function (e) {
      sleept = true; bewogen = false;
      startX = e.pageX; startScroll = baan.scrollLeft;
      baan.classList.add("sleept");
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!sleept) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) bewogen = true;
      baan.scrollLeft = startScroll - dx;
    });
    window.addEventListener("mouseup", function () {
      if (!sleept) return;
      sleept = false;
      baan.classList.remove("sleept");
    });
    baan.addEventListener("click", function (e) {
      if (bewogen) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });

  /* ---------- proefles-formulier: opent WhatsApp met ingevuld bericht ---------- */
  var form = document.getElementById("proefles-formulier");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var naam = form.naam.value.trim();
      var tel = form.telefoon.value.trim();
      var schakel = form.querySelector('input[name="transmissie"]:checked');
      var bericht = form.bericht.value.trim();
      var regels = [
        "Hoi Taylan! Ik wil graag een gratis proefles plannen.",
        "Naam: " + naam,
        "Telefoon: " + tel,
        "Voorkeur: " + (schakel ? schakel.value : "nog geen idee"),
      ];
      if (bericht) regels.push("Extra: " + bericht);
      var url = "https://wa.me/31658969123?text=" + encodeURIComponent(regels.join("\n"));
      window.open(url, "_blank", "noopener");
      var melding = document.getElementById("form-melding");
      if (melding) {
        melding.textContent = "WhatsApp opent met je bericht klaar om te versturen. Liever bellen? 06 58969123.";
        melding.style.display = "block";
      }
    });
  }
})();
