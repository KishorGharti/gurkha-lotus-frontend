import { useState, useEffect, useRef } from 'react'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import DragZoomPositioner from './DragZoomPositioner'
import { api } from '../../utils/api'
import facebookIcon from '../../assets/facebook.svg'
import styles from './ManageTeam.module.css'

const getInitials = (name) =>
  name.split(' ').filter(w => /^[A-Za-z]/.test(w)).slice(0, 3).map(w => w[0].toUpperCase()).join('')

const EMPTY_FORM = { name: '', role: '', phone: '', facebook: '' }
const TEAM_LIMIT = 20
const DEFAULT_PHOTO_POS = { cropX: 50, cropY: 50, zoom: 1 }

// Expected national-number length per country calling code, for basic format validation.
const PHONE_RULES = [
  { code: '+977', country: 'Nepal',        digits: 10 },
  { code: '+91',  country: 'India',        digits: 10 },
  { code: '+1',   country: 'US/Canada',    digits: 10 },
  { code: '+44',  country: 'UK',           digits: 10 },
  { code: '+61',  country: 'Australia',    digits: 9 },
  { code: '+971', country: 'UAE',          digits: 9 },
  { code: '+966', country: 'Saudi Arabia', digits: 9 },
  { code: '+974', country: 'Qatar',        digits: 8 },
  { code: '+65',  country: 'Singapore',    digits: 8 },
  { code: '+60',  country: 'Malaysia',     digits: 9 },
]

const NAME_PATTERN = /^[A-Za-z][A-Za-z.'-]*(?:\s[A-Za-z][A-Za-z.'-]*)*$/
const validateName = (raw) => {
  const value = raw.trim()
  if (!value) return ''
  if (value.length < 3) return 'Full name must be at least 3 characters.'
  if (!NAME_PATTERN.test(value)) return 'Full name can only contain letters, spaces, periods, apostrophes, and hyphens.'
  return ''
}

const ROLE_PATTERN = /^[A-Za-z][A-Za-z\s.,/&-]*$/
const validateRole = (raw) => {
  const value = raw.trim()
  if (!value) return ''
  if (value.length < 3) return 'Role / position must be at least 3 characters.'
  if (!ROLE_PATTERN.test(value)) return 'Role / position can only contain letters, spaces, and basic punctuation (/ , . & -).'
  return ''
}

const validatePhone = (raw) => {
  const value = raw.trim()
  if (!value) return ''
  const digits = value.replace(/[\s-]/g, '')
  if (!/^\+\d{7,15}$/.test(digits)) {
    return 'Enter a valid phone number with country code, e.g. +977-9800000000.'
  }
  const rule = PHONE_RULES.find(r => digits.startsWith(r.code))
  if (rule && digits.length - rule.code.length !== rule.digits) {
    return `${rule.country} numbers need ${rule.digits} digits after ${rule.code}.`
  }
  return ''
}

