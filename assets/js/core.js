/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - core.js
   Shared chrome: theme, navigation, scroll reveal, countdown, modal, QR.
   No scroll event listeners anywhere; IntersectionObserver only.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- theme ---------------------------------------------------------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  function paintThemeButton(btn) {
    if (!btn) return;
    const explicit = document.documentElement.getAttribute('data-theme');
    const dark = explicit
      ? explicit === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    btn.innerHTML = '<i class="ph ' + (dark ? 'ph-sun' : 'ph-moon-stars') + '" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', dark ? 'Gunakan tampilan terang' : 'Gunakan tampilan gelap');
  }

  function initTheme() {
    const saved = store.get('hipmi-theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
    const btn = $('[data-theme-toggle]');
    paintThemeButton(btn);
    if (!btn) return;
    btn.addEventListener('click', function () {
      const explicit = document.documentElement.getAttribute('data-theme');
      const dark = explicit
        ? explicit === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = dark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      store.set('hipmi-theme', next);
      paintThemeButton(btn);
    });
  }

  /* ---- navigation ----------------------------------------------------- */
  function initNav() {
    const head = $('.masthead');
    if (!head) return;

    const toggle = $('[data-nav-toggle]', head);
    if (toggle) {
      toggle.addEventListener('click', function () {
        const open = head.getAttribute('data-open') === 'true';
        head.setAttribute('data-open', String(!open));
        toggle.setAttribute('aria-expanded', String(!open));
        toggle.innerHTML = '<i class="ph ' + (open ? 'ph-list' : 'ph-x') + '" aria-hidden="true"></i>';
      });
      $$('.nav a', head).forEach(a => a.addEventListener('click', function () {
        head.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="ph ph-list" aria-hidden="true"></i>';
      }));
    }

    // stuck state without a scroll listener
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      head.setAttribute('data-stuck', String(!entries[0].isIntersecting));
    }).observe(sentinel);
  }

  /* ---- scroll reveal --------------------------------------------------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ---- countdown ------------------------------------------------------- */
  function initCountdown() {
    const root = $('[data-countdown]');
    if (!root) return;
    const target = new Date(root.getAttribute('data-countdown')).getTime();
    const cells = {
      d: $('[data-cd="d"]', root), h: $('[data-cd="h"]', root),
      m: $('[data-cd="m"]', root), s: $('[data-cd="s"]', root)
    };
    const pad = n => String(Math.max(0, n)).padStart(2, '0');

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        root.setAttribute('data-state', 'live');
        Object.values(cells).forEach(c => { if (c) c.textContent = '00'; });
        clearInterval(timer);
        return;
      }
      const s = Math.floor(diff / 1000);
      if (cells.d) cells.d.textContent = pad(Math.floor(s / 86400));
      if (cells.h) cells.h.textContent = pad(Math.floor(s / 3600) % 24);
      if (cells.m) cells.m.textContent = pad(Math.floor(s / 60) % 60);
      if (cells.s) cells.s.textContent = pad(s % 60);
    }
    tick();
    const timer = setInterval(tick, 1000);
    window.addEventListener('pagehide', () => clearInterval(timer));
  }

  /* ---- modal ----------------------------------------------------------- */
  let lastFocus = null;
  function openModal(el) {
    if (!el) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    const focusable = el.querySelector('button, [href], input, select, textarea');
    if (focusable) focusable.focus();
  }
  function closeModal(el) {
    if (!el) return;
    el.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initModals() {
    $$('.modal').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('[data-modal-close]')) closeModal(modal);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      const open = $$('.modal').find(m => !m.hidden);
      if (open) closeModal(open);
    });
  }

  /* ---- QR ------------------------------------------------------------- */
  /* Renders an encrypted-payload QR into `box`. Falls back to the readable
     code string when the generator script is blocked, so a marshall can
     still verify the runner by typing the code. */
  function renderQR(box, payload, cellSize) {
    if (!box) return;
    box.innerHTML = '';
    if (typeof window.qrcode !== 'function') {
      box.innerHTML = '<p class="qr-code-text" style="padding:.75rem;color:#46566f">'
        + 'Kode verifikasi<br><b>' + payload + '</b></p>';
      return;
    }
    try {
      const qr = window.qrcode(0, 'M');
      qr.addData(payload);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: cellSize || 4, margin: 0, scalable: true });
      const svg = box.querySelector('svg');
      if (svg) {
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Kode QR e-Pass ' + payload);
      }
    } catch (err) {
      box.innerHTML = '<p class="qr-code-text" style="padding:.75rem;color:#46566f">' + payload + '</p>';
    }
  }

  /* ---- toast feedback --------------------------------------------------- */
  /* Confirms actions that otherwise leave no trace on screen: a print dialog
     that the browser may open behind the window, a copied code, a saved pass. */
  let toastHost = null;
  function toast(message, kind) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'toasts';
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastHost);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('data-kind', kind || 'ok');
    el.innerHTML = '<i class="ph-fill ' +
      (kind === 'warn' ? 'ph-warning-circle' : 'ph-check-circle') +
      '" aria-hidden="true"></i><span></span>';
    el.querySelector('span').textContent = message;
    toastHost.appendChild(el);
    window.setTimeout(function () {
      el.classList.add('is-out');
      window.setTimeout(() => el.remove(), 300);
    }, 4200);
  }

  /* ---- reel Instagram ----------------------------------------------------
     Kerangka Instagram tidak menyesuaikan tingginya sendiri, tetapi mengabarkan
     tinggi isinya lewat postMessage. Didengarkan di sini supaya tidak ada ruang
     kosong menganga di bawah video, berapa pun lebar layarnya. Nilai dari luar
     tetap diperlakukan sebagai data: asalnya diperiksa dan angkanya dibatasi. */
  function initReel() {
    const bingkai = $$('.reel-stage iframe');
    if (!bingkai.length) return;

    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://www.instagram.com') return;
      let pesan;
      try { pesan = JSON.parse(e.data); } catch (err) { return; }
      if (!pesan || pesan.type !== 'MEASURE') return;

      const tinggi = Number(pesan.details && pesan.details.height);
      if (!(tinggi >= 200 && tinggi <= 1600)) return;

      bingkai.forEach(function (f) {
        if (f.contentWindow === e.source) f.style.height = Math.round(tinggi) + 'px';
      });
    });
  }

  /* ---- boot ------------------------------------------------------------ */
  function boot() {
    initTheme();
    initNav();
    initReveal();
    initCountdown();
    initModals();
    initReel();
    const y = $('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  window.HipmiUI = { $, $$, reduced, openModal, closeModal, renderQR, initReveal, toast };
})();
