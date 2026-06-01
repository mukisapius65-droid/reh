const USER_KEY = "reh_user";

const navContainer = document.querySelector('.nav');
navContainer.innerHTML =
`<div class="nav-inner">
  <a href="index.html?redirect=discover.html" class="nav-brand">
    <div class="nav-brand-icon"><i class="fa-solid fa-gem"></i></div>
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
      <!-- Dropdown -->
      <div class="notif-dropdown" id="notifDropdown">
        <div class="notif-header">
          <h4>Notifications</h4>
          <button id="markAllReadBtn">Mark all read</button>
        </div>
        <div class="notif-list" id="notifList"></div>
      </div>
    </li>
    <!-- Event Requests Tracker -->
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
  <!-- This button is shown when logged out -->
  <a id="joinCta" class="nav-cta" href="index.html?redirect=login.html"
    >Join the Circle</a
  >

  <!-- This container is shown when logged in (initially hidden via CSS) -->
  <div id="profileArea" class="nav-profile" style="display: none">
    <div class="nav-avatar">
      <img
        src="https://randomuser.me/api/portraits/women/44.jpg"
        alt="User avatar"
        id="navAvatarImg"
      />
    </div>
    <div class="dropdown-menu" id="dropdownMenu">
      <a href="index.html?redirect=profile.html"
        ><i class="fa-solid fa-user"></i> My Profile</a
      >
      <a href="plans.html"><i class="fa-solid fa-gem"></i> Membership Plans</a>
      <a href="index.html?redirect=settings.html"
        ><i class="fa-solid fa-gear"></i> Settings</a
      >
      <a href="index.html?redirect=tell-a-friend.html"
        ><i class="fa-solid fa-gift"></i> Invite Friends</a
      >
      <a href="index.html?redirect=bookmarks.html"
        ><i class="fa-solid fa-bookmark"></i> Bookmarks</a
      >
      <a href="plans.html" id="upgradeLink" style="display:none;">
          <i class="fa-solid fa-arrow-up"></i> Upgrade Plan
      </a>
      <button id="logoutBtn">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
      </button>
    </div>
  </div>
  <div class="mobile-setup">
    <li class="notification-bell" id="mobileNotificationBell">
      <i class="fa-solid fa-bell"></i>
      <span class="badge" id="mobileNotificationBadge" style="display: none"
        >0</span
      >
      <!-- Dropdown -->
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

const mobileSidebarContainer = document.querySelector('.sidebar');
mobileSidebarContainer.innerHTML =
`<a href="index.html?redirect=discover.html" class="sidebar-brand">
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
            <li><a href="index.html?redirect=tell-a-friend.html"><i class="fa-solid fa-gift"></i> Invite Friends</a>
            </li>
            <li></li><a href="index.html?redirect=bookmarks.html"><i class="fa-solid fa-bookmark"></i> Bookmarks</a>
            </li>
        </ul>
    </div>
</nav>
<div class="sidebar-footer">
    <button id="sidebarLogoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
