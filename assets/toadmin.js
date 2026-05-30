// const USER_KEY = "reh_user";
const session = JSON.parse(localStorage.getItem("reh_user") || "{}");
let toastTimer;

function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // still silently ignore if audio is completely unavailable
  }
}

function showNotificationPopup(notification) {
  const msg = `${notification.title}: ${notification.body}`;
  // Limit length
  showToast(msg.substring(0, 100) + (msg.length > 100 ? "…" : ""));
}

// Notification globals
const NOTIF_KEY = "ss_global_notifications"; // shared notifications
let currentUserEmail = null; // set after checking auth
let readNotifIds = []; // IDs of read notifications

// Set current user email from auth
(function () {
  const user = JSON.parse(localStorage.getItem(USER_KEY));
  if (user) {
    currentUserEmail = user.email;
    loadReadStatus();
  }
})();

function loadReadStatus() {
  if (!currentUserEmail) return;
  const key = `ss_notifications_read_${currentUserEmail}`;
  const stored = localStorage.getItem(key);
  readNotifIds = stored ? JSON.parse(stored) : [];
}

function saveReadStatus() {
  if (!currentUserEmail) return;
  const key = `ss_notifications_read_${currentUserEmail}`;
  localStorage.setItem(key, JSON.stringify(readNotifIds));
}

function getUnreadCount(notifications) {
  return notifications.filter((n) => !readNotifIds.includes(n.id)).length;
}

function updateBellUI() {
  const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
  const badge = document.getElementById("notificationBadge");
  const mobileBadge = document.getElementById("mobileNotificationBadge");
  const unread = getUnreadCount(notifications);
  badge.textContent = unread;
  mobileBadge.textContent = unread;
  badge.style.display = unread > 0 ? "flex" : "none";
  mobileBadge.style.display = unread > 0 ? "flex" : "none";
}

function renderNotificationDropdown() {
  const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
  const list = document.getElementById("notifList");
  const mobileList = document.getElementById("mobileNotifList");
  if (notifications.length === 0) {
    list.innerHTML =
      '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No notifications</p>';
    mobileList.innerHTML =
      '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No notifications</p>';
    return;
  }
  // Sort newest first
  notifications.sort((a, b) => b.timestamp - a.timestamp);
  list.innerHTML = notifications
    .map((n) => {
      const isRead = readNotifIds.includes(n.id);
      return `
            <div class="notif-item" style="opacity:${isRead ? 0.6 : 1};">
                <div class="notif-title">${n.title}</div>
                <div>${n.body}</div>
                <div class="notif-time">${new Date(n.timestamp).toLocaleString()}</div>
                ${!isRead ? `<button class="mark-read" data-id="${n.id}">Mark read</button>` : ""}
            </div>
        `;
    })
    .join("");

  mobileList.innerHTML = notifications
    .map((n) => {
      const isRead = readNotifIds.includes(n.id);
      return `
            <div class="notif-item" style="opacity:${isRead ? 0.6 : 1};">
                <div class="notif-title">${n.title}</div>
                <div>${n.body}</div>
                <div class="notif-time">${new Date(n.timestamp).toLocaleString()}</div>
                ${!isRead ? `<button class="mark-read" data-id="${n.id}">Mark read</button>` : ""}
            </div>
        `;
    })
    .join("");

  // Attach mark-read handlers
  document.querySelectorAll(".mark-read").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!readNotifIds.includes(id)) {
        readNotifIds.push(id);
        saveReadStatus();
        updateBellUI();
        renderNotificationDropdown();
      }
    });
  });
}

// Mark all as read
document.getElementById("markAllReadBtn").addEventListener("click", () => {
  const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
  readNotifIds = notifications.map((n) => n.id);
  saveReadStatus();
  updateBellUI();
  renderNotificationDropdown();
});

// Bell click toggle dropdown
document.getElementById("notificationBell").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("notifDropdown").classList.toggle("show");
  renderNotificationDropdown(); // refresh when opened
});

// for mobile
document
  .getElementById("mobileNotificationBell")
  .addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("mobileNotifDropdown").classList.toggle("show");
    renderNotificationDropdown(); // refresh when opened
  });

document.addEventListener("click", () => {
  document.getElementById("notifDropdown").classList.remove("show");
  document.getElementById("mobileNotifDropdown").classList.remove("show");
});

// Initial load
updateBellUI();

// ── Clean storage listener for notifications ──
let lastNotifCount = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]").length;

window.addEventListener("storage", (e) => {
  if (e.key === NOTIF_KEY) {
    const newNotifications = JSON.parse(e.newValue || "[]");
    const newCount = newNotifications.length;
    if (newCount > lastNotifCount) {
      const newest = newNotifications[newNotifications.length - 1];
      const sessionUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
      if (
        newest &&
        (!newest.targetEmail || newest.targetEmail === currentUserEmail)
      ) {
        if (sessionUser.notifPopup !== false) {
          showNotificationPopup(newest);
        }
        if (sessionUser.notifSound !== false) {
          playNotificationSound();
        }
      }
    }
    lastNotifCount = newCount;
    updateBellUI();
    renderNotificationDropdown();
  }
  if (e.key === USER_KEY && currentUserEmail) {
    loadReadStatus();
    updateBellUI();
  }
});

// subscribe for newsletter
function subscribe() {
  const email = document.getElementById("newsletterEmail").value.trim();
  if (!email) {
    showToast("🌸 Please enter a valid email.");
    return;
  }

  // Save subscriber
  const SUBSCRIBERS_KEY = "reh_newsletter_subscribers";
  const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_KEY) || "[]");

  // Avoid duplicates
  if (subscribers.find((s) => s.email === email)) {
    showToast("📧 You are already subscribed!");
    document.getElementById("newsletterEmail").value = "";
    return;
  }

  subscribers.push({
    email: email,
    subscribedAt: new Date().toISOString(),
  });
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));

  showToast(
    "📧 Subscribed! The admin will keep you updated with exclusive news.",
  );
  document.getElementById("newsletterEmail").value = "";
}

document.getElementById("subscribeBtn").addEventListener("click", () => {
  subscribe();
});

// send on pressing enter
document.getElementById("newsletterEmail").addEventListener("keypress", (e) => {
  if (e.key === "Enter") subscribe();
});
