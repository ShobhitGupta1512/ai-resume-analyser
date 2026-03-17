import { useEffect } from 'react'
import { motion }     from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, RotateCcw, Download } from 'lucide-react'

import useResumeStore   from '../store/resumeStore'
import ATSGauge         from '../components/dashboard/ATSGauge'
import ScoreBreakdown   from '../components/dashboard/ScoreBreakdown'
import SkillBadges      from '../components/dashboard/SkillBadges'
import SectionCards     from '../components/dashboard/SectionCards'

// ─── Stagger container variants ───────────────────────────────────────────────
const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

// ─── Minimal top navbar ───────────────────────────────────────────────────────
function Navbar({ fileName, onReset }) {
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 40px',
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent-cyan, #00D4FF), var(--accent-green, #00E5A0))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={14} color="#0A0A0F" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontWeight: 800, fontSize: '1rem',
          color: 'var(--text-primary, #fff)',
        }}>
          ResumeAI
        </span>
        {fileName && (
          <span style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.04em',
            padding: '2px 8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
          }}>
            {fileName}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <NavBtn icon={<ArrowLeft size={13} />} label="Back" onClick={() => navigate('/analyse')} />
        <NavBtn icon={<RotateCcw size={13} />} label="New Analysis" onClick={onReset} accent />
      </div>
    </nav>
  )
}

function NavBtn({ icon, label, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
        fontFamily: 'var(--font-body, sans-serif)',
        fontSize: '0.78rem', fontWeight: 500,
        background: accent ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
        color: accent ? 'var(--accent-cyan, #00D4FF)' : 'rgba(255,255,255,0.5)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = accent ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.08)'
        e.currentTarget.style.color = accent ? '#00D4FF' : '#fff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = accent ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)'
        e.currentTarget.style.color = accent ? 'var(--accent-cyan, #00D4FF)' : 'rgba(255,255,255,0.5)'
      }}
    >
      {icon} {label}
    </button>
  )
}

// ─── Grade banner hero ────────────────────────────────────────────────────────
function HeroBanner({ atsScore, fileName }) {
  const score = atsScore?.totalScore ?? 0
  const grade = atsScore?.grade      ?? '—'
  const label = atsScore?.label      ?? ''

  function gradeColor(g) {
    if (['A+','A','A-'].includes(g)) return '#00E5A0'
    if (['B+','B','B-'].includes(g)) return '#00D4FF'
    if (['C+','C','C-'].includes(g)) return '#FFB800'
    return '#FF4D6A'
  }
  const col = gradeColor(grade)

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: '20px',
      background: 'rgba(16,18,27,0.9)',
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '36px 40px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '24px',
      flexWrap: 'wrap',
    }}>
      {/* Ambient glow blob */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '220px', height: '220px', borderRadius: '50%',
        background: `radial-gradient(circle, ${col}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '22px 22px', borderRadius: 'inherit',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.65rem', fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', margin: '0 0 8px',
        }}>
          Analysis Complete
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          fontWeight: 800, letterSpacing: '-0.03em',
          color: '#fff', margin: '0 0 10px',
          lineHeight: 1.15,
        }}>
          Your ATS Score is{' '}
          <span style={{ color: col }}>{score}/100</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body, sans-serif)',
          fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)',
          margin: 0, lineHeight: 1.6,
        }}>
          {label} · Scroll down to explore your full breakdown
        </p>
      </div>

      {/* Grade badge */}
      <div style={{
        position: 'relative', zIndex: 1,
        flexShrink: 0,
        width: '80px', height: '80px',
        borderRadius: '16px',
        background: `${col}15`,
        border: `2px solid ${col}40`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '2px',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '2rem', fontWeight: 800,
          color: col, lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          {grade}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.55rem', color: `${col}80`,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          grade
        </span>
      </div>
    </div>
  )
}

// ─── Empty / redirect guard ───────────────────────────────────────────────────
function EmptyState() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '16px', color: 'rgba(255,255,255,0.4)',
      fontFamily: 'var(--font-body, sans-serif)',
    }}>
      <span style={{ fontSize: '2.5rem' }}>📄</span>
      <p style={{ fontSize: '0.9rem' }}>No analysis data found.</p>
      <button
        onClick={() => navigate('/analyse')}
        style={{
          padding: '10px 22px', borderRadius: '10px', cursor: 'pointer',
          background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
          color: '#00D4FF', fontFamily: 'var(--font-body, sans-serif)',
          fontSize: '0.85rem', fontWeight: 500,
        }}
      >
        Analyse a Resume →
      </button>
    </div>
  )
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate      = useNavigate()
  const clearAnalysis = useResumeStore(s => s.clearAnalysis)
  const rawFile       = useResumeStore(s => s.rawFile)
  const fileName      = rawFile?.name ?? null
  const sections      = useResumeStore(s => s.sections)
  const skills        = useResumeStore(s => s.skills)
  const atsScore      = useResumeStore(s => s.atsScore)
  const matchResult   = useResumeStore(s => s.matchResult)
  const feedback      = useResumeStore(s => s.feedback)

  // Guard: no data → send back to analyse
  if (!atsScore) return <EmptyState />

  function handleReset() {
    clearAnalysis()
    navigate('/analyse')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base, #0A0A0F)',
      position: 'relative',
    }}>

      {/* Grid texture */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Navbar */}
      <Navbar fileName={fileName} onReset={handleReset} />

      {/* Page content */}
      <main style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1100px', margin: '0 auto',
        padding: '40px 24px 100px',
      }}>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >

          {/* ── Hero banner ── */}
          <motion.div variants={fadeUp}>
            <HeroBanner atsScore={atsScore} fileName={fileName} />
          </motion.div>

          {/* ── Top row: Gauge + Score Breakdown side by side ── */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.7fr)',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            <ATSGauge atsScore={atsScore} />
            <ScoreBreakdown atsScore={atsScore} />
          </motion.div>

          {/* ── Skills ── */}
          <motion.div variants={fadeUp}>
            <SkillBadges skills={skills} />
          </motion.div>

          {/* ── Section cards ── */}
          <motion.div variants={fadeUp}>
            <SectionCards sections={sections} />
          </motion.div>

          {/* ── Placeholder panels (Week 3) ── */}
          {(matchResult || feedback) && (
            <motion.div
              variants={fadeUp}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {matchResult && <PlaceholderPanel title="Job Match" icon="⬡" accent="#00E5A0" label="Week 3 · JobMatchPanel" />}
              {feedback    && <PlaceholderPanel title="AI Feedback" icon="◈" accent="#A78BFA" label="Week 3 · FeedbackPanel" />}
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  )
}

// Temporary placeholder for Week 3 panels
function PlaceholderPanel({ title, icon, accent, label }) {
  return (
    <div style={{
      borderRadius: '20px',
      border: `1px dashed ${accent}30`,
      background: `${accent}05`,
      padding: '32px 28px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '10px', minHeight: '140px',
    }}>
      <span style={{ fontSize: '1.4rem', opacity: 0.5 }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-display, sans-serif)',
        fontSize: '0.95rem', fontWeight: 700,
        color: accent, opacity: 0.7,
      }}>
        {title}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.6rem', letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}