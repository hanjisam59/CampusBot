import React, { useState } from 'react'
import ChatWindow from '../components/ChatWindow'

function ErrorBoundary({ children }) {
  return (
    <ErrorCatcher>
      {children}
    </ErrorCatcher>
  )
}

class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong.' }
  }
  componentDidCatch(error, info) {
    console.error('Chatbot page crashed:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>We hit an issue loading the chat.</div>
          <div style={{ marginBottom: 12 }}>{this.state.message}</div>
          <button className="btn" onClick={() => this.setState({ hasError: false, message: '' })}>Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function ChatbotPage() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ErrorBoundary>
        <ChatWindow />
      </ErrorBoundary>
      <div className="card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700 }}>Also available on WhatsApp & Telegram</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: 12, width: 120, height: 120, display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>QR</div>
          <div className="card" style={{ padding: 12, width: 120, height: 120, display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>QR</div>
        </div>
      </div>
    </div>
  )
}


