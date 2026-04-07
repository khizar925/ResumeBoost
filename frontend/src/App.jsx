import { useState, useCallback } from 'react'
import axios from 'axios'
import UploadForm from './components/UploadForm'
import ProcessingSteps from './components/ProcessingSteps'
import ResumePreview from './components/ResumePreview'

const STAGE = {
    IDLE:      'idle',
    UPLOADING: 'upload',
    OPTIMIZING:'optimize',
    COMPILING: 'compile',
    DONE:      'done',
    ERROR:     'error',
}

/* ── Inline SVG components ───────────────────────────────────── */
const LogoMark = () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="4" y="3" width="13" height="18" rx="2"
            fill="var(--bg-accent-light)" stroke="var(--accent)" strokeWidth="1.5" />
        <line x1="8" y1="9"  x2="14" y2="9"  stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="12" x2="14" y2="12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="15" x2="11" y2="15" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 7 L20 3 L22 7 L18.8 8.6 L22 10.2 L20 14 L18 10.2 L21.2 8.6 Z"
            fill="var(--accent)" />
    </svg>
)

const ShieldIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

const CpuIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9"  y1="2" x2="9"  y2="4" /><line x1="15" y1="2" x2="15" y2="4" />
        <line x1="9"  y1="20" x2="9"  y2="22" /><line x1="15" y1="20" x2="15" y2="22" />
        <line x1="2"  y1="9" x2="4"  y2="9" /><line x1="2"  y1="15" x2="4"  y2="15" />
        <line x1="20" y1="9" x2="22" y2="9" /><line x1="20" y1="15" x2="22" y2="15" />
    </svg>
)

const FileTextIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
)

const ZapIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
)

const AlertIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8"  x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

const FEATURES = [
    { Icon: ShieldIcon,   label: 'Input validated'        },
    { Icon: CpuIcon,      label: 'Gemini AI · XYZ Method' },
    { Icon: FileTextIcon, label: "Jake's LaTeX template"  },
    { Icon: ZapIcon,      label: 'Instant PDF download'   },
]

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
    const [stage, setStage]         = useState(STAGE.IDLE)
    const [error, setError]         = useState(null)
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null)

    const handleReset = () => {
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
        setPdfBlobUrl(null)
        setStage(STAGE.IDLE)
        setError(null)
    }

    const handleSubmit = useCallback(async (file, jobDescription) => {
        setError(null)
        try {
            setStage(STAGE.UPLOADING)
            const formData = new FormData()
            formData.append('resume', file)
            formData.append('jobDescription', jobDescription)
            const uploadRes = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const { resumeText } = uploadRes.data

            setStage(STAGE.OPTIMIZING)
            const optimizeRes = await axios.post('/api/optimize', { resumeText, jobDescription })
            const { optimizedResume } = optimizeRes.data

            setStage(STAGE.COMPILING)
            const compileRes = await axios.post('/api/compile', { optimizedResume }, {
                responseType: 'blob',
            })
            const url = URL.createObjectURL(new Blob([compileRes.data], { type: 'application/pdf' }))
            setPdfBlobUrl(url)
            setStage(STAGE.DONE)

        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.')
            setStage(STAGE.ERROR)
        }
    }, [])

    const isProcessing = [STAGE.UPLOADING, STAGE.OPTIMIZING, STAGE.COMPILING].includes(stage)
    const isIdle       = stage === STAGE.IDLE || stage === STAGE.ERROR

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* ── Header ─────────────────────────────────────── */}
            <header style={{
                padding: '1.1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(254, 253, 251, 0.88)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <LogoMark />
                    <span style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        letterSpacing: '-0.025em',
                        color: 'var(--text-primary)',
                    }}>
                        ResumeBoost
                    </span>
                </div>
                <div className="step-badge" aria-label="AI-Powered, ATS-Optimized">
                    AI-Powered · ATS-Optimized
                </div>
            </header>

            {/* ── Main ───────────────────────────────────────── */}
            <main style={{
                flex: 1,
                maxWidth: 680,
                margin: '0 auto',
                width: '100%',
                padding: '3.5rem 1.5rem 4.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
            }}>

                {/* Hero — idle/error only */}
                {isIdle && (
                    <div className="anim-fade-up" style={{ textAlign: 'center', paddingBottom: '0.25rem' }}>
                        <div className="label-mono" style={{ color: 'var(--accent)', marginBottom: '1.1rem' }}>
                            Resume Optimizer
                        </div>
                        <h1 className="display-heading" style={{
                            fontSize: 'clamp(2.1rem, 6vw, 3.1rem)',
                            marginBottom: '1.1rem',
                        }}>
                            Your resume,{' '}
                            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
                                rewritten
                            </em>{' '}
                            to get hired.
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1rem',
                            lineHeight: 1.7,
                            maxWidth: 460,
                            margin: '0 auto',
                            fontWeight: 400,
                        }}>
                            Upload your PDF and paste a job description. Our AI
                            rewrites every bullet with the{' '}
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                Google XYZ Method
                            </strong>{' '}
                            to pass ATS filters and catch recruiters' attention.
                        </p>
                    </div>
                )}

                {/* Error banner */}
                {stage === STAGE.ERROR && (
                    <div className="error-banner anim-fade-up" role="alert">
                        <AlertIcon />
                        {error}
                    </div>
                )}

                {/* Form card */}
                {isIdle && (
                    <div className="surface-card anim-fade-up" style={{ padding: '2rem' }}>
                        <UploadForm onSubmit={handleSubmit} isLoading={false} />
                    </div>
                )}

                {/* Processing card */}
                {isProcessing && (
                    <div className="surface-card anim-fade-up" style={{ padding: '2.25rem 2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div className="label-mono" style={{ color: 'var(--accent)', marginBottom: '0.7rem' }}>
                                In progress
                            </div>
                            <div className="display-heading" style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                                Optimizing your resume
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Usually takes 20–40 seconds
                            </p>
                        </div>
                        <ProcessingSteps currentStep={stage} />
                    </div>
                )}

                {/* Done */}
                {stage === STAGE.DONE && pdfBlobUrl && (
                    <div className="anim-fade-up">
                        <ResumePreview pdfBlobUrl={pdfBlobUrl} onStartOver={handleReset} />
                    </div>
                )}

                {/* Feature strip — idle only */}
                {stage === STAGE.IDLE && (
                    <div
                        className="anim-fade-up"
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            animationDelay: '0.12s',
                        }}
                    >
                        {FEATURES.map(({ Icon, label }) => (
                            <div
                                key={label}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.35rem 0.9rem',
                                    borderRadius: 'var(--r-full)',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 500,
                                }}
                            >
                                <Icon />
                                {label}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Footer ─────────────────────────────────────── */}
            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '1.25rem 2rem',
                textAlign: 'center',
                background: 'var(--bg-surface)',
            }}>
                <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    ResumeBoost · React · Node.js · Google Gemini · LaTeX · All processing server-side
                </p>
            </footer>

        </div>
    )
}
