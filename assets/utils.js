// assets/utils.js
// ES module exporting common helpers for Reh.

/**
 * Get the currently logged‑in user from localStorage.
 * @returns {Object|null} The user object or null if not logged in.
 */
export function getCurrentUser() {
  const data = localStorage.getItem('reh_user');
  return data ? JSON.parse(data) : null;
}

/**
 * Show a toast message (if the toast element exists on the page).
 * @param {string} message - The message to display.
 */
export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const toastMsg = document.getElementById('toastMsg') || toast;
  if (toastTimer) clearTimeout(toastTimer);
  // ✅ Fixed: check toastMsg before .tagName access
  if (toastMsg && toastMsg.tagName === 'SPAN') {
    toastMsg.textContent = message;
  } else {
    toast.textContent = message;
  }
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
let toastTimer;

/**
 * Format a number with K/M suffix (e.g., 1.2K, 3.4M).
 * @param {number} num
 * @returns {string} Formatted string.
 */
export function formatCount(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

/**
 * Return a relative time string (e.g., "2h ago", "Just now").
 * @param {number|Date|FirestoreTimestamp} timestamp - Millisecond timestamp or Date/Firestore object.
 * @returns {string}
 */
export function timeAgo(timestamp) {
  let ms = timestamp;
  if (timestamp && typeof timestamp.toMillis === 'function') {
    ms = timestamp.toMillis();
  } else if (timestamp instanceof Date) {
    ms = timestamp.getTime();
  }
  if (!ms) return 'Just now';
  const seconds = Math.floor((Date.now() - ms) / 1000);
  let interval = seconds / 60;
  if (interval < 1) return 'Just now';
  if (interval < 60) return Math.floor(interval) + 'm ago';
  interval = interval / 60;
  if (interval < 24) return Math.floor(interval) + 'h ago';
  interval = interval / 24;
  return Math.floor(interval) + 'd ago';
}

/**
 * Check if a user is considered online (lastActive within 20 seconds).
 * @param {Object} user - User object with lastActive field (number or Firestore Timestamp).
 * @returns {boolean}
 */
export function isUserOnline(user) {
  if (!user || !user.lastActive) return false;
  let lastMs = user.lastActive;
  if (typeof lastMs === 'object' && typeof lastMs.toMillis === 'function') {
    lastMs = lastMs.toMillis();
  }
  return (Date.now() - lastMs) < 20000;
}

/**
 * Generate a deterministic conversation ID from two email addresses.
 * @param {string} email1
 * @param {string} email2
 * @returns {string} e.g., "alice@example.com_bob@example.com"
 */
export function getConversationId(email1, email2) {
  return [email1, email2].sort().join('_');
}

// ── Legacy window assignments (for pages not yet using ES modules) ──
if (typeof window !== 'undefined') {
  window.getCurrentUser = getCurrentUser;
  window.showToast = showToast;
  window.formatCount = formatCount;
  window.timeAgo = timeAgo;
  window.isUserOnline = isUserOnline;
  window.getConversationId = getConversationId;
}

// assets/utils.js – add after existing functions

/**
 * Check if a user is officially verified (Reh Crown or admin‑approved).
 * @param {Object} user - User object with officialVerified field.
 * @returns {boolean}
 */
export function isOfficial(user) {
  return !!(user && user.officialVerified === true);
}

// ── Add to window fallbacks ──
if (typeof window !== 'undefined') {
  window.isOfficial = isOfficial;
}