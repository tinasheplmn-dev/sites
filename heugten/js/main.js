/* Verkeersschool M. van Heugten — interactie & motion */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header schaduw bij scroll */
  var header = document.querySelector(".header");
  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* Mobiel menu */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
    document.querySelectorAll(".mobmenu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        document.documentElement.style.overflow = "";
      });
    });
  }

  /* Dropdown Rijopleidingen (desktop) */
  document.querySelectorAll(".nav__item").forEach(function (item) {
    var toggle = item.querySelector(".nav__toggle");
    if (!toggle) return;
    function close(e) {
      if (!item.contains(e.target)) {
        item.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    }
    toggle.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    item.addEventListener("mouseenter", function () {
      item.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    });
    item.addEventListener("mouseleave", function () {
      item.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("click", close);
  });

  /* Scroll-reveals */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("inview");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal, .route").forEach(function (el) { io.observe(el); });

  /* Routelijn: voortgang van de rit over de pagina (desktop) */
  var routeline = document.querySelector(".routeline");
  if (routeline && !reduceMotion) {
    var fill = routeline.querySelector(".routeline__fill");
    var dot = routeline.querySelector(".routeline__dot");
    var ticking = false;
    function paint() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (fill) fill.style.clipPath = "inset(0 -4px " + (100 - p * 100) + "% -4px)";
      if (dot) {
        var top = routeline.querySelector(".routeline__track").getBoundingClientRect();
        dot.style.top = top.top + p * top.height + "px";
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener("resize", paint);
    paint();
  }

  /* Odometer-tellers */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count.replace(",", "."));
    var decimals = (el.dataset.count.split(",")[1] || "").length;
    var dur = 1600;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = decimals
        ? val.toFixed(decimals).replace(".", ",")
        : Math.round(val).toString();
      if (p < 1) requestAnimationFrame(frame);
    }
    if (reduceMotion) {
      el.textContent = el.dataset.count;
    } else {
      requestAnimationFrame(frame);
      setTimeout(function () { el.textContent = el.dataset.count; }, dur + 200);
    }
  }
  var cio = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          cio.unobserve(en.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* Hero-fotowaaier: subtiele parallax op muis/scroll */
  var fan = document.querySelector(".fan");
  if (fan && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    var cards = fan.querySelectorAll(".fan__card");
    var rot = [-5, 3.2, -1.6];
    fan.addEventListener("mousemove", function (e) {
      var r = fan.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach(function (c, i) {
        var depth = (i + 1) * 7;
        c.style.transform =
          "rotate(" + rot[i] + "deg) translate(" + dx * depth + "px," + dy * depth + "px)";
      });
    });
    fan.addEventListener("mouseleave", function () {
      cards.forEach(function (c, i) { c.style.transform = "rotate(" + rot[i] + "deg)"; });
    });
  }

  /* Reviews-slider pijlen */
  document.querySelectorAll(".reviews-slider").forEach(function (slider) {
    var track = slider.querySelector(".reviews-track");
    slider.querySelectorAll("[data-slide]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = track.querySelector(".review");
        var w = card ? card.getBoundingClientRect().width + 18 : 360;
        track.scrollBy({ left: btn.dataset.slide === "next" ? w : -w, behavior: "smooth" });
      });
    });
  });

  /* Reviewfilters */
  var filterWrap = document.querySelector(".filters");
  if (filterWrap) {
    var cards = document.querySelectorAll(".reviews-grid .review");
    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filterWrap.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var f = btn.dataset.filter;
      cards.forEach(function (c) {
        c.classList.toggle("is-hidden", f !== "alle" && c.dataset.cat !== f);
      });
    });
  }

  /* CBR-video: klik-om-te-laden (snel + privacyvriendelijk) */
  document.querySelectorAll(".video__poster").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.dataset.video;
      var wrap = btn.closest(".video");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      iframe.title = btn.dataset.title || "CBR examenvideo";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      wrap.appendChild(iframe);
      btn.remove();
    });
  });

  /* Proefles-formulier: opent mail-app met ingevulde aanvraag */
  var form = document.querySelector("#proefles-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var body =
        "Hoi Michael,%0D%0A%0D%0AIk wil graag een proefles aanvragen.%0D%0A%0D%0A" +
        "Naam: " + encodeURIComponent(d.get("naam")) + "%0D%0A" +
        "Telefoon: " + encodeURIComponent(d.get("telefoon")) + "%0D%0A" +
        "Rijbewijs: " + encodeURIComponent(d.get("categorie")) + "%0D%0A" +
        "Opmerking: " + encodeURIComponent(d.get("bericht") || "-") + "%0D%0A%0D%0A" +
        "Groeten,%0D%0A" + encodeURIComponent(d.get("naam"));
      window.location.href =
        "mailto:post.michaelvanheugten@gmail.com?subject=" +
        encodeURIComponent("Proefles aanvragen – " + d.get("categorie")) +
        "&body=" + body;
      var ok = form.querySelector(".form__ok");
      if (ok) ok.style.display = "block";
    });
  }

  /* Footer-jaartal */
  var y = document.querySelector("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
