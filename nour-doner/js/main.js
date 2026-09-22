/* Nour Döner: site-eigen laag bovenop motion.js.
   Live openstatus (elke dag 12.45-21.30), de sluitknop van het mobiele
   menu, en de mobiele actiebalk die na de hero verschijnt.
   Alles fail-open: zonder JavaScript staat de vaste openingstijdenregel
   in de chip en is het menu gewoon bereikbaar via de pagina zelf. */

/* Live openstatus: elke dag 12.45-21.30 */
(function () {
  'use strict';
  var OPEN = 12 + 45 / 60, DICHT = 21.5;
  document.querySelectorAll('[data-open-status]').forEach(function (el) {
    var nu = new Date();
    var uur = nu.getHours() + nu.getMinutes() / 60;
    var tekst, kleur;
    if (uur >= OPEN && uur < DICHT) {
      tekst = 'Nu open, tot 21.30 uur'; kleur = 'var(--ok)';
    } else if (uur < OPEN) {
      tekst = 'Vandaag open vanaf 12.45 uur'; kleur = 'var(--ok)';
    } else {
      tekst = 'Gesloten, morgen open 12.45'; kleur = '#c96b4a';
    }
    el.innerHTML = '<span class="stip" aria-hidden="true" style="background:' + kleur + '"></span> ' + tekst;
  });
})();

/* Sluitknop in het mobiele menu (motion.js bindt alleen de eerste menuknop) */
(function () {
  'use strict';
  var menu = document.querySelector('[data-menu]');
  var knop = document.querySelector('[data-menuknop]');
  var sluit = document.querySelector('[data-menu-sluit]');
  if (!menu || !sluit) return;
  sluit.addEventListener('click', function () {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    if (knop) knop.setAttribute('aria-expanded', 'false');
  });
})();

/* Mobiele actiebalk: verschijnt na de hero, verdwijnt bij de footer */
(function () {
  'use strict';
  var balk = document.querySelector('[data-actiebalk]');
  if (!balk) return;
  var hero = document.querySelector('[data-hero]') || document.querySelector('.paginakop');
  var voet = document.querySelector('footer');
  function toets() {
    var naHero = !hero || hero.getBoundingClientRect().bottom < 0;
    var bijVoet = voet && voet.getBoundingClientRect().top < window.innerHeight;
    balk.classList.toggle('zichtbaar', naHero && !bijVoet);
  }
  window.addEventListener('scroll', toets, { passive: true });
  window.addEventListener('resize', toets);
  toets();
})();

/* Contactformulier: stuurt naar de eigen backend (powered by Mettafel) */
(function () {
  'use strict';
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var foutEl = form.querySelector('[data-contact-fout]');
    var klaarEl = form.querySelector('[data-contact-klaar]');
    foutEl.hidden = true;
    var naam = form.naam.value.trim();
    var bereikbaar = form.bereikbaar.value.trim();
    var bericht = form.bericht.value.trim();
    if (!naam || !bereikbaar || !bericht) {
      foutEl.textContent = 'Vul je naam, een e-mailadres of telefoonnummer en je bericht in.';
      foutEl.hidden = false;
      return;
    }
    var knop = form.querySelector('[type="submit"]');
    knop.disabled = true;
    try {
      var r = await fetch('/api/aanvraag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: naam, bereikbaar: bereikbaar, bericht: bericht }),
      });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');
      klaarEl.hidden = false;
      form.naam.value = ''; form.bereikbaar.value = ''; form.bericht.value = '';
    } catch (err) {
      foutEl.textContent = 'Versturen lukte niet. Probeer het nog eens, of mail ons op nourdoner073@gmail.com.';
      foutEl.hidden = false;
    }
    knop.disabled = false;
  });
})();

/* Menukaart: op mobiel klappen de categorieën dicht (fail-open: in de
   HTML staan ze open, dus zonder JavaScript is alles zichtbaar) */
(function () {
  'use strict';
  if (!window.matchMedia('(max-width: 860px)').matches) return;
  document.querySelectorAll('.menu-categorie[data-vouw]').forEach(function (d, i) {
    d.open = i === 0;
  });
})();
