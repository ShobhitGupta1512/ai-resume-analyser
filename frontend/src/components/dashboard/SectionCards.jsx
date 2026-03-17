import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Section metadata ─────────────────────────────────────────────────────────
const SECTION_META = {
  contact:          { label: 'Contact Info',      icon: '◎', accent: '#00D4FF', priority: 1 },
  summary:          { label: 'Summary',            icon: '◈', accent: '#A78BFA', priority: 2 },
  experience:       { label: 'Experience',         icon: '▲', accent: '#00E5A0', priority: 3 },
  education:        { label: 'Education',          icon: '◆', accent: '#F59E0B', priority: 4 },
  skills:           { label: 'Skills',             icon: '⬡', accent: '#00D4FF', priority: 5 },
  projects:         { label: 'Projects',           icon: '▣', accent: '#FB7185', priority: 6 },
  certifications:   { label: 'Certifications',     icon: '✦', accent: '#34D399', priority: 7 },
  awards:           { label: 'Awards',             icon: '◉', accent: '#F59E0B', priority: 8 },
  additional:       { label: 'Additional',         icon: '◇', accent: '#94A3B8', priority: 9 },
}

function getMeta(key) {
  return SECTION_META[key] ?? {
    label: key.charAt(0).toUpperCase() + key.slice(1),
    icon: '◆',
    accent: '#94A3B8',
    priority: 99,
  }
}

