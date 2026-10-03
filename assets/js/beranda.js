/* ==========================================================================
   HIPMI RUN KARANGANYAR - beranda.js
   Membuka detail isi race pack: jersey, medali, dan race pack.
   ========================================================================== */
(function () {
  'use strict';

  const { $, $$, openModal } = window.HipmiUI;
  const P = window.HIPMI.PRODUCTS;

  const modal = $('#productModal');
  if (!modal || !P) return;

  let views = [];      // {src, title, note}
  let index = 0;

  function paintView(i) {
    index = Math.max(0, Math.min(views.length - 1, i));
    const v = views[index];
    if (!v) return;
    const hero = $('#pmHero');
    hero.src = v.src;
    hero.alt = v.alt || v.title || '';
    $('#pmCaption').innerHTML = v.title
      ? '<b>' + v.title + '</b>' + (v.note ? ' &middot; ' + v.note : '')
      : '';
    $$('#pmThumbs button').forEach((b, n) => b.setAttribute('aria-pressed', String(n === index)));
  }

  function open(key) {
    const p = P[key];
    if (!p) return;

    $('#pmName').textContent = p.name;
    $('#pmLead').textContent = p.lead;

    /* Tampilan utama menjadi sudut pandang pertama. Pada beberapa produk,
       gambar utama memang sama dengan sudut pandang pertama di galeri; kalau
       keduanya ditumpuk, thumbnail yang sama muncul dua kali. Dalam hal itu
       galeri dipakai apa adanya, hanya alt gambar utamanya yang diambil. */
    const galeri = p.gallery || [];
    views = (galeri.length && galeri[0].src === p.hero)
      ? [Object.assign({}, galeri[0], { alt: p.heroAlt })].concat(galeri.slice(1))
      : [{ src: p.hero, alt: p.heroAlt, title: '', note: '' }].concat(galeri);

    $('#pmThumbs').innerHTML = views.length > 1
      ? views.map((v, i) =>
          '<button type="button" data-view="' + i + '" aria-pressed="' + (i === 0) + '" ' +
          'aria-label="' + (v.title || 'Tampilan utama') + '">' +
          '<img src="' + v.src + '" alt="" loading="lazy"></button>').join('')
      : '';

    $('#pmSpecs').innerHTML = (p.specs || [])
      .map(s => '<dt>' + s.k + '</dt><dd>' + s.v + '</dd>').join('');

    const note = $('#pmNote');
    note.hidden = !p.note;
    if (p.note) $('#pmNoteText').textContent = p.note;

    const cta = $('#pmCta');
    cta.textContent = (p.cta && p.cta.label) || 'Daftar sekarang';
    cta.href = (p.cta && p.cta.href) || 'registrasi.html';

    paintView(0);
    openModal(modal);
  }

  /* ---- pemicu: klik, Enter, atau Spasi ---------------------------------- */
  $$('[data-product]').forEach(function (card) {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const label = (card.querySelector('h3') || {}).textContent || 'produk';
    card.setAttribute('aria-label', 'Lihat detail ' + label);

    card.addEventListener('click', () => open(card.dataset.product));
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card.dataset.product); }
    });
  });

  $('#pmThumbs').addEventListener('click', function (e) {
    const b = e.target.closest('[data-view]');
    if (b) paintView(Number(b.dataset.view));
  });

  document.addEventListener('keydown', function (e) {
    if (modal.hidden || views.length < 2) return;
    if (e.key === 'ArrowRight') paintView(index + 1);
    if (e.key === 'ArrowLeft') paintView(index - 1);
  });
})();
