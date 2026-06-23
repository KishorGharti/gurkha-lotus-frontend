import { usePhotos } from '../../context/PhotosContext'
import { optimizedImageUrl } from '../../utils/cloudinaryUrl'
import styles from './About.module.css'

const STATS = [
  { value: '15+',  label: 'Years of Excellence' },
  { value: '4000+', label: 'Trained Students' },
  { value: '95%',  label: 'Selection Rate' },
  { value: '10+',  label: 'Expert Instructors' },
]

const HIGHLIGHTS = [
  'British Army & Singapore Police Certified Programs',
  'Nepal Army,Nepal Police & Armed Police Force Certified Programs',
  'Expert Experience Instructors',
  'Fully Equipped Training Facilities',
  'Comfortable Hostel Accommodation',
]

export default function About() {
  const { photos } = usePhotos()
  const aboutPhoto = photos.about

  const scrollTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={styles.about}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.imageCol}>
            <div className={styles.imgWrap}>
              {aboutPhoto ? (
                <img
                  src={optimizedImageUrl(aboutPhoto.url, { width: 900 })} alt="Gurkha Lotus Boot Camp training ground"
                  style={{
                    objectPosition: `${aboutPhoto.cropX ?? 50}% ${aboutPhoto.cropY ?? 50}%`,
                    transform: `scale(${aboutPhoto.zoom ?? 1})`,
                    transformOrigin: `${aboutPhoto.cropX ?? 50}% ${aboutPhoto.cropY ?? 50}%`,
                  }}
                />
              ) : (
                <div className={styles.imgPlaceholder}>
                  <span>Add your image here</span>
                  <small>Upload via Admin → Manage Photos</small>
                </div>
              )}
            </div>
            <div className={styles.decor} aria-hidden="true" />
          </div>

          <div className={styles.textCol}>
            <span className={styles.overline}>About Gurkha Lotus Boot Camp</span>
            <h2 className={styles.title}>
              A Legacy of<br />
              <span className={styles.accent}>Gurkha Excellence</span>
            </h2>
            <p className={styles.body}>
              Gurkha Lotus Boot Camp is a dedicated training center of ghorahi-14,Dang
              established in 2082 B.S with the mission of preparing young Nepalese youths,
              particularly those aged 18 to 21 years, for the highly competitive selection 
              processes of the British Gurkhas Army, and the Gurkha Contingent of Singapore Police Force.
              Since its establishment, Gurkha Lotus Boot Camp has been continously working to train Nepalese
              Youths who dream of becoming part of the prestigious Brigade of Gurkhas and the Singapore Police force.
            </p>
            <p className={styles.body}>
              A key strength of Gurkha Lotus Boot Camp is the active involvement of its founder, Mr.
              Bal Bahadur Budha Magar. With 18 years of experience as an instructor and mentor, he plays a direct role
              in the day-to-day training of candidates. Gurkha Lotus Boot Camp believes that becoming a Gurkha is not only
              physical strength but also about character, commitment and perseverance.
              It runs with motto of "Discipline, Dedication and Determination for a better future"
            </p>

            <ul className={styles.highlights} aria-label="Key features">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className={styles.highlightItem}>
                  <span className={styles.bullet} aria-hidden="true">✦</span>
                  {item}
                </li>
              ))}
            </ul>

            <a href="#contact" className={styles.btn} onClick={(e) => scrollTo(e, '#contact')}>
              Get In Touch
            </a>
          </div>
        </div>

        <div className={styles.statsBar} aria-label="Key statistics">
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
