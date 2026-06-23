import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api'

const PhotosCtx = createContext(null)
const CACHE_KEY = 'gl_photos_cache'

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore (private browsing / storage disabled)
  }
}

export function PhotosProvider({ children }) {
  const cached = readCache()
  const [photos, setPhotos] = useState(cached || {})
  const [loaded, setLoaded] = useState(!!cached)

  // Serve the cached snapshot instantly on refresh so images can start
  // downloading right away, then revalidate against the server.
  const refresh = useCallback((retriesLeft = 2) => {
    return api.get('/photos')
      .then(d => { setPhotos(d.data); setLoaded(true); writeCache(d.data) })
      .catch(err => {
        if (retriesLeft > 0) {
          return new Promise(resolve => setTimeout(resolve, 600)).then(() => refresh(retriesLeft - 1))
        }
        throw err
      })
  }, [])

  useEffect(() => { refresh().catch(() => {}) }, [refresh])

  const updatePhoto = useCallback((slotId, data) => {
    setPhotos(prev => {
      const next = { ...prev, [slotId]: data }
      writeCache(next)
      return next
    })
  }, [])

  const removePhoto = useCallback((slotId) => {
    setPhotos(prev => {
      const next = { ...prev }
      delete next[slotId]
      writeCache(next)
      return next
    })
  }, [])

  return (
    <PhotosCtx.Provider value={{ photos, loaded, refresh, updatePhoto, removePhoto }}>
      {children}
    </PhotosCtx.Provider>
  )
}

export const usePhotos = () => useContext(PhotosCtx)
