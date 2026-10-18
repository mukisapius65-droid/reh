// api/og.js — dynamic Open Graph endpoint for Reh shares
const FIREBASE_PROJECT = 'rehp-c82b8';
const FIREBASE_API_KEY = 'AIzaSyClJ9Mlln04N_7XFSvy1zGHaE6w5E2DQ8I';
const FALLBACK_IMAGE = 'https://rehcrown.com/assets/og/tar-tv-default.png';

export default async function handler(req, res) {
  const videoId = (req.query.video || '').toString().trim();
  const baseUrl = 'https://rehcrown.com';
  
  // Determine which collection to fetch from based on the query param
  const isFullVideo = req.query.type === 'full';
  const collection = isFullVideo ? 'full_videos' : 'tar_tv_videos';

  let title = 'Reh — Where Extraordinary Hearts Find Home';
  let description = isFullVideo 
    ? 'Watch exclusive long-form content on Reh.' 
    : "Watch exclusive short videos from Reh's most extraordinary members.";
  let image = FALLBACK_IMAGE;

  if (videoId) {
    try {
      const docUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${collection}/${encodeURIComponent(videoId)}?key=${FIREBASE_API_KEY}`;

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

        if (videoTitle) {
          if (isFullVideo) {
            title = `${videoTitle} — Reh`;
            const dur = f.duration?.integerValue || f.duration?.doubleValue || 0;
            const durStr = dur > 0 ? ` (${Math.floor(dur / 60)}:${String(Math.floor(dur % 60)).padStart(2, '0')})` : '';
            description = `Watch "${videoTitle}"${durStr} on Reh — Full Videos.`;
          } else {
            title = `${videoTitle} — Tar TV`;
            description = `@${author} on Reh's Tar TV. Tap to watch.`;
          }
        }
        if (thumb) image = thumb;
      }
    } catch (e) {
      console.error('[api/og] Firestore fetch failed:', e.message);
    }
  }

  const escape = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fix the target URL based on type
  const targetUrl = videoId
    ? `${baseUrl}/${isFullVideo ? 'watch' : 'tartv.html'}?${isFullVideo ? 'id' : 'video'}=${encodeURIComponent(videoId)}`
    : `${baseUrl}/${isFullVideo ? 'videos' : 'tartv.html'}`;

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
  <p>Opening Reh…</p>
  <p><a style="color:#c9a84c" href="${escape(targetUrl)}">Tap here if you are not redirected.</a></p>
</body>
</html>`);
}