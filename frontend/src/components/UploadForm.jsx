import { useState, useRef } from 'react'

const MAX_JD_CHARS = 5000
const MAX_FILE_MB  = 5

/* ── SVG Icons ───────────────────────────────────────────────── */
const UploadIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
)

const FileCheckIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <polyline points="9 15 11 17 15 13" />
    </svg>
)

const ArrowRightIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

const SpinnerIcon = () => (
    <svg className="anim-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M12 2a10 10 0 0 1 0 20" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 9.3 6.3" />
    </svg>
)

const XIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

/* ── Component ───────────────────────────────────────────────── */
export default function UploadForm({ onSubmit, isLoading }) {
    const [file, setFile]               = useState(null)
    const [dragOver, setDragOver]       = useState(false)
    const [jobDescription, setJobDescription] = useState('')
    const [fileError, setFileError]     = useState(null)
    const fileInputRef                  = useRef(null)

    const validateAndSetFile = (f) => {
        setFileError(null)
        if (!f) return
        if (f.type !== 'application/pdf') {
            setFileError('Only PDF files are accepted.')
            return
        }
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
            setFileError(`File must be under ${MAX_FILE_MB} MB.`)
            return
        }
        setFile(f)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        validateAndSetFile(e.dataTransfer.files[0])
    }

    const handleFileChange = (e) => validateAndSetFile(e.target.files[0])

    const handleJDChange = (e) => {
        if (e.target.value.length <= MAX_JD_CHARS) setJobDescription(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!file || !jobDescription.trim()) return
        onSubmit(file, jobDescription.trim())
    }

    const jdLength    = jobDescription.length
    const jdProgress  = jdLength / MAX_JD_CHARS
    const jdNearLimit = jdProgress > 0.85
    const canSubmit   = file && jobDescription.trim().length > 20 && !isLoading

    const dropZoneBorder = dragOver
        ? 'var(--accent)'
        : fileError
        ? 'var(--error)'
        : file
        ? 'var(--accent)'
        : 'var(--border)'

    const dropZoneBg = dragOver || file ? 'var(--bg-accent-light)' : 'transparent'

    return (
        <form onSubmit={handleSubmit} noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* ── File upload ─────────────────────────────── */}
            <div>
                <label className="field-label" id="resume-label">
                    Resume · PDF only · Max 5 MB
                </label>
                <div
                    role="button"
                    tabIndex={0}
                    aria-labelledby="resume-label"
                    aria-describedby={fileError ? 'file-error' : undefined}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${dropZoneBorder}`,
                        borderRadius: 'var(--r-md)',
                        padding: '2.25rem 1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: dropZoneBg,
                        transition: 'all 0.2s ease',
                        outline: 'none',
                    }}
                    onFocus={(e)  => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,122,86,0.14)')}
                    onBlur={(e)   => (e.currentTarget.style.boxShadow = 'none')}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        tabIndex={-1}
                        aria-hidden="true"
                    />

                    {file ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.55rem' }}>
                            <div style={{ color: 'var(--accent)' }}><FileCheckIcon /></div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>
                                {file.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB · click to replace
                            </span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.55rem' }}>
                            <div style={{ color: dragOver ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                                <UploadIcon />
                            </div>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: dragOver ? 'var(--accent)' : 'var(--text-secondary)',
                                transition: 'color 0.2s',
                            }}>
                                Drop your PDF here, or{' '}
                                <span style={{
                                    color: 'var(--accent)',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '2px',
                                }}>
                                    browse
                                </span>
                            </span>
                        </div>
                    )}
                </div>

                {fileError && (
                    <p id="file-error" role="alert" style={{
                        marginTop: '0.45rem',
                        fontSize: '0.78rem',
                        color: 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                    }}>
                        <XIcon />
                        {fileError}
                    </p>
                )}
            </div>

            {/* ── Job description ─────────────────────────── */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '0.55rem',
                }}>
                    <label className="field-label" htmlFor="job-description" style={{ marginBottom: 0 }}>
                        Job Description
                    </label>
                    <span style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        color: jdNearLimit ? 'var(--warning)' : 'var(--text-muted)',
                        transition: 'color 0.2s',
                    }}>
                        {jdLength.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
                    </span>
                </div>

                <textarea
                    id="job-description"
                    className="input-field"
                    placeholder="Paste the full job description here. The more detail, the better the optimization…"
                    rows={8}
                    value={jobDescription}
                    onChange={handleJDChange}
                    spellCheck
                    aria-describedby="jd-hint"
                />

                {/* Character progress bar */}
                <div style={{
                    marginTop: '0.45rem',
                    height: '2px',
                    borderRadius: '2px',
                    background: 'var(--border)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(jdProgress * 100, 100)}%`,
                        background: jdNearLimit ? 'var(--warning)' : 'var(--accent)',
                        borderRadius: '2px',
                        transition: 'width 0.2s ease, background 0.3s ease',
                    }} />
                </div>

                <p id="jd-hint" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Plain text only · HTML and special formatting will be stripped
                </p>
            </div>

            {/* ── Submit ──────────────────────────────────── */}
            <button
                type="submit"
                className="btn-primary"
                disabled={!canSubmit}
                style={{ width: '100%', padding: '1rem', fontSize: '0.95rem' }}
                aria-label={isLoading ? 'Processing resume…' : 'Optimize my resume'}
            >
                {isLoading ? (
                    <>
                        <SpinnerIcon />
                        Processing…
                    </>
                ) : (
                    <>
                        Optimize My Resume
                        <ArrowRightIcon />
                    </>
                )}
            </button>
        </form>
    )
}
