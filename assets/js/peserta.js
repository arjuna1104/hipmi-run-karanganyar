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

  let semua = [];
  let saring = 'semua';

  function aman(t) {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
  }

  function gambar() {
    const kata = (cari.value || '').trim().toLowerCase();
    const tampil = semua.filter(function (p) {
      if (saring !== 'semua' && p.kategori !== saring) return false;
      if (!kata) return true;
      return p.nama.toLowerCase().indexOf(kata) >= 0 || p.bib.indexOf(kata) >= 0;
    });

    if (!tampil.length) {
      daftar.innerHTML = '<p class="sl-kosong">' +
        (semua.length ? 'Tidak ada yang cocok dengan pencarian itu.'
                      : 'Belum ada peserta bernomor dada. Nomor terbit setelah panitia memverifikasi pembayaran.') +
        '</p>';
      return;
    }
    daftar.innerHTML = tampil.map(function (p) {
      return '<li class="sl-baris">' +
             '<span class="sl-bib">' + aman(p.bib) + '</span>' +
             '<span class="sl-nama">' + aman(p.nama) + '</span>' +
             '<span class="sl-kat">' + aman(p.kategori.toUpperCase()) + '</span></li>';
    }).join('');
  }

  function hitungan() {
    const n10 = semua.filter(function (p) { return p.kategori === '10k'; }).length;
    const n5  = semua.filter(function (p) { return p.kategori === '5k'; }).length;
    hitung.innerHTML = [
      ['semua', 'Semua', semua.length],
      ['10k', '10K', n10],
      ['5k', '5K', n5]
    ].map(function (x) {
      return '<button type="button" data-kat="' + x[0] + '" aria-pressed="' +
             (saring === x[0]) + '"><b>' + x[2] + '</b>' + x[1] + '</button>';
    }).join('');
  }

  function muat() {
    pesan.textContent = 'Memuat daftar peserta…';
    pesan.hidden = false;
    fetch(ENDPOINT_DAFTAR + '?aksi=peserta', { method: 'GET' })
      .then(function (r) { return r.json(); })
      .then(function (h) {
        if (!h || !h.ok) throw new Error('Daftar peserta tidak terbaca.');
        semua = h.peserta || [];
        pesan.hidden = true;
        hitungan();
        gambar();
      })
      .catch(function () {
        /* Daftar ini pelengkap, bukan inti halaman. Kalau tidak terjangkau,
           katakan apa adanya dan jangan mengosongkan sisanya. */
        pesan.textContent = 'Daftar peserta sedang tidak dapat dimuat. Coba beberapa saat lagi.';
        pesan.hidden = false;
      });
  }

  hitung.addEventListener('click', function (e) {
    const t = e.target.closest('button[data-kat]');
    if (!t) return;
    saring = t.dataset.kat;
    hitungan();
    gambar();
  });
  cari.addEventListener('input', gambar);
  const btnSegar = $('#slSegar');
  if (btnSegar) btnSegar.addEventListener('click', muat);

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

  muat();
})();
