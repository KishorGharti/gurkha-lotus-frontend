import { useState, useEffect, useRef } from 'react'
import { api } from '../../utils/api'
import styles from './ManagePhotos.module.css'

const PHOTO_SLOTS = [
  { id: 'hero-1', label: 'Hero Slide 1', desc: 'First slide — Elite Military Training',    section: 'Hero Slideshow' },
  { id: 'hero-2', label: 'Hero Slide 2', desc: 'Second slide — Gurkha Legacy',            section: 'Hero Slideshow' },
  { id: 'hero-3', label: 'Hero Slide 3', desc: 'Third slide — World-Class Facilities',    section: 'Hero Slideshow' },
  { id: 'hero-4', label: 'Hero Slide 4', desc: 'Fourth slide — Training Hostel',           section: 'Hero Slideshow' },
  { id: 'about',  label: 'About Page Photo', desc: 'Displayed in the About Us section',   section: 'About Page' },
]

export default function ManagePhotos() {
  const [photos, setPhotos]       = useState({})
  const [uploading, setUploading] = useState(null)
  const [removing, setRemoving]   = useState(null)
  const [toast, setToast]         = useState('')
  const fileRefs = useRef({})

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    api.get('/photos')
      .then(d => setPhotos(d.data))
      .catch(() => showToast('Failed to load photos.'))
  }, [])

  const handleFileChange = async (e, slotId) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { showToast('Only JPG, PNG, or WebP images are allowed.'); return }
    if (file.size > 15 * 1024 * 1024) { showToast('Image must be under 15 MB.'); return }

    const fd = new FormData()
    fd.append('image', file)
    setUploading(slotId)
    try {
      const d = await api.post(`/photos/${slotId}`, fd)
      setPhotos(prev => ({ ...prev, [slotId]: { url: d.data.url, name: d.data.name } }))
      showToast(`Photo updated: ${d.data.name}`)
    } catch (err) {
      showToast(err.message || 'Upload failed.')
    } finally {
      setUploading(null)
    }
    e.target.value = ''
  }

  const handleRemove = async (slotId) => {
    setRemoving(slotId)
    try {
      await api.del(`/photos/${slotId}`)
      setPhotos(prev => { const next = { ...prev }; delete next[slotId]; return next })
      showToast('Photo removed.')
    } catch (err) {
      showToast(err.message || 'Failed to remove.')
    } finally {
      setRemoving(null)
    }
  }

  const sections = [...new Set(PHOTO_SLOTS.map(s => s.section))]

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast} role="status" aria-live="polite">✓ {toast}</div>}

      {sections.map(section => (
        <div key={section} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section}</h2>
          <div className={styles.grid}>
            {PHOTO_SLOTS.filter(s => s.section === section).map(slot => {
              const photo = photos[slot.id]
              const busy = uploading === slot.id || removing === slot.id
              return (
                <div key={slot.id} className={styles.card}>
                  <div className={styles.preview}>
                    {photo?.url ? (
                      <img src={photo.url} alt={slot.label} className={styles.previewImg} />
                    ) : (
                      <div className={styles.placeholder}>
                        <span className={styles.placeholderIcon} aria-hidden="true">🖼</span>
                        <span className={styles.placeholderText}>No image uploaded</span>
                      </div>
                    )}
                    {photo && (
                      <div className={styles.previewOverlay}>
                        <span className={styles.fileName}>{photo.name}</span>
                      </div>
                    )}
                    {busy && (
                      <div className={styles.uploadingOverlay}>
                        {uploading === slot.id ? 'Uploading…' : 'Removing…'}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardInfo}>
                    <div>
                      <div className={styles.cardLabel}>{slot.label}</div>
                      <div className={styles.cardDesc}>{slot.desc}</div>
                    </div>
                    <div className={styles.cardActions}>
                      <input
                        ref={el => { fileRefs.current[slot.id] = el }}
                        type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                        className={styles.hiddenInput}
                        onChange={e => handleFileChange(e, slot.id)}
                        aria-label={`Upload photo for ${slot.label}`}
                        disabled={busy}
                      />
                      <button className={styles.uploadBtn} disabled={busy}
                        onClick={() => fileRefs.current[slot.id]?.click()}>
                        {uploading === slot.id ? 'Uploading…' : photo ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {photo && (
                        <button className={styles.removeBtn} disabled={busy}
                          onClick={() => handleRemove(slot.id)}>
                          {removing === slot.id ? 'Removing…' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className={styles.teamNote}>
        <h2 className={styles.sectionTitle}>Team Member Photos</h2>
        <p className={styles.teamNoteText}>
          Team member photos are managed in the{' '}
          <a href="/admin/team" className={styles.teamNoteLink}>Manage Team</a> section.
        </p>
      </div>
    </div>
  )
}
