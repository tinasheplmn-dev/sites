/* Own online ordering for a one-page site, powered by Mettafel.
   Engine only: every site styles it in its own skin via the .od-* classes.
   - Reads window.SHOP (settings) and window.MENU (categories with items).
   - Hooks into any layout through data attributes:
       [data-add="itemId"]     add-to-basket button on a menu item
       [data-open-cart]        opens the basket drawer
       [data-open-status]      gets the live "Open now until ..." text
       [data-open-dot]         gets class .is-open / .is-closed
   - Collection or delivery, time slots inside the real opening hours,
     details remembered on this device, "order again" in one tap.
   - Fail-open: without JavaScript the menu stays readable and the phone
     number stays visible. Demo agreement: no online payment, pay on
     collection or at the door. */
(function () {
  'use strict';

  var SHOP = window.SHOP || {};
  var MENU = window.MENU || [];
  var KEY = SHOP.key || 'shop';
  var ITEMS = {};
  MENU.forEach(function (c) { c.items.forEach(function (i) { i.cat = c.id; ITEMS[i.id] = i; }); });

  var T = Object.assign({
    basket: 'Your order',
    empty: 'Nothing here yet. Tap + on anything you fancy.',
    total: 'Total',
    checkout: 'Continue',
    back: 'Back to your order',
    place: 'Place order',
    sending: 'Sending...',
    collection: 'Collection',
    delivery: 'Delivery',
    when: 'When',
    asap: 'As soon as possible',
    today: 'Today',
    name: 'Your name',
    phone: 'Phone number',
    address: 'Street and house number',
    postcode: 'Postcode',
    note: 'Anything we should know? (optional)',
    notePh: 'Allergies, extra sauce, door bell...',
    remember: 'Remember my details on this device',
    nameErr: 'Add your name so we know who the order is for.',
    phoneErr: 'Add a UK phone number we can reach you on.',
    addressErr: 'Add your street and house number.',
    postcodeErr: 'Add a full UK postcode, for example E14 7PG.',
    emptyErr: 'Your order is still empty.',
    closedErr: 'We are closed for the next few days. Please call us instead.',
    sendErr: function (m) { return 'That did not go through (' + m + '). Try again in a moment, or give us a ring.'; },
    thanks: 'Thank you',
    confirmCollect: function (n, tot, when) { return 'We are on it. Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') will be ready ' + when + ' at ' + SHOP.address + '. You pay when you collect.'; },
    confirmDeliver: function (n, tot, when) { return 'We are on it. Your order (' + n + (n === 1 ? ' item' : ' items') + ', ' + tot + ') is coming ' + when + '. We will call you to confirm the delivery fee; you pay at the door.'; },
    view: function (n, tot) { return 'View order (' + n + ') · ' + tot; },
    hi: function (n) { return 'Welcome back, ' + n; },
    again: function (n, tot) { return 'Order again: ' + n + ' items · ' + tot; },
    forget: 'forget me',
    close: 'Close',
    add: 'Add',
    openUntil: function (t) { return 'Open now until ' + t; },
    opensAt: function (d, t) { return 'Closed now · opens ' + d + ' at ' + t; },
    closedToday: 'Closed today',
    tomorrow: 'tomorrow',
    newOrder: 'Start a new order',
  }, SHOP.text || {});

  /* ---------- helpers ---------- */
  var gbp = function (n) { return '£' + n.toFixed(2); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function save(k, v) { try { localStorage.setItem(KEY + '-' + k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { return JSON.parse(localStorage.getItem(KEY + '-' + k) || 'null'); } catch (e) { return null; } }
  function drop(k) { try { localStorage.removeItem(KEY + '-' + k); } catch (e) {} }
  function hhmm(h) {
    var hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  /* ---------- opening hours: SHOP.hours[weekday] = [from, to] in hours (20.5 = 20:30, 26 = 02:00 next day) ---------- */
  function hoursFor(day) { return (SHOP.hours || {})[day] || null; }
  function windows(daysAhead) {
    var now = new Date(), list = [];
    for (var d = -1; d <= daysAhead; d++) {
      var day = new Date(now); day.setDate(now.getDate() + d); day.setHours(0, 0, 0, 0);
      var h = hoursFor(day.getDay());
      if (!h) continue;
      var from = new Date(day.getTime() + h[0] * 3600000);
      var to = new Date(day.getTime() + h[1] * 3600000);
      if (to > now) list.push({ from: from, to: to, day: day });
    }
    return list;
  }
  function openStatus() {
    var now = new Date();
    var w = windows(7);
    for (var i = 0; i < w.length; i++) {
      if (now >= w[i].from && now < w[i].to) return { open: true, text: T.openUntil(hhmm((w[i].to - w[i].day) / 3600000)) };
    }
    var next = w.filter(function (x) { return x.from > now; })[0];
    if (!next) return { open: false, text: T.closedToday };
    var sameDay = next.from.toDateString() === now.toDateString();
    var tom = new Date(now); tom.setDate(now.getDate() + 1);
    var dayName = sameDay ? T.today.toLowerCase() : (next.from.toDateString() === tom.toDateString() ? T.tomorrow : next.from.toLocaleDateString('en-GB', { weekday: 'long' }));
    return { open: false, text: T.opensAt(dayName, hhmm(next.from.getHours() + next.from.getMinutes() / 60)) };
  }
  function paintStatus() {
    var s = openStatus();
    document.querySelectorAll('[data-open-status]').forEach(function (el) { el.textContent = s.text; });
    document.querySelectorAll('[data-open-dot]').forEach(function (el) { el.classList.toggle('is-open', s.open); el.classList.toggle('is-closed', !s.open); });
  }
  paintStatus();
  setInterval(paintStatus, 60000);
  window.ODStatus = openStatus;

  if (!MENU.length) return;

  /* ---------- basket: key -> {id, variant, qty} ---------- */
  var basket = {};
  (load('basket') || []).forEach(function (l) {
    if (ITEMS[l.id]) basket[l.id + '|' + (l.v || '')] = { id: l.id, v: l.v || '', p: l.p, qty: Math.min(20, l.qty | 0) };
  });
  function lineName(l) { return ITEMS[l.id].name + (l.v ? ' (' + l.v + ')' : ''); }
  function linePrice(l) { return typeof l.p === 'number' ? l.p : ITEMS[l.id].price; }
  function lines() { return Object.keys(basket).map(function (k) { return basket[k]; }); }
  function count() { return lines().reduce(function (s, l) { return s + l.qty; }, 0); }
  function sum() { return lines().reduce(function (s, l) { return s + l.qty * linePrice(l); }, 0); }
  function persist() { save('basket', lines().map(function (l) { return { id: l.id, v: l.v, p: l.p, qty: l.qty }; })); }
  function addLine(id, v, p) {
    var k = id + '|' + (v || '');
    if (!basket[k]) basket[k] = { id: id, v: v || '', p: typeof p === 'number' ? p : ITEMS[id].price, qty: 0 };
    basket[k].qty = Math.min(20, basket[k].qty + 1);
    persist(); render();
  }

  /* ---------- drawer markup ---------- */
  var root = document.createElement('div');
  root.className = 'od';
  root.innerHTML =
    '<button type="button" class="od-bar" data-od-bar hidden><span class="od-bar-icon" aria-hidden="true"></span><span data-od-bar-text></span></button>' +
    '<div class="od-scrim" data-od-scrim hidden></div>' +
    '<aside class="od-drawer" role="dialog" aria-modal="true" aria-labelledby="od-title" data-od-drawer hidden tabindex="-1">' +
      '<header class="od-head"><h2 id="od-title" class="od-title">' + T.basket + '</h2><button type="button" class="od-x" data-od-close aria-label="' + T.close + '"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></header>' +
      '<div class="od-body">' +
        /* step 1 */
        '<section data-od-step="basket">' +
          '<div class="od-account" data-od-account></div>' +
          '<div class="od-lines" data-od-lines></div>' +
          '<div class="od-total" data-od-totalrow hidden><span>' + T.total + '</span><strong data-od-total></strong></div>' +
          '<button type="button" class="od-cta" data-od-next disabled>' + T.checkout + '</button>' +
        '</section>' +
        /* step 2 */
        '<form data-od-step="details" hidden novalidate>' +
          '<div class="od-method" role="radiogroup" aria-label="' + T.collection + ' / ' + T.delivery + '">' +
            '<label class="od-pill"><input type="radio" name="method" value="collection" checked><span>' + T.collection + '</span></label>' +
            '<label class="od-pill"><input type="radio" name="method" value="delivery"><span>' + T.delivery + '</span></label>' +
          '</div>' +
          '<p class="od-note" data-od-method-note>' + esc(SHOP.collectionNote || '') + '</p>' +
          '<label class="od-field">' + T.when + '<select name="when" data-od-when></select></label>' +
          '<label class="od-field">' + T.name + '<input name="name" autocomplete="name" required></label>' +
          '<p class="od-err" data-od-err="name" hidden></p>' +
          '<label class="od-field">' + T.phone + '<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label>' +
          '<p class="od-err" data-od-err="phone" hidden></p>' +
          '<div data-od-delivery hidden>' +
            '<label class="od-field">' + T.address + '<input name="address" autocomplete="street-address"></label>' +
            '<p class="od-err" data-od-err="address" hidden></p>' +
            '<label class="od-field">' + T.postcode + '<input name="postcode" autocomplete="postal-code" autocapitalize="characters"></label>' +
            '<p class="od-err" data-od-err="postcode" hidden></p>' +
          '</div>' +
          '<label class="od-field">' + T.note + '<textarea name="note" rows="2" placeholder="' + T.notePh + '"></textarea></label>' +
          '<label class="od-check"><input type="checkbox" name="remember"><span>' + T.remember + '</span></label>' +
          '<div class="od-summary" data-od-summary></div>' +
          '<p class="od-err" data-od-err="general" hidden></p>' +
          '<button type="submit" class="od-cta" data-od-send>' + T.place + '</button>' +
          '<button type="button" class="od-link" data-od-back>' + T.back + '</button>' +
        '</form>' +
        /* step 3 */
        '<section data-od-step="done" hidden class="od-done">' +
          '<div class="od-done-mark" aria-hidden="true"><svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 25l7 7 13-15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
          '<p class="od-done-nr" data-od-done-nr></p>' +
          '<h3 class="od-done-title" data-od-done-title></h3>' +
          '<p data-od-done-text></p>' +
          '<button type="button" class="od-link" data-od-restart>' + T.newOrder + '</button>' +
        '</section>' +
      '</div>' +
    '</aside>' +
    '<div class="od-sheet" role="dialog" aria-modal="true" aria-labelledby="od-sheet-title" data-od-sheet hidden>' +
      '<form class="od-sheet-in" data-od-sheet-form><h3 id="od-sheet-title" class="od-sheet-title" data-od-sheet-title></h3><p class="od-note" data-od-sheet-desc></p><div class="od-options" data-od-options></div>' +
      '<button type="submit" class="od-cta" data-od-sheet-add></button>' +
      '<button type="button" class="od-link" data-od-sheet-close>' + T.close + '</button></form>' +
    '</div>';
  document.body.appendChild(root);

  var $ = function (s) { return root.querySelector(s); };
  var drawer = $('[data-od-drawer]'), scrim = $('[data-od-scrim]'), bar = $('[data-od-bar]');
  var stepBasket = $('[data-od-step="basket"]'), stepDetails = $('[data-od-step="details"]'), stepDone = $('[data-od-step="done"]');
  var sheet = $('[data-od-sheet]');
  var lastFocus = null;

  function show(step) {
    stepBasket.hidden = step !== 'basket';
    stepDetails.hidden = step !== 'details';
    stepDone.hidden = step !== 'done';
  }
  function open(step) {
    lastFocus = document.activeElement;
    show(step || 'basket');
    drawer.hidden = false; scrim.hidden = false;
    requestAnimationFrame(function () { root.classList.add('od-on'); });
    document.documentElement.classList.add('od-lock');
    render();
    drawer.focus();
  }
  function close() {
    root.classList.remove('od-on');
    document.documentElement.classList.remove('od-lock');
    setTimeout(function () { drawer.hidden = true; scrim.hidden = true; render(); }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.ODOpen = open;

  /* ---------- rendering ---------- */
  function render() {
    var ls = lines(), n = count(), tot = gbp(sum());
    var html = ls.length ? ls.map(function (l) {
      var k = l.id + '|' + l.v;
      return '<div class="od-line"><div class="od-line-name">' + esc(lineName(l)) + '<small>' + gbp(linePrice(l)) + '</small></div>' +
        '<div class="od-qty"><button type="button" data-od-min="' + esc(k) + '" aria-label="Remove one ' + esc(lineName(l)) + '">−</button><span>' + l.qty + '</span>' +
        '<button type="button" data-od-plus="' + esc(k) + '" aria-label="Add one ' + esc(lineName(l)) + '">+</button></div>' +
        '<strong class="od-line-sum">' + gbp(linePrice(l) * l.qty) + '</strong></div>';
    }).join('') : '<p class="od-empty">' + T.empty + '</p>';
    $('[data-od-lines]').innerHTML = html;
    $('[data-od-total]').textContent = tot;
    $('[data-od-totalrow]').hidden = !ls.length;
    $('[data-od-next]').disabled = !ls.length;
    $('[data-od-summary]').innerHTML = ls.map(function (l) { return '<div><span>' + l.qty + '× ' + esc(lineName(l)) + '</span><span>' + gbp(linePrice(l) * l.qty) + '</span></div>'; }).join('') +
      (ls.length ? '<div class="od-summary-tot"><span>' + T.total + '</span><span>' + tot + '</span></div>' : '');
    bar.hidden = !ls.length || !drawer.hidden;
    $('[data-od-bar-text]').textContent = T.view(n, tot);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; el.hidden = !n; });
    document.querySelectorAll('[data-add]').forEach(function (b) {
      var id = b.getAttribute('data-add');
      var q = lines().filter(function (l) { return l.id === id; }).reduce(function (s, l) { return s + l.qty; }, 0);
      b.classList.toggle('is-in', q > 0);
      var badge = b.querySelector('[data-add-qty]');
      if (badge) { badge.textContent = q; badge.hidden = !q; }
    });
    renderAccount();
  }

  function renderAccount() {
    var p = load('profile'), last = load('last'), el = $('[data-od-account]');
    if (!p) { el.innerHTML = ''; return; }
    var btn = '';
    if (last && last.length) {
      var ok = last.filter(function (l) { return ITEMS[l.id]; });
      if (ok.length) {
        var n = ok.reduce(function (s, l) { return s + l.qty; }, 0);
        var t = ok.reduce(function (s, l) { return s + l.qty * linePrice(l); }, 0);
        btn = '<button type="button" class="od-again" data-od-again>' + T.again(n, gbp(t)) + '</button>';
      }
    }
    el.innerHTML = '<p class="od-note"><strong>' + esc(T.hi(p.name || '')) + '</strong> · <button type="button" class="od-link od-inline" data-od-forget>' + T.forget + '</button></p>' + btn;
  }

  /* ---------- time slots inside the real opening hours ---------- */
  function slots() {
    var now = new Date(), list = [], prep = (SHOP.prepMinutes || 25) * 60000;
    windows(2).slice(0, 2).forEach(function (w) {
      var first = new Date(Math.max(w.from.getTime() + 15 * 60000, now.getTime() + prep));
      first.setMinutes(Math.ceil(first.getMinutes() / 15) * 15, 0, 0);
      var last = new Date(w.to.getTime() - 15 * 60000);
      if (first > last) return;
      if (now >= w.from && now < w.to && !list.length) list.push({ v: 'asap', t: T.asap + ' (± ' + (SHOP.prepMinutes || 25) + ' min)' });
      var isTodayWin = w.from.toDateString() === now.toDateString() || now >= w.from;
      var step = (isTodayWin ? 15 : 30) * 60000;
      if (!isTodayWin) first.setMinutes(Math.ceil(first.getMinutes() / 30) * 30, 0, 0);
      for (var s = new Date(first); s <= last; s = new Date(s.getTime() + step)) {
        var hm = hhmm(s.getHours() + s.getMinutes() / 60);
        var isToday = s.toDateString() === now.toDateString();
        var label = isToday ? T.today + ' ' + hm : s.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) + ' ' + hm;
        list.push({ v: s.toISOString(), t: label });
      }
    });
    return list;
  }
  function fillSlots() {
    var sel = $('[data-od-when]');
    var s = slots();
    sel.innerHTML = s.map(function (o) { return '<option value="' + esc(o.v) + '">' + esc(o.t) + '</option>'; }).join('');
    return s.length;
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      var it = ITEMS[add.getAttribute('data-add')];
      if (!it) return;
      if (it.groups && it.groups.length) { openSheet(it); return; }
      addLine(it.id, '');
      add.classList.remove('pop'); void add.offsetWidth; add.classList.add('pop');
      return;
    }
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); open('basket'); }
  });
  bar.addEventListener('click', function () { open('basket'); });
  scrim.addEventListener('click', close);
  $('[data-od-close]').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!sheet.hidden) closeSheet(); else if (!drawer.hidden) close(); }
    if (e.key === 'Tab' && !drawer.hidden && sheet.hidden) {
      var f = [].slice.call(drawer.querySelectorAll('button:not([disabled]),input,select,textarea')).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  root.addEventListener('click', function (e) {
    var p = e.target.closest('[data-od-plus]'), m = e.target.closest('[data-od-min]');
    if (p) { var k = p.getAttribute('data-od-plus'); basket[k].qty = Math.min(20, basket[k].qty + 1); persist(); render(); }
    if (m) { var k2 = m.getAttribute('data-od-min'); basket[k2].qty -= 1; if (basket[k2].qty <= 0) delete basket[k2]; persist(); render(); }
    if (e.target.closest('[data-od-forget]')) { drop('profile'); drop('last'); render(); }
    if (e.target.closest('[data-od-again]')) {
      basket = {};
      (load('last') || []).forEach(function (l) { if (ITEMS[l.id]) basket[l.id + '|' + (l.v || '')] = { id: l.id, v: l.v || '', p: l.p, qty: l.qty }; });
      persist(); render();
    }
    if (e.target.closest('[data-od-restart]')) { show('basket'); render(); }
  });

  /* option sheet: item.groups = [{name, options: [{name, price?|add?, plain?}]}]
     'price' sets the price (sizes), 'add' adds to it (extras), 'plain' keeps the
     choice out of the line name (e.g. "No thanks"). First option is the default.
     A group with pick: n is a multi-choice: exactly n options, shown as tick boxes. */
  var sheetForm = $('[data-od-sheet-form]');
  function sheetChoice() {
    var it = ITEMS[sheet.dataset.item], price = it.price, names = [];
    var short = 0;
    it.groups.forEach(function (g, gi) {
      if (g.pick) {
        var gekozen = [].slice.call(sheetForm.querySelectorAll('input[name="g' + gi + '"]:checked'));
        if (gekozen.length !== g.pick) short = g.pick - gekozen.length;
        if (gekozen.length) names.push(gekozen.map(function (c) { return g.options[+c.value].name; }).join(' + '));
        return;
      }
      var el = sheetForm.querySelector('input[name="g' + gi + '"]:checked');
      var o = g.options[el ? +el.value : 0];
      if (typeof o.price === 'number') price = o.price;
      if (typeof o.add === 'number') price += o.add;
      if (!o.plain) names.push(o.name);
    });
    return { v: names.join(', '), p: Math.round(price * 100) / 100, short: short };
  }
  function paintSheetPrice() {
    var c = sheetChoice(), b = $('[data-od-sheet-add]');
    b.disabled = c.short !== 0;
    b.textContent = c.short > 0 ? (T.pickMore ? T.pickMore(c.short) : 'Pick ' + c.short + ' more') : c.short < 0 ? (T.pickLess ? T.pickLess(-c.short) : 'Remove ' + (-c.short)) : T.add + ' · ' + gbp(c.p);
  }
  function openSheet(it) {
    lastFocus = document.activeElement;
    sheet.dataset.item = it.id;
    $('[data-od-sheet-title]').textContent = it.name;
    $('[data-od-sheet-desc]').textContent = it.desc || '';
    $('[data-od-options]').innerHTML = it.groups.map(function (g, gi) {
      return '<fieldset class="od-group"><legend>' + esc(g.name) + '</legend><div class="od-chips">' + g.options.map(function (o, oi) {
        var extra = typeof o.price === 'number' ? gbp(o.price) : (o.add ? '+' + gbp(o.add) : '');
        if (g.pick) return '<label class="od-chip"><input type="checkbox" name="g' + gi + '" value="' + oi + '"><span>' + esc(o.name) + '</span></label>';
        return '<label class="od-chip"><input type="radio" name="g' + gi + '" value="' + oi + '"' + (oi === 0 ? ' checked' : '') + '><span>' + esc(o.name) + (extra ? ' <small>' + extra + '</small>' : '') + '</span></label>';
      }).join('') + '</div></fieldset>';
    }).join('');
    paintSheetPrice();
    sheet.hidden = false;
    requestAnimationFrame(function () { sheet.classList.add('od-on'); });
    var first = sheet.querySelector('input'); if (first) first.focus();
  }
  function closeSheet() {
    sheet.classList.remove('od-on'); sheet.hidden = true;
    if (lastFocus && lastFocus.focus && drawer.hidden) lastFocus.focus();
  }
  sheetForm.addEventListener('change', paintSheetPrice);
  sheetForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var c = sheetChoice();
    if (c.short !== 0) return;
    addLine(sheet.dataset.item, c.v, c.p);
    closeSheet();
  });
  sheet.addEventListener('click', function (e) {
    if (e.target.closest('[data-od-sheet-close]') || e.target === sheet) closeSheet();
  });

  /* steps */
  $('[data-od-next]').addEventListener('click', function () {
    var p = load('profile');
    if (p) {
      ['name', 'phone', 'address', 'postcode'].forEach(function (k) { if (p[k] && !stepDetails[k].value) stepDetails[k].value = p[k]; });
      stepDetails.remember.checked = true;
    }
    if (!fillSlots()) { err('general', T.closedErr); }
    show('details');
    drawer.scrollTop = 0;
    var first = stepDetails.querySelector('input[name="method"]:checked'); if (first) first.focus();
  });
  $('[data-od-back]').addEventListener('click', function () { show('basket'); render(); });
  stepDetails.addEventListener('change', function (e) {
    if (e.target.name !== 'method') return;
    var del = e.target.value === 'delivery';
    $('[data-od-delivery]').hidden = !del;
    $('[data-od-method-note]').textContent = del ? (SHOP.deliveryNote || '') : (SHOP.collectionNote || '');
  });

  function err(f, t) {
    var el = $('[data-od-err="' + f + '"]');
    if (!el) return;
    el.textContent = t || ''; el.hidden = !t;
    var inp = stepDetails[f];
    if (inp && inp.closest) { var lab = inp.closest('.od-field'); if (lab) lab.classList.toggle('has-err', !!t); }
  }

  stepDetails.addEventListener('submit', async function (e) {
    e.preventDefault();
    ['name', 'phone', 'address', 'postcode', 'general'].forEach(function (f) { err(f, ''); });
    var f = stepDetails;
    var del = f.method.value === 'delivery';
    var name = f.name.value.trim(), phone = f.phone.value.trim(), address = f.address.value.trim(), postcode = f.postcode.value.trim().toUpperCase();
    var ok = true;
    if (!name) { err('name', T.nameErr); ok = false; }
    if (!/^(\+44\s?|0)[\d\s]{9,13}$/.test(phone)) { err('phone', T.phoneErr); ok = false; }
    if (del && !address) { err('address', T.addressErr); ok = false; }
    if (del && !/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(postcode)) { err('postcode', T.postcodeErr); ok = false; }
    if (!lines().length) { err('general', T.emptyErr); ok = false; }
    if (!f.when.value) { err('general', T.closedErr); ok = false; }
    if (!ok) { var bad = stepDetails.querySelector('.od-err:not([hidden])'); if (bad) bad.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }

    var btn = $('[data-od-send]');
    btn.disabled = true; btn.textContent = T.sending;
    var whenText = f.when.selectedOptions[0].textContent;
    var body = {
      naam: name, telefoon: phone,
      wijze: del ? 'delivery' : 'collection',
      tijd: whenText,
      opmerking: f.note.value.trim(),
      regels: lines().map(function (l) { return { id: l.id, naam: lineName(l), aantal: l.qty, prijs: linePrice(l) }; }),
      totaal: Math.round(sum() * 100) / 100,
    };
    if (del) body.adres = address + ', ' + postcode;
    try {
      var r = await fetch('api/bestelling', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      var j = await r.json();
      if (!j.ok) throw new Error(j.fout || r.status);
      var n = count(), tot = gbp(sum());
      var when = /^as soon/i.test(whenText) ? 'as soon as possible' : whenText.replace(/^Today /, 'today at ');
      $('[data-od-done-nr]').textContent = 'Order ' + j.id;
      $('[data-od-done-title]').textContent = T.thanks + ', ' + name.split(' ')[0] + '!';
      $('[data-od-done-text]').textContent = (del ? T.confirmDeliver : T.confirmCollect)(n, tot, when);
      save('last', lines().map(function (l) { return { id: l.id, v: l.v, p: l.p, qty: l.qty }; }));
      if (f.remember.checked) save('profile', { name: name, phone: phone, address: address, postcode: postcode });
      else drop('profile');
      basket = {}; persist();
      show('done'); render();
    } catch (x) {
      err('general', T.sendErr(x.message));
    }
    btn.disabled = false; btn.textContent = T.place;
  });

  render();
})();
