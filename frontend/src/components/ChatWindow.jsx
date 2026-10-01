import { useState, useEffect } from 'react'
import { Send, Globe } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { motion } from 'framer-motion'
import { apiUrl } from '../utils/api'

export function ChatWindow() {
  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const messages = useAppStore((s) => s.messagesBySession[s.sessionId] || [])
  const { 
    getMessages, 
    appendMessage, 
    replaceMessagesIfEmpty, 
    clearMessages, 
    language, 
    setLanguage, 
    supportedLanguages, 
    setSupportedLanguages, 
    getLanguageName 
  } = useAppStore()

  // Load supported languages on component mount
  useEffect(() => {
    loadSupportedLanguages()
  }, [])

  const loadSupportedLanguages = async () => {
    if (Object.keys(supportedLanguages).length > 0) return // Already loaded
    
    try {
      const response = await fetch(apiUrl('/api/faq/languages'))
      const data = await response.json()
      if (data.success) {
        setSupportedLanguages(data.languages)
      }
    } catch (error) {
      console.error('Failed to load supported languages:', error)
      // Fallback to basic languages
      const fallbackLanguages = {
        'en': 'English',
        'es': 'Español',
        'fr': 'Français',
        'de': 'Deutsch',
        'hi': 'हिन्दी',
        'bn': 'বাংলা',
        'ta': 'தமிழ்',
        'te': 'తెలుగు',
        'ml': 'മലയാളം',
        'kn': 'ಕನ್ನಡ',
        'gu': 'ગુજરાતી',
        'mr': 'मराठी',
        'pa': 'ਪੰਜਾਬੀ',
        'zh': '中文',
        'ja': '日本語',
        'ko': '한국어',
        'ar': 'العربية',
        'ru': 'Русский',
        'pt': 'Português',
        'it': 'Italiano',
        'tr': 'Türkçe',
        'th': 'ไทย',
        'vi': 'Tiếng Việt',
        'id': 'Bahasa Indonesia',
        'ms': 'Bahasa Melayu',
        'tl': 'Filipino'
      }
      setSupportedLanguages(fallbackLanguages)
    }
  }

  function generateId() {
    try { if (window && window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID() } catch (_) {}
    return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  }

  function getInputPlaceholder(lang) {
    const placeholders = {
      'en': 'Type your message...',
      'es': 'Escribe tu mensaje...',
      'fr': 'Tapez votre message...',
      'de': 'Geben Sie Ihre Nachricht ein...',
      'hi': 'अपना संदेश लिखें...',
      'bn': 'আপনার বার্তা টাইপ করুন...',
      'ta': 'உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...',
      'te': 'మీ సందేశాన్ని టైప్ చేయండి...',
      'ml': 'നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക...',
      'kn': 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
      'gu': 'તમારો સંદેશ લખો...',
      'mr': 'तुमचा संदेश टाइप करा...',
      'pa': 'ਆਪਣਾ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ...',
      'zh': '输入您的消息...',
      'ja': 'メッセージを入力してください...',
      'ko': '메시지를 입력하세요...',
      'ar': 'اكتب رسالتك...',
      'ru': 'Введите ваше сообщение...',
      'pt': 'Digite sua mensagem...',
      'it': 'Digita il tuo messaggio...',
      'tr': 'Mesajınızı yazın...',
      'th': 'พิมพ์ข้อความของคุณ...',
      'vi': 'Nhập tin nhắn của bạn...',
      'id': 'Ketik pesan Anda...',
      'ms': 'Taip mesej anda...',
      'tl': 'I-type ang inyong mensahe...'
    }
    return placeholders[lang] || 'Type your message...'
  }

  // ensure greeting exists
  if (messages.length === 0) {
    replaceMessagesIfEmpty({ id: 'm1', role: 'assistant', text: 'Hi! I am CampusMitra. How can I help you today?' })
  }

  async function sendMessage() {
    if (!input.trim()) return
    const userMsg = { id: generateId(), role: 'user', text: input }
    appendMessage(userMsg)
    setInput('')

    try {
      const user = JSON.parse(localStorage.getItem('student') || 'null')
      const userEmail = user?.email || null
      const resp = await fetch(apiUrl('/api/faq/query'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMsg.text, 
          language: language,
          userEmail 
        }),
      })
      const data = await resp.json()
      const answer = data?.answer || "Sorry, I couldn't find an answer for that."
      const botMsg = { 
        id: generateId(), 
        role: 'assistant', 
        text: answer,
        originalText: data?.originalAnswer,
        translated: data?.translated,
        detectedLanguage: data?.detectedLanguage
      }
      appendMessage(botMsg)
    } catch (e) {
      const botMsg = { id: generateId(), role: 'assistant', text: 'Something went wrong. Please try again.' }
      appendMessage(botMsg)
    }
  }

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', height: 'min(70vh, 640px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong>Chat</strong>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '4px 8px', 
            background: 'var(--primary)', 
            color: 'white', 
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            <Globe size={14} />
            {getLanguageName(language)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn" onClick={() => setShowLanguageSelector(true)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Globe size={16} />
            Language
          </button>
          <button className="btn" onClick={() => setShowHistory(true)}>View History</button>
          <button className="btn" onClick={() => { clearMessages() }}>Clear</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 2px' }}>
        {messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 10, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div>{m.text}</div>
            {m.role === 'assistant' && m.translated && (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
                🌐 Translated from English
              </div>
            )}
            {m.role === 'assistant' && m.detectedLanguage && m.detectedLanguage !== 'en' && (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
                🔍 Detected: {getLanguageName(m.detectedLanguage)}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input 
          className="input" 
          placeholder={getInputPlaceholder(language)} 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
        />
        <button className="btn primary" onClick={sendMessage}><Send size={16}/> Send</button>
      </div>
      {showHistory ? (
        <div className="card" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center' }}>
          <div className="card" style={{ width: 'min(720px, 95vw)', maxHeight: '80vh', overflow: 'auto', padding: 16, background: 'var(--panel)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong>Conversation History</strong>
              <button className="btn" onClick={() => setShowHistory(false)}>Close</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.length === 0 ? (
                <div style={{ color: 'var(--muted)' }}>No messages yet.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="card" style={{ padding: 10, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{m.role === 'user' ? 'You' : 'CampusMitra'}</div>
                    <div>{m.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showLanguageSelector ? (
        <div className="card" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center' }}>
          <div className="card" style={{ width: 'min(600px, 95vw)', maxHeight: '80vh', overflow: 'auto', padding: 16, background: 'var(--panel)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <strong>Select Language</strong>
              <button className="btn" onClick={() => setShowLanguageSelector(false)}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <button
                  key={code}
                  className="btn"
                  onClick={() => {
                    setLanguage(code)
                    setShowLanguageSelector(false)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: language === code ? 'var(--primary)' : 'transparent',
                    color: language === code ? 'white' : 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{name}</span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>{code.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, background: 'var(--muted)', borderRadius: 8, fontSize: '14px' }}>
              <strong>💡 Tip:</strong> You can type in any language and CampusMitra will automatically detect it and respond in the same language!
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ChatWindow;

