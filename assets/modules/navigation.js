// assets/modules/navigation.js

const navHTML = `
<div class="nav-inner">
  <a href="index.html?redirect=discover.html" class="nav-brand">
    <div class="nav-brand-icon"><img class="brand-img" style="border-radius: 50%;" src="https://files.catbox.moe/8r2yqf.jpg" loading="lazy"></div>
    <span class="nav-brand-text">Reh</span>
  </a>
  <ul class="nav-links">
    <li><a href="index.html" data-page="discover">Discover</a></li>
    <li><a href="index.html?redirect=elite.html" data-page="elite">Elite</a></li>
    <li><a href="index.html?redirect=events.html" data-page="events">Events</a></li>
    <li><a href="index.html?redirect=concierge.html" data-page="concierge">Concierge</a></li>
    <li class="notification-bell" id="notificationBell">
      <i class="fa-solid fa-bell"></i>
      <span class="badge" id="notificationBadge" style="display: none">0</span>
      <div class="notif-dropdown" id="notifDropdown">
        <div class="notif-header">
          <h4>Notifications</h4>
          <button id="markAllReadBtn">Mark all read</button>
        </div>
        <div class="notif-list" id="notifList"></div>
      </div>
    </li>
    <li class="notification-bell" id="requestsBell">
        <i class="fa-solid fa-ticket"></i>
        <span class="badge" id="requestsBadge" style="display:none;">0</span>
        <div class="notif-dropdown" id="requestsDropdown">
            <div class="notif-header">
                <h4>My Event Requests</h4>
                <button id="refreshRequestsBtn">Refresh</button>
            </div>
            <div class="notif-list" id="requestsList"></div>
        </div>
    </li>
  </ul>
  <a id="joinCta" class="nav-cta" href="index.html?redirect=login.html">Join the Circle</a>
  <div id="profileArea" class="nav-profile" style="display: none">
    <div class="nav-avatar">
      <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User avatar" id="navAvatarImg" />
    </div>
    <div class="dropdown-menu" id="dropdownMenu">
      <a href="index.html?redirect=profile.html"><i class="fa-solid fa-user"></i> My Profile</a>
      <a href="plans.html"><i class="fa-solid fa-gem"></i> Membership Plans</a>
      <a href="index.html?redirect=settings.html"><i class="fa-solid fa-gear"></i> Settings</a>
      <a href="index.html?redirect=tell-a-friend.html"><i class="fa-solid fa-gift"></i> Invite Friends</a>
      <a href="index.html?redirect=bookmarks.html"><i class="fa-solid fa-bookmark"></i> Bookmarks</a>
      <a href="plans.html" id="upgradeLink" style="display:none;"><i class="fa-solid fa-arrow-up"></i> Upgrade Plan</a>
      <button id="logoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
    </div>
  </div>
  <div class="mobile-setup">
    <li class="notification-bell" id="mobileNotificationBell">
      <i class="fa-solid fa-bell"></i>
      <span class="badge" id="mobileNotificationBadge" style="display: none">0</span>
      <div class="mobile-notif-dropdown" id="mobileNotifDropdown">
        <div class="notif-header">
          <h4>Notifications</h4>
          <button id="mobileMarkAllReadBtn">Mark all read</button>
        </div>
        <div class="notif-list" id="mobileNotifList"></div>
      </div>
    </li>
    <button class="nav-hamburger"><i class="fa-solid fa-bars"></i></button>
  </div>
</div>
`;

export function initNavigation() {
  const navContainer = document.querySelector('.nav');
  if (!navContainer || navContainer.querySelector('.nav-inner')) return;

  navContainer.innerHTML = navHTML;

  // ─── Active link highlighting ──────────────────
  const path = window.location.pathname.split('/').pop() || 'discover.html';
  const activePage = path.replace('.html', '');
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === activePage);
  });

  // ─── Avatar dropdown toggle ────────────────────
  const navProfile = document.getElementById('profileArea');
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (navProfile && dropdownMenu) {
    navProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
    });
  }
}