import { Calendar, Pin, ArrowRight } from 'lucide-react'

export function AlertCard({ item, onOpen }) {
  const color = item.status === 'urgent' ? 'red' : item.status === 'upcoming' ? 'yellow' : 'green'
  return (
    <div className="card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {item.pinned && <div title="Pinned"><Pin size={16} /></div>}
        <div>
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, color: 'var(--muted)', fontSize: 14 }}>
            <span className={`badge ${color}`}>{item.category}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Calendar size={14}/> {item.date}</span>
          </div>
        </div>
      </div>
      <button className="btn" onClick={() => onOpen?.(item)} aria-label="Open details">
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

export default AlertCard


