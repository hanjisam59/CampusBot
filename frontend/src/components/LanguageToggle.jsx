import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { apiUrl } from '../utils/api'

export function LanguageToggle() {
  const { language, setLanguage, supportedLanguages, setSupportedLanguages, getLanguageName } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load supported languages on component mount
  useEffect(() => {
    loadSupportedLanguages()
  }, [])

  const loadSupportedLanguages = async () => {
    if (Object.keys(supportedLanguages).length > 0) return // Already loaded
    
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    setIsOpen(false)
  }

  const currentLanguageName = getLanguageName(language)

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        disabled={loading}
      >
        <span>🌐</span>
        <span>{loading ? 'Loading...' : currentLanguageName}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 8,
          minWidth: 200,
          maxHeight: 300,
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {Object.entries(supportedLanguages).map(([code, name]) => (
            <button
              key={code}
              className="btn"
              onClick={() => handleLanguageChange(code)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                background: language === code ? 'var(--primary)' : 'transparent',
                color: language === code ? 'white' : 'var(--text)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                marginBottom: 4,
                fontSize: '14px'
              }}
            >
              {name} ({code.toUpperCase()})
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageToggle

