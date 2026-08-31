// api/upload.js – Vercel serverless function (no external dependencies)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel automatically parses multipart/form-data into req.body
    // For files, req.files is available if you enable it.
    // But for simplicity, we'll use a FormData directly from the client and
    // forward it to Catbox using fetch.
    // This works for small files (<4.5MB) without busboy.

    const catboxForm = new FormData();
    // We need to get the file from the request. Vercel doesn't parse files by default.
    // We'll use the request body as a Buffer and assume it's the file content.
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Since we don't have filename from the raw body, we'll set a dummy name
    const filename = 'video.mp4';

    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', new Blob([fileBuffer]), filename);

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
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}