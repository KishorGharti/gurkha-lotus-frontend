import { useState, useEffect, useCallback } from 'react'
import { usePhotos } from '../../context/PhotosContext'
import { optimizedImageUrl, placeholderImageUrl } from '../../utils/cloudinaryUrl'
import styles from './Hero.module.css'

const SLIDES = [
  {
    id: 1, slotId: 'hero-1',
    gradient: 'linear-gradient(135deg, rgba(6,20,6,0.88) 0%, rgba(20,55,20,0.72) 50%, rgba(6,14,6,0.88) 100%)',
    fallbackBg: '#0a1f0a',
    badge: '✦  STRENGTH · HONOR · LOYALTY  ✦',
    title: 'Elite Military Training',
    subtitle: 'Preparing the next generation of Gurkha warriors with world-class programs and expert instructors.',
    cta1: { text: 'Explore Programs', href: '#services' },
    cta2: { text: 'Learn More',       href: '#about' },
  },
  {
    id: 2, slotId: 'hero-2',
    gradient: 'linear-gradient(135deg, rgba(6,10,22,0.88) 0%, rgba(12,28,52,0.72) 50%, rgba(6,8,20,0.88) 100%)',
    fallbackBg: '#080e1a',
    badge: '✦  TRAINED · DISCIPLINED · READY  ✦',
    title: 'Gurkha Legacy Lives On',
    subtitle: 'Continuing the proud 200-year tradition of Gurkha excellence and service to the nation.',
    cta1: { text: 'Our Services', href: '#services' },
    cta2: { text: 'Meet the Team', href: '#team' },
  },
  {
    id: 3, slotId: 'hero-3',
    gradient: 'linear-gradient(135deg, rgba(20,15,0,0.88) 0%, rgba(50,36,0,0.72) 50%, rgba(20,12,0,0.88) 100%)',
    fallbackBg: '#140f00',
    badge: '✦  EQUIPPED · PREPARED · VICTORIOUS  ✦',
    title: 'World-Class Facilities',
    subtitle: 'Modern training infrastructure, obstacle courses, and specialist equipment for peak performance.',
    cta1: { text: 'View Facilities', href: '#services' },
    cta2: { text: 'Contact Us',      href: '#contact' },
  },
  {
    id: 4, slotId: 'hero-4',
    gradient: 'linear-gradient(135deg, rgba(20,6,6,0.88) 0%, rgba(46,14,14,0.72) 50%, rgba(20,6,6,0.88) 100%)',
    fallbackBg: '#140606',
    badge: '✦  COMFORT · COMMUNITY · EXCELLENCE  ✦',
    title: 'Training Hostel & Accommodation',
    subtitle: 'A safe, disciplined home away from home for every aspiring Gurkha soldier.',
    cta1: { text: 'Accommodation', href: '#services' },
    cta2: { text: 'Enroll Now',    href: '#contact' },
  },
]

export default function Hero() {
  const { photos } = usePhotos()
  const [current, setCurrent]         = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [otherSlidesUnlocked, setOtherSlidesUnlocked] = useState(false)
  const [loadedIds, setLoadedIds] = useState({})

  const slides = SLIDES.map(s => {
    const photo = photos[s.slotId]
    return {
      ...s,
      image: optimizedImageUrl(photo?.url, { width: 1920 }),
      placeholder: placeholderImageUrl(photo?.url),
      cropX: photo?.cropX, cropY: photo?.cropY, zoom: photo?.zoom,
    }
  })

  useEffect(() => {
    const t = setTimeout(() => setOtherSlidesUnlocked(true), 800)
    return () => clearTimeout(t)
  }, [])

  const goTo = useCallback((index) => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => { setCurrent(index); setTransitioning(false) }, 350)
  }, [transitioning])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length])
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo, slides.length])

  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t) }, [next])

  const scrollTo = (e, href) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }) }

  const slide = slides[current]

  return (
    <div className={styles.hero} aria-roledescription="carousel" aria-label="Featured highlights">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`${styles.slide} ${i === current ? styles.slideActive : ''}`}
          style={{
            backgroundColor: s.fallbackBg,
            backgroundImage: s.placeholder ? `url(${s.placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: `${s.cropX ?? 50}% ${s.cropY ?? 50}%`,
          }}
          aria-hidden={i !== current}
        >
          {s.image && (i === current || otherSlidesUnlocked) && (
            <img
              src={s.image} alt="" loading={i === current ? 'eager' : 'lazy'}
              className={`${styles.slideImg} ${loadedIds[s.id] ? styles.slideImgLoaded : ''}`}
              onLoad={() => setLoadedIds(prev => ({ ...prev, [s.id]: true }))}
              style={{
                objectPosition: `${s.cropX ?? 50}% ${s.cropY ?? 50}%`,
                transform: `scale(${s.zoom ?? 1})`,
                transformOrigin: `${s.cropX ?? 50}% ${s.cropY ?? 50}%`,
              }}
            />
          )}
          <div className={styles.slideGradient} style={{ backgroundImage: s.gradient }} />
        </div>
      ))}

      <div className={styles.pattern} aria-hidden="true" />

      <div className={`${styles.content} ${transitioning ? styles.contentOut : styles.contentIn}`}
        aria-live="polite" aria-atomic="true">
        <span className={styles.badge}>{slide.badge}</span>
        <h1 className={styles.title}>{slide.title}</h1>
        <p className={styles.subtitle}>{slide.subtitle}</p>
        <div className={styles.actions}>
          <a href={slide.cta1.href} className={styles.btnPrimary}  onClick={e => scrollTo(e, slide.cta1.href)}>{slide.cta1.text}</a>
          <a href={slide.cta2.href} className={styles.btnSecondary} onClick={e => scrollTo(e, slide.cta2.href)}>{slide.cta2.text}</a>
        </div>
      </div>

      <div className={styles.dots} role="tablist" aria-label="Slide navigation">
        {slides.map((_, i) => (
          <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} aria-selected={i === current} role="tab" />
        ))}
      </div>

      
    </div>
  )
}
