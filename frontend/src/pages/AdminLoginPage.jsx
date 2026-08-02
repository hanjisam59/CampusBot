import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useState } from 'react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminLogin, logout } = useAppStore()
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ padding: 20, width: '100%', maxWidth: 420 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Admin Login</div>
        <form
          style={{ display: 'grid', gap: 12 }}
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            try {
              // ensure student session is cleared before admin login
              localStorage.removeItem('token')
              logout && logout()

              const res = await fetch('http://localhost:8000/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId, password }),
              })
              if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.msg || err.error || 'Login failed')
              }
              const data = await res.json()
              localStorage.setItem('admin_token', data.token)
              adminLogin()
              navigate('/admin')
            } catch (err) {
              setError(err.message)
            }
          }}
        >
          <div>
            <div className="label">Staff ID</div>
            <input className="input" placeholder="STAFF123" value={staffId} onChange={(e) => setStaffId(e.target.value)} />
          </div>
          <div>
            <div className="label">Password</div>
            <input className="input" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn primary" type="submit">Login</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <Link to="#" className="nav-link">Forgot Password?</Link>
          <Link to="/admin/register" className="nav-link">Register Admin</Link>
        </div>
      </div>
    </div>
  )
}


