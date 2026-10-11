/* Daftar peserta dan cek pendaftaran, diambil langsung dari lembar panitia
   lewat Apps Script. Yang keluar dari sana hanya nomor dada, nama, dan
   kategori - NIK, nomor HP, email, kontak darurat, nominal, dan bukti
   pembayaran tidak pernah ikut. Penyaringannya di server, bukan di sini:
   apa pun yang dikirim ke peramban sudah bisa dibaca siapa saja. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const { ENDPOINT_DAFTAR } = window.HIPMI;

  const wadah = $('#startlist');
  if (!wadah || !ENDPOINT_DAFTAR) return;

  const daftar = $('#slDaftar');
  const hitung = $('#slHitung');
  const cari   = $('#slCari');
  const pesan  = $('#slPesan');

  function aman(t) {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
  }

  function kosong(teks) {
    daftar.innerHTML = '<p class="sl-kosong">' + aman(teks) + '</p>';
  }

  /* ---- hitungan: angka saja, tanpa satu nama pun --------------------- */
  function muatHitungan() {
    fetch(ENDPOINT_DAFTAR + '?aksi=peserta')
      .then(function (r) { return r.json(); })
      .then(function (h) {
        if (!h || !h.ok) return;
        hitung.innerHTML = [
          ['Semua', h.jumlah || 0],
          ['10K', h.k10 || 0],
          ['5K', h.k5 || 0]
        ].map(function (x) {
          return '<span class="sl-angka"><b>' + x[1] + '</b>' + x[0] + '</span>';
        }).join('');
      })
      .catch(function () { /* hitungan pelengkap; diamkan bila gagal */ });
  }

  /* ---- pencarian: dikerjakan server, bukan di sini -------------------- */
  /* Halaman ini tidak pernah lagi memegang daftar lengkapnya. Setiap
     pencarian bertanya ke server dan hanya menerima yang cocok, jadi
     menutup daftar di layar betul-betul menutupnya - bukan sekadar
     menyembunyikan data yang terlanjur dikirim ke peramban. */
  var tunda = null;
  var permintaanKe = 0;

  function bersihkan() {
    pesan.hidden = true;
    kosong('Ketik nama atau nomor dada untuk mencari peserta.');
  }

  function telusuri() {
    const kata = (cari.value || '').trim();
    if (kata.length < 2) { bersihkan(); return; }

    const ini = ++permintaanKe;
    pesan.textContent = 'Mencari…';
    pesan.hidden = false;

    fetch(ENDPOINT_DAFTAR + '?aksi=cari&q=' + encodeURIComponent(kata))
      .then(function (r) { return r.json(); })
      .then(function (h) {
        /* Jawaban yang datang terlambat tidak boleh menimpa yang terbaru. */
        if (ini !== permintaanKe) return;
        pesan.hidden = true;

        if (!h || !h.ok) { kosong(h && h.pesan ? h.pesan : 'Pencarian gagal.'); return; }
        if (!h.peserta || !h.peserta.length) {
          kosong('Tidak ada peserta bernomor dada yang cocok dengan "' + kata + '".');
          return;
        }

        daftar.innerHTML = h.peserta.map(function (p) {
          return '<li class="sl-baris">' +
                 '<span class="sl-bib">' + aman(p.bib) + '</span>' +
                 '<span class="sl-nama">' + aman(p.nama) + '</span>' +
                 '<span class="sl-kat">' + aman(p.kategori.toUpperCase()) + '</span></li>';
        }).join('');

        if (h.dipotong) {
          pesan.textContent = 'Menampilkan ' + h.peserta.length + ' dari ' + h.jumlah +
                              ' yang cocok. Persempit pencarian Anda.';
          pesan.hidden = false;
        }
      })
      .catch(function () {
        if (ini !== permintaanKe) return;
        pesan.hidden = true;
        kosong('Tidak dapat menghubungi server. Coba lagi sebentar.');
      });
  }

  /* Menunggu ketikan berhenti dulu supaya tidak satu permintaan per huruf. */
  cari.addEventListener('input', function () {
    clearTimeout(tunda);
    tunda = setTimeout(telusuri, 350);
  });

  const btnSegar = $('#slSegar');
  if (btnSegar) btnSegar.addEventListener('click', function () {
    muatHitungan();
    telusuri();
  });

  /* ---- cek pendaftaran sendiri ------------------------------------------ */
  /* Kode pendaftaran berurutan dan mudah ditebak, jadi email harus cocok
     juga. Server yang memutuskan; di sini hanya menampilkan jawabannya. */
  const formCek = $('#cekForm');
  if (formCek) {
    formCek.addEventListener('submit', function (e) {
      e.preventDefault();
      const kode = ($('#cekKode').value || '').trim().toUpperCase();
      const surel = ($('#cekEmail').value || '').trim();
      const hasil = $('#cekHasil');
      if (!kode || !surel) {
        hasil.className = 'cek-hasil is-gagal';
        hasil.textContent = 'Isi kode pendaftaran dan email yang Anda pakai mendaftar.';
        hasil.hidden = false;
        return;
      }
      hasil.className = 'cek-hasil';
      hasil.textContent = 'Memeriksa…';
      hasil.hidden = false;

      const url = ENDPOINT_DAFTAR + '?aksi=cek&kode=' + encodeURIComponent(kode) +
                  '&email=' + encodeURIComponent(surel);
      fetch(url).then(function (r) { return r.json(); }).then(function (h) {
        if (!h.ok) {
          hasil.className = 'cek-hasil is-gagal';
          hasil.textContent = h.pesan || 'Tidak ditemukan.';
          return;
        }
        const status = h.bib
          ? 'Nomor dada Anda <b>' + aman(h.bib) + '</b>.'
          : (h.status === 'ditolak'
              ? 'Pendaftaran ditolak panitia. Hubungi hipmirun@hipmikaranganyar.com.'
              : 'Pembayaran belum diverifikasi. Nomor dada terbit setelah panitia memeriksanya.');
        hasil.className = 'cek-hasil is-ok';
        hasil.innerHTML = '<b>' + aman(h.nama) + '</b> &middot; ' + aman(h.kategori.toUpperCase()) +
          (h.jersey ? ' &middot; jersey ' + aman(h.jersey) : '') + '<br>' + status;
      }).catch(function () {
        hasil.className = 'cek-hasil is-gagal';
        hasil.textContent = 'Tidak dapat menghubungi server. Coba lagi sebentar.';
      });
    });
  }

  bersihkan();
  muatHitungan();
})();
