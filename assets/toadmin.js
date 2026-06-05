// ── Firebase readiness helper ─────────────────
function waitForFirebase(callback) {
    if (window.db && window.collection && window.query && window.where && window.onSnapshot && window.orderBy && window.updateDoc && window.arrayUnion) {
        callback();
    } else {
        let attempts = 0;
        const check = setInterval(() => {
            if (window.db && window.collection && window.query && window.where && window.onSnapshot && window.orderBy && window.updateDoc && window.arrayUnion) {
                clearInterval(check);
                callback();
            }
            attempts++;
            if (attempts > 50) {
                clearInterval(check);
                console.error('Firebase not ready for notifications');
            }
        }, 100);
    }
}

// ── Start app after Firebase is ready ─────────
waitForFirebase(startNotificationSystem);

function startNotificationSystem() {

    // ── Audio context (for notification sounds) ──
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }
    document.addEventListener("click", () => getAudioContext(), { once: true });

    const USER_KEY = "reh_user";
    const session = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    let currentUserEmail = session.email || null;

    // ── Toast (global function) ─────────────────
    window.showToast = function(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        const toastMsg = document.getElementById('toastMsg') || toast;
        if (toastTimer) clearTimeout(toastTimer);
        if (toastMsg.tagName === 'SPAN') {
            toastMsg.textContent = msg;
        } else {
            toast.textContent = msg;
        }
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    };

    let toastTimer;

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
        } catch (e) { /* ignore */ }
    }

    function showNotificationPopup(notification) {
        const msg = `${notification.title}: ${notification.body}`;
        window.showToast(msg.substring(0, 100) + (msg.length > 100 ? "…" : ""));
    }

    // ── Firestore collection reference ─────────
    const notifCollection = window.collection(window.db, "notifications");

    // ── Cache of previously seen IDs ──────────
    let previousNotifIds = [];

    // ── Real‑time listener ─────────────────────
    let unsubscribe = null;

    function startListener() {
        if (!currentUserEmail) return;

        // Query: global notifications (targetEmail == null) + personal ones for this user
        // We cannot do "targetEmail == null OR targetEmail == currentUserEmail" in Firestore without a composite index,
        // so we'll listen to the whole collection and filter client‑side (acceptable for small scale).
        // For production, you'd create a composite index or use two queries. Here we keep it simple.
        const q = window.query(notifCollection, window.orderBy("timestamp", "desc"), window.limit(50));

        unsubscribe = window.onSnapshot(q, (snapshot) => {
            const allNotifications = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Only keep notifications meant for this user (global or targeted)
                if (!data.targetEmail || data.targetEmail === currentUserEmail) {
                    allNotifications.push({
                        id: doc.id,
                        ...data
                    });
                }
            });

            // Check for new notifications (not in previous list)
            if (previousNotifIds.length > 0) {
                const newNotifs = allNotifications.filter(n => !previousNotifIds.includes(n.id));
                if (newNotifs.length > 0) {
                    const user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
                    newNotifs.forEach(notif => {
                        if (user.notifPopup !== false) showNotificationPopup(notif);
                        if (user.notifSound !== false) playNotificationSound();
                    });
                }
            }

            // Update cache
            previousNotifIds = allNotifications.map(n => n.id);

            // Update UI
            updateBellUI(allNotifications);
            renderNotificationDropdown(allNotifications);
        });
    }

    // ── Mark a single notification as read ─────
    async function markAsRead(notifId) {
        if (!currentUserEmail) return;
        try {
            await window.updateDoc(window.doc(window.db, "notifications", notifId), {
                readBy: window.arrayUnion(currentUserEmail)
            });
        } catch (err) {
            console.error('Error marking read:', err);
        }
    }

    // ── Mark all visible notifications as read ──
    async function markAllAsRead() {
        if (!currentUserEmail) return;
        // get the current snapshot (cheap from listener cache)
        const q = window.query(notifCollection, window.where("readBy", "not-in", [[currentUserEmail]]));
        const snapshot = await window.getDocs(q);
        const batch = window.writeBatch(window.db);
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.targetEmail || data.targetEmail === currentUserEmail) {
                batch.update(doc.ref, {
                    readBy: window.arrayUnion(currentUserEmail)
                });
            }
        });
        await batch.commit();
    }

    // ── Bell UI helpers ─────────────────────────
    function getUnreadCount(notifications) {
        return notifications.filter(n => !n.readBy || !n.readBy.includes(currentUserEmail)).length;
    }

    function updateBellUI(notifications) {
        const badge = document.getElementById("notificationBadge");
        const mobileBadge = document.getElementById("mobileNotificationBadge");
        if (!badge || !mobileBadge) return;
        const unread = getUnreadCount(notifications);
        badge.textContent = unread;
        mobileBadge.textContent = unread;
        badge.style.display = unread > 0 ? "flex" : "none";
        mobileBadge.style.display = unread > 0 ? "flex" : "none";
    }

    function renderNotificationDropdown(notifications) {
        const list = document.getElementById("notifList");
        const mobileList = document.getElementById("mobileNotifList");
        if (!list || !mobileList) return;

        if (notifications.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No notifications</p>';
            mobileList.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem;">No notifications</p>';
            return;
        }

        // Sort newest first (listener already ordered desc, but we keep it safe)
        const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

        const render = sorted.map(n => {
            const isRead = n.readBy && n.readBy.includes(currentUserEmail);
            return `
                <div class="notif-item" style="opacity:${isRead ? 0.6 : 1};">
                    <div class="notif-title">${n.title}</div>
                    <div>${n.body}</div>
                    <div class="notif-time">${new Date(n.timestamp?.seconds ? n.timestamp.seconds * 1000 : n.timestamp).toLocaleString()}</div>
                    ${!isRead ? `<button class="mark-read" data-id="${n.id}">Mark read</button>` : ""}
                </div>
            `;
        }).join('');

        list.innerHTML = render;
        mobileList.innerHTML = render;

        // Attach mark-read handlers
        document.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                markAsRead(id);
            });
        });
    }

    // ── Event listeners ─────────────────────────
    // Mark all as read button
    const markAllReadBtn = document.getElementById("markAllReadBtn");
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener("click", markAllAsRead);
    }

    // Bell click toggle
    const notificationBell = document.getElementById("notificationBell");
    if (notificationBell) {
        notificationBell.addEventListener("click", (e) => {
            e.stopPropagation();
            document.getElementById("notifDropdown").classList.toggle("show");
            // refresh the dropdown with current data (listener will automatically update)
        });
    }

    const mobileNotificationBell = document.getElementById("mobileNotificationBell");
    if (mobileNotificationBell) {
        mobileNotificationBell.addEventListener("click", (e) => {
            e.stopPropagation();
            document.getElementById("mobileNotifDropdown").classList.toggle("show");
        });
    }

    document.addEventListener("click", () => {
        document.getElementById("notifDropdown")?.classList.remove("show");
        document.getElementById("mobileNotifDropdown")?.classList.remove("show");
    });

    // If user logs out / in (USER_KEY changes), we restart the listener
    window.addEventListener("storage", (e) => {
        if (e.key === USER_KEY) {
            const newUser = JSON.parse(e.newValue || '{}');
            if (newUser.email !== currentUserEmail) {
                currentUserEmail = newUser.email || null;
                // Stop old listener and start new one
                if (unsubscribe) unsubscribe();
                startListener();
            }
        }
    });

    // ── Initial start ───────────────────────────
    startListener();

    // ── Newsletter subscription (unchanged) ────
    async function subscribeToNewsletter(email) {
  if (!email) {
    showToast('🌸 Please enter a valid email.');
    return;
  }
  try {
    // Check if already subscribed (optional – you can let Firestore handle duplicates)
    const existing = await window.getDocs(
      window.query(
        window.collection(window.db, "newsletter_subscribers"),
        window.where("email", "==", email.toLowerCase().trim())
      )
    );
    if (!existing.empty) {
      showToast('📧 You are already subscribed!');
      return;
    }

    // Save to Firestore
    await window.setDoc(
      window.doc(window.db, "newsletter_subscribers", email.toLowerCase().trim()),
      {
        email: email.toLowerCase().trim(),
        subscribedAt: window.serverTimestamp ? window.serverTimestamp() : new Date()
      }
    );

    showToast('📧 Subscribed! You’ll receive exclusive news.');
    // Clear the input field
    const input = document.getElementById('newsletterEmail');
    if (input) input.value = '';
  } catch (error) {
    console.error('Subscription error:', error);
    showToast('Subscription failed. Please try again.');
  }
}

// Bind to button click (replace old event listener)
document.getElementById('subscribeBtn')?.addEventListener('click', () => {
  const email = document.getElementById('newsletterEmail')?.value.trim();
  subscribeToNewsletter(email);
});

    // const subscribeBtn = document.getElementById("subscribeBtn");
    // if (subscribeBtn) {
    //     subscribeBtn.addEventListener("click", subscribe);
    // }
    const newsletterInput = document.getElementById("newsletterEmail");
    if (newsletterInput) {
        newsletterInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") subscribe();
        });
    }
}