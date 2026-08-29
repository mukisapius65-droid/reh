// assets/modules/notifications.js
import { getCurrentUser } from '../utils.js';

// ─── Unread Messages Badge ─────────────────────
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

// ─── Event Requests Badge & Dropdown ──────────
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

// ─── Global Notifications Real‑time Listener ──
function startNotificationsListener() {
  if (!window.db || !window.onSnapshot) return;
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) return;

  const globalQuery = window.query(
    window.collection(window.db, 'notifications'),
    window.where('targetEmail', '==', null),
    window.orderBy('timestamp', 'desc'),
    window.limit(50)
  );
  const personalQuery = window.query(
    window.collection(window.db, 'notifications'),
    window.where('targetEmail', '==', currentUser.email),
    window.orderBy('timestamp', 'desc'),
    window.limit(50)
  );

  let globalDocs = [];
  let personalDocs = [];

  window.onSnapshot(globalQuery, (snap) => {
    globalDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    mergeAndUpdateNotifications();
  });
  window.onSnapshot(personalQuery, (snap) => {
    personalDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    mergeAndUpdateNotifications();
  });

  function mergeAndUpdateNotifications() {
    const all = [...globalDocs, ...personalDocs];
    all.sort((a, b) => {
      const aTime = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : a.timestamp || 0;
      const bTime = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : b.timestamp || 0;
      return bTime - aTime;
    });
    // Update badge
    const unread = all.filter(n => !n.readBy || !n.readBy.includes(currentUser.email)).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
    const mobileBadge = document.getElementById('mobileNotificationBadge');
    if (mobileBadge) {
      mobileBadge.textContent = unread;
      mobileBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
    // Render list if dropdown open
    const list = document.getElementById('notifList');
    if (list) {
      list.innerHTML = all.map(n => {
        const isRead = n.readBy && n.readBy.includes(currentUser.email);
        return `
          <div class="notif-item" style="opacity:${isRead ? 0.6 : 1};${n.senderEmail ? 'cursor:pointer;' : ''}" ${n.senderEmail ? `onclick="location.href='view-profile.html?email=${n.senderEmail}&chat=open'"` : ''}>
            <div class="notif-title">${n.title}</div>
            <div>${n.body}</div>
            <div class="notif-time">${new Date(n.timestamp?.seconds ? n.timestamp.seconds * 1000 : n.timestamp).toLocaleString()}</div>
            ${!isRead ? `<button class="mark-read" data-id="${n.id}" style="background:none;border:none;color:var(--gold-light);cursor:pointer;">Mark read</button>` : ''}
          </div>`;
      }).join('');
      // Bind mark read buttons
      document.querySelectorAll('.mark-read').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          try {
            await window.updateDoc(window.doc(window.db, 'notifications', id), {
              readBy: window.arrayUnion(currentUser.email)
            });
            // Refresh local
            const found = all.find(n => n.id === id);
            if (found) {
              if (!found.readBy) found.readBy = [];
              found.readBy.push(currentUser.email);
              mergeAndUpdateNotifications();
            }
          } catch (err) {
            console.error('Mark read error:', err);
          }
        });
      });
    }
  }
}

// ─── Mark all read ─────────────────────────────
async function markAllNotificationsRead() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) return;
  try {
    // Fetch all notifications and update each
    const q = window.query(
      window.collection(window.db, 'notifications'),
      window.where('readBy', 'array-contains', currentUser.email)
    );
    // Actually we need to update those that don't contain email. Simpler: fetch all notifs and update those missing email.
    const allSnap = await window.getDocs(window.collection(window.db, 'notifications'));
    allSnap.forEach(async (doc) => {
      const data = doc.data();
      if (!data.readBy || !data.readBy.includes(currentUser.email)) {
        await window.updateDoc(window.doc(window.db, 'notifications', doc.id), {
          readBy: window.arrayUnion(currentUser.email)
        });
      }
    });
  } catch (e) {
    console.error('Mark all read error:', e);
  }
}

export function initNotifications() {
  // ─── Delegated bell toggles ─────────────────────
  document.addEventListener('click', function(e) {
    const desktopBell = e.target.closest('#notificationBell');
    if (desktopBell) {
      e.stopPropagation();
      const dropdown = desktopBell.querySelector('.notif-dropdown');
      if (dropdown) dropdown.classList.toggle('show');
      return;
    }

    const mobileBell = e.target.closest('#mobileNotificationBell');
    if (mobileBell) {
      e.stopPropagation();
      const dropdown = mobileBell.querySelector('.mobile-notif-dropdown');
      if (dropdown) dropdown.classList.toggle('show');
      return;
    }

    const requestsBell = e.target.closest('#requestsBell');
    if (requestsBell) {
      e.stopPropagation();
      const dropdown = requestsBell.querySelector('#requestsDropdown');
      if (dropdown) {
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
          renderRequestsDropdown();
        }
      }
      return;
    }

    // Close all open dropdowns when clicking elsewhere
    document.querySelectorAll('.notif-dropdown.show, .mobile-notif-dropdown.show, #requestsDropdown.show')
      .forEach(d => d.classList.remove('show'));
  });

  // ─── Refresh button ────────────────────────────
  const refreshBtn = document.getElementById('refreshRequestsBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      updateRequestsBadge();
      renderRequestsDropdown();
    });
  }

  // ─── Mark all read button ─────────────────────
  document.addEventListener('click', function(e) {
    if (e.target.id === 'markAllReadBtn') {
      markAllNotificationsRead();
    }
    if (e.target.id === 'mobileMarkAllReadBtn') {
      markAllNotificationsRead();
    }
  });

  // ─── Start Firebase‑dependent updates ──────────
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
    startNotificationsListener();   // real‑time notifications
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'reh_user') {
      waitForFirebaseAndUpdate(() => {
        updateMessagesBadge();
        updateRequestsBadge();
        startNotificationsListener();   // restart listener with new user
        const dropdown = document.getElementById('requestsDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
          renderRequestsDropdown();
        }
      });
    }
  });
}