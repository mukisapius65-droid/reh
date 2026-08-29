// assets/modules/notifications.js
import { getCurrentUser } from '../utils.js';

async function updateMessagesBadge() {
  const badge = document.getElementById('messagesUnreadBadge');
  if (!badge) return;

  const user = getCurrentUser();
  if (!user || !user.email) {
    badge.style.display = 'none';
    return;
  }

  try {
    const q = window.query(
      window.collection(window.db, 'chats'),
      window.where('participants', 'array-contains', user.email)
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

async function updateRequestsBadge() {
  const user = getCurrentUser();
  const badge = document.getElementById('requestsBadge');
  if (!badge) return;

  if (!user || !user.email) {
    badge.style.display = 'none';
    return;
  }

  try {
    const q = window.query(
      window.collection(window.db, 'event_invitations'),
      window.where('userEmail', '==', user.email),
      window.where('status', '==', 'pending')
    );
    const snapshot = await window.getDocs(q);
    const count = snapshot.size;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  } catch (err) {
    console.error('Error updating requests badge:', err);
  }
}

async function renderRequestsDropdown() {
  const user = getCurrentUser();
  const list = document.getElementById('requestsList');
  if (!list) return;

  if (!user || !user.email) {
    list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem;">Log in to see your requests.</p>';
    return;
  }

  try {
    const q = window.query(
      window.collection(window.db, 'event_invitations'),
      window.where('userEmail', '==', user.email),
      window.orderBy('timestamp', 'desc')
    );
    const snapshot = await window.getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No event requests yet.</p>';
      return;
    }

    const requests = [];
    snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));

    list.innerHTML = requests.map(r => {
      const statusColor = r.status === 'confirmed' ? '#2ecc71' : r.status === 'declined' ? '#e74c3c' : '#f39c12';
      return `
        <div class="notif-item" style="opacity:${r.status === 'declined' ? 0.6 : 1};">
          <div class="notif-title">${r.eventName}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${new Date(r.timestamp?.seconds ? r.timestamp.seconds * 1000 : r.timestamp).toLocaleString()}</div>
          <div style="font-size:0.75rem; margin-top:0.2rem; color:${statusColor}; font-weight:600;">${r.status}</div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('Error rendering requests dropdown:', err);
    list.innerHTML = '<p style="color:var(--danger); text-align:center; padding:1rem;">Failed to load requests.</p>';
  }
}

export function initNotifications() {
  const notifBell = document.getElementById('notificationBell');
  if (notifBell) {
    notifBell.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdown = this.querySelector('.notif-dropdown');
      if (dropdown) dropdown.classList.toggle('show');
    });
  }

  const mobileNotifBell = document.getElementById('mobileNotificationBell');
  if (mobileNotifBell) {
    mobileNotifBell.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdown = this.querySelector('.mobile-notif-dropdown');
      if (dropdown) dropdown.classList.toggle('show');
    });
  }

  document.addEventListener('click', function() {
    document.querySelectorAll('.notif-dropdown, .mobile-notif-dropdown').forEach(d => d.classList.remove('show'));
  });

  const requestsBell = document.getElementById('requestsBell');
  const requestsDropdown = document.getElementById('requestsDropdown');
  if (requestsBell && requestsDropdown) {
    requestsBell.addEventListener('click', function(e) {
      e.stopPropagation();
      requestsDropdown.classList.toggle('show');
      if (requestsDropdown.classList.contains('show')) {
        renderRequestsDropdown();
      }
    });
    document.addEventListener('click', () => {
      requestsDropdown.classList.remove('show');
    });
  }

  const refreshBtn = document.getElementById('refreshRequestsBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      updateRequestsBadge();
      renderRequestsDropdown();
    });
  }

  function waitForFirebaseAndUpdate(cb) {
    if (window.db && window.collection && window.query && window.where && window.getDocs) {
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
          console.error('Firebase not ready for notifications');
        }
      }, 100);
    }
  }

  waitForFirebaseAndUpdate(() => {
    updateMessagesBadge();
    updateRequestsBadge();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'reh_user') {
      waitForFirebaseAndUpdate(() => {
        updateMessagesBadge();
        updateRequestsBadge();
        if (requestsDropdown && requestsDropdown.classList.contains('show')) {
          renderRequestsDropdown();
        }
      });
    }
  });
}