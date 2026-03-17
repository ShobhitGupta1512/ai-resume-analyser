import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Brain, Zap, CheckCircle, Sparkles } from 'lucide-react'

// ─── Stage config ─────────────────────────────────────────────────────────────
const STAGES = [
  {
    id: 'parse',
    icon: FileText,
    label: 'Parsing Resume',
    sublabel: 'Extracting sections, contact info, and raw text from your PDF',
    color: '#00D4FF',
    range: [0, 35],
  },
  {
    id: 'score',
    icon: Zap,
    label: 'Scoring ATS Compatibility',
    sublabel: 'Evaluating completeness, skills, keywords, and formatting across 6 categories',
    color: '#FFB347',
    range: [35, 70],
  },
  {
    id: 'ai',
    icon: Brain,
    label: 'Generating AI Feedback',
    sublabel: 'LLaMA 3.1 is writing targeted suggestions, quick wins, and rewriting your summary',
    color: '#00E5A0',
    range: [70, 100],
  },
]

const TIPS = [
  'Tip: Quantify achievements — "increased sales by 32%" beats "increased sales"',
  'Tip: Most ATS systems reject resumes with tables or text boxes — use plain layout',
  'Tip: Tailor your summary section for every role you apply to',
  'Tip: Include skills from the job description verbatim — ATS matching is literal',
  'Tip: Action verbs like "engineered", "scaled", and "launched" score higher',
  'Tip: Aim for 60–80% keyword match for the best ATS pass rate',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStage(progress) {
  return (
    STAGES.find((s) => progress >= s.range[0] && progress < s.range[1]) ||
    STAGES[progress >= 100 ? 2 : 0]
  )
}

// ─── Orbiting ring ────────────────────────────────────────────────────────────
function OrbitRing({ color, radius, speed, count = 4 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        width: radius * 2, height: radius * 2,
        top: '50%', left: '50%',
        marginTop: -radius, marginLeft: -radius,
        borderRadius: '50%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius
        return (
          <div key={i} style={{
            position: 'absolute',
            width: i === 0 ? 6 : 3, height: i === 0 ? 6 : 3,
            borderRadius: '50%',
            background: color,
            opacity: i === 0 ? 1 : 0.2,
            boxShadow: i === 0 ? `0 0 8px ${color}` : 'none',
            top: '50%', left: '50%',
            marginTop: i === 0 ? -3 : -1.5, marginLeft: i === 0 ? -3 : -1.5,
            transform: `translate(${x}px, ${y}px)`,
          }} />
        )
      })}
    </motion.div>
  )
}

// ─── Central icon ─────────────────────────────────────────────────────────────
function CenterIcon({ stage }) {
  const Icon  = stage?.icon || Sparkles
  const color = stage?.color || '#00D4FF'

  return (
    <div style={{
      position: 'relative',
      width: '130px', height: '130px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <OrbitRing color={color} radius={60} speed={3}   count={3} />
      <OrbitRing color={color} radius={46} speed={5.5} count={5} />

      {[1, 2, 3].map((i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', borderRadius: '50%',
            border: `1px solid ${color}`,
            top: '50%', left: '50%',
          }}
          animate={{ width: [32, 120], height: [32, 120], opacity: [0.6, 0],
            marginTop: [-16, -60], marginLeft: [-16, -60] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
        />
      ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={stage?.id}
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0,   opacity: 1 }}
          exit={{   scale: 0, rotate: 20,   opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: `${color}18`, border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 28px ${color}28`,
            position: 'relative', zIndex: 2,
          }}
        >
          <Icon size={26} color={color} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ progress, stage }) {
  const color = stage?.color || '#00D4FF'
  return (
    <div style={{ width: '100%', maxWidth: '440px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '10px',
      }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={stage?.label}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.875rem', fontWeight: 600, color,
            }}
          >
            {stage?.label || 'Initialising...'}
          </motion.span>
        </AnimatePresence>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem', fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          {progress}%
        </span>
      </div>

      {/* Track */}
      <div style={{
        width: '100%', height: '7px',
        background: 'var(--bg-overlay)',
        borderRadius: '999px', overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: '999px',
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: 0, width: '50%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
            }}
          />
        </motion.div>
      </div>

      {/* Segment ticks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        {[...STAGES.map(s => s.range[0]), 100].map((v) => (
          <span key={v} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: progress >= v ? color : 'var(--text-muted)',
            transition: 'color 0.4s',
          }}>
            {v}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Stage cards ──────────────────────────────────────────────────────────────
function StageList({ progress }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '10px',
      width: '100%', maxWidth: '440px',
    }}>
      {STAGES.map((stage, i) => {
        const isActive  = progress >= stage.range[0] && progress < stage.range[1]
        const isDone    = progress >= stage.range[1]

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '13px 16px', borderRadius: '14px',
              background: isActive ? `${stage.color}0C` : isDone ? 'rgba(0,229,160,0.05)' : 'var(--bg-surface)',
              border: `1px solid ${isActive ? `${stage.color}30` : isDone ? 'rgba(0,229,160,0.2)' : 'var(--border-subtle)'}`,
              transition: 'all 0.4s ease',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '36px', height: '36px', flexShrink: 0,
              borderRadius: '10px',
              background: isDone ? 'rgba(0,229,160,0.12)' : isActive ? `${stage.color}18` : 'var(--bg-elevated)',
              border: `1px solid ${isDone ? 'rgba(0,229,160,0.3)' : isActive ? `${stage.color}30` : 'var(--border-default)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.4s ease',
            }}>
              {isDone
                ? <CheckCircle size={16} color="#00E5A0" />
                : <stage.icon size={16} color={isActive ? stage.color : 'var(--text-muted)'} />
              }
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.855rem', fontWeight: 600,
                color: isDone ? '#00E5A0' : isActive ? stage.color : 'var(--text-muted)',
                marginBottom: '2px', transition: 'color 0.4s',
              }}>
                {stage.label}
              </div>
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{   opacity: 0, height: 0 }}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.73rem', color: 'var(--text-muted)',
                      lineHeight: 1.5, overflow: 'hidden',
                    }}
                  >
                    {stage.sublabel}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pill */}
            <div style={{ flexShrink: 0 }}>
              {isDone ? (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="badge badge-green" style={{ fontSize: '0.6rem' }}
                >
                  Done
                </motion.span>
              ) : isActive ? (
                <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}>
                    Running
                  </motion.span>
                </span>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                }}>
                  Pending
                </span>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Skeleton dashboard preview ───────────────────────────────────────────────
