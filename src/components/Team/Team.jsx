import { useState, useEffect } from 'react'
import facebookIcon from '../../assets/facebook.svg'
import styles from './Team.module.css'

const DEFAULT_TEAM = [
  { id: 1, name: 'Col. Ram Bahadur Thapa', role: 'Founder & Director',        initials: 'RBT', photoUrl: null, phone: '', facebook: '' },
  { id: 2, name: 'Maj. Sanjay Gurung',     role: 'Head of Training',           initials: 'SG',  photoUrl: null, phone: '', facebook: '' },
  { id: 3, name: 'Capt. Bikram Rai',       role: 'Physical Training Director', initials: 'BR',  photoUrl: null, phone: '', facebook: '' },
  { id: 4, name: 'Ms. Puja Tamang',        role: 'Academic Coordinator',       initials: 'PT',  photoUrl: null, phone: '', facebook: '' },
]

export default function Team() {
  const [team, setTeam] = useState(DEFAULT_TEAM)

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length) setTeam(d.data) })
      .catch(() => {})
  }, [])

  return (
    <div className={styles.team}>
      <div className={styles.container}>
        <span className={styles.overline}>The People Behind Our Success</span>
        <h2 className={styles.title}>Our Team</h2>
        <p className={styles.subtitle}>
          Experienced military professionals and educators dedicated to your success in Gurkha selection.
        </p>

        <div className={styles.grid}>
          {team.map((member) => (
            <article key={member.id} className={styles.card}>
              <div className={styles.avatarWrap}>
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl} alt={member.name} className={styles.avatarImg}
                    style={{
                      objectPosition: `${member.cropX ?? 50}% ${member.cropY ?? 50}%`,
                      transform: `scale(${member.zoom ?? 1})`,
                      transformOrigin: `${member.cropX ?? 50}% ${member.cropY ?? 50}%`,
                    }}
                  />
                ) : (
                  <span className={styles.initials}>{member.initials}</span>
                )}
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{member.name}</h3>
                <span className={styles.role}>{member.role}</span>
                <div className={styles.contacts}>
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className={styles.contactLink}>
                      <span aria-hidden="true">📞</span> {member.phone}
                    </a>
                  )}
                  {member.facebook && (
                    <a href={member.facebook} className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                      <img src={facebookIcon} alt="" className={styles.facebookIcon} /> Facebook
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
