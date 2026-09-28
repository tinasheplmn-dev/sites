/* Bolwerk: groeps- en contactformulier naar de eigen Mettafel-backend. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    verplicht: 'Fill in your name, phone number, type of event and number of guests.',
    contactVerplicht: 'Fill in at least your name and your message.',
    misluk: function (m) { return 'Sending failed (' + m + '). Please try again in a moment.'; },
    groepKlaar: function (naam) { return 'Thank you ' + naam + '! Robbert or Maaike will call or email you within two working days with a proposal.'; },
    contactKlaar: function (naam) { return 'Thank you ' + naam + '! We will get back to you within one working day.'; },
    nummer: 'Request ',
    versturen: 'Sending...',
  } : {
    verplicht: 'Vul in elk geval je naam, telefoonnummer, het soort feest en het aantal gasten in.',
    contactVerplicht: 'Vul in elk geval je naam en je bericht in.',
    misluk: function (m) { return 'Versturen lukte niet (' + m + '). Probeer het zo nog eens.'; },
    groepKlaar: function (naam) { return 'Dank je wel ' + naam + '! Robbert of Maaike belt of mailt je binnen twee werkdagen met een voorstel.'; },
    contactKlaar: function (naam) { return 'Dank je wel ' + naam + '! We komen er binnen een werkdag bij je op terug.'; },
    nummer: 'Aanvraag ',
    versturen: 'Versturen...',
  };

  function koppel(form, api, verplicht, klaarTekst) {
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var foutEl = form.querySelector('[data-fout]');
      foutEl.hidden = true;
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      var mist = verplicht.filter(function (v) { return !data[v]; });
      if (mist.length) {
        foutEl.textContent = api === 'groepsaanvraag' ? T.verplicht : T.contactVerplicht;
        foutEl.hidden = false;
        return;
      }
      var knop = form.querySelector('button[type="submit"]');
      var oud = knop.textContent;
      knop.disabled = true; knop.textContent = T.versturen;
      try {
        var r = await fetch('/api/' + api, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        var j = await r.json();
        if (!j.ok) throw new Error(j.fout || '?');
        var klaar = form.querySelector('[data-klaar]');
        form.querySelectorAll('label, .rij-2, button[type="submit"], .navertel').forEach(function (el) { el.hidden = true; });
        klaar.querySelector('[data-nummer]').textContent = T.nummer + j.id;
        klaar.querySelector('[data-tekst]').textContent = klaarTekst(data.naam);
        klaar.hidden = false;
        klaar.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } catch (err) {
        foutEl.textContent = T.misluk(err.message);
        foutEl.hidden = false;
        knop.disabled = false; knop.textContent = oud;
      }
    });
  }

  koppel(document.querySelector('[data-groepsformulier]'), 'groepsaanvraag', ['naam', 'telefoon', 'soort', 'personen'], T.groepKlaar);
  koppel(document.querySelector('[data-contactformulier]'), 'aanvraag', ['naam', 'bericht'], T.contactKlaar);
})();
