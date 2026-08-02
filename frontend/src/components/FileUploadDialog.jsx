import { useRef, useState } from 'react'
import { Modal } from './Modal'
import { FileText, Upload } from 'lucide-react'

export function FileUploadDialog({ open, onClose }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)

  function onPick() { inputRef.current?.click() }

  return (
    <Modal open={open} onClose={onClose} title="Upload Document">
      <input ref={inputRef} type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div style={{ display: 'grid', gap: 12 }}>
        <button className="btn" onClick={onPick}><Upload size={16}/> Choose File</button>
        {file && (
          <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16}/>
              <div>
                <div style={{ fontWeight: 600 }}>{file.name}</div>
                <div className="label">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <button className="btn primary">Translate Document</button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default FileUploadDialog


