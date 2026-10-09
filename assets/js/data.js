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
      id: '5k', code: '5K', name: '5K Race', distance: 5.0,
      age: 'Semua umur', cot: '1 jam 15 menit',
      priceEarly: 175000, priceNormal: 200000,
      taken: 629,
      blurb: 'Loop pendek berjalur sama, dilombakan penuh dengan timing mat RFID dan podium sendiri.'
    }
  ];

  /* ---- hadiah podium : total Rp 75.000.000 ---------------------------- */
  const PRIZES = [
    { cat: '10K Challenge', top: true, rows: [11000000, 7000000, 4500000] },
    { cat: '5K Race', rows: [7000000, 5000000, 3000000] }
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
      bib: '0523', name: 'Bayu Anggoro', category: '5k', categoryName: '5K Race',
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
  /* Rute resmi, diturunkan dari peta Google My Maps panitia
     (HIPMI RUN KRA VOL#1). Jalur SVG adalah jejak sebenarnya, bukan skema.
     Jarak berlabel memakai penanda KM panitia sebagai acuan; panjang jejak
     terukur sedikit lebih besar karena garis peta mengikuti sumbu jalan.
     Ketinggian diambil dari SRTM 30 m, bukan karangan. */
  const ROUTE_VIEWBOX = '0 0 900 754';
  const ROUTES = {
    '10k': {
      nominalKm: 10, measuredKm: 10.388, gainM: 63, minM: 130, maxM: 173, marshals: 43,
      path: 'M389.9 577.3 L392.1 577.8 L395.1 578.9 L397.1 579.6 L400.9 580.9 L410.2 584 L413.6 585.1 L420.4 587.3 L426.2 589.4 L428.7 590.3 L436.5 592.9 L441.2 594.4 L448.2 597 L456.2 600.1 L457.9 600.6 L469.1 604.2 L473.7 605.7 L475.8 606.5 L479.9 607.9 L483.6 609.1 L489.7 610.6 L497.4 613.7 L503.6 615.8 L510.3 618.1 L512.1 618.8 L516.3 620.1 L518.6 621 L519.9 621.4 L524.5 623.1 L526.5 623.8 L528.9 624.6 L536.6 627.3 L540.4 628.6 L547.8 631.3 L555.3 633.9 L561.4 636 L568.3 637.8 L573.7 639.7 L584.5 644.1 L603.3 651.9 L608 653.8 L618.5 658.4 L630.4 663.2 L642.4 668.7 L648.1 671.2 L649.2 671.8 L651 672.5 L658.2 675.6 L664.1 678.3 L676.5 683.3 L686.6 688.3 L691.1 690.3 L694 691.5 L702.9 695.4 L704.3 696 L709.9 698.6 L713.3 699.3 L722.6 697.4 L726.7 695.9 L730 695.1 L731.3 694.8 L737.7 694.1 L750.7 695 L757.8 695.6 L767.7 696.4 L771.6 696.7 L782.1 698 L791.7 698.4 L803.2 699.1 L807.6 699.5 L820.3 700.7 L823.3 701 L830.3 701.8 L835.3 702.9 L841.1 704.2 L845.8 705.6 L847.7 706.2 L854 708.3 L853.8 706.9 L853.5 704.8 L853.2 702.3 L852.6 698.3 L851.8 692.7 L850.4 683.4 L849.5 679.6 L848.3 674.6 L846.5 668.4 L846.1 666.3 L844.6 655.3 L843.8 649 L842.4 641.6 L839.8 628.2 L838 618 L837.7 616.4 L836.8 610.3 L835.6 603.2 L834.6 598.2 L833.6 592 L832.4 585.1 L830.8 576.8 L830 572.9 L829.1 566.8 L828 561.1 L827 555.4 L825.7 547.9 L823.9 538.4 L823.6 536.2 L822.8 530.7 L821.4 520.6 L820.7 515.5 L820.5 514.1 L820.5 511.6 L819.3 510.9 L818.1 509.8 L816.6 510.8 L815.2 510.1 L814.8 508.8 L813.7 507.3 L812.7 506.6 L811 506 L808.2 505.5 L804.6 505.1 L801.1 504.7 L793.5 504.6 L788.9 504.5 L783.3 504.4 L778.2 504 L773.6 503.3 L772.2 502.8 L768.7 501 L766.8 498.8 L764.8 494.9 L763.8 493.1 L761.7 488.4 L760.7 486.1 L759.5 483.5 L758.3 481.2 L756.7 478.3 L753.7 472.1 L752.3 469.2 L750.2 465.7 L748.6 463 L746.9 460.6 L745 458.3 L743.5 456.8 L737.5 452.1 L733.7 449.8 L728.7 446.7 L724 443.5 L722.1 442.5 L719.8 441.1 L718.4 440.3 L713.9 437.4 L711.5 435.7 L710.3 434.8 L702.5 429.4 L698 426.4 L696.3 425.3 L687.8 419.6 L681.6 415.6 L676.3 412.1 L658.2 400.1 L647.8 392.9 L638.7 386.6 L631.9 382.3 L622.8 376.3 L616.7 372.6 L613.8 370.8 L611.9 369.7 L607.8 367.3 L602.3 363.5 L596 359.2 L589.3 354.9 L588 354 L583.9 351.3 L581.2 349.5 L577 346.8 L575.3 345.7 L569.6 341.8 L567.1 339.8 L566 339.2 L561.6 336.1 L557.7 333.5 L552.8 330.4 L547.2 326.8 L544 324.6 L540.9 322.6 L539.3 321.5 L535.1 318.8 L533.4 317.5 L531.7 316.4 L529.1 314.7 L523.9 311.6 L521.5 310 L516.4 306.7 L510.9 303 L506.9 300.1 L503.6 298.1 L499.8 295.2 L496.9 293.4 L478.8 281.3 L473.8 278 L467.6 273.9 L460.2 269.1 L454.5 265.3 L445.1 259.1 L438.4 255.2 L434.9 252.6 L428.1 247.8 L423.2 244.4 L421.8 243.5 L414.9 238.9 L409.7 235.4 L404.9 232 L400.9 229.3 L396.6 226.7 L392.3 224 L391.1 223.1 L385.7 219.2 L379.6 214.7 L374.9 211.5 L371.7 209.4 L369.9 208.3 L365.5 205.3 L363.1 203.8 L358.5 200.8 L350.1 195.2 L343.1 190.6 L335.2 185.3 L328.5 180.5 L322.9 176.8 L316.2 172.2 L311.5 169.4 L301.6 162.8 L291.7 156.1 L275.7 145.4 L269 141 L264.8 138 L260.9 135.2 L255.5 131.9 L246.7 126.2 L244 124.4 L240.9 122.6 L236.1 119.2 L228.9 114.5 L224.9 111.8 L223.7 111 L209.1 101.2 L203.5 97 L198.3 93.9 L196.7 92.9 L194.2 91.3 L186.8 85.6 L175.2 77.9 L168.8 73.8 L154 65.1 L142.9 58.9 L140.4 57.4 L135.5 55.2 L134 54.5 L125.7 52.7 L116.3 50.5 L109.8 48.3 L103.2 46 L102.2 47.9 L98 57.1 L97 60.2 L94.6 66.9 L93.5 70.7 L91.7 75.5 L89.9 79 L86.1 85.4 L81.4 92.7 L71.9 108.7 L69.1 115.2 L67.6 120.8 L65.4 129.4 L64.5 132.8 L61.3 146 L60.9 147.6 L60.4 150.1 L60.3 152.2 L63.2 161.3 L64.4 161.8 L67.1 162.9 L69.9 163.8 L84 167.8 L88 169.2 L95 172.7 L96.5 173.7 L97.6 174.6 L99.6 176.8 L102.5 181.4 L105.2 187.1 L106.9 190.4 L107.5 191.5 L108.3 192.6 L108.8 194.9 L108.7 197.6 L108.4 199.8 L107.3 203.7 L106.9 205.1 L106.5 208 L105.7 212.4 L103.7 220.8 L102.3 226.4 L101.5 230 L100.9 232.1 L100.5 233.6 L97 245.4 L93.2 262.8 L91.4 270 L89.1 279.8 L88 283.7 L87.4 285.9 L84.8 297.9 L82.3 309.9 L80.1 318.5 L77.1 333.2 L74.1 344.7 L71.2 356.2 L66.1 378.4 L65.5 381.1 L65 383.8 L60.5 402.3 L57.6 416.2 L56 422.1 L51.8 439.9 L51.2 442.2 L50.1 446.7 L46.4 462.2 L46 463.9 L47.4 468.3 L48.4 471 L49.2 472.6 L49.9 473.9 L53.8 474.8 L61.7 476.6 L68.9 478.7 L76.4 480.5 L79.6 482.5 L81.3 482.8 L87.6 484.8 L91.2 486.1 L97.6 488.2 L105 490 L109.7 491.4 L113.5 492.3 L115.2 492.7 L121.6 494.3 L124.7 495.2 L132.1 497.1 L142.6 499.7 L147 500.9 L155.2 503.1 L161.1 504.6 L166.9 506.3 L168.7 506.8 L177.2 508.9 L185.3 511 L187.1 511.5 L209 517.3 L212 518.2 L218.9 520.2 L227.4 523 L240.8 527.7 L247.9 530 L255.4 532.4 L266.8 536.3 L273.4 538.7 L275.3 539.3 L277.3 539.8 L279.6 540.6 L281.5 541.4 L295.8 545.5 L312.3 551 L320.2 553.6 L328.1 556.2 L336 558.8 L343.6 561.3 L349.3 563.2 L360.1 566.6 L372.2 571.1 L364.6 598.3 L374 571.8 L379.2 573.3 L385 575.4 L389.9 577.2 Z',
      checkpoints: [
        { km: '0.0', name: "Start Arch", type: 'start', icon: 'ph-flag-banner', xy: [364.6, 598.3], note: "Flag-off 05:45 WIB, timing mat start" },
        { km: '3.7', name: "Water Station 1", type: 'water', icon: 'ph-drop', xy: [710.3, 434.8], note: "Air mineral dan isotonik, timing mat split" },
        { km: '7.7', name: "Water Station 2", type: 'water', icon: 'ph-drop', xy: [101.8, 232.4], note: "Air mineral, sponge basah, pos medis" },
        { km: '10.0', name: "Finish Arch", type: 'finish', icon: 'ph-trophy', xy: [364.6, 598.3], note: "Timing mat finis, medal zone, refreshment" }
      ],
      kmMarkers: [{ km: 1, x: 570.6, y: 638.8 }, { km: 2, x: 806.7, y: 699.8 }, { km: 3, x: 820.6, y: 519.1 }, { km: 4, x: 644.8, y: 394.4 }, { km: 5, x: 459.5, y: 270.6 }, { km: 6, x: 261, y: 136.3 }, { km: 7, x: 74.6, y: 107.1 }, { km: 8, x: 84.8, y: 305 }, { km: 9, x: 111.4, y: 490.7 }],
      elevation: [
        { km: 0, m: 151 }, { km: 0.17, m: 151 }, { km: 0.34, m: 157 }, { km: 0.51, m: 155 }, { km: 0.68, m: 157 }, { km: 0.85, m: 161 },
        { km: 1.02, m: 162 }, { km: 1.19, m: 165 }, { km: 1.36, m: 168 }, { km: 1.53, m: 166 }, { km: 1.7, m: 169 }, { km: 1.86, m: 171 },
        { km: 2.03, m: 171 }, { km: 2.2, m: 173 }, { km: 2.37, m: 170 }, { km: 2.54, m: 168 }, { km: 2.71, m: 164 }, { km: 2.88, m: 161 },
        { km: 3.05, m: 162 }, { km: 3.22, m: 156 }, { km: 3.39, m: 157 }, { km: 3.56, m: 157 }, { km: 3.73, m: 153 }, { km: 3.9, m: 155 },
        { km: 4.07, m: 148 }, { km: 4.24, m: 147 }, { km: 4.41, m: 145 }, { km: 4.58, m: 147 }, { km: 4.75, m: 146 }, { km: 4.92, m: 143 },
        { km: 5.08, m: 139 }, { km: 5.25, m: 139 }, { km: 5.42, m: 137 }, { km: 5.59, m: 134 }, { km: 5.76, m: 133 }, { km: 5.93, m: 130 },
        { km: 6.1, m: 134 }, { km: 6.27, m: 133 }, { km: 6.44, m: 131 }, { km: 6.61, m: 132 }, { km: 6.78, m: 131 }, { km: 6.95, m: 134 },
        { km: 7.12, m: 133 }, { km: 7.29, m: 134 }, { km: 7.46, m: 134 }, { km: 7.63, m: 132 }, { km: 7.8, m: 132 }, { km: 7.97, m: 134 },
        { km: 8.14, m: 137 }, { km: 8.3, m: 135 }, { km: 8.48, m: 139 }, { km: 8.64, m: 138 }, { km: 8.81, m: 140 }, { km: 8.98, m: 141 },
        { km: 9.15, m: 143 }, { km: 9.32, m: 143 }, { km: 9.49, m: 145 }, { km: 9.66, m: 148 }, { km: 9.83, m: 150 }, { km: 10, m: 151 }
      ]
    },
    '5k': {
      nominalKm: 5, measuredKm: 5.454, gainM: 56, minM: 143, maxM: 169, marshals: 45,
      path: 'M389.9 577.2 L392.1 577.8 L395.1 578.9 L397.1 579.6 L400.9 580.9 L410.2 584 L413.6 585.1 L420.4 587.3 L426.2 589.4 L428.7 590.3 L436.5 592.9 L441.2 594.4 L448.2 597 L456.2 600.1 L457.9 600.6 L469.1 604.2 L473.7 605.7 L475.8 606.5 L479.9 607.9 L483.6 609.1 L489.7 610.6 L497.4 613.7 L503.6 615.8 L510.3 618.1 L512.1 618.8 L516.3 620.1 L518.6 621 L524.5 623.1 L526.5 623.8 L528.9 624.6 L536.6 627.3 L540.4 628.6 L547.8 631.3 L555.3 633.9 L561.4 636 L568.3 637.8 L571.6 638.9 L573.7 639.7 L578.7 641.7 L584.5 644.1 L603.3 651.9 L608 653.8 L618.5 658.4 L630.4 663.2 L642.4 668.7 L648.1 671.2 L649.2 671.8 L651 672.5 L658.2 675.6 L664.1 678.3 L676.5 683.3 L686.6 688.3 L691.1 690.3 L694 691.5 L704.3 696 L709.9 698.6 L713.3 699.3 L722.6 697.4 L726.7 695.9 L730 695.1 L731.3 694.8 L734.8 694.4 L737.7 694.1 L744.5 671.9 L745.5 669 L748 660.5 L751 650.3 L753.5 643.2 L754.7 638.5 L757.8 627.7 L760.8 617.9 L763.1 610.6 L763.8 607.7 L766.8 597.7 L768.8 591.8 L770 588.1 L768.4 587.6 L754 582.8 L738.4 578.2 L733.9 577 L729.5 575.9 L720.3 572.9 L707.4 569.3 L698.9 567.1 L696.3 566.3 L694.1 565.7 L689.9 564.5 L681.8 562.1 L676.5 559.8 L673.1 563.7 L671.5 565.5 L670.6 566.2 L669.2 565.9 L667.7 565 L666.6 564.4 L654.4 557.8 L641.2 550.6 L630.7 544.2 L614.7 535.5 L613.3 534.7 L610.7 532.9 L609.4 532.1 L604.2 529.2 L600.8 527.7 L592.8 522.9 L589.6 521.3 L587.5 520.1 L586.2 519.4 L583.9 517.9 L581.1 516.1 L578.3 514 L576.6 512.5 L576 511 L576.3 509.6 L577.3 506.5 L578.5 504.1 L580.2 500.5 L583 494.9 L584.4 492.3 L587.4 486.3 L590 481 L590.7 479.5 L592.2 476.9 L594.1 473.6 L598 465.7 L599.1 463.8 L601 460.4 L595.3 456.8 L592.5 454.9 L591 453.7 L588.8 452.3 L584.9 449.3 L581.2 446.9 L576.7 444.1 L573.5 442 L572.4 441.3 L568.4 438.5 L565.9 436.8 L562.1 434.3 L557 430.9 L552.2 427.6 L548.7 425.4 L545.6 423.3 L542.4 421.1 L539.6 419 L537.4 417.8 L531.7 414 L528.5 411.9 L523.5 408.6 L519.7 406 L515.6 403.1 L511.4 400.4 L510.4 399.6 L503.9 395.4 L498.9 392.2 L494.8 389.4 L493.4 388.4 L485.6 383 L478.1 377.9 L472.7 374.4 L468.7 371.6 L459.1 364.6 L452.1 375.7 L448.4 381.6 L446.4 384.8 L442.9 390.2 L441.2 392.8 L436.9 390.5 L428.8 386.9 L415.7 380.5 L411.6 378.3 L409.4 381.4 L404.6 388.1 L403.3 390.1 L398.9 395.9 L397.1 398.1 L396.3 399 L398.8 401.4 L399.4 402.6 L395.6 408.3 L395 409.3 L394.2 411 L393.2 413.5 L392.4 415.4 L391.1 420.4 L390.2 426.2 L389 432.8 L388 437.9 L386.1 447.3 L384.3 455.9 L382.6 466.1 L381.6 470.3 L379.2 483.5 L378.7 487.5 L378.3 490.5 L377.6 495.5 L376.5 504.9 L376.1 508.1 L375 515.9 L373.7 526.1 L367.3 544.6 L360.1 566.6 L361.4 567.1 L364.8 568.4 L372.2 571.1 L364.3 599.5 L374 571.8 L379.2 573.3 L385 575.4 L389.9 577.2 Z',
      checkpoints: [
        { km: '0.0', name: "Start Arch", type: 'start', icon: 'ph-flag-banner', xy: [364.3, 599.5], note: "Flag-off 06:10 WIB, timing mat start" },
        { km: '2.7', name: "Water Station 5K", type: 'water', icon: 'ph-drop', xy: [666.1, 565.3], note: "Air mineral dan isotonik, timing mat split" },
        { km: '5.0', name: "Finish Arch", type: 'finish', icon: 'ph-trophy', xy: [364.3, 599.5], note: "Timing mat finis, medal zone, refreshment" }
      ],
      kmMarkers: [{ km: 1, x: 571.1, y: 638.3 }, { km: 2, x: 752.8, y: 642.5 }, { km: 3, x: 605.7, y: 531.6 }, { km: 4, x: 477.8, y: 379.1 }],
      elevation: [
        { km: 0, m: 151 }, { km: 0.08, m: 150 }, { km: 0.17, m: 151 }, { km: 0.25, m: 153 }, { km: 0.34, m: 156 }, { km: 0.42, m: 154 },
        { km: 0.51, m: 155 }, { km: 0.59, m: 157 }, { km: 0.68, m: 158 }, { km: 0.76, m: 158 }, { km: 0.85, m: 161 }, { km: 0.93, m: 161 },
        { km: 1.02, m: 164 }, { km: 1.1, m: 163 }, { km: 1.19, m: 165 }, { km: 1.27, m: 167 }, { km: 1.36, m: 168 }, { km: 1.44, m: 165 },
        { km: 1.53, m: 169 }, { km: 1.61, m: 167 }, { km: 1.7, m: 164 }, { km: 1.78, m: 165 }, { km: 1.86, m: 166 }, { km: 1.95, m: 164 },
        { km: 2.03, m: 164 }, { km: 2.12, m: 163 }, { km: 2.2, m: 163 }, { km: 2.29, m: 159 }, { km: 2.37, m: 156 }, { km: 2.46, m: 157 },
        { km: 2.54, m: 155 }, { km: 2.63, m: 155 }, { km: 2.71, m: 150 }, { km: 2.8, m: 154 }, { km: 2.88, m: 151 }, { km: 2.97, m: 155 },
        { km: 3.05, m: 150 }, { km: 3.14, m: 152 }, { km: 3.22, m: 152 }, { km: 3.3, m: 149 }, { km: 3.39, m: 147 }, { km: 3.47, m: 148 },
        { km: 3.56, m: 148 }, { km: 3.64, m: 148 }, { km: 3.73, m: 149 }, { km: 3.81, m: 146 }, { km: 3.9, m: 147 }, { km: 3.98, m: 143 },
        { km: 4.07, m: 146 }, { km: 4.15, m: 148 }, { km: 4.24, m: 150 }, { km: 4.32, m: 149 }, { km: 4.41, m: 148 }, { km: 4.49, m: 149 },
        { km: 4.58, m: 145 }, { km: 4.66, m: 147 }, { km: 4.75, m: 148 }, { km: 4.83, m: 150 }, { km: 4.92, m: 149 }, { km: 5, m: 151 }
      ]
    }
  };

  const AGENDA = [
    { date: 'Jumat, 11 Des', time: '10:00 - 20:00', title: 'Race Pack Collection hari pertama',
      body: 'Gedung Wanita Karanganyar. Tunjukkan e-Pass dan KTP asli sesuai NIK pendaftaran.' },
    { date: 'Sabtu, 12 Des', time: '09:00 - 18:00', title: 'Race Pack Collection hari kedua',
      body: 'Hari terakhir pengambilan. Perwakilan wajib membawa surat kuasa bermaterai.' },
    { date: 'Sabtu, 12 Des', time: '15:00 - 17:00', title: 'Technical meeting dan briefing wasit',
      body: 'Penjelasan COT, aturan diskualifikasi, dan prosedur pos medis kedua kategori.' },
    { date: 'Minggu, 13 Des', time: '04:30', title: 'Area start dibuka', body: 'Penitipan barang, pemanasan bersama, dan pengecekan chip RFID di gate.' },
    { date: 'Minggu, 13 Des', time: '05:45', title: 'Flag-off 10K Challenge', body: 'Wave A dilepas dari Alun-alun Karanganyar.', now: true },
    { date: 'Minggu, 13 Des', time: '06:10', title: 'Flag-off 5K Race', body: 'Wave B dilepas 25 menit setelah 10K, waktu dihitung sejak gun time wave.' },
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
        { src: IMG + 'jersey-front.webp',  title: 'Tampak depan',  note: 'Logo HIPMI RUN bersulam di tengah dada' },
        { src: IMG + 'jersey-back.webp',   title: 'Tampak belakang', note: 'Aksara Jawa membentang di bawah kerah' },
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
      heroAlt: 'Medali finisher 10K HIPMI RUN Karanganyar.',
      gallery: [
        { src: IMG + 'medal-5k.webp',     title: 'Varian 5K',    note: 'Tali hijau tua bertuliskan HIPMI RUN' },
        { src: IMG + 'medal-10k.webp',    title: 'Varian 10K',   note: 'Tali hijau muda bertuliskan HIPMI RUN' },
        { src: IMG + 'medal-logo.webp',   title: 'Kepala medali', note: 'Peta Indonesia timbul pada bidang bundar' },
        { src: IMG + 'medal-jarak.webp',  title: 'Tulisan jarak', note: 'Alas bertuliskan 5K FINISHER atau 10K FINISHER, bertekstur peta topografi' },
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
      bib: '17', name: 'Retno Palupi', title: 'Pimpinan mitra sponsor',
      category: '5k', type: 'sponsor', competitive: false,
      reason: 'Mitra sponsor kategori 5K, nomor sesuai tanggal perjanjian.',
      approvedBy: 'Divisi Kemitraan', issuedAt: '2026-09-11T14:05:00+07:00', status: 'aktif'
    }
  ];

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

  return { EVENT, CATEGORIES, PRIZES, RESULTS, SPLITS, RUNNERS, ROUTES, ROUTE_VIEWBOX, AGENDA,
           QUOTA, BIB_RULES, EXCEPTION_TYPES, SEED_EXCEPTIONS, PRODUCTS,
           rupiah, catById, secToClock, photoUrl };
})();
