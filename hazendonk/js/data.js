/* ============================================================
   DATA · Hazendonk Rijopleidingen
   Nieuwe review, geslaagde of nieuwsbericht toevoegen?
   Voeg één blokje toe aan de juiste lijst hieronder. Klaar.
   ============================================================ */

/* type: 'auto' | 'be' | 'algemeen'
   uitgelicht: true toont de review ook op de homepage */
const REVIEWS = [
  {
    naam: 'Pepijn Moerkerk',
    type: 'auto',
    uitgelicht: true,
    tekst: 'Ik kwam met veel verkeerde informatie en twee keer zakken van een andere rijschool af. Toen ben ik met Marc in contact gekomen en heeft hij mij supergoed geholpen. Ik ben zeer tevreden over de kwaliteit en eerlijkheid van deze rijschool. Er zijn tegenwoordig veel rijscholen die het voor het geld doen en niet voor de persoon zelf, maar dat was hier totaal niet zo.'
  },
  {
    naam: 'Sinane Lazaar',
    type: 'auto',
    uitgelicht: true,
    geslaagd: true,
    tekst: 'Een man die het beste voor je wil. Hij is een lieve man, maar streng op een goede manier. Niet streng op een vervelende manier, maar zodat je de regels goed onthoudt en toepast. Vandaag afgereden en ik ben in één keer geslaagd. Bedankt Marc!!'
  },
  {
    naam: 'Bluedriver A.',
    type: 'auto',
    uitgelicht: true,
    tekst: 'Fijne en leerzame lessen gehad. Marc is erg betrokken en onthoudt de kleine dingen van je, waardoor je geen nummer bent. Duidelijke uitleg en alle ruimte voor vragen. Hij maakt graag extra tijd voor je vrij en denkt met je mee om een leerzame en vlotte opleiding te volgen. Dankjewel Marc!'
  },
  {
    naam: 'Rutger van Doremaele',
    type: 'be',
    geslaagd: true,
    tekst: 'Goede opbouw van lessen, duidelijke uitleg en instructies en goede begeleiding voor en tijdens het examen. Kortom: het lessen bij Marc is heel goed bevallen, met als resultaat dat ik direct de eerste keer geslaagd ben voor mijn BE-rijbewijs.'
  },
  {
    naam: 'Thy Fran',
    type: 'be',
    geslaagd: true,
    tekst: 'Vandaag mijn BE-rijbewijs gehaald bij Marc. Een halve dag prettig gelest met duidelijke uitleg. Het examen was daarna het spreekwoordelijke hoepeltje.'
  },
  {
    naam: 'Dani van der Dussen',
    type: 'be',
    geslaagd: true,
    tekst: 'Van de week mijn BE-rijbewijs gehaald bij Marc en in één keer geslaagd! Een goede ervaring gehad en alles wordt zeker duidelijk uitgelegd.'
  },
  {
    naam: 'Linda Bijnen',
    type: 'be',
    geslaagd: true,
    tekst: 'Fijne aanhangerrijles gehad van Marc. In één keer geslaagd. Hij geeft goede uitleg, is aardig en heeft geduld.'
  },
  {
    naam: 'Maaike',
    type: 'auto',
    tekst: 'Heb fijne lessen gehad bij Marc, goede uitleg en tips om je verder op weg te helpen. Altijd eerlijk en hij legt graag alles uit wanneer je vragen hebt, ook al is het dezelfde vraag meerdere keren. Bedankt Marc voor de fijne lessen!'
  },
  {
    naam: 'Lex Sleutjes',
    type: 'auto',
    tekst: 'Als eigenwijze kerel kon ik het goed vinden met Marc. Ik was het niet altijd eens met bepaalde situaties, maar Marc had altijd zijn antwoord klaar en kon perfect uitleggen waarom iets wel of niet op die manier moest. Bedankt Marc!'
  },
  {
    naam: 'Martijn vL',
    type: 'auto',
    tekst: 'Marc is een erg kundige en fijne instructeur. Hij geeft direct feedback en zorgt ervoor dat je goed klaar bent voor je examen.'
  },
  {
    naam: 'Nienke van M.',
    type: 'auto',
    tekst: 'Door de duidelijke uitleg, goede tips en begeleiding van Marc ging ik met vertrouwen het examen in. De lessen hebben mij goed voorbereid op het behalen van mijn rijbewijs. Prima!'
  },
  {
    naam: 'Tristan',
    type: 'auto',
    tekst: 'De lessen bij Marc zijn duidelijk, leerzaam en ontspannen. Hij legt rustig uit, geeft goede feedback en zorgt ervoor dat je met vertrouwen achter het stuur zit.'
  },
  {
    naam: 'Kane van den Dungen',
    type: 'algemeen',
    tekst: 'Ik heb een goede ervaring gehad bij Marc en alles werd duidelijk uitgelegd. Bedankt voor alles.'
  },
  {
    naam: 'Anoniem',
    type: 'algemeen',
    geslaagd: true,
    tekst: 'Marc is erg betrokken en zorgt ervoor dat je geen nummer bent. Hij neemt de tijd om dingen goed uit te leggen en denkt mee om je zo goed mogelijk voor te bereiden. In één keer geslaagd!'
  },
  {
    naam: 'Anoniem',
    type: 'algemeen',
    tekst: 'Een eerlijke rijschool met persoonlijke aandacht. Marc kijkt echt naar wat jij nodig hebt om beter te worden en niet alleen naar het aantal lessen dat je kunt afnemen.'
  },
  {
    naam: 'Rik Vrijhoeven',
    type: 'algemeen',
    tekst: 'Goede ervaring gehad bij Marc!'
  }
];

/* Geslaagdenmuur: voeg per geslaagde één regel toe.
   foto: pad naar de foto in assets/geslaagden/ (of null voor een naamkaart) */
const GESLAAGDEN = [
  /* Voorbeeld:
  { naam: 'Sanne', plaats: 'Rosmalen', rijbewijs: 'B', foto: 'assets/geslaagden/sanne.jpg' },
  */
];

/* Nieuws en mededelingen: nieuwste bovenaan */
const NIEUWS = [
  /* Voorbeeld:
  { datum: '2026-08-01', titel: 'Nieuwe lesauto', tekst: 'Korte tekst van het bericht.' },
  */
];
