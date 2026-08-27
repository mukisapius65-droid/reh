const USER_KEY = "reh_user";

window.avatarPool = [
'https://files.catbox.moe/jhuahq.jpg',
'https://files.catbox.moe/bqihga.jpg',
'https://files.catbox.moe/opkite.jpg',
'https://files.catbox.moe/at63mh.jpg',
'https://files.catbox.moe/wtscju.jpg',
'https://files.catbox.moe/on7elg.jpg',
'https://files.catbox.moe/pfh41b.jpg',
'https://files.catbox.moe/g1qcj4.jpg',
'https://files.catbox.moe/65nofc.jpg',
'https://files.catbox.moe/7tdwiy.jpg',
'https://files.catbox.moe/s4lgtb.jpg',
'https://files.catbox.moe/44l67p.jpg',
'https://files.catbox.moe/m80w2l.jpg',
'https://files.catbox.moe/0cpblt.jpg',
'https://files.catbox.moe/7nrcqh.jpg',
'https://files.catbox.moe/badrsj.jpg',
'https://files.catbox.moe/zlj7ts.jpg',
'https://files.catbox.moe/zlj7ts.jpg',
'https://files.catbox.moe/se3j53.jpg',
'https://files.catbox.moe/1kiil0.jpg',
'https://files.catbox.moe/xulsk3.jpg',
'https://files.catbox.moe/waakzd.jpg',
'https://files.catbox.moe/2lf6ds.jpg',
'https://files.catbox.moe/xa2dys.jpg',
'https://files.catbox.moe/hgfw98.jpg',
'https://files.catbox.moe/se3j53.jpg',
'https://files.catbox.moe/1kiil0.jpg',
'https://files.catbox.moe/xulsk3.jpg',
'https://files.catbox.moe/gky0gx.jpg',
'https://files.catbox.moe/waakzd.jpg',
'https://files.catbox.moe/2lf6ds.jpg',
'https://files.catbox.moe/xa2dys.jpg',
'https://files.catbox.moe/662288.jpg',
'https://files.catbox.moe/lyl8xw.jpg',
'https://files.catbox.moe/rk44v7.jpg',
'https://files.catbox.moe/n9wyxg.jpg',
'https://files.catbox.moe/ygtnv4.jpg',
'https://files.catbox.moe/h9jv8l.jpg',
'https://files.catbox.moe/h9jv8l.jpg',
'https://files.catbox.moe/lyl8xw.jpg',
'https://files.catbox.moe/jp9n0z.jpg',
'https://files.catbox.moe/ybdg79.jpg',
'https://files.catbox.moe/2v6kgl.jpg'
];

window.getRandomAvatar = function() {
  return window.avatarPool[Math.floor(Math.random() * window.avatarPool.length)];
};

const navContainer = document.querySelector(".nav");
navContainer.innerHTML = `<div class="nav-inner">
  <a href="index.html?redirect=discover.html" class="nav-brand">

    <!--<div class="nav-brand-icon"><i class="fa-solid fa-gem"></i></div>
-->

    <div class="nav-brand-icon"><img class="brand-img" style="border-radius: 50%;"src="https://files.catbox.moe/8r2yqf.jpg" loading="lazy"></div>
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

// ── Mobile Bottom Navigation ───────────────────
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
      <span class="nav-badge" id="messagesUnreadBadge" style="padding: 0px;">New</span>
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

const currentPageName = window.location.pathname.split('/').pop().toLowerCase();

// Only inject bottom nav on pages that need it
if (!['login.html', 'register.html', 'signin.html', 'signup.html', 'dashboard.html', 'plans.html'].includes(currentPageName)) {
    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
}
//document.body.insertAdjacentHTML('beforeend', bottomNavHTML);

const mobileSidebarContainer = document.querySelector(".sidebar");
mobileSidebarContainer.innerHTML = `<a href="index.html?redirect=discover.html" class="sidebar-brand">
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

