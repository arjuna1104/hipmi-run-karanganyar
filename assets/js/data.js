/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - data.js
   DEMO DATASET. Every time, rank and photo below is sample data used to
   build and review the interface before race day. On production these
   objects are replaced by the panitia RFID timing feed and the registration
   database. Figures marked (PRD) are fixed by the project brief.
   ========================================================================== */
window.HIPMI = (function () {
  'use strict';

  /* ---- event ---------------------------------------------------------- */
  const EVENT = {
    name: 'HIPMI RUN KARANGANYAR',
    edition: 'VOL. #1',
    tagline: 'Pengusaha Pejuang Berdampak',
    motto: 'Run Together, Grow Further',
    purpose: 'Bersama Membangun Indonesia Lebih Baik',
    organiser: 'BPC HIPMI Karanganyar',
    // Tanggal lomba belum ditetapkan penyelenggara. Diasumsikan di sini supaya
    // hitung mundur, rundown, dan tanggal race pack tetap sinkron antar halaman.
    raceDay: '2026-12-13T05:45:00+07:00',
    raceDayLabel: 'Minggu, 13 Desember 2026',
    flagOff: '05:45 WIB',
    // Batas early bird juga asumsi; ubah bersama harga bila jadwalnya berbeda.
    earlyBirdUntil: '2026-11-13T23:59:00+07:00',
    earlyBirdLabel: '13 November 2026',
    venue: 'Kota Karanganyar',
    rpcVenue: 'Gedung Wanita Karanganyar',
    prizePool: 75000000
  };

  /* ---- kategori lomba (PRD section 4) --------------------------------- */
  const CATEGORIES = [
    {
      id: '10k', code: '10K', name: '10K Challenge', distance: 10.0,
      age: '17 tahun ke atas', cot: '2 jam 15 menit',
      priceEarly: 225000, priceNormal: 250000,
      taken: 684,
      blurb: 'Lintasan penuh menembus poros kota Karanganyar dengan empat timing mat RFID.'
    },
    {
      id: '5k', code: '5K', name: '5K Fun Run', distance: 5.0,
      age: 'Semua umur', cot: '1 jam 15 menit',
      priceEarly: 175000, priceNormal: 200000,
      taken: 629,
      blurb: 'Loop pendek lewat cheering zone warga, ramah keluarga dan pelari pemula.'
    }
  ];

  /* ---- hadiah podium : total Rp 75.000.000 ---------------------------- */
  const PRIZES = [
    { cat: '10K Challenge', top: true, rows: [11000000, 7000000, 4500000] },
    { cat: '5K Fun Run', rows: [7000000, 5000000, 3000000] }
  ];

  /* ---- hasil lomba : demo feed ---------------------------------------- */
  const RESULTS = {
    '10k': {
      finishers: 1186,
      putra: [
        { rank: 1, bib: '1002', name: 'Agus Prayogo', club: 'Dewan Juri Lomba', gun: '32:24', net: '32:10', pace: '03:13' },
        { rank: 2, bib: '1017', name: 'Rikki Simbolon', club: 'Solo Runners', gun: '33:16', net: '33:02', pace: '03:18' },
        { rank: 3, bib: '1045', name: 'Hamdan Sayuti', club: 'Lawu Trail Club', gun: '34:03', net: '33:48', pace: '03:23' },
        { rank: 4, bib: '1128', name: 'Yulianto Wibowo', club: 'Karanganyar Striders', gun: '35:29', net: '35:11', pace: '03:31' },
        { rank: 5, bib: '1074', name: 'Bagas Ardiansyah', club: 'Tawangmangu Pace', gun: '36:44', net: '36:27', pace: '03:39' },
        { rank: 6, bib: '1233', name: 'Dimas Nurhidayat', club: 'Sragen Run Club', gun: '38:11', net: '37:53', pace: '03:47' },
        { rank: 7, bib: '1190', name: 'Fauzan Ramadhan', club: 'Solo Runners', gun: '39:40', net: '39:20', pace: '03:56' },
        { rank: 8, bib: '1361', name: 'Teguh Prasetyo', club: 'Matesih Runners', gun: '41:27', net: '41:06', pace: '04:07' },
        { rank: 9, bib: '1288', name: 'Ilham Maulana', club: 'Independent', gun: '43:58', net: '43:34', pace: '04:21' },
        { rank: 10, bib: '1407', name: 'Rizky Firmansyah', club: 'Colomadu Pacers', gun: '45:39', net: '45:12', pace: '04:31' },
        { rank: 11, bib: '1512', name: 'Wahyu Kurniawan', club: 'Karanganyar Striders', gun: '47:56', net: '47:28', pace: '04:45' },
        { rank: 12, bib: '1338', name: 'Satria Nugroho', club: 'Independent', gun: '49:34', net: '49:05', pace: '04:55' },
        { rank: 13, bib: '1620', name: 'Adit Pambudi', club: 'Jaten Run Club', gun: '51:02', net: '50:31', pace: '05:03' },
        { rank: 14, bib: '1493', name: 'Bima Pratama', club: 'Karanganyar Striders', gun: '51:38', net: '51:10', pace: '05:07' }
      ],
      putri: [
        { rank: 1, bib: '1009', name: 'Odekta Naibaho', club: 'Dewan Juri Lomba', gun: '36:12', net: '35:58', pace: '03:36' },
        { rank: 2, bib: '1063', name: 'Ayu Kartika Wijaya', club: 'Solo Runners', gun: '37:48', net: '37:31', pace: '03:45' },
        { rank: 3, bib: '1121', name: 'Nurul Fadhilah', club: 'Lawu Trail Club', gun: '39:22', net: '39:04', pace: '03:54' },
        { rank: 4, bib: '1255', name: 'Ratna Dewi Anjani', club: 'Karanganyar Striders', gun: '42:17', net: '41:55', pace: '04:11' },
        { rank: 5, bib: '1302', name: 'Salsabila Ramadhani', club: 'Independent', gun: '44:50', net: '44:26', pace: '04:26' },
        { rank: 6, bib: '1418', name: 'Retno Widyastuti', club: 'Tawangmangu Pace', gun: '46:35', net: '46:08', pace: '04:37' },
        { rank: 7, bib: '1377', name: 'Anisa Puspita Dewi', club: 'Jaten Run Club', gun: '48:19', net: '47:52', pace: '04:47' },
        { rank: 8, bib: '1544', name: 'Maharani Sekar Ayu', club: 'Colomadu Pacers', gun: '50:41', net: '50:12', pace: '05:01' },
        { rank: 9, bib: '1188', name: 'Sri Wahyuni Hartati', club: 'Lawu Veteran Run', gun: '52:11', net: '51:44', pace: '05:10' },
        { rank: 10, bib: '1466', name: 'Kirana Hapsari', club: 'Independent', gun: '52:28', net: '51:57', pace: '05:12' },
        { rank: 11, bib: '1591', name: 'Laras Ayuningtyas', club: 'Matesih Runners', gun: '54:06', net: '53:33', pace: '05:21' }
      ]
    },
    '5k': {
      finishers: 1842,
      putra: [
        { rank: 1, bib: '0521', name: 'Raka Adiwijaya', club: 'SMAN 1 Karanganyar', gun: '17:06', net: '16:58', pace: '03:24' },
        { rank: 2, bib: '0588', name: 'Galih Saputro', club: 'Jaten Run Club', gun: '17:52', net: '17:41', pace: '03:32' },
        { rank: 3, bib: '0644', name: 'Naufal Hakim', club: 'Solo Runners', gun: '18:40', net: '18:27', pace: '03:41' },
        { rank: 4, bib: '0709', name: 'Arif Setiawan', club: 'Independent', gun: '19:33', net: '19:18', pace: '03:52' },
        { rank: 5, bib: '0523', name: 'Bayu Anggoro', club: 'Colomadu Pacers', gun: '20:47', net: '20:29', pace: '04:06' },
        { rank: 6, bib: '0877', name: 'Fajar Kurniawan', club: 'Matesih Runners', gun: '21:58', net: '21:36', pace: '04:19' },
        { rank: 7, bib: '0955', name: 'Reza Maulana', club: 'Independent', gun: '23:12', net: '22:49', pace: '04:34' },
        { rank: 8, bib: '0901', name: 'Yusuf Ardiansyah', club: 'Tawangmangu Pace', gun: '24:40', net: '24:15', pace: '04:51' }
      ],
      putri: [
        { rank: 1, bib: '0533', name: 'Alika Permatasari', club: 'SMAN 1 Karanganyar', gun: '19:24', net: '19:12', pace: '03:50' },
        { rank: 2, bib: '0597', name: 'Nayla Zahra Putri', club: 'Solo Runners', gun: '20:36', net: '20:21', pace: '04:04' },
        { rank: 3, bib: '0668', name: 'Citra Wulandari', club: 'Jaten Run Club', gun: '21:49', net: '21:30', pace: '04:18' },
        { rank: 4, bib: '0741', name: 'Hana Maharani', club: 'Independent', gun: '23:05', net: '22:44', pace: '04:33' },
        { rank: 5, bib: '0888', name: 'Shafa Aulia Rahma', club: 'Colomadu Pacers', gun: '24:31', net: '24:07', pace: '04:49' },
        { rank: 6, bib: '0970', name: 'Keisha Amelia', club: 'Matesih Runners', gun: '26:02', net: '25:35', pace: '05:07' }
      ]
    }
  };

  /* ---- split pace : juara 1 vs pelari aktif (PRD section 5.3) --------- */
  const SPLITS = {
    checkpoints: [2.5, 5.0, 7.5, 10.0],
    // paceSec = detik per km pada segmen tersebut, cumSec = waktu kumulatif
    champion: {
      name: 'Agus Prayogo', bib: '1002', label: 'Juara 1 - 10K Challenge',
      avgPace: '03:13',
      legs: [
        { km: 2.5, paceSec: 190, cumSec: 475 },
        { km: 5.0, paceSec: 192, cumSec: 955 },
        { km: 7.5, paceSec: 196, cumSec: 1445 },
        { km: 10.0, paceSec: 194, cumSec: 1930 }
      ]
    },
    runner: {
      name: 'Bima Pratama', bib: '1493', label: 'Pelari aktif',
      avgPace: '05:07',
      legs: [
        { km: 2.5, paceSec: 292, cumSec: 730 },
        { km: 5.0, paceSec: 304, cumSec: 1490 },
        { km: 7.5, paceSec: 320, cumSec: 2290 },
        { km: 10.0, paceSec: 312, cumSec: 3070 }
      ]
    }
  };

  /* ---- peserta : e-Pass lookup ---------------------------------------- */
  const RUNNERS = {
    '1493': {
      bib: '1493', name: 'Bima Pratama', category: '10k', categoryName: '10K Challenge',
      gender: 'Putra', age: 24, city: 'Karanganyar', club: 'Karanganyar Striders',
      jersey: 'L', blood: 'O', chip: 'UHF-DF-88241493', wave: 'Wave A - 05:45 WIB',
      emergency: 'Sulastri Pratama', emergencyPhone: '+62 8xx-xxxx-xxxx',
      status: 'finished',
      rpc: [
        { item: 'Nomor dada (BIB) + safety pin', done: true, at: '12 Des, 10:24' },
        { item: 'Jersey dry-fit ukuran L', done: true, at: '12 Des, 10:24' },
        { item: 'Timing chip RFID', done: true, at: '12 Des, 10:26' },
        { item: 'Goodie bag + kupon refreshment', done: true, at: '12 Des, 10:26' }
      ],
      result: { rank: 14, of: 1186, gun: '51:38', net: '51:10', pace: '05:07' },
      photos: [
        { seed: 'hipmi-run-lawu-boulevard-km75-a', point: 'Poros Kota', km: 'KM 7.5', time: '06:23:41' },
        { seed: 'hipmi-run-lawu-boulevard-km75-b', point: 'Poros Kota', km: 'KM 7.5', time: '06:23:44' },
        { seed: 'hipmi-run-finish-arch-km10-a', point: 'Finish Line Arch', km: 'KM 10.0', time: '06:36:55' },
        { seed: 'hipmi-run-finish-arch-km10-b', point: 'Finish Line Arch', km: 'KM 10.0', time: '06:36:58' },
        { seed: 'hipmi-run-finish-arch-km10-c', point: 'Finish Line Arch', km: 'KM 10.0', time: '06:37:02' },
        { seed: 'hipmi-run-medal-zone-finisher', point: 'Medal Zone', km: 'Finish', time: '06:39:10' }
      ]
    },
    '1188': {
      bib: '1188', name: 'Sri Wahyuni Hartati', category: '10k', categoryName: '10K Challenge',
      gender: 'Putri', age: 47, city: 'Tawangmangu', club: 'Lawu Veteran Run',
      jersey: 'M', blood: 'B', chip: 'UHF-DF-88241188', wave: 'Wave B - 05:55 WIB',
      emergency: 'Bagus Hartati', emergencyPhone: '+62 8xx-xxxx-xxxx',
      status: 'finished',
      rpc: [
        { item: 'Nomor dada (BIB) + safety pin', done: true, at: '11 Des, 15:02' },
        { item: 'Jersey dry-fit ukuran M', done: true, at: '11 Des, 15:02' },
        { item: 'Timing chip RFID', done: true, at: '11 Des, 15:03' },
        { item: 'Goodie bag + kupon refreshment', done: true, at: '11 Des, 15:05' }
      ],
      result: { rank: 9, of: 1186, gun: '52:11', net: '51:44', pace: '05:10' },
      photos: [
        { seed: 'hipmi-run-master-km75-climb', point: 'Poros Kota', km: 'KM 7.5', time: '06:41:12' },
        { seed: 'hipmi-run-master-finish-arch', point: 'Finish Line Arch', km: 'KM 10.0', time: '06:47:39' },
        { seed: 'hipmi-run-master-podium-zone', point: 'Podium Zone', km: 'Finish', time: '07:52:20' }
      ]
    },
    '0523': {
      bib: '0523', name: 'Bayu Anggoro', category: '5k', categoryName: '5K Fun Run',
      gender: 'Putra', age: 16, city: 'Colomadu', club: 'Colomadu Pacers',
      jersey: 'S', blood: 'A', chip: 'UHF-DF-88240523', wave: 'Wave B - 06:10 WIB',
      emergency: 'Wenny Anggoro', emergencyPhone: '+62 8xx-xxxx-xxxx',
      status: 'finished',
      rpc: [
        { item: 'Nomor dada (BIB) + safety pin', done: true, at: '12 Des, 08:47' },
        { item: 'Jersey dry-fit ukuran S', done: true, at: '12 Des, 08:47' },
        { item: 'Timing chip RFID', done: true, at: '12 Des, 08:49' },
        { item: 'Goodie bag + kupon refreshment', done: true, at: '12 Des, 08:50' }
      ],
      result: { rank: 5, of: 1842, gun: '20:47', net: '20:29', pace: '04:06' },
      photos: [
        { seed: 'hipmi-run-5k-cheering-zone', point: 'Cheering Zone', km: 'KM 3.0', time: '06:22:08' },
        { seed: 'hipmi-run-5k-finish-arch', point: 'Finish Line Arch', km: 'KM 5.0', time: '06:30:29' }
      ]
    },
    '1155': {
      bib: '1155', name: 'Dinda Ayu Lestari', category: '10k', categoryName: '10K Challenge',
      gender: 'Putri', age: 27, city: 'Jaten', club: 'Karanganyar Striders',
      jersey: 'XS', blood: 'AB', chip: 'UHF-DF-88241155', wave: 'Wave A - 05:45 WIB',
      emergency: 'Prasetya Lestari', emergencyPhone: '+62 8xx-xxxx-xxxx',
      status: 'registered',
      rpc: [
        { item: 'Nomor dada (BIB) + safety pin', done: false, at: null },
        { item: 'Jersey dry-fit ukuran XS', done: false, at: null },
        { item: 'Timing chip RFID', done: false, at: null },
        { item: 'Goodie bag + kupon refreshment', done: false, at: null }
      ],
      result: null,
      photos: []
    }
  };

  /* ---- rute : checkpoint, water station, medis ------------------------ */
  const CHECKPOINTS = [
    { km: '0.0', name: 'Start Arch - Alun-alun Karanganyar', type: 'start', icon: 'ph-flag-banner', note: 'Flag-off 05:45 WIB, timing mat wave A' },
    { km: '2.5', name: 'Water Station 1', type: 'water', icon: 'ph-drop', note: 'Air mineral, isotonik, timing mat split' },
    { km: '4.0', name: 'Cheering Zone Jaten', type: 'cheer', icon: 'ph-megaphone', note: 'Drumband pelajar dan warga RW 04' },
    { km: '5.0', name: 'Water Station 2 + Sponge', type: 'water', icon: 'ph-drop', note: 'Sponge basah, pos medis, timing mat split' },
    { km: '6.2', name: 'Ambulans Siaga Posko Utara', type: 'medic', icon: 'ph-first-aid-kit', note: 'Dua unit ambulans, tim paramedis PMI' },
    { km: '7.5', name: 'Water Station 3 - Poros Kota', type: 'water', icon: 'ph-drop', note: 'Titik foto resmi, timing mat split, elevasi puncak' },
    { km: '8.8', name: 'Cheering Zone Bejen', type: 'cheer', icon: 'ph-megaphone', note: 'Panggung komunitas lari Karanganyar' },
    { km: '10.0', name: 'Finish Line Arch', type: 'finish', icon: 'ph-trophy', note: 'Timing mat finis, medal zone, refreshment' }
  ];

  // profil elevasi : meter di atas permukaan laut, +110m total gain (PRD)
  const ELEVATION = [
    { km: 0.0, m: 511 }, { km: 0.8, m: 516 }, { km: 1.6, m: 524 }, { km: 2.5, m: 533 },
    { km: 3.3, m: 545 }, { km: 4.1, m: 552 }, { km: 5.0, m: 561 }, { km: 5.8, m: 574 },
    { km: 6.6, m: 592 }, { km: 7.5, m: 621 }, { km: 8.2, m: 604 }, { km: 8.9, m: 578 },
    { km: 9.4, m: 552 }, { km: 10.0, m: 527 }
  ];

  /* ---- rundown -------------------------------------------------------- */
  const AGENDA = [
    { date: 'Jumat, 11 Des', time: '10:00 - 20:00', title: 'Race Pack Collection hari pertama',
      body: 'Gedung Wanita Karanganyar. Tunjukkan e-Pass dan KTP asli sesuai NIK pendaftaran.' },
    { date: 'Sabtu, 12 Des', time: '09:00 - 18:00', title: 'Race Pack Collection hari kedua',
      body: 'Hari terakhir pengambilan. Perwakilan wajib membawa surat kuasa bermaterai.' },
    { date: 'Sabtu, 12 Des', time: '15:00 - 17:00', title: 'Technical meeting dan briefing wasit',
      body: 'Penjelasan COT, aturan diskualifikasi, dan prosedur pos medis kedua kategori.' },
    { date: 'Minggu, 13 Des', time: '04:30', title: 'Area start dibuka', body: 'Penitipan barang, pemanasan bersama, dan pengecekan chip RFID di gate.' },
    { date: 'Minggu, 13 Des', time: '05:45', title: 'Flag-off 10K Challenge', body: 'Wave A dilepas dari Alun-alun Karanganyar.', now: true },
    { date: 'Minggu, 13 Des', time: '06:10', title: 'Flag-off 5K Fun Run', body: 'Wave B bersama peserta keluarga dan komunitas.' },
    { date: 'Minggu, 13 Des', time: '09:00', title: 'Seremoni podium dan penyerahan hadiah',
      body: 'Juara 1 sampai 3 putra dan putri kedua kategori, total hadiah Rp 75.000.000.' }
  ];

  /* ---- isi race pack yang dapat dibuka detailnya ----------------------- */
  /* Spesifikasi diambil dari lembar mockup jersey dan berkas desain medali.
     Ukuran fisik medali belum tercantum di berkas desain, jadi tidak ditebak. */
  const IMG = 'assets/img/v2/';
  const PRODUCTS = {
    jersey: {
      name: 'Jersey lari eksklusif',
      lead: 'Potongan raglan hijau hutan dan putih. Logo HIPMI RUN di dada, dan aksara ' +
            'Jawa membentang di punggung sebagai penanda asal lomba.',
      hero: IMG + 'jersey-front.webp',
      heroAlt: 'Jersey HIPMI RUN Karanganyar tampak depan.',
      gallery: [
        { src: IMG + 'jersey-front.webp',  title: 'Tampak depan',  note: 'Logo HIPMI RUN di tengah dada' },
        { src: IMG + 'jersey-back.webp',   title: 'Tampak belakang', note: 'Aksara Jawa di bawah kerah, logo Bank Jateng di punggung bawah' },
        { src: IMG + 'jersey-sleeve.webp', title: 'Detail lengan', note: 'Panel putih menyambung ke sisi badan' }
      ],
      specs: [
        { k: 'Warna',    v: 'Hijau hutan dengan panel putih' },
        { k: 'Potongan', v: 'Raglan, sporty fit' },
        { k: 'Punggung', v: 'Aksara Jawa' },
        { k: 'Ukuran',   v: 'XS sampai XXL' },
        { k: 'Bahan',    v: 'Rajut cepat kering' }
      ],
      cta: { label: 'Lihat panduan ukuran', href: 'registrasi.html?kategori=10k' }
    },

    medali: {
      name: 'Medali finisher',
      lead: 'Berbentuk logo HIPMI: sepasang tangan menopang bola dunia dengan peta ' +
            'Indonesia di bagian kepala. Tersedia dua varian dengan warna tali berbeda.',
      hero: IMG + 'medal-pair.webp',
      heroAlt: 'Medali finisher 5K dan 10K HIPMI RUN Karanganyar.',
      gallery: [
        { src: IMG + 'medal-5k.webp',     title: 'Varian 5K',    note: 'Tali hijau tua bertuliskan HIPMI RUN' },
        { src: IMG + 'medal-10k.webp',    title: 'Varian 10K',   note: 'Tali hijau muda bertuliskan HIPMI RUN' },
        { src: IMG + 'medal-logo.webp',   title: 'Kepala medali', note: 'Peta Indonesia pada bidang bundar' },
        { src: IMG + 'medal-jarak.webp',  title: 'Tulisan jarak', note: 'Alas bertuliskan 5K FINISHER atau 10K FINISHER' },
        { src: IMG + 'medal-tali.webp',   title: 'Tali medali',  note: 'Sublimasi full color, nyaman di leher' }
      ],
      specs: [
        { k: 'Bentuk',   v: 'Logo HIPMI dengan peta Indonesia' },
        { k: 'Varian',   v: '5K tali hijau, 10K tali putih' },
        { k: 'Ukiran',   v: 'Presisi, perpaduan doff dan glossy' },
        { k: 'Tali',     v: 'Sublimasi full color bermotif topografi' },
        { k: 'Kemasan',  v: 'Box eksklusif berlogo' },
        { k: 'Penerima', v: 'Seluruh finisher, tanpa kecuali' }
      ],
      note: 'Diameter dan berat medali belum tercantum di berkas desain.'
    },

    bib: {
      name: 'Nomor dada',
      lead: 'Memuat kode QR yang membuka hasil lomba Anda, nama cetak, kategori, ' +
            'dan jenis kelamin. Warna berbeda tiap kategori agar mudah dikenali marshall.',
      hero: IMG + 'bib-10k.webp',
      heroAlt: 'Desain nomor dada 10K HIPMI RUN Karanganyar.',
      gallery: [
        { src: IMG + 'bib-10k.webp', title: 'Kategori 10K', note: 'Pita nomor hijau, logo Bank Jateng di sisi kiri' },
        { src: IMG + 'bib-5k.webp',  title: 'Kategori 5K',  note: 'Pita nomor putih, logo Bank Jateng di sisi kiri' }
      ],
      specs: [
        { k: 'Kode QR',    v: 'Scan for results, membuka halaman hasil' },
        { k: 'Nama cetak', v: 'Nama panggilan pilihan Anda' },
        { k: 'Penanda',    v: 'Kategori, jenis kelamin, dan warna BIB' },
        { k: 'Timing chip',v: 'RFID menempel di balik nomor dada' },
        { k: 'Sponsor',    v: 'Deretan logo pendukung di bagian bawah' }
      ],
      cta: { label: 'Cek nomor dada saya', href: 'hasil.html' }
    },

    racepack: {
      name: 'Race pack',
      lead: 'Diambil saat Race Pack Collection di Gedung Wanita Karanganyar, ' +
            'dengan menunjukkan e-Pass dan KTP asli sesuai NIK pendaftaran.',
      hero: IMG + 'race-flatlay.webp',
      heroAlt: 'Jersey, nomor dada, dan medali HIPMI RUN Karanganyar.',
      gallery: [
        { src: IMG + 'race-flatlay.webp', title: 'Isi race pack', note: 'Jersey, nomor dada, dan medali' }
      ],
      specs: [
        { k: 'Nomor dada',  v: 'Dicetak nama panggilan, dengan peniti' },
        { k: 'Timing chip', v: 'RFID sekali pakai, menempel di nomor dada' },
        { k: 'Jersey',      v: 'Sesuai ukuran yang dipilih saat mendaftar' },
        { k: 'Goodie bag',  v: 'Berisi produk sponsor dan kupon refreshment' },
        { k: 'Pengambilan', v: 'Jumat 11 dan Sabtu 12 Desember 2026' }
      ],
      cta: { label: 'Cek status race pack', href: 'hasil.html' }
    }
  };

  /* ---- aturan penomoran dada ------------------------------------------ */
  /* Nomor kehormatan hidup di blok 1 sampai 99, di luar seluruh rentang
     kompetitif, supaya nomor undangan tidak pernah bertabrakan dengan nomor
     peserta yang diundi sistem. */
  /* Kuota satu kolam untuk kedua kategori: tidak ada batas per jarak,
     siapa cepat dia dapat. Nomor dada ikut satu deret, kategorinya ditandai
     lencana 5KM atau 10KM pada desain BIB, bukan oleh rentang nomornya. */
  const QUOTA = { total: 3000, taken: 1313, bibRange: '0100 - 3099' };

  const BIB_RULES = {
    honour: { from: 1, to: 99, label: 'Nomor kehormatan' },   // peserta mulai 0100
    competitive: [
      { id: 'peserta', label: 'Undian peserta, kedua kategori', from: 100, to: 3099 }
    ]
  };

  const EXCEPTION_TYPES = [
    { id: 'undangan-vip', label: 'Undangan kehormatan', competitive: false,
      note: 'Pejabat daerah, tamu protokoler, dan undangan seremonial.' },
    { id: 'sponsor', label: 'Sponsor utama', competitive: false,
      note: 'Perwakilan sponsor yang berlari sebagai tamu.' },
    { id: 'atlet-elit', label: 'Atlet elit undangan', competitive: true,
      note: 'Pelari undangan panitia yang tetap diperhitungkan untuk podium.' },
    { id: 'legacy', label: 'Nomor legacy', competitive: true,
      note: 'Nomor yang dipertahankan untuk finisher edisi sebelumnya.' }
  ];

  /* Contoh yang sudah terbit sebelum antarmuka ini dibuka. */
  const SEED_EXCEPTIONS = [
    {
      bib: '01', name: 'Sugeng Raharjo', title: 'Ketua Umum BPC HIPMI Karanganyar',
      category: '5k', type: 'undangan-vip', competitive: false,
      reason: 'Pelepas balon start dan flag-off bersama.',
      approvedBy: 'Panitia Inti', issuedAt: '2026-09-02T10:20:00+07:00', status: 'aktif'
    },
    {
      bib: '17', name: 'Retno Palupi', title: 'Direktur Utama Bank Jateng Cabang Karanganyar',
      category: '5k', type: 'sponsor', competitive: false,
      reason: 'Sponsor utama kategori 5K, nomor sesuai tanggal perjanjian.',
      approvedBy: 'Divisi Kemitraan', issuedAt: '2026-09-11T14:05:00+07:00', status: 'aktif'
    }
  ];

  /* ---- sponsor -------------------------------------------------------- */
  const SPONSORS = {
    main: {
      name: 'Bank Jateng', tier: 'Sponsor Utama',
      amount: 200000000, share: 0.6,
      logo: 'assets/img/sponsor/bank-jateng.svg',
      logoReverse: 'assets/img/sponsor/bank-jateng-white.svg',
      site: 'https://www.bankjateng.co.id',
      video: {
        id: 'KSKR3-uJdb0',
        title: 'Bima Mobile Terbaru Semua Bisa!',
        channel: 'Bank Jateng',
        poster: 'assets/img/sponsor/bima-mobile.webp',
        url: 'https://www.youtube.com/watch?v=KSKR3-uJdb0'
      }
    }
  };

  /* ---- helpers -------------------------------------------------------- */
  const rupiah = n => 'Rp ' + n.toLocaleString('id-ID');
  const catById = id => CATEGORIES.find(c => c.id === id);
  const secToClock = s => {
    const m = Math.floor(s / 60), sec = s % 60;
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  };
  /* Foto dokumentasi lomba. Sebelum hari lomba, seluruh peserta memakai
     kumpulan foto yang sama; setelah OCR aktif, seed diganti nama berkas asli. */
  const RACE_SHOTS = ['race-finish', 'race-back', 'race-celebrate', 'race-sunset',
                      'race-medal-a', 'race-medal-b', 'race-flatlay'];
  const photoUrl = (seed) => {
    let h = 0;
    for (let i = 0; i < String(seed).length; i++) h = (h * 31 + String(seed).charCodeAt(i)) >>> 0;
    return 'assets/img/v2/' + RACE_SHOTS[h % RACE_SHOTS.length] + '.webp';
  };

  return { EVENT, CATEGORIES, PRIZES, RESULTS, SPLITS, RUNNERS, CHECKPOINTS, ELEVATION, AGENDA,
           QUOTA, BIB_RULES, EXCEPTION_TYPES, SEED_EXCEPTIONS, PRODUCTS,
           SPONSORS,
           rupiah, catById, secToClock, photoUrl };
})();
