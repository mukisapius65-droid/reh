// assets/modules/video-upload.js
import { getCurrentUser, showToast } from '../utils.js';
import { generateVideoThumbnail } from './video-thumbnail.js';
// ─── Upload Modal HTML ──────────────────────────────
const modalHTML = `
<div id="video-upload-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9998; justify-content:center; align-items:center; backdrop-filter:blur(8px);">
  <div style="background:linear-gradient(145deg,#1a1a2e,#16213e); padding:2rem; border-radius:24px; max-width:480px; width:90%; border:1px solid rgba(200,160,60,0.3); box-shadow:0 8px 32px rgba(0,0,0,0.6);">
    <h3 style="color:#f5a623; font-family:'Playfair Display',serif; text-align:center; margin-bottom:1.5rem;">
      <i class="fa-solid fa-video"></i> Upload Video
    </h3>
    <div class="form-group">
      <label style="color:#c5bfb3; font-size:0.8rem; display:block; margin-bottom:0.3rem;">Title</label>
      <input type="text" id="videoUploadTitle" placeholder="Give your video a title" style="width:100%; padding:0.8rem; background:rgba(255,255,255,0.05); border:1px solid #555; border-radius:12px; color:white; outline:none;">
    </div>
    <div class="form-group">
      <label style="color:#c5bfb3; font-size:0.8rem; display:block; margin-bottom:0.3rem;">Video File (MP4 recommended)</label>
      <input type="file" id="videoUploadFile" accept="video/*" style="width:100%; color:white; padding:0.5rem 0;">
    </div>
    <div class="form-group">
      <label style="color:#c5bfb3; font-size:0.8rem; display:block; margin-bottom:0.3rem;">Thumbnail URL (optional)</label>
      <input type="url" id="videoUploadThumb" placeholder="https://... (or leave blank)" style="width:100%; padding:0.8rem; background:rgba(255,255,255,0.05); border:1px solid #555; border-radius:12px; color:white; outline:none;">
    </div>
    <div id="uploadProgress" style="display:none; margin:0.5rem 0; background:#333; border-radius:10px; height:6px; overflow:hidden;">
      <div id="progressBar" style="width:0%; height:100%; background:linear-gradient(90deg,#c9a84c,#f0e4c8); transition:width 0.3s;"></div>
    </div>
    <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center;">
      <button id="videoUploadSubmit" style="background:#f5a623; color:#000; border:none; padding:12px 30px; border-radius:30px; font-weight:bold; cursor:pointer; flex:1;">Post Video</button>
      <button id="videoUploadClose" style="background:transparent; color:#fff; border:1px solid #555; padding:12px 20px; border-radius:30px; cursor:pointer;">Cancel</button>
    </div>
  </div>
</div>`;

let uploadInProgress = false;

function closeUploadModal() {
  const modal = document.getElementById('video-upload-modal');
  if (modal) modal.style.display = 'none';
  document.getElementById('videoUploadTitle').value = '';
  document.getElementById('videoUploadFile').value = '';
  document.getElementById('videoUploadThumb').value = '';
  document.getElementById('uploadProgress').style.display = 'none';
  document.getElementById('progressBar').style.width = '0%';
  uploadInProgress = false;
}

