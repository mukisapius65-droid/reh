// auth.js
const USERS_KEY = "reh_users";
const AUTH_KEY = "reh_user";
const SESSION_KEY = "reh_user";

// ── Presence heartbeat interval reference ──
let presenceInterval = null;

// Save user after login/signup
function loginUser(userData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  updateNavUI(userData);
}

// Clear user data
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  updateNavUI(null);
  window.location.href = "/login.html"; // redirect to login
}

// Get current user from storage
function getCurrentUser() {
  const stored = localStorage.getItem(AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Update navigation bar on any page
function updateNavUI(user) {
  const ctaButton = document.querySelector(".nav-cta"); // "Join the Circle" button
  const profileArea = document.getElementById("profileArea"); // Container for avatar (needs to be added to HTML)

  if (!ctaButton) return;

  if (user) {
    // Hide the CTA button
    ctaButton.style.display = "none";
    // Show the avatar/dropdown area
    if (profileArea) {
      profileArea.style.display = "flex";
      const avatarImg = profileArea.querySelector(".nav-avatar img");
      if (avatarImg) avatarImg.src = user.avatar || "default-avatar.jpg";
      // Optionally set a user name somewhere if needed
    }
  } else {
    // Show CTA, hide avatar area
    ctaButton.style.display = "";
    if (profileArea) profileArea.style.display = "none";
  }
}

// Initialize on every page
document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  updateNavUI(user);

  // If there's a logout button, attach handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }
});

// ── Real‑time Presence Heartbeat ──────────────────
const PRESENCE_KEY = "reh_presence";
const HEARTBEAT_INTERVAL = 120000; // 10 seconds

function updatePresence() {
  const user = JSON.parse(localStorage.getItem("reh_user") || "{}");
  if (!user || !user.email) {
    stopPresence();
    return;
  }

  // Read the current presence map
  let presence = {};
  try {
    presence = JSON.parse(localStorage.getItem(PRESENCE_KEY) || "{}");
  } catch (e) {}

  // Update our own heartbeat timestamp
  presence[user.email] = Date.now();

  // Clean up stale entries (older than 25 seconds)
  const cutoff = Date.now() - 25000;
  Object.keys(presence).forEach((email) => {
    if (presence[email] < cutoff) delete presence[email];
  });

  // Write back (triggers storage event in other tabs)
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
}

// Also start when auth state changes (if your page uses updateNavFromAuth)
// You can call startPresence() after a successful login or registration.

// function getCurrentUser() {
//     const stored = localStorage.getItem(AUTH_KEY);
//     return stored ? JSON.parse(stored) : null;
// }

function loginUser(userData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  updateNavUI(userData);
}

function updateNavUI(user) {
  const joinCta = document.getElementById("joinCta");
  const profileArea = document.getElementById("profileArea");
  const navAvatarImg = document.getElementById("navAvatarImg");
  if (!joinCta || !profileArea) return;
  if (user) {
    joinCta.style.display = "none";
    profileArea.style.display = "flex";
    if (navAvatarImg && user.avatar) navAvatarImg.src = user.avatar;
  } else {
    joinCta.style.display = "";
    profileArea.style.display = "none";
  }
}

// Simple email existence check (simulated – in reality you'd query a server)
function isEmailRegistered(email) {
  const current = getCurrentUser();
  // In a real app you'd check against a database. Here we only have one user at a time,
  // so if the stored user's email matches, it's registered.
  return current && current.email === email;
}

