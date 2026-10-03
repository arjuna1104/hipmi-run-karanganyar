/* ==========================================================================
   HIPMI RUN KARANGANYAR - timing.js
   Konsol operator timing RFID.

   Mesinnya menyimpan satu hal saja: daftar bacaan mentah {bib, mat, waktu}.
   Seluruh hasil (net time, gun time, split, peringkat) dihitung ulang dari
   daftar itu, bukan disimpan terpisah. Jadi entri manual, pembatalan, dan
   koreksi wasit langsung tercermin di hasil tanpa sinkronisasi tambahan.

   MENYAMBUNG KE PERANGKAT KERAS
   Ganti isi startAdapter() dengan koneksi ke reader Anda, lalu panggil
   ingest({ chip, mat, at }) setiap kali ada bacaan. Sisanya tidak berubah.
   ========================================================================== */
(function () {
  'use strict';

  const { $, $$, toast } = window.HipmiUI;
  const H = window.HIPMI;
  const KEY = 'hipmi-timing-v1';

  /* ====================================================================
     1. Susunan lintasan
     ==================================================================== */
  const MATS = [
    { id: 'start',  label: 'Start Arch',        km: 0,    both: true  },
    { id: 'km25',   label: 'Split KM 2,5',      km: 2.5,  both: true  },
    { id: 'km50',   label: 'Split KM 5,0',      km: 5.0,  both: true  },
    { id: 'km75',   label: 'Split KM 7,5',      km: 7.5,  both: false },
    { id: 'finish', label: 'Finish Line',       km: null, both: true  }
  ];

  const WAVES = [
    { id: 'A', label: 'Wave A - 10K Challenge', cat: '10k', offsetMin: 0  },
    { id: 'B', label: 'Wave B - 5K Fun Run',    cat: '5k',  offsetMin: 25 }
  ];

  const COT_MIN = { '10k': 135, '5k': 75 };   // cut-off dalam menit

  /* ====================================================================
     2. Keadaan
     ==================================================================== */
  const blank = () => ({ reads: [], waves: {}, flags: {}, chips: {}, matDown: {} });

  function load () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* mode privat */ }
    return blank();
  }
  function save () {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ }
  }

  let state = load();
  let resCat = 'all';

  /* peserta contoh: gabungan dataset publik dan pendaftaran sesi ini */
  function roster () {
    const out = {};
    Object.values(H.RUNNERS).forEach(r => { out[r.bib] = { bib: r.bib, name: r.name, cat: r.category }; });
    Object.keys(H.RESULTS).forEach(cat => {
      ['putra', 'putri'].forEach(g => (H.RESULTS[cat][g] || []).forEach(r => {
        if (!out[r.bib]) out[r.bib] = { bib: r.bib, name: r.name, cat: cat };
      }));
    });
    return out;
  }
  const ROSTER = roster();
  const runnerOf = bib => ROSTER[bib] || null;

  /* ====================================================================
     3. Waktu
     ==================================================================== */
  const pad = n => String(n).padStart(2, '0');
  function clock (ms) {
    if (ms == null || ms < 0) return '--:--:--';
    const s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
  }
  function mmss (ms) {
    if (ms == null || ms < 0) return '--:--';
    const s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  const jam = iso => new Date(iso).toLocaleTimeString('id-ID', { hour12: false });

  const firstGun = () => {
    const t = Object.values(state.waves).filter(Boolean).map(v => new Date(v).getTime());
    return t.length ? Math.min.apply(null, t) : null;
  };

  /* Seluruh konsol berjalan di jam lomba, bukan jam dinding. Saat demo, satu
     detik nyata mewakili SPEEDUP detik lomba, sehingga finisher muncul dalam
     puluhan detik tetapi catatan waktunya tetap wajar. Saat tersambung ke
     reader sungguhan, SPEEDUP dibuat 1 dan jam lomba sama dengan jam dinding. */
  const SPEEDUP = 90;
  function nowRace () {
    const g = firstGun();
    if (!g) return Date.now();
    return g + (Date.now() - g) * SPEEDUP;
  }

  /* ====================================================================
     4. Bacaan
     ==================================================================== */
  function ingest ({ bib, chip, mat, at, source }) {
    if (!bib && chip) bib = state.chips[chip];
    if (!bib || !mat) return null;

    const when = at || new Date(nowRace()).toISOString();

    // mat yang sama dalam 20 detik dianggap pantulan chip, bukan lintasan baru
    const dup = state.reads.find(r =>
      r.bib === bib && r.mat === mat && Math.abs(new Date(r.at) - new Date(when)) < 20000);
    if (dup) return null;

    const read = { id: 'r' + Date.now() + Math.random().toString(16).slice(2, 6),
                   bib: bib, mat: mat, at: when, source: source || 'rfid' };
    state.reads.unshift(read);
    if (state.reads.length > 600) state.reads.length = 600;
    save();
    return read;
  }

  const readsOf = bib => state.reads.filter(r => r.bib === bib)
    .slice().sort((a, b) => new Date(a.at) - new Date(b.at));

  /* ====================================================================
     5. Hasil dihitung ulang dari bacaan
     ==================================================================== */
  function resultOf (bib) {
    const run = runnerOf(bib);
    if (!run) return null;

    const rs = readsOf(bib);
    const at = id => { const r = rs.find(x => x.mat === id); return r ? new Date(r.at).getTime() : null; };

    const flag = state.flags[bib] || '';
    const wave = WAVES.find(w => w.cat === run.cat);
    const gunAt = wave && state.waves[wave.id] ? new Date(state.waves[wave.id]).getTime() : null;

    const startAt = at('start') || gunAt;        // tanpa bacaan start, pakai gun
    const finishAt = at('finish');

    const netMs = (finishAt && startAt) ? finishAt - startAt : null;
    const gunMs = (finishAt && gunAt) ? finishAt - gunAt : null;

    const expected = MATS.filter(m => m.id !== 'finish' && (m.both || run.cat === '10k'));
    const missing = expected.filter(m => !at(m.id)).map(m => m.id);

    const overCot = netMs != null && netMs > COT_MIN[run.cat] * 60000;

    return {
      bib: bib, name: run.name, cat: run.cat, flag: flag,
      startAt: startAt, finishAt: finishAt,
      netMs: netMs, gunMs: gunMs,
      splits: MATS.filter(m => m.km).map(m => ({ id: m.id, km: m.km, t: at(m.id) })),
      missing: missing, overCot: overCot,
      manual: rs.some(r => r.source === 'manual'),
      ranked: !flag && netMs != null && !overCot
    };
  }

  function standings () {
    const bibs = [...new Set(state.reads.map(r => r.bib))];
    const rows = bibs.map(resultOf).filter(Boolean)
      .filter(r => resCat === 'all' || r.cat === resCat);

    const done = rows.filter(r => r.netMs != null)
      .sort((a, b) => a.netMs - b.netMs);
    let pos = 0;
    done.forEach(r => { r.pos = r.ranked ? ++pos : null; });

    const running = rows.filter(r => r.netMs == null)
      .sort((a, b) => (b.startAt || 0) - (a.startAt || 0));

    return done.concat(running);
  }

  /* ====================================================================
     6. Tampilan
     ==================================================================== */
  function paintWaves () {
    $('#waveList').innerHTML = WAVES.map(function (w) {
      const gun = state.waves[w.id];
      return '<div class="wave-row" data-wave="' + w.id + '">' +
        '<span class="wave-tag">' + w.id + '</span>' +
        '<span class="wave-name"><b>' + w.label + '</b>' +
        '<span>' + (gun ? 'Dilepas ' + jam(gun) : 'Menunggu pelepasan') + '</span></span>' +
        (gun
          ? '<span class="chip chip-live">Berjalan</span>'
          : '<button class="btn btn-lime btn-sm" type="button" data-start="' + w.id + '">' +
            '<i class="ph-fill ph-flag-checkered" aria-hidden="true"></i> Lepas</button>') +
        '</div>';
    }).join('');

    const onCourse = [...new Set(state.reads.map(r => r.bib))]
      .filter(b => { const r = resultOf(b); return r && r.netMs == null && !r.flag; }).length;
    $('#onCourse').textContent = onCourse + ' di lintasan';
  }

  function paintMats () {
    const now = Date.now();
    $('#matGrid').innerHTML = MATS.map(function (m) {
      const rs = state.reads.filter(r => r.mat === m.id);
      const last = rs[0];
      const down = !!state.matDown[m.id];
      const fresh = last && (now - new Date(last.at).getTime() < 90000);
      const st = down ? 'down' : (fresh ? 'live' : 'idle');
      return '<article class="mat" data-state="' + st + '">' +
        '<div class="mat-top">' +
          '<span class="mat-dot" aria-hidden="true"></span>' +
          '<b>' + m.label + '</b>' +
          '<button class="mat-toggle" type="button" data-mat-toggle="' + m.id + '" ' +
          'aria-label="' + (down ? 'Aktifkan' : 'Nonaktifkan') + ' ' + m.label + '">' +
          '<i class="ph ph-power" aria-hidden="true"></i></button>' +
        '</div>' +
        '<p class="mat-count tel">' + rs.length + '</p>' +
        '<p class="mat-meta">' + (down ? 'Nonaktif' : (last ? 'Terakhir ' + jam(last.at) : 'Belum ada bacaan')) + '</p>' +
        '</article>';
    }).join('');

    const live = MATS.filter(m => !state.matDown[m.id]).length;
    $('#matSummary').textContent = live + ' dari ' + MATS.length + ' daring';
  }

  function paintFeed () {
    const rows = state.reads.slice(0, 40);
    $('#feedEmpty').hidden = rows.length > 0;
    $('#feed').innerHTML = rows.map(function (r) {
      const run = runnerOf(r.bib);
      const mat = MATS.find(m => m.id === r.mat);
      return '<div class="feed-row' + (r.source === 'manual' ? ' is-manual' : '') + '">' +
        '<span class="feed-time tel">' + jam(r.at) + '</span>' +
        '<span class="feed-bib tel">' + r.bib + '</span>' +
        '<span class="feed-name">' + (run ? run.name : 'Tidak terdaftar') + '</span>' +
        '<span class="feed-mat">' + (mat ? mat.label : r.mat) + '</span>' +
        (r.source === 'manual' ? '<span class="chip chip-gold">Manual</span>' : '') +
        '</div>';
    }).join('');
  }

  function paintResults () {
    const rows = standings();
    $('#resEmpty').hidden = rows.length > 0;
    $('#resBody').closest('.panel').hidden = rows.length === 0;

    $('#resBody').innerHTML = rows.map(function (r) {
      const cat = H.catById(r.cat);
      const splits = r.splits.filter(s => s.t).length + '/' + r.splits.length;
      let status = '<span class="chip chip-live">Selesai</span>';
      if (r.flag) status = '<span class="chip chip-danger">' + r.flag + '</span>';
      else if (r.netMs == null) status = '<span class="chip">Di lintasan</span>';
      else if (r.overCot) status = '<span class="chip chip-gold">Lewat COT</span>';
      else if (r.missing.length) status = '<span class="chip chip-gold">Split kurang</span>';

      return '<tr' + (r.manual ? ' data-manual="true"' : '') + '>' +
        '<td class="lb-rank">' + (r.pos || '-') + '</td>' +
        '<td class="lb-bib">' + r.bib + '</td>' +
        '<td class="lb-name">' + r.name + '</td>' +
        '<td class="muted col-club">' + (cat ? cat.name : r.cat) + '</td>' +
        '<td class="lb-time r col-gun">' + clock(r.gunMs) + '</td>' +
        '<td class="lb-time r">' + clock(r.netMs) + '</td>' +
        '<td class="lb-pace r col-split">' + splits + '</td>' +
        '<td class="r">' + status + '</td>' +
        '</tr>';
    }).join('');
  }

  function paintClock () {
    const gun = firstGun();
    $('#raceClock').textContent = gun ? clock(nowRace() - gun) : '00:00:00';
    $('#raceState').textContent = gun
      ? 'Wave pertama dilepas ' + jam(new Date(gun).toISOString())
      : 'Belum dimulai';
  }

  function paintAll () { paintWaves(); paintMats(); paintFeed(); paintResults(); paintClock(); }

  /* ====================================================================
     7. Simulator bacaan
     Berdiri di tempat perangkat keras. Setiap detik, sebagian peserta yang
     sedang di lintasan menghasilkan bacaan di mat berikutnya sesuai laju
     wajarnya. Diganti startAdapter() saat reader sungguhan tersedia.
     ==================================================================== */
  const PACE = { '10k': 330, '5k': 300 };      // detik per km, rata-rata lapangan

  /* sebaran 0..1 yang stabil untuk satu nomor dada */
  function spread (bib) {
    let h = 0x9e37;
    const str = String(bib);
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) >>> 0;
    return (h % 1000) / 1000;
  }
  const FIELD = {};                             // bib -> {cat, paceSec, startRace}

  function enrol (waveId) {
    const w = WAVES.find(x => x.id === waveId);
    const gun = new Date(state.waves[waveId]).getTime();
    Object.values(ROSTER).filter(r => r.cat === w.cat).slice(0, 26).forEach(function (r, i) {
      if (state.flags[r.bib] === 'DNS') return;
      // pelepasan bertahap di gate: dua detik lomba antar pelari
      const startRace = gun + i * 2000;
      FIELD[r.bib] = {
        cat: r.cat,
        // laju diturunkan dari nomor dada, bukan diacak. Kalau diacak, memuat
        // ulang halaman menghasilkan waktu lintas berbeda sehingga bacaan yang
        // sama tercatat dua kali dan jumlah di mat tengah melampaui mat start.
        paceSec: PACE[r.cat] * (0.72 + spread(r.bib) * 0.55),
        startRace: startRace
      };
      ingest({ bib: r.bib, mat: 'start', at: new Date(startRace).toISOString() });
    });
  }

  function startAdapter () {
    window.setInterval(function () {
      const raceNow = nowRace();
      Object.keys(FIELD).forEach(function (bib) {
        const f = FIELD[bib];
        if (raceNow < f.startRace) return;
        const dist = H.catById(f.cat).distance;

        MATS.forEach(function (m) {
          if (m.id === 'start') return;
          if (state.matDown[m.id]) return;                 // mat mati tidak membaca
          const markKm = m.id === 'finish' ? dist : m.km;
          if (markKm > dist) return;                       // 5K tidak melewati KM 7,5
          const crossAt = f.startRace + markKm * f.paceSec * 1000;
          if (raceNow < crossAt) return;
          if (ingest({ bib: bib, mat: m.id, at: new Date(crossAt).toISOString() })) needsPaint = true;
        });
      });
    }, 1000);
  }

  let needsPaint = false;
  window.setInterval(function () {
    paintClock();
    if (needsPaint) { needsPaint = false; paintWaves(); paintMats(); paintFeed(); paintResults(); }
  }, 1000);

  /* ====================================================================
     8. Interaksi
     ==================================================================== */
  function fieldError (name, msg) {
    const f = $('[data-field="' + name + '"]');
    if (!f) return;
    f.setAttribute('data-invalid', String(!!msg));
    const err = $('.err', f);
    if (err) { err.hidden = !msg; if (msg) $('span', err).textContent = msg; }
  }

  $('#waveList').addEventListener('click', function (e) {
    const b = e.target.closest('[data-start]');
    if (!b) return;
    const id = b.dataset.start;
    state.waves[id] = new Date(nowRace()).toISOString();
    save();
    enrol(id);
    paintAll();
    toast('Wave ' + id + ' dilepas. Bacaan mulai masuk.');
  });

  $('#matGrid').addEventListener('click', function (e) {
    const b = e.target.closest('[data-mat-toggle]');
    if (!b) return;
    const id = b.dataset.matToggle;
    state.matDown[id] = !state.matDown[id];
    save(); paintMats();
    const m = MATS.find(x => x.id === id);
    toast(m.label + (state.matDown[id] ? ' dinonaktifkan. Pakai entri manual.' : ' kembali daring.'),
          state.matDown[id] ? 'warn' : 'ok');
  });

  $('#mMat').innerHTML = MATS.map(m => '<option value="' + m.id + '">' + m.label + '</option>').join('');

  $('#manualForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const bib = $('#mBib').value.replace(/\D/g, '');
    if (!runnerOf(bib)) { fieldError('mBib', 'Nomor dada tidak terdaftar.'); return; }
    fieldError('mBib', '');
    const r = ingest({ bib: bib, mat: $('#mMat').value, source: 'manual' });
    if (!r) { toast('Bacaan serupa sudah tercatat kurang dari 20 detik lalu.', 'warn'); return; }
    $('#mBib').value = '';
    paintAll();
    toast('Bacaan manual ' + bib + ' dicatat di ' + MATS.find(m => m.id === r.mat).label + '.');
  });

  $('#flagForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const bib = $('#fBib').value.replace(/\D/g, '');
    if (!runnerOf(bib)) { fieldError('fBib', 'Nomor dada tidak terdaftar.'); return; }
    fieldError('fBib', '');
    const st = $('#fStatus').value;
    if (st) state.flags[bib] = st; else delete state.flags[bib];
    save(); paintAll();
    $('#fBib').value = '';
    toast(st ? 'Nomor ' + bib + ' ditandai ' + st + '.' : 'Penandaan nomor ' + bib + ' dicabut.',
          st ? 'warn' : 'ok');
  });

  $('#chipForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const bib = $('#cBib').value.replace(/\D/g, '');
    const chip = $('#cChip').value.trim();
    if (!runnerOf(bib)) { fieldError('cBib', 'Nomor dada tidak terdaftar.'); return; }
    if (chip.length < 4) { fieldError('cChip', 'Nomor chip terlalu pendek.'); return; }
    const taken = Object.keys(state.chips).find(c => c === chip && state.chips[c] !== bib);
    if (taken) { fieldError('cChip', 'Chip ini sudah terikat ke nomor ' + state.chips[chip] + '.'); return; }
    fieldError('cBib', ''); fieldError('cChip', '');
    state.chips[chip] = bib;
    save();
    $('#cBib').value = ''; $('#cChip').value = '';
    toast('Chip ' + chip + ' terikat ke nomor dada ' + bib + '.');
  });

  $$('[data-rescat]').forEach(b => b.addEventListener('click', function () {
    resCat = b.dataset.rescat;
    $$('[data-rescat]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    paintResults();
  }));

  $('#btnReset').addEventListener('click', function () {
    state = blank(); save();
    Object.keys(FIELD).forEach(k => delete FIELD[k]);
    paintAll();
    toast('Sesi timing dikosongkan.', 'warn');
  });

  $('#btnExport').addEventListener('click', function () {
    const rows = standings();
    if (!rows.length) { toast('Belum ada hasil untuk diekspor.', 'warn'); return; }
    const head = ['pos', 'bib', 'nama', 'kategori', 'gun_time', 'net_time', 'split_terbaca', 'status'];
    const body = rows.map(r => [
      r.pos || '', r.bib, r.name, r.cat, clock(r.gunMs), clock(r.netMs),
      r.splits.filter(s => s.t).length + '/' + r.splits.length,
      r.flag || (r.netMs == null ? 'DI LINTASAN' : (r.overCot ? 'LEWAT COT' : 'FINIS'))
    ]);
    const csv = [head].concat(body)
      .map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hasil-timing-hipmi-run-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(rows.length + ' baris hasil diekspor ke CSV.');
  });

  ['#mBib', '#fBib', '#cBib'].forEach(sel => $(sel).addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
  }));

  /* ====================================================================
     9. Jalan
     ==================================================================== */
  // pulihkan peserta yang sudah di lintasan bila halaman dimuat ulang
  Object.keys(state.waves).forEach(id => { if (state.waves[id]) enrol(id); });
  paintAll();
  startAdapter();
})();
