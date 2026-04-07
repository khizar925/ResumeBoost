/* ── SVG Icons ───────────────────────────────────────────────── */
const DownloadIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
    </svg>
)

const CheckCircleIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
        stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <circle cx="12" cy="12" r="10" opacity="0.2" fill="var(--accent)" />
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
)

/* ── Component ───────────────────────────────────────────────── */
export default function ResumePreview({ pdfBlobUrl, onStartOver }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Success header card */}
            <div className="surface-card anim-fade-up" style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
            }}>
                <div className="anim-checkmark" aria-label="Success">
                    <CheckCircleIcon />
                </div>

                <div>
                    <h2 style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: '1.45rem',
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                        marginBottom: '0.45rem',
                    }}>
                        Your optimized resume is ready
                    </h2>
                    <p style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.55,
                        maxWidth: 400,
                        margin: '0 auto',
                    }}>
                        Rewritten with the Google XYZ Method. Items marked{' '}
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>[verify]</span>{' '}
                        need your review before sending.
                    </p>
                </div>

                {/* Action buttons */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: '0.25rem',
                }}>
                    <a
                        href={pdfBlobUrl}
                        download="optimized_resume.pdf"
                        className="btn-primary"
                        style={{ textDecoration: 'none' }}
                        aria-label="Download optimized resume PDF"
                    >
                        <DownloadIcon />
                        Download PDF
                    </a>
                    <button
                        className="btn-secondary"
                        onClick={onStartOver}
                        aria-label="Start over with a new resume"
                    >
                        <RefreshIcon />
                        Start over
                    </button>
                </div>
            </div>

            {/* PDF preview */}
            <div className="surface-card" style={{
                padding: 0,
                overflow: 'hidden',
                minHeight: '700px',
            }}>
                <iframe
                    src={pdfBlobUrl}
                    title="Optimized Resume Preview"
                    style={{
                        width: '100%',
                        height: '700px',
                        border: 'none',
                        display: 'block',
                        borderRadius: 'var(--r-lg)',
                    }}
                />
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                If the preview doesn't load, use the Download button above.
            </p>
        </div>
    )
}
