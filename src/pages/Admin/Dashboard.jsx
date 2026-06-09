import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Dashboard.module.css'

const QUICK_ACTIONS = [
  { to: '/admin/photos',   icon: '🖼', label: 'Manage Photos',   desc: 'Update hero slides and about page image' },
  { to: '/admin/services', icon: '◈',  label: 'Manage Services', desc: 'Add, edit or remove service offerings' },
  { to: '/admin/team',     icon: '◉',  label: 'Manage Team',     desc: 'Update team members and their profiles' },
]

export default function Dashboard() {
  const [stats, setStats] = useState({ services: '…', team: '…', photos: '…' })

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/team').then(r => r.json()),
      fetch('/api/photos').then(r => r.json()),
    ]).then(([svc, tm, ph]) => {
      setStats({
        services: svc.success ? svc.data.length : '?',
        team:     tm.success  ? tm.data.length  : '?',
        photos:   ph.success  ? Object.keys(ph.data).length : '?',
      })
    }).catch(() => setStats({ services: '?', team: '?', photos: '?' }))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const STAT_CARDS = [
    { value: stats.services, label: 'Services Listed', color: '#c9a044' },
    { value: stats.team,     label: 'Team Members',    color: '#4caf6e' },
    { value: stats.photos,   label: 'Photos Uploaded', color: '#5b8dd9' },
    { value: '✓',            label: 'System Active',   color: '#9c6cd4' },
  ]

  return (
    <div className={styles.dashboard}>
      <div className={styles.greeting}>
        <div>
          <h2 className={styles.greetingTitle}>{greeting}, Administrator</h2>
          <p className={styles.greetingText}>
            Welcome to the Gurkha Lotus admin panel. Manage your website content below.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className={styles.viewSiteBtn}>
          View Live Website ↗
        </a>
      </div>

      <div className={styles.statsGrid}>
        {STAT_CARDS.map(({ value, label, color }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statValue} style={{ color }}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle}>Quick Actions</h3>
      <div className={styles.actionsGrid}>
        {QUICK_ACTIONS.map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className={styles.actionCard}>
            <span className={styles.actionIcon} aria-hidden="true">{icon}</span>
            <div>
              <div className={styles.actionLabel}>{label}</div>
              <div className={styles.actionDesc}>{desc}</div>
            </div>
            <span className={styles.actionArrow} aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