// This function can be called on logout to clear presence data for the user
function resetPresence() {
  const user = JSON.parse(localStorage.getItem(USER_KEY));
  const currentUserArray =
    JSON.parse(localStorage.getItem("reh_users")).filter(
      (u) => u.email === session.email,
    ) || "[]";
  const currentUser = currentUserArray[0];
  currentUser.lastActive = Date.now();

  // Update session
  const newSession = { ...user, ...currentUser };
  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

  // Update master list (reh_users)
  const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const userIndex = allUsers.findIndex((u) => u.email === user.email);
  if (userIndex !== -1) {
    allUsers[userIndex] = { ...allUsers[userIndex], ...currentUser };
  } else {
    allUsers.push({
      ...currentUser,
      email: user.email,
      id: user.id || Date.now().toString(36),
    });
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
  localStorage.removeItem(USER_KEY);
}
/*
const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");
if (sidebarLogoutBtn) {
  sidebarLogoutBtn.addEventListener("click", () => {
    resetPresence(); // Clear presence data for this user

    updateNavUI();
    showToast("🌸 You have been logged out.");
    document.getElementById("sidebarLogoutBtn").disabled = true;
    window.location.href = "index.html?redirect=discover.html";
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    resetPresence(); // Clear presence data for this user

    updateNavFromAuth();
    showToast("🌸 You have been logged out.");
  });
}
*/

// ── Presence: heartbeat to Firestore ─────────────

function startPresence() {
  const user = JSON.parse(localStorage.getItem("reh_user") || "{}");
  if (!user.email) return;

  // Clear any old interval
  if (presenceInterval) clearInterval(presenceInterval);

  // Update Firestore and localStorage every 15 seconds
  presenceInterval = setInterval(async () => {
    const now = Date.now();

    // Update localStorage heartbeat (for cross‑tab quick check)
    const presence = JSON.parse(localStorage.getItem(PRESENCE_KEY) || "{}");
    presence[user.email] = now;
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));

    // Update Firestore lastActive
    try {
      if (window.db && window.updateDoc) {
        await window.updateDoc(window.doc(window.db, "users", user.email), {
          lastActive: now, // store as number for easy comparison
        });
      }
    } catch (e) {
      // Silently fail – the next heartbeat will retry
    }
  }, 15000); // every 15 seconds

  // Also fire an immediate update
  const now = Date.now();
  const presence = JSON.parse(localStorage.getItem(PRESENCE_KEY) || "{}");
  presence[user.email] = now;
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
}

function stopPresence() {
  if (presenceInterval) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
}

// ── Logout (exports to window for any page) ─────
window.logoutUser = async function () {
  const user = JSON.parse(localStorage.getItem("reh_user") || "{}");
  if (user.email) {
    // Set lastActive to 0 or an old timestamp to mark offline
    try {
      if (window.db && window.updateDoc) {
        await window.updateDoc(window.doc(window.db, "users", user.email), {
          lastActive: 0, // clearly offline
        });
      }
    } catch (e) {
      /* ignore */
    }

    // Update localStorage presence
    const presence = JSON.parse(localStorage.getItem(PRESENCE_KEY) || "{}");
    presence[user.email] = 0; // offline
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
  }

  // Clear session
  localStorage.removeItem("reh_user");
  stopPresence();
  // Clear all session caches used by the app
sessionStorage.removeItem('reh_cache_users');
sessionStorage.removeItem('reh_cache_users_ts');
sessionStorage.removeItem('reh_cache_bookmarks');
sessionStorage.removeItem('reh_cache_admirations');
  window.location.href = "index.html?redirect=landing.html";
};

// ── Before unload (tab close / navigate away) ──
window.addEventListener("beforeunload", () => {
  const user = JSON.parse(localStorage.getItem("reh_user") || "{}");
  if (user.email && window.db && window.updateDoc) {
    // Use sendBeacon or a synchronous XHR isn’t possible with Firestore,
    // so we use navigator.sendBeacon with a Firestore REST endpoint (optional).
    // For a simpler approach, set lastActive to a very old value via updateDoc
    // but that's async and may not complete. Instead, we'll rely on the heartbeat
    // stopping and the next user query filtering out stale entries.
    // However, we can set a flag in localStorage that the next page load clears.
    localStorage.setItem("reh_pending_offline", user.email);
  }
});

// On page load, check if there's a pending offline flag
(function () {
  const pending = localStorage.getItem("reh_pending_offline");
  if (pending && window.db && window.updateDoc) {
    // User previously closed the tab – mark offline
    window
      .updateDoc(window.doc(window.db, "users", pending), { lastActive: 0 })
      .catch(() => {});
    localStorage.removeItem("reh_pending_offline");
  }
})();

// ── Start presence automatically if logged in ──
(function () {
  const user = JSON.parse(localStorage.getItem("reh_user") || "{}");
  if (user.email) {
    startPresence();
  }
})();
