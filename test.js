 async function renderCards(filter = "all", searchTerm = "") {
    activeFilter = filter;
    const allUsers = await getUsers();
    const loggedUser = JSON.parse(localStorage.getItem(AUTH_KEY) || "{}");
    const currentUid = loggedUser?.email || null;

    // Get current user's blocked list (from session)
    const sessionUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    const myBlocked = sessionUser.blocked || [];

    // Build a set of users who have blocked the current user
    const blockedByOthers = allUsers
      .filter((u) => u.blocked && u.blocked.includes(currentUid))
      .map((u) => u.email);

    const displayUsers = allUsers.filter((u) => {
      if (u.banned || u.ppBanned) return false;
      if (u.visibility === false) return false;
      if (currentUid && u.email === currentUid) return false;
      if (myBlocked.includes(u.email)) return false; // I blocked them
      if (blockedByOthers.includes(u.email)) return false; // they blocked me
      return true;
    });

    allProfiles = displayUsers; // store for later filter changes

    // Apply the active filter
    let filtered = displayUsers;
    if (filter === "online") {
      const now = Date.now();
      filtered = displayUsers.filter((p) => {
        const ms = p.lastActive
          ? p.lastActive?.seconds
            ? p.lastActive.seconds * 1000
            : p.lastActive
          : 0;
        return now - ms < 120000;
      });
    } else if (filter === "premium") {
      filtered = displayUsers.filter(
        (p) => p.plan === "premium-monthly" || p.plan === "elite-annual",
      );
    } else if (filter === "verified") {
      filtered = displayUsers.filter((p) => p.plan === "elite-annual");
    } else if (filter === "new") {
      const oneWeekAgo = Date.now() - 604800000;
      filtered = displayUsers.filter((p) => {
        const joined = p.joined ? new Date(p.joined).getTime() : 0;
        return joined > oneWeekAgo;
      });
    } else if (filter === "nearby") {
      // For now, show all (you can add real location filtering later)
      // filtered remains all
    }

    // Search across multiple fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        return (
          (p.firstName && p.firstName.toLowerCase().includes(term)) ||
          (p.lastName && p.lastName.toLowerCase().includes(term)) ||
          (p.location && p.location.toLowerCase().includes(term)) ||
          (p.age && p.age.toString().includes(term)) ||
          (p.bio && p.bio.toLowerCase().includes(term)) ||
          (p.interests && p.interests.toLowerCase().includes(term)) ||
          (p.profession && p.profession.toLowerCase().includes(term))
        );
      });
    }

    const grid = document.getElementById("cardGrid");
    grid.innerHTML =
              '<div style="text-align:center;padding:3rem;color:var(--muted);"><i class="fa-solid fa-spinner fa-spin"></i> Summoning the extraordinary…</div>';
    if (filtered.length === 0) {
      grid.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);"><i class="fa-solid fa-users-slash"></i><p style="margin-top:1rem;">No profiles match this filter.</p></div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((u, i) => {
        const now = Date.now();
        const lastMs = u.lastActive?.seconds ? u.lastActive.seconds * 1000 : u.lastActive || 0;
        const online = (now - lastMs) < 20000;
        const statusText = online ? "Online" : getRelativeStatus(lastMs);   // ✅ pass a number
        const hideLastActive = u.showLastActive === false;   // false = hide
        const statusClass = online ? "online" : "offline";
        const phone = u.phone || "Private";
        const admirersCount = u.admirersCount || 0;
        return `
        <div class="profile-card" data-index="${i}" style="transition-delay:${i * 0.08}s">
            <div class="card-image-wrapper">
                <img class="card-image" src="${u.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}" alt="${u.firstName}" loading="lazy">
                <div class="status-badge"><span class="status-dot ${statusClass}"></span> ${statusText}</div>
                ${hasViewed(u.email) ? '<div class="viewed-badge" style="position:absolute; top:16px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); padding:4px 12px; border-radius:20px; font-size:0.7rem; color:var(--gold-light); display:flex; align-items:center; gap:4px;"><i class="fa-solid fa-eye"></i> Viewed</div>' : ''}
                 <!-- Interaction bar (TikTok style) -->
    <div class="card-interactions">
      <button class="interaction-btn admire-btn" data-target-email="${u.email || ''}">
        <i class="fa-heart ${hasAlreadyAdmired(u.email) ? 'fa-solid' : 'fa-regular'}"></i>
        <span class="admirer-count">${u.admirersCount || 0}</span>
      </button>
      <button class="interaction-btn bookmark-btn" data-target-email="${u.email || ''}">
        <i class="fa-bookmark ${bookmarkedEmails.has(u.email) ? 'fa-solid' : 'fa-regular'}"></i>
      </button>
    </div>
            </div>
                <div class="card-body">
                    <span class="card-age">${u.age || ""}</span>
                    <div class="card-name">${u.firstName} ${u.lastName}</div>
                    <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${u.location || "Unknown"}</div>
                    <!-- NEW distance line -->
                    ${
                      u.distance !== false
                        ? `
                    <div class="card-distance" data-location="${u.location || ""}">
                        <i class="fa-solid fa-route"></i> <span class="dist-text">— km</span>
                    </div>
                    `
                        : ""
                    }
                    <div class="card-phone" data-phone="${phone}"><i class="fa-solid fa-phone"></i> ${phone}</div>
                    
                </div>
            </div>
        </div>`;
      })
      .join("");

    document.querySelectorAll(".bookmark-icon").forEach((icon) => {
      icon.addEventListener("click", function (e) {
        e.stopPropagation();
        const email = this.getAttribute("data-target-email");
        toggleBookmark(email);
      });
    });

    // Re‑attach intersection observer and phone copy
    const cards = document.querySelectorAll(".profile-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("card-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    cards.forEach((card) => observer.observe(card));

    document.querySelectorAll(".card-phone").forEach((el) => {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        const phone = this.getAttribute("data-phone");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(phone)
            .then(() => showToast("📋 Phone number copied: " + phone));
        } else {
          const tempInput = document.createElement("input");
          tempInput.value = phone;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
          showToast("📋 Phone number copied: " + phone);
        }
        this.style.backgroundColor = "rgba(200,155,60,0.25)";
        setTimeout(() => {
          this.style.backgroundColor = "";
        }, 300);
      });
    });
    updateDistances();
    attachInteractionHandlers();

    document.querySelectorAll('.profile-card').forEach(card => {
  card.addEventListener('click', function(e) {
    if (e.target.closest('.interaction-btn') || e.target.closest('.card-phone')) return;
    const email = this.querySelector('.admire-btn')?.getAttribute('data-target-email');
    if (email) window.location.href = `view-profile.html?email=${email}`;
  });
});

    function isUserOnline(email) {
      // This is now handled per‑user by checking their lastActive field.
      // We don't need a separate lookup – the user object already contains lastActive.
      return false; // placeholder; we actually compute online status per user below
    }
  }