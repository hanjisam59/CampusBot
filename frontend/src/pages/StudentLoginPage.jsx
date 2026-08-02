import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useState } from 'react'

export default function StudentLoginPage() {
  const navigate = useNavigate()
  const { login, adminLogout } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ padding: 24, width: '100%', maxWidth: 420 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Student Login</div>
        <form
          style={{ display: 'grid', gap: 12 }}
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            try {
              // ensure admin session is cleared before student login
              localStorage.removeItem('admin_token')
              adminLogout && adminLogout()

              const res = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
              })
              if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.msg || err.error || 'Login failed')
              }
              const data = await res.json()
              localStorage.setItem('token', data.token)
              login(data.student)
              navigate('/')
            } catch (err) {
              setError(err.message)
            }
          }}
        >
          <div>
            <div className="label">Email</div>
            <input className="input" placeholder="you@student.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="label">Password</div>
            <input className="input" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn primary" type="submit">Login</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <Link className="nav-link" to="#">Forgot Password?</Link>
          <Link className="nav-link" to="/register">Create account</Link>
        </div>
      </div>
    </div>
  )
}


