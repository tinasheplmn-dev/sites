/* Video's met data-clip: laden en spelen alleen in beeld, altijd zonder geluid.
   Niet bij "minder beweging" of databesparen; dan blijft de poster staan. */
(function () {
  'use strict';
  var clips = document.querySelectorAll('[data-clip]');
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zuinig = navigator.connection && navigator.connection.saveData;
  if (!clips.length || kalm || zuinig || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      var v = it.target;
      if (it.isIntersecting) {
        if (!v.src) v.src = v.getAttribute('data-clip');
        v.muted = true;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (v.src) v.pause();
    });
  }, { rootMargin: '120px 0px', threshold: .2 });
  clips.forEach(function (v) { io.observe(v); });
})();
