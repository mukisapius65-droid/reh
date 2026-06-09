// ── SMART MATCHING HELPERS ──────────────────────

// Get random users for the "People You May Know" carousel
function getRandomPeople(allUsers, currentUser, count) {
  const others = allUsers.filter(u =>
    u.email !== currentUser?.email &&
    !u.banned &&
    u.visibility !== false
  );
  // Shuffle using Fisher-Yates
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, count);
}

// Smart matching based on current user's profile data
function getSmartMatches(allUsers, currentUser) {
  if (!currentUser || !currentUser.email) return [];

  const myGender = currentUser.gender || '';               // 'male', 'female', etc.
  const myInterestedIn = currentUser.interestedIn || 'all'; // 'men','women','all','other'
  const myAge = parseInt(currentUser.age, 10) || 30;
  const myLocation = (currentUser.location || '').toLowerCase();

  // 1. Filter by mutual compatibility
  const candidates = allUsers.filter(u => {
    if (u.email === currentUser.email) return false;
    if (u.banned || u.visibility === false) return false;

    const targetGender = u.gender || '';
    const targetInterestedIn = u.interestedIn || 'all';

    // Does the target want someone like me?
    const targetWantsMe =
      targetInterestedIn === 'all' ||
      (targetInterestedIn === 'men' && myGender === 'male') ||
      (targetInterestedIn === 'women' && myGender === 'female') ||
      (targetInterestedIn === 'other' && (myGender !== 'male' && myGender !== 'female'));

    // Do I want someone like the target?
    const iWantThem =
      myInterestedIn === 'all' ||
      (myInterestedIn === 'men' && targetGender === 'male') ||
      (myInterestedIn === 'women' && targetGender === 'female') ||
      (myInterestedIn === 'other' && (targetGender !== 'male' && targetGender !== 'female'));

    if (!targetWantsMe || !iWantThem) return false;

    // Age range (±5 years)
    const targetAge = parseInt(u.age, 10) || 30;
    if (Math.abs(myAge - targetAge) > 5) return false;

    // Optional: same city bonus (uncomment for stricter)
    // if (myLocation && u.location && !(u.location || '').toLowerCase().includes(myLocation)) return false;

    return true;
  });

  // 2. Score and sort (online + popularity)
  candidates.sort((a, b) => {
    const scoreA = (a.admirersCount || 0) + (isUserOnline(a.email) ? 10 : 0);
    const scoreB = (b.admirersCount || 0) + (isUserOnline(b.email) ? 10 : 0);
    return scoreB - scoreA;   // higher score first
  });

  return candidates;
}

// Render a single profile card (used for both daily matches and regular cards)
function renderSingleCard(u, index) {
  const now = Date.now();
  const lastMs = u.lastActive?.seconds ? u.lastActive.seconds * 1000 : u.lastActive || 0;
  const online = (now - lastMs) < 20000;
  const statusText = online ? "Online" : getRelativeStatus(lastMs);
  const statusClass = online ? "online" : "offline";
  const phone = u.phone || "Private";
  const viewedMark = hasViewed(u.email)
    ? `<div class="viewed-badge" style="position:absolute; top:16px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); padding:4px 12px; border-radius:20px; font-size:0.7rem; color:var(--gold-light); display:flex; align-items:center; gap:4px;"><i class="fa-solid fa-eye"></i> Viewed</div>`
    : '';

  return `
    <div class="profile-card" data-index="${index}" style="transition-delay:${index * 0.08}s">
      <div class="card-image-wrapper">
        <img class="card-image" src="${u.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}" alt="${u.firstName}" loading="lazy">
        <div class="status-badge"><span class="status-dot ${statusClass}"></span> ${statusText}</div>
        ${viewedMark}
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
        ${u.distance !== false ? `<div class="card-distance" data-location="${u.location || ""}"><i class="fa-solid fa-route"></i> <span class="dist-text">— km</span></div>` : ""}
        <div class="card-phone" data-phone="${phone}"><i class="fa-solid fa-phone"></i> ${phone}</div>
      </div>
    </div>`;
}

