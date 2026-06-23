import { useState, useRef } from 'react'
import { api } from '../../utils/api'
import { usePhotos } from '../../context/PhotosContext'
import DragZoomPositioner from './DragZoomPositioner'
import styles from './ManagePhotos.module.css'

const HERO_CAPTION = 'This image is cropped to a 16:9 box in the homepage hero slideshow.'

const PHOTO_SLOTS = [
  { id: 'logo',   label: 'Site Logo', desc: 'Shown in the navbar, footer, and admin panel', section: 'Branding' },
  { id: 'hero-1', label: 'Hero Slide 1', desc: 'First slide — Elite Military Training',    section: 'Hero Slideshow', aspect: '16 / 9', caption: HERO_CAPTION },
  { id: 'hero-2', label: 'Hero Slide 2', desc: 'Second slide — Gurkha Legacy',            section: 'Hero Slideshow', aspect: '16 / 9', caption: HERO_CAPTION },
  { id: 'hero-3', label: 'Hero Slide 3', desc: 'Third slide — World-Class Facilities',    section: 'Hero Slideshow', aspect: '16 / 9', caption: HERO_CAPTION },
  { id: 'hero-4', label: 'Hero Slide 4', desc: 'Fourth slide — Training Hostel',           section: 'Hero Slideshow', aspect: '16 / 9', caption: HERO_CAPTION },
  { id: 'about',  label: 'About Page Photo', desc: 'Displayed in the About Us section',   section: 'About Page', aspect: '1 / 1', caption: 'This image is cropped to a 1:1 box in the About Us section.' },
]

export default function ManagePhotos() {
  const { photos, updatePhoto, removePhoto } = usePhotos()
  const [uploading, setUploading] = useState(null)
  const [removing, setRemoving]   = useState(null)
  const [savingPos, setSavingPos] = useState(null)
  const [pendingPos, setPendingPos] = useState({})
  const [resetTokens, setResetTokens] = useState({})
  const [toast, setToast]         = useState('')
  const fileRefs = useRef({})

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

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
      updatePhoto(slotId, d.data)
      setPendingPos(prev => { const next = { ...prev }; delete next[slotId]; return next })
      showToast(`Photo updated: ${d.data.name}`)
    } catch (err) {
      showToast(err.message || 'Upload failed.')
    } finally {
      setUploading(null)
    }
    e.target.value = ''
  }

  const handleSavePosition = async (slotId) => {
    const pos = pendingPos[slotId]
    if (!pos || savingPos === slotId) return
    setSavingPos(slotId)
    try {
      const fd = new FormData()
      fd.append('cropX', pos.cropX)
      fd.append('cropY', pos.cropY)
      fd.append('zoom', pos.zoom)
      const d = await api.post(`/photos/${slotId}`, fd)
      updatePhoto(slotId, d.data)
      setPendingPos(prev => { const next = { ...prev }; delete next[slotId]; return next })
      showToast('Position saved.')
    } catch (err) {
      showToast(err.message || 'Failed to save position.')
    } finally {
      setSavingPos(null)
    }
  }

  const handleCancelPosition = (slotId) => {
    setPendingPos(prev => { const next = { ...prev }; delete next[slotId]; return next })
    setResetTokens(prev => ({ ...prev, [slotId]: (prev[slotId] || 0) + 1 }))
  }

  const handleRemove = async (slotId) => {
    setRemoving(slotId)
    try {
      await api.del(`/photos/${slotId}`)
      removePhoto(slotId)
      setPendingPos(prev => { const next = { ...prev }; delete next[slotId]; return next })
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
              const draft = pendingPos[slot.id]
              return (
                <div key={slot.id} className={styles.card}>
                  <div className={`${styles.preview} ${photo?.url && slot.aspect ? styles.previewPositioner : ''}`}>
                    {photo?.url ? (
                      slot.aspect ? (
                        <DragZoomPositioner
                          key={`${photo.url}-${resetTokens[slot.id] || 0}`}
                          imageUrl={photo.url}
                          aspect={slot.aspect}
                          value={{ cropX: photo.cropX ?? 50, cropY: photo.cropY ?? 50, zoom: photo.zoom ?? 1 }}
                          onChange={(pos) => setPendingPos(prev => ({ ...prev, [slot.id]: pos }))}
                          caption={slot.caption}
                        />
                      ) : (
                        <img
                          src={photo.url} alt={slot.label} className={styles.previewImg}
                          style={{
                            objectPosition: `${photo.cropX ?? 50}% ${photo.cropY ?? 50}%`,
                            transform: `scale(${photo.zoom ?? 1})`,
                            transformOrigin: `${photo.cropX ?? 50}% ${photo.cropY ?? 50}%`,
                          }}
                        />
                      )
                    ) : (
                      <div className={styles.placeholder}>
                        <span className={styles.placeholderIcon} aria-hidden="true">🖼</span>
                        <span className={styles.placeholderText}>No image uploaded</span>
                      </div>
                    )}
                    {photo && !slot.aspect && (
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

                  {draft && (
                    <div className={styles.positionActions}>
                      <button type="button" className={styles.savePositionBtn} disabled={savingPos === slot.id}
                        onClick={() => handleSavePosition(slot.id)}>
                        {savingPos === slot.id ? 'Saving…' : 'Save Position'}
                      </button>
                      <button type="button" className={styles.cancelPositionBtn} disabled={savingPos === slot.id}
                        onClick={() => handleCancelPosition(slot.id)}>
                        Cancel
                      </button>
                    </div>
                  )}

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