// Show / hide create modal
const createStoryBtn = document.getElementById('createStoryBtn');
const createModal = document.getElementById('createModal');
const closeCreateModal = document.getElementById('closeCreateModal');

createStoryBtn.addEventListener('click', () => {
    createModal.classList.add('show');
});

closeCreateModal.addEventListener('click', () => {
    createModal.classList.remove('show');
});

document.getElementById('uploadStoryBtn').addEventListener('click', () => {
    // Placeholder – integrate with file upload later
    alert('Photo story feature coming soon');
    createModal.classList.remove('show');
});

document.getElementById('videoStoryBtn').addEventListener('click', () => {
    alert('Video story feature coming soon');
    createModal.classList.remove('show');
});

document.getElementById('textStoryBtn').addEventListener('click', () => {
    alert('Text story feature coming soon');
    createModal.classList.remove('show');
});

// --- ensure getCurrentUser is globally available ---
if (typeof window.getCurrentUser !== 'function') {
  window.getCurrentUser = function() {
    const data = localStorage.getItem('reh_user');
    return data ? JSON.parse(data) : null;
  };
}

// --- inject story upload modal into body ---
const modalHTML1 = `
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

document.body.insertAdjacentHTML('beforeend', modalHTML1);

// --- now attach event listeners ---
let selectedStoryType = 'text';

// Type button toggle
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

// Submit upload
document.getElementById('story-upload-submit').addEventListener('click', async function() {
  const user = window.getCurrentUser ? window.getCurrentUser() : null;
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
    // Check if uploadStory is defined
    if (typeof window.uploadStory !== 'function') {
      throw new Error('window.uploadStory is not a function. Check if stories.js is loaded.');
    }
    // Attempt upload
    const docId = await window.uploadStory(user, selectedStoryType, content);
    console.log('Story uploaded successfully, ID:', docId);
    closeStoryUploadModal();
    if (typeof window.renderStories === 'function') {
      window.renderStories();
    }
    alert('Story posted successfully!'); // temporary success feedback
  } catch (err) {
    console.error('Upload error:', err);
    // Show detailed error in alert
    alert(`Upload failed: ${err.message || 'Unknown error'}\n\nCheck console for more details.`);
  }
});

document.getElementById('story-upload-close').addEventListener('click', closeStoryUploadModal);

// Click outside modal to close (on backdrop)
document.getElementById('story-upload-modal').addEventListener('click', function(e) {
  if (e.target === this) closeStoryUploadModal();
});

function closeStoryUploadModal() {
  const modal = document.getElementById('story-upload-modal');
  if (modal) modal.style.display = 'none';
  // Reset content to prevent stale data
  const container = document.getElementById('story-upload-content');
  if (container) {
    container.innerHTML = `<textarea id="story-text-input" placeholder="What's on your mind?" style="width:100%; height:120px; border-radius:10px; padding:1rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #555; resize:none; font-family:'Inter',sans-serif;"></textarea>`;
  }
  // Reset type selection to text
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

// expose open function globally
window.openStoryUploadModal = function() {
  const modal = document.getElementById('story-upload-modal');
  if (modal) modal.style.display = 'flex';
};

// hook the bottom nav "Add" button (ID: createStoryBtn)
document.addEventListener('DOMContentLoaded', function() {
  const addBtn = document.getElementById('createStoryBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof window.openStoryUploadModal === 'function') {
        window.openStoryUploadModal();
      }
    });
  }
});

// Start story cleanup on page load and every 5 minutes
if (typeof window.cleanupExpiredStories === 'function') {
  window.cleanupExpiredStories().catch(err => console.warn('Initial cleanup failed:', err));
  setInterval(() => {
    window.cleanupExpiredStories().catch(err => console.warn('Cleanup interval failed:', err));
  }, 300000); // 5 minutes
}

// ── Mobile nav toggle ────────────────────────
const sidebar = document.getElementById("sidebar");
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
  const notifiBells = document.querySelectorAll(".notification-bell");

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
      notifiBells.forEach((bell) => {
        bell.classList.add("invisible");
      });
    }
  }
  const upgradeLink = document.getElementById("upgradeLink");
  if (user && user.plan === "trial") {
    if (upgradeLink) upgradeLink.style.display = "flex";
    if (upgradeLink) upgradeLink.style.color = "var(--gold-light)";
  } else {
    if (upgradeLink) upgradeLink.style.display = "none";
  }
}
updateNavFromAuth();

// ── Unread Messages Badge ─────────────────────
async function updateMessagesBadge() {
    const badge = document.getElementById('messagesUnreadBadge');
    if (!badge) return;

    const user = JSON.parse(localStorage.getItem('reh_user') || '{}');
    if (!user.email) {
        badge.style.display = 'none';
        return;
    }

    try {
        // Sum unread counts from each chat document where user is participant
        const q = window.query(
            window.collection(window.db, "chats"),
            window.where("participants", "array-contains", user.email)
        );
        const snapshot = await window.getDocs(q);
        let totalUnread = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            totalUnread += data[`unread_${user.email}`] || 0;
        });

        if (totalUnread > 0) {
            badge.textContent = totalUnread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Error updating messages badge:', error);
        badge.style.display = 'none';
    }
}

//run only when firebase is ready
function waitForFirebaseForBadge(cb) {
    if (window.db && window.collection && window.query && window.where && window.getDocs && window.arrayContains) {
        cb();
    } else {
        let tries = 0;
        const timer = setInterval(() => {
            if (window.db && window.collection && window.query && window.where && window.getDocs) {
                clearInterval(timer);
                cb();
            }
            if (++tries > 100) {
                clearInterval(timer);
                console.error('Firebase not ready for badge');
            }
        }, 100);
    }
}

waitForFirebaseForBadge(updateMessagesBadge);

// Update when auth state changes
window.addEventListener('storage', (e) => {
    if (e.key === 'reh_user') {
        updateMessagesBadge();
    }
});

// avater and logout logic
const navProfile = document.getElementById("profileArea");
const dropdownMenu = document.getElementById("dropdownMenu");
if (navProfile && dropdownMenu) {
  navProfile.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });
  document.addEventListener("click", () => {
    dropdownMenu.classList.remove("show");
  });
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  window.logoutUser();
});

document.getElementById('sidebarLogoutBtn')?.addEventListener('click', () => {
  window.logoutUser();
});

const footerContainer = document.querySelector("footer");
footerContainer.innerHTML = `<div class="footer-grid">
    <!-- About -->
    <div class="footer-col">
        <h4>About Reh</h4>
        <p>Reh is the world’s most exclusive dating circle — where extraordinary hearts find home. Curated connections,
            luxury events, and a 24/7 concierge make every encounter a masterpiece.</p>
        <div class="footer-social">
            <a href="https://www.instagram.com/rehcrown?igsi=ZGRyeGc2NnB3azcz"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://vm.tiktok.com/ZS9BhLYLd2Jtc-uQBvC"><i class="fa-brands fa-tiktok"></i></a>
            <a href="https://x.com/Rehhcxm"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="https://youtube.com/@rehcrown?si=cmEBpwkYZNfYYl9k"><i class="fa-brands fa-youtube"></i></a>
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
            <li><a href="#" data-footer="terms">Terms of Service</a></li>
            <li><a href="#" data-footer="cookies">Cookie Policy</a></li>
            <li><a href="#" data-footer="gdpr">GDPR Compliance</a></li>
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
document.body.insertAdjacentHTML("beforeend", modalHTML);

