// api/upload.js – Vercel serverless function (ES Module)
import multer from 'multer';
import FormData from 'form-data';

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
    // Parse file using multer
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Build multipart form for Catbox
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    // Append file with proper filename and contentType
    form.append('fileToUpload', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype || 'video/mp4',
    });

    // Upload to Catbox
    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    // Read response as text (Catbox returns plain URL on success)
    const text = await catboxRes.text();

    if (catboxRes.ok && text.startsWith('https://')) {
      return res.status(200).json({ url: text.trim() });
    } else {
      console.error('Catbox response:', text);
      return res.status(500).json({ error: 'Catbox upload failed: ' + text });
    }
  } catch (error) {
    console.error('Upload proxy error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
    }
