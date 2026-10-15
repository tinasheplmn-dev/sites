/* Site-eigen gedrag: WhatsApp-kaartje, reels, proefles-formulier. Alles fail-open. */
(function () {
  'use strict';

  /* WhatsApp-kaartje rechtsonder (desktop) */
  var waKnop = document.querySelector('[data-wa-knop]');
  var waKaart = document.querySelector('[data-wa-kaart]');
  if (waKnop && waKaart) {
    var zet = function (open) {
      waKaart.hidden = !open;
      waKnop.setAttribute('aria-expanded', String(open));
    };
    waKnop.addEventListener('click', function () { zet(waKaart.hidden); });
    var sluit = waKaart.querySelector('[data-wa-sluit]');
    if (sluit) sluit.addEventListener('click', function () { zet(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zet(false); });
  }

  /* Reels: klik op de poster speelt met geluid; één tegelijk */
  var reels = [].slice.call(document.querySelectorAll('[data-reel]'));
  reels.forEach(function (reel) {
    var video = reel.querySelector('video');
    var knop = reel.querySelector('[data-afspeel]');
    var stop = reel.querySelector('[data-stop]');
    if (!video || !knop) return;
    var start = function () {
      reels.forEach(function (ander) {
        if (ander === reel) return;
        var v = ander.querySelector('video');
        if (v && !v.paused) { v.pause(); ander.classList.remove('speelt'); }
      });
      video.muted = false;
      video.currentTime = 0;
      var p = video.play();
      reel.classList.add('speelt');
      if (p && p.catch) p.catch(function () { reel.classList.remove('speelt'); });
    };
    var pauze = function () { video.pause(); reel.classList.remove('speelt'); };
    knop.addEventListener('click', start);
    if (stop) stop.addEventListener('click', pauze);
    video.addEventListener('click', pauze);
    video.addEventListener('ended', function () { reel.classList.remove('speelt'); });
  });

  /* Proefles-formulier: bouwt een WhatsApp-bericht (of e-mail) met alles ingevuld */
  var form = document.querySelector('[data-proefles]');
  if (form) {
    var nummer = '31631783223';
    var toon = function (veld, mis) { veld.closest('.veld').classList.toggle('mis', mis); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var velden = {
        kind: form.querySelector('[name="kind"]'),
        jaar: form.querySelector('[name="jaar"]'),
        ouder: form.querySelector('[name="ouder"]'),
        tel: form.querySelector('[name="tel"]')
      };
      var ok = true;
      Object.keys(velden).forEach(function (k) {
        var v = velden[k];
        var leeg = !v.value.trim();
        toon(v, leeg);
        if (leeg) ok = false;
      });
      if (!ok) { form.querySelector('.veld.mis input').focus(); return; }
      var club = form.querySelector('[name="club"]').value.trim();
      var soort = (form.querySelector('[name="soort"]:checked') || {}).value || 'groepstraining';
      var locatie = (form.querySelector('[name="locatie"]:checked') || {}).value || 'geen voorkeur';
      var opm = form.querySelector('[name="opmerking"]').value.trim();
      var regels = [
        'Hoi Jordy, ik wil graag een gratis proefles aanvragen.',
        'Naam speler: ' + velden.kind.value.trim(),
        'Geboortejaar: ' + velden.jaar.value.trim(),
        'Soort training: ' + soort,
        'Voorkeur locatie: ' + locatie,
        'Speelt nu bij: ' + (club || 'geen club'),
        'Ouder/verzorger: ' + velden.ouder.value.trim(),
        'Telefoon: ' + velden.tel.value.trim()
      ];
      if (opm) regels.push('Opmerking: ' + opm);
      var tekst = regels.join('\n');
      var kanaal = (form.querySelector('[name="kanaal"]:checked') || {}).value || 'whatsapp';
      var url = kanaal === 'mail'
        ? 'mailto:info@jordythomassenvt.nl?subject=' + encodeURIComponent('Aanvraag gratis proefles: ' + velden.kind.value.trim()) + '&body=' + encodeURIComponent(tekst)
        : 'https://wa.me/' + nummer + '?text=' + encodeURIComponent(tekst);
      window.open(url, kanaal === 'mail' ? '_self' : '_blank', 'noopener');
      form.hidden = true;
      var klaar = document.querySelector('[data-proefles-klaar]');
      if (klaar) { klaar.hidden = false; klaar.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
    form.querySelectorAll('input').forEach(function (i) {
      i.addEventListener('input', function () { toon(i, false); });
    });
  }
})();
