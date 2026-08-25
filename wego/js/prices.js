/* =========================================================
   WeGo Academy: alle tarieven op EEN plek.
   Bedrag aanpassen? Wijzig het hieronder en klaar.
   De site vult elke prijs automatisch in via data-prijs.
   Prijzen gelden voor schakel en automaat (zelfde tarief).
   ========================================================= */
const WEGO_PRIJZEN = {
  proefles: '50',
  losse_les: '55',
  cbr_examen: '350',
  pakket_a: '900',
  pakket_a_oud: '955',
  pakket_a_lessen: '10',
  pakket_b: '1.425',
  pakket_b_oud: '1.505',
  pakket_b_lessen: '20',
  pakket_c: '2.499',
  pakket_c_oud: '2.605',
  pakket_c_lessen: '40',
  herexamen_waarde: '275'
};

document.querySelectorAll('[data-prijs]').forEach(function (el) {
  const sleutel = el.getAttribute('data-prijs');
  if (WEGO_PRIJZEN[sleutel] !== undefined) {
    el.textContent = (el.hasAttribute('data-kaal') ? '' : '€') + WEGO_PRIJZEN[sleutel];
  }
});
