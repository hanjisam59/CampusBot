import { Link } from 'react-router-dom'
import { Bell, Bot, User, Upload } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function HomePage() {
  const { isAuthenticated, isAdminAuthenticated } = useAppStore()
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section className="hero" style={{ padding: 32, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 36 }}>Your Campus Assistant – Anytime, Anywhere.</h1>
        <p style={{ color: 'var(--muted)' }}>Multilingual help, 24×7 support, and anonymous queries.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          <Link to="/chatbot" className="btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Bot size={16}/> Chatbot</Link>
          <Link to="/notifications" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Bell size={16}/> Notifications</Link>
          {isAuthenticated && !isAdminAuthenticated ? (
            <Link to="/profile" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><User size={16}/> Profile</Link>
          ) : null}
          {isAuthenticated && !isAdminAuthenticated ? (
            <Link to="/upload-pdf" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Upload size={16}/> Upload PDF</Link>
          ) : null}
        </div>
      </section>

      <section className="section alt" style={{ padding: 16 }}>
        <div className="grid cols-3">
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600 }}>Multilingual</div>
            <div className="label">Switch languages instantly</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600 }}>24×7</div>
            <div className="label">Always available for queries</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600 }}>Anonymous</div>
            <div className="label">Ask privately and safely</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>Latest Alerts</div>
        <div className="grid cols-2">
          <Link to="/notifications" className="card" style={{ padding: 16 }}>Exam Form Deadline Extended →</Link>
          <Link to="/notifications" className="card" style={{ padding: 16 }}>Scholarship Window Opens →</Link>
        </div>
      </section>
    </div>
  )
}


