import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Modal } from './Modal'

export function ProfileCard({ initial }) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(initial)
  const { setLanguage, setNotificationPreference } = useAppStore()

  function save() {
    setLanguage(profile.language)
    setNotificationPreference(profile.notify)
    setOpen(false)
  }

  return (
    <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Basic Info</div>
        <div className="grid cols-2">
          <div className="card" style={{ padding: 12 }}>Name: {profile.name}</div>
          <div className="card" style={{ padding: 12 }}>Enrollment: {profile.enrollment}</div>
          <div className="card" style={{ padding: 12 }}>Course: {profile.course}</div>
          <div className="card" style={{ padding: 12 }}>Email: {profile.email}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Preferences</div>
        <div className="grid cols-2">
          <div className="card" style={{ padding: 12 }}>
            <div className="label">Language</div>
            <select className="select" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div className="label">Notifications</div>
            <select className="select" value={profile.notify} onChange={(e) => setProfile({ ...profile, notify: e.target.value })}>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="portal">Portal</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <button className="btn" onClick={() => setOpen(true)}>Edit Profile</button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit Profile">
        <div className="grid cols-2">
          <div>
            <div className="label">Name</div>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <div className="label">Enrollment</div>
            <input className="input" value={profile.enrollment} onChange={(e) => setProfile({ ...profile, enrollment: e.target.value })} />
          </div>
          <div>
            <div className="label">Course</div>
            <input className="input" value={profile.course} onChange={(e) => setProfile({ ...profile, course: e.target.value })} />
          </div>
          <div>
            <div className="label">Email</div>
            <input className="input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div>
            <div className="label">Language</div>
            <select className="select" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
          <div>
            <div className="label">Notifications</div>
            <select className="select" value={profile.notify} onChange={(e) => setProfile({ ...profile, notify: e.target.value })}>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="portal">Portal</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </Modal>
    </div>
  )
}

export default ProfileCard


