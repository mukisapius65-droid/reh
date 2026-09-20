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

  let uploading = false;

  function setStatus(msg, kind) {
    const el = document.getElementById('fvStatus');
    if (!el) return;
    el.textContent = msg;
    el.style.color = kind === 'error' ? '#e74c3c' : kind === 'success' ? '#2ecc71' : '#c5bfb3';
  }

  submitBtn.addEventListener('click', async function () {
    if (uploading) return;
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!user || !user.email) { setStatus('Please log in.', 'error'); return; }

    const title = (document.getElementById('fvTitle') || {}).value?.trim() || '';
    const description = (document.getElementById('fvDescription') || {}).value?.trim() || '';
    const category = (document.getElementById('fvCategory') || {}).value || 'events';
    const videoUrl = (document.getElementById('fvVideoUrl') || {}).value?.trim() || '';
    const thumbnail = (document.getElementById('fvThumbUrl') || {}).value?.trim() || '';

    if (!title) { setStatus('Title is required.', 'error'); return; }
    if (!videoUrl) { setStatus('Video URL is required.', 'error'); return; }

    uploading = true;
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing…';

    try {
      await window.addDoc(window.collection(window.db, 'full_videos'), {
        title,
        description,
        category,
        videoUrl,
        thumbnail,
        duration: 0,
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
      if (document.getElementById('fvThumbUrl')) document.getElementById('fvThumbUrl').value = '';

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