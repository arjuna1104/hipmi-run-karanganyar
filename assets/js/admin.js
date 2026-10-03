/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - admin.js
   Portal panitia: penerbitan nomor dada kehormatan.

   Nomor kehormatan dipakai untuk tamu undangan, sponsor, dan atlet elit yang
   meminta nomor tertentu. Sistem menolak tabrakan nomor, memperingatkan bila
   nomor jatuh di rentang kompetitif, dan menyimpan jejak persetujuan.

   PROTOTIPE: tanpa autentikasi, penyimpanan di localStorage peramban. Pada
   produksi ini harus berada di balik login panitia dan basis data server.
   ========================================================================== */
(function () {
  'use strict';

  const { $, $$, openModal, closeModal, toast } = window.HipmiUI;
  const H = window.HIPMI;
  const STORE_KEY = 'hipmi-bib-exceptions';

  /* ---- penyimpanan ------------------------------------------------------ */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* mode privat */ }
    return H.SEED_EXCEPTIONS.slice();
  }

  function save(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
    catch (e) { toast('Perubahan tidak tersimpan karena penyimpanan peramban terkunci.', 'warn'); }
  }

  let exceptions = load();

  /* ---- pemeriksaan nomor ------------------------------------------------ */
  const pad = bib => String(bib).replace(/\D/g, '').replace(/^0+(?=\d)/, '').padStart(2, '0');

  function competitiveRangeOf(n) {
    return H.BIB_RULES.competitive.find(r => n >= r.from && n <= r.to) || null;
  }

  /* Mengembalikan status sebuah nomor: bebas, dipakai peserta, dipakai
     pengecualian lain, atau jatuh di dalam rentang undian kompetitif. */
  function inspect(raw) {
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return { state: 'idle' };

    const n = Number(digits);
    if (!n) return { state: 'invalid', message: 'Nomor 0 tidak dapat diterbitkan.' };

    const bib = pad(digits);

    const clash = exceptions.find(x => x.status === 'aktif' && pad(x.bib) === bib);
    if (clash) {
      return { state: 'taken', bib: bib,
        message: 'Sudah dipegang ' + clash.name + ' sebagai ' + labelOfType(clash.type) + '.' };
    }

    // nomor peserta reguler pada dataset contoh
    const runner = H.RUNNERS[digits];
    if (runner) {
      return { state: 'taken', bib: bib,
        message: 'Sudah dipakai peserta terdaftar atas nama ' + runner.name + '.' };
    }

    const range = competitiveRangeOf(n);
    if (range) {
      const cat = H.catById(range.id);
      return { state: 'competitive', bib: bib, range: range,
        message: 'Berada di rentang undian ' + cat.name + ' (' + range.from + ' sampai ' + range.to + ').' };
    }

    const honour = H.BIB_RULES.honour;
    if (n >= honour.from && n <= honour.to) {
      return { state: 'free-honour', bib: bib,
        message: 'Tersedia di blok kehormatan, aman dari undian peserta.' };
    }

    return { state: 'free-gap', bib: bib,
      message: 'Tersedia, berada di celah antar rentang kategori.' };
  }

  function labelOfType(id) {
    const t = H.EXCEPTION_TYPES.find(x => x.id === id);
    return t ? t.label.toLowerCase() : id;
  }

  /* ---- render ----------------------------------------------------------- */
  function paintCheck() {
    const box = $('#bibCheck');
    const info = inspect($('#excBib').value);
    const icons = {
      idle: 'ph-magnifying-glass', invalid: 'ph-x-circle', taken: 'ph-x-circle',
      competitive: 'ph-warning', 'free-honour': 'ph-check-circle', 'free-gap': 'ph-check-circle'
    };
    box.setAttribute('data-state', info.state);
    box.innerHTML = '<i class="ph ' + icons[info.state] + '" aria-hidden="true"></i><span></span>';
    $('span', box).textContent = info.state === 'idle'
      ? 'Ketik nomor untuk memeriksa ketersediaan.'
      : (info.bib ? 'Nomor ' + info.bib + '. ' : '') + info.message;
    return info;
  }

  function paintBlocks() {
    const honour = H.BIB_RULES.honour;
    const used = exceptions.filter(x => x.status === 'aktif').length;
    let out = '<div class="block-row" data-kind="honour">' +
      '<span class="block-range">' + String(honour.from).padStart(2, '0') + ' - ' + honour.to + '</span>' +
      '<span class="block-name">' + honour.label + '</span>' +
      '<span class="block-used tel">' + used + ' terbit</span></div>';

    H.BIB_RULES.competitive.forEach(function (r) {
      const nama = r.label || (H.catById(r.id) || {}).name || r.id;
      out += '<div class="block-row">' +
        '<span class="block-range">' + r.from + ' - ' + r.to + '</span>' +
        '<span class="block-name">' + nama + '</span>' +
        '<span class="block-used tel">undian</span></div>';
    });
    $('#blockList').innerHTML = out;
  }

  function paintLedger() {
    const active = exceptions.filter(x => x.status === 'aktif');
    $('#excCount').textContent = active.length + ' nomor';
    $('#excEmpty').hidden = exceptions.length > 0;
    $('#excTableWrap').hidden = exceptions.length === 0;

    $('#excBody').innerHTML = exceptions.map(function (x) {
      const cat = H.catById(x.category);
      const off = x.status !== 'aktif';
      return '<tr' + (off ? ' class="is-revoked"' : '') + '>' +
        '<td class="lb-rank">' + pad(x.bib) + '</td>' +
        '<td class="lb-name">' + escapeHtml(x.name) +
        '<span class="exc-title">' + escapeHtml(x.title) + '</span></td>' +
        '<td class="muted col-club">' + labelOfType(x.type) + '</td>' +
        '<td class="muted col-gun">' + (cat ? cat.name : '-') + '</td>' +
        '<td>' + (x.competitive
          ? '<span class="chip chip-live">Kompetitif</span>'
          : '<span class="chip">Tamu</span>') + '</td>' +
        '<td class="r">' + (off
          ? '<span class="chip chip-danger">Dibatalkan</span>'
          : '<button class="btn btn-ghost btn-sm" type="button" data-revoke="' + pad(x.bib) + '">Batalkan</button>')
        + '</td>' +
        '</tr>';
    }).join('');
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---- galat ruas -------------------------------------------------------- */
  function setError(name, message) {
    const f = $('[data-field="' + name + '"]');
    if (!f) return;
    f.setAttribute('data-invalid', 'true');
    const err = $('.err', f);
    if (err) { $('span', err).textContent = message; err.hidden = false; }
  }
  function clearError(name) {
    const f = $('[data-field="' + name + '"]');
    if (!f) return;
    f.removeAttribute('data-invalid');
    const err = $('.err', f);
    if (err) err.hidden = true;
  }

  /* ---- isi pilihan ------------------------------------------------------- */
  $('#excType').innerHTML = H.EXCEPTION_TYPES
    .map(t => '<option value="' + t.id + '">' + t.label + '</option>').join('');
  $('#excCategory').innerHTML = H.CATEGORIES
    .map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');
  $('#excJersey').innerHTML = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    .map(v => '<option value="' + v + '"' + (v === 'L' ? ' selected' : '') + '>' + v + '</option>').join('');

  function syncType() {
    const t = H.EXCEPTION_TYPES.find(x => x.id === $('#excType').value);
    if (!t) return;
    $('#excTypeNote').textContent = t.note;
    $('#excCompetitive').checked = t.competitive;
  }

  /* ---- kirim ------------------------------------------------------------- */
  function collect() {
    return {
      bib: pad($('#excBib').value),
      name: $('#excName').value.trim(),
      title: $('#excTitle').value.trim(),
      category: $('#excCategory').value,
      jersey: $('#excJersey').value,
      type: $('#excType').value,
      competitive: $('#excCompetitive').checked,
      nik: $('#excNik').value.replace(/\D/g, ''),
      reason: $('#excReason').value.trim(),
      approvedBy: $('#excApprover').value.trim(),
      issuedAt: new Date().toISOString(),
      status: 'aktif'
    };
  }

  function validate(entry, info) {
    let ok = true;
    ['bib', 'name', 'title', 'nik', 'reason', 'approvedBy'].forEach(clearError);

    if (!entry.bib || info.state === 'invalid') {
      setError('bib', info.message || 'Isi nomor dada yang diminta.'); ok = false;
    } else if (info.state === 'taken') {
      setError('bib', info.message); ok = false;
    }
    if (entry.name.length < 3) { setError('name', 'Tulis nama lengkap penerima.'); ok = false; }
    if (entry.title.length < 3) { setError('title', 'Tulis jabatan atau keterangan penerima.'); ok = false; }
    if (!/^\d{16}$/.test(entry.nik)) { setError('nik', 'NIK harus tepat 16 digit angka.'); ok = false; }
    if (entry.reason.length < 10) { setError('reason', 'Tulis dasar penerbitan secara ringkas.'); ok = false; }
    if (entry.approvedBy.length < 3) { setError('approvedBy', 'Tulis nama atau unit yang menyetujui.'); ok = false; }

    if (!ok) {
      const bad = $('[data-invalid="true"]');
      if (bad) {
        bad.scrollIntoView({ behavior: window.HipmiUI.reduced ? 'auto' : 'smooth', block: 'center' });
        const input = bad.querySelector('input, select, textarea');
        if (input) input.focus({ preventScroll: true });
      }
    }
    return ok;
  }

  function issue(entry) {
    exceptions = [entry].concat(exceptions);
    save(exceptions);
    paintLedger();
    paintBlocks();
    paintCheck();
    $('#excForm').reset();
    syncType();
    paintCheck();
    toast('Nomor ' + entry.bib + ' diterbitkan untuk ' + entry.name + '.');
  }

  let pending = null;

  $('#excForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const info = paintCheck();
    const entry = collect();
    if (!validate(entry, info)) return;

    // nomor di dalam rentang undian butuh konfirmasi sadar
    if (info.state === 'competitive') {
      pending = entry;
      const nama = info.range.label || (H.catById(info.range.id) || {}).name || 'peserta';
      $('#confirmBody').textContent =
        'Nomor ' + entry.bib + ' berada di rentang ' + nama +
        ' (' + info.range.from + ' sampai ' + info.range.to + '). Menerbitkannya berarti nomor itu ' +
        'dikeluarkan dari undian peserta. Lanjutkan?';
      openModal($('#confirmModal'));
      return;
    }
    issue(entry);
  });

  $('#confirmYes').addEventListener('click', function () {
    closeModal($('#confirmModal'));
    if (pending) { issue(pending); pending = null; }
  });

  $('#excForm').addEventListener('reset', function () {
    window.setTimeout(function () {
      ['bib', 'name', 'title', 'nik', 'reason', 'approvedBy'].forEach(clearError);
      syncType();
      paintCheck();
    }, 0);
  });

  $('#excBib').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
    clearError('bib');
    paintCheck();
  });
  $('#excNik').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 16);
    clearError('nik');
  });
  $('#excType').addEventListener('change', syncType);
  $('#excForm').addEventListener('input', function (e) {
    const f = e.target.closest('[data-field]');
    if (f && f.getAttribute('data-invalid') === 'true') clearError(f.dataset.field);
  });

  /* ---- pembatalan -------------------------------------------------------- */
  $('#excBody').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-revoke]');
    if (!btn) return;
    const bib = btn.dataset.revoke;
    const row = exceptions.find(x => pad(x.bib) === bib && x.status === 'aktif');
    if (!row) return;
    row.status = 'dibatalkan';
    row.revokedAt = new Date().toISOString();
    save(exceptions);
    paintLedger();
    paintBlocks();
    paintCheck();
    toast('Nomor ' + bib + ' dibatalkan dan kembali tersedia.', 'warn');
  });

  /* ---- boot -------------------------------------------------------------- */
  syncType();
  paintBlocks();
  paintLedger();
  paintCheck();
})();
