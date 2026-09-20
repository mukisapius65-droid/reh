cat > ~/reh/api/upload.js << 'UPLOADEOF'
// api/upload.js — Vercel serverless function
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('fileToUpload'));

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Vercel Hobby body limit is 4.5 MB. Enforce with a clear message.
    if (req.file.size > 4.4 * 1024 * 1024) {
      return res.status(413).json({
        error: 'File too large for proxy (4.5 MB cap). Upload to catbox.moe manually and use the URL field.'
      });
    }

    // Native FormData — works with Vercel's Node 20 fetch.
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append(
      'fileToUpload',
      new Blob([req.file.buffer], { type: req.file.mimetype || 'video/mp4' }),
      req.file.originalname || 'upload.mp4'
    );

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
    });

    const text = await catboxRes.text();

    if (catboxRes.ok && text.startsWith('https://')) {
      return res.status(200).json({ url: text.trim() });
    } else {
      console.error('Catbox response:', text);
      return res.status(500).json({ error: 'Catbox upload failed: ' + text });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
UPLOADEOF