function SkeletonBlock({ h, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay }}
      style={{
        height: h, borderRadius: '14px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden', position: 'relative',
      }}
    >
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: delay * 0.4 }}
        style={{
          position: 'absolute', inset: 0, width: '50%',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.04), transparent)',
        }}
      />
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
      transition={{ delay: 0.6 }}
      style={{
        width: '100%', maxWidth: '500px',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}
    >
      <SkeletonBlock h={160} delay={0.7} />
      <SkeletonBlock h={160} delay={0.8} />
      <div style={{ gridColumn: '1 / -1' }}>
        <SkeletonBlock h={80}  delay={0.9} />
      </div>
      <SkeletonBlock h={100} delay={1.0} />
      <SkeletonBlock h={100} delay={1.1} />
    </motion.div>
  )
}

// ─── Rotating tips ────────────────────────────────────────────────────────────
function TipRotator() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TIPS.length), 4000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{
      width: '100%', maxWidth: '440px',
      padding: '13px 18px',
      background: 'rgba(255,179,71,0.06)',
      border: '1px solid rgba(255,179,71,0.16)',
      borderRadius: '12px',
      minHeight: '52px',
      display: 'flex', alignItems: 'center',
    }}>
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem', color: 'var(--accent-amber)',
            lineHeight: 1.6, margin: 0,
          }}
        >
          {TIPS[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LoadingScreen({ progress = 0, fileName }) {
  const stage = getStage(progress)

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '60px 24px 80px',
      position: 'relative', overflowX: 'hidden',
    }}>
      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px', zIndex: 0,
      }} />

      {/* Ambient glow follows stage color */}
      <motion.div
        animate={{ background: `radial-gradient(ellipse at 50% 30%, ${stage?.color}0A 0%, transparent 70%)` }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* Content column */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '32px',
        width: '100%',
      }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={13} color="#0A0A0F" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1rem', color: 'var(--text-primary)',
          }}>
            ResumeAI
          </span>
        </motion.div>

        {/* Orbiting icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <CenterIcon stage={stage} />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 800, letterSpacing: '-0.02em',
            color: 'var(--text-primary)', marginBottom: '10px',
          }}>
            Analysing your resume
          </h2>
          {fileName && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '999px',
            }}>
              <FileText size={11} color="var(--text-muted)" />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', color: 'var(--text-muted)',
              }}>
                {fileName}
              </span>
            </div>
          )}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <ProgressBar progress={progress} stage={stage} />
        </motion.div>

        {/* Stage cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <StageList progress={progress} />
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <TipRotator />
        </motion.div>

        {/* Skeleton dashboard preview */}
        <DashboardSkeleton />
      </div>
    </div>
  )
}