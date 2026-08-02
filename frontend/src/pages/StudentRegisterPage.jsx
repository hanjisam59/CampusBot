import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '../store/appStore'

export default function StudentRegisterPage() {
  const navigate = useNavigate()
  const { login } = useAppStore()
  const [fullName, setFullName] = useState('')
  const [enrollmentNo, setEnrollmentNo] = useState('')
  const [email, setEmail] = useState('')
  const [course, setCourse] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ padding: 24, width: '100%', maxWidth: 520 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Student Registration</div>
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
              const res = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, enrollmentNo, email, course, password }),
              })
              if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.msg || err.error || 'Registration failed')
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
          <div className="grid cols-2">
            <div>
              <div className="label">Full Name</div>
              <input className="input" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <div className="label">Enrollment No.</div>
              <input className="input" placeholder="ENR123456" value={enrollmentNo} onChange={(e) => setEnrollmentNo(e.target.value)} required />
            </div>
          </div>
          <div className="grid cols-2">
            <div>
              <div className="label">Email</div>
              <input className="input" type="email" placeholder="you@student.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="label">Course</div>
              <input className="input" placeholder="B.Tech" value={course} onChange={(e) => setCourse(e.target.value)} />
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
          <button className="btn primary" type="submit">Register</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 10 }}>
          <span className="label">Already have an account?</span> <Link className="nav-link" to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}


