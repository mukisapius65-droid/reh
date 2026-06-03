// auth.js
const USERS_KEY = 'reh_users'
const AUTH_KEY = 'reh_user';
const SESSION_KEY = 'reh_user';

// Save user after login/signup
function loginUser(userData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  updateNavUI(userData);
}

// Clear user data
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  updateNavUI(null);
  window.location.href = '/login.html'; // redirect to login
}

// Get current user from storage
function getCurrentUser() {
  const stored = localStorage.getItem(AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Update navigation bar on any page
function updateNavUI(user) {
  const ctaButton = document.querySelector('.nav-cta');      // "Join the Circle" button
  const profileArea = document.getElementById('profileArea'); // Container for avatar (needs to be added to HTML)

  if (!ctaButton) return;

  if (user) {
    // Hide the CTA button
    ctaButton.style.display = 'none';
    // Show the avatar/dropdown area
    if (profileArea) {
      profileArea.style.display = 'flex';
      const avatarImg = profileArea.querySelector('.nav-avatar img');
      if (avatarImg) avatarImg.src = user.avatar || 'default-avatar.jpg';
      // Optionally set a user name somewhere if needed
    }
  } else {
    // Show CTA, hide avatar area
    ctaButton.style.display = '';
    if (profileArea) profileArea.style.display = 'none';
  }
}

// Initialize on every page
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  updateNavUI(user);

  // If there's a logout button, attach handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
});

// ── Real‑time Presence Heartbeat ──────────────────
let presenceInterval = null;
const PRESENCE_KEY = 'reh_presence';
const HEARTBEAT_INTERVAL = 120000; // 10 seconds

function updatePresence() {
    const user = JSON.parse(localStorage.getItem('reh_user') || '{}');
    if (!user || !user.email) {
        stopPresence();
        return;
    }

    // Read the current presence map
    let presence = {};
    try {
        presence = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
    } catch (e) {}

    // Update our own heartbeat timestamp
    presence[user.email] = Date.now();

    // Clean up stale entries (older than 25 seconds)
    const cutoff = Date.now() - 25000;
    Object.keys(presence).forEach(email => {
        if (presence[email] < cutoff) delete presence[email];
    });

    // Write back (triggers storage event in other tabs)
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
}

function startPresence() {
    stopPresence(); // clear any existing interval
    updatePresence(); // immediate first update
    presenceInterval = setInterval(updatePresence, HEARTBEAT_INTERVAL);

    // Remove presence when the user closes the tab
    window.addEventListener('beforeunload', stopPresence);
    // Also listen for online/offline events
    window.addEventListener('online', updatePresence);
    window.addEventListener('offline', stopPresence);
}

function stopPresence() {
    if (presenceInterval) clearInterval(presenceInterval);
    presenceInterval = null;

    // Remove our entry from presence map
    const user = JSON.parse(localStorage.getItem('reh_user') || '{}');
    if (user && user.email) {
        let presence = {};
        try {
            presence = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}');
        } catch (e) {}
        delete presence[user.email];
        localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
    }
}

// Start presence when the user is logged in
const currentUser = JSON.parse(localStorage.getItem('reh_user') || '{}');
if (currentUser && currentUser.email) {
    startPresence();
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
    const joinCta = document.getElementById('joinCta');
    const profileArea = document.getElementById('profileArea');
    const navAvatarImg = document.getElementById('navAvatarImg');
    if (!joinCta || !profileArea) return;
    if (user) {
        joinCta.style.display = 'none';
        profileArea.style.display = 'flex';
        if (navAvatarImg && user.avatar) navAvatarImg.src = user.avatar;
    } else {
        joinCta.style.display = '';
        profileArea.style.display = 'none';
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
    const currentUserArray = JSON.parse(localStorage.getItem('reh_users')).filter(u => u.email === session.email) || '[]';
    const currentUser = currentUserArray[0];
    currentUser.lastActive = Date.now();


    // Update session
    const newSession = { ...user, ...currentUser };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

    // Update master list (reh_users)
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = allUsers.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
       allUsers[userIndex] = { ...allUsers[userIndex], ...currentUser };
    } else {
        allUsers.push({ ...currentUser, email: user.email, id: user.id || Date.now().toString(36) });
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    localStorage.removeItem(USER_KEY);
}

const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
if (sidebarLogoutBtn) {
sidebarLogoutBtn.addEventListener("click", () => {
    resetPresence(); // Clear presence data for this user

    
    updateNavUI();
    showToast("🌸 You have been logged out.");
    document.getElementById('sidebarLogoutBtn').disabled = true;
    window.location.href = 'index.html?redirect=discover.html';
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