// ── MAIN RENDERING FUNCTION ───────────────────
async function renderCards(filter = "all", searchTerm = "") {
  activeFilter = filter;
  const allUsers = await getUsers();
  const sessionUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
  const currentUid = sessionUser?.email || null;
  const myBlocked = sessionUser.blocked || [];

  // Build blocked-by-others list
  const blockedByOthers = allUsers
    .filter((u) => u.blocked && u.blocked.includes(currentUid))
    .map((u) => u.email);

  // Apply visibility/bans/blocks
  const displayUsers = allUsers.filter((u) => {
    if (u.banned || u.ppBanned) return false;
    if (u.visibility === false) return false;
    if (currentUid && u.email === currentUid) return false;
    if (myBlocked.includes(u.email)) return false;
    if (blockedByOthers.includes(u.email)) return false;
    return true;
  });

  allProfiles = displayUsers; // keep for filters

  // Active filter logic (online, premium, etc.)
  let filtered = displayUsers;
  if (filter === "online") {
    const now = Date.now();
    filtered = displayUsers.filter((p) => {
      const ms = p.lastActive?.seconds ? p.lastActive.seconds * 1000 : p.lastActive || 0;
      return now - ms < 120000;
    });
  } else if (filter === "premium") {
    filtered = displayUsers.filter((p) => p.plan === "premium-monthly" || p.plan === "elite-annual");
  } else if (filter === "verified") {
    filtered = displayUsers.filter((p) => p.plan === "elite-annual");
  } else if (filter === "new") {
    const oneWeekAgo = Date.now() - 604800000;
    filtered = displayUsers.filter((p) => {
      const joined = p.joined ? new Date(p.joined).getTime() : 0;
      return joined > oneWeekAgo;
    });
  }

  // Search term filtering
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
  if (!filtered.length && !getSmartMatches(displayUsers, sessionUser).length) {
    grid.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);"><i class="fa-solid fa-users-slash"></i><p style="margin-top:1rem;">No profiles match this filter.</p></div>`;
    return;
  }

  let html = '';

  // 1. Daily Matches (up to 4, only if no filter is active)
  if (filter === "all" && !searchTerm) {
    const dailyMatches = getSmartMatches(displayUsers, sessionUser).slice(0, 4);
    if (dailyMatches.length > 0) {
      html += `
        <div style="margin-bottom:2.5rem;">
          <h2 style="font-family:'Playfair Display',serif; color:var(--gold-light); margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
            <i class="fa-solid fa-star"></i> Daily Matches
          </h2>
          <div class="card-grid" style="margin-bottom:0;">
            ${dailyMatches.map((u, i) => renderSingleCard(u, i)).join('')}
          </div>
        </div>`;
    }
  }

  // 2. Regular cards with "People You May Know" interspersed every 12 cards
  const insertEveryN = 12;
  let cardIndex = 0;

  for (let i = 0; i < filtered.length; i++) {
    // Insert a horizontal carousel every 12 cards (except at the very beginning)
    if (i > 0 && i % insertEveryN === 0) {
      const randomPeople = getRandomPeople(displayUsers, sessionUser, 8);
      if (randomPeople.length > 0) {
        html += `
          <div class="people-row" style="margin:2rem 0; display:flex; gap:1rem; overflow-x:auto; padding-bottom:1rem; scroll-snap-type:x mandatory;">
            ${randomPeople.map(p => {
              const online = (Date.now() - (p.lastActive?.seconds ? p.lastActive.seconds*1000 : p.lastActive || 0)) < 20000;
              return `
                <div class="people-circle" onclick="location.href='view-profile.html?email=${p.email}'" style="flex:0 0 80px; text-align:center; scroll-snap-align:start; position:relative; cursor:pointer;">
                  <div style="position:relative; display:inline-block;">
                    <img src="${p.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-light);">
                    ${online ? '<span style="position:absolute; bottom:8px; right:2px; width:14px; height:14px; background:#4cfa7c; border-radius:50%; border:2px solid #080c24;"></span>' : ''}
                  </div>
                  <div class="people-name" style="font-size:0.7rem; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:0.3rem;">${p.firstName}</div>
                  <div class="people-age" style="font-size:0.65rem; color:var(--text-muted);">${p.age || ''}</div>
                </div>`;
            }).join('')}
          </div>`;
      }
    }
    html += renderSingleCard(filtered[i], cardIndex++);
  }

  grid.innerHTML = html;

  // Attach interaction handlers (admire, bookmark, phone copy)
  attachInteractionHandlers();

  // Intersection observer for animation
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

  // Phone copy functionality
  document.querySelectorAll(".card-phone").forEach((el) => {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      const phone = this.getAttribute("data-phone");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone).then(() => showToast("📋 Phone number copied: " + phone));
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
      setTimeout(() => { this.style.backgroundColor = ""; }, 300);
    });
  });

  // Card click navigation
  document.querySelectorAll('.profile-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.interaction-btn') || e.target.closest('.card-phone')) return;
      const email = this.querySelector('.admire-btn')?.getAttribute('data-target-email');
      if (email) window.location.href = `view-profile.html?email=${email}`;
    });
  });

  updateDistances();
}