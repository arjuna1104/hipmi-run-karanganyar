/* kuota.js - menjaga harga di kartu kategori beranda tetap benar.

   Dulu berkas ini juga memasang sisa kuota dan jumlah pendaftar. Keduanya
   sudah dicabut dari halaman atas permintaan panitia, jadi yang tersisa
   hanya satu tugas: menanyakan harga yang BERLAKU SEKARANG ke server dan
   memasangnya. Early bird berhenti sendiri begitu kuota kategorinya habis
   atau tanggalnya lewat, dan kartu yang masih memajang coretan harga lama
   akan menjanjikan diskon yang sudah tidak ditagih.

   Angka kuota tidak pernah lagi ditampilkan di halaman mana pun; yang
   diambil dari jawaban server hanyalah kolom harga. */
(function () {
  'use strict';

  const D = window.HIPMI || {};
  const alamat = D.ENDPOINT_DAFTAR;
  if (!alamat) return;

  const el = function (id) { return document.getElementById(id); };
  if (!el('hargaKartu10k') && !el('hargaKartu5k')) return;   // bukan halaman beranda

  const rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };

  function pasang (r) {
    if (!r || r.ok !== true || !r.harga) return;

    /* Harga normal dipakai sebagai pembanding: selama harga berlaku masih di
       bawahnya, early bird belum habis. Begitu sama, coretannya dicabut
       supaya tidak ada diskon yang dipajang padahal sudah tidak ada. */
    [['10k', 250000], ['5k', 200000]].forEach(function (x) {
      const kat = x[0], normal = x[1];
      const kotak = el('hargaKartu' + kat), tag = el('tagKartu' + kat);
      const berlaku = Number(r.harga[kat] || 0);
      if (!kotak || !berlaku) return;

      kotak.innerHTML = berlaku < normal
        ? '<b>' + rupiah(berlaku) + '</b><s>' + rupiah(normal) + '</s>'
        : '<b>' + rupiah(berlaku) + '</b>';
      if (tag) tag.textContent = berlaku < normal ? 'Early bird' : 'Harga normal';
    });
  }

  /* Apps Script menolak CORS pada sebagian browser, jadi JSONP dulu dengan
     fetch sebagai jaring kedua. Nama callback dibuat acak dan dibuang
     setelah dipakai. Kalau dua-duanya gagal, harga bawaan di HTML tetap
     tampil - dan nominal yang benar-benar ditagih toh dihitung ulang di
     server saat pendaftaran masuk. */
  const nama = 'hipmiHarga' + Math.random().toString(36).slice(2, 10);
  var sudah = false;

  function bersih (tag) {
    if (tag && tag.parentNode) tag.parentNode.removeChild(tag);
    try { delete window[nama]; } catch (e) { window[nama] = undefined; }
  }

  window[nama] = function (r) {
    sudah = true;
    bersih(tag);
    try { pasang(r); } catch (e) { /* harga bawaan dibiarkan */ }
  };

  const tag = document.createElement('script');
  tag.src = alamat + '?aksi=ringkas&callback=' + nama;
  tag.onerror = function () {
    bersih(tag);
    if (sudah) return;
    fetch(alamat + '?aksi=ringkas')
      .then(function (b) { return b.json(); })
      .then(pasang)
      .catch(function () { /* diam: harga bawaan tetap tampil */ });
  };
  document.head.appendChild(tag);

  setTimeout(function () { if (!sudah && tag.parentNode) tag.onerror(); }, 8000);
}());
