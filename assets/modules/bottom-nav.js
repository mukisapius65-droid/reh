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
}