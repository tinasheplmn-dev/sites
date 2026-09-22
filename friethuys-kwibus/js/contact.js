/* Friethuys Kwibus: contactformulier naar de eigen Mettafel-backend.
   Fail-open: valt de server weg, dan tonen we het telefoonnummer en mailadres. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    naam: 'Fill in your name.',
    email: 'Fill in a valid email address.',
    bericht: 'Write a short message, then we know how to help.',
    mis: function (m) { return 'Sending failed (' + m + '). Try again, or reach us directly on 073 690 80 14 or info@friethuyskwibus.nl.'; },
    bezig: 'Sending...', knop: 'Send your message',
    klaar: function (id) { return 'Your message (' + id + ') has arrived. We’ll reply via the email address or phone number you filled in.'; },
  } : {
    naam: 'Vul je naam in.',
    email: 'Vul een geldig e-mailadres in.',
    bericht: 'Schrijf kort waar het over gaat, dan weten we hoe we je helpen.',
    mis: function (m) { return 'Versturen lukte niet (' + m + '). Probeer het opnieuw, of bereik ons direct op 073 690 80 14 of info@friethuyskwibus.nl.'; },
    bezig: 'Versturen...', knop: 'Verstuur je bericht',
    klaar: function (id) { return 'Je bericht (' + id + ') is binnen. We reageren via het mailadres of nummer dat je invulde.'; },
  };

  var form = document.querySelector('[data-contact-form]');
  if (!form) return;
  var klaarBlok = document.querySelector('[data-contact-klaar]');
  var klaarTekst = document.querySelector('[data-contact-klaar-tekst]');

  function fout(veld, tekst) {
    var el = form.querySelector('[data-fout="' + veld + '"]');
    if (!el) return;
    el.textContent = tekst || '';
    el.hidden = !tekst;
    var invoer = form.querySelector('[name="' + veld + '"]');
    if (invoer) invoer.closest('.veld').classList.toggle('heeft-fout', !!tekst);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['naam', 'email', 'bericht', 'algemeen'].forEach(function (v) { fout(v, ''); });
    var naam = form.naam.value.trim();
    var email = form.email.value.trim();
    var bericht = form.bericht.value.trim();
    var ok = true;
    if (!naam) { fout('naam', T.naam); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fout('email', T.email); ok = false; }
    if (!bericht) { fout('bericht', T.bericht); ok = false; }
    if (!ok) return;

    var knop = form.querySelector('[data-verstuur]');
    knop.disabled = true; knop.textContent = T.bezig;
    try {
      var r = await fetch('/api/aanvraag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: naam,
          email: email,
          telefoon: form.telefoon.value.trim(),
          bericht: bericht,
        }),
      });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');
      form.hidden = true;
      if (klaarBlok) {
        if (klaarTekst) klaarTekst.textContent = T.klaar(j.id);
        klaarBlok.hidden = false;
        klaarBlok.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    } catch (err) {
      fout('algemeen', T.mis(err.message));
      knop.disabled = false; knop.textContent = T.knop;
    }
  });
})();
