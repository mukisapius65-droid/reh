// api/upload.js – Vercel serverless function using multer
import multer from 'multer';

// Configure multer to store file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Helper to run middleware (multer)
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer to parse the file
    await runMiddleware(req, res, upload.single('file'));

    // Check if file was received
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const filename = req.file.originalname;

    // Prepare FormData for Catbox
    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', new Blob([fileBuffer]), filename);

    // Upload to Catbox
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
