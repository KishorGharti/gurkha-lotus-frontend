import { useEffect } from 'react'
import { usePhotos } from '../context/PhotosContext'

export function useLogo() {
  const { photos } = usePhotos()
  const logoUrl = photos?.logo?.url ?? null

  useEffect(() => {
    if (!logoUrl) return
    let favicon = document.querySelector('link[rel="icon"]')
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    favicon.href = logoUrl
  }, [logoUrl])

  return logoUrl
}