</div>`;

  // ── Mobile nav toggle ────────────────────────
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.querySelector(".nav-hamburger");
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("invisible");
  });

    function updateNavFromAuth() {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    const joinCta = document.getElementById("joinCta");
    const sidebarJoinCta = document.getElementById("sidebarJoinCta");
    const sidebarProfileLink = document.getElementById("sidebarProfileLink");
    const profileArea = document.getElementById("profileArea");
    const navAvatarImg = document.getElementById("navAvatarImg");
    const notifiBells = document.querySelectorAll('.notification-bell');

    if (user) {
      // Hide join buttons
      if (joinCta) joinCta.style.display = "none";
      if (sidebarJoinCta) sidebarJoinCta.style.display = "none";
      // Show top‑nav avatar and sidebar profile link
      if (profileArea) profileArea.style.display = "flex";
      if (sidebarProfileLink) sidebarProfileLink.style.display = "";
      if (navAvatarImg)
        navAvatarImg.src =
          user.avatar || "https://randomuser.me/api/portraits/women/44.jpg";
    } else {
      // Show join buttons
      if (joinCta) joinCta.style.display = "";
      if (sidebarJoinCta) sidebarJoinCta.style.display = "";
      // Hide top‑nav avatar, sidebar profile link & notif bells
      if (profileArea) profileArea.style.display = "none";
      if (sidebarProfileLink) sidebarProfileLink.style.display = "none";
      if (notifiBells) {
        notifiBells.forEach(bell => {
            bell.classList.add('invisible');
        })
      }
    }
    const upgradeLink = document.getElementById('upgradeLink');
    if (user && user.plan === 'trial') {
        if (upgradeLink) upgradeLink.style.display = 'flex';
        if (upgradeLink) upgradeLink.style.color = 'var(--gold-light)';
    } else {
        if (upgradeLink) upgradeLink.style.display = 'none';
    }
  }
  updateNavFromAuth();

const footerContainer = document.querySelector("footer");
footerContainer.innerHTML =
`<div class="footer-grid">
    <!-- About -->
    <div class="footer-col">
        <h4>About Reh</h4>
        <p>Reh is the world’s most exclusive dating circle — where extraordinary hearts find home. Curated connections,
            luxury events, and a 24/7 concierge make every encounter a masterpiece.</p>
        <div class="footer-social">
            <a href="#"><i class="fa-brands fa-instagram"></i></a>
            <a href="#"><i class="fa-brands fa-tiktok"></i></a>
            <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="https://tiktok.com@reh"><i class="fa-brands fa-youtube"></i></a>
        </div>
    </div>
    <!-- Quick Links -->
    <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
            <li><a href="index.html?redirect=discover.html">Discover</a></li>
            <li><a href="index.html?redirect=elite.html">Crown Elite</a></li>
            <li><a href="index.html?redirect=events.html">Events</a></li>
            <li><a href="index.html?redirect=concierge.html">Concierge</a></li>
            <li><a href="plans.html">Membership Plans</a></li>
            <li><a href="index.html?redirect=tell-a-friend.html">Invite Friends</a></li>
        </ul>
    </div>
    <!-- Support -->
    <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="#" data-footer="help">Help Centre</a></li>
          <li><a href="#" data-footer="safety">Safety Tips</a></li>
          <li><a href="#" data-footer="contact">Contact Concierge</a></li>
          <li><a href="#" data-footer="report">Report a Profile</a></li>
          <li><a href="#" data-footer="community">Community Guidelines</a></li>
        </ul>
    </div>
    <!-- Legal & Newsletter -->
    <div class="footer-col">
        <h4>Legal</h4>
        <ul>
            <li><a href="index.html?redirect=the-iron-convenant.html">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">GDPR Compliance</a></li>
        </ul>
        <h4 style="margin-top:1.5rem;">Newsletter</h4>
        <div class="newsletter-form">
            <input type="email" placeholder="Enter your email" id="newsletterEmail">
            <button id="subscribeBtn"><i class="fa-solid fa-paper-plane"></i> Subscribe</button>
        </div>
    </div>
</div>
<div class="footer-bottom">
    <p>&copy; 2026 <span>Reh</span> — Crown Elite. All Rights Reserved.</p>
</div>`;

// Add modal container to body
const modalHTML = `
<div class="modal-overlay" id="footerModal">
  <div class="modal-content">
    <div class="modal-header">
      <h3 id="footerModalTitle"></h3>
      <button class="modal-close" id="footerModalClose">&times;</button>
    </div>
    <div class="modal-body" id="footerModalBody"></div>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

// ── Footer modal logic ──────────────────────
const footerModal = document.getElementById('footerModal');
const footerModalTitle = document.getElementById('footerModalTitle');
const footerModalBody = document.getElementById('footerModalBody');
const footerModalClose = document.getElementById('footerModalClose');

function openFooterModal(title, bodyHTML) {
  footerModalTitle.textContent = title;
  footerModalBody.innerHTML = bodyHTML;
  footerModal.classList.add('active');
}

footerModalClose.addEventListener('click', () => footerModal.classList.remove('active'));
footerModal.addEventListener('click', (e) => {
  if (e.target === footerModal) footerModal.classList.remove('active');
});

