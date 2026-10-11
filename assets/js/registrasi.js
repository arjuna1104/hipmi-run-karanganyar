/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - registrasi.js
   Four-step guided registration: category, identity and medical history,
   race kit personalisation, payment.
   ========================================================================== */
(function () {
  'use strict';

  const { $, $$ } = window.HipmiUI;
  const RACE_DAY = new Date('2026-12-13T05:45:00+07:00');
  const SERVICE_FEE = 7500;

  const form = $('#regForm');
  if (!form) return;

  const wizard = $('#regWizard');
  const done = $('#regDone');
  const panels = $$('.step-panel', form);
  const pills = $$('.step-pill', form);
  const btnNext = $('#btnNext');
  const btnBack = $('#btnBack');
  const payError = $('#payError');

  let step = 1;
  let furthest = 1;

  /* ---- field errors ---------------------------------------------------- */
  function fieldEl(name) { return $('[data-field="' + name + '"]'); }

  function setError(name, message) {
    const f = fieldEl(name);
    if (!f) return;
    f.setAttribute('data-invalid', 'true');
    const err = $('.err', f);
    if (err) { $('span', err).textContent = message; err.hidden = false; }
    const input = f.querySelector('input, select, textarea');
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function clearError(name) {
    const f = fieldEl(name);
    if (!f) return;
    f.removeAttribute('data-invalid');
    const err = $('.err', f);
    if (err) err.hidden = true;
    const input = f.querySelector('input, select, textarea');
    if (input) input.removeAttribute('aria-invalid');
  }

  /* ---- helpers --------------------------------------------------------- */
  const selectedCategory = () => form.querySelector('input[name="kategori"]:checked');
  const val = id => { const el = $('#' + id); return el ? el.value.trim() : ''; };

  function ageAtRaceDay(iso) {
    const born = new Date(iso);
    if (isNaN(born)) return null;
    let age = RACE_DAY.getFullYear() - born.getFullYear();
    const m = RACE_DAY.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && RACE_DAY.getDate() < born.getDate())) age--;
    return age;
  }

  /* ---- harga ------------------------------------------------------------
     Kode promo tidak diperiksa di sini. Daftar 50 kode itu milik panitia dan
     tidak boleh ikut terkirim ke peramban: siapa pun bisa membacanya dari kode
     sumber. Halaman hanya menampilkan nominal bila kode diisi, dan panitia yang
     memastikan kodenya sah saat memeriksa bukti transfer. */
  function promoDipakai(cat) {
    const kode = (val('promo') || '').trim();
    return kode.length >= 4 && Number(cat.dataset.promo || 0) > 0;
  }
  function hargaDibayar(cat) {
    return promoDipakai(cat) ? Number(cat.dataset.promo) : Number(cat.dataset.price);
  }

  /* ---- live summary and BIB preview ------------------------------------ */
  function refresh() {
    const cat = selectedCategory();
    if (!cat) return;
    const label = cat.dataset.label;

    const hargaEarly = Number(cat.dataset.price);
    const hargaPromo = Number(cat.dataset.promo || 0);
    const pakaiPromo = promoDipakai(cat);
    const price = hargaDibayar(cat);

    const barisPromo = $('#sumPromo');
    if (barisPromo) {
      barisPromo.hidden = !pakaiPromo;
      if (pakaiPromo) {
        $('#sumPromoValue').textContent = '- ' + window.HIPMI.rupiah(hargaEarly - hargaPromo);
      }
    }

    $('#sumCat').textContent = label;
    $('#sumPrice').textContent = window.HIPMI.rupiah(price);
    $('#sumTotal').textContent = window.HIPMI.rupiah(price + SERVICE_FEE);

    // selisih terhadap harga normal hanya tampil selama early bird berlaku
    const normal = Number(cat.dataset.normal || 0);
    const saveRow = $('#sumSave');
    if (saveRow) {
      const saving = normal - hargaEarly;
      saveRow.hidden = saving <= 0;
      if (saving > 0) $('#sumSaveValue').textContent = '- ' + window.HIPMI.rupiah(saving);
    }

    const nama = val('nama');
    $('#sumName').textContent = nama || 'Belum diisi';

    const jersey = form.querySelector('input[name="jersey"]:checked');
    $('#sumJersey').textContent = jersey ? jersey.value : 'Belum dipilih';

    /* Nomor dada dan nomor chip tidak diisi di sini. Keduanya baru ada
       setelah panitia memverifikasi pembayaran dan menetapkan nomor dari
       rentang 0101 ke atas, jadi pratinjau ini sengaja tetap kosong. */
    $('#bibCat').textContent = label.toUpperCase();

    // desain nomor dada memakai warna berbeda tiap kategori
    const prev = $('.bib-preview');
    if (prev) prev.setAttribute('data-cat', cat.value);

    const hint = $('#lahirHint');
    if (hint) {
      hint.textContent = cat.value === '10k'
        ? 'Usia minimal 17 tahun dihitung per 13 Desember 2026.'
        : 'Usia dihitung per 13 Desember 2026.';
    }
  }

  function refreshBibName() {
    const input = $('#bibName');
    const cleaned = input.value.toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 12);
    if (cleaned !== input.value) input.value = cleaned;
    $('#bibNamePreview').textContent = cleaned;
  }

  /* ---- validation ------------------------------------------------------ */
  function validateStep(n) {
    let ok = true;
    const fail = (name, msg) => { setError(name, msg); ok = false; };

    if (n === 2) {
      ['nama', 'nik', 'lahir', 'gender', 'darah', 'kota', 'email', 'telepon', 'darurat', 'daruratTelepon', 'waiver']
        .forEach(clearError);

      if (val('nama').length < 3) fail('nama', 'Tulis nama lengkap sesuai KTP.');

      const nik = val('nik');
      if (!/^\d{16}$/.test(nik)) fail('nik', 'NIK harus tepat 16 digit angka.');

      const lahir = val('lahir');
      const age = ageAtRaceDay(lahir);
      const cat = selectedCategory().value;
      if (!lahir || age === null) {
        fail('lahir', 'Isi tanggal lahir Anda.');
      } else if (cat === '10k' && age < 17) {
        fail('lahir', 'Kategori 10K menuntut usia minimal 17 tahun, Anda ' + age + ' tahun.');
      } else if (age < 7) {
        fail('lahir', 'Peserta di bawah 7 tahun belum dapat didaftarkan.');
      }

      if (!val('gender')) fail('gender', 'Pilih jenis kelamin.');
      if (!val('darah')) fail('darah', 'Pilih golongan darah.');
      if (val('kota').length < 3) fail('kota', 'Tulis kota domisili Anda.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) fail('email', 'Format email belum benar.');
      if (val('telepon').replace(/\D/g, '').length < 9) fail('telepon', 'Nomor WhatsApp minimal 9 digit.');
      if (val('darurat').length < 3) fail('darurat', 'Tulis nama kontak darurat.');
      if (val('daruratTelepon').replace(/\D/g, '').length < 9) fail('daruratTelepon', 'Nomor kontak darurat minimal 9 digit.');
      if (!$('#waiver').checked) fail('waiver', 'Centang pakta pelepasan tanggung jawab untuk melanjutkan.');

    }

    if (n === 3) {
      clearError('jersey');
      if (!form.querySelector('input[name="jersey"]:checked')) {
        fail('jersey', 'Pilih satu ukuran jersey.');
      }
    }

    if (!ok) {
      const firstBad = $('[data-invalid="true"]');
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: window.HipmiUI.reduced ? 'auto' : 'smooth', block: 'center' });
        const input = firstBad.querySelector('input, select, textarea');
        if (input) input.focus({ preventScroll: true });
      }
    }
    return ok;
  }

  /* ---- step navigation -------------------------------------------------- */
  function paintSteps() {
    panels.forEach(p => { p.hidden = Number(p.dataset.step) !== step; });
    pills.forEach(function (pill) {
      const n = Number(pill.dataset.goto);
      pill.setAttribute('data-state', n === step ? 'active' : (n < step ? 'done' : 'todo'));
      pill.setAttribute('aria-current', n === step ? 'step' : 'false');
    });
    const titles = ['Kategori lomba', 'Data dan riwayat medis', 'Perlengkapan lomba', 'Pembayaran'];
    const cn = $('#stepCompactN'), ct = $('#stepCompactT'), cb = $('#stepCompactBar');
    if (cn) cn.textContent = 'Langkah ' + step + ' dari 4';
    if (ct) ct.textContent = titles[step - 1];
    if (cb) cb.style.width = (step * 25) + '%';

    btnBack.hidden = step === 1;
    btnNext.innerHTML = step === 4
      ? 'Bayar sekarang <i class="ph ph-lock-simple" aria-hidden="true"></i>'
      : 'Lanjutkan <i class="ph ph-arrow-right" aria-hidden="true"></i>';
    if (payError) payError.hidden = true;
  }

  function goTo(n) {
    if (n > step && !validateStep(step)) return;
    step = Math.min(4, Math.max(1, n));
    furthest = Math.max(furthest, step);
    paintSteps();
    refresh();
    const head = $('.section-head');
    if (head) head.scrollIntoView({ behavior: window.HipmiUI.reduced ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---- pengiriman pendaftaran ------------------------------------------- */
  /* Halaman ini tidak memproses uang. Yang dikirim adalah data pendaftaran
     dan bukti pembayaran, ke lembar panitia. Nomor dada tidak pernah dibuat
     di sini: panitia menerbitkannya dari rentang 0101 ke atas setelah bukti
     dicocokkan, supaya tidak ada dua orang memegang nomor yang sama. */

  const BATAS_BUKTI = 5 * 1024 * 1024;

  function base64Dari(berkas) {
    return new Promise(function (resolve, reject) {
      const r = new FileReader();
      r.onerror = function () { reject(new Error('Berkas bukti gagal dibaca.')); };
      r.onload = function () {
        const hasil = String(r.result);
        resolve(hasil.slice(hasil.indexOf(',') + 1));
      };
      r.readAsDataURL(berkas);
    });
  }

  function gagal(pesan) {
    payError.hidden = false;
    payError.querySelector('span').textContent = pesan;
    btnNext.removeAttribute('aria-disabled');
    btnNext.innerHTML = 'Kirim ulang <i class="ph ph-arrow-clockwise" aria-hidden="true"></i>';
    payError.scrollIntoView({ behavior: window.HipmiUI.reduced ? 'auto' : 'smooth', block: 'center' });
  }

  async function pay() {
    if (!validateStep(3)) { goTo(3); return; }
    const method = form.querySelector('input[name="bayar"]:checked');
    if (!method) { setError('bayar', 'Pilih satu metode pembayaran.'); return; }
    clearError('bayar');
    payError.hidden = true;

    const endpoint = window.HIPMI.ENDPOINT_DAFTAR;
    if (!endpoint) {
      gagal('Pendaftaran daring belum dibuka. Jangan mentransfer dulu; '
          + 'hubungi hipmirun@hipmikaranganyar.com untuk jadwal pembukaannya.');
      return;
    }

    const inputBukti = $('#bukti');
    const bukti = (inputBukti && inputBukti.files[0]) || null;
    if (bukti && bukti.size > BATAS_BUKTI) {
      setError('bukti', 'Bukti transfer melebihi 5 MB. Perkecil dulu fotonya.');
      return;
    }
    clearError('bukti');

    btnNext.setAttribute('aria-disabled', 'true');
    btnNext.innerHTML = '<i class="ph ph-circle-notch" aria-hidden="true"></i> Mengirim pendaftaran';

    const cat = selectedCategory();
    const jersey = form.querySelector('input[name="jersey"]:checked');
    const bibName = val('bibName');

    const muatan = {
      nama: val('nama'),
      kategori: cat.value,
      jk: val('gender'),
      klub: bibName || '',
      kelompok_umur: String(ageAtRaceDay(val('lahir')) || ''),
      catatan: [val('kota') ? 'Kota ' + val('kota') : '',
                val('darah') ? 'Gol. darah ' + val('darah') : ''].filter(Boolean).join(' / '),
      hp: val('telepon'),
      email: val('email'),
      ukuran_jersey: jersey ? jersey.value : '',
      kontak_darurat: val('darurat'),
      hp_darurat: val('daruratTelepon'),
      harga: hargaDibayar(cat) + SERVICE_FEE,
      kode_promo: (val('promo') || '').trim().toUpperCase(),
      metode_bayar: method.value
    };

    try {
      if (bukti) {
        muatan.bukti_nama = bukti.name;
        muatan.bukti_tipe = bukti.type;
        muatan.bukti_data = await base64Dari(bukti);
      }

      /* text/plain supaya permintaannya tetap "sederhana" dan tidak memicu
         preflight CORS, yang tidak dilayani Apps Script. */
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(muatan)
      });
      const hasil = await res.json();
      if (!hasil.ok) { gagal(hasil.pesan || 'Pendaftaran ditolak server.'); return; }

      $('#doneCat').textContent = cat.dataset.label;
      $('#doneName').textContent = val('nama');
      $('#doneTotal').textContent = window.HIPMI.rupiah(muatan.harga);
      const kode = $('#doneKode');
      if (kode) kode.textContent = hasil.kode_daftar || '-';

      wizard.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: window.HipmiUI.reduced ? 'auto' : 'smooth', block: 'center' });

    } catch (err) {
      gagal(navigator.onLine === false
        ? 'Perangkat sedang luring. Periksa koneksi, lalu kirim ulang.'
        : 'Pendaftaran gagal terkirim. Jangan mentransfer ulang; coba kirim ulang '
          + 'atau hubungi hipmirun@hipmikaranganyar.com.');
    }
  }

  /* ---- wiring ----------------------------------------------------------- */
  btnNext.addEventListener('click', function () {
    if (btnNext.getAttribute('aria-disabled') === 'true') return;
    if (step === 4) { pay(); return; }
    goTo(step + 1);
  });
  btnBack.addEventListener('click', () => goTo(step - 1));
  pills.forEach(pill => pill.addEventListener('click', function () {
    const n = Number(pill.dataset.goto);
    if (n <= furthest || n === step + 1) goTo(n);
  }));

  form.addEventListener('change', function (e) {
    refresh();
    if (e.target.name === 'jersey') clearError('jersey');
    if (e.target.name === 'bayar') clearError('bayar');
    if (e.target.id === 'waiver' && e.target.checked) clearError('waiver');
  });
  form.addEventListener('input', function (e) {
    if (e.target.id === 'bibName') { refreshBibName(); return; }
    if (e.target.id === 'promo') {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
      refresh();
      return;
    }
    if (e.target.id === 'nik') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16);
    if (e.target.id === 'nama') $('#sumName').textContent = e.target.value.trim() || 'Belum diisi';
    const f = e.target.closest('[data-field]');
    if (f && f.getAttribute('data-invalid') === 'true') clearError(f.dataset.field);
  });
  form.addEventListener('submit', e => e.preventDefault());

  /* ---- collapsible summary on narrow screens ---------------------------- */
  const summary = $('.summary');
  const sumToggle = $('#sumToggle');
  if (sumToggle && summary) {
    sumToggle.addEventListener('click', function () {
      const open = summary.getAttribute('data-open') === 'true';
      summary.setAttribute('data-open', String(!open));
      sumToggle.setAttribute('aria-expanded', String(!open));
      $('#sumToggleText').textContent = open ? 'Rincian' : 'Tutup';
    });
  }

  /* ---- jersey size guide -------------------------------------------------- */
  const sizeModal = $('#sizeModal');
  const btnSizeGuide = $('#btnSizeGuide');
  if (btnSizeGuide && sizeModal) {
    btnSizeGuide.addEventListener('click', function () {
      const picked = form.querySelector('input[name="jersey"]:checked');
      $$('#sizeTable tbody tr').forEach(function (row) {
        row.setAttribute('data-picked', String(!!picked && row.dataset.size === picked.value));
      });
      window.HipmiUI.openModal(sizeModal);
    });
    // picking a size straight from the guide keeps the two in step
    $$('#sizeTable tbody tr').forEach(function (row) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function () {
        const radio = form.querySelector('input[name="jersey"][value="' + row.dataset.size + '"]');
        if (!radio) return;
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        $$('#sizeTable tbody tr').forEach(r => r.setAttribute('data-picked', String(r === row)));
        window.HipmiUI.closeModal(sizeModal);
        window.HipmiUI.toast('Ukuran jersey ' + row.dataset.size + ' dipilih.');
      });
    });
  }

  /* ---- deep link from the category rail --------------------------------- */
  const wanted = new URLSearchParams(location.search).get('kategori');
  if (wanted) {
    const radio = form.querySelector('input[name="kategori"][value="' + CSS.escape(wanted) + '"]');
    if (radio) radio.checked = true;
  }

  paintSteps();
  refresh();
  refreshBibName();
})();
