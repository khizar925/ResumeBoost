import { useState, useCallback } from 'react'
import axios from 'axios'
import UploadForm from './components/UploadForm'
import ProcessingSteps from './components/ProcessingSteps'
import ResumePreview from './components/ResumePreview'

// State machine stages
const STAGE = {
    IDLE: 'idle',
    UPLOADING: 'upload',
    OPTIMIZING: 'optimize',
    COMPILING: 'compile',
    DONE: 'done',
    ERROR: 'error',
}

export default function App() {
    const [stage, setStage] = useState(STAGE.IDLE)
    const [error, setError] = useState(null)
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
            // ─── Step 1: Upload PDF ───────────────────────────────────────────────
            setStage(STAGE.UPLOADING)
            const formData = new FormData()
            formData.append('resume', file)
            formData.append('jobDescription', jobDescription)

            const uploadRes = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const { resumeText } = uploadRes.data

            // ─── Step 2: AI Optimization ──────────────────────────────────────────
            setStage(STAGE.OPTIMIZING)
            const optimizeRes = await axios.post('/api/optimize', { resumeText, jobDescription })
            const { optimizedResume } = optimizeRes.data

            // ─── Step 3: Compile PDF ──────────────────────────────────────────────
            setStage(STAGE.COMPILING)
            const compileRes = await axios.post('/api/compile', { optimizedResume }, {
                responseType: 'blob',
            })

            const pdfBlob = new Blob([compileRes.data], { type: 'application/pdf' })
            const url = URL.createObjectURL(pdfBlob)
            setPdfBlobUrl(url)
            setStage(STAGE.DONE)

        } catch (err) {
            const message =
                err.response?.data?.error ||
                err.message ||
                'Something went wrong. Please try again.'
            setError(message)
            setStage(STAGE.ERROR)
        }
    }, [])

    const isProcessing = [STAGE.UPLOADING, STAGE.OPTIMIZING, STAGE.COMPILING].includes(stage)

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>🚀</span>
                    <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 800,
                        fontSize: '1.4rem',
                        background: 'var(--gradient-brand)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>ResumeBoost</span>
                </div>
                <div className="step-badge">
                    ✨ AI-Powered · ATS-Optimized
                </div>
            </header>

            {/* Main content */}
            <main style={{
                flex: 1,
                maxWidth: 760,
                margin: '0 auto',
                width: '100%',
                padding: '2.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
            }}>

                {/* Hero text — only shown on idle/error */}
                {(stage === STAGE.IDLE || stage === STAGE.ERROR) && (
                    <div className="anim-fade-up" style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
                        <h1 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                            fontWeight: 800,
                            lineHeight: 1.2,
                            marginBottom: '0.75rem',
                        }}>
                            Turn Your Resume Into an{' '}
                            <span className="gradient-text">ATS Magnet</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
                            Upload your PDF resume, paste a job description, and get a professionally
                            rewritten resume using the <strong>Google XYZ Method</strong> — instantly.
                        </p>
                    </div>
                )}

                {/* Error banner */}
                {stage === STAGE.ERROR && (
                    <div className="error-banner anim-fade-up">
                        ⚠️ {error}
                    </div>
                )}

                {/* Stage content */}
                {(stage === STAGE.IDLE || stage === STAGE.ERROR) && (
                    <div className="glass-card anim-fade-up" style={{ padding: '2rem' }}>
                        <UploadForm onSubmit={handleSubmit} isLoading={false} />
                    </div>
                )}

                {isProcessing && (
                    <div className="glass-card anim-fade-up" style={{ padding: '2rem' }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                            ⚙️ Optimizing Your Resume…
                        </h2>
                        <ProcessingSteps currentStep={stage} />
                    </div>
                )}

                {stage === STAGE.DONE && pdfBlobUrl && (
                    <div className="anim-fade-up">
                        <ResumePreview pdfBlobUrl={pdfBlobUrl} onStartOver={handleReset} />
                    </div>
                )}

                {/* Feature pills — idle only */}
                {stage === STAGE.IDLE && (
                    <div className="anim-fade-up" style={{
                        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center',
                        animationDelay: '0.2s',
                    }}>
                        {[
                            { icon: '🔒', label: 'Zero-trust input validation' },
                            { icon: '🤖', label: 'Gemini AI (XYZ bullets)' },
                            { icon: '📄', label: "Jake's Resume template" },
                            { icon: '⚡', label: 'Instant PDF download' },
                        ].map(f => (
                            <div key={f.label} style={{
                                padding: '0.45rem 1rem',
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border)',
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                            }}>
                                <span>{f.icon}</span> {f.label}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ResumeBoost · Built with React, Node.js, Google Gemini & LaTeX · All processing server-side
                </p>
            </footer>
        </div>
    )
}