// ── Footer modal logic ──────────────────────
const footerModal = document.getElementById("footerModal");
const footerModalTitle = document.getElementById("footerModalTitle");
const footerModalBody = document.getElementById("footerModalBody");
const footerModalClose = document.getElementById("footerModalClose");

function openFooterModal(title, bodyHTML) {
  footerModalTitle.textContent = title;
  footerModalBody.innerHTML = bodyHTML;
  footerModal.classList.add("active");
}

footerModalClose.addEventListener("click", () =>
  footerModal.classList.remove("active"),
);
footerModal.addEventListener("click", (e) => {
  if (e.target === footerModal) footerModal.classList.remove("active");
});

// Content for each link
const modalContent = {
  help: {
    title: "Help Centre",
    body: `<p>Welcome to Reh Support. Here are some quick guides:</p>
           <ul>
             <li><strong>Getting Started:</strong> Complete your profile and browse Discover.</li>
             <li><strong>Matches:</strong> Use the search and filters to find extraordinary people.</li>
             <li><strong>Events:</strong> Request invitations to exclusive gatherings.</li>
             <li><strong>Concierge:</strong> Chat with our team for personalised help.</li>
           </ul>
           <p>For immediate assistance, contact <a href="mailto:support@reh.com" style="color:var(--gold);">support@reh.com</a>.</p>`,
  },
  safety: {
    title: "Safety Tips",
    body: `<p>Your safety is paramount. Follow these guidelines:</p>
           <ul>
             <li>Keep personal information private until trust is established.</li>
             <li>Always meet in public, luxury venues.</li>
             <li>Report suspicious behaviour immediately.</li>
             <li>Use our block feature to stop unwanted contact.</li>
           </ul>
           <p>Reh is committed to creating a secure environment for all members.</p>`,
  },
  community: {
    title: "Community Guidelines",
    body: `<p>Reh is built on respect and elegance:</p>
           <ul>
             <li>Treat others with kindness and courtesy.</li>
             <li>No harassment, hate speech, or inappropriate content.</li>
             <li>Profiles must be genuine and accurate.</li>
             <li>Violations may result in suspension or permanent ban.</li>
           </ul>
           <p>Together we maintain a sanctuary for genuine connections.</p>`,
  },
  contact: {
    title: "Contact Concierge",
    body: `<p>Our concierge team is available 24/7 to assist you with anything from date planning to technical support.</p>
           <p>Email: <a href="mailto:concierge@reh.com" style="color:var(--gold);">concierge@reh.com</a></p>`,
  },
  report: {
    title: "Report a Profile",
    body: `<p>If you encounter a profile that violates our guidelines, please let us know.</p>
           <input type="email" id="reportEmail" placeholder="Profile email to report" required>
           <textarea id="reportReason" rows="3" placeholder="Reason for report"></textarea>
           <button id="submitReportBtn">Submit Report</button>`,
  },
  terms: {
  title: "Terms of Service",
  body: `<h4>Effective Date: January 1, 2026</h4>
         <p>Welcome to <strong>Reh</strong>. By accessing or using our website, mobile application, or any related services (collectively, the “Service”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, you may not use the Service.</p>
         <h5>1. Eligibility</h5>
         <p>You must be at least 18 years old to use Reh. By creating an account, you represent and warrant that you meet this age requirement.</p>
         <h5>2. Account Responsibilities</h5>
         <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.</p>
         <h5>3. User Conduct</h5>
         <p>You agree not to:</p>
         <ul>
           <li>Harass, abuse, or harm other users</li>
           <li>Post false, misleading, or fraudulent content</li>
           <li>Impersonate any person or entity</li>
           <li>Use the Service for any illegal purpose</li>
           <li>Scrape or collect data from the Service without permission</li>
         </ul>
         <h5>4. Premium Memberships & Payments</h5>
         <p>Certain features require a paid subscription. Fees are non‑refundable except as required by law. Reh reserves the right to change subscription fees upon reasonable notice.</p>
         <h5>5. Privacy</h5>
         <p>Your privacy is important to us. Please review our <a href="#" data-footer="privacy">Privacy Policy</a> and <a href="#" data-footer="cookies">Cookie Policy</a>.</p>
         <h5>6. Termination</h5>
         <p>We may suspend or terminate your account at any time, with or without cause, and without prior notice. Upon termination, your right to use the Service will immediately cease.</p>
         <h5>7. Disclaimers & Limitation of Liability</h5>
         <p>Reh is provided “as is” without warranties of any kind. To the fullest extent permitted by law, Reh shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.</p>
         <h5>8. Changes to Terms</h5>
         <p>We may modify these Terms at any time. We will notify you of material changes via email or through the Service. Your continued use after the effective date constitutes acceptance of the new Terms.</p>
         <h5>9. Contact</h5>
         <p>For questions about these Terms, contact <a href="mailto:legal@reh.com" style="color:var(--gold);">legal@reh.com</a>.</p>`
},
cookies: {
  title: "Cookie Policy",
  body: `<h4>Last updated: January 1, 2026</h4>
         <p>This Cookie Policy explains how Reh uses cookies and similar technologies to recognise you when you visit our website.</p>
         <h5>What are cookies?</h5>
         <p>Cookies are small data files that are placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information.</p>
         <h5>How we use cookies</h5>
         <p>We use cookies for the following purposes:</p>
         <ul>
           <li><strong>Essential cookies:</strong> Necessary for the operation of the Service (e.g., keeping you logged in).</li>
           <li><strong>Analytical/performance cookies:</strong> Allow us to recognise and count the number of visitors and see how visitors move around the site (Google Analytics).</li>
           <li><strong>Functionality cookies:</strong> Used to recognise you when you return to our site.</li>
         </ul>
         <h5>Third‑party cookies</h5>
         <p>Some cookies may be set by third parties (e.g., Google Analytics) to provide measurement services.</p>
         <h5>Your choices</h5>
         <p>You can block cookies by activating the setting on your browser that allows you to refuse the setting of all or some cookies. However, if you block essential cookies, you may not be able to access all or parts of the Service.</p>
         <h5>More information</h5>
         <p>If you have any questions about our use of cookies, please contact <a href="mailto:privacy@reh.com" style="color:var(--gold);">privacy@reh.com</a>.</p>`
},
gdpr: {
  title: "GDPR Compliance",
  body: `<h4>Your Rights under the General Data Protection Regulation (GDPR)</h4>
         <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Reh is the data controller of your personal information.</p>
         <h5>Your GDPR Rights</h5>
         <ul>
           <li><strong>Right to Access:</strong> You can request copies of your personal data.</li>
           <li><strong>Right to Rectification:</strong> You can request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
           <li><strong>Right to Erasure:</strong> You can request that we erase your personal data, under certain conditions.</li>
           <li><strong>Right to Restrict Processing:</strong> You can request that we restrict the processing of your personal data.</li>
           <li><strong>Right to Object to Processing:</strong> You can object to our processing of your personal data.</li>
           <li><strong>Right to Data Portability:</strong> You can request that we transfer the data we have collected to another organisation, or directly to you.</li>
         </ul>
         <h5>Lawful Basis for Processing</h5>
         <p>We process your personal data based on your consent, the performance of a contract, compliance with legal obligations, and/or our legitimate interests.</p>
         <h5>Data Retention</h5>
         <p>We will retain your personal data only for as long as is necessary for the purposes set out in our Privacy Policy.</p>
         <h5>Contact & Complaints</h5>
         <p>To exercise any of these rights, please contact our Data Protection Officer at <a href="mailto:dpo@reh.com" style="color:var(--gold);">dpo@reh.com</a>. You also have the right to lodge a complaint with your local supervisory authority.</p>`
}
};

