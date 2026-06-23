const UPLOAD_MARKER = '/image/upload/'

// The backend stores full-resolution camera/WhatsApp originals (often 1-3MB+).
// Inject Cloudinary's on-the-fly transformation params to serve a compressed,
// appropriately-sized derivative instead, without touching the stored URL.
export function optimizedImageUrl(url, { width } = {}) {
  if (!url || !url.includes(UPLOAD_MARKER)) return url
  const transform = ['f_auto', 'q_auto', 'dpr_auto', width ? `w_${width}` : null].filter(Boolean).join(',')
  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transform}/`)
}
