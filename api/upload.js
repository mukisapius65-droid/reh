// api/upload.js – Vercel serverless function (ES Module)
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data using built‑in Node.js method
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !file.name) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Prepare form data for Catbox
    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', file, file.name);

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
    console.error('Upload proxy error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}