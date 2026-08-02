import { motion, AnimatePresence } from 'framer-motion'

export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
          <motion.div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 600 }}>{title}</div>
            </div>
            <div style={{ padding: 16 }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal


