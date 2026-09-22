/* Contact- en arrangementenformulier -> /api/aanvraag (Mettafel-backend).
   Fail-open: zonder JavaScript staan het adres en e-mailadres er gewoon. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    naam: 'Fill in your name.',
    bericht: 'Tell us briefly what your question or request is.',
    fout: function (m) { return 'Sending failed (' + m + '). Please try again or email info@restaurant-rhodos.com.'; },
    bezig: 'Sending...',
  } : {
    naam: 'Vul je naam in.',
    bericht: 'Vertel kort wat je vraag of aanvraag is.',
    fout: function (m) { return 'Versturen lukte niet (' + m + '). Probeer het opnieuw of mail naar info@restaurant-rhodos.com.'; },
    bezig: 'Versturen...',
  };

  document.querySelectorAll('form[data-aanvraag]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var naam = (form.querySelector('[name="naam"]') || {}).value || '';
      var berichtVeld = form.querySelector('[name="bericht"]');
      var bericht = berichtVeld ? berichtVeld.value.trim() : '';
      var toonFout = function (veld, tekst) {
        var el = form.querySelector('[data-fout="' + veld + '"]');
        if (el) { el.textContent = tekst || ''; el.hidden = !tekst; }
      };
      toonFout('naam', naam.trim() ? '' : T.naam);
      toonFout('bericht', bericht ? '' : T.bericht);
      toonFout('algemeen', '');
      if (!naam.trim() || !bericht) return;

      /* alle extra velden netjes in het bericht meesturen */
      var extras = [];
      form.querySelectorAll('input[name], select[name]').forEach(function (v) {
        if (v.name !== 'naam' && v.value.trim()) extras.push(v.name + ': ' + v.value.trim());
      });
      var data = {
        naam: naam.trim(),
        bericht: (form.getAttribute('data-aanvraag') !== 'contact' ? '[' + form.getAttribute('data-aanvraag') + '] ' : '') +
          bericht + (extras.length ? '\n' + extras.join('\n') : ''),
      };
      var knop = form.querySelector('[type="submit"]');
      var oud = knop ? knop.textContent : '';
      if (knop) { knop.disabled = true; knop.textContent = T.bezig; }
      fetch('/api/aanvraag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function () {
        form.hidden = true;
        var klaar = document.querySelector('[data-aanvraag-klaar]');
        if (klaar) klaar.hidden = false;
      }).catch(function (err) {
        toonFout('algemeen', T.fout(err.message || 'onbekend'));
      }).finally(function () {
        if (knop) { knop.disabled = false; knop.textContent = oud; }
      });
    });
  });
})();
