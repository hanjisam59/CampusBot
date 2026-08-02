import { useMemo, useState, useEffect } from 'react'
import AlertCard from '../components/AlertCard'
import { Modal } from '../components/Modal'
import DATA from '../data/alerts.json'
import { Send } from 'lucide-react'

export default function NotificationsPage() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [publishedResponses, setPublishedResponses] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notices, setNotices] = useState([])

  const filtered = useMemo(() => {
    return DATA.filter((d) => (category === 'All' || d.category === category) && d.title.toLowerCase().includes(query.toLowerCase()))
  }, [category, query])

  const pinned = filtered.filter((f) => f.pinned)
  const rest = filtered.filter((f) => !f.pinned)

  const categories = ['All', 'Exams', 'Fees', 'Scholarships', 'Events']

  useEffect(() => {
    async function loadPublished() {
      try {
        const r = await fetch('http://localhost:8000/api/admin/queries/published')
        const j = await r.json()
        if (j?.items) setPublishedResponses(j.items)
      } catch (_) {}
    }
    loadPublished()
  }, [])

  useEffect(() => {
    async function loadNotices() {
      try {
        const r = await fetch('http://localhost:8000/api/notices')
        const j = await r.json()
        if (j?.notices) setNotices(j.notices)
      } catch (_) {}
    }
    loadNotices()
  }, [])

  async function submitQuestion() {
    if (!newQuestion.trim()) return
    setSubmitting(true)
    try {
      const user = JSON.parse(localStorage.getItem('student') || 'null')
      const userEmail = user?.email || null
      await fetch('http://localhost:8000/api/faq/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newQuestion, userEmail }),
      })
      setNewQuestion('')
      alert('Your question has been submitted to the admin team. You\'ll see the answer here once it\'s resolved.')
    } catch (e) {
      alert('Failed to submit question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button key={c} className={`btn ${c === category ? 'primary' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', minWidth: 240 }}>
          <input className="input" placeholder="Search notices..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <section className="section alt" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Latest Updates & Announcements</div>
        <div style={{ columnCount: 3, columnGap: 16 }}>
          {publishedResponses.length === 0 ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="card" style={{
                breakInside: 'avoid',
                padding: 12,
                marginBottom: 16,
                minHeight: 60 + (i % 3) * 30,
                backgroundImage: 'linear-gradient(180deg, rgba(85,194,195,0.10), rgba(255,255,255,1))'
              }}>
                <div style={{ fontWeight: 600 }}>Update {i + 1}</div>
                <div className="label">Short announcement copy goes here.</div>
              </div>
            ))
          ) : (
            publishedResponses.map((item, i) => (
              <div key={item._id} className="card" style={{
                breakInside: 'avoid',
                padding: 12,
                marginBottom: 16,
                minHeight: 80,
                backgroundImage: 'linear-gradient(180deg, rgba(85,194,195,0.10), rgba(255,255,255,1))'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Q: {item.question}</div>
                <div className="label" style={{ marginBottom: 4 }}>A: {item.response}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Ask a Question</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input 
            className="input" 
            placeholder="Type your question here..." 
            value={newQuestion} 
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitQuestion()}
            style={{ flex: 1 }}
          />
          <button 
            className="btn primary" 
            onClick={submitQuestion} 
            disabled={submitting || !newQuestion.trim()}
          >
            <Send size={16}/> {submitting ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Your question will be reviewed by the admin team and answered here once resolved.
        </div>
      </section>

      {(pinned.length > 0 || notices.filter(n => n.pinned).length > 0) && (
        <section>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Pinned Alerts/Deadlines</div>
          <div className="grid cols-2">
            {/* Show pinned notices first (priority) */}
            {notices
              .filter(n => n.pinned)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((notice) => (
                <div key={notice._id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setDetail({
                  title: notice.heading,
                  date: new Date(notice.date).toLocaleDateString(),
                  category: notice.type,
                  description: notice.description || 'No additional details available.',
                  status: 'pinned'
                })}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>📌</span>
                    <div style={{ fontWeight: 600 }}>{notice.heading}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`badge ${notice.type === 'Exams' ? 'red' : notice.type === 'Events' ? 'yellow' : notice.type === 'Fees' ? 'orange' : 'green'}`}>
                      {notice.type}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      📅 {new Date(notice.date).toLocaleDateString()}
                    </span>
                  </div>
                  {notice.description && (
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>{notice.description}</div>
                  )}
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <span style={{ fontSize: 16 }}>→</span>
                  </div>
                </div>
              ))}
            {/* Show existing pinned alerts */}
            {pinned.map((i) => (
              <AlertCard key={i.id} item={i} onOpen={setDetail} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="grid cols-2">
          {/* Show non-pinned notices */}
          {notices
            .filter(n => !n.pinned)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((notice) => (
              <div key={notice._id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setDetail({
                title: notice.heading,
                date: new Date(notice.date).toLocaleDateString(),
                category: notice.type,
                description: notice.description || 'No additional details available.',
                status: 'normal'
              })}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{notice.heading}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={`badge ${notice.type === 'Exams' ? 'red' : notice.type === 'Events' ? 'yellow' : notice.type === 'Fees' ? 'orange' : 'green'}`}>
                    {notice.type}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    📅 {new Date(notice.date).toLocaleDateString()}
                  </span>
                </div>
                {notice.description && (
                  <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>{notice.description}</div>
                )}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16 }}>→</span>
                </div>
              </div>
            ))}
          {/* Show existing non-pinned alerts */}
          {rest.map((i) => (
            <AlertCard key={i.id} item={i} onOpen={setDetail} />
          ))}
        </div>
      </section>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div className={`badge ${detail?.status === 'urgent' ? 'red' : detail?.status === 'upcoming' ? 'yellow' : 'green'}`}>{detail?.category}</div>
          <div style={{ color: 'var(--muted)' }}>{detail?.date}</div>
          <div>{detail?.description || 'No extra details available.'}</div>
        </div>
      </Modal>
    </div>
  )
}


