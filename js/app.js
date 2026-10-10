/* Ragini & Prem · reception invite · page-based interaction */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  function cl(x) { return Math.min(1, Math.max(0, x)); }
  function sm(x) { x = cl(x); return x * x * (3 - 2 * x); }
  function W(p, a, b) { return cl((p - a) / (b - a)); }
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

  /* real viewport height (mobile address bars) */
  function setVh() { document.documentElement.style.setProperty('--vh', innerHeight * .01 + 'px'); }
  setVh();

  /* hero names, letter by letter */
  var nm = $('nm');
  'Ragini & Prem'.split('').forEach(function (c, i) {
    var s = document.createElement('span');
    s.className = 'ch' + (c === '&' ? ' am' : '');
    s.textContent = c === ' ' ? '\u00A0' : c;
    s.style.animationDelay = (.9 + i * .06) + 's';
    nm.appendChild(s);
  });

  /* wedding line: future -> present -> past (India time) */
  var now = Date.now(), ds = new Date('2026-11-20T00:00:00+05:30').getTime();
  $('wt').textContent = now < ds ? 'will be held in Tamil Nadu'
    : now < ds + 864e5 ? 'is being held today in Tamil Nadu' : 'was held in Tamil Nadu';

  var hero = $('hero'), arch = $('arch'), pt = $('pt'), pb = $('pb'),
      dots = $('dots'), nx = $('next'), nl = $('nl'), peek = $('peek'),
      dbtn = [].slice.call(dots.children),
      secs = [null, $('s1'), $('s2'), $('s3')],
      fade = ['hl', 'nm', 'dt', 'o1', 'o2', 'stw', 'peek'].map($);
  var idx = 0, busy = false, ht = 0, settle = 0, A = null,
      px = 0, py = 0, tx = 0, ty = 0, push = 0, lock = 0, anim = false;

  function measure() {
    var o = arch.style.transform; arch.style.transform = 'none';
    var r = arch.getBoundingClientRect();
    arch.style.transform = o;
    A = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
  }

  /* hero -> invitation: the arch grows until it fills the screen */
  function renderHero(t) {
    if (!A) measure();
    var e = sm(W(t, 0, 1)), Wd = innerWidth, H = innerHeight,
        S = Math.max(Wd / A.w, H / A.h) * 1.05, sc = 1 + (S - 1) * e,
        r = (A.w / 2) * (1 - sm(e * 1.25));
    arch.style.borderRadius = r + 'px ' + r + 'px 0 0';
    arch.style.transform = 'perspective(900px) translate(' + ((Wd / 2 - A.cx) * e) + 'px,' + ((H / 2 - A.cy) * e) +
      'px) rotateY(' + (px * 6 * (1 - e)) + 'deg) rotateX(' + (-py * 4 * (1 - e)) + 'deg) scale(' + sc + ')';
    var f = 1 - cl(t / .26);
    fade.forEach(function (el) { el.style.opacity = f; });
    peek.style.transform = f < 1 ? 'translateY(' + ((1 - f) * 40) + 'px)' : '';
    peek.style.animation = f < 1 ? 'none' : '';
    var ho = 1 - sm(W(t, .72, 1));
    hero.style.opacity = ho;
    hero.style.visibility = ho <= .001 ? 'hidden' : 'visible';
    hero.style.pointerEvents = ho > .5 ? 'auto' : 'none';
    settle = sm(W(t, .7, 1));
  }

  function animHero(to, dur, done, thr, cb) {
    var from = ht, st = performance.now(), fired = false;
    anim = true;
    (function step(n) {
      var k = ease(cl((n - st) / dur));
      ht = from + (to - from) * k;
      if (cb && !fired && (to > from ? ht >= thr : ht <= thr)) { fired = true; cb(); }
      if (k < 1) requestAnimationFrame(step);
      else { ht = to; anim = false; if (done) done(); }
    })(st);
  }

  /* sections */
  function reset(s, up) {
    s.style.transition = 'none';
    s.classList.toggle('up', up);
    void s.offsetWidth;
    s.style.transition = '';
  }
  function count(s) {
    [].forEach.call(s.querySelectorAll('[data-count]'), function (el) {
      var to = +el.dataset.count, st = performance.now() + 320, d = 1100;
      requestAnimationFrame(function f(n) {
        var k = cl((n - st) / d);
        el.textContent = String(Math.max(1, Math.round(1 + (to - 1) * sm(k)))).padStart(2, '0');
        if (k < 1) requestAnimationFrame(f);
      });
    });
  }
  function enter(i, dir) {
    var s = secs[i];
    reset(s, dir < 0);
    s.classList.remove('up');
    s.classList.add('in');
    count(s);
  }
  function leave(i, dir) {
    var s = secs[i];
    s.classList.remove('in', 'drag');
    s.style.opacity = ''; s.style.transform = '';
    if (dir > 0) s.classList.add('up');
  }

  function ui() {
    dbtn.forEach(function (b, i) { b.className = i === idx ? 'a' : ''; });
    dots.classList.toggle('show', idx >= 1);
    nx.classList.toggle('show', idx >= 1);
    nx.classList.toggle('rev', idx === 3);
    nl.textContent = idx === 3 ? 'Back to start' : 'Next';
  }

  function go(n) {
    if (busy || n < 0 || n > 3 || n === idx) return;
    busy = true;
    var from = idx, dir = n > from ? 1 : -1;
    idx = n; ui(); push = dir * 16;
    if (from === 0) {
      animHero(1, 1500, function () { busy = false; }, .8, function () { enter(1, 1); });
      if (n > 1) setTimeout(function () { busy = false; go(n); }, 1600);
    } else if (n === 0) {
      leave(from, -1);
      setTimeout(function () { animHero(0, 1300, function () { busy = false; }); }, 250);
    } else {
      leave(from, dir);
      setTimeout(function () { enter(n, dir); }, 330);
      setTimeout(function () { busy = false; }, 1000);
    }
  }
  function next() { go(idx === 3 ? 0 : idx + 1); }

  /* inputs */
  peek.addEventListener('click', function () { go(1); });
  nx.addEventListener('click', next);
  dbtn.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
  addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || k === ' ' || (k === 'Enter' && idx === 0)) { e.preventDefault(); go(idx + 1); }
    else if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(idx - 1); }
    else if (k === 'Home') go(0); else if (k === 'End') go(3);
  });
  addEventListener('wheel', function (e) {
    e.preventDefault();
    if (busy || Date.now() < lock || Math.abs(e.deltaY) < 8) return;
    lock = Date.now() + 1200;
    go(idx + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  var y0 = 0, t0 = 0, dy = 0, drag = false;
  addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; t0 = performance.now(); dy = 0; drag = !busy; }, { passive: true });
  addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (!drag) return;
    dy = e.touches[0].clientY - y0;
    if (idx === 0) { if (dy < 0) { ht = Math.min(.45, -dy / 340); } }
    else {
      var s = secs[idx]; s.classList.add('drag');
      s.style.transform = 'translateY(' + (dy * .3) + 'px)';
      s.style.opacity = 1 - Math.min(.5, Math.abs(dy) / 500);
    }
  }, { passive: false });
  addEventListener('touchend', function () {
    if (!drag) return;
    drag = false;
    var v = dy / Math.max(1, performance.now() - t0), fwd = dy < -50 || v < -.45, back = dy > 50 || v > .45;
    if (idx === 0) { if (fwd) go(1); else animHero(0, 450); }
    else {
      var s = secs[idx]; s.classList.remove('drag'); s.style.opacity = ''; s.style.transform = '';
      if (fwd && idx < 3) go(idx + 1); else if (back) go(idx - 1);
    }
  });
  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; } }, { passive: true });
  try {
    addEventListener('deviceorientation', function (e) {
      if (e.gamma == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 25));
      ty = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 25));
    }, { passive: true });
  } catch (x) { /* optional */ }
  addEventListener('resize', function () { setVh(); measure(); });
  addEventListener('load', measure);

  /* render loop: tilt, push, hero */
  function frame() {
    px += (tx - px) * .06; py += (ty - py) * .06; push *= .9;
    if (idx === 0 || anim || ht > 0) renderHero(ht);
    pt.style.transform = 'translate(' + (-px * 7) + 'px,' + (-3 - (1 - settle) * 22 - py * 3 - push) + 'px) scale(1.06)';
    pb.style.transform = 'translate(' + (px * 7) + 'px,' + (3 + (1 - settle) * 22 + py * 3 + push * .6) + 'px) scale(1.06)';
    requestAnimationFrame(frame);
  }
  ui();
  requestAnimationFrame(frame);
})();
