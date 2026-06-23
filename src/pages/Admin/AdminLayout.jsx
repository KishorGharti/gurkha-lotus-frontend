import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useLogo } from '../../hooks/useLogo'
import styles from './AdminLayout.module.css'

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/photos': 'Manage Photos',
  '/admin/services': 'Manage Services',
  '/admin/team': 'Manage Team',
}

const SIDEBAR_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/admin/photos', label: 'Manage Photos', icon: '🖼', end: false },
  { to: '/admin/services', label: 'Services', icon: '◈', end: false },
  { to: '/admin/team', label: 'Our Team', icon: '◉', end: false },
]

export default function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const logoUrl = useLogo()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin Panel'

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar} aria-label="Admin navigation">
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className={styles.logoSvg} />
          ) : (
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg} aria-hidden="true">
              <circle cx="25" cy="25" r="22" stroke="#c9a044" strokeWidth="2" />
              <path d="M25 10 C25 10 20 17 20 22 C20 27 25 30 25 30 C25 30 30 27 30 22 C30 17 25 10 25 10Z" fill="#c9a044" />
              <path d="M15 20 C15 20 19 23 22 25 C25 27 25 32 25 32 C25 32 20 31 18 28 C16 25 15 20 15 20Z" fill="#c9a044" opacity="0.8" />
              <path d="M35 20 C35 20 31 23 28 25 C25 27 25 32 25 32 C25 32 30 31 32 28 C34 25 35 20 35 20Z" fill="#c9a044" opacity="0.8" />
              <circle cx="25" cy="32" r="3" fill="#c9a044" />
            </svg>
          )}
          <div>
            <div className={styles.logoName}>GURKHA LOTUS BOOT CAMP</div>
            <div className={styles.logoSub}>Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Admin sections">
          <p className={styles.navGroup}>Management</p>
          {SIDEBAR_LINKS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon} aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}

          <div className={styles.divider} />

          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
            <span className={styles.navIcon} aria-hidden="true">↗</span>
            View Website
          </a>
        </nav>

        {/* Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.adminBadge}>
            <span className={styles.adminDot} aria-hidden="true" />
            <span>Administrator</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <p className={styles.breadcrumb}>Admin Panel / {pageTitle}</p>
          </div>
          <button onClick={handleLogout} className={styles.topbarLogout} aria-label="Sign out">
            Sign Out
          </button>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
