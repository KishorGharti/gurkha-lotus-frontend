import { useState, useEffect } from 'react'
import styles from './Services.module.css'

const DEFAULT_SERVICES = [
  { id: 1, title: 'Training Hostel',       description: 'Comfortable, secure accommodation purpose-built for trainees. A disciplined residential environment with all amenities for focused preparation.',       features: ['24/7 Security', 'Nutritious Meals', 'Study Rooms', 'Laundry Service'] },
  { id: 2, title: 'Physical Training',     description: 'Intensive conditioning programs designed to meet and exceed Gurkha selection standards — cardio, strength, endurance, and agility.',                    features: ['Daily PT Sessions', 'Run & March Training', 'Swimming', 'Obstacle Courses'] },
  { id: 3, title: 'Academic Preparation',  description: 'Comprehensive coaching for army entrance examinations: written tests, English proficiency, and general knowledge.',                                       features: ['Written Exam Prep', 'English Classes', 'GK & Current Affairs', 'Mock Tests'] },
  { id: 4, title: 'Medical Fitness',       description: 'Guidance and training to achieve the strict medical fitness standards required for Gurkha selection, including diet and injury prevention.',               features: ['Health Assessments', 'Diet Planning', 'Injury Prevention', 'Medical Guidance'] },
  { id: 5, title: 'Psychological Training',description: 'Mental resilience and psychological preparation for the gruelling selection process and sustained life in the armed forces.',                              features: ['Mental Toughness', 'Stress Management', 'Leadership Skills', 'Team Building'] },
  { id: 6, title: 'Career Counseling',     description: 'Expert guidance on career paths, application processes, and post-selection development — from an experienced team who have been there.',                 features: ['Selection Guidance', 'Application Support', 'Career Planning', 'Alumni Network'] },
]

export default function Services() {
  const [services, setServices] = useState(DEFAULT_SERVICES)

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length) setServices(d.data) })
      .catch(() => {})
  }, [])

  return (
    <div className={styles.services}>
      <div className={styles.container}>
        <span className={styles.overline}>What We Offer</span>
        <h2 className={styles.title}>Our Services</h2>
        <p className={styles.subtitle}>
          Comprehensive programs designed to prepare you for success in Gurkha army selection and beyond.
        </p>

        <div className={styles.grid}>
          {services.map((svc) => (
            <article key={svc.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{svc.title}</h3>
              <p className={styles.cardDesc}>{svc.description}</p>
              <ul className={styles.features} aria-label={`${svc.title} features`}>
                {svc.features.map((feat) => (
                  <li key={feat} className={styles.featureItem}>
                    <span className={styles.featureMark} aria-hidden="true">▸</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
