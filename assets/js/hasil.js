/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - hasil.js
   BIB lookup, barcode scanner, e-Pass, finisher certificate, split pace
   comparison, race photo stream, and the live leaderboard.
   ========================================================================== */
(function () {
  'use strict';

  const { $, $$, openModal, renderQR, reduced } = window.HipmiUI;
  const H = window.HIPMI;
  const T = window.HipmiTiming;

  /* ====================================================================
     0. Sumber data
     LIVE bila server timing RFID terjangkau dan sudah berisi peserta. Selain
     itu halaman memakai data contoh di data.js, seperti sebelum hari lomba.
     ==================================================================== */
  let LIVE = false;
  let RESULTS = H.RESULTS;

  const WAVE_LABEL = cat => cat === '5k' ? 'Wave B - 06:10 WIB' : 'Wave A - 05:45 WIB';
  const distanceOf = r => (H.catById(r.category) || {}).distance || (r.live && r.live.distance) || 0;

  function boardRow (x) {
    return {
      rank: x.genderPos, bib: x.bib, name: x.name, club: x.club || 'Independen',
      gun: T.dur(x.gunMs), net: T.dur(x.netMs), pace: T.pace(x.paceSecKm), live: x
    };
  }

  async function loadLive () {
    try {
      const sum = await T.get('/summary?limit=1');
      if (!sum || !sum.categories.some(c => c.total > 0)) throw new Error('Server timing belum berisi peserta');
      const next = {};
      await Promise.all(sum.categories.map(async function (c) {
        const r = await T.get('/results?ranked=1&category=' + encodeURIComponent(c.id));
        const rows = r ? r.rows : [];
        const byGender = g => rows.filter(x => x.gender === g && x.genderPos)
          .sort((a, b) => a.genderPos - b.genderPos).map(boardRow);
        next[c.id] = { finishers: c.finished, putra: byGender('M'), putri: byGender('F') };
      }));
      RESULTS = next;
      setSource(true);
    } catch (e) {
      RESULTS = H.RESULTS;
      setSource(false);
    }
    return LIVE;
  }

  function setSource (live) {
    LIVE = live;
    const chip = $('#feedChip');
    if (chip) {
      chip.className = live ? 'chip chip-live' : 'chip chip-gold';
      chip.innerHTML = live
        ? '<span class="pulse" aria-hidden="true"></span> Langsung dari timing RFID'
        : '<i class="ph ph-flask" aria-hidden="true"></i> Data contoh';
    }
    const note = $('#sourceNote');
    if (note) {
      note.textContent = live
        ? 'Waktu dan peringkat dibaca langsung dari sistem timing RFID dan diperbarui otomatis saat pelari melintasi timing mat. Hasil resmi disahkan panitia setelah masa protes ditutup.'
        : 'Seluruh waktu, peringkat, dan foto di halaman ini adalah data contoh yang dipakai untuk menguji antarmuka sebelum hari lomba. Data resmi tampil otomatis begitu server timing RFID aktif.';
    }
    const quick = $('.quick-bibs');
    if (quick) quick.hidden = live;
  }

  /* ====================================================================
     1. BIB lookup
     ==================================================================== */
  const lookupForm = $('#lookupForm');
  const bibInput = $('#bibInput');
  const states = {
    empty: $('#runnerEmpty'),
    loading: $('#runnerLoading'),
    missing: $('#runnerMissing'),
    panel: $('#runnerPanel')
  };
  let current = null;

  function showState(name) {
    Object.keys(states).forEach(k => { if (states[k]) states[k].hidden = k !== name; });
  }

  function fieldError(msg) {
    const f = $('[data-field="bib"]');
    const err = $('.err', f);
    if (msg) {
      f.setAttribute('data-invalid', 'true');
      $('span', err).textContent = msg;
      err.hidden = false;
      bibInput.setAttribute('aria-invalid', 'true');
    } else {
      f.removeAttribute('data-invalid');
      err.hidden = true;
      bibInput.removeAttribute('aria-invalid');
    }
  }

  function lookup(bib) {
    bib = String(bib || '').replace(/\D/g, '').slice(0, 4);
    bibInput.value = bib;

    // peserta reguler memakai empat digit; nomor kehormatan dua digit
    if (bib.length < 2) {
      fieldError('Nomor dada terdiri dari dua sampai empat digit angka.');
      showState('empty');
      return;
    }
    fieldError(null);
    showState('loading');

    const asked = bib;
    resolveRunner(bib).then(function (runner) {
      if (bibInput.value !== asked) return;          // pengguna sudah mencari nomor lain
      if (!runner) {
        $('#runnerMissingText').textContent =
          'Nomor dada ' + bib + ' tidak terdaftar pada edisi 2026. Periksa kembali empat digit pada nomor dada Anda.';
        showState('missing');
        return;
      }
      current = runner;
      renderRunner(runner);
      showState('panel');
      syncLeaderboardTo(runner);
    });
  }

  /* Data pendaftaran yang ada di perangkat ini: dataset contoh, pendaftaran
     sesi ini, atau nomor kehormatan dari portal panitia. */
  function localRunner (bib) {
    let runner = H.RUNNERS[bib];
    if (!runner) {
      try {
        const saved = sessionStorage.getItem('hipmi-reg-' + bib);
        if (saved) runner = JSON.parse(saved);
      } catch (e) { /* private mode */ }
    }
    return runner || honourRunner(bib);
  }

  async function resolveRunner (bib) {
    const local = localRunner(bib);
    if (!LIVE) {
      await new Promise(r => window.setTimeout(r, 400));
      return local;
    }
    let live;
    try { live = await T.get('/results/' + encodeURIComponent(bib)); }
    catch (e) { return local; }
    // terdaftar di perangkat ini tetapi belum ada di server timing: tanpa hasil
    if (!live) return local ? Object.assign({}, local, { result: null, status: 'registered', live: null }) : null;
    return fromLive(live, local);
  }

  /* Gabungkan hasil timing dengan data pendaftaran (jersey, golongan darah,
     kontak darurat) bila tersedia di perangkat ini. */
  function fromLive (x, base) {
    const finished = x.status === 'finished' || x.status === 'cutoff';
    const gender = x.gender === 'F' ? 'Putri' : (x.gender === 'M' ? 'Putra' : '-');
    return {
      bib: x.bib, name: x.name, category: x.category, categoryName: x.categoryName,
      gender: gender, age: base ? base.age : null, city: base ? base.city : null,
      club: x.club || (base ? base.club : ''),
      jersey: base ? base.jersey : '-', blood: base ? base.blood : '-',
      chip: base ? base.chip : 'RFID-BIB-' + x.bib,
      wave: base ? base.wave : WAVE_LABEL(x.category),
      emergency: base ? base.emergency : 'Sesuai data pendaftaran',
      emergencyPhone: base ? base.emergencyPhone : '-',
      honour: !!(base && base.honour), honourType: base && base.honourType, title: base && base.title,
      competitive: x.competitive,
      status: finished ? 'finished' : x.status,
      rpc: base ? base.rpc : [
        { item: 'Nomor dada (BIB) dengan tag RFID', done: false, at: null },
        { item: 'Jersey dry-fit', done: false, at: null },
        { item: 'Goodie bag + kupon refreshment', done: false, at: null }
      ],
      photos: base ? base.photos : [],
      live: x,
      result: finished ? {
        rank: x.pos, of: x.of, gun: T.dur(x.gunMs), net: T.dur(x.netMs), pace: T.pace(x.paceSecKm),
        cutoff: x.status === 'cutoff'
      } : null
    };
  }

  lookupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    lookup(bibInput.value);
  });
  bibInput.addEventListener('input', function () {
    bibInput.value = bibInput.value.replace(/\D/g, '').slice(0, 4);
    fieldError(null);
  });
  $$('.quick-bibs button').forEach(b => b.addEventListener('click', () => lookup(b.dataset.bib)));

  /* Nomor kehormatan diterbitkan panitia lewat portal admin. Nomor itu tetap
     membuka e-Pass seperti peserta biasa, tetapi tamu non-kompetitif tidak
     masuk leaderboard dan sertifikatnya tidak mencantumkan peringkat. */
  function honourRunner(bib) {
    let list = [];
    try {
      const raw = localStorage.getItem('hipmi-bib-exceptions');
      list = raw ? JSON.parse(raw) : H.SEED_EXCEPTIONS;
    } catch (e) { list = H.SEED_EXCEPTIONS; }

    const norm = v => String(v).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    const hit = (list || []).find(x => x && x.status === 'aktif' && norm(x.bib) === norm(bib));
    if (!hit) return null;

    const cat = H.catById(hit.category);
    const typeLabel = (H.EXCEPTION_TYPES.find(t => t.id === hit.type) || {}).label || 'Nomor kehormatan';
    const padded = String(norm(hit.bib)).padStart(2, '0');

    return {
      bib: padded, name: hit.name, honour: true, honourType: typeLabel,
      title: hit.title, competitive: !!hit.competitive,
      category: hit.category, categoryName: cat ? cat.name : '-',
      gender: '-', age: '-', city: hit.title, club: hit.title,
      jersey: hit.jersey || '-', blood: '-',
      chip: 'UHF-DF-8824' + padded,
      wave: hit.category === '5k' ? 'Wave B - 06:10 WIB' : 'Wave A - 05:45 WIB',
      emergency: 'Protokol panitia', emergencyPhone: '+62 271 495 728',
      status: 'registered',
      rpc: [
        { item: 'Nomor dada (BIB) + safety pin', done: false, at: null },
        { item: 'Jersey dry-fit ukuran ' + (hit.jersey || 'menyusul'), done: false, at: null },
        { item: 'Timing chip RFID', done: false, at: null },
        { item: 'Goodie bag + kupon refreshment', done: false, at: null }
      ],
      result: null, photos: []
    };
  }

  /* ====================================================================
     2. Runner rendering
     ==================================================================== */
  function checksum(seed) {
    let h = 0x1f35;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) >>> 0;
    return h.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
  }
  function epassPayload(r) {
    return 'HKR26.' + r.bib + '.' + r.chip + '.' + checksum(r.bib + r.chip + r.name);
  }

  function renderRunner(r, keepTab) {
    $('#rName').textContent = r.name;
    $('#rMeta').textContent = r.honour
      ? r.title + ' · ' + r.categoryName
      : [r.categoryName, r.gender !== '-' && r.gender, r.age && r.age + ' tahun', r.city || r.club]
          .filter(Boolean).join(' · ');

    const status = $('#rStatus');
    const seen = r.live && r.live.lastSeen;
    if (r.honour) {
      status.className = 'chip chip-honour';
      status.textContent = r.honourType + (r.competitive ? '' : ' · non-kompetitif');
    } else if (r.status === 'finished') {
      status.className = 'chip chip-live';
      status.textContent = r.result && r.result.cutoff ? 'Finis, melewati batas waktu' : 'Finis tercatat';
    } else if (r.status === 'running' && seen) {
      status.className = 'chip chip-live';
      status.textContent = 'Di lintasan · ' + seen.name + ' ' + T.clock(seen.t);
    } else if (r.status === 'started') {
      status.className = 'chip chip-gold';
      status.textContent = 'Wave dilepas, tag belum terbaca';
    } else if (['DNF', 'DNS', 'DSQ'].includes(r.status)) {
      status.className = 'chip chip-danger';
      status.textContent = { DNF: 'Tidak finis (DNF)', DNS: 'Tidak start (DNS)', DSQ: 'Didiskualifikasi' }[r.status];
    } else {
      status.className = 'chip chip-gold';
      status.textContent = 'Terdaftar, belum start';
    }

    // e-Pass
    $('#epBib').textContent = r.bib;
    $('#epCat').textContent = r.categoryName;
    $('#epName').textContent = r.name;
    $('#epWave').textContent = r.wave;
    $('#epJersey').textContent = r.jersey;
    $('#epBlood').textContent = r.blood;
    $('#epChip').textContent = r.chip;
    $('#epEmergency').textContent = r.emergency + ' · ' + r.emergencyPhone;

    // race pack checklist
    const list = $('#rpcList');
    list.innerHTML = '';
    let taken = 0;
    r.rpc.forEach(function (item) {
      if (item.done) taken++;
      const row = document.createElement('div');
      row.className = 'rpc-item';
      row.setAttribute('data-done', String(item.done));
      row.innerHTML =
        '<i class="ph' + (item.done ? '-fill ph-check-circle' : ' ph-circle-dashed') + ' tick" aria-hidden="true"></i>' +
        '<span><b>' + item.item + '</b>' +
        '<span class="rpc-sub">' + (item.done ? 'Diverifikasi marshall RPC' : 'Menunggu pengambilan di Gedung Wanita') + '</span></span>' +
        '<span class="rpc-time">' + (item.at || '-') + '</span>';
      list.appendChild(row);
    });
    $('#rpcCount').textContent = taken + ' dari ' + r.rpc.length;

    renderResult(r);
    renderPhotos(r);
    if (!keepTab) selectTab('tab-epass');
  }

  /* ---- certificate + split pace ---------------------------------------- */
  function renderResult(r) {
    const ready = $('#resultReady');
    const pending = $('#resultPending');
    if (!r.result) {
      ready.hidden = true;
      pending.hidden = false;
      const note = pending.querySelector('p');
      if (note) {
        const seen = r.live && r.live.lastSeen;
        const finishKm = String(distanceOf(r).toFixed(1)).replace('.', ',');
        if (r.honour && !r.competitive) {
          note.textContent = 'Sebagai peserta undangan non-kompetitif, catatan waktu Anda tetap direkam dan sertifikat finisher tetap terbit, tetapi nomor ini tidak masuk leaderboard maupun perebutan hadiah podium.';
        } else if (['DNF', 'DNS', 'DSQ'].includes(r.status)) {
          note.textContent = 'Panitia mencatat status ' + r.status + ' untuk nomor ini. Hubungi meja timing bila menurut Anda ada kekeliruan.';
        } else if (r.status === 'running' && seen) {
          note.textContent = 'Terakhir terbaca di ' + seen.name + ' pukul ' + T.clock(seen.t) +
            '. Sertifikat dan split pace muncul otomatis begitu timing mat di garis finis KM ' + finishKm + ' membaca tag nomor dada Anda.';
        } else {
          note.textContent = 'Sertifikat finisher dan analisis split pace muncul otomatis begitu timing mat di garis finis KM ' + finishKm + ' membaca tag nomor dada Anda.';
        }
      }
      return;
    }
    pending.hidden = true;
    ready.hidden = false;

    $('#certName').textContent = r.name;
    $('#certLine').textContent =
      'Telah menyelesaikan ' + r.categoryName + ' sejauh ' +
      distanceOf(r).toFixed(1).replace('.', ',') +
      ' kilometer pada rute terukur poros kota Karanganyar, 13 Desember 2026.';
    $('#certRibbon').textContent = 'BIB ' + r.bib + ' \u00b7 Finisher';
    $('#certGun').textContent = r.result.gun;
    $('#certNet').textContent = r.result.net;
    $('#certPace').textContent = r.result.pace;
    $('#certRank').textContent = r.result.rank
      ? '#' + r.result.rank + ' / ' + r.result.of.toLocaleString('id-ID')
      : 'Tanpa peringkat';

    renderQR($('#certQr'), epassPayload(r), 2);
    drawPaceChart(r);
  }

  /* ---- pace chart ------------------------------------------------------- */
  /* A runner is compared against the winner of their own category and gender,
     over the timing mats their own distance actually crosses. The 10K
     demo pair carries real per-kilometre splits; every other runner's legs are
     reconstructed at even pace from the net time, and the chart says so. */
  const MAT_LAYOUT = d => (d > 5 ? [2.5, 5.0, 7.5, 10.0] : [2.5, 5.0]);

  function netSeconds(clock) {
    const p = clock.split(':').map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  }

  function evenPaceLegs(row, distance) {
    const perKm = netSeconds(row.net) / distance;
    return MAT_LAYOUT(distance).map(km => ({
      km: km, paceSec: Math.round(perKm), cumSec: Math.round(perKm * km)
    }));
  }

  /* Titik waktu kumulatif dari hasil timing: setiap split yang terbaca, lalu finis. */
  function liveCheckpoints(x) {
    const pts = (x.splits || []).filter(s => s.elapsedMs != null && s.km != null)
      .map(s => ({ km: s.km, cum: s.elapsedMs / 1000 }));
    if (x.netMs != null && x.distance) pts.push({ km: x.distance, cum: x.netMs / 1000 });
    return pts;
  }

  function legsAt(pts, kms) {
    let prevKm = 0, prevCum = 0;
    return kms.map(function (km) {
      const p = pts.find(q => q.km === km);
      const leg = { km: km, cumSec: Math.round(p.cum), paceSec: Math.round((p.cum - prevCum) / (km - prevKm)) };
      prevKm = km; prevCum = p.cum;
      return leg;
    });
  }

  /* Split terukur dari timing mat bila kedua pelari punya bacaan di titik yang
     sama; bila tidak, direkonstruksi pada laju rata-rata dari net time. */
  function paceLegs(r, champRow, distance) {
    if (LIVE && r.live && champRow.live) {
      const mine = liveCheckpoints(r.live);
      const theirs = liveCheckpoints(champRow.live);
      const kms = mine.map(p => p.km).filter(km => theirs.some(q => q.km === km)).sort((a, b) => a - b);
      if (kms.length > 1) return { measured: true, champ: legsAt(theirs, kms), you: legsAt(mine, kms) };
      return { measured: false, champ: evenPaceLegs(champRow, distance), you: evenPaceLegs(r.result, distance) };
    }
    const S = H.SPLITS;
    const measured = r.bib === S.runner.bib && champRow.bib === S.champion.bib;
    return {
      measured: measured,
      champ: measured ? S.champion.legs : evenPaceLegs(champRow, distance),
      you: measured ? S.runner.legs : evenPaceLegs(r.result, distance)
    };
  }

  function drawPaceChart(r) {
    const svg = $('#paceChart');
    const distance = distanceOf(r);
    const genderKey = r.gender === 'Putri' ? 'putri' : 'putra';
    const pool = (RESULTS[r.category] || {})[genderKey] || [];

    // the leader of this runner's own category, or the runner-up if that is them
    let champRow = pool[0];
    if (champRow && champRow.bib === r.bib) champRow = pool[1] || champRow;
    if (!champRow) {
      svg.innerHTML = '';
      $('#chartLegend').innerHTML = '';
      $('#splitBody').innerHTML = '';
      return;
    }

    const legs = paceLegs(r, champRow, distance);
    const measuredPair = legs.measured;
    const champLegs = legs.champ;
    const youLegs = legs.you;
    const champLabel = champRow.rank === 1
      ? 'Juara 1 ' + H.catById(r.category).name
      : 'Peringkat ' + champRow.rank + ' ' + H.catById(r.category).name;

    const series = [
      { name: champRow.name, sub: champLabel, color: 'var(--gold)', legs: champLegs, avg: champRow.pace },
      { name: r.name, sub: 'Pelari aktif', color: 'var(--lime)', legs: youLegs, avg: r.result.pace }
    ];

    const box = svg.getBoundingClientRect();
    const W = Math.round(box.width) || 720;
    const narrow = W < 520;
    const Hh = narrow ? 260 : 320;
    const padL = narrow ? 44 : 54;
    const padR = narrow ? 14 : 22;
    const padT = narrow ? 30 : 26;
    const padB = narrow ? 38 : 44;
    const plotW = W - padL - padR, plotH = Hh - padT - padB;
    const paceStep = narrow ? 30 : 15;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);

    const allPace = series.flatMap(s => s.legs.map(l => l.paceSec));
    const lo = Math.floor((Math.min.apply(null, allPace) - 25) / paceStep) * paceStep;
    const hi = Math.ceil((Math.max.apply(null, allPace) + 25) / paceStep) * paceStep;
    const n = champLegs.length;
    const x = i => (n === 1 ? padL + plotW / 2 : padL + (plotW * i) / (n - 1));
    const y = p => padT + plotH - ((p - lo) / (hi - lo)) * plotH;
    const km = v => String(v.toFixed(1)).replace('.', ',');

    let out = '<title id="paceChartTitle">Grafik pace per kilometer ' + champRow.name +
      ' dibanding ' + r.name + ' pada ' + n + ' timing mat.</title>';

    for (let p = lo; p <= hi; p += paceStep) {
      out += '<line class="grid-line" x1="' + padL + '" y1="' + y(p) + '" x2="' + (W - padR) + '" y2="' + y(p) + '"/>' +
             '<text x="' + (padL - 8) + '" y="' + (y(p) + 3.5) + '" text-anchor="end">' + H.secToClock(p) + '</text>';
    }
    out += '<line class="axis-line" x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '"/>';

    champLegs.forEach(function (leg, i) {
      const anchor = i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle');
      out += '<text x="' + x(i) + '" y="' + (Hh - 14) + '" text-anchor="' + anchor + '">' +
        (narrow ? km(leg.km) : 'KM ' + km(leg.km)) + '</text>';
    });

    series.forEach(function (s) {
      const pts = s.legs.map((l, i) => x(i) + ',' + y(l.paceSec)).join(' ');
      out += '<polyline points="' + pts + '" fill="none" stroke="' + s.color +
        '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
      s.legs.forEach(function (l, i) {
        out += '<circle cx="' + x(i) + '" cy="' + y(l.paceSec) + '" r="4.5" fill="' + s.color +
          '" stroke="var(--surface)" stroke-width="2"><title>' + s.name + ' \u00b7 KM ' + km(l.km) +
          ' \u00b7 pace ' + H.secToClock(l.paceSec) + ' per km</title></circle>';
      });
    });

    out += '<text x="' + padL + '" y="' + (narrow ? 14 : 14) + '" text-anchor="start">' +
      (narrow ? 'Pace per km, makin rendah makin cepat' :
                'Pace per kilometer (menit:detik), makin rendah makin cepat') + '</text>';
    svg.innerHTML = out;

    $('#chartLegend').innerHTML = series.map(s =>
      '<span class="leg"><i style="background:' + s.color + '"></i>' +
      '<b>' + s.name + '</b><span>' + s.sub + ', rata-rata ' + s.avg + ' /km</span></span>'
    ).join('');

    const intro = $('#chartIntro');
    if (intro) {
      intro.textContent = 'Laju per kilometer Anda dibandingkan dengan ' + champLabel +
        ' pada ' + n + ' timing mat resmi sepanjang ' + km(distance) + ' kilometer.';
    }
    const note = $('#chartNote');
    if (note) note.hidden = measuredPair;

    $('#splitBody').innerHTML = champLegs.map(function (leg, i) {
      const mine = youLegs[i];
      const gap = mine.cumSec - leg.cumSec;
      return '<tr>' +
        '<td>KM ' + km(leg.km) + '</td>' +
        '<td class="t-num">' + H.secToClock(leg.paceSec) + ' /km</td>' +
        '<td class="t-num">' + H.secToClock(mine.paceSec) + ' /km</td>' +
        '<td class="t-num">' + (gap >= 0 ? '+' : '-') + H.secToClock(Math.abs(gap)) + '</td>' +
        '</tr>';
    }).join('');
  }

  /* ---- photos ----------------------------------------------------------- */
  let gallery = [];

  function renderPhotos(r) {
    const grid = $('#photoGrid');
    const empty = $('#photoEmpty');
    grid.innerHTML = '';
    gallery = r.photos.map(p => ({
      point: p.point, km: p.km, time: p.time,
      view: H.photoUrl(p.seed, 1600, 1200),
      full: H.photoUrl(p.seed, 2400, 1800),
      file: 'HKR26-' + r.bib + '-' + p.seed + '.jpg',
      alt: 'Pelari nomor dada ' + r.bib + ' terekam di ' + p.point + ' pada ' + p.km + '.'
    }));

    if (!gallery.length) {
      grid.hidden = true;
      empty.hidden = false;
      $('#photoCount').innerHTML = '<span class="pulse" aria-hidden="true"></span> 0 foto';
      return;
    }
    grid.hidden = false;
    empty.hidden = true;
    $('#photoCount').innerHTML = '<span class="pulse" aria-hidden="true"></span> ' + gallery.length + ' foto';

    gallery.forEach(function (p, i) {
      const fig = document.createElement('figure');
      fig.className = 'photo';
      fig.innerHTML =
        '<button class="photo-shot" type="button" data-photo="' + i + '" ' +
        'aria-label="Perbesar foto di ' + p.point + '">' +
        '<img src="' + H.photoUrl(r.photos[i].seed, 640, 480) + '" width="640" height="480" ' +
        'loading="lazy" decoding="async" alt="' + p.alt + '">' +
        '<span class="photo-zoom" aria-hidden="true"><i class="ph ph-arrows-out"></i></span>' +
        '</button>' +
        '<figcaption class="photo-meta">' +
        '<span>' + p.point + ' \u00b7 ' + p.time + '</span>' +
        '<a class="photo-dl" href="' + p.full + '" download="' + p.file + '" target="_blank" rel="noopener">' +
        '<i class="ph ph-download-simple" aria-hidden="true"></i> Unduh HD</a>' +
        '</figcaption>';
      grid.appendChild(fig);

      const img = fig.querySelector('img');
      const mark = () => img.classList.add('is-loaded');
      if (img.complete) mark(); else img.addEventListener('load', mark, { once: true });
    });
  }

  /* ---- lightbox ---------------------------------------------------------- */
  const lightbox = $('#photoLightbox');
  let lbIndex = 0;

  function showPhoto(i) {
    if (!gallery.length) return;
    lbIndex = (i + gallery.length) % gallery.length;
    const p = gallery[lbIndex];
    const img = $('#lbImage');
    img.src = p.view;
    img.alt = p.alt;
    $('#lbPoint').textContent = p.point + ' \u00b7 ' + p.km;
    $('#lbTime').textContent = 'Terekam pukul ' + p.time;
    $('#lbCount').textContent = (lbIndex + 1) + ' / ' + gallery.length;
    const dl = $('#lbDownload');
    dl.href = p.full;
    dl.setAttribute('download', p.file);
    const single = gallery.length < 2;
    $('#lbPrev').disabled = single;
    $('#lbNext').disabled = single;
  }

  $('#photoGrid').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-photo]');
    if (!btn) return;
    showPhoto(Number(btn.dataset.photo));
    openModal(lightbox);
  });
  $('#lbPrev').addEventListener('click', () => showPhoto(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showPhoto(lbIndex + 1));
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
    if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
  });

  /* the pace chart is pixel-accurate, so it must be redrawn on resize */
  if ('ResizeObserver' in window) {
    let paceWidth = 0;
    const paceSvg = $('#paceChart');
    new ResizeObserver(function () {
      const w = Math.round(paceSvg.getBoundingClientRect().width);
      if (w && Math.abs(w - paceWidth) > 2) {
        paceWidth = w;
        if (current && current.result) drawPaceChart(current);
      }
    }).observe(paceSvg.parentElement);
  }

  /* ====================================================================
     3. Tabs
     ==================================================================== */
  const tabs = $$('.tab');
  function selectTab(id) {
    tabs.forEach(function (t) {
      const on = t.id === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(t => t.addEventListener('click', () => selectTab(t.id)));
  $('.tabs').addEventListener('keydown', function (e) {
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowRight') { selectTab(tabs[(i + 1) % tabs.length].id); tabs[(i + 1) % tabs.length].focus(); }
    if (e.key === 'ArrowLeft') { selectTab(tabs[(i - 1 + tabs.length) % tabs.length].id); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
  });

  /* ====================================================================
     4. e-Pass modal, certificate download, verification
     ==================================================================== */
  function printOnly(el) {
    if (!el) return;
    const previous = document.getElementById('printTarget');
    if (previous) previous.removeAttribute('id');
    el.id = 'printTarget';
    window.setTimeout(function () {
      window.print();
      window.setTimeout(() => el.removeAttribute('id'), 400);
    }, 60);
  }

  $('#btnEpass').addEventListener('click', function () {
    if (!current) return;
    const payload = epassPayload(current);
    $('#qrName').textContent = current.name + ' · BIB ' + current.bib;
    $('#qrPayload').textContent = payload;
    const box = $('#qrBox');
    box.innerHTML = '<div class="skel"></div>';
    openModal($('#qrModal'));
    window.setTimeout(function () {
      renderQR(box, payload, 5);
      window.HipmiUI.toast('E-Pass siap ditunjukkan kepada marshall RPC.');
    }, 120);
  });

  $('#btnQrPrint').addEventListener('click', function () {
    printOnly($('#qrModal').querySelector('.qr-stage'));
    window.HipmiUI.toast('Dialog cetak dibuka. Pilih "Simpan sebagai PDF" untuk menyimpan e-Pass.');
  });
  $('#btnCert').addEventListener('click', function () {
    printOnly($('#certificate'));
    window.HipmiUI.toast('Dialog cetak dibuka. Pilih "Simpan sebagai PDF" untuk menyimpan sertifikat.');
  });

  $('#btnVerify').addEventListener('click', function () {
    if (!current) return;
    const btn = $('#btnVerify');
    btn.innerHTML = '<i class="ph ph-circle-notch" aria-hidden="true"></i> Memverifikasi';
    window.setTimeout(function () {
      btn.innerHTML = '<i class="ph-fill ph-seal-check" aria-hidden="true"></i> Sah, tercatat HIPMI KRA';
      btn.classList.remove('btn-ghost');
      btn.classList.add('btn-live');
      window.setTimeout(function () {
        btn.innerHTML = '<i class="ph ph-shield-check" aria-hidden="true"></i> Cek keaslian';
        btn.classList.add('btn-ghost');
        btn.classList.remove('btn-live');
      }, 3200);
    }, 900);
  });

  /* ====================================================================
     5. Leaderboard and podium
     ==================================================================== */
  let lbCat = '10k';
  let lbGender = 'putra';
  let focusBib = null;
  const medals = ['ph-fill ph-medal', 'ph-fill ph-medal', 'ph-fill ph-medal'];

  function prizeFor(catId, place) {
    const map = { '10k': 0, '5k': 1 };
    return H.PRIZES[map[catId]].rows[place];
  }

  function rowMarkup(row, isFocus) {
    // "Anda" only belongs to the runner whose own e-Pass is open; a row reached
    // through the leaderboard search is somebody the visitor looked up.
    const mine = isFocus && current && current.bib === row.bib;
    const tag = mine
      ? ' <span class="chip chip-gold" style="margin-left:.4rem">Anda</span>'
      : (isFocus ? ' <span class="chip chip-gold" style="margin-left:.4rem">Dicari</span>' : '');
    return '<tr' + (isFocus ? ' data-me="true"' : '') + ' data-bib="' + row.bib + '">' +
      '<td class="lb-rank">' + row.rank + '</td>' +
      '<td class="lb-bib">' + row.bib + '</td>' +
      '<td class="lb-name">' + row.name + tag + '</td>' +
      '<td class="muted col-club">' + row.club + '</td>' +
      '<td class="lb-time r col-gun">' + row.gun + '</td>' +
      '<td class="lb-time r">' + row.net + '</td>' +
      '<td class="lb-pace r">' + row.pace + '</td>' +
      '</tr>';
  }

  function renderLeaderboard() {
    const set = RESULTS[lbCat] || { finishers: 0, putra: [], putri: [] };
    const rows = set[lbGender] || [];

    $('#podium').innerHTML = rows.slice(0, 3).map(function (row, i) {
      const order = [2, 1, 3][i];            // visual: silver, gold, bronze
      return '<article class="pod pod-' + (i + 1) + '" style="order:' + order + '">' +
        '<i class="ph ' + medals[i] + ' pod-medal" aria-hidden="true"></i>' +
        '<p class="pod-rank">' + (i + 1) + '</p>' +
        '<p class="pod-name">' + row.name + '</p>' +
        '<p class="pod-sub">BIB ' + row.bib + ' \u00b7 ' + row.club + '</p>' +
        '<p class="pod-time">' + row.net + '</p>' +
        /* nominal hadiah disembunyikan sampai panitia mengumumkannya;
           prizeFor() dan data PRIZES sengaja dibiarkan agar mudah dipasang lagi */
        '</article>';
    }).join('');

    $('#lbHeading').textContent = 'Top 10 ' + (lbGender === 'putra' ? 'putra' : 'putri');
    $('#lbFinishers').textContent = set.finishers.toLocaleString('id-ID') + ' finisher tercatat';

    const top = rows.slice(0, 10);
    $('#lbBody').innerHTML = top.length
      ? top.map(row => rowMarkup(row, focusBib === row.bib)).join('')
      : '<tr><td colspan="7" class="lb-empty">Belum ada finisher ' + lbGender +
        ' yang tercatat. Tabel ini terisi otomatis begitu pelari melintasi garis finis.</td></tr>';

    // a focused runner below tenth place still gets a row of their own
    if (focusBib && !top.some(x => x.bib === focusBib)) {
      const outside = rows.find(x => x.bib === focusBib);
      if (outside) {
        $('#lbBody').insertAdjacentHTML('beforeend',
          '<tr aria-hidden="true"><td colspan="7" class="lb-empty" style="padding:.5rem">' +
          '\u22ee</td></tr>' + rowMarkup(outside, true));
      }
    }
  }

  function flashFocusRow() {
    const row = $('#lbBody tr[data-me="true"]');
    if (!row) return;
    row.classList.add('is-flash');
    row.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => row.classList.remove('is-flash'), 1700);
  }

  function syncLeaderboardTo(r) {
    lbCat = r.category;
    lbGender = r.gender === 'Putri' ? 'putri' : 'putra';
    focusBib = r.bib;
    $$('.lb-filters [data-cat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === lbCat)));
    $$('.lb-filters [data-gender]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.gender === lbGender)));
    renderLeaderboard();
  }

  $$('.lb-filters [data-cat]').forEach(b => b.addEventListener('click', function () {
    lbCat = b.dataset.cat;
    $$('.lb-filters [data-cat]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderLeaderboard();
  }));
  $$('.lb-filters [data-gender]').forEach(b => b.addEventListener('click', function () {
    lbGender = b.dataset.gender;
    $$('.lb-filters [data-gender]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderLeaderboard();
  }));

  /* ---- find any runner across every category and group ------------------- */
  const findForm = $('#lbFindForm');
  const findInput = $('#lbFind');

  function locate(bib) {
    const cats = Object.keys(RESULTS);
    for (let i = 0; i < cats.length; i++) {
      for (const g of ['putra', 'putri']) {
        const row = (RESULTS[cats[i]][g] || []).find(x => x.bib === bib);
        if (row) return { cat: cats[i], gender: g, row: row };
      }
    }
    return null;
  }

  findInput.addEventListener('input', function () {
    findInput.value = findInput.value.replace(/\D/g, '').slice(0, 4);
  });

  findForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const bib = findInput.value.trim();
    if (bib.length !== 4) {
      window.HipmiUI.toast('Masukkan empat digit nomor dada.', 'warn');
      return;
    }
    const hit = locate(bib);
    if (!hit) {
      window.HipmiUI.toast('Nomor dada ' + bib + ' belum tercatat pada hasil mana pun.', 'warn');
      return;
    }
    lbCat = hit.cat;
    lbGender = hit.gender;
    focusBib = bib;
    $$('.lb-filters [data-cat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === lbCat)));
    $$('.lb-filters [data-gender]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.gender === lbGender)));
    renderLeaderboard();
    flashFocusRow();
    window.HipmiUI.toast(hit.row.name + ' berada di peringkat ' + hit.row.rank + '.');
  });

  /* ====================================================================
     6. Barcode scanner
     ==================================================================== */
  const scanWrap = $('#scanWrap');
  const scanError = $('#scanError');
  const scanStatus = $('#scanStatus');
  const video = $('#scanVideo');
  let stream = null;
  let rafId = null;

  function scanFail(text) {
    stopScan();
    $('#scanErrorText').textContent = text;
    scanError.hidden = false;
  }

  function stopScan() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    scanWrap.hidden = true;
  }

  async function startScan() {
    scanError.hidden = true;

    if (!window.isSecureContext) {
      scanFail('Kamera hanya dapat diakses melalui HTTPS atau localhost. Buka halaman ini dari server aman, atau ketik nomor dada secara manual.');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      scanFail('Peramban ini tidak mendukung akses kamera. Ketik nomor dada secara manual.');
      return;
    }

    scanWrap.hidden = false;
    scanStatus.textContent = 'Meminta izin kamera';
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, audio: false
      });
    } catch (err) {
      const msg = err && err.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Aktifkan izin kamera di pengaturan peramban, lalu coba lagi.'
        : 'Kamera tidak tersedia pada perangkat ini. Ketik nomor dada secara manual.';
      scanFail(msg);
      return;
    }

    video.srcObject = stream;
    await video.play().catch(() => {});
    scanStatus.textContent = typeof window.jsQR === 'function'
      ? 'Memindai barcode'
      : 'Pustaka pemindai tidak termuat, gunakan input manual';

    if (typeof window.jsQR !== 'function') return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function frame() {
      if (!stream) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (code && code.data) {
          const match = code.data.match(/(?:HKR26\.)?(\d{4})/);
          if (match) {
            scanStatus.textContent = 'Terbaca: ' + match[1];
            stopScan();
            lookup(match[1]);
            return;
          }
        }
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  $('#btnScan').addEventListener('click', startScan);
  $('#btnScanStop').addEventListener('click', stopScan);
  window.addEventListener('pagehide', stopScan);

  /* ====================================================================
     7. Boot
     ==================================================================== */
  const wanted = new URLSearchParams(location.search).get('bib');
  loadLive().then(function (live) {
    renderLeaderboard();
    if (wanted) lookup(wanted);
    if (live) T.subscribe(refreshSoon);
  });

  /* Hasil berubah di server timing: segarkan leaderboard dan pelari yang
     sedang dibuka, tanpa memindahkan tab yang sedang dibaca. */
  let refreshTimer = null;
  function refreshSoon() {
    if (refreshTimer) return;
    refreshTimer = window.setTimeout(async function () {
      refreshTimer = null;
      await loadLive();
      renderLeaderboard();
      if (current && current.live) {
        const next = await resolveRunner(current.bib);
        if (next && current && next.bib === current.bib) {
          current = next;
          renderRunner(next, true);
        }
      }
    }, 2500);
  }
})();
