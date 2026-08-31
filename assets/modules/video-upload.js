// assets/modules/video-upload.js
import { getCurrentUser, showToast } from '../utils.js';

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

      // ── Create Firestore document ──
      const videoData = {
        title: title,
        author: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        authorEmail: user.email,
        videoUrl: videoUrl,
        thumbnail: thumbnail || '',
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