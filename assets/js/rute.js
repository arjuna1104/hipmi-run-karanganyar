/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - rute.js
   Checkpoint list, course markers placed along the schematic path, and the
   elevation profile drawn from the surveyed points.
   ========================================================================== */
(function () {
  'use strict';

  const { $, $$, reduced } = window.HipmiUI;
  const H = window.HIPMI;

  const TYPE_COLOR = {
    start: 'var(--brand-accent)', finish: 'var(--gold)',
    water: '#3b82f6', medic: '#d1443b', cheer: 'var(--lime)'
  };

  /* ---- checkpoint list -------------------------------------------------- */
  const list = $('#cpList');
  if (list) {
    list.innerHTML = H.CHECKPOINTS.map(function (cp, i) {
      return '<article class="cp" data-cp="' + i + '" tabindex="0">' +
        '<span class="cp-km">KM ' + cp.km.replace('.', ',') + '</span>' +
        '<span><b>' + cp.name + '</b><span>' + cp.note + '</span></span>' +
        '<i class="ph-fill ' + cp.icon + '" style="color:' + TYPE_COLOR[cp.type] + '" aria-hidden="true"></i>' +
        '</article>';
    }).join('');
  }

  /* ---- markers along the course ---------------------------------------- */
  const path = $('#routePath');
  const markers = $('#mapMarkers');

  if (path && markers && typeof path.getTotalLength === 'function') {
    const total = path.getTotalLength();

    H.CHECKPOINTS.forEach(function (cp, i) {
      // the course is a closed loop: nudge start and finish apart so both read
      let ratio = parseFloat(cp.km) / 10;
      if (cp.type === 'start') ratio = 0.008;
      if (cp.type === 'finish') ratio = 0.935;

      const pt = path.getPointAtLength(total * ratio);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'cp-dot');
      g.setAttribute('data-cp', String(i));
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'img');
      g.setAttribute('aria-label', cp.name + ', KM ' + cp.km);
      g.innerHTML =
        '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="9" ' +
        'fill="var(--surface)" stroke="' + TYPE_COLOR[cp.type] + '" stroke-width="2.5"/>' +
        '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="3.4" fill="' + TYPE_COLOR[cp.type] + '"/>' +
        '<text x="' + pt.x.toFixed(1) + '" y="' +
        (cp.type === 'finish' ? (pt.y + 24) : (pt.y - 15)).toFixed(1) +
        '" text-anchor="middle">' + cp.km.replace('.', ',') + '</text>';
      markers.appendChild(g);
    });

    // a dashed overlay travelling the loop shows which way the course runs
    const flow = path.cloneNode();
    flow.removeAttribute('id');
    flow.setAttribute('class', 'flow');
    flow.setAttribute('stroke', '#ffd489');
    flow.setAttribute('stroke-width', '2');
    flow.setAttribute('opacity', '.62');
    path.parentNode.insertBefore(flow, markers);

    // hovering either the map or the list highlights the same checkpoint
    function focusCp(idx, on) {
      $$('[data-cp="' + idx + '"]').forEach(function (el) {
        if (el.classList.contains('cp')) el.setAttribute('data-active', String(on));
        else el.querySelector('circle').setAttribute('stroke-width', on ? '4' : '2.5');
      });
    }
    $$('[data-cp]').forEach(function (el) {
      const idx = el.getAttribute('data-cp');
      ['mouseenter', 'focus'].forEach(ev => el.addEventListener(ev, () => focusCp(idx, true)));
      ['mouseleave', 'blur'].forEach(ev => el.addEventListener(ev, () => focusCp(idx, false)));
    });
  }

  /* ---- elevation profile ------------------------------------------------ */
  /* The chart is drawn at the container's real pixel width so one SVG unit is
     one CSS pixel. A fixed viewBox would scale 10px axis text down to about
     3px on a phone, which is unreadable. Redrawn whenever the width changes. */
  const chart = $('#elevChart');
  if (chart) {
    const pts = H.ELEVATION;
    let lastWidth = 0;

    function drawElevation() {
      const box = chart.getBoundingClientRect();
      const W = Math.round(box.width) || 640;
      if (!W) return;

      const narrow = W < 520;
      const Hh = narrow ? 250 : 300;
      const padL = narrow ? 42 : 50;
      const padR = narrow ? 14 : 22;
      const padT = narrow ? 30 : 28;
      const padB = narrow ? 40 : 44;
      const plotW = W - padL - padR, plotH = Hh - padT - padB;
      const step = narrow ? 40 : 20;
      const ticks = narrow ? [0, 2.5, 5, 7.5, 10] : [0, 2.5, 5, 7.5, 10];

      chart.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);

      const metres = pts.map(p => p.m);
      const lo = Math.floor((Math.min.apply(null, metres) - 12) / step) * step;
      const hi = Math.ceil((Math.max.apply(null, metres) + 12) / step) * step;
      const x = km => padL + (km / 10) * plotW;
      const y = m => padT + plotH - ((m - lo) / (hi - lo)) * plotH;

      const line = pts.map((p, i) => (i ? 'L' : 'M') + x(p.km).toFixed(1) + ' ' + y(p.m).toFixed(1)).join(' ');
      const area = line + ' L' + x(10).toFixed(1) + ' ' + (padT + plotH) + ' L' + padL + ' ' + (padT + plotH) + ' Z';

      let out = '<title id="elevTitle">Profil elevasi rute 10 kilometer, naik dari 511 meter di garis start ke 621 meter pada KM 7,5, lalu turun ke 527 meter di garis finis.</title>' +
        '<defs><linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="var(--gold)" stop-opacity=".34"/>' +
        '<stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/></linearGradient></defs>';

      for (let m = lo; m <= hi; m += step) {
        out += '<line stroke="var(--line)" x1="' + padL + '" y1="' + y(m) + '" x2="' + (W - padR) + '" y2="' + y(m) + '"/>' +
          '<text x="' + (padL - 8) + '" y="' + (y(m) + 3.5) + '" text-anchor="end">' + m + '</text>';
      }

      out += '<path d="' + area + '" fill="url(#elevFill)"/>' +
        '<path d="' + line + '" fill="none" stroke="var(--gold)" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>';

      ticks.forEach(function (km) {
        const p = pts.reduce((a, b) => Math.abs(b.km - km) < Math.abs(a.km - km) ? b : a);
        const anchor = km === 0 ? 'start' : (km === 10 ? 'end' : 'middle');
        out += '<line stroke="var(--line-strong)" stroke-dasharray="3 4" x1="' + x(km) + '" y1="' + y(p.m) + '" x2="' + x(km) + '" y2="' + (padT + plotH) + '"/>' +
          '<circle cx="' + x(km) + '" cy="' + y(p.m) + '" r="4.5" fill="var(--gold)" stroke="var(--surface)" stroke-width="2">' +
          '<title>KM ' + String(km).replace('.', ',') + ' pada ' + p.m + ' mdpl</title></circle>' +
          '<text x="' + x(km) + '" y="' + (Hh - 14) + '" text-anchor="' + anchor + '">' +
          (narrow ? String(km).replace('.', ',') : 'KM ' + String(km).replace('.', ',')) + '</text>';
      });

      const peak = pts.reduce((a, b) => (b.m > a.m ? b : a));
      out += '<text x="' + x(peak.km) + '" y="' + (y(peak.m) - 14) + '" text-anchor="middle" fill="var(--ink)">' +
        peak.m + ' mdpl</text>';
      out += '<text x="' + padL + '" y="' + (narrow ? 14 : 15) + '" text-anchor="start">' +
        (narrow ? 'Ketinggian (mdpl)' : 'Ketinggian di atas permukaan laut (meter)') + '</text>';

      out += '<line class="elev-cursor" id="elevCursor" y1="' + padT + '" y2="' + (padT + plotH) + '"/>';
      out += '<circle class="elev-dot" id="elevDot" r="5" fill="var(--lime)" stroke="var(--surface)" stroke-width="2"/>';
      chart.innerHTML = out;

      wireReadout(W, Hh, padL, plotW, x, y);
    }

    function metresAt(kmVal) {
      for (let i = 1; i < pts.length; i++) {
        if (kmVal <= pts[i].km) {
          const a = pts[i - 1], b = pts[i];
          const t = (kmVal - a.km) / (b.km - a.km || 1);
          return a.m + (b.m - a.m) * t;
        }
      }
      return pts[pts.length - 1].m;
    }

    function wireReadout(W, Hh, padL, plotW, x, y) {
      const readout = $('#elevReadout');
      const cursor = $('#elevCursor');
      const dot = $('#elevDot');

      function track(e) {
        const rect = chart.getBoundingClientRect();
        if (!rect.width) return;
        const vx = ((e.clientX - rect.left) / rect.width) * W;
        const kmVal = Math.min(10, Math.max(0, ((vx - padL) / plotW) * 10));
        const m = metresAt(kmVal);
        const px = x(kmVal), py = y(m);

        cursor.setAttribute('x1', px); cursor.setAttribute('x2', px);
        cursor.setAttribute('data-on', 'true');
        dot.setAttribute('cx', px); dot.setAttribute('cy', py);
        dot.setAttribute('data-on', 'true');

        readout.innerHTML = 'KM ' + kmVal.toFixed(1).replace('.', ',') +
          ' \u00b7 <b>' + Math.round(m) + ' mdpl</b>';
        // keep the bubble inside the chart on narrow screens
        const leftPx = (px / W) * rect.width;
        readout.style.left = Math.min(rect.width - 58, Math.max(58, leftPx)) + 'px';
        readout.style.top = ((py / Hh) * rect.height) + 'px';
        readout.setAttribute('data-on', 'true');
      }

      function clear() {
        cursor.setAttribute('data-on', 'false');
        dot.setAttribute('data-on', 'false');
        readout.setAttribute('data-on', 'false');
      }

      chart.addEventListener('pointermove', track);
      chart.addEventListener('pointerdown', track);
      chart.addEventListener('pointerleave', clear);
      chart.addEventListener('pointercancel', clear);
    }

    drawElevation();
    lastWidth = Math.round(chart.getBoundingClientRect().width);

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        const w = Math.round(chart.getBoundingClientRect().width);
        if (w && Math.abs(w - lastWidth) > 2) { lastWidth = w; drawElevation(); }
      }).observe(chart.parentElement);
    }
  }
})();
