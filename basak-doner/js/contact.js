/* Contactformulier: verstuurt naar /api/aanvraag (Mettafel-backend).
   Fail-open: zonder JavaScript blijven adres en telefoonnummer als tekst
   staan, dus niemand staat met lege handen. */
(function () {
  'use strict';
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;
  var klaar = document.querySelector('[data-contact-klaar]');

  function fout(veld, tekst) {
    var el = form.parentElement.querySelector('[data-fout="' + veld + '"]');
    if (!el) return;
    el.textContent = tekst || '';
    el.hidden = !tekst;
    var invoer = form.querySelector('[name="' + veld + '"]');
    if (invoer) invoer.closest('.veld').classList.toggle('heeft-fout', !!tekst);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['naam', 'contactgegeven', 'bericht', 'algemeen'].forEach(function (v) { fout(v, ''); });
    var naam = form.naam.value.trim();
    var contactgegeven = form.contactgegeven.value.trim();
    var bericht = form.bericht.value.trim();
    var ok = true;
    if (!naam) { fout('naam', 'Vul je naam in, dan weten we wie er vraagt.'); ok = false; }
    if (!contactgegeven) { fout('contactgegeven', 'Vul een telefoonnummer of e-mailadres in, anders kunnen we niet antwoorden.'); ok = false; }
    if (!bericht) { fout('bericht', 'Vertel kort waar je vraag over gaat.'); ok = false; }
    if (!ok) return;

    var knop = form.querySelector('[data-verstuur]');
    knop.disabled = true; knop.textContent = 'Versturen...';
    try {
      var r = await fetch('/api/aanvraag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: naam, contactgegeven: contactgegeven, bericht: bericht }),
      });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || '?');
      form.hidden = true;
      if (klaar) klaar.hidden = false;
    } catch (err) {
      fout('algemeen', 'Versturen lukte niet (' + err.message + '). Probeer het opnieuw, of bel 073 623 03 89.');
      knop.disabled = false; knop.textContent = 'Verstuur je vraag';
    }
  });
})();
