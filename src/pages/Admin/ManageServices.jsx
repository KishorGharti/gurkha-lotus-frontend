import { useState, useEffect } from 'react'
import Modal from '../../components/Modal/Modal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { api } from '../../utils/api'
import styles from './ManageServices.module.css'

const EMPTY_FORM = { title: '', description: '', features: [''] }
const TITLE_WORD_LIMIT = 10
const DESCRIPTION_WORD_LIMIT = 300

const countWords = (text) => {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export default function ManageServices() {
  const [services, setServices]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState('')
  const [errors, setErrors]         = useState({})

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    api.get('/services')
      .then(d => setServices(d.data))
      .catch(() => showToast('Failed to load services.'))
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (svc) => {
    setEditId(svc.id)
    setForm({ title: svc.title, description: svc.description, features: [...svc.features] })
    setErrors({})
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setForm(EMPTY_FORM); setEditId(null); setErrors({}) }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    if (name === 'title' || name === 'description') {
      const limit = name === 'title' ? TITLE_WORD_LIMIT : DESCRIPTION_WORD_LIMIT
      const newCount = countWords(value)
      const oldCount = countWords(form[name])
      if (newCount > limit && newCount > oldCount) return
    }
    setForm(p => ({ ...p, [name]: value }))
    setErrors(p => (p[name] ? { ...p, [name]: '' } : p))
  }
  const handleFeatureChange = (i, val) =>
    setForm(p => { const f = [...p.features]; f[i] = val; return { ...p, features: f } })
  const addFeature = () => { if (form.features.length < 8) setForm(p => ({ ...p, features: [...p.features, ''] })) }
  const removeFeature = (i) => {
    if (form.features.length > 1) setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const title = form.title.trim()
    const description = form.description.trim()
    const features = form.features.map(f => f.trim()).filter(Boolean)

    const nextErrors = {}
    if (!title) nextErrors.title = 'This field is mandatory.'
    else if (countWords(title) > TITLE_WORD_LIMIT) nextErrors.title = `Title must be ${TITLE_WORD_LIMIT} words or fewer.`
    if (!description) nextErrors.description = 'This field is mandatory.'
    else if (countWords(description) > DESCRIPTION_WORD_LIMIT) nextErrors.description = `Description must be ${DESCRIPTION_WORD_LIMIT} words or fewer.`

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      if (editId) {
        const d = await api.put(`/services/${editId}`, { title, description, features })
        setServices(prev => prev.map(s => s.id === editId ? d.data : s))
        showToast('Service updated.')
      } else {
        const d = await api.post('/services', { title, description, features })
        setServices(prev => [...prev, d.data])
        showToast('Service added.')
      }
      closeModal()
    } catch (err) {
      showToast(err.message || 'Failed to save service.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await api.del(`/services/${deleteTarget}`)
      setServices(prev => prev.filter(s => s.id !== deleteTarget))
      showToast('Service deleted.')
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
          <h2 className={styles.pageTitle}>Services ({services.length})</h2>
          <p className={styles.pageDesc}>Add, edit, or remove service cards shown on the website.</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Service</button>
      </div>

      {loading ? (
        <p style={{ color: '#7a8a80', padding: '32px 0' }}>Loading…</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label="Services list">
            <thead>
              <tr>
                <th className={styles.th}>Title</th>
                <th className={styles.th}>Description</th>
                <th className={styles.th}>Features</th>
                <th className={styles.th} style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(svc => (
                <tr key={svc.id} className={styles.tr}>
                  <td className={styles.td}><span className={styles.titleCell}>{svc.title}</span></td>
                  <td className={styles.td}><span className={styles.descCell}>{svc.description}</span></td>
                  <td className={styles.td}>
                    <div className={styles.featurePills}>
                      {svc.features.slice(0, 2).map(f => <span key={f} className={styles.pill}>{f}</span>)}
                      {svc.features.length > 2 && <span className={styles.pillMore}>+{svc.features.length - 2}</span>}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      <button className={styles.editBtn} onClick={() => openEdit(svc)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteTarget(svc.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={4} className={styles.emptyRow}>No services yet. Click &ldquo;+ Add Service&rdquo; to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editId ? 'Edit Service' : 'Add Service'} size="lg">
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="svc-title">Title <span className={styles.req}>*</span></label>
            <input id="svc-title" name="title" type="text" value={form.title} onChange={handleFormChange}
              className={`${styles.formInput} ${errors.title ? styles.formInputErr : ''}`}
              placeholder="e.g. Physical Training" maxLength={80}
              aria-invalid={!!errors.title} aria-describedby={errors.title ? 'svc-title-err' : 'svc-title-hint'} />
            {errors.title
              ? <span id="svc-title-err" className={styles.fieldError} role="alert">{errors.title}</span>
              : <span id="svc-title-hint" className={styles.formHint}>{countWords(form.title)}/{TITLE_WORD_LIMIT} words</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="svc-desc">Description <span className={styles.req}>*</span></label>
            <textarea id="svc-desc" name="description" value={form.description} onChange={handleFormChange}
              className={`${styles.formTextarea} ${errors.description ? styles.formInputErr : ''}`}
              placeholder="Describe this service…" rows={3}
              aria-invalid={!!errors.description} aria-describedby={errors.description ? 'svc-desc-err' : 'svc-desc-hint'} />
            {errors.description
              ? <span id="svc-desc-err" className={styles.fieldError} role="alert">{errors.description}</span>
              : <span id="svc-desc-hint" className={styles.formHint}>{countWords(form.description)}/{DESCRIPTION_WORD_LIMIT} words</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Features</label>
            <div className={styles.featuresList}>
              {form.features.map((feat, i) => (
                <div key={i} className={styles.featureRow}>
                  <input type="text" value={feat} onChange={e => handleFeatureChange(i, e.target.value)}
                    className={styles.formInput} placeholder={`Feature ${i + 1}`} maxLength={50} aria-label={`Feature ${i + 1}`} />
                  <button type="button" className={styles.removeFeatureBtn} onClick={() => removeFeature(i)}
                    aria-label="Remove feature" disabled={form.features.length <= 1}>✕</button>
                </div>
              ))}
              {form.features.length < 8 && (
                <button type="button" className={styles.addFeatureBtn} onClick={addFeature}>+ Add Feature</button>
              )}
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelFormBtn} onClick={closeModal}>Cancel</button>
            <button type="submit" className={styles.submitFormBtn} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        message="Are you sure you want to delete this service? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
