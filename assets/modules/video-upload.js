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

export function initVideoUpload() {
  // Inject modal if not exists
  if (!document.getElementById('video-upload-modal')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // ─── Open modal function ──────────────────────────
  window.openVideoUploadModal = function() {
    const user = getCurrentUser();
    if (!user || !user.email) {
      showToast('Please log in to upload videos.');
      return;
    }
    const modal = document.getElementById('video-upload-modal');
    if (modal) modal.style.display = 'flex';
  };

  // ─── Close modal ─────────────────────────────────
  document.getElementById('videoUploadClose').addEventListener('click', closeUploadModal);
  document.getElementById('video-upload-modal').addEventListener('click', function(e) {
    if (e.target === this) closeUploadModal();
  });

  // ─── Submit upload ───────────────────────────────
  document.getElementById('videoUploadSubmit').addEventListener('click', async function() {
    if (uploadInProgress) return;
    const user = getCurrentUser();
    if (!user || !user.email) {
      showToast('Please log in first.');
      return;
    }

    const title = document.getElementById('videoUploadTitle').value.trim();
    const fileInput = document.getElementById('videoUploadFile');
    const thumbnail = document.getElementById('videoUploadThumb').value.trim();

    if (!title) {
      showToast('Please enter a title.');
      return;
    }
    if (!fileInput.files || fileInput.files.length === 0) {
      showToast('Please select a video file.');
      return;
    }
    const file = fileInput.files[0];
    if (file.size > 200 * 1024 * 1024) {
      showToast('File too large. Maximum 200MB.');
      return;
    }

    uploadInProgress = true;
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('uploadProgress');
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    const submitBtn = this;
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading…';

    try {
      // ── Upload to Catbox via proxy
const formData = new FormData();
formData.append('fileToUpload', file);     // Correct field name
formData.append('reqtype', 'fileupload');  // Required field
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      // Track progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          progressBar.style.width = percent + '%';
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(parsed);
            } else {
              const errorMsg = parsed.error || parsed.message || xhr.statusText || 'Unknown error';
              reject(new Error(`${xhr.status}: ${errorMsg}`));
            }
          } catch (parseError) {
            // If response is not JSON
            reject(new Error(`${xhr.status}: ${xhr.responseText || xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error – /api/upload unreachable'));
        xhr.send(formData);
      });

      const videoUrl = response.url;
      
      if (!videoUrl) throw new Error('No URL returned from proxy');

      // ── Generate first-frame thumbnail ──
let thumbnailUrl = '';
try {
  const thumbBlob = await generateVideoThumbnail(file);
  if (thumbBlob) {
    const thumbPath = `tar_tv_videos/${user.email}/thumbs/${Date.now()}_thumb.jpg`;
    const thumbRef = window.storageRef(window.storage, thumbPath);
    const thumbSnap = await window.uploadBytes(thumbRef, thumbBlob, {
      contentType: 'image/jpeg',
      customMetadata: { uploadedBy: user.email, kind: 'tar_tv_thumbnail' }
    });
    thumbnailUrl = await window.getDownloadURL(thumbSnap.ref);
  }
} catch (e) {
  console.warn('[thumb] generation/upload failed, falling back to none:', e);
}

      // ── Create Firestore document ──
      const videoData = {
        title: title,
        author: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        authorEmail: user.email,
        videoUrl: videoUrl,
        thumbnail: thumbnailUrl || thumbnail || '',
        likes: 0,
        views: 0,
        createdAt: window.serverTimestamp ? window.serverTimestamp() : new Date(),
        status: 'published'
      };
      await window.addDoc(window.collection(window.db, 'tar_tv_videos'), videoData);

      showToast('✅ Video posted successfully!');
      closeUploadModal();
      if (typeof window.loadTarTVVideos === 'function') {
        window.loadTarTVVideos();
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('❌ Upload failed: ' + error.message);
    } finally {
      uploadInProgress = false;
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
      progressContainer.style.display = 'none';
      progressBar.style.width = '0%';
    }
  });
}

// ─── Admin Full Videos upload ─────────────────────────────
// Separate flow from the user-facing Tar TV modal above.
// Bound to the inline form on admin-reh.html (#fvSubmit).

const CLOUDINARY_CLOUD = 'hqhzolpo';
const CLOUDINARY_THUMB_PRESET = 'reh_full_video_thumbs';
const FULL_VIDEO_FALLBACK_THUMB = 'https://res.cloudinary.com/hqhzolpo/image/upload/v1/reh/full_videos/thumbs/placeholder.jpg';

export function initFullVideoUpload() {
  const submitBtn = document.getElementById('fvSubmit');
  if (!submitBtn) return; // not on the admin page

  let uploading = false;

  // ── Duration from a local File ──────────────────
  function extractDuration(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.src = url;
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(0);
      }, 15000);
      video.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
        const d = Math.round(video.duration || 0);
        URL.revokeObjectURL(url);
        resolve(d);
      });
      video.addEventListener('error', () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        resolve(0);
      });
    });
  }

  // ── Catbox upload via existing proxy ────────────
  function uploadToCatbox(file, onProgress) {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('fileToUpload', file);
      fd.append('reqtype', 'fileupload');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      xhr.onload = () => {
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && parsed.url) {
            resolve(parsed.url);
          } else {
            reject(new Error(parsed.error || parsed.message || xhr.statusText));
          }
        } catch (e) {
          reject(new Error(xhr.responseText || xhr.statusText));
        }
      };
      xhr.onerror = () => reject(new Error('Network error — /api/upload unreachable'));
      xhr.send(fd);
    });
  }

  // ── Thumbnail blob → Cloudinary ─────────────────
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
    if (!data.secure_url) throw new Error('No secure_url from Cloudinary');
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

  // ── Preview on file select ──────────────────────
  const fileInput = document.getElementById('fvVideoFile');
  if (fileInput) {
    fileInput.addEventListener('change', async function () {
      if (!this.files || !this.files[0]) return;
      const file = this.files[0];
      setStatus('Generating preview…', 'info');
      try {
        const durationSec = await extractDuration(file);
        let thumbUrl = FULL_VIDEO_FALLBACK_THUMB;
        try {
          const thumbBlob = await generateVideoThumbnail(file);
          if (thumbBlob) thumbUrl = await uploadThumbToCloudinary(thumbBlob);
        } catch (thumbErr) {
          console.warn('[fv] thumb generation failed, using placeholder:', thumbErr);
          setStatus('⚠ Thumbnail generation failed — using placeholder.', 'error');
        }
        showPreview(thumbUrl, durationSec);
        window._fvPendingThumbUrl = thumbUrl;
        window._fvPendingDuration = durationSec;
        setStatus('✓ Preview ready. Tap Publish to upload.', 'success');
      } catch (err) {
        console.error('[fv] preview failed:', err);
        setStatus('Preview failed: ' + err.message, 'error');
      }
    });
  }

  // ── Submit ──────────────────────────────────────
  submitBtn.addEventListener('click', async function () {
    if (uploading) return;
    const user = getCurrentUser();
    if (!user || !user.email) { showToast('Please log in.'); return; }

    const titleEl = document.getElementById('fvTitle');
    const descEl = document.getElementById('fvDescription');
    const catEl = document.getElementById('fvCategory');
    const fileEl = document.getElementById('fvVideoFile');

    const title = titleEl ? titleEl.value.trim() : '';
    const description = descEl ? descEl.value.trim() : '';
    const category = catEl ? catEl.value : 'events';

    if (!title) { setStatus('Title is required.', 'error'); return; }
    if (!fileEl || !fileEl.files || !fileEl.files[0]) {
      setStatus('Please select a video file.', 'error'); return;
    }

    const file = fileEl.files[0];
    if (file.size > 200 * 1024 * 1024) {
      setStatus('File too large. Max 200 MB.', 'error'); return;
    }

    uploading = true;
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading video…';

    try {
      setStatus('Uploading video…', 'info');
      const videoUrl = await uploadToCatbox(file, (pct) => {
        setStatus(`Uploading video… ${pct}%`, 'info');
      });

      let thumbUrl = window._fvPendingThumbUrl || FULL_VIDEO_FALLBACK_THUMB;
      let durationSec = window._fvPendingDuration || 0;

      if (!window._fvPendingThumbUrl) {
        try {
          const thumbBlob = await generateVideoThumbnail(file);
          if (thumbBlob) thumbUrl = await uploadThumbToCloudinary(thumbBlob);
          durationSec = await extractDuration(file);
        } catch (e) { console.warn('[fv] fallback thumb failed:', e); }
      }

      await window.addDoc(window.collection(window.db, 'full_videos'), {
        title,
        description,
        category,
        videoUrl,
        thumbnail: thumbUrl,
        duration: durationSec,
        views: 0,
        likes: 0,
        author: 'Reh',
        uploadedBy: user.email,
        createdAt: window.serverTimestamp ? window.serverTimestamp() : new Date(),
        status: 'published'
      });

      setStatus('✓ Published.', 'success');
      showToast('Video published.');

      if (titleEl) titleEl.value = '';
      if (descEl) descEl.value = '';
      if (fileEl) fileEl.value = '';
      const wrap = document.getElementById('fvPreviewWrap');
      if (wrap) wrap.style.display = 'none';
      window._fvPendingThumbUrl = null;
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