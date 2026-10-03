/* ==========================================================================
   HIPMI RUN KARANGANYAR VOL. #1 - timing-api.js
   Penghubung situs publik ke server timing RFID (timing-server/).

   ALAMAT SERVER
   Kosong berarti alamat yang sama dengan situs: serve.mjs meneruskan
   /api/public/* ke server timing. Bila situs di-hosting terpisah (misalnya
   hosting statis), isi window.HIPMI_TIMING_URL sebelum berkas ini dimuat,
   contoh 'https://timing.hipmirun.id'. Untuk uji, ?api=http://ip:8787 di URL
   halaman menimpa keduanya.
   ========================================================================== */
window.HipmiTiming = (function () {
  'use strict';

  const q = new URLSearchParams(location.search).get('api');
  const BASE = String(q || window.HIPMI_TIMING_URL || '').replace(/\/+$/, '');

  /* Mengembalikan objek JSON, null bila server timing menjawab "tidak ada",
     atau melempar galat bila server timing tidak terjangkau. Hosting statis
     tanpa penerus menjawab 404 berupa HTML; itu dianggap tidak terjangkau. */
  /* Bila server timing tidak ada sama sekali, misalnya situs di-hosting statis,
     pemanggilan berkala akan mengetuk alamat yang sama berulang kali dan
     meninggalkan deretan 404 di konsol pengunjung. Setelah tiga kegagalan
     beruntun, permintaan dihentikan di sini; cukup satu pemanggilan berhasil
     untuk menyalakannya kembali. */
  const BATAS_GAGAL = 3;
  let gagalBeruntun = 0;

  async function get (path) {
    if (gagalBeruntun >= BATAS_GAGAL) throw new Error('Server timing tidak terjangkau');

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(BASE + '/api/public' + path, { signal: ctrl.signal, cache: 'no-store' });
      const json = (res.headers.get('content-type') || '').includes('json');
      if (!json) throw new Error('Server timing tidak terjangkau');
      if (res.status === 404) { gagalBeruntun = 0; return null; }
      if (!res.ok) throw new Error('Server timing menjawab ' + res.status);
      const data = await res.json();
      gagalBeruntun = 0;
      return data;
    } catch (e) {
      gagalBeruntun++;
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  /* Pemberitahuan "hasil berubah" dari server timing. */
  function subscribe (onChange) {
    if (!('EventSource' in window)) return () => {};
    if (gagalBeruntun >= BATAS_GAGAL) return () => {};
    const es = new EventSource(BASE + '/api/public/events');
    ['results-dirty', 'gun', 'reset'].forEach(ev => es.addEventListener(ev, onChange));
    return () => es.close();
  }

  const pad = n => String(n).padStart(2, '0');

  /* 1934000 -> "32:14", 3930000 -> "1:05:30"; format yang sama dengan data contoh */
  function dur (ms) {
    if (ms == null) return '-';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    return h ? h + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) : pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  const pace = sec => sec ? pad(Math.floor(sec / 60)) + ':' + pad(sec % 60) : '-';
  const clock = ms => {
    if (ms == null) return '-';
    const d = new Date(ms);
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  };

  return { base: BASE, get, subscribe, dur, pace, clock };
})();