export function initFullVideoUpload() {
  const submitBtn = document.getElementById('fvSubmit');
  if (!submitBtn) return;

  const CLOUDINARY_CLOUD = 'hqhzolpo';
  const CLOUDINARY_THUMB_PRESET = 'reh_full_video_thumbs';

  let uploading = false;

  function extractDurationFromBlobOrUrl(source) {
    return new Promise((resolve) => {
      const url = typeof source === 'string' ? source : URL.createObjectURL(source);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.crossOrigin = 'anonymous';
      video.src = url;
      const cleanup = () => { if (typeof source !== 'string') URL.revokeObjectURL(url); };
      const timeout = setTimeout(() => { cleanup(); resolve(0); }, 15000);
      video.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
        const d = Math.round(video.duration || 0);
        cleanup();
        resolve(d);
      });
      video.addEventListener('error', () => {
        clearTimeout(timeout);
        cleanup();
        resolve(0);
      });
    });
  }

  function uploadToCatbox(file) {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('fileToUpload', file);
      fd.append('reqtype', 'fileupload');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.onload = () => {
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && parsed.url) resolve(parsed.url);
          else reject(new Error(parsed.error || parsed.message || xhr.statusText));
        } catch (e) { reject(new Error(xhr.responseText || xhr.statusText)); }
      };
      xhr.onerror = () => reject(new Error('Network error — /api/upload unreachable'));
      xhr.send(fd);
    });
  }

  async function uploadThumbToCloudinary(blob) {
    const fd = new FormData();
    fd.append('file', blob, 'thumb.jpg');
    fd.append('upload_preset', CLOUDINARY_THUMB_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      { method: 'POST', body: fd }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error('Cloudinary thumb upload failed: ' + body);
    }
    const data = await res.json();
    if (!data.secure_url) throw new Error('No secure_url');
    return data.secure_url;
  }

  function setStatus(msg, kind) {
    const el = document.getElementById('fvStatus');
    if (!el) return;
    el.textContent = msg;
    el.style.color = kind === 'error' ? '#e74c3c' : kind === 'success' ? '#2ecc71' : '#c5bfb3';
  }

  function showPreview(thumbUrl, durationSec) {
    const wrap = document.getElementById('fvPreviewWrap');
    const img = document.getElementById('fvPreviewImg');
    const dur = document.getElementById('fvPreviewDuration');
    if (wrap && img) { img.src = thumbUrl; wrap.style.display = 'block'; }
    if (dur) {
      dur.textContent = durationSec
        ? `Duration: ${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`
        : 'Duration: unknown';
    }
  }

  // ── Preview when URL is pasted ──────────────────
  const urlInput = document.getElementById('fvVideoUrl');
  if (urlInput) {
    urlInput.addEventListener('blur', async () => {
      const url = urlInput.value.trim();
      if (!url || !url.startsWith('http')) return;
      setStatus('Analyzing URL…', 'info');
      const durationSec = await extractDurationFromBlobOrUrl(url);
      // For URL path, thumbnail is best-effort — may fail due to CORS on Catbox
      let thumbUrl = '';
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.preload = 'metadata';
        video.src = url;
        await new Promise((res, rej) => {
          video.addEventListener('loadedmetadata', res, { once: true });
          video.addEventListener('error', rej, { once: true });
          setTimeout(rej, 10000);
        });
        video.currentTime = Math.min(1, (video.duration || 2) * 0.1);
        await new Promise((res, rej) => {
          video.addEventListener('seeked', res, { once: true });
          setTimeout(rej, 5000);
        });
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85));
        if (blob) thumbUrl = await uploadThumbToCloudinary(blob);
      } catch (e) {
        console.warn('[fv] URL thumbnail failed:', e);
        setStatus('⚠ URL thumbnail failed (Catbox CORS). Publish will use placeholder.', 'error');
      }
      showPreview(thumbUrl || 'https://via.placeholder.com/640x360/080c24/c9a84c?text=No+Thumbnail', durationSec);
      window._fvPendingThumbUrl = thumbUrl;
      window._fvPendingDuration = durationSec;
      if (thumbUrl) setStatus('✓ Preview ready.', 'success');
    });
  }

  // ── Preview when file is picked (existing behavior) ──
  const fileInput = document.getElementById('fvVideoFile');
  if (fileInput) {
    fileInput.addEventListener('change', async function () {
      if (!this.files || !this.files[0]) return;
      const file = this.files[0];
      setStatus('Generating preview…', 'info');
      const durationSec = await extractDurationFromBlobOrUrl(file);
      let thumbUrl = '';
      try {
        const video = document.createElement('video');
        video.muted = true;
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        await new Promise((res, rej) => {
          video.addEventListener('loadedmetadata', res, { once: true });
          video.addEventListener('error', rej, { once: true });
          setTimeout(rej, 10000);
        });
        video.currentTime = Math.min(1, (video.duration || 2) * 0.1);
        await new Promise((res, rej) => {
          video.addEventListener('seeked', res, { once: true });
          setTimeout(rej, 5000);
        });
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85));
        if (blob) thumbUrl = await uploadThumbToCloudinary(blob);
      } catch (e) {
        console.warn('[fv] file thumbnail failed:', e);
      }
      showPreview(thumbUrl || 'https://via.placeholder.com/640x360/080c24/c9a84c?text=No+Thumbnail', durationSec);
      window._fvPendingThumbUrl = thumbUrl;
      window._fvPendingDuration = durationSec;
    });
  }

  // ── Submit ────────────────────────────────────────
  submitBtn.addEventListener('click', async function () {
    if (uploading) return;
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!user || !user.email) { setStatus('Please log in.', 'error'); return; }

    const title = (document.getElementById('fvTitle') || {}).value?.trim() || '';
    const description = (document.getElementById('fvDescription') || {}).value?.trim() || '';
    const category = (document.getElementById('fvCategory') || {}).value || 'events';
    const pastedUrl = (document.getElementById('fvVideoUrl') || {}).value?.trim() || '';
    const fileEl = document.getElementById('fvVideoFile');
    const file = fileEl && fileEl.files && fileEl.files[0];

    if (!title) { setStatus('Title is required.', 'error'); return; }
    if (!pastedUrl && !file) { setStatus('Provide a Catbox URL or pick a file.', 'error'); return; }

    uploading = true;
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;

    try {
      let videoUrl = pastedUrl;

      if (!videoUrl && file) {
        if (file.size > 4.4 * 1024 * 1024) {
          setStatus('File too large for proxy. Paste a Catbox URL instead.', 'error');
          return;
        }
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading…';
        videoUrl = await uploadToCatbox(file);
      }

      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing…';

      await window.addDoc(window.collection(window.db, 'full_videos'), {
        title,
        description,
        category,
        videoUrl,
        thumbnail: window._fvPendingThumbUrl || '',
        duration: window._fvPendingDuration || 0,
        views: 0,
        likes: 0,
        author: 'Reh',
        uploadedBy: user.email,
        createdAt: window.serverTimestamp ? window.serverTimestamp() : new Date(),
        status: 'published',
      });

      setStatus('✓ Published.', 'success');
      if (window.showToast) window.showToast('Video published.');

      // Reset form
      if (document.getElementById('fvTitle')) document.getElementById('fvTitle').value = '';
      if (document.getElementById('fvDescription')) document.getElementById('fvDescription').value = '';
      if (document.getElementById('fvVideoUrl')) document.getElementById('fvVideoUrl').value = '';
      if (fileEl) fileEl.value = '';
      const wrap = document.getElementById('fvPreviewWrap');
      if (wrap) wrap.style.display = 'none';
      window._fvPendingThumbUrl = '';
      window._fvPendingDuration = 0;

      if (typeof window.loadFullVideosList === 'function') window.loadFullVideosList();
    } catch (err) {
      console.error('[fv] publish failed:', err);
      setStatus('Publish failed: ' + err.message, 'error');
    } finally {
      uploading = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  });
}