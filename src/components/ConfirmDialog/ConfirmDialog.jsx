import { useEffect } from 'react'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} role="alertdialog" aria-modal="true" aria-describedby="confirm-msg">
      <div className={styles.dialog}>
        <div className={styles.icon} aria-hidden="true">⚠</div>
        <p id="confirm-msg" className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
