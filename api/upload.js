// api/upload.js – Vercel serverless function (ES Module)
import Busboy from 'busboy';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const busboy = new Busboy({ headers: req.headers });

    let fileBuffer = null;
    let filename = null;

    busboy.on('file', (fieldname, file, info) => {
      filename = info.filename;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('finish', async () => {
      if (!fileBuffer || !filename) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Upload to Catbox
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('fileToUpload', new Blob([fileBuffer]), filename);

      try {
        const catboxRes = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: catboxForm,
        });

        const text = await catboxRes.text();
        if (catboxRes.ok && text.startsWith('https://')) {
          return res.status(200).json({ url: text.trim() });
        } else {
          console.error('Catbox response:', text);
          return res.status(500).json({ error: 'Catbox upload failed: ' + text });
        }
      } catch (err) {
        console.error('Catbox fetch error:', err);
        return res.status(500).json({ error: 'Catbox error: ' + err.message });
      }
    });

    req.pipe(busboy);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}