/* Rijschool Lesnemen · interactielaag
   Eén motion-concept: de planlijn. Verder: reveals, tellers,
   ticker, formulier naar WhatsApp, motorkeuze-widget. */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */
  var header = document.querySelector(".site-header");
  var navKnop = document.querySelector(".nav-knop");
  if (navKnop) {
    navKnop.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navKnop.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".hoofdnav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        navKnop.setAttribute("aria-expanded", "false");
      });
    });
  }
  function opScroll() {
    if (header) header.classList.toggle("vast", window.scrollY > 24);
  }
  window.addEventListener("scroll", opScroll, { passive: true });
  opScroll();

  /* ---------- reveal-choreografie ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".rv, .mark-scope").forEach(function (el) { io.observe(el); });

  /* ---------- de planlijn (rail links) ---------- */
  var rail = document.querySelector(".planlijn");
  if (rail) {
    var vulling = rail.querySelector(".vulling");
    var stip = rail.querySelector(".stip");
    var etappes = Array.prototype.slice.call(rail.querySelectorAll(".etappe"));
    var doelen = etappes.map(function (e) {
      return document.getElementById(e.getAttribute("data-doel"));
    });

    function legEtappesNeer() {
      var docH = document.documentElement.scrollHeight;
      etappes.forEach(function (e, i) {
        if (!doelen[i]) return;
        var top = doelen[i].getBoundingClientRect().top + window.scrollY;
        e.style.top = ((top + 140) / docH) * 100 + "%";
      });
    }

    var raf = null;
    function tekenRail() {
      raf = null;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var p = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      var hoogte = p * 100;
      vulling.style.height = hoogte + "%";
      stip.style.top = hoogte + "%";
      var grens = window.scrollY + window.innerHeight * 0.55;
      etappes.forEach(function (e, i) {
        if (!doelen[i]) return;
        var top = doelen[i].getBoundingClientRect().top + window.scrollY;
        e.classList.toggle("bereikt", grens > top);
      });
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(tekenRail);
    }, { passive: true });
    window.addEventListener("resize", function () { legEtappesNeer(); tekenRail(); });
    legEtappesNeer();
    tekenRail();
    setTimeout(function () { legEtappesNeer(); tekenRail(); }, 600);
  }

  /* ---------- slalomlijn in de hero tekent zichzelf ---------- */
  var slalomBaan = document.querySelector(".slalom path.baan");
  if (slalomBaan && !prefersReduced) {
    var lengte = slalomBaan.getTotalLength();
    slalomBaan.style.strokeDasharray = lengte + " " + lengte;
    slalomBaan.style.strokeDashoffset = lengte;
    slalomBaan.getBoundingClientRect();
    slalomBaan.style.transition = "stroke-dashoffset 2.2s cubic-bezier(.45,0,.2,1) .3s";
    slalomBaan.style.strokeDashoffset = "0";
    slalomBaan.addEventListener("transitionend", function () {
      slalomBaan.style.strokeDasharray = "8 10";
      slalomBaan.style.strokeDashoffset = "";
      slalomBaan.style.transition = "";
    }, { once: true });
  }

  /* ---------- tellers ---------- */
  function telOp(el) {
    var doel = parseFloat(el.getAttribute("data-tel"));
    var decimalen = (el.getAttribute("data-tel").split(".")[1] || "").length;
    var duur = 1400;
    var start = null;
    function stap(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / duur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (doel * eased).toFixed(decimalen).replace(".", ",");
      if (p < 1) requestAnimationFrame(stap);
    }
    if (prefersReduced) { el.textContent = doel.toFixed(decimalen).replace(".", ","); return; }
    requestAnimationFrame(stap);
  }
  var telIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { telOp(e.target); telIO.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-tel]").forEach(function (el) { telIO.observe(el); });

  /* ---------- ticker: baan verdubbelen voor naadloze loop ---------- */
  var tickerBaan = document.querySelector(".ticker-baan");
  if (tickerBaan) tickerBaan.innerHTML += tickerBaan.innerHTML;

  /* ---------- lichte parallax op het hero-paneel ---------- */
  var paneel = document.querySelector(".hero-paneel");
  if (paneel && !prefersReduced && matchMedia("(pointer:fine)").matches) {
    var heroSec = document.querySelector(".hero");
    heroSec.addEventListener("mousemove", function (ev) {
      var r = heroSec.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5;
      var y = (ev.clientY - r.top) / r.height - 0.5;
      paneel.style.transform =
        "rotate(1.2deg) translate3d(" + x * -10 + "px," + y * -8 + "px,0)";
    });
    heroSec.addEventListener("mouseleave", function () {
      paneel.style.transform = "rotate(1.2deg)";
    });
  }

  /* ---------- motorkeuze-widget (A2 of A) ---------- */
  var keuze = document.querySelector(".keuze");
  if (keuze) {
    var knoppen = keuze.querySelectorAll(".keuze-opties button");
    var uitkomsten = keuze.querySelectorAll(".keuze-uitkomst");
    knoppen.forEach(function (k) {
      k.addEventListener("click", function () {
        knoppen.forEach(function (b) { b.classList.remove("actief"); });
        k.classList.add("actief");
        uitkomsten.forEach(function (u) {
          u.classList.toggle("zichtbaar", u.id === k.getAttribute("data-uitkomst"));
        });
      });
    });
  }

  /* ---------- proefles-formulier: opent WhatsApp of mail ---------- */
  var form = document.getElementById("proefles-form");
  if (form) {
    function bouwBericht() {
      var naam = (document.getElementById("f-naam").value || "").trim();
      var tel = (document.getElementById("f-tel").value || "").trim();
      var theorie = form.querySelector('input[name="theorie"]:checked');
      var ervaring = form.querySelector('input[name="ervaring"]:checked');
      var vraag = (document.getElementById("f-vraag").value || "").trim();
      var regels = [
        "Hoi Bart, ik wil graag een proefles plannen.",
        "Naam: " + (naam || "-"),
        "Telefoon: " + (tel || "-"),
        "Theorie al gehaald: " + (theorie ? theorie.value : "-"),
        "Ervaring op een motor of scooter: " + (ervaring ? ervaring.value : "-")
      ];
      if (vraag) regels.push("Vraag: " + vraag);
      return regels.join("\n");
    }
    function valideer() {
      var naam = document.getElementById("f-naam");
      var tel = document.getElementById("f-tel");
      var ok = true;
      [naam, tel].forEach(function (v) {
        v.style.borderColor = "";
        if (!v.value.trim()) { v.style.borderColor = "#c53030"; ok = false; }
      });
      if (!ok) naam.value.trim() ? tel.focus() : naam.focus();
      return ok;
    }
    document.getElementById("stuur-wa").addEventListener("click", function (ev) {
      ev.preventDefault();
      if (!valideer()) return;
      window.open("https://wa.me/31683617476?text=" + encodeURIComponent(bouwBericht()), "_blank", "noopener");
    });
    document.getElementById("stuur-mail").addEventListener("click", function (ev) {
      ev.preventDefault();
      if (!valideer()) return;
      window.location.href =
        "mailto:info@lesnemen.nl?subject=" +
        encodeURIComponent("Aanvraag proefles") +
        "&body=" + encodeURIComponent(bouwBericht());
    });
  }

  /* ---------- jaartal ---------- */
  var jaar = document.getElementById("jaar");
  if (jaar) jaar.textContent = new Date().getFullYear();
})();
