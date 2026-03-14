export default function ResumePreview({ pdfBlobUrl, onStartOver }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Success header */}
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }} className="anim-fade-up">
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Your <span className="gradient-text">ATS-Optimized Resume</span> is Ready
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Rewritten with the Google XYZ Method. Items marked <span style={{ color: '#fbbf24' }}>[verify]</span> need your review.
                </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                    href={pdfBlobUrl}
                    download="optimized_resume.pdf"
                    className="btn-primary"
                    style={{ textDecoration: 'none' }}
                >
                    ⬇️ Download PDF
                </a>
                <button className="btn-secondary" onClick={onStartOver}>
                    🔄 Start Over
                </button>
            </div>

            {/* PDF iframe preview */}
            <div
                className="glass-card"
                style={{ padding: '0', overflow: 'hidden', borderRadius: '14px', minHeight: '700px' }}
            >
                <iframe
                    src={pdfBlobUrl}
                    title="Optimized Resume Preview"
                    style={{
                        width: '100%',
                        height: '700px',
                        border: 'none',
                        display: 'block',
                        borderRadius: '14px',
                    }}
                />
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                If the preview doesn't display, use the Download button above.
            </p>
        </div>
    )
}