export default function ManageTeam() {
  const [team, setTeam]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [photoFile, setPhotoFile]   = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoPos, setPhotoPos]     = useState(DEFAULT_PHOTO_POS)
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState('')
  const [errors, setErrors]         = useState({})
  const fileRef = useRef(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    api.get('/team')
      .then(d => setTeam(d.data))
      .catch(() => showToast('Failed to load team.'))
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    if (team.length >= TEAM_LIMIT) { showToast(`You can add up to ${TEAM_LIMIT} team members.`); return }
    setEditId(null); setForm(EMPTY_FORM)
    setPhotoFile(null); setPhotoPreview(null); setPhotoPos(DEFAULT_PHOTO_POS); setPhotoRemoved(false)
    setErrors({}); setModalOpen(true)
  }
  const openEdit = (m) => {
    setEditId(m.id)
    setForm({ name: m.name, role: m.role, phone: m.phone || '', facebook: m.facebook || '' })
    setPhotoFile(null)
    setPhotoPreview(m.photoUrl || null)
    setPhotoPos({ cropX: m.cropX ?? 50, cropY: m.cropY ?? 50, zoom: m.zoom ?? 1 })
    setPhotoRemoved(false)
    setErrors({})
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false); setForm(EMPTY_FORM); setEditId(null)
    setPhotoFile(null); setPhotoPreview(null); setPhotoPos(DEFAULT_PHOTO_POS); setPhotoRemoved(false)
    setErrors({})
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    setErrors(p => (p[name] ? { ...p, [name]: '' } : p))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { showToast('Only JPG, PNG, or WebP allowed.'); return }
    if (file.size > 10 * 1024 * 1024) { showToast('Photo must be under 10 MB.'); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoPos(DEFAULT_PHOTO_POS)
    setPhotoRemoved(false)
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null); setPhotoPreview(null); setPhotoPos(DEFAULT_PHOTO_POS); setPhotoRemoved(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    const role = form.role.trim()
    const phone = form.phone.trim()

    const nextErrors = {}
    if (!name) nextErrors.name = 'This field is mandatory.'
    else {
      const nameError = validateName(name)
      if (nameError) nextErrors.name = nameError
    }
    if (!role) nextErrors.role = 'This field is mandatory.'
    else {
      const roleError = validateRole(role)
      if (roleError) nextErrors.role = roleError
    }
    const phoneError = validatePhone(phone)
    if (phoneError) nextErrors.phone = phoneError

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const fd = new FormData()
    fd.append('name', name)
    fd.append('role', role)
    fd.append('phone', phone)
    fd.append('facebook', form.facebook.trim())
    fd.append('cropX', photoPos.cropX)
    fd.append('cropY', photoPos.cropY)
    fd.append('zoom', photoPos.zoom)
    if (photoFile) fd.append('photo', photoFile)
    if (photoRemoved && !photoFile) fd.append('removePhoto', 'true')

    setSaving(true)
    try {
      if (editId) {
        const d = await api.put(`/team/${editId}`, fd)
        setTeam(prev => prev.map(m => m.id === editId ? d.data : m))
        showToast('Team member updated.')
      } else {
        const d = await api.post('/team', fd)
        setTeam(prev => [...prev, d.data])
        showToast('Team member added.')
      }
      closeModal()
    } catch (err) {
      showToast(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await api.del(`/team/${deleteTarget}`)
      setTeam(prev => prev.filter(m => m.id !== deleteTarget))
      showToast('Team member removed.')
    } catch (err) {
      showToast(err.message || 'Failed to delete.')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast} role="status" aria-live="polite">✓ {toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Our Team ({team.length})</h2>
          <p className={styles.pageDesc}>Manage team member profiles displayed on the website.</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd} disabled={team.length >= TEAM_LIMIT}>
          + Add Member
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#7a8a80', padding: '32px 0' }}>Loading…</p>
      ) : (
        <div className={styles.grid}>
          {team.map(member => (
            <div key={member.id} className={styles.card}>
              <div className={styles.avatarWrap}>
                {member.photoUrl
                  ? <img
                      src={member.photoUrl} alt={member.name} className={styles.avatarImg}
                      style={{
                        objectPosition: `${member.cropX ?? 50}% ${member.cropY ?? 50}%`,
                        transform: `scale(${member.zoom ?? 1})`,
                        transformOrigin: `${member.cropX ?? 50}% ${member.cropY ?? 50}%`,
                      }}
                    />
                  : <span className={styles.initials}>{member.initials}</span>}
              </div>
              <div className={styles.info}>
                <div className={styles.memberName}>{member.name}</div>
                <div className={styles.memberRole}>{member.role}</div>
                {member.phone && <div className={styles.memberMeta}>📞 {member.phone}</div>}
                {member.facebook && (
                  <div className={styles.memberMeta}>
                    <img src={facebookIcon} alt="" className={styles.facebookIcon} /> Facebook linked
                  </div>
                )}
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => openEdit(member)}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget(member.id)}>Delete</button>
              </div>
            </div>
          ))}
          {team.length === 0 && (
            <div className={styles.emptyState}>
              <span aria-hidden="true">◉</span>
              <p>No team members yet. Click &ldquo;+ Add Member&rdquo; to get started.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editId ? 'Edit Team Member' : 'Add Team Member'} size="md">
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Photo */}
          {photoPreview ? (
            <div className={styles.imageSection}>
              <DragZoomPositioner
                key={photoPreview}
                imageUrl={photoPreview}
                aspect="1 / 1"
                value={photoPos}
                onChange={setPhotoPos}
                caption="This image is cropped to a 1:1 box on the team grid."
              />
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                className={styles.hiddenInput} onChange={handlePhotoChange} aria-label="Change member photo" />
              <button type="button" className={styles.changeImageBtn} onClick={() => fileRef.current?.click()}>
                Change Photo
              </button>
              <button type="button" className={styles.removeImageBtn} onClick={handleRemovePhoto}>Remove Photo</button>
            </div>
          ) : (
            <div className={styles.photoSection}>
              <div className={styles.photoPreview}>
                <span className={styles.photoInitials}>{getInitials(form.name) || '?'}</span>
              </div>
              <div className={styles.photoActions}>
                <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                  className={styles.hiddenInput} onChange={handlePhotoChange} aria-label="Upload member photo" />
                <button type="button" className={styles.uploadPhotoBtn} onClick={() => fileRef.current?.click()}>
                  Upload Photo
                </button>
                <p className={styles.photoHint}>JPG, PNG or WebP · Max 10 MB</p>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="member-name">Full Name <span className={styles.req}>*</span></label>
            <input id="member-name" type="text" name="name" value={form.name} onChange={handleFormChange}
              className={`${styles.formInput} ${errors.name ? styles.formInputErr : ''}`}
              placeholder="e.g. Col. Ram Bahadur Thapa" maxLength={80}
              aria-invalid={!!errors.name} aria-describedby={errors.name ? 'member-name-err' : 'member-name-hint'} />
            {errors.name
              ? <span id="member-name-err" className={styles.fieldError} role="alert">{errors.name}</span>
              : <p id="member-name-hint" className={styles.photoHint}></p>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="member-role">Role / Position <span className={styles.req}>*</span></label>
            <input id="member-role" type="text" name="role" value={form.role} onChange={handleFormChange}
              className={`${styles.formInput} ${errors.role ? styles.formInputErr : ''}`}
              placeholder="e.g. Head of Training" maxLength={60}
              aria-invalid={!!errors.role} aria-describedby={errors.role ? 'member-role-err' : 'member-role-hint'} />
            {errors.role
              ? <span id="member-role-err" className={styles.fieldError} role="alert">{errors.role}</span>
              : <p id="member-role-hint" className={styles.photoHint}>e.g. Head of Training, Senior Trainer / Instructor.</p>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="member-phone">Phone Number</label>
            <input id="member-phone" type="tel" name="phone" value={form.phone} onChange={handleFormChange}
              className={`${styles.formInput} ${errors.phone ? styles.formInputErr : ''}`}
              placeholder="e.g. +977-9800000000" maxLength={30}
              aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'member-phone-err' : undefined} />
            {errors.phone
              ? <span id="member-phone-err" className={styles.fieldError} role="alert">{errors.phone}</span>
              : <p className={styles.photoHint}>Include the country code, e.g. +977, +91, +44, +1.</p>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="member-facebook">Facebook Profile URL</label>
            <input id="member-facebook" type="url" name="facebook" value={form.facebook} onChange={handleFormChange}
              className={styles.formInput} placeholder="https://facebook.com/yourprofile" maxLength={200} />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelFormBtn} onClick={closeModal}>Cancel</button>
            <button type="submit" className={styles.submitFormBtn} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        message="Are you sure you want to remove this team member? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
