// assets/modules/bottom-nav.js

const bottomNavHTML = `
<div class="mobile-bottom-nav" id="mobileBottomNav">
    <a href="index.html?redirect=discover.html" class="bottom-nav-item" data-page="home">
        <i class="fa-solid fa-house"></i>
        <span>Home</span>
    </a>
    <a href="messages.html" class="bottom-nav-item" data-page="messages">
        <i class="fa-solid fa-comment-dots"></i>
        <span>Chats</span>
        <span class="nav-badge" id="messagesUnreadBadge" style="display:none;">0</span>
    </a>
    <button class="bottom-nav-add" id="createStoryBtn">
        <i class="fa-solid fa-plus"></i>
    </button>
    <a href="tartv.html" class="bottom-nav-item" data-page="tartv">
        <i class="fa-solid fa-tv"></i>
        <span>Tar TV</span>
        <!-- "New" badge removed as requested -->
    </a>
    <a href="index.html?redirect=profile.html" class="bottom-nav-item" data-page="profile">
        <i class="fa-solid fa-user"></i>
        <span>Profile</span>
    </a>
</div>
<!-- Create Status Modal -->
<div class="create-modal-overlay" id="createModal">
    <div class="create-modal">
        <h3>Create Status / Story</h3>
        <button class="btn btn-gold" id="uploadStoryBtn"><i class="fa-solid fa-image"></i> Photo</button>
        <button class="btn btn-gold" id="videoStoryBtn"><i class="fa-solid fa-video"></i> Video</button>
        <button class="btn btn-gold" id="textStoryBtn"><i class="fa-solid fa-font"></i> Text</button>
        <button class="btn btn-close" id="closeCreateModal">Cancel</button>
    </div>
</div>
`;

export function initBottomNav() {
  // Only inject on pages that are not login/register etc.
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  const excluded = ['login.html', 'register.html', 'signin.html', 'signup.html', 'dashboard.html', 'plans.html'];
  if (excluded.includes(currentPage)) return;

  if (document.getElementById('mobileBottomNav')) return;

  document.body.insertAdjacentHTML('beforeend', bottomNavHTML);

  // ─── Bottom nav active state ────────────────────
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const currentPageName = path.replace('.html', '') || 'home';
  document.querySelectorAll('.bottom-nav-item').forEach(link => {
    link.classList.toggle('active', link.dataset.page === currentPageName);
  });

  // ─── Create modal logic ──────────────────────────
  const createBtn = document.getElementById('createStoryBtn');
  const createModal = document.getElementById('createModal');
  const closeModal = document.getElementById('closeCreateModal');

  if (createBtn && createModal) {
    createBtn.addEventListener('click', () => {
      createModal.classList.add('show');
    });
  }

  if (closeModal && createModal) {
    closeModal.addEventListener('click', () => {
      createModal.classList.remove('show');
    });
  }

  // Placeholder for story upload – will be replaced later
  const uploadBtn = document.getElementById('uploadStoryBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      alert('Photo story feature coming soon');
      createModal?.classList.remove('show');
    });
  }
  const videoBtn = document.getElementById('videoStoryBtn');
  if (videoBtn) {
    videoBtn.addEventListener('click', () => {
      alert('Video story feature coming soon');
      createModal?.classList.remove('show');
    });
  }
  const textBtn = document.getElementById('textStoryBtn');
  if (textBtn) {
    textBtn.addEventListener('click', () => {
      alert('Text story feature coming soon');
      createModal?.classList.remove('show');
    });
  }
}