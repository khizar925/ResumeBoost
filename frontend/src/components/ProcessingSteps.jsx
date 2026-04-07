import { useEffect, useState } from 'react'

const STEPS = [
    { id: 'upload',   label: 'Uploading resume',  description: 'Extracting text from your PDF'            },
    { id: 'optimize', label: 'AI optimization',   description: 'Rewriting bullets with the XYZ method'    },
    { id: 'compile',  label: 'Compiling PDF',      description: 'Typesetting your resume with LaTeX'       },
]

/* ── SVG Icons ───────────────────────────────────────────────── */
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const LoaderIcon = () => (
    <svg className="anim-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
)

/* ── Component ───────────────────────────────────────────────── */
export default function ProcessingSteps({ currentStep }) {
    const [visibleSteps, setVisibleSteps] = useState([])

    useEffect(() => {
        STEPS.forEach((step, i) => {
            setTimeout(() => {
                setVisibleSteps(prev => [...prev, step.id])
            }, i * 160)
        })
    }, [])

    const currentIdx = STEPS.findIndex(s => s.id === currentStep)

    return (
        <div role="list" aria-label="Processing steps">
            {STEPS.map((step, i) => {
                const isDone    = i < currentIdx
                const isActive  = i === currentIdx
                const isVisible = visibleSteps.includes(step.id)

                return (
                    <div
                        key={step.id}
                        role="listitem"
                        aria-current={isActive ? 'step' : undefined}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'flex-start',
                            opacity:   isVisible ? 1 : 0,
                            transform: isVisible ? 'translateX(0)' : 'translateX(-10px)',
                            transition: 'opacity 0.35s ease, transform 0.35s ease',
                            paddingBottom: i < STEPS.length - 1 ? '0' : '0',
                            position: 'relative',
                            marginBottom: i < STEPS.length - 1 ? '1.5rem' : 0,
                        }}
                    >
                        {/* Connecting line between steps */}
                        {i < STEPS.length - 1 && (
                            <div style={{
                                position: 'absolute',
                                left: '18px',
                                top: '38px',
                                height: 'calc(1.5rem + 1px)',
                                width: '2px',
                                background: isDone ? 'var(--accent)' : 'var(--border)',
                                transition: 'background 0.5s ease',
                            }} aria-hidden="true" />
                        )}

                        {/* Step indicator circle */}
                        <div
                            aria-hidden="true"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: `2px solid ${isDone ? 'var(--accent)' : isActive ? 'var(--accent)' : 'var(--border)'}`,
                                background: isDone
                                    ? 'var(--accent)'
                                    : isActive
                                    ? 'var(--bg-accent-light)'
                                    : 'var(--bg-muted)',
                                color: isDone
                                    ? '#fff'
                                    : isActive
                                    ? 'var(--accent)'
                                    : 'var(--text-muted)',
                                transition: 'all 0.3s ease',
                                zIndex: 1,
                            }}
                        >
                            {isDone ? (
                                <span className="anim-checkmark"><CheckIcon /></span>
                            ) : isActive ? (
                                <LoaderIcon />
                            ) : (
                                <span style={{
                                    fontFamily: 'DM Mono, monospace',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                }}>
                                    {i + 1}
                                </span>
                            )}
                        </div>

                        {/* Step text */}
                        <div style={{ paddingTop: '0.45rem' }}>
                            <div style={{
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                color: isDone
                                    ? 'var(--accent)'
                                    : isActive
                                    ? 'var(--text-primary)'
                                    : 'var(--text-muted)',
                                lineHeight: 1.3,
                                transition: 'color 0.3s',
                            }}>
                                {step.label}
                            </div>
                            <div style={{
                                fontSize: '0.77rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.18rem',
                                opacity: (isActive || isDone) ? 1 : 0,
                                transition: 'opacity 0.3s',
                                lineHeight: 1.4,
                            }}>
                                {isDone ? 'Complete' : step.description}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
