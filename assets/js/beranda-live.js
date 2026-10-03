/* ==========================================================================
   HIPMI RUN KARANGANYAR - beranda-live.js
   Beranda saat hari lomba. Begitu server timing RFID melaporkan wave pertama
   sudah dilepas, hitung mundur di hero berganti menjadi jam lomba, dan panel
   "Lomba langsung" muncul: jam tiap wave, hitungan finis, tiga tercepat per
   gender, dan finisher terbaru. Sebelum itu, atau bila server timing tidak
   terjangkau, beranda tampil seperti biasa.
   ========================================================================== */
(function () {
  'use strict';

  const { $ } = window.HipmiUI;
  const T = window.HipmiTiming;
  if (!T || !$('#langsung')) return;

  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const num = n => Number(n || 0).toLocaleString('id-ID');
  function elapsed (ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 3600) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
  }

  let skew = 0;           // jam server timing - jam perangkat ini
  let guns = [];          // waktu pistol wave yang sudah dilepas
  let seen = null;        // BIB finisher terbaru yang sudah tampil
  let subscribed = false;

  async function load () {
    let sum;
    try { sum = await T.get('/summary?limit=6'); } catch (e) { return; }
    if (!sum || !sum.categories.some(c => c.total > 0)) return;
    skew = sum.serverTime - Date.now();
    const cats = sum.categories;
    guns = cats.map(c => c.gun).filter(g => g != null);

    if (!subscribed) { subscribed = true; T.subscribe(loadSoon); }

    const running = guns.length > 0;
    $('#langsung').hidden = !running;
    $('#heroLive').hidden = !running;
    $('#heroStats').hidden = !running;
    $('#heroQuota').hidden = running;
    const cd = $('.countdown');
    if (cd) cd.hidden = running;
    if (!running) return;

    const fin = cats.reduce((a, c) => a + c.finished, 0);
    const run = cats.reduce((a, c) => a + c.running, 0);
    $('#heroStats').innerHTML = '<span><b>' + num(fin) + '</b> finis</span><span><b>' + num(run) + '</b> di lintasan</span><span>Lihat langsung &darr;</span>';

    const allIn = cats.every(c => c.gun != null) && run === 0 && fin > 0;
    $('#liveTitle').textContent = allIn ? 'Hasil sementara.' : 'Lomba sedang berjalan.';
    $('#liveSub').textContent = allIn
      ? 'Seluruh pelari yang terbaca sudah melintasi garis finis. Hasil resmi disahkan panitia setelah masa protes ditutup.'
      : 'Diperbarui otomatis setiap kali pelari melintasi timing mat.';

    // tiga tercepat per kategori dan gender
    const tops = await Promise.all(cats.map(c => Promise.all(['M', 'F'].map(g =>
      T.get('/results?ranked=1&limit=3&category=' + encodeURIComponent(c.id) + '&gender=' + g)
        .then(r => (r ? r.rows : [])).catch(() => [])))));

    $('#liveCats').innerHTML = cats.map(function (c, i) {
      const pctF = c.total ? (c.finished / c.total) * 100 : 0;
      const pctR = c.total ? (c.running / c.total) * 100 : 0;
      const top = (label, rows) => '<div><h4>' + label + '</h4>' + (rows.length
        ? '<ol>' + rows.map(r => '<li><i>' + r.genderPos + '</i><span title="' + esc(r.name) + '">' + esc(r.name) + '</span><b>' + T.dur(r.netMs) + '</b></li>').join('') + '</ol>'
        : '<p class="none">Belum ada finisher.</p>') + '</div>';
      return '<article class="panel-ink pad live-cat">' +
        '<div class="between"><h3 class="h-sm display">' + esc(c.name) + '</h3>' +
          (c.gun != null ? '<span class="chip chip-live"><span class="pulse" aria-hidden="true"></span> Berjalan</span>' : '<span class="chip">Menunggu flag-off</span>') + '</div>' +
        '<p class="live-clock tel" data-gun="' + (c.gun || '') + '">' + (c.gun != null ? elapsed(Date.now() + skew - c.gun) : '-') +
          '<small>' + (c.gun != null ? 'Flag-off ' + T.clock(c.gun) + ' WIB' : 'Wave belum dilepas') + '</small></p>' +
        '<div class="live-stats">' +
          '<div><b>' + num(c.finished) + '</b><span>Finis</span></div>' +
          '<div><b>' + num(c.running) + '</b><span>Di lintasan</span></div>' +
          '<div><b>' + num(c.total) + '</b><span>Peserta</span></div></div>' +
        '<div class="live-bar" role="img" aria-label="' + num(c.finished) + ' dari ' + num(c.total) + ' peserta sudah finis">' +
          '<i class="f" style="width:' + pctF.toFixed(1) + '%"></i><i class="r" style="width:' + pctR.toFixed(1) + '%"></i></div>' +
        '<div class="live-top">' + top('Putra', tops[i][0]) + top('Putri', tops[i][1]) + '</div>' +
        '</article>';
    }).join('');

    const prev = seen;
    $('#liveLatest').innerHTML = sum.latest.length
      ? sum.latest.map(r => '<li' + (prev && !prev.has(r.bib) ? ' class="is-new"' : '') + '>' +
          '<a href="hasil.html?bib=' + encodeURIComponent(r.bib) + '">' + esc(r.name) + '</a>' +
          '<span class="t">' + T.dur(r.netMs) + '</span>' +
          '<span class="m">BIB ' + esc(r.bib) + ' &middot; ' + esc(r.categoryName) +
            (r.genderPos ? ' &middot; ' + (r.gender === 'F' ? 'Putri' : 'Putra') + ' #' + r.genderPos : '') + '</span></li>').join('')
      : '<li class="empty-row">Belum ada pelari yang melintasi garis finis.</li>';
    seen = new Set(sum.latest.map(r => r.bib));
  }

  let timer = null;
  function loadSoon () {
    if (timer) return;
    timer = window.setTimeout(function () { timer = null; load(); }, 2000);
  }

  // jam berdetak di sisi peramban; data hanya ditarik saat hasil berubah
  window.setInterval(function () {
    if (!guns.length) return;
    const now = Date.now() + skew;
    $('#heroClock').textContent = elapsed(now - Math.min.apply(null, guns));
    document.querySelectorAll('.live-clock[data-gun]').forEach(function (el) {
      const g = Number(el.dataset.gun);
      if (g) el.firstChild.textContent = elapsed(now - g);
    });
  }, 1000);

  $('#liveBib').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 4); });

  load();
  // sebelum flag-off tidak ada aliran yang dipantau; periksa berkala supaya
  // panel muncul sendiri tanpa pengunjung harus memuat ulang halaman
  window.setInterval(function () { if (!subscribed) load(); }, 60000);
})();
