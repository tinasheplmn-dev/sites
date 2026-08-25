/* Autorijschool Marco Pas · interactie en motion
   Eén concept door de hele site: de route. De hero rijdt binnen, de
   routelijn tekent mee met je scroll en de cijfers tellen op. */
(function () {
  'use strict';

  var verminderd = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- hero: startchoreografie ----- */
  window.addEventListener('load', function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add('klaar');
    });
  });
  /* vangnet als load al geweest is of lang duurt */
  setTimeout(function () { document.documentElement.classList.add('klaar'); }, 1200);

  /* ----- sticky header ----- */
  var kopBalk = document.querySelector('.kop-balk');
  function zetKop() {
    if (kopBalk) kopBalk.classList.toggle('vast', window.scrollY > 8);
  }
  window.addEventListener('scroll', zetKop, { passive: true });
  zetKop();

  /* ----- mobiel menu ----- */
  var doek = document.getElementById('menu-doek');
  var open = document.getElementById('menu-open');
  var dicht = document.getElementById('menu-dicht');
  function menu(openen) {
    if (!doek) return;
    doek.classList.toggle('open', openen);
    document.body.style.overflow = openen ? 'hidden' : '';
    if (open) open.setAttribute('aria-expanded', openen ? 'true' : 'false');
  }
  if (open) open.addEventListener('click', function () { menu(true); });
  if (dicht) dicht.addEventListener('click', function () { menu(false); });
  if (doek) {
    doek.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') menu(false);
    });
  }

  /* ----- reveal bij scroll ----- */
  var revs = document.querySelectorAll('.rev');
  if ('IntersectionObserver' in window && revs.length) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          item.target.classList.add('zichtbaar');
          kijker.unobserve(item.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revs.forEach(function (el) { kijker.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add('zichtbaar'); });
  }

  /* ----- carrousels: stipjes onder de rij, alleen op mobiel zichtbaar ----- */
  document.querySelectorAll('.carrousel').forEach(function (rij) {
    var items = Array.prototype.slice.call(rij.children);
    if (items.length < 2) return;

    /* lange rijen krijgen een balkje in plaats van een sliert stipjes */
    if (items.length > 6) {
      var baan = document.createElement('div');
      baan.className = 'swipebaan';
      baan.setAttribute('aria-hidden', 'true');
      var duim = document.createElement('span');
      baan.appendChild(duim);
      rij.parentNode.insertBefore(baan, rij.nextSibling);
      var zetDuim = function () {
        var maxOm = rij.scrollWidth - rij.clientWidth;
        var deel = maxOm > 0 ? rij.scrollLeft / maxOm : 0;
        var breedte = Math.max(0.14, rij.clientWidth / rij.scrollWidth);
        duim.style.width = (breedte * 100) + '%';
        duim.style.left = (deel * (100 - breedte * 100)) + '%';
      };
      rij.addEventListener('scroll', zetDuim, { passive: true });
      window.addEventListener('resize', zetDuim);
      zetDuim();
      return;
    }

    var punten = document.createElement('div');
    punten.className = 'punten';
    punten.setAttribute('role', 'tablist');
    punten.setAttribute('aria-label', 'Navigatie door de kaarten');
    items.forEach(function (item, i) {
      var punt = document.createElement('button');
      punt.type = 'button';
      punt.setAttribute('aria-label', 'Kaart ' + (i + 1) + ' van ' + items.length);
      punt.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      punt.addEventListener('click', function () {
        rij.scrollTo({ left: item.offsetLeft - rij.offsetLeft, behavior: verminderd ? 'auto' : 'smooth' });
      });
      punten.appendChild(punt);
    });
    rij.parentNode.insertBefore(punten, rij.nextSibling);
    var wacht;
    rij.addEventListener('scroll', function () {
      clearTimeout(wacht);
      wacht = setTimeout(function () {
        var midden = rij.scrollLeft + rij.clientWidth / 2;
        var dichtst = 0;
        var kleinste = Infinity;
        items.forEach(function (item, i) {
          var afstand = Math.abs(item.offsetLeft - rij.offsetLeft + item.offsetWidth / 2 - midden);
          if (afstand < kleinste) { kleinste = afstand; dichtst = i; }
        });
        Array.prototype.forEach.call(punten.children, function (p, i) {
          p.setAttribute('aria-current', i === dichtst ? 'true' : 'false');
        });
      }, 90);
    }, { passive: true });
  });

  /* ----- tellers (cijferband) ----- */
  function telOp(el) {
    var doel = parseFloat(el.dataset.tel.replace(',', '.'));
    var decimalen = (el.dataset.tel.split(',')[1] || '').length;
    var duur = 1500;
    var start = null;
    function stap(t) {
      if (!start) start = t;
      var voortgang = Math.min((t - start) / duur, 1);
      var eased = 1 - Math.pow(1 - voortgang, 3);
      var waarde = (doel * eased).toFixed(decimalen).replace('.', ',');
      el.childNodes[0].nodeValue = waarde;
      if (voortgang < 1) requestAnimationFrame(stap);
    }
    if (verminderd) {
      el.childNodes[0].nodeValue = el.dataset.tel;
    } else {
      requestAnimationFrame(stap);
    }
  }
  var tellers = document.querySelectorAll('[data-tel]');
  if ('IntersectionObserver' in window && tellers.length) {
    var telKijker = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          telOp(item.target);
          telKijker.unobserve(item.target);
        }
      });
    }, { threshold: 0.5 });
    tellers.forEach(function (el) { telKijker.observe(el); });
  } else {
    tellers.forEach(function (el) { el.childNodes[0].nodeValue = el.dataset.tel; });
  }

  /* ----- route: asstreep vult mee met scroll, paaltjes lichten op ----- */
  var route = document.querySelector('.route .stappen');
  var vulling = document.querySelector('.route .asstreep .vulling');
  if (route && vulling) {
    var stappen = route.querySelectorAll('.stap');
    function tekenRoute() {
      var rect = route.getBoundingClientRect();
      var venster = window.innerHeight;
      var voortgang = (venster * 0.75 - rect.top) / rect.height;
      voortgang = Math.max(0, Math.min(1, voortgang));
      vulling.style.scale = '1 ' + voortgang;
      var grens = rect.top + voortgang * rect.height;
      stappen.forEach(function (stap) {
        var sr = stap.getBoundingClientRect();
        stap.classList.toggle('actief', sr.top + 30 <= grens);
      });
    }
    if (verminderd) {
      vulling.style.scale = '1 1';
      stappen.forEach(function (s) { s.classList.add('actief'); });
    } else {
      window.addEventListener('scroll', tekenRoute, { passive: true });
      window.addEventListener('resize', tekenRoute);
      tekenRoute();
    }
  }

  /* ----- hero-auto: subtiele parallax bij scroll ----- */
  var auto = document.querySelector('.held .auto');
  if (auto && !verminderd) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        auto.style.transform = 'translateX(' + y * 0.1 + 'px)';
      }
    }, { passive: true });
  }

  /* ----- mobiele actiebalk: tonen voorbij de hero ----- */
  var balk = document.querySelector('.actiebalk');
  if (balk) {
    function zetBalk() {
      balk.classList.toggle('zicht', window.scrollY > window.innerHeight * 0.55);
    }
    window.addEventListener('scroll', zetBalk, { passive: true });
    zetBalk();
  }

  /* ----- formulier: opent WhatsApp met ingevuld bericht ----- */
  var form = document.getElementById('proefles-formulier');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var naam = (d.get('naam') || '').toString().trim();
      var tel = (d.get('telefoon') || '').toString().trim();
      var bak = d.get('lestype') || 'Schakel';
      var bericht = (d.get('bericht') || '').toString().trim();
      var regels = [
        'Hoi Marco, ik wil graag een proefles aanvragen.',
        'Naam: ' + naam,
        'Telefoon: ' + tel,
        'Lesauto: ' + bak
      ];
      if (bericht) regels.push('Bericht: ' + bericht);
      var url = 'https://wa.me/31622109542?text=' + encodeURIComponent(regels.join('\n'));
      window.open(url, '_blank', 'noopener');
      var melding = document.getElementById('form-melding');
      if (melding) {
        melding.hidden = false;
        melding.textContent = 'WhatsApp opent met je bericht klaar om te versturen. Geen WhatsApp? Bel 06 2210 9542 of mail naar info@marcopas.nl.';
        melding.scrollIntoView({ behavior: verminderd ? 'auto' : 'smooth', block: 'nearest' });
      }
    });
  }
})();
