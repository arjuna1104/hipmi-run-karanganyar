/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - rute.js
   Peta rute, daftar pos layanan, dan profil elevasi.

   Jalur yang digambar adalah jejak sebenarnya dari peta panitia, bukan skema,
   jadi penanda ditempatkan pada koordinatnya masing-masing, bukan dibagi rata
   sepanjang garis. Halaman menampilkan satu kategori pada satu waktu.
   ========================================================================== */
(function () {
  'use strict';

  const { $, $$ } = window.HipmiUI;
  const H = window.HIPMI;
  if (!H.ROUTES) return;

  const TYPE_COLOR = {
    start: 'var(--brand-accent)', finish: 'var(--gold)',
    water: '#3b82f6', medic: '#d1443b', cheer: 'var(--lime)'
  };
  const SVGNS = 'http://www.w3.org/2000/svg';

  let kini = '10k';
  const R = () => H.ROUTES[kini];

  /* ---- daftar pos layanan ---------------------------------------------- */
  function gambarDaftar() {
    const list = $('#cpList');
    if (!list) return;
    list.innerHTML = R().checkpoints.map(function (cp, i) {
      return '<article class="cp" data-cp="' + i + '" tabindex="0">' +
        '<span class="cp-km">KM ' + cp.km.replace('.', ',') + '</span>' +
        '<span><b>' + cp.name + '</b><span>' + cp.note + '</span></span>' +
        '<i class="ph-fill ' + cp.icon + '" style="color:' + TYPE_COLOR[cp.type] + '" aria-hidden="true"></i>' +
        '</article>';
    }).join('');

    const judul = $('#cpTitle');
    if (judul) {
      judul.textContent = R().checkpoints.length + ' pos layanan, ' +
        R().marshals + ' pos marshal';
    }
  }

  /* ---- peta ------------------------------------------------------------- */
  function gambarPeta() {
    const svg = $('#routeMap');
    if (!svg) return;
    const r = R();
    svg.setAttribute('viewBox', H.ROUTE_VIEWBOX);

    const desc = $('#mapDesc');
    if (desc) {
      desc.textContent = 'Jejak rute ' + r.nominalKm + ' kilometer HIPMI RUN Karanganyar, ' +
        'berangkat dan berakhir di titik yang sama, dengan ' +
        r.checkpoints.filter(c => c.type === 'water').length + ' water station di sepanjang jalur.';
    }

    /* tiga lapis: halo tebal, garis emas padat, lalu garis putus berjalan
       di atasnya sebagai penunjuk arah lari */
    let out =
      '<path d="' + r.path + '" fill="none" stroke="var(--brand-accent)" stroke-width="17" ' +
      'stroke-linecap="round" stroke-linejoin="round" opacity=".16"/>' +
      '<path d="' + r.path + '" fill="none" stroke="var(--gold)" stroke-width="6" ' +
      'stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="flow" d="' + r.path + '" fill="none" stroke="#ffd489" stroke-width="3" ' +
      'stroke-linecap="round" stroke-linejoin="round" opacity=".62"/>';

    /* penanda kilometer: titik kecil, tidak bersaing dengan pos layanan */
    r.kmMarkers.forEach(function (m) {
      out += '<g class="km-dot" role="img" aria-label="Kilometer ' + m.km + '">' +
        '<circle cx="' + m.x + '" cy="' + m.y + '" r="13" fill="var(--surface)" ' +
        'stroke="var(--line-strong)" stroke-width="2"/>' +
        '<text x="' + m.x + '" y="' + (m.y + 4.4) + '" text-anchor="middle">' + m.km + '</text></g>';
    });

    r.checkpoints.forEach(function (cp, i) {
      const x = cp.xy[0], y = cp.xy[1];
      /* start dan finis berbagi satu titik: digeser sedikit agar dua-duanya terbaca */
      const dy = cp.type === 'start' ? -17 : (cp.type === 'finish' ? 17 : 0);
      out += '<g class="cp-dot" data-cp="' + i + '" tabindex="0" role="img" aria-label="' +
        cp.name + ', KM ' + cp.km + '">' +
        '<circle cx="' + x + '" cy="' + (y + dy) + '" r="15" fill="var(--surface)" stroke="' +
        TYPE_COLOR[cp.type] + '" stroke-width="4"/>' +
        '<circle cx="' + x + '" cy="' + (y + dy) + '" r="5.5" fill="' + TYPE_COLOR[cp.type] + '"/>' +
        '<text x="' + x + '" y="' + (y + dy + (dy < 0 ? -21 : 33)) + '" text-anchor="middle">' +
        cp.km.replace('.', ',') + '</text></g>';
    });

    svg.innerHTML =
      '<title id="mapTitle">Rute HIPMI RUN KARANGANYAR VOL. #1 kategori ' + r.nominalKm + 'K</title>' +
      '<desc id="mapDesc"></desc>' + out;
    if (desc) svg.querySelector('#mapDesc').textContent = desc.textContent;

    /* menyorot satu pos dari peta maupun dari daftar */
    function sorot(idx, on) {
      $$('[data-cp="' + idx + '"]').forEach(function (el) {
        if (el.classList.contains('cp')) el.setAttribute('data-active', String(on));
        else el.querySelector('circle').setAttribute('stroke-width', on ? '7' : '4');
      });
    }
    $$('[data-cp]').forEach(function (el) {
      const idx = el.getAttribute('data-cp');
      ['mouseenter', 'focus'].forEach(ev => el.addEventListener(ev, () => sorot(idx, true)));
      ['mouseleave', 'blur'].forEach(ev => el.addEventListener(ev, () => sorot(idx, false)));
    });
  }

  /* ---- ringkasan angka --------------------------------------------------- */
  function gambarRingkas() {
    const r = R();
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    set('#statGain', '+' + r.gainM + ' m');
    set('#statRange', r.minM + ' - ' + r.maxM + ' m');
    set('#statJarak', String(r.nominalKm).replace('.', ',') + ' km');
    const puncak = r.elevation.reduce((a, b) => (b.m > a.m ? b : a));
    set('#statPuncak', 'KM ' + puncak.km.toFixed(1).replace('.', ','));
  }

  /* ---- profil elevasi ---------------------------------------------------- */
  /* Digambar pada lebar piksel sebenarnya supaya satu satuan SVG sama dengan
     satu piksel CSS; viewBox tetap akan mengecilkan teks sumbu jadi tak terbaca
     di layar ponsel. Digambar ulang setiap lebarnya berubah. */
  const chart = $('#elevChart');
  let lastWidth = 0;

  function drawElevation() {
    if (!chart) return;
    const pts = R().elevation;
    const maxKm = R().nominalKm;
    const box = chart.getBoundingClientRect();
    const W = Math.round(box.width) || 640;
    if (!W) return;

    const narrow = W < 520;
    const Hh = narrow ? 250 : 300;
    const padL = narrow ? 42 : 50, padR = narrow ? 14 : 22;
    const padT = narrow ? 30 : 28, padB = narrow ? 40 : 44;
    const plotW = W - padL - padR, plotH = Hh - padT - padB;
    const step = 10;
    const ticks = [0, maxKm * 0.25, maxKm * 0.5, maxKm * 0.75, maxKm];

    chart.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);

    const metres = pts.map(p => p.m);
    const lo = Math.floor((Math.min.apply(null, metres) - 8) / step) * step;
    const hi = Math.ceil((Math.max.apply(null, metres) + 8) / step) * step;
    const x = km => padL + (km / maxKm) * plotW;
    const y = m => padT + plotH - ((m - lo) / (hi - lo)) * plotH;

    const line = pts.map((p, i) => (i ? 'L' : 'M') + x(p.km).toFixed(1) + ' ' + y(p.m).toFixed(1)).join(' ');
    const area = line + ' L' + x(maxKm).toFixed(1) + ' ' + (padT + plotH) + ' L' + padL + ' ' + (padT + plotH) + ' Z';
    const puncak = pts.reduce((a, b) => (b.m > a.m ? b : a));

    let out = '<title id="elevTitle">Profil elevasi rute ' + maxKm + ' kilometer, bergerak antara ' +
      Math.min.apply(null, metres) + ' dan ' + Math.max.apply(null, metres) +
      ' meter di atas permukaan laut, total tanjakan ' + R().gainM + ' meter.</title>' +
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
      const anchor = km === 0 ? 'start' : (km === maxKm ? 'end' : 'middle');
      const label = (Math.round(km * 10) / 10).toString().replace('.', ',');
      out += '<line stroke="var(--line-strong)" stroke-dasharray="3 4" x1="' + x(km) + '" y1="' + y(p.m) + '" x2="' + x(km) + '" y2="' + (padT + plotH) + '"/>' +
        '<circle cx="' + x(km) + '" cy="' + y(p.m) + '" r="4.5" fill="var(--gold)" stroke="var(--surface)" stroke-width="2">' +
        '<title>KM ' + label + ' pada ' + p.m + ' mdpl</title></circle>' +
        '<text x="' + x(km) + '" y="' + (Hh - 14) + '" text-anchor="' + anchor + '">' +
        (narrow ? label : 'KM ' + label) + '</text>';
    });

    out += '<text x="' + x(puncak.km) + '" y="' + (y(puncak.m) - 14) + '" text-anchor="middle" fill="var(--ink)">' +
      puncak.m + ' mdpl</text>';
    out += '<text x="' + padL + '" y="' + (narrow ? 14 : 15) + '" text-anchor="start">' +
      (narrow ? 'Ketinggian (mdpl)' : 'Ketinggian di atas permukaan laut (meter)') + '</text>';
    out += '<line class="elev-cursor" id="elevCursor" y1="' + padT + '" y2="' + (padT + plotH) + '"/>';
    out += '<circle class="elev-dot" id="elevDot" r="5" fill="var(--lime)" stroke="var(--surface)" stroke-width="2"/>';
    chart.innerHTML = out;

    wireReadout(W, Hh, padL, plotW, maxKm, x, y);
  }

  function metresAt(kmVal) {
    const pts = R().elevation;
    for (let i = 1; i < pts.length; i++) {
      if (kmVal <= pts[i].km) {
        const a = pts[i - 1], b = pts[i];
        const t = (kmVal - a.km) / (b.km - a.km || 1);
        return a.m + (b.m - a.m) * t;
      }
    }
    return pts[pts.length - 1].m;
  }

  function wireReadout(W, Hh, padL, plotW, maxKm, x, y) {
    const readout = $('#elevReadout');
    const cursor = $('#elevCursor');
    const dot = $('#elevDot');
    if (!readout || !cursor || !dot) return;

    function track(e) {
      const rect = chart.getBoundingClientRect();
      if (!rect.width) return;
      const vx = ((e.clientX - rect.left) / rect.width) * W;
      const kmVal = Math.min(maxKm, Math.max(0, ((vx - padL) / plotW) * maxKm));
      const m = metresAt(kmVal);
      const px = x(kmVal), py = y(m);

      cursor.setAttribute('x1', px); cursor.setAttribute('x2', px);
      cursor.setAttribute('data-on', 'true');
      dot.setAttribute('cx', px); dot.setAttribute('cy', py);
      dot.setAttribute('data-on', 'true');

      readout.innerHTML = 'KM ' + kmVal.toFixed(1).replace('.', ',') +
        ' · <b>' + Math.round(m) + ' mdpl</b>';
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

  /* ---- pemilih kategori -------------------------------------------------- */
  function pilih(key) {
    if (!H.ROUTES[key]) return;
    kini = key;
    $$('[data-route]').forEach(function (b) {
      const on = b.getAttribute('data-route') === key;
      b.setAttribute('aria-pressed', String(on));
    });
    gambarDaftar();
    gambarPeta();
    gambarRingkas();
    drawElevation();
  }

  $$('[data-route]').forEach(function (b) {
    b.addEventListener('click', function () { pilih(b.getAttribute('data-route')); });
  });

  pilih('10k');
  lastWidth = chart ? Math.round(chart.getBoundingClientRect().width) : 0;

  if (chart && 'ResizeObserver' in window) {
    new ResizeObserver(function () {
      const w = Math.round(chart.getBoundingClientRect().width);
      if (w && Math.abs(w - lastWidth) > 2) { lastWidth = w; drawElevation(); }
    }).observe(chart.parentElement);
  }
})();
