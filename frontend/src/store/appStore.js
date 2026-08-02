import { create } from 'zustand'

function hasWindow() {
  return typeof window !== 'undefined'
}

function loadFromStorage(key, fallback) {
  if (!hasWindow()) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (_) {
    return fallback
  }
}

function saveToStorage(key, value) {
  if (!hasWindow()) return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (_) {}
}

function ensureSessionId(student) {
  const existing = loadFromStorage('cm_session_id', null)
  if (student && (student._id || student.id || student.email)) {
    const id = String(student._id || student.id || student.email)
    saveToStorage('cm_session_id', id)
    return id
  }
  if (existing) return existing
  let rnd = 'r' + Math.random().toString(36).slice(2)
  try { if (hasWindow() && window.crypto && window.crypto.randomUUID) rnd = window.crypto.randomUUID() } catch (_) {}
  const id = `anon_${rnd}`
  saveToStorage('cm_session_id', id)
  return id
}

export const useAppStore = create((set, get) => ({
  isAuthenticated: false,
  student: null,
  login: (student) => {
    const sessionId = ensureSessionId(student)
    set({ isAuthenticated: true, student, isAdminAuthenticated: false, sessionId })
  },
  logout: () => {
    const sessionId = ensureSessionId(null)
    set({ isAuthenticated: false, student: null, sessionId })
  },

  isAdminAuthenticated: false,
  adminLogin: () => set({ isAdminAuthenticated: true, isAuthenticated: false, student: null }),
  adminLogout: () => set({ isAdminAuthenticated: false }),

  language: loadFromStorage('cm_user_language', 'en'),
  setLanguage: (language) => {
    saveToStorage('cm_user_language', language);
    set({ language });
  },
  
  // Language management
  supportedLanguages: {},
  setSupportedLanguages: (languages) => set({ supportedLanguages: languages }),
  getLanguageName: (code) => {
    const { supportedLanguages } = get();
    return supportedLanguages[code] || code;
  },

  // Conversation state per session
  sessionId: ensureSessionId(null),
  messagesBySession: loadFromStorage('cm_messages_by_session', {}),
  getMessages: () => {
    const { sessionId, messagesBySession } = get()
    return messagesBySession[sessionId] || []
  },
  appendMessage: (message) => set((state) => {
    const sessionId = state.sessionId
    const next = { ...state.messagesBySession, [sessionId]: [...(state.messagesBySession[sessionId] || []), message] }
    saveToStorage('cm_messages_by_session', next)
    return { messagesBySession: next }
  }),
  clearMessages: () => set((state) => {
    const sessionId = state.sessionId
    const next = { ...state.messagesBySession, [sessionId]: [] }
    saveToStorage('cm_messages_by_session', next)
    return { messagesBySession: next }
  }),
  replaceMessagesIfEmpty: (initialMessage) => set((state) => {
    const sessionId = state.sessionId
    const current = state.messagesBySession[sessionId] || []
    if (current.length > 0) return {}
    const next = { ...state.messagesBySession, [sessionId]: [initialMessage] }
    saveToStorage('cm_messages_by_session', next)
    return { messagesBySession: next }
  }),

  anonymousMode: false,
  toggleAnonymousMode: () => set((state) => ({ anonymousMode: !state.anonymousMode })),

  notificationPreference: 'portal',
  setNotificationPreference: (notificationPreference) => set({ notificationPreference }),
}))


