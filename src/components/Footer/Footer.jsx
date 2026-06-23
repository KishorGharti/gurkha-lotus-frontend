import { useLogo } from '../../hooks/useLogo'
import styles from './Footer.module.css'

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About Us' },
  { href: '#services', label: 'Services' },
  { href: '#team', label: 'Our Team' },
]

export default function Footer() {
  const logoUrl = useLogo()

  const scrollTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.container}>
        <div className={styles.row}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              {logoUrl ? (
                <img src={logoUrl} alt="" className={styles.logoSvg} />
              ) : (
                <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={styles.logoSvg}>
                  <circle cx="25" cy="25" r="22" stroke="#c9a044" strokeWidth="2" />
                  <path d="M25 10 C25 10 20 17 20 22 C20 27 25 30 25 30 C25 30 30 27 30 22 C30 17 25 10 25 10Z" fill="#c9a044" />
                  <path d="M15 20 C15 20 19 23 22 25 C25 27 25 32 25 32 C25 32 20 31 18 28 C16 25 15 20 15 20Z" fill="#c9a044" opacity="0.8" />
                  <path d="M35 20 C35 20 31 23 28 25 C25 27 25 32 25 32 C25 32 30 31 32 28 C34 25 35 20 35 20Z" fill="#c9a044" opacity="0.8" />
                  <circle cx="25" cy="32" r="3" fill="#c9a044" />
                </svg>
              )}
              <div>
                <div className={styles.logoName}>GURKHA LOTUS BOOT CAMP</div>
                <div className={styles.logoTagline}>Elite Military Training</div>
              </div>
            </div>
            <p className={styles.brandText}>
              Forging warriors with honor, discipline, and the indomitable spirit of the
              Gurkha tradition since 1814 AD.
            </p>
          </div>

          {/* Contact info */}
          <div>
            <h4 className={styles.colTitle}>Contact Info</h4>
            <ul className={styles.contactList}>
              <li>
                <span aria-hidden="true">📍</span>
                <span> <h2> Address</h2>
                  Ghorahi-14, Naya Bajar, Dang(Near Nepal Telecom)</span>
              </li>
              <li>
                <span aria-hidden="true">📞</span>
                <span> <h2> Phone</h2>
                <a href="tel:+9779846260832" className={styles.footerLink}>+977-9846260832/082-591832</a> </span>
              </li>
            
              <li>
                <span aria-hidden="true">📱</span>
                <span> <h2> Whatsapp </h2>
                <a href="tel:+9779846260832" className={styles.footerLink}>+977-9846260832</a> </span>
              </li>
              
              <li>
                <span aria-hidden="true">📧</span>
                <span> <h2> Email </h2>
                <a href="##" className={styles.footerLink}>gurkhalotusbootcamp@gmail.com</a> </span>
                </li>  
              
              <li>
                <span aria-hidden="true">🕐</span>
                <span> <h2> Office Hour</h2>
                <span>Sun – Fri: 10:00 AM – 5:00 PM</span> </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Map */}
        <div className={styles.mapSection}>
          <h4 className={styles.colTitle}>Find Us</h4>
          <div className={styles.mapWrap}>
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1920.046734626474!2d82.48977874353653!3d28.043384096433357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3997950073560b15%3A0xa1a7569a8e133f43!2sGurkha%20Lotus%20Boot%20Camp%2C%20Dang!5e0!3m2!1sen!2snp!4v1780816142931!5m2!1sen!2snp"
              width="1000"
              height="450"
              style={{ border: 5 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>&copy; {year} Gurkha Lotus Boot Camp. All rights reserved.</p>
          <p className={styles.copy}>Developed by: Design Ghar</p>
        </div>
      </div>
    </footer>
  )
}
