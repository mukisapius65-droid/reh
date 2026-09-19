// assets/auth.js
// Minimal after Firebase Auth migration.
// Presence heartbeat, nav updates, and logout modal are all handled by
// assets/modules/auth-ui.js via delegated events.
// This file provides: getCurrentUser window fallback + logoutUser.

// ── Window-scoped fallback for pages that don't import utils.js ──
if (typeof window.getCurrentUser !== 'function') {
  window.getCurrentUser = function () {
    const local = localStorage.getItem('reh_user');
    if (local) { try { return JSON.parse(local); } catch (e) {} }
    const session = sessionStorage.getItem('reh_user');
    if (session) { try { return JSON.parse(session); } catch (e) {} }
    return null;
  };
}

// ── Logout ────────────────────────────────────────
// Signs out of Firebase Auth first, then clears session storage, then redirects.
// NOTE: Do NOT attach a direct click listener to #logoutBtn here.
// auth-ui.js owns the logout modal flow via delegated events. Adding a
// direct listener here produces a modal-over-redirect flash.
window.logoutUser = async function () {
  try {
    if (window.auth && typeof window.signOut === 'function') {
      await window.signOut(window.auth);
    }
  } catch (e) {
    console.warn('[logout] signOut failed:', e);
  }

  if (typeof window.clearSession === 'function') {
    window.clearSession();
  } else {
    localStorage.removeItem('reh_user');
    sessionStorage.removeItem('reh_user');
  }

  sessionStorage.removeItem('reh_cache_users');
  sessionStorage.removeItem('reh_cache_users_ts');
  sessionStorage.removeItem('reh_cache_bookmarks');
  sessionStorage.removeItem('reh_cache_admirations');

  window.location.href = 'index.html?redirect=landing.html';
};