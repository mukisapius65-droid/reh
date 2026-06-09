async function renderCards(filter = "all", searchTerm = "") {
  activeFilter = filter;
  const allUsers = await getUsers();
  const sessionUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
  const currentUid = sessionUser?.email || null;

  // ... (existing blocklist / visibility filtering – keep as is)

  const displayUsers = allUsers.filter(/* your existing filter */);
  allProfiles = displayUsers;

  // ── 1. Apply active filter (online, premium, etc.) ──
  let filtered = displayUsers;
  // ... (your existing filter logic)

  // ── 2. Search term filtering ──
  if (searchTerm) {
    filtered = filtered.filter(p => /* your existing search */);
  }

  // ── 3. Smart matching for "Daily Matches" ──
  const dailyMatches = getSmartMatches(allUsers, sessionUser).slice(0, 4);

  const grid = document.getElementById("cardGrid");
  if (filtered.length === 0 && dailyMatches.length === 0) {
    grid.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);"><i class="fa-solid fa-users-slash"></i><p style="margin-top:1rem;">No profiles match this filter.</p></div>`;
    return;
  }

  let html = '';

  // ── Daily Matches Section (top) ──────────
  if (dailyMatches.length > 0) {
    html += `
      <div style="margin-bottom:2rem;">
        <h2 style="font-family:'Playfair Display',serif;color:var(--gold-light);margin-bottom:1rem;">
          <i class="fa-solid fa-star"></i> Daily Matches
        </h2>
        <div class="card-grid" style="margin-bottom:0;">
          ${dailyMatches.map((u, i) => renderSingleCard(u, i)).join('')}
        </div>
      </div>`;
  }

  // ── Regular Cards + People You May Know every 12 ──
  const insertEveryN = 12;
  let cardIndex = 0;   // for transition delay

  for (let i = 0; i < filtered.length; i++) {
    const u = filtered[i];
    if (i > 0 && i % insertEveryN === 0) {
      // Insert "People You May Know" carousel
      const randomPeople = getRandomPeople(allUsers, sessionUser, 8);
      if (randomPeople.length > 0) {
        html += `
          <div class="people-row">
            ${randomPeople.map(p => `
              <div class="people-circle" onclick="location.href='view-profile.html?email=${p.email}'">
                <div style="position:relative;">
                  <img src="${p.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'}">
                  ${isUserOnline(p.email) ? '<span class="online-dot"></span>' : ''}
                </div>
                <div class="people-name">${p.firstName}</div>
                <div class="people-age">${p.age || ''}</div>
              </div>
            `).join('')}
          </div>`;
      }
    }
    html += renderSingleCard(u, cardIndex++);
  }

  grid.innerHTML = html;

  // Attach interaction handlers, observer, phone copy, etc.
  attachInteractionHandlers();
  initCardObservers();
  updateDistances();
}