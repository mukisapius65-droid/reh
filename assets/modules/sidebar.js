// assets/modules/sidebar.js

const sidebarHTML = `
<a href="index.html?redirect=discover.html" class="sidebar-brand">
    <div class="nav-brand-icon">
        <i class="fa-solid fa-gem"></i>
    </div>
    <span class="nav-brand-text">Reh</span>
</a>
<nav class="nav">
    <div class="side-inner">
        <a id="sidebarJoinCta" class="sidebar-cta" href="index.html?redirect=login.html">Join the Circle</a>
        <a id="sidebarProfileLink" href="index.html?redirect=profile.html" style="display:none;">
            <i class="fa-solid fa-user"></i> My Profile
        </a>
        <ul class="sidebar-links">
            <li><a href="index.html?redirect=discover.html" data-page="discover">Discover</a></li>
            <li><a href="index.html?redirect=elite.html" data-page="elite">Elite</a></li>
            <li><a href="index.html?redirect=events.html" data-page="events">Events</a></li>
            <li><a href="index.html?redirect=concierge.html" data-page="concierge">Concierge</a></li>
            <li><a href="plans.html"><i class="fa-solid fa-gem"></i> Membership Plans</a></li>
            <li><a href="index.html?redirect=settings.html"><i class="fa-solid fa-gear"></i> Settings</a></li>
            <li><a href="index.html?redirect=tell-a-friend.html"><i class="fa-solid fa-gift"></i> Invite Friends</a></li>
            <li><a href="index.html?redirect=bookmarks.html"><i class="fa-solid fa-bookmark"></i> Bookmarks</a></li>
        </ul>
    </div>
</nav>
<div class="sidebar-footer">
    <button id="sidebarLogoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
</div>
`;

export function initSidebar() {
  const sidebarContainer = document.querySelector('.sidebar');
  if (!sidebarContainer || sidebarContainer.querySelector('.sidebar-brand')) return;

  sidebarContainer.innerHTML = sidebarHTML;

  // ─── Active link highlighting ──────────────────
  const path = window.location.pathname.split('/').pop() || 'discover.html';
  const activePage = path.replace('.html', '');
  document.querySelectorAll('.sidebar-links a[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === activePage);
  });

  // ─── Mobile sidebar toggle (hamburger) ─────────
  const hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebarContainer.classList.toggle('invisible');
    });
  }

  // ─── Sidebar logout (relies on window.logoutUser from auth.js) ──
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      if (typeof window.logoutUser === 'function') {
        window.logoutUser();
      }
    });
  }
}