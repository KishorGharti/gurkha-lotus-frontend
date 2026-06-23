const UPLOAD_MARKER = '/image/upload/'

export function optimizedImageUrl(url, { width } = {}) {
  if (!url || !url.includes(UPLOAD_MARKER)) return url
  const transform = ['f_auto', 'q_auto', 'dpr_auto', width ? `w_${width}` : null].filter(Boolean).join(',')
  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transform}/`)
}
