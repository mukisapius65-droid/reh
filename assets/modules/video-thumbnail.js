// assets/modules/video-thumbnail.js
// Extracts a JPEG thumbnail from the first frame of a video File/Blob.
// Returns a Blob (image/jpeg) or null on failure.

export async function generateVideoThumbnail(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    // Safety: if nothing happens in 12s, bail
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    }, 12000);

    video.addEventListener('loadeddata', () => {
      // Seek slightly to avoid a black/empty first frame
      try { video.currentTime = 0.15; } catch (e) { /* ignore */ }
    });

    video.addEventListener('seeked', () => {
      try {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 360;
        const maxW = 1200;
        const scale = w > maxW ? maxW / w : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          resolve(blob);   // image/jpeg
        }, 'image/jpeg', 0.8);
      } catch (e) {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    });

    video.addEventListener('error', () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    });
  });
}