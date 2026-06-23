const UPLOAD_MARKER = '/image/upload/'

export function zoomedWidth(baseWidth, zoom = 1) {
  return Math.ceil((baseWidth * (zoom || 1)) / 100) * 100
}

export function optimizedImageUrl(url, { width } = {}) {
  if (!url || !url.includes(UPLOAD_MARKER)) return url
  const transform = ['f_auto', 'q_auto', 'dpr_auto', width ? `w_${width}` : null].filter(Boolean).join(',')
  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transform}/`)
}

export function placeholderImageUrl(url) {
  if (!url || !url.includes(UPLOAD_MARKER)) return url
  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}f_auto,q_1,e_blur:2000,w_40/`)
}
