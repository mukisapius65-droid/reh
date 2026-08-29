// assets/modules/auth-ui.js
import { getCurrentUser } from '../utils.js';

let presenceInterval = null;

function updateNavFromAuth() {
  const user = getCurrentUser();
  const joinCta = document.getElementById('joinCta');
  const sidebarJoinCta = document.getElementById('sidebarJoinCta');
  const sidebarProfileLink = document.getElementById('sidebarProfileLink');
  const profileArea = document.getElementById('profileArea');
  const navAvatarImg = document.getElementById('navAvatarImg');
  const notifiBells = document.querySelectorAll('.notification-bell');

  if (user) {
    if (joinCta) joinCta.style.display = 'none';
    if (sidebarJoinCta) sidebarJoinCta.style.display = 'none';
    if (profileArea) profileArea.style.display = 'flex';
    if (sidebarProfileLink) sidebarProfileLink.style.display = '';
    if (navAvatarImg) navAvatarImg.src = user.avatar || 'https://randomuser.me/api/portraits/women/44.jpg';
  } else {
    if (joinCta) joinCta.style.display = '';
    if (sidebarJoinCta) sidebarJoinCta.style.display = '';
    if (profileArea) profileArea.style.display = 'none';
    if (sidebarProfileLink) sidebarProfileLink.style.display = 'none';
    notifiBells.forEach(bell => bell.classList.add('invisible'));
  }

  const upgradeLink = document.getElementById('upgradeLink');
  if (user && user.plan === 'trial') {
    if (upgradeLink) {
      upgradeLink.style.display = 'flex';
      upgradeLink.style.color = 'var(--gold-light)';
    }
  } else {
    if (upgradeLink) upgradeLink.style.display = 'none';
  }
}

function startPresenceHeartbeat(email) {
  if (!email || !window.db) return;
  if (presenceInterval) clearInterval(presenceInterval);

  const update = async () => {
    try {
      await window.updateDoc(window.doc(window.db, 'users', email), {
        lastActive: window.serverTimestamp ? window.serverTimestamp() : new Date()
      });
    } catch (e) { /* silent */ }
  };
  update();
  presenceInterval = setInterval(update, 15000);
  window.addEventListener('beforeunload', update, { once: true });
}

function stopPresenceHeartbeat() {
  if (presenceInterval) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
}

// ─── Logout Confirmation Modal ──────────────────
function createLogoutModal() {
  if (document.getElementById('logoutModal')) return;

  const modalHTML = `
  <div id="logoutModal" class="modal-overlay" style="display:none;">
    <div class="modal-content" style="max-width:420px; text-align:center;">
      <h3 style="font-family:'Playfair Display',serif; color:var(--gold-light); margin-bottom:1rem;">Log Out?</h3>
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">You can hide your profile instead of logging out — you'll stay invisible but can come back anytime.</p>
      <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
        <button id="logoutConfirmBtn" class="btn btn-primary" style="flex:1; min-width:100px;">Log Out</button>
        <button id="logoutHideBtn" class="btn" style="flex:1; min-width:100px; background:var(--gold); color:#080c24; border:none; padding:12px 20px; border-radius:50px; font-weight:600;">Hide My Account</button>
        <button id="logoutCancelBtn" class="btn btn-secondary" style="flex:1; min-width:80px;">Cancel</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const style = document.createElement('style');
  style.textContent = `
    #logoutModal .modal-content {
      background: rgba(15,20,50,0.95);
      border: 1px solid var(--gold);
      border-radius: 24px;
      padding: 2rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    }
    #logoutModal .btn-secondary {
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--text-secondary);
      padding: 12px 20px;
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
    }
    #logoutModal .btn-secondary:hover {
      border-color: white;
      color: white;
    }
  `;
  document.head.appendChild(style);
}

function showLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) modal.style.display = 'flex';
}

function hideLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) modal.style.display = 'none';
}

async function handleHideAccount() {
  const user = getCurrentUser();
  if (!user || !user.email) {
    hideLogoutModal();
    return;
  }
  try {
    await window.updateDoc(window.doc(window.db, 'users', user.email), {
      visibility: false
    });
    user.visibility = false;
    localStorage.setItem('reh_user', JSON.stringify(user));
    if (typeof window.showToast === 'function') {
      window.showToast('🙈 Profile hidden. You can unhide it from Settings.');
    } else {
      alert('Profile hidden. You can unhide it from Settings.');
    }
  } catch (err) {
    console.error('Hide account error:', err);
    if (typeof window.showToast === 'function') {
      window.showToast('Failed to hide profile.');
    }
  }
  hideLogoutModal();
}

export function initAuthUI() {
  updateNavFromAuth();
  createLogoutModal();

  // ─── Logout confirmation (delegated) ──────────
  document.addEventListener('click', function(e) {
    const logoutBtn = e.target.closest('#logoutBtn') || e.target.closest('#sidebarLogoutBtn');
    if (logoutBtn) {
      e.preventDefault();
      e.stopPropagation();
      showLogoutModal();
    }
  });

  // ─── Modal button handlers ────────────────────
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (target.id === 'logoutConfirmBtn') {
      e.preventDefault();
      hideLogoutModal();
      if (typeof window.logoutUser === 'function') {
        window.logoutUser();
      }
    }
    if (target.id === 'logoutHideBtn') {
      e.preventDefault();
      handleHideAccount();
    }
    if (target.id === 'logoutCancelBtn' || target.closest('#logoutModal') === target) {
      e.preventDefault();
      hideLogoutModal();
    }
  });

  // ─── Presence heartbeat ────────────────────────
  window.addEventListener('storage', (e) => {
    if (e.key === 'reh_user') {
      updateNavFromAuth();
      const user = getCurrentUser();
      if (user && user.email) {
        startPresenceHeartbeat(user.email);
      } else {
        stopPresenceHeartbeat();
      }
    }
  });

  const user = getCurrentUser();
  if (user && user.email) {
    startPresenceHeartbeat(user.email);
  }
}