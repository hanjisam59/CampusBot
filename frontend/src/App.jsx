import React from 'react'
import { Route, Routes, useLocation, NavLink, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, Bell, Bot, User, HelpCircle, LogIn, Upload } from 'lucide-react'
import HomePage from './pages/HomePage'
import NotificationsPage from './pages/NotificationsPage'
import ChatbotPage from './pages/ChatbotPage'
import ProfilePage from './pages/ProfilePage'
import HelpPage from './pages/HelpPage'
import UploadPdfPage from './pages/UploadPdfPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import StudentLoginPage from './pages/StudentLoginPage'
import StudentRegisterPage from './pages/StudentRegisterPage'
import AdminRegisterPage from './pages/AdminRegisterPage'
import { LanguageToggle } from './components/LanguageToggle'
import { useAppStore } from './store/appStore'

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="page"
  >
    {children}
  </motion.div>
)

const Navbar = () => {
  const { language, isAuthenticated, isAdminAuthenticated, logout, adminLogout } = useAppStore()
  const [open, setOpen] = React.useState(false)
  return (
    <div className="nav">
      <div className="container nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavLink to="/" className="nav-link" style={{ paddingLeft: 0 }}>
            <strong>CampusMitra</strong>
          </NavLink>
        </div>
        <div className={`nav-links ${open ? 'open' : ''}`} style={{ marginLeft: 'auto' }}>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Bot size={16}/> Home</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/notifications">
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Bell size={16}/> Notifications</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/chatbot">
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Bot size={16}/> Chatbot</span>
          </NavLink>
          {isAuthenticated ? (
            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/profile">
              <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><User size={16}/> Profile</span>
            </NavLink>
          ) : null}
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/help">
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><HelpCircle size={16}/> Help</span>
          </NavLink>
          {/* Login/Register removed as requested */}
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to={isAdminAuthenticated ? '/admin' : '/admin/login'}>
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><LogIn size={16}/> Admin</span>
          </NavLink>
          {/* Language UI removed for English-only mode */}
          {isAuthenticated ? (
            <button className="btn" onClick={() => { localStorage.removeItem('token'); logout() }} style={{ marginLeft: 8 }}>Logout</button>
          ) : null}
          {isAdminAuthenticated ? (
            <button className="btn" onClick={() => { localStorage.removeItem('admin_token'); adminLogout() }} style={{ marginLeft: 8 }}>Admin Logout</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const Footer = () => {
  return (
    <div className="footer">
      <div className="container footer-inner">
        <div>© {new Date().getFullYear()} CampusMitra</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <NavLink className="nav-link" to="/help#contact">Contact</NavLink>
          <NavLink className="nav-link" to="/help#privacy">Privacy</NavLink>
          <NavLink className="nav-link" to="/help#terms">Terms</NavLink>
        </div>
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()
  const { isAuthenticated, isAdminAuthenticated } = useAppStore()

  const RequireAuth = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return children
  }

  const RedirectIfAuth = ({ children }) => {
    if (isAuthenticated) return <Navigate to="/" replace />
    return children
  }
  const RequireAdmin = ({ children }) => {
    if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />
    return children
  }
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<RequireAuth><PageTransition><HomePage /></PageTransition></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><PageTransition><NotificationsPage /></PageTransition></RequireAuth>} />
            <Route path="/chatbot" element={<RequireAuth><PageTransition><ChatbotPage /></PageTransition></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><PageTransition><ProfilePage /></PageTransition></RequireAuth>} />
            <Route path="/upload-pdf" element={<RequireAuth><PageTransition><UploadPdfPage /></PageTransition></RequireAuth>} />
            <Route path="/help" element={<RequireAuth><PageTransition><HelpPage /></PageTransition></RequireAuth>} />
            <Route path="/admin" element={<RequireAdmin><PageTransition><AdminDashboardPage /></PageTransition></RequireAdmin>} />

            <Route path="/login" element={<RedirectIfAuth><PageTransition><StudentLoginPage /></PageTransition></RedirectIfAuth>} />
            <Route path="/register" element={<RedirectIfAuth><PageTransition><StudentRegisterPage /></PageTransition></RedirectIfAuth>} />
            <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
            <Route path="/admin/register" element={<PageTransition><AdminRegisterPage /></PageTransition>} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App


