/**
 * Read an image file and downscale it to fit `maxSize` (longest edge) as a JPEG
 * data URL. Photos live in localStorage, so keeping them small protects the
 * ~5 MB quota that the whole vault shares.
 */
export function fileToDataUrl(file: File, maxSize = 360, quality = 0.86): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const raw = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(raw);
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(raw);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}
