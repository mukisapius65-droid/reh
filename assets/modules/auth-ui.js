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

export function initAuthUI() {
  updateNavFromAuth();

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

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (typeof window.logoutUser === 'function') {
      window.logoutUser();
    }
  });

  document.getElementById('sidebarLogoutBtn')?.addEventListener('click', () => {
    if (typeof window.logoutUser === 'function') {
      window.logoutUser();
    }
  });
}