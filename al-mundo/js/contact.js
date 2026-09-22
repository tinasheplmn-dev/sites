/* Al Mundo: contactformulier, powered by Mettafel.
   Post naar /api/aanvraag; fail-open met duidelijke foutmelding. */
(function () {
  'use strict';
  var form = document.querySelector('[data-contactform]');
  if (!form) return;
  var EN = document.documentElement.lang === 'en';
  function fout(tekst) {
    var el = form.querySelector('[data-fout="algemeen"]');
    el.textContent = tekst || '';
    el.hidden = !tekst;
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    fout('');
    var naam = form.naam.value.trim();
    var bericht = form.bericht.value.trim();
    if (!naam) return fout(EN ? 'Fill in your name.' : 'Vul je naam in.');
    if (!bericht) return fout(EN ? 'Write a short message, so we know how we can help.' : 'Schrijf kort waarmee we je kunnen helpen.');
    var knop = form.querySelector('[type="submit"]');
    knop.disabled = true;
    knop.textContent = EN ? 'Sending...' : 'Versturen...';
    try {
      var r = await fetch('/api/aanvraag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: naam,
          telefoon: form.telefoon.value.trim(),
          email: form.email.value.trim(),
          bericht: bericht,
        }),
      });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');
      form.hidden = true;
      var klaar = document.querySelector('[data-contact-klaar]');
      klaar.hidden = false;
      klaar.querySelector('[data-nummer]').textContent = (EN ? 'Message ' : 'Bericht ') + j.id;
    } catch (err) {
      fout(EN
        ? 'Sending failed (' + err.message + '). Please try again, or call us on 073 610 0564.'
        : 'Versturen lukte niet (' + err.message + '). Probeer het opnieuw, of bel ons op 073 610 0564.');
      knop.disabled = false;
      knop.textContent = EN ? 'Send message' : 'Verstuur bericht';
    }
  });
})();