// Content for each link
const modalContent = {
  'help': {
    title: 'Help Centre',
    body: `<p>Welcome to Reh Support. Here are some quick guides:</p>
           <ul>
             <li><strong>Getting Started:</strong> Complete your profile and browse Discover.</li>
             <li><strong>Matches:</strong> Use the search and filters to find extraordinary people.</li>
             <li><strong>Events:</strong> Request invitations to exclusive gatherings.</li>
             <li><strong>Concierge:</strong> Chat with our team for personalised help.</li>
           </ul>
           <p>For immediate assistance, contact <a href="mailto:support@reh.com" style="color:var(--gold);">support@reh.com</a>.</p>`
  },
  'safety': {
    title: 'Safety Tips',
    body: `<p>Your safety is paramount. Follow these guidelines:</p>
           <ul>
             <li>Keep personal information private until trust is established.</li>
             <li>Always meet in public, luxury venues.</li>
             <li>Report suspicious behaviour immediately.</li>
             <li>Use our block feature to stop unwanted contact.</li>
           </ul>
           <p>Reh is committed to creating a secure environment for all members.</p>`
  },
  'community': {
    title: 'Community Guidelines',
    body: `<p>Reh is built on respect and elegance:</p>
           <ul>
             <li>Treat others with kindness and courtesy.</li>
             <li>No harassment, hate speech, or inappropriate content.</li>
             <li>Profiles must be genuine and accurate.</li>
             <li>Violations may result in suspension or permanent ban.</li>
           </ul>
           <p>Together we maintain a sanctuary for genuine connections.</p>`
  },
  'contact': {
    title: 'Contact Concierge',
    body: `<p>Our concierge team is available 24/7 to assist you with anything from date planning to technical support.</p>
           <p>Email: <a href="mailto:concierge@reh.com" style="color:var(--gold);">concierge@reh.com</a></p>`
  },
  'report': {
    title: 'Report a Profile',
    body: `<p>If you encounter a profile that violates our guidelines, please let us know.</p>
           <input type="email" id="reportEmail" placeholder="Profile email to report" required>
           <textarea id="reportReason" rows="3" placeholder="Reason for report"></textarea>
           <button id="submitReportBtn">Submit Report</button>`
  }
};

// Attach click handlers to footer links with data-page attributes
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-footer]');
  if (!link) return;
  e.preventDefault();
  const page = link.getAttribute('data-footer');

  if (page === 'report') {
    openFooterModal('Report a Profile', modalContent.report.body);
    // Bind the report submission after modal opens
    setTimeout(() => {
      const submitBtn = document.getElementById('submitReportBtn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          const email = document.getElementById('reportEmail').value.trim();
          const reason = document.getElementById('reportReason').value.trim();
          if (!email) return showToast('Please enter the profile email.');
          const reports = JSON.parse(localStorage.getItem('reh_reports') || '[]');
          reports.push({ reported: email, reason, reporter: getCurrentUser()?.email, timestamp: Date.now() });
          localStorage.setItem('reh_reports', JSON.stringify(reports));
          showToast('Report submitted. Thank you for helping keep Reh safe.');
          footerModal.classList.remove('active');
        });
      }
    }, 100);
  } else if (modalContent[page]) {
    openFooterModal(modalContent[page].title, modalContent[page].body);
  }
});

// ── Automatically set active class based on current page ──
(function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop();  // e.g., 'discover.html'
  let activePage = 'discover';   // default

  if (path === 'elite.html')         activePage = 'elite';
  else if (path === 'events.html')   activePage = 'events';
  else if (path === 'concierge.html') activePage = 'concierge';
  else if (path === 'index.html')    activePage = 'discover';  // fallback
  // add other pages as needed

  document.querySelectorAll('[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === activePage);
  });
})();

// Plan eligibility checker
function isEligible(minimumPlan) {
    const user = JSON.parse(localStorage.getItem('reh_user') || '{}');
    const plan = user.plan || 'trial';
    const planLevels = { 'trial': 0, 'premium-monthly': 1, 'elite-annual': 2 };
    const requiredLevel = planLevels[minimumPlan] || 0;
    const currentLevel = planLevels[plan] || 0;
    return currentLevel >= requiredLevel;
}