// Attach click handlers to footer links with data-page attributes
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-footer]");
  if (!link) return;
  e.preventDefault();
  const page = link.getAttribute("data-footer");

if (page === "report") {
  openFooterModal("Report a Profile", modalContent.report.body);
  // Bind the report submission after modal opens
  setTimeout(() => {
    const submitBtn = document.getElementById("submitReportBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        const email = document.getElementById("reportEmail").value.trim();
        const reason = document.getElementById("reportReason").value.trim();
        if (!email) {
          showToast("Please enter the profile email.");
          return;
        }
        const currentUser = JSON.parse(localStorage.getItem("reh_user") || "{}");
        try {
          // Ensure Firebase is available (it should be by now)
          if (!window.db || !window.collection || !window.addDoc) {
            showToast("Service unavailable. Please try again later.");
            return;
          }
          await window.addDoc(window.collection(window.db, "reports"), {
            reported: email,
            reason,
            reporter: currentUser.email || "anonymous",
            reporterName: (currentUser.firstName + " " + currentUser.lastName).trim() || "Unknown",
            timestamp: window.serverTimestamp ? window.serverTimestamp() : new Date(),
            status: "new"   // new, reviewed, resolved
          });
          showToast("Report submitted. Thank you for helping keep Reh safe.");
          footerModal.classList.remove("active");
          // Clear the form fields
          document.getElementById("reportEmail").value = "";
          document.getElementById("reportReason").value = "";
        } catch (error) {
          console.error("Error submitting report:", error);
          showToast("Failed to submit report. Please try again.");
        }
      });
    }
  }, 100);
} else if (modalContent[page]) {
    openFooterModal(modalContent[page].title, modalContent[page].body);
  }
});

