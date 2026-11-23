/* Nikko Sports: site-eigen gedrag bovenop motion.js en shop.js
   (zoeken, menu, hero-collecties, openstatus, chatwidget). Alles fail-open. */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- zoeken ---------- */
  var zoek = document.querySelector('[data-zoek]');
  var zoekKnop = document.querySelector('[data-zoekknop]');
  if (zoek && zoekKnop) {
    var zetZoek = function (open) {
      zoek.classList.toggle('open', open);
      zoekKnop.setAttribute('aria-expanded', String(open));
      if (open) setTimeout(function () { zoek.querySelector('input').focus(); }, 120);
    };
    zoekKnop.addEventListener('click', function () { zetZoek(!zoek.classList.contains('open')); });
    var zs = zoek.querySelector('[data-zoeksluit]');
    if (zs) zs.addEventListener('click', function () { zetZoek(false); zoekKnop.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zetZoek(false); });
    document.addEventListener('click', function (e) { if (zoek.classList.contains('open') && !zoek.contains(e.target) && !zoekKnop.contains(e.target)) zetZoek(false); });
  }

  /* ---------- mobiel menu: sluitknop (openen zit in motion.js) ---------- */
  var menuSluit = document.querySelector('[data-menusluit]');
  var menuKnop = document.querySelector('[data-menuknop]');
  if (menuSluit && menuKnop) menuSluit.addEventListener('click', function () { menuKnop.click(); menuKnop.focus(); });

  /* ---------- hero: label en stippen volgen de collectie ---------- */
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var dias = hero.querySelectorAll('[data-hero-dia]');
    var label = hero.querySelector('[data-herolabel]');
    var stippen = hero.querySelectorAll('[data-dia]');
    var teksten = [['Black Edition', 'Handschoenen, broek en scheenbeschermers'], ['White Edition', 'De set van Nieky Holzken'], ['Women', 'Dezelfde kwaliteit, eigen collectie']];
    var zet = function (i) {
      dias.forEach(function (d, j) { d.classList.toggle('aan', j === i); });
      stippen.forEach(function (s, j) { s.setAttribute('aria-current', String(j === i)); });
      if (label && !kalm) {
        var ed = label.querySelector('.ed');
        ed.style.opacity = '0'; ed.style.transform = 'translateY(8px)';
        setTimeout(function () {
          label.querySelector('.ed').textContent = teksten[i][0];
          label.querySelector('.ed-sub').textContent = teksten[i][1];
          ed.style.opacity = '1'; ed.style.transform = 'none';
        }, 260);
      } else if (label) {
        label.querySelector('.ed').textContent = teksten[i][0];
        label.querySelector('.ed-sub').textContent = teksten[i][1];
      }
    };
    hero.addEventListener('dia', function (e) { zet(e.detail); });
    stippen.forEach(function (s) { s.addEventListener('click', function () { zet(Number(s.dataset.dia)); }); });
  }

  /* ---------- openstatus van de winkel ---------- */
  var tijden = { 1: [13, 18], 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 18], 6: [10, 17] };
  var dagen = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  document.querySelectorAll('[data-openstatus]').forEach(function (el) {
    var nu = new Date(); var d = nu.getDay(); var u = nu.getHours() + nu.getMinutes() / 60;
    var tekst = el.querySelector('span:last-child');
    var t = tijden[d];
    if (t && u >= t[0] && u < t[1]) { tekst.textContent = 'Nu open, tot ' + t[1] + '.00 uur'; el.classList.remove('dicht'); return; }
    el.classList.add('dicht');
    if (t && u < t[0]) { tekst.textContent = 'Vandaag open vanaf ' + t[0] + '.00 uur'; return; }
    for (var i = 1; i <= 7; i++) { var nd = (d + i) % 7; if (tijden[nd]) { tekst.textContent = 'Nu gesloten, ' + (i === 1 ? 'morgen' : dagen[nd]) + ' open vanaf ' + tijden[nd][0] + '.00 uur'; return; } }
  });

  /* ---------- chatwidget: beantwoordt de veelgestelde vragen, verwijst daarna door ---------- */
  var chat = document.querySelector('[data-chat]');
  if (chat) {
    var paneel = chat.querySelector('.chat-paneel');
    var knop = chat.querySelector('[data-chatknop]');
    var lijst = chat.querySelector('[data-chatberichten]');
    var form = chat.querySelector('[data-chatform]');
    var invoer = form.querySelector('input');
    var WA = 'https://api.whatsapp.com/send?phone=31402111222&text=';
    var ANTW = {
      maat: 'Handschoenen kies je op gewicht in ounces (oz): hoe zwaarder, hoe meer demping. Voor sparren kies je doorgaans zwaarder dan voor zak- en padwerk. Scheenbeschermers en kleding gaan op lengte. Stuur ons je lengte, gewicht en waarvoor je traint via <a href="' + WA + encodeURIComponent('Hallo! Welke maat raden jullie aan? Ik ben ... cm, weeg ... kg en train voor ...') + '" target="_blank" rel="noopener">WhatsApp</a>, dan krijg je persoonlijk advies. Verkeerd gekozen? Ruilen is geen probleem.',
      verzenden: 'Bestel je op een werkdag voor 16.00 uur, dan gaat je pakket dezelfde dag weg met PostNL. In Nederland heb je het meestal in 1 tot 2 werkdagen. Vanaf € 100 is bezorging gratis. Bokszakken en artikelen zwaarder dan 20 kg gaan via groot transport: 3 tot 5 werkdagen.',
      retour: 'Ja. Je hebt 14 dagen bedenktijd. Andere maat nodig? Bel 040 211 1222 of mail <a href="mailto:info@nikko.nl">info@nikko.nl</a>, dan regelen we de ruil direct. Op Nikko-handschoenen en scheenbeschermers zit bovendien 3 maanden fabrieksgarantie. <a href="klantenservice.html#retour">Zo werkt retourneren</a>.',
      winkel: 'Onze winkel zit aan de Geldropseweg 61 in Eindhoven. Open op maandag van 13.00 tot 18.00, dinsdag tot en met vrijdag van 10.00 tot 18.00 en zaterdag van 10.00 tot 17.00. Online besteld? Afhalen is gratis. <a href="contact.html">Route en contact</a>.',
      zakelijk: 'Sportscholen, winkels en trainers kopen bij ons in tegen gereduceerde prijs, tot 40% voordeel, en kunnen hun eigen logo op shirts, bokszakken en pads laten zetten. <a href="zakelijk.html">Vraag een zakelijk account aan</a>, dan hoor je binnen twee werkdagen van ons.',
      betalen: 'Je betaalt met iDEAL, PayPal, creditcard, Bancontact, Giropay of overboeking. Haal je af in Eindhoven, dan kan het ook contant of met pin in de winkel.',
      bestelling: 'In je verzendbevestiging staat het PostNL-verzendnummer, daarmee volg je je pakket. Geen bevestiging gezien? Kijk in je spam of bel 040 211 1222.',
      garantie: 'Op Nikko-handschoenen en scheenbeschermers zit 3 maanden fabrieksgarantie. Mail een foto naar <a href="mailto:info@nikko.nl">info@nikko.nl</a>, dan lossen we het op.',
      kids: 'Voor kinderen hebben we bokshandschoenen, scheenbeschermers, kickboksbroekjes en bitjes in kindermaten, van dezelfde kwaliteit als de grote collectie. <a href="kids.html">Bekijk de kids-collectie</a>.',
      hallo: 'Hoi! Stel je vraag over maten, verzending, ruilen of de winkel, of kies een onderwerp hieronder.',
    };
    var TREF = [
      ['maat', /maat|oz|ounce|gewicht|lengte|size|groot|klein|past/i],
      ['verzenden', /verzend|lever|bezorg|wanneer|in huis|postnl|snel|morgen|vandaag|gratis/i],
      ['retour', /retour|ruil|terug|omruil|bedenk|verkeerd/i],
      ['betalen', /betaal|ideal|paypal|creditcard|bancontact|pin/i],
      ['bestelling', /bestelling|track|waar is|volgen|pakket/i],
      ['garantie', /garantie|kapot|stuk|defect|klacht/i],
      ['winkel', /winkel|eindhoven|adres|open|afhalen|langskomen|route/i],
      ['zakelijk', /sportschool|gym|zakelijk|reseller|groothandel|logo|bulk|inkoop/i],
      ['kids', /kind|kids|jeugd|zoon|dochter|jaar/i],
      ['hallo', /^(hoi|hallo|hey|hi|goedemiddag|goedemorgen)/i],
    ];
    var typTimer;
    function bel(html, ik) {
      var p = document.createElement('p');
      p.className = 'bel ' + (ik ? 'bel-ik' : 'bel-zij');
      if (ik) p.textContent = html; else p.innerHTML = html;
      lijst.appendChild(p);
      lijst.scrollTop = lijst.scrollHeight;
    }
    function antwoord(sleutel) {
      var tekst = ANTW[sleutel];
      var wacht = document.createElement('p'); wacht.className = 'bel bel-zij'; wacht.textContent = '...'; lijst.appendChild(wacht); lijst.scrollTop = lijst.scrollHeight;
      clearTimeout(typTimer);
      typTimer = setTimeout(function () {
        wacht.remove();
        if (tekst) bel(tekst);
        else bel('Daar wil ik niets verkeerds over zeggen. Stuur je vraag via <a href="' + WA + encodeURIComponent('Hallo! Ik heb een vraag: ') + '" target="_blank" rel="noopener">WhatsApp</a> of bel 040 211 1222, dan helpt iemand van de winkel je persoonlijk. Op werkdagen reageren we snel.');
      }, kalm ? 0 : 650);
    }
    function open(o) {
      paneel.hidden = !o;
      knop.setAttribute('aria-expanded', String(o));
      if (o) invoer.focus();
    }
    knop.addEventListener('click', function () { open(paneel.hidden); });
    chat.querySelector('[data-chatsluit]').addEventListener('click', function () { open(false); knop.focus(); });
    chat.querySelectorAll('[data-antwoord]').forEach(function (b) {
      b.addEventListener('click', function () { bel(b.textContent, true); antwoord(b.dataset.antwoord); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = invoer.value.trim(); if (!v) return;
      bel(v, true); invoer.value = '';
      var hit = TREF.find(function (t) { return t[1].test(v); });
      antwoord(hit ? hit[0] : null);
    });
    document.addEventListener('chat:open', function (e) { open(true); if (e.detail) { bel(chat.querySelector('[data-antwoord="' + e.detail + '"]').textContent, true); antwoord(e.detail); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !paneel.hidden) open(false); });
  }
})();
