import { useEffect, useRef, useState } from 'react'

function CreateNoticePanel() {
  const [heading, setHeading] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('All')
  const [description, setDescription] = useState('')
  const [pinned, setPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function createNotice() {
    if (!heading.trim() || !date) {
      alert('Please fill in heading and date')
      return
    }
    setSubmitting(true)
    try {
      await fetch('http://localhost:8000/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading, date, type, description, pinned })
      })
      alert('Notice created successfully!')
      setHeading('')
      setDate('')
      setType('All')
      setDescription('')
      setPinned(false)
    } catch (e) {
      alert('Failed to create notice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Create Notice</div>
      <div className="label" style={{ flex: 1 }}>Post new alerts to students</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input 
          className="input" 
          placeholder="Notice heading" 
          value={heading} 
          onChange={(e) => setHeading(e.target.value)}
        />
        <input 
          type="date" 
          className="input" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
        />
        <select 
          className="select" 
          value={type} 
          onChange={(e) => setType(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Events">Events</option>
          <option value="Exams">Exams</option>
          <option value="Fees">Fees</option>
          <option value="Scholarships">Scholarships</option>
        </select>
        <textarea 
          className="textarea" 
          rows={3} 
          placeholder="Description (optional)" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="checkbox" 
            checked={pinned} 
            onChange={(e) => setPinned(e.target.checked)}
          />
          Pin this notice
        </label>
        <button 
          className="btn primary" 
          onClick={createNotice} 
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Notice'}
        </button>
      </div>
    </div>
  )
}

function AdminQueriesPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [responseById, setResponseById] = useState({})

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('http://localhost:8000/api/admin/queries')
      const j = await r.json()
      if (j?.items) setItems(j.items)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function resolve(id) {
    const response = responseById[id] || ''
    if (!response.trim()) {
      alert('Please enter a response before resolving.')
      return
    }
    try {
      await fetch(`http://localhost:8000/api/admin/queries/${id}/resolve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ response })
      })
      await load()
      alert('Query resolved! Response will appear in Latest Updates section.')
    } catch (e) { alert('Failed to resolve') }
  }

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Manage Chat FAQs</div>
      <div className="label" style={{ flex: 1 }}>Incoming queries not found in dataset</div>
      <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        {loading ? <div style={{ padding: 12 }}>Loading…</div> : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Question</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8, width: 280 }}>Admin Response</th><th style={{ padding: 8 }}>Action</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? <tr><td style={{ padding: 12 }} colSpan={4}>No pending queries</td></tr> : items.map((q) => (
                <tr key={q._id}>
                  <td style={{ padding: 8 }}>{q.question}</td>
                  <td style={{ padding: 8 }}>{q.status}</td>
                  <td style={{ padding: 8 }}>
                    <input className="input" placeholder="Type reply" value={responseById[q._id] || ''} onChange={(e) => setResponseById((m) => ({ ...m, [q._id]: e.target.value }))} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <button className="btn primary" onClick={() => resolve(q._id)}>Resolve issue</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
    </div>
  )
}
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  const fileRef = useRef(null)
  const [uploaded, setUploaded] = useState(null)
  const [knowledge, setKnowledge] = useState('')
  const [logs, setLogs] = useState([])
  const [fileBlob, setFileBlob] = useState(null)
  const [recentUploads, setRecentUploads] = useState([])
  const [selected, setSelected] = useState(null)

  function addLog(line) {
    setLogs((l) => [new Date().toLocaleTimeString() + ' — ' + line, ...l].slice(0, 20))
  }

  function onPick() { fileRef.current?.click() }
  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setUploaded({ name: f.name, sizeKb: Math.round(f.size / 1024) })
    setFileBlob(f)
    addLog(`Queued file for ingestion: ${f.name} (${Math.round(f.size / 1024)} KB)`) 
  }

  async function ingestFile() {
    if (!fileBlob) return
    try {
      const form = new FormData()
      form.append('file', fileBlob)
      form.append('knowledge', knowledge || '')
      const res = await fetch('http://localhost:8000/api/upload/merge', {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.msg || err.error || 'Upload failed')
      }
      const data = await res.json()
      addLog(`Merged and saved: ${data.file.merged}`)
      // Fetch recent uploads after success
      try {
        const r = await fetch('http://localhost:8000/api/upload')
        const j = await r.json()
        if (Array.isArray(j.uploads)) setRecentUploads(j.uploads)
      } catch {}
      setKnowledge('')
      alert('PDF saved with appended knowledge page.')
    } catch (e) {
      alert(e.message)
    }
  }

  // Load history on mount
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('http://localhost:8000/api/upload')
        const j = await r.json()
        if (Array.isArray(j.uploads)) setRecentUploads(j.uploads)
      } catch {}
    })()
  }, [])

  // Close preview on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function ingestKnowledge() {
    if (!knowledge.trim()) return
    addLog(`Ingested text knowledge (${knowledge.length} chars)`) 
    setKnowledge('')
    alert('Mock: Text knowledge saved to dataset.')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Admin Dashboard</div>
          <div className="label">Upload documents or add text knowledge to the dataset (mock).</div>
        </div>
      </div>

      <div className="grid cols-2">
        <section className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 600 }}>Document Upload</div>
          <input ref={fileRef} type="file" className="sr-only" onChange={onFileChange} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={onPick}>Choose File</button>
            <button className="btn primary" onClick={ingestFile} disabled={!uploaded}>Ingest to Dataset</button>
          </div>
          {uploaded && (
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{uploaded.name}</div>
              <div className="label">{uploaded.sizeKb} KB</div>
            </div>
          )}
          <div className="label">Accepted: PDF, DOCX, TXT (demo-only; no backend wired).</div>
        </section>

        <section className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 600 }}>Add Text Knowledge</div>
          <textarea className="textarea" rows={8} placeholder="Paste policy, FAQ, or notes..." value={knowledge} onChange={(e) => setKnowledge(e.target.value)}></textarea>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={ingestKnowledge} disabled={!knowledge.trim()}>Save to Dataset</button>
            <button className="btn" onClick={() => setKnowledge('')}>Clear</button>
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Ingestion Logs</div>
        <div className="label">Latest actions (mocked):</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {logs.length === 0 && <li>No actions yet</li>}
          {logs.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        {recentUploads.length > 0 && (
          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Recent uploads (from DB)</div>
            <div className="grid cols-2" style={{ gap: 12 }}>
              <ul style={{ margin: 0, paddingLeft: 18, maxHeight: 260, overflow: 'auto' }}>
                {recentUploads.map((u) => (
                  <li key={u._id}>
                    <button className="link" style={{ cursor: 'pointer' }} onClick={() => setSelected(u)}>
                      <code>{u.mergedName}</code>
                    </button>
                    <span className="label"> — {new Date(u.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div>
                {selected ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selected.mergedName}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a className="btn" href={`http://localhost:8000/uploads/${selected.mergedName}`} target="_blank" rel="noreferrer">Open</a>
                        <button className="btn" onClick={() => setSelected(null)}>Close</button>
                      </div>
                    </div>
                    <iframe
                      title="Preview"
                      src={`http://localhost:8000/uploads/${selected.mergedName}`}
                      style={{ width: '100%', height: 260, border: '1px solid var(--border)' }}
                    />
                  </div>
                ) : (
                  <div className="label">Select an item to preview merged PDF</div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="grid cols-3">
        <CreateNoticePanel />
        <AdminQueriesPanel />
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600 }}>Student Reports</div>
          <div className="label" style={{ flex: 1 }}>View usage and engagement</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a className="btn" href="#">Open</a>
          </div>
        </div>
      </div>
    </div>
  )
}


