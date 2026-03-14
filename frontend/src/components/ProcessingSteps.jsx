import { useEffect, useState } from 'react'

const STEPS = [
    { id: 'upload', label: 'Uploading Resume', icon: '📤', description: 'Extracting text from your PDF…' },
    { id: 'optimize', label: 'AI Optimization', icon: '🤖', description: 'Gemini is rewriting with XYZ method…' },
    { id: 'compile', label: 'Compiling PDF', icon: '📄', description: 'Running LaTeX to generate your resume…' },
]

export default function ProcessingSteps({ currentStep }) {
    const [visibleSteps, setVisibleSteps] = useState([])

    useEffect(() => {
        // Stagger step reveal animation
        STEPS.forEach((step, i) => {
            setTimeout(() => {
                setVisibleSteps(prev => [...prev, step.id])
            }, i * 200)
        })
    }, [])

    const currentIdx = STEPS.findIndex(s => s.id === currentStep)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
                This usually takes 20–40 seconds
            </p>
            {STEPS.map((step, i) => {
                const isDone = i < currentIdx
                const isActive = i === currentIdx
                const isPending = i > currentIdx
                const isVisible = visibleSteps.includes(step.id)

                return (
                    <div
                        key={step.id}
                        className="glass-card"
                        style={{
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                            transition: 'opacity 0.4s ease, transform 0.4s ease, border-color 0.3s, box-shadow 0.3s',
                            borderColor: isActive ? 'rgba(139,92,246,0.4)' : isDone ? 'rgba(16,185,129,0.3)' : 'var(--border)',
                            boxShadow: isActive ? '0 0 20px rgba(139,92,246,0.15)' : 'none',
                        }}
                    >
                        {/* Step icon / spinner / check */}
                        <div style={{
                            width: 40, height: 40,
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem',
                            background: isDone
                                ? 'rgba(16,185,129,0.15)'
                                : isActive
                                    ? 'rgba(139,92,246,0.15)'
                                    : 'rgba(255,255,255,0.04)',
                            border: `1.5px solid ${isDone ? 'rgba(16,185,129,0.4)' : isActive ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                        }}>
                            {isDone ? (
                                <span className="anim-checkmark" style={{ fontSize: '1.1rem' }}>✅</span>
                            ) : isActive ? (
                                <span className="anim-spin" style={{ display: 'inline-block' }}>{step.icon}</span>
                            ) : (
                                <span style={{ opacity: 0.4 }}>{step.icon}</span>
                            )}
                        </div>

                        {/* Labels */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: isDone ? 'var(--success)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                transition: 'color 0.3s',
                            }}>
                                {step.label}
                            </div>
                            {isActive && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    {step.description}
                                </div>
                            )}
                            {isDone && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.15rem' }}>
                                    Complete
                                </div>
                            )}
                        </div>

                        {/* Step number */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {i + 1}/{STEPS.length}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
