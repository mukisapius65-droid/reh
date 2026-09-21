// api/og.js — dynamic Open Graph endpoint for Tar TV shares
// Fetches the video doc from Firestore REST, returns HTML with dynamic OG tags.

const FIREBASE_PROJECT = 'rehp-c82b8';
const FIREBASE_API_KEY = 'AIzaSyClJ9Mlln04N_7XFSvy1zGHaE6w5E2DQ8I';
const FALLBACK_IMAGE = 'https://reh-crown.vercel.app/assets/og/tar-tv-default.png';

export default async function handler(req, res) {
  const videoId = (req.query.video || '').toString().trim();
  const baseUrl = 'https://reh-crown.vercel.app';

  let title = 'Tar TV — Reh';
  let description = "Watch exclusive short videos from Reh's most extraordinary members.";
  let image = FALLBACK_IMAGE;
  let isAIVideo = false;

  if (videoId) {
    try {
      const docUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/tar_tv_videos/${encodeURIComponent(videoId)}?key=${FIREBASE_API_KEY}`;

      // Hard 4s timeout — WhatsApp's scraper gives up at ~5s.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const r = await fetch(docUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (r.ok) {
        const data = await r.json();
        const f = data.fields || {};

        const videoTitle = f.title?.stringValue || '';
        const author = f.author?.stringValue || 'Reh';
        const thumb = f.thumbnail?.stringValue || '';

        isAIVideo = f.isAI?.booleanValue === true;

        if (videoTitle) {
          title = `${videoTitle} — Tar TV`;
          description = `@${author} on Reh's Tar TV. Tap to watch.`;
        }
        if (thumb) image = thumb;
      } else {
        console.error('[api/og] Firestore HTTP', r.status, 'for video', videoId);
      }
    } catch (e) {
      console.error('[api/og] Firestore fetch failed for video=' + videoId + ':', e.message);
      // fall back to defaults
    }
  }

  const escape = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const targetUrl = videoId
    ? `${baseUrl}/tartv.html?video=${encodeURIComponent(videoId)}${isAIVideo ? '&mode=ai' : ''}`
    : `${baseUrl}/tartv.html`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escape(title)}</title>
<meta property="og:type" content="video.other">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:image" content="${escape(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${escape(targetUrl)}">
<meta property="og:site_name" content="Reh">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${escape(image)}">
<meta http-equiv="refresh" content="0;url=${escape(targetUrl)}">
</head>
<body style="background:#080c24;color:#f0ece6;font-family:sans-serif;text-align:center;padding:3rem;">
  <p>Opening Tar TV…</p>
  <p><a style="color:#c9a84c" href="${escape(targetUrl)}">Tap here if you are not redirected.</a></p>
</body>
</html>`);
}