// ── Automatically set active class based on current page ──
(function setActiveNavLink() {
  const path = window.location.pathname.split("/").pop(); // e.g., 'discover.html'
  let activePage = "discover"; // default

  if (path === "elite.html") activePage = "elite";
  else if (path === "events.html") activePage = "events";
  else if (path === "concierge.html") activePage = "concierge";
  else if (path === "index.html") activePage = "discover"; // fallback
  // add other pages as needed

  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === activePage);
  });
})();

// Bottom nav active state
const path = window.location.pathname.split('/').pop() || 'index.html';
const currentPage = path.replace('.html', '') || 'home';
document.querySelectorAll('.bottom-nav-item').forEach(link => {
    link.classList.toggle('active', link.dataset.page === currentPage);
});

// Plan eligibility checker
function isEligible(minimumPlan) {
  const user = JSON.parse(localStorage.getItem("reh_user") || "{}");
  const plan = user.plan || "trial";
  const planLevels = { trial: 0, "premium-monthly": 1, "elite-annual": 2 };
  const requiredLevel = planLevels[minimumPlan] || 0;
  const currentLevel = planLevels[plan] || 0;
  return currentLevel >= requiredLevel;
}

// ── Event Requests Tracker (global, Firestore) ──
(function initEventRequestsTracker() {
  // Wait for Firebase to be ready
  let attempts = 0;
  const maxAttempts = 50;
  const checkFirebase = setInterval(() => {
    if (
      window.db &&
      window.collection &&
      window.query &&
      window.where &&
      window.orderBy &&
      window.getDocs &&
      window.updateDoc
    ) {
      clearInterval(checkFirebase);
      startTracker();
    } else {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(checkFirebase);
        console.warn("Event requests tracker: Firebase not ready.");
      }
    }
  }, 100);

  function startTracker() {
    const SESSION_KEY = "reh_user";

    function getCurrentUser() {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    }

    async function updateRequestsBadge() {
      const user = getCurrentUser();
      const badge = document.getElementById("requestsBadge");
      if (!badge) return;

      if (!user || !user.email) {
        badge.style.display = "none";
        return;
      }

      try {
        const q = window.query(
          window.collection(window.db, "event_invitations"),
          window.where("userEmail", "==", user.email),
          window.where("status", "==", "pending"),
        );
        const snapshot = await window.getDocs(q);
        const count = snapshot.size;
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
      } catch (err) {
        console.error("Error updating requests badge:", err);
      }
    }

    async function renderRequestsDropdown() {
      const user = getCurrentUser();
      const list = document.getElementById("requestsList");
      if (!list) return;

      if (!user || !user.email) {
        list.innerHTML =
          '<p style="color:var(--text-muted); text-align:center; padding:1rem;">Log in to see your requests.</p>';
        return;
      }

      try {
        const q = window.query(
          window.collection(window.db, "event_invitations"),
          window.where("userEmail", "==", user.email),
          window.orderBy("timestamp", "desc"),
        );
        const snapshot = await window.getDocs(q);

        if (snapshot.empty) {
          list.innerHTML =
            '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No event requests yet.</p>';
          return;
        }

        const requests = [];
        snapshot.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));

        list.innerHTML = requests
          .map((r) => {
            const statusColor =
              r.status === "confirmed"
                ? "#2ecc71"
                : r.status === "declined"
                  ? "#e74c3c"
                  : "#f39c12";
            return `
          <div class="notif-item" style="opacity:${r.status === "declined" ? 0.6 : 1};">
            <div class="notif-title">${r.eventName}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${new Date(r.timestamp?.seconds ? r.timestamp.seconds * 1000 : r.timestamp).toLocaleString()}</div>
            <div style="font-size:0.75rem; margin-top:0.2rem; color:${statusColor}; font-weight:600;">${r.status}</div>
          </div>`;
          })
          .join("");
      } catch (err) {
        console.error("Error rendering requests dropdown:", err);
        list.innerHTML =
          '<p style="color:var(--danger); text-align:center; padding:1rem;">Failed to load requests.</p>';
      }
    }

    // Event listeners
    const requestsBell = document.getElementById("requestsBell");
    const requestsDropdown = document.getElementById("requestsDropdown");
    const refreshRequestsBtn = document.getElementById("refreshRequestsBtn");

    if (requestsBell) {
      requestsBell.addEventListener("click", (e) => {
        e.stopPropagation();
        if (requestsDropdown) {
          requestsDropdown.classList.toggle("show");
          if (requestsDropdown.classList.contains("show")) {
            renderRequestsDropdown();
          }
        }
      });
    }

    if (refreshRequestsBtn) {
      refreshRequestsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        updateRequestsBadge();
        renderRequestsDropdown();
      });
    }

    document.addEventListener("click", () => {
      if (requestsDropdown) {
        requestsDropdown.classList.remove("show");
      }
    });

    // Update on storage change (if user logs in/out)
    window.addEventListener("storage", (e) => {
      if (e.key === SESSION_KEY) {
        updateRequestsBadge();
        if (requestsDropdown && requestsDropdown.classList.contains("show")) {
          renderRequestsDropdown();
        }
      }
    });

    // Initial badge update
    updateRequestsBadge();
  }
})();


// ── Presence Heartbeat (Firestore) ─────────────────
let presenceInterval = null;

function startPresenceHeartbeat(email) {
  if (!email || !window.db) return;
  // Clear any existing interval to avoid duplicates
  if (presenceInterval) clearInterval(presenceInterval);

  // Update immediately, then every 15 seconds
  const update = async () => {
    try {
      await window.updateDoc(window.doc(window.db, "users", email), {
        lastActive: window.serverTimestamp ? window.serverTimestamp() : new Date()
      });
    } catch (e) {
      // Silently fail – presence is not critical
    }
  };
  update(); // first update now
  presenceInterval = setInterval(update, 15000);

  // Optional: set a final update before the user leaves the page
  window.addEventListener('beforeunload', update, { once: true });
}

function stopPresenceHeartbeat() {
  if (presenceInterval) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
}

// Automatically start/stop when the user session changes
window.addEventListener('storage', (e) => {
  if (e.key === 'reh_user') {
    const user = JSON.parse(localStorage.getItem('reh_user') || '{}');
    if (user.email) {
      startPresenceHeartbeat(user.email);
    } else {
      stopPresenceHeartbeat();
    }
  }
});

// Start now if user already logged in (general.js loads after the session is set)
(function () {
  const user = JSON.parse(localStorage.getItem('reh_user') || '{}');
  if (user.email) {
    startPresenceHeartbeat(user.email);
  }
})();

// load service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

let deferredPrompt;

const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.add('show');   // make visible
});

document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'installBtn' && deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installBtn.classList.remove('show');   // hide again
    }
});