import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useLogo } from '../../hooks/useLogo'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const { isAuth, login } = useAdminAuth()
  const logoUrl = useLogo()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuth) return <Navigate to="/admin" replace />

  const handleChange = (e) => {
    setError('')
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password) return
    setLoading(true)
    const result = await login(form.username.trim(), form.password)
    setLoading(false)
    if (result.success) navigate('/admin', { replace: true })
    else setError(result.message || 'Invalid username or password.')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className={styles.svg} />
          ) : (
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svg} aria-hidden="true">
              <circle cx="25" cy="25" r="22" stroke="#c9a044" strokeWidth="2" />
              <path d="M25 10 C25 10 20 17 20 22 C20 27 25 30 25 30 C25 30 30 27 30 22 C30 17 25 10 25 10Z" fill="#c9a044" />
              <path d="M15 20 C15 20 19 23 22 25 C25 27 25 32 25 32 C25 32 20 31 18 28 C16 25 15 20 15 20Z" fill="#c9a044" opacity="0.8" />
              <path d="M35 20 C35 20 31 23 28 25 C25 27 25 32 25 32 C25 32 30 31 32 28 C34 25 35 20 35 20Z" fill="#c9a044" opacity="0.8" />
              <circle cx="25" cy="32" r="3" fill="#c9a044" />
            </svg>
          )}
          <h1 className={styles.brand}>GURKHA LOTUS BOOT CAMP</h1>
          <p className={styles.panelLabel}>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form} aria-label="Admin login form">
          {error && (
            <div className={styles.errorBanner} role="alert">
              <span aria-hidden="true">⚠</span> {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={`${styles.input} ${error ? styles.inputErr : ''}`}
              placeholder="Enter username"
              autoComplete="username"
              maxLength={80}
              required
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.passWrap}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`${styles.input} ${styles.passInput} ${error ? styles.inputErr : ''}`}
                placeholder="Enter password"
                autoComplete="current-password"
                maxLength={128}
                required
              />
              <button
                type="button"
                className={styles.showPassBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} aria-label="Signing in…" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <a href="/" className={styles.backLink}>← Back to Website</a>
      </div>
    </div>
  )
}
