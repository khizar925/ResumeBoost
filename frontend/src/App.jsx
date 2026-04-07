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

/* ── Icons ───────────────────────────────────────────────────── */
const LogoMark = ({ onDark = false }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="13" height="18" rx="2"
      fill={onDark ? 'rgba(52,209,138,0.14)' : 'var(--bg-accent-light)'}
      stroke={onDark ? 'var(--dp-mint)' : 'var(--accent)'} strokeWidth="1.5" />
    <line x1="8"  y1="9"  x2="14" y2="9"  stroke={onDark ? 'var(--dp-mint)' : 'var(--accent)'} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8"  y1="12" x2="14" y2="12" stroke={onDark ? 'var(--dp-mint)' : 'var(--accent)'} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8"  y1="15" x2="11" y2="15" stroke={onDark ? 'var(--dp-mint)' : 'var(--accent)'} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 7 L20 3 L22 7 L18.8 8.6 L22 10.2 L20 14 L18 10.2 L21.2 8.6 Z"
      fill={onDark ? 'var(--dp-gold)' : 'var(--accent)'} />
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

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* ── Left Panel ──────────────────────────────────────────────── */
const FEATURES = [
  'Private · no data retained',
  'AI-Powered · Google XYZ Method',
  "Jake's LaTeX template",
  'ATS-ready PDF in seconds',
]

function LeftPanel() {
  return (
    <aside className="left-panel" aria-label="ResumeBoost">
      <div className="lp-top">
        <div className="lp-logo">
          <LogoMark onDark />
          <span>ResumeBoost</span>
        </div>
      </div>

      <div className="lp-body">
        <p className="lp-eyebrow">Resume Optimizer</p>
        <h1 className="lp-heading">
          Your resume,<br />
          <em>rewritten</em><br />
          to get hired.
        </h1>
        <p className="lp-tagline">
          Upload your PDF. Paste a job description. Our AI rewrites every
          bullet using the <strong>Google XYZ Method</strong> and exports
          a polished LaTeX PDF ready to send.
        </p>
        <div className="lp-rule" aria-hidden="true" />
        <ul className="lp-features" aria-label="Key features">
          {FEATURES.map(f => (
            <li key={f}>
              <span className="lp-check" aria-hidden="true"><CheckIcon /></span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="lp-bottom">
        Powered by AI · LaTeX · React
      </div>
    </aside>
  )
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  const [stage, setStage]           = useState(STAGE.IDLE)
  const [error, setError]           = useState(null)
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

  /* ── Idle / Error — split panel ──────────────────────────── */
  if (stage === STAGE.IDLE || stage === STAGE.ERROR) {
    return (
      <div className="split-root">
        <LeftPanel />

        <div className="right-panel">
          {/* Mobile-only sticky brand header */}
          <div className="mobile-brand-header" aria-label="ResumeBoost">
            <div className="mobile-brand-logo">
              <LogoMark />
              ResumeBoost
            </div>
            <div className="step-badge">ATS-Optimized</div>
          </div>

          {/* Content wrapper — provides padding on mobile, transparent flex wrapper on desktop */}
          <div className="mobile-rp-content">
            <header className="rp-header">
              <div className="step-badge">AI-Powered · ATS-Optimized</div>
              <h2 className="rp-title">Optimize your resume</h2>
              <p className="rp-sub">
                Upload your PDF and paste the job description. Ready in ~30 seconds.
              </p>
            </header>

            {stage === STAGE.ERROR && (
              <div className="error-banner rp-error" role="alert">
                <AlertIcon />
                {error}
              </div>
            )}

            <div className="rp-form-wrap">
              <UploadForm onSubmit={handleSubmit} fillHeight />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Processing ──────────────────────────────────────────── */
  if (isProcessing) {
    return (
      <div className="centered-stage">
        <div className="surface-card centered-card anim-fade-up">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="label-mono" style={{ color: 'var(--accent)', marginBottom: '0.7rem' }}>
              In progress
            </div>
            <div className="display-heading" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
              Optimizing your resume
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Usually takes 20–40 seconds
            </p>
          </div>
          <ProcessingSteps currentStep={stage} />
        </div>
      </div>
    )
  }

  /* ── Done ────────────────────────────────────────────────── */
  if (stage === STAGE.DONE && pdfBlobUrl) {
    return (
      <div className="centered-stage" style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
        <div className="anim-fade-up" style={{ width: '100%', maxWidth: 680 }}>
          <ResumePreview pdfBlobUrl={pdfBlobUrl} onStartOver={handleReset} />
        </div>
      </div>
    )
  }

  return null
}
