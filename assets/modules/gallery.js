// assets/modules/gallery.js
// Shared masonry gallery + preview strip + lightbox.
// Used by ireh.html and aireh.html.

export function ensureGalleryStyles() {
  if (document.getElementById('gallery-shared-styles')) return;
  const style = document.createElement('style');
  style.id = 'gallery-shared-styles';
  style.textContent = `
    .masonry { column-count:2; column-gap:0.75rem; }
    @media (min-width:640px) { .masonry { column-count:3; } }
    @media (min-width:1024px) { .masonry { column-count:4; } }
    @media (min-width:1440px) { .masonry { column-count:5; } }
    .masonry-item { break-inside:avoid; margin-bottom:0.75rem; border-radius:12px; overflow:hidden; background:rgba(255,255,255,0.03); cursor:pointer; transition:transform 0.25s, box-shadow 0.25s; position:relative; }
    .masonry-item:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.4); }
    .masonry-item img { display:block; width:100%; height:auto; background:#111; transition:opacity 0.3s; }
    .masonry-item.loading img { opacity:0; }
    .masonry-item.loaded img { opacity:1; }
    .masonry-item.error { display:none; }
    .ai-badge { position:absolute; top:6px; left:6px; background:rgba(0,0,0,0.7); color:#dfc278; font-size:0.6rem; font-weight:700; padding:2px 8px; border-radius:50px; letter-spacing:0.05em; border:1px solid rgba(200,160,60,0.4); z-index:2; }
    .preview-tile { flex:0 0 140px; height:180px; border-radius:12px; overflow:hidden; background:#111; }
    .preview-tile img { width:100%; height:100%; object-fit:cover; }
  `;
  document.head.appendChild(style);
}

export function renderGallery(containerEl, urls, options = {}) {
  if (!containerEl) return;
  if (!urls || urls.length === 0) { containerEl.innerHTML = ''; return; }
  containerEl.classList.add('masonry');
  containerEl.innerHTML = urls.map((url, i) => `
    <div class="masonry-item loading" data-i="${i}">
      ${options.showAIBadge ? '<span class="ai-badge">AI</span>' : ''}
      <img src="${url}" loading="lazy" onerror="this.parentElement.classList.add('error')" alt="">
    </div>
  `).join('');

  containerEl.querySelectorAll('.masonry-item.loading img').forEach(img => {
    if (img.complete) {
      img.parentElement.classList.remove('loading');
      img.parentElement.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.parentElement.classList.remove('loading');
        img.parentElement.classList.add('loaded');
      }, { once: true });
      img.addEventListener('error', () => {
        img.parentElement.classList.add('error');
      }, { once: true });
    }
  });
}

export function renderGalleryPreview(containerEl, urls, maxCount = 8) {
  if (!containerEl) return;
  const preview = (urls || []).slice(0, maxCount);
  if (preview.length === 0) { containerEl.innerHTML = ''; return; }
  containerEl.innerHTML = preview.map(url => `
    <div class="preview-tile">
      <img src="${url}" loading="lazy" onerror="this.style.opacity=0.3" alt="">
    </div>
  `).join('');
}

export function initLightbox(urls, options = {}) {
  const lb = document.getElementById('lightbox');
  if (!lb) return null;
  const lbImg = document.getElementById('lightboxImg');
  const lbCounter = document.getElementById('lightboxCounter');
  let index = -1;
  const onOpen = options.onOpen;

  function open(i) {
    index = i;
    lbImg.src = urls[i];
    lbCounter.textContent = `${i + 1} / ${urls.length}`;
    lb.classList.add('open');
    if (typeof onOpen === 'function') {
      try { onOpen(i, urls[i]); } catch (e) { console.warn('[gallery] onOpen error:', e); }
    }
  }
  function close() {
    lb.classList.remove('open');
    lbImg.src = '';
    index = -1;
  }
  function nav(delta) {
    if (index < 0) return;
    index = (index + delta + urls.length) % urls.length;
    lbImg.src = urls[index];
    lbCounter.textContent = `${index + 1} / ${urls.length}`;
    if (typeof onOpen === 'function') {
      try { onOpen(index, urls[index]); } catch (e) {}
    }
  }

  document.getElementById('lightboxClose')?.addEventListener('click', close);
  document.getElementById('lightboxPrev')?.addEventListener('click', (e) => { e.stopPropagation(); nav(-1); });
  document.getElementById('lightboxNext')?.addEventListener('click', (e) => { e.stopPropagation(); nav(1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  let touchX = 0;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) nav(dx < 0 ? 1 : -1);
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') nav(-1);
    if (e.key === 'ArrowRight') nav(1);
  });

  return { open, close, nav };
}
