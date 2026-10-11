/* kuota.js - angka kuota di beranda diambil dari spreadsheet panitia.

   Sebelum ini semua angka ditulis tangan di data.js dengan taken: 0, jadi
   papan kuota tetap berkata "3.000 tersisa" walaupun orang sudah mendaftar.
   Sekarang angkanya datang dari endpoint ?aksi=ringkas, yang hanya
   mengembalikan hitungan - tidak ada nama, tidak ada identitas peserta.

   Kalau jaringan gagal atau endpoint belum siap, angka bawaan di HTML
   dibiarkan apa adanya. Lebih baik menampilkan angka awal daripada
   menampilkan "0 tersisa" karena permintaan gagal. */
(function () {
  'use strict';

  const D = window.HIPMI || {};
  const alamat = D.ENDPOINT_DAFTAR;
  if (!alamat) return;

  const el = function (id) { return document.getElementById(id); };

  /* Pemisah ribuan gaya Indonesia: 3.000, bukan 3,000. */
  const angka = function (n) { return Number(n).toLocaleString('id-ID'); };

  /* Hanya endpoint yang memberi kunci ini; kalau tidak lengkap kita diam
     saja daripada menulis undefined ke halaman. */
  function pasang (r) {
    if (!r || r.ok !== true || !r.kuota) return;

    const sisa  = Number(r.kuota.sisa);
    const total = Number(r.kuota.total);
    if (isFinite(sisa) && isFinite(total) && total > 0) {
      if (el('kuotaSisa'))  el('kuotaSisa').textContent  = angka(sisa);
      if (el('kuotaTotal')) el('kuotaTotal').textContent = angka(total);
      /* Batang terisi menunjukkan yang SUDAH terpakai, bukan yang tersisa. */
      if (el('kuotaGauge')) {
        const pakai = Math.min(100, Math.max(0, (total - sisa) / total * 100));
        /* Sedikitnya 0,6% supaya satu pendaftar pertama tetap terlihat
           sebagai garis tipis, bukan batang kosong sama sekali. */
        el('kuotaGauge').style.width = (pakai > 0 ? Math.max(0.6, pakai) : 0) + '%';
      }
    }

    if (r.kategori) {
      if (el('kuotaKat10k') && r.kategori['10k'] != null) {
        el('kuotaKat10k').textContent = angka(r.kategori['10k']);
      }
      if (el('kuotaKat5k') && r.kategori['5k'] != null) {
        el('kuotaKat5k').textContent = angka(r.kategori['5k']);
      }
    }

    if (el('kuotaPromo') && r.promo && r.promo.total) {
      el('kuotaPromo').textContent = r.promo.sisa > 0
        ? angka(r.promo.sisa) + ' kode tersisa'
        : 'kode habis';
    }

    if (el('kuotaEarly') && r.earlyBird) {
      el('kuotaEarly').textContent = r.earlyBird.sisa > 0
        ? angka(r.earlyBird.sisa) + ' slot tersisa'
        : 'slot habis';
    }
  }

  /* Apps Script menolak CORS pada sebagian browser, jadi JSONP dulu seperti
     peserta.js, dengan fetch sebagai jaring kedua. Nama callback dibuat acak
     dan dibuang setelah dipakai. */
  const nama = 'hipmiKuota' + Math.random().toString(36).slice(2, 10);
  var sudah = false;

  function bersih (tag) {
    if (tag && tag.parentNode) tag.parentNode.removeChild(tag);
    try { delete window[nama]; } catch (e) { window[nama] = undefined; }
  }

  window[nama] = function (r) {
    sudah = true;
    bersih(tag);
    try { pasang(r); } catch (e) { /* angka bawaan dibiarkan */ }
  };

  const tag = document.createElement('script');
  tag.src = alamat + '?aksi=ringkas&callback=' + nama;
  tag.onerror = function () {
    bersih(tag);
    if (sudah) return;
    fetch(alamat + '?aksi=ringkas')
      .then(function (b) { return b.json(); })
      .then(pasang)
      .catch(function () { /* diam: angka bawaan tetap tampil */ });
  };
  document.head.appendChild(tag);

  /* Kalau JSONP tidak pernah memanggil balik dalam 8 detik, coba fetch. */
  setTimeout(function () { if (!sudah && tag.parentNode) tag.onerror(); }, 8000);
}());
