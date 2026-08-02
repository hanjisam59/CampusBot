import React, { useState, useEffect } from 'react'
import { Upload, FileText, Globe, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function UploadPdfPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [isUploading, setIsUploading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [uploadHistory, setUploadHistory] = useState([])
  
  const { 
    supportedLanguages, 
    setSupportedLanguages, 
    getLanguageName 
  } = useAppStore()

  // Load supported languages on component mount
  useEffect(() => {
    loadSupportedLanguages()
    loadUploadHistory()
  }, [])

  const loadSupportedLanguages = async () => {
    if (Object.keys(supportedLanguages).length > 0) return // Already loaded
    
    try {
      const response = await fetch('http://localhost:8000/api/faq/languages')
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

  const loadUploadHistory = () => {
    const history = JSON.parse(localStorage.getItem('pdf_upload_history') || '[]')
    setUploadHistory(history)
  }

  const saveToHistory = (file, language, summary) => {
    const newEntry = {
      id: Date.now(),
      fileName: file.name,
      language: language,
      summary: summary,
      timestamp: new Date().toISOString()
    }
    const updatedHistory = [newEntry, ...uploadHistory.slice(0, 9)] // Keep last 10
    setUploadHistory(updatedHistory)
    localStorage.setItem('pdf_upload_history', JSON.stringify(updatedHistory))
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setError('')
    } else {
      setError('Please select a valid PDF file')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first')
      return
    }

    setIsUploading(true)
    setError('')
    setSummary('')

    try {
      const formData = new FormData()
      formData.append('pdf', selectedFile)
      formData.append('language', selectedLanguage)

      const response = await fetch('http://localhost:8000/api/pdf/pdf-summarize', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setSummary(data.summary)
        saveToHistory(selectedFile, selectedLanguage, data.summary)
      } else {
        setError(data.message || 'Failed to process PDF')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload and process PDF. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadSummary = () => {
    if (!summary) return
    
    const element = document.createElement('a')
    const file = new Blob([summary], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `summary_${selectedFile?.name?.replace('.pdf', '') || 'document'}_${selectedLanguage}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const retryWithHistory = (historyItem) => {
    setSelectedLanguage(historyItem.language)
    setSummary(historyItem.summary)
    setError('')
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Header */}
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <Upload size={32} style={{ color: 'var(--primary)' }} />
          <h1 style={{ margin: 0, fontSize: 28 }}>PDF Summarizer</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 16, margin: 0 }}>
          Upload a PDF document and get a summary in your preferred language
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Upload Section */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} />
            Upload PDF
          </h2>
          
          {/* File Upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
              Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
                cursor: 'pointer'
              }}
            />
            {selectedFile && (
              <div style={{ marginTop: 8, padding: 8, background: 'var(--surface)', borderRadius: 4, fontSize: 14 }}>
                📄 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
              <Globe size={16} style={{ display: 'inline', marginRight: 4 }} />
              Summary Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'white',
                fontSize: '14px'
              }}
            >
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="btn primary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: (!selectedFile || isUploading) ? 0.6 : 1,
              cursor: (!selectedFile || isUploading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload & Summarize
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div style={{
              marginTop: 16,
              padding: 12,
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={20} />
            Summary Results
          </h2>
          
          {summary ? (
            <div>
              <div style={{
                padding: 16,
                background: 'var(--surface)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                marginBottom: 16,
                maxHeight: '300px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {summary}
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={downloadSummary}
                  className="btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Download size={16} />
                  Download Summary
                </button>
                <button
                  onClick={() => setSummary('')}
                  className="btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: 32,
              textAlign: 'center',
              color: 'var(--muted)',
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border)'
            }}>
              <FileText size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>Upload a PDF to see the summary here</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px 0' }}>Recent Uploads</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {uploadHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 16,
                  background: 'var(--surface)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', marginBottom: 4 }}>
                    📄 {item.fileName}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                    Language: {getLanguageName(item.language)} • 
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => retryWithHistory(item)}
                  className="btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  View Summary
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>📄 Upload PDF</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              Select any PDF document from your device
            </p>
          </div>
          <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>🌐 Choose Language</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              Select your preferred language for the summary
            </p>
          </div>
          <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>🤖 AI Processing</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              Our AI extracts text and creates a summary
            </p>
          </div>
          <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>📝 Get Summary</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              Receive a translated summary in your language
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