// Word count helper
function wordCount(text) {
  if (!text || typeof text !== 'string') return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Truncate preview text
function preview(text, max = 120) {
  if (!text || typeof text !== 'string') return ''
  const clean = text.replace(/\n+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

// Check if section has content
function hasContent(value) {
  if (!value) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return false
}

// Render section content nicely
function SectionContent({ value }) {
  if (!value) return null

  if (typeof value === 'string') {
    return (
      <p style={{
        fontFamily: 'var(--font-body, sans-serif)',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.75,
        margin: 0,
        whiteSpace: 'pre-wrap',
      }}>
        {value.trim()}
      </p>
    )
  }

  if (Array.isArray(value)) {
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {value.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{
              flexShrink: 0, marginTop: '7px',
              width: '4px', height: '4px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
            }} />
            <span style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
            }}>
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(value).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              minWidth: '80px',
              paddingTop: '2px',
              flexShrink: 0,
            }}>
              {k}
            </span>
            <span style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6,
            }}>
              {Array.isArray(v) ? v.join(', ') : String(v)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// ─── Single collapsible card ──────────────────────────────────────────────────
function SectionCard({ sectionKey, value, index, inView, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const meta   = getMeta(sectionKey)
  const words  = wordCount(typeof value === 'string' ? value : JSON.stringify(value))
  const prev   = typeof value === 'string' ? preview(value) : ''
  const filled = hasContent(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        style={{
          borderRadius: '14px',
          border: `1px solid ${open ? meta.accent + '28' : 'rgba(255,255,255,0.07)'}`,
          background: open
            ? `linear-gradient(135deg, ${meta.accent}06 0%, rgba(16,18,27,0.9) 100%)`
            : 'rgba(16,18,27,0.6)',
          overflow: 'hidden',
          transition: 'border-color 0.3s, background 0.3s',
          cursor: filled ? 'pointer' : 'default',
        }}
        onClick={() => filled && setOpen(o => !o)}
      >
        {/* ── Card header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
        }}>
          {/* Icon dot */}
          <div style={{
            width: '32px', height: '32px', flexShrink: 0,
            borderRadius: '8px',
            background: filled ? `${meta.accent}15` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${filled ? meta.accent + '30' : 'rgba(255,255,255,0.07)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem',
              color: filled ? meta.accent : 'rgba(255,255,255,0.2)',
            }}>
              {meta.icon}
            </span>
          </div>

          {/* Label + preview */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: filled ? 'var(--text-primary, #fff)' : 'rgba(255,255,255,0.25)',
                letterSpacing: '-0.01em',
              }}>
                {meta.label}
              </span>

              {/* Status badge */}
              {filled ? (
                <span style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.58rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: `${meta.accent}15`,
                  border: `1px solid ${meta.accent}30`,
                  color: meta.accent,
                }}>
                  ✓ detected
                </span>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.58rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'rgba(255,77,106,0.08)',
                  border: '1px solid rgba(255,77,106,0.2)',
                  color: '#FF4D6A',
                }}>
                  missing
                </span>
              )}

              {/* Word count */}
              {filled && words > 0 && (
                <span style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.58rem',
                  color: 'rgba(255,255,255,0.22)',
                  letterSpacing: '0.04em',
                }}>
                  {words}w
                </span>
              )}
            </div>

            {/* Collapsed preview text */}
            {!open && filled && prev && (
              <p style={{
                fontFamily: 'var(--font-body, sans-serif)',
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.28)',
                margin: '3px 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {prev}
              </p>
            )}
          </div>

          {/* Chevron */}
          {filled && (
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              style={{
                width: '20px', height: '20px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.6rem',
              }}
            >
              ▼
            </motion.div>
          )}
        </div>

        {/* ── Expanded content ── */}
        <AnimatePresence initial={false}>
          {open && filled && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* accent top border */}
              <div style={{
                height: '1px',
                background: `linear-gradient(90deg, ${meta.accent}40, transparent)`,
                margin: '0 18px',
              }} />
              <div style={{ padding: '16px 18px 18px' }}>
                <SectionContent value={value} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * SectionCards
 * Props:
 *   sections: { contact, summary, skills, experience, education, projects, certifications, awards, additional }
 */
export default function SectionCards({ sections }) {
  const ref    = useRef(null)
  const [inView, setInView] = useState(false)
  const [expandAll, setExpandAll] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const secs = sections ?? {}

  // Sort by priority, filled sections first
  const sorted = Object.entries(secs)
    .map(([key, value]) => ({ key, value, meta: getMeta(key), filled: hasContent(value) }))
    .sort((a, b) => {
      if (a.filled !== b.filled) return a.filled ? -1 : 1
      return a.meta.priority - b.meta.priority
    })

  const filledCount  = sorted.filter(s => s.filled).length
  const missingCount = sorted.filter(s => !s.filled).length

  return (
    <div ref={ref} style={{ width: '100%' }}>
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
          backgroundSize: '20px 20px', borderRadius: 'inherit',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '20px',
          position: 'relative', zIndex: 1,
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-muted, rgba(255,255,255,0.32))',
              margin: '0 0 4px',
            }}>
              Resume Sections
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '1.15rem', fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary, #fff)',
              margin: 0,
            }}>
              Section Breakdown
            </h2>
          </div>

          {/* Stats + expand toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.62rem', letterSpacing: '0.06em',
                padding: '3px 8px', borderRadius: '999px',
                background: 'rgba(0,229,160,0.1)',
                border: '1px solid rgba(0,229,160,0.2)',
                color: '#00E5A0',
              }}>
                {filledCount} found
              </span>
              {missingCount > 0 && (
                <span style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.62rem', letterSpacing: '0.06em',
                  padding: '3px 8px', borderRadius: '999px',
                  background: 'rgba(255,77,106,0.08)',
                  border: '1px solid rgba(255,77,106,0.2)',
                  color: '#FF4D6A',
                }}>
                  {missingCount} missing
                </span>
              )}
            </div>

            {/* Expand / Collapse all */}
            <button
              onClick={() => setExpandAll(e => !e)}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6rem', letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer', padding: 0,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#00D4FF'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              {expandAll ? '↑ collapse all' : '↓ expand all'}
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'relative', zIndex: 1,
        }}>
          {sorted.map(({ key, value }, i) => (
            <SectionCard
              key={key}
              sectionKey={key}
              value={value}
              index={i}
              inView={inView}
              defaultOpen={expandAll}
            />
          ))}
        </div>
      </div>
    </div>
  )
}