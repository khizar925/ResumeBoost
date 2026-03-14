import { useState, useRef } from 'react'

const MAX_JD_CHARS = 5000
const MAX_FILE_MB = 5

export default function UploadForm({ onSubmit, isLoading }) {
    const [file, setFile] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [jobDescription, setJobDescription] = useState('')
    const [fileError, setFileError] = useState(null)
    const fileInputRef = useRef(null)

    const validateAndSetFile = (f) => {
        setFileError(null)
        if (!f) return
        if (f.type !== 'application/pdf') {
            setFileError('Only PDF files are supported.')
            return
        }
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
            setFileError(`File exceeds the ${MAX_FILE_MB}MB limit.`)
            return
        }
        setFile(f)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const dropped = e.dataTransfer.files[0]
        validateAndSetFile(dropped)
    }

    const handleFileChange = (e) => {
        validateAndSetFile(e.target.files[0])
    }

    const handleJDChange = (e) => {
        if (e.target.value.length <= MAX_JD_CHARS) {
            setJobDescription(e.target.value)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!file || !jobDescription.trim()) return
        onSubmit(file, jobDescription.trim())
    }

    const jdLength = jobDescription.length
    const jdNearLimit = jdLength > MAX_JD_CHARS * 0.85
    const canSubmit = file && jobDescription.trim().length > 20 && !isLoading

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* File Drop Zone */}
            <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    📄 Your Resume (PDF only, max 5MB)
                </label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${dragOver ? 'var(--accent-violet)' : fileError ? 'var(--error)' : file ? 'var(--success)' : 'var(--border)'}`,
                        borderRadius: '12px',
                        padding: '2rem 1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: dragOver ? 'rgba(139,92,246,0.06)' : file ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                        userSelect: 'none',
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    {file ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '2rem' }}>✅</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>{file.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB — click to change
                            </span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>📤</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Drop your PDF here or click to browse
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF only · Max 5MB</span>
                        </div>
                    )}
                </div>
                {fileError && (
                    <div className="error-banner" style={{ marginTop: '0.5rem' }}>
                        ⚠️ {fileError}
                    </div>
                )}
            </div>

            {/* Job Description */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        💼 Job Description
                    </label>
                    <span style={{
                        fontSize: '0.75rem',
                        color: jdNearLimit ? 'var(--warning)' : 'var(--text-muted)',
                        fontWeight: jdNearLimit ? 600 : 400,
                        transition: 'color 0.2s',
                    }}>
                        {jdLength.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
                    </span>
                </div>
                <textarea
                    className="input-field"
                    placeholder="Paste the full job description here. The more detail, the better the optimization…"
                    rows={8}
                    value={jobDescription}
                    onChange={handleJDChange}
                    spellCheck
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Plain text only. HTML, scripts, and special formatting will be stripped automatically.
                </p>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={!canSubmit} style={{ width: '100%', padding: '1rem' }}>
                {isLoading ? (
                    <>
                        <span className="anim-spin" style={{ display: 'inline-block', fontSize: '1.1rem' }}>⚙️</span>
                        Processing…
                    </>
                ) : (
                    <>
                        🚀 Optimize My Resume
                    </>
                )}
            </button>
        </form>
    )
}
