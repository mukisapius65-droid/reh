// api/upload.js
// Vercel serverless function – proxies video upload to Catbox.moe

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file from the request (multipart/form-data)
    const form = new FormData();
    // Vercel's req.body is a Buffer; we need to parse multipart manually
    // We'll use a library or parse ourselves. Since this is a simple proxy,
    // we can use the built-in `rawBody` approach.
    // In Vercel, we can access the raw request body via req.body (Buffer)
    // We need to extract the file. Simplest: use a library like 'multer' or 'busboy'.
    // Since we want to keep it lightweight, we'll use `busboy` to parse the multipart stream.
    
    // Import busboy (you'll need to install: npm install busboy)
    const Busboy = require('busboy');
    const busboy = new Busboy({ headers: req.headers });

    let fileBuffer = null;
    let filename = null;

    busboy.on('file', (fieldname, file, info) => {
      const { filename: fname } = info;
      filename = fname;
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

      // Now upload to Catbox
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      // userhash is optional; we can omit to use anonymous upload
      catboxForm.append('fileToUpload', new Blob([fileBuffer]), filename);

      try {
        const catboxRes = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: catboxForm,
        });

        if (!catboxRes.ok) {
          throw new Error(`Catbox upload failed: ${catboxRes.status}`);
        }

        const text = await catboxRes.text(); // Catbox returns the URL directly
        // The response should be a plain URL string
        if (!text.startsWith('https://')) {
          throw new Error('Catbox returned invalid response: ' + text);
        }

        return res.status(200).json({ url: text.trim() });
      } catch (err) {
        console.error('Catbox upload error:', err);
        return res.status(500).json({ error: 'Upload failed: ' + err.message });
      }
    });

    req.pipe(busboy);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}