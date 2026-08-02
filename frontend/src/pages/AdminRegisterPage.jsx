import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useState } from 'react'

export default function AdminRegisterPage() {
  const navigate = useNavigate()
  const { adminLogin } = useAppStore()
  const [fullName, setFullName] = useState('')
  const [staffId, setStaffId] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ padding: 24, width: '100%', maxWidth: 520 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Register Admin</div>
        <form
          style={{ display: 'grid', gap: 12 }}
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            if (password !== confirmPassword) {
              setError('Passwords do not match')
              return
            }
            try {
              const res = await fetch('http://localhost:8000/api/admin/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, staffId, email, department, password }),
              })
              if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.msg || err.error || 'Registration failed')
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
          <div className="grid cols-2">
            <div>
              <div className="label">Full Name</div>
              <input className="input" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <div className="label">Staff ID</div>
              <input className="input" placeholder="STAFF123" value={staffId} onChange={(e) => setStaffId(e.target.value)} required />
            </div>
          </div>
          <div className="grid cols-2">
            <div>
              <div className="label">Email</div>
              <input className="input" type="email" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="label">Department</div>
              <input className="input" placeholder="Exams" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
          </div>
          <div className="grid cols-2">
            <div>
              <div className="label">Password</div>
              <input className="input" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <div className="label">Confirm Password</div>
              <input className="input" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>
          <button className="btn primary" type="submit">Create Admin</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  )
}


