// assets/general.js – Minimal Loader
// This file is kept for backward compatibility.
// It defines global avatar functions and dynamically imports all modules.

// ─── Avatar Pool ─────────────────────────────────────
window.avatarPool = [
  'https://files.catbox.moe/jhuahq.jpg',
  'https://files.catbox.moe/bqihga.jpg',
  'https://files.catbox.moe/opkite.jpg',
  'https://files.catbox.moe/at63mh.jpg',
  'https://files.catbox.moe/wtscju.jpg',
  'https://files.catbox.moe/on7elg.jpg',
  'https://files.catbox.moe/pfh41b.jpg',
  'https://files.catbox.moe/g1qcj4.jpg',
  'https://files.catbox.moe/65nofc.jpg',
  'https://files.catbox.moe/7tdwiy.jpg',
  'https://files.catbox.moe/s4lgtb.jpg',
  'https://files.catbox.moe/44l67p.jpg',
  'https://files.catbox.moe/m80w2l.jpg',
  'https://files.catbox.moe/0cpblt.jpg',
  'https://files.catbox.moe/7nrcqh.jpg',
  'https://files.catbox.moe/badrsj.jpg',
  'https://files.catbox.moe/zlj7ts.jpg',
  'https://files.catbox.moe/zlj7ts.jpg',
  'https://files.catbox.moe/se3j53.jpg',
  'https://files.catbox.moe/1kiil0.jpg',
  'https://files.catbox.moe/xulsk3.jpg',
  'https://files.catbox.moe/waakzd.jpg',
  'https://files.catbox.moe/2lf6ds.jpg',
  'https://files.catbox.moe/xa2dys.jpg',
  'https://files.catbox.moe/hgfw98.jpg',
  'https://files.catbox.moe/se3j53.jpg',
  'https://files.catbox.moe/1kiil0.jpg',
  'https://files.catbox.moe/xulsk3.jpg',
  'https://files.catbox.moe/gky0gx.jpg',
  'https://files.catbox.moe/waakzd.jpg',
  'https://files.catbox.moe/2lf6ds.jpg',
  'https://files.catbox.moe/xa2dys.jpg',
  'https://files.catbox.moe/662288.jpg',
  'https://files.catbox.moe/lyl8xw.jpg',
  'https://files.catbox.moe/rk44v7.jpg',
  'https://files.catbox.moe/n9wyxg.jpg',
  'https://files.catbox.moe/ygtnv4.jpg',
  'https://files.catbox.moe/h9jv8l.jpg',
  'https://files.catbox.moe/h9jv8l.jpg',
  'https://files.catbox.moe/lyl8xw.jpg',
  'https://files.catbox.moe/jp9n0z.jpg',
  'https://files.catbox.moe/ybdg79.jpg',
  'https://files.catbox.moe/2v6kgl.jpg'
];

window.getRandomAvatar = function() {
  return window.avatarPool[Math.floor(Math.random() * window.avatarPool.length)];
};

// ─── Import and initialise all modules ─────────────
(async function initModules() {
  try {
    const { initNavigation } = await import('./modules/navigation.js');
    const { initSidebar } = await import('./modules/sidebar.js');
    const { initBottomNav } = await import('./modules/bottom-nav.js');
    const { initFooter } = await import('./modules/footer.js');
    const { initAuthUI } = await import('./modules/auth-ui.js');
    const { initStoryModal } = await import('./modules/story-modal.js');
    const { initNotifications } = await import('./modules/notifications.js');

    // Initialise in the correct order (dependencies: nav/sidebar/bottom-nav first, then others)
    initNavigation();
    initSidebar();
    initBottomNav();
    initFooter();
    initAuthUI();
    initStoryModal();
    initNotifications();

    console.log('[general] All modules initialised successfully.');
  } catch (error) {
    console.error('[general] Failed to load modules:', error);
  }
})();