import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About Us' },
  { href: '#services', label: 'Services' },
  { href: '#team', label: 'Our Team' },
  { href: '#contact', label: 'Contact' },
]

const SECTIONS = ['home', 'about', 'services', 'team', 'contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { theme, toggleTheme } = useTheme()

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50)

    // Near the bottom of the page, always highlight the last section — its
    // offsetTop can sit beyond the maximum reachable scroll position when the
    // section itself is shorter than the viewport, so the offset check below
    // would never match it and the previous section would stay active forever.
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    if (atBottom) {
      setActiveSection(SECTIONS[SECTIONS.length - 1])
      return
    }

    const offset = window.scrollY + 100
    for (let i = SECTIONS.length - 1; i >= 0; i--) {
      const el = document.getElementById(SECTIONS[i])
      if (el && el.offsetTop <= offset) {
        setActiveSection(SECTIONS[i])
        break
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scrollTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.container}>
        {/* Logo */}
        <a href="#home" className={styles.logo} onClick={(e) => scrollTo(e, '#home')} aria-label="Gurkha Lotus — go to home">
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="25" cy="25" r="22" stroke="#c9a044" strokeWidth="2" />
              <path d="M25 10 C25 10 20 17 20 22 C20 27 25 30 25 30 C25 30 30 27 30 22 C30 17 25 10 25 10Z" fill="#c9a044" />
              <path d="M15 20 C15 20 19 23 22 25 C25 27 25 32 25 32 C25 32 20 31 18 28 C16 25 15 20 15 20Z" fill="#c9a044" opacity="0.8" />
              <path d="M35 20 C35 20 31 23 28 25 C25 27 25 32 25 32 C25 32 30 31 32 28 C34 25 35 20 35 20Z" fill="#c9a044" opacity="0.8" />
              <circle cx="25" cy="32" r="3" fill="#c9a044" />
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>GURKHA</span>
            <span className={styles.logoSub}>LOTUS</span>
          </div>
        </a>

        <div className={styles.navRight}>
          {/* Hamburger */}
          <button
            className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnActive : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span />
            <span />
            <span />
          </button>

          {/* Links */}
          <ul className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`} role="menubar">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href} role="none">
                <a
                  href={href}
                  className={`${styles.navLink} ${activeSection === href.slice(1) ? styles.navLinkActive : ''}`}
                  onClick={(e) => scrollTo(e, href)}
                  role="menuitem"
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contact" className={styles.ctaBtn} onClick={(e) => scrollTo(e, '#contact')}>
                Enroll Now
              </a>
            </li>
          </ul>

          {/* Theme toggle — pinned at the very top-right corner */}
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
