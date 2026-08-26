/* Verkeersschool van den Broek · gedeelde interactie
   Motion-concept: analoge instrumenten. Naalden, tellers en arcs komen in
   beweging zodra ze in beeld komen; verder rustige reveals. Geen frameworks. */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* Actie-banner sluiten */
  var banner = document.querySelector(".actie-banner");
  if (banner) {
    document.querySelector(".actie-close").addEventListener("click", function () {
      document.body.classList.add("actie-hidden");
      localStorage.setItem("actie-hidden-20260810", "1");
    });
    if (localStorage.getItem("actie-hidden-20260810")) {
      document.body.classList.add("actie-hidden");
    }
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Vangnet: draait de pagina zonder zichtbare frames (verborgen tabblad),
     dan vuurt IntersectionObserver niet. Bij zichtbaar worden alles tonen
     wat al in beeld staat, en na 4s alles vrijgeven als uiterste fallback. */
  function revealVisible() {
    document.querySelectorAll(".rv:not(.in)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
    });
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) revealVisible();
  });

  /* ---------- Nav ---------- */
  var nav = document.querySelector(".nav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  var burger = document.querySelector(".nav-burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* ---------- Reveals ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  /* ---------- Tellers ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count.replace(",", "."));
    var decimals = (el.dataset.count.split(",")[1] || "").length;
    var dur = 1800;
    var start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val
        .toFixed(decimals)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      if (p < 1) requestAnimationFrame(frame);
    }
    if (reduceMotion) {
      el.textContent = el.dataset.count.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    } else {
      requestAnimationFrame(frame);
    }
  }
  var ioCount = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          ioCount.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) { ioCount.observe(el); });

  /* ---------- Meters (gauges) ----------
     .gauge heeft data-pct. De arc is 180 graden; naald draait van -90 naar
     (-90 + pct * 1.8) graden, de arc vult mee via dashoffset. */
  function armGauge(g) {
    var pct = parseFloat(g.dataset.pct || "0");
    var needle = g.querySelector(".g-needle");
    var arc = g.querySelector(".g-arc-fill");
    if (needle) needle.style.transform = "rotate(" + (pct * 1.8) + "deg)";
    if (arc) {
      var len = arc.getTotalLength ? arc.getTotalLength() : 264;
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = len * (1 - pct / 100);
    }
    var valueEl = g.parentElement.querySelector("[data-count]");
    if (valueEl && !valueEl.dataset.armed) {
      valueEl.dataset.armed = "1";
      animateCount(valueEl);
    }
  }
  var ioGauge = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          armGauge(e.target);
          ioGauge.unobserve(e.target);
        }
      });
    },
    { threshold: 0.45 }
  );
  document.querySelectorAll(".gauge[data-pct]").forEach(function (g) {
    var arc = g.querySelector(".g-arc-fill");
    if (arc) {
      var len = arc.getTotalLength ? arc.getTotalLength() : 264;
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = len;
    }
    if (reduceMotion) { armGauge(g); } else { ioGauge.observe(g); }
  });

  /* ---------- Hero-instrument ----------
     Grote wijzerplaat: naald zweeft na load naar "vandaag" en de tick-ring
     draait heel subtiel mee met de scroll. */
  var heroNeedle = document.querySelector("#hero-needle");
  var heroRing = document.querySelector("#hero-tickring");
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
    if (heroNeedle && !reduceMotion) {
      requestAnimationFrame(function () {
        setTimeout(function () { heroNeedle.style.transform = "rotate(126deg)"; }, 350);
      });
    } else if (heroNeedle) {
      heroNeedle.style.transform = "rotate(126deg)";
    }
  });
  if (heroRing && !reduceMotion) {
    window.addEventListener(
      "scroll",
      function () {
        heroRing.style.transform = "rotate(" + window.scrollY * 0.02 + "deg)";
      },
      { passive: true }
    );
  }

  /* ---------- Marquees: track dupliceren voor naadloze loop ---------- */
  document.querySelectorAll("[data-marquee]").forEach(function (track) {
    if (reduceMotion) return;
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Mobiele belbalk: tonen na de eerste viewport ---------- */
  var dock = document.querySelector(".mobile-dock");
  if (dock) {
    window.addEventListener(
      "scroll",
      function () {
        dock.classList.toggle("show", window.scrollY > window.innerHeight * 0.6);
      },
      { passive: true }
    );
  }

  /* ---------- Proefles-formulier: bouwt een WhatsApp-bericht ----------
     Auto gaat naar Franc, motor en aanhanger naar Erico. */
  var form = document.querySelector("#proefles-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var naam = (data.get("naam") || "").toString().trim();
      var tel = (data.get("telefoon") || "").toString().trim();
      var cat = (data.get("categorie") || "auto").toString();
      var msg = (data.get("bericht") || "").toString().trim();
      var labels = { auto: "autorijles", motor: "motorrijles", aanhanger: "het aanhangerrijbewijs (BE)" };
      var nummers = { auto: "31647404844", motor: "31654272490", aanhanger: "31654272490" };
      var tekst =
        "Hoi! Ik wil graag een proefles voor " + (labels[cat] || cat) + ".\n" +
        "Naam: " + naam + "\n" +
        "Telefoon: " + tel +
        (msg ? "\nExtra: " + msg : "");
      var url = "https://wa.me/" + nummers[cat] + "?text=" + encodeURIComponent(tekst);
      window.open(url, "_blank", "noopener");
      var success = document.querySelector(".form-success");
      if (success) {
        form.style.display = "none";
        success.classList.add("show");
      }
    });
  }
})();

/* ---------- geslaagden-fotocarrousel ---------- */
(function () {
  var strip = document.querySelector('[data-strip]');
  if (!strip) return;
  var stap = function () { var f = strip.querySelector('figure'); return f ? f.getBoundingClientRect().width + 16 : 300; };
  var vorige = document.querySelector('[data-strip-vorige]');
  var volgende = document.querySelector('[data-strip-volgende]');
  if (vorige) vorige.addEventListener('click', function () { strip.scrollBy({ left: -stap() * 2, behavior: 'smooth' }); });
  if (volgende) volgende.addEventListener('click', function () { strip.scrollBy({ left: stap() * 2, behavior: 'smooth' }); });
})();
