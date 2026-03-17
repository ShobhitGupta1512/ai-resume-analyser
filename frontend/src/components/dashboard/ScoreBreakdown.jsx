import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ─── Category metadata ────────────────────────────────────────────────────────
// Maps each category key from atsScore.categories to a display label + icon char
const CATEGORY_META = {
  completeness: { label: 'Completeness',  icon: '◈', weight: 20 },
  skills:       { label: 'Skills',        icon: '◆', weight: 20 },
  summary:      { label: 'Summary',       icon: '◉', weight: 15 },
  experience:   { label: 'Experience',    icon: '▲', weight: 20 },
  keywords:     { label: 'Keywords',      icon: '⬡', weight: 15 },
  formatting:   { label: 'Formatting',    icon: '▣', weight: 10 },
}

// Colour ramp based on score percentage (score / weight)
function barColor(score, weight) {
  const pct = score / weight
  if (pct >= 0.85) return { bar: '#00E5A0', glow: 'rgba(0,229,160,0.35)', text: '#00E5A0' }
  if (pct >= 0.65) return { bar: '#00D4FF', glow: 'rgba(0,212,255,0.3)',  text: '#00D4FF' }
  if (pct >= 0.40) return { bar: '#FFB800', glow: 'rgba(255,184,0,0.3)',   text: '#FFB800' }
  return                   { bar: '#FF4D6A', glow: 'rgba(255,77,106,0.3)', text: '#FF4D6A' }
}

function scoreLabel(score, weight) {
  const pct = score / weight
  if (pct >= 0.85) return 'Excellent'
  if (pct >= 0.65) return 'Good'
  if (pct >= 0.40) return 'Fair'
  return 'Weak'
}

// ─── Single animated bar row ──────────────────────────────────────────────────
function BarRow({ categoryKey, score, weight, label, icon, index, inView }) {
  const pct    = Math.min(score / weight, 1)
  const colors = barColor(score, weight)
  const status = scoreLabel(score, weight)

  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Icon glyph */}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: colors.text,
            opacity: 0.85,
            lineHeight: 1,
          }}>
            {icon}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}>
            {label}
          </span>
          {/* Weight badge */}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '4px',
            padding: '1px 5px',
          }}>
            /{weight}pts
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Status label */}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: colors.text,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.9,
          }}>
            {status}
          </span>
          {/* Numeric score */}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: colors.text,
            minWidth: '32px',
            textAlign: 'right',
          }}>
            {score}
          </span>
        </div>
      </div>

      {/* Track + fill */}
      <div style={{
        position: 'relative',
        height: '6px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* Animated fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct * 100}%` } : { width: 0 }}
          transition={{ duration: 0.9, delay: index * 0.08 + 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            borderRadius: '999px',
            background: colors.bar,
            boxShadow: `0 0 8px ${colors.glow}`,
          }}
        />

        {/* Shimmer sweep — plays once after fill */}
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={inView ? { x: '400%', opacity: [0, 0.6, 0] } : {}}
          transition={{
            duration: 0.7,
            delay: index * 0.08 + 0.9,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: 0, bottom: 0,
            width: '30%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            borderRadius: '999px',
          }}
        />
      </div>

      {/* Tick marks at 25 / 50 / 75 pct of the track */}
      <div style={{ position: 'relative', height: '4px', marginTop: '-2px' }}>
        {[25, 50, 75].map(p => (
          <div key={p} style={{
            position: 'absolute',
            left: `${p}%`,
            top: 0,
            width: '1px',
            height: '4px',
            background: 'rgba(255,255,255,0.08)',
            transform: 'translateX(-50%)',
          }} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * ScoreBreakdown
 * Props:
 *   atsScore: { totalScore, grade, label, color, categories: { completeness, skills, summary, experience, keywords, formatting }, suggestions }
 */
export default function ScoreBreakdown({ atsScore }) {
  const ref    = useRef(null)
  const [inView, setInView] = useState(false)

  // Trigger animations when card scrolls into view
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const categories = atsScore?.categories ?? {}
  const totalScore = atsScore?.totalScore ?? 0
  const suggestions = atsScore?.suggestions ?? []

  // Build ordered rows
  const rows = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    score:  Math.round(categories[key] ?? 0),
    weight: meta.weight,
    label:  meta.label,
    icon:   meta.icon,
  }))

  return (
    <div ref={ref} style={{ width: '100%' }}>
      {/* ── Card ── */}
      <div style={{
        position: 'relative',
        background: 'var(--bg-card, rgba(16,18,27,0.85))',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
        borderRadius: '20px',
        padding: '28px 28px 24px',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}>

        {/* Dot-grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          borderRadius: 'inherit',
        }} />

        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '24px',
          position: 'relative', zIndex: 1,
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted, rgba(255,255,255,0.35))',
              margin: '0 0 4px',
            }}>
              Score Breakdown
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '1.15rem', fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary, #fff)',
              margin: 0,
            }}>
              6 ATS Categories
            </h2>
          </div>

          {/* Total score chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(0,212,255,0.07)',
              border: '1px solid rgba(0,212,255,0.18)',
              borderRadius: '12px',
              padding: '8px 14px',
              minWidth: '64px',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.5rem', fontWeight: 800,
              color: 'var(--accent-cyan, #00D4FF)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {totalScore}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.6rem', color: 'rgba(0,212,255,0.5)',
              letterSpacing: '0.08em', marginTop: '3px',
            }}>
              / 100
            </span>
          </motion.div>
        </div>

        {/* Bars */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '18px',
          position: 'relative', zIndex: 1,
        }}>
          {rows.map((row, i) => (
            <BarRow
              key={row.key}
              categoryKey={row.key}
              score={row.score}
              weight={row.weight}
              label={row.label}
              icon={row.icon}
              index={i}
              inView={inView}
            />
          ))}
        </div>

        {/* Divider */}
        {suggestions.length > 0 && (
          <div style={{
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            margin: '24px 0 20px',
            position: 'relative', zIndex: 1,
          }} />
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <p style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.62rem', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text-muted, rgba(255,255,255,0.35))',
              margin: '0 0 10px',
            }}>
              Suggestions
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {suggestions.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.65 + i * 0.06 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    fontFamily: 'var(--font-body, sans-serif)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary, rgba(255,255,255,0.55))',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: '5px', height: '5px',
                    borderRadius: '50%',
                    background: 'var(--accent-cyan, #00D4FF)',
                    opacity: 0.6,
                    marginTop: '5px',
                  }} />
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  )
}