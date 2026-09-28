/* That's Focaccia: contact- en cateringaanvragen, powered by Mettafel.
   Elk formulier met [data-aanvraag] post naar /api/aanvraag en toont de
   bevestiging in de plaats van het formulier. Fail-open: zonder JavaScript
   staat het mailadres er als gewone link. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';

  document.querySelectorAll('form[data-aanvraag]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var foutEl = form.querySelector('[data-formulier-fout]');
      if (foutEl) foutEl.hidden = true;

      var naam = form.naam.value.trim();
      var email = form.email.value.trim();
      var bericht = form.bericht.value.trim();
      var ok = true;
      function fout(veld, tekst) {
        var el = form.querySelector('[data-fout="' + veld + '"]');
        if (!el) return;
        el.textContent = tekst || '';
        el.hidden = !tekst;
        var invoer = form.querySelector('[name="' + veld + '"]');
        if (invoer) invoer.closest('.veld').classList.toggle('heeft-fout', !!tekst);
      }
      fout('naam', ''); fout('email', ''); fout('bericht', '');
      if (!naam) { fout('naam', EN ? 'Fill in your name.' : 'Vul je naam in.'); ok = false; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { fout('email', EN ? 'Fill in an email address we can reply to.' : 'Vul een e-mailadres in waarop we kunnen antwoorden.'); ok = false; }
      if (!bericht) { fout('bericht', EN ? 'Tell us what you have in mind.' : 'Vertel kort wat je in gedachten hebt.'); ok = false; }
      if (!ok) return;

      var knop = form.querySelector('[type="submit"]');
      knop.disabled = true;
      knop.textContent = EN ? 'Sending...' : 'Versturen...';
      try {
        var r = await fetch('/api/aanvraag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            naam: naam,
            email: email,
            telefoon: form.telefoon ? form.telefoon.value.trim() : '',
            onderwerp: form.getAttribute('data-aanvraag'),
            bericht: bericht,
          }),
        });
        var j = await r.json();
        if (!j.ok) throw new Error(j.fout || '?');
        var klaar = document.createElement('p');
        klaar.className = 'kop-intro';
        klaar.style.fontWeight = '700';
        klaar.textContent = EN
          ? 'Grazie ' + naam + '! Your message (' + j.id + ') has arrived. Valentina or Alessia will reply by email within one working day.'
          : 'Grazie ' + naam + '! Je bericht (' + j.id + ') is binnen. Valentina of Alessia antwoordt je binnen één werkdag per mail.';
        form.replaceWith(klaar);
      } catch (err) {
        if (foutEl) {
          foutEl.textContent = (EN
            ? 'Sending failed (' + err.message + '). Please try again, or email hello@thatsfocaccia.nl.'
            : 'Versturen lukte niet (' + err.message + '). Probeer het opnieuw, of mail naar hello@thatsfocaccia.nl.');
          foutEl.hidden = false;
        }
        knop.disabled = false;
        knop.textContent = EN ? 'Send message' : 'Verstuur bericht';
      }
    });
  });
})();
