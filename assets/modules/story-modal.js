// assets/modules/story-modal.js
import { getCurrentUser, showToast } from '../utils.js';

const modalHTML = `
<div id="story-upload-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9998; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
  <div style="background: linear-gradient(145deg, #1a1a2e, #16213e); padding:2rem; border-radius:20px; max-width:400px; width:90%; box-shadow: 0 8px 32px rgba(0,0,0,0.6); border:1px solid rgba(245,166,35,0.3);">
    <h3 style="color:#f5a623; font-family:'Playfair Display',serif; text-align:center; margin-bottom:1.5rem;">Add Story</h3>
    <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; justify-content:center;">
      <button class="story-type-btn active" data-type="text" style="background:rgba(245,166,35,0.2); border:1px solid #f5a623; color:#f5a623; padding:8px 16px; border-radius:20px; cursor:pointer; transition:all 0.2s;">Text</button>
      <button class="story-type-btn" data-type="photo" style="background:transparent; border:1px solid #555; color:#ccc; padding:8px 16px; border-radius:20px; cursor:pointer; transition:all 0.2s;">Photo</button>
      <button class="story-type-btn" data-type="audio" style="background:transparent; border:1px solid #555; color:#ccc; padding:8px 16px; border-radius:20px; cursor:pointer; transition:all 0.2s;">Audio</button>
    </div>
    <div id="story-upload-content">
      <textarea id="story-text-input" placeholder="What's on your mind?" style="width:100%; height:120px; border-radius:10px; padding:1rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #555; resize:none; font-family:'Inter',sans-serif;"></textarea>
    </div>
    <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center;">
      <button id="story-upload-submit" style="background:#f5a623; color:#000; border:none; padding:10px 30px; border-radius:30px; font-weight:bold; cursor:pointer; transition:all 0.2s;">Post</button>
      <button id="story-upload-close" style="background:transparent; color:#fff; border:1px solid #555; padding:10px 20px; border-radius:30px; cursor:pointer; transition:all 0.2s;">Cancel</button>
    </div>
  </div>
</div>`;

let selectedStoryType = 'text';

function closeStoryUploadModal() {
  const modal = document.getElementById('story-upload-modal');
  if (modal) modal.style.display = 'none';
  const container = document.getElementById('story-upload-content');
  if (container) {
    container.innerHTML = `<textarea id="story-text-input" placeholder="What's on your mind?" style="width:100%; height:120px; border-radius:10px; padding:1rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #555; resize:none; font-family:'Inter',sans-serif;"></textarea>`;
  }
  document.querySelectorAll('.story-type-btn').forEach(b => {
    b.style.background = 'transparent';
    b.style.borderColor = '#555';
    b.style.color = '#ccc';
  });
  const textBtn = document.querySelector('.story-type-btn[data-type="text"]');
  if (textBtn) {
    textBtn.style.background = 'rgba(245,166,35,0.2)';
    textBtn.style.borderColor = '#f5a623';
    textBtn.style.color = '#f5a623';
  }
  selectedStoryType = 'text';
}

export function initStoryModal() {
  if (document.getElementById('story-upload-modal')) return;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  document.querySelectorAll('.story-type-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      document.querySelectorAll('.story-type-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.borderColor = '#555';
        b.style.color = '#ccc';
      });
      this.style.background = 'rgba(245,166,35,0.2)';
      this.style.borderColor = '#f5a623';
      this.style.color = '#f5a623';
      selectedStoryType = this.dataset.type;

      const contentContainer = document.getElementById('story-upload-content');
      if (selectedStoryType === 'text') {
        contentContainer.innerHTML = `<textarea id="story-text-input" placeholder="What's on your mind?" style="width:100%; height:120px; border-radius:10px; padding:1rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #555; resize:none; font-family:'Inter',sans-serif;"></textarea>`;
      } else {
        const accept = selectedStoryType === 'photo' ? 'image/*' : 'audio/*';
        contentContainer.innerHTML = `<input type="file" id="story-file-input" accept="${accept}" style="color:#fff; width:100%; padding:0.5rem 0;">`;
      }
    });
  });

  document.getElementById('story-upload-submit').addEventListener('click', async function() {
    const user = getCurrentUser();
    if (!user) {
      alert('Please log in first.');
      return;
    }

    let content;
    if (selectedStoryType === 'text') {
      const input = document.getElementById('story-text-input');
      if (!input) return;
      content = input.value.trim();
      if (!content) {
        alert('Please write something.');
        return;
      }
    } else {
      const fileInput = document.getElementById('story-file-input');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert('Please select a file.');
        return;
      }
      content = fileInput.files[0];
    }

    try {
      if (typeof window.uploadStory !== 'function') {
        throw new Error('window.uploadStory is not a function. Check if stories.js is loaded.');
      }
      const docId = await window.uploadStory(user, selectedStoryType, content);
      console.log('Story uploaded successfully, ID:', docId);
      closeStoryUploadModal();
      if (typeof window.renderStories === 'function') {
        window.renderStories();
      }
      showToast('📸 Story posted successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      showToast(`Upload failed: ${err.message || 'Unknown error'}`);
    }
  });

  document.getElementById('story-upload-close').addEventListener('click', closeStoryUploadModal);

  document.getElementById('story-upload-modal').addEventListener('click', function(e) {
    if (e.target === this) closeStoryUploadModal();
  });

  window.openStoryUploadModal = function() {
    const modal = document.getElementById('story-upload-modal');
    if (modal) modal.style.display = 'flex';
  };

  const addBtn = document.getElementById('createStoryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof window.openStoryUploadModal === 'function') {
        window.openStoryUploadModal();
      }
    });
  }

  if (typeof window.cleanupExpiredStories === 'function') {
    window.cleanupExpiredStories().catch(err => console.warn('Initial cleanup failed:', err));
    setInterval(() => {
      window.cleanupExpiredStories().catch(err => console.warn('Cleanup interval failed:', err));
    }, 300000);
  }
}