import ProfileCard from '../components/ProfileCard'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'

export default function ProfilePage() {
  const { student } = useAppStore()
  const [data, setData] = useState(student ? {
    name: student.fullName,
    enrollment: student.enrollmentNo || '',
    course: student.course || '',
    email: student.email || '',
    language: 'en',
    notify: 'portal',
  } : null)

  useEffect(() => {
    // If page is hard-refreshed, try to fetch profile with token
    if (!data) {
      const token = localStorage.getItem('token')
      if (token) {
        fetch('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.student) {
              setData({
                name: j.student.fullName,
                enrollment: j.student.enrollmentNo || '',
                course: j.student.course || '',
                email: j.student.email || '',
                language: 'en',
                notify: 'portal',
              })
            }
          })
          .catch(() => {})
      }
    }
  }, [data])

  if (!data) return <div className="card" style={{ padding: 16 }}>Loading profile...</div>

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ProfileCard initial={data} />
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Saved Queries</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>How to apply for re-evaluation?</li>
          <li>What is the exam timetable?</li>
          <li>How to avail merit scholarship?</li>
        </ul>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Personalized Reminders</div>
        <div className="badge yellow">Fee due on 25th Sept</div>
      </div>
    </div>
  )
}


