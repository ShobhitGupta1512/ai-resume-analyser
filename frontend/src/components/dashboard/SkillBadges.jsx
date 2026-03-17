import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ─── Category colour + icon mapping ──────────────────────────────────────────
const CATEGORY_STYLE = {
  languages:     { accent: '#00D4FF', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.2)',  icon: '{ }',  label: 'Languages'      },
  frameworks:    { accent: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)',icon: '⬡',    label: 'Frameworks'     },
  databases:     { accent: '#00E5A0', bg: 'rgba(0,229,160,0.08)',   border: 'rgba(0,229,160,0.2)',  icon: '▦',    label: 'Databases'      },
  cloud:         { accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)', icon: '☁',    label: 'Cloud & DevOps' },
  tools:         { accent: '#FB7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)',icon: '⚙',    label: 'Tools'          },
  soft:          { accent: '#34D399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)', icon: '◈',    label: 'Soft Skills'    },
  // fallback for any unexpected key from the API
  other:         { accent: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)',icon: '◆',    label: 'Other'          },
}

function getStyle(key) {
  return CATEGORY_STYLE[key] ?? CATEGORY_STYLE.other
}

// ─── Single skill chip ────────────────────────────────────────────────────────
function SkillChip({ name, accent, bg, border, delay, inView }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.75, y: 8 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 11px',
        borderRadius: '999px',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.72rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        cursor: 'default',
        userSelect: 'none',
        background: hovered ? bg.replace('0.08', '0.18') : bg,
        border: `1px solid ${hovered ? accent + '55' : border}`,
        color: hovered ? accent : 'rgba(255,255,255,0.7)',
        boxShadow: hovered ? `0 0 12px ${accent}22` : 'none',
        transition: 'background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </motion.span>
  )
}

// ─── Category group block ─────────────────────────────────────────────────────
function CategoryGroup({ categoryKey, skills, groupIndex, inView }) {
  const style = getStyle(categoryKey)

  if (!skills || skills.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: groupIndex * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      {/* Group header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.65rem',
          color: style.accent,
          lineHeight: 1,
        }}>
          {style.icon}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.62rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: style.accent,
          opacity: 0.85,
        }}>
          {style.label}
        </span>
        {/* Count pill */}
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.58rem',
          color: style.accent,
          background: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: '999px',
          padding: '1px 6px',
          opacity: 0.75,
        }}>
          {skills.length}
        </span>
        {/* Trailing line */}
        <div style={{
          flex: 1, height: '1px',
          background: `linear-gradient(90deg, ${style.accent}30, transparent)`,
        }} />
      </div>

      {/* Chip cloud */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '7px',
      }}>
        {skills.map((skill, chipIdx) => (
          <SkillChip
            key={skill}
            name={skill}
            accent={style.accent}
            bg={style.bg}
            border={style.border}
            delay={groupIndex * 0.07 + chipIdx * 0.04}
            inView={inView}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * SkillBadges
 * Props:
 *   skills: { grouped: { languages:[], frameworks:[], databases:[], cloud:[], tools:[], soft:[] }, all: [], totalCount: number }
 */
export default function SkillBadges({ skills }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const grouped    = skills?.grouped    ?? {}
  const totalCount = skills?.totalCount ?? 0

  // Ordered category keys (only those with skills)
  const ORDER = ['languages', 'frameworks', 'databases', 'cloud', 'tools', 'soft']
  const activeKeys = ORDER.filter(k => grouped[k]?.length > 0)
  // also surface any unexpected keys from the API
  const extraKeys  = Object.keys(grouped).filter(k => !ORDER.includes(k) && grouped[k]?.length > 0)
  const allKeys    = [...activeKeys, ...extraKeys]

  const displayKeys = filter === 'all' ? allKeys : [filter]

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <div style={{
        position: 'relative',
        background: 'var(--bg-card, rgba(16,18,27,0.85))',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
        borderRadius: '20px',
        padding: '28px 28px 26px',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}>

        {/* Dot-grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px', borderRadius: 'inherit',
        }} />

        {/* ── Header ── */}
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
              Detected Skills
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '1.15rem', fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary, #fff)',
              margin: 0,
            }}>
              Skill Inventory
            </h2>
          </div>

          {/* Total count chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: '12px',
              padding: '8px 14px',
              minWidth: '58px',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.4rem', fontWeight: 800,
              color: '#A78BFA', lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {totalCount}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.58rem', color: 'rgba(167,139,250,0.5)',
              letterSpacing: '0.08em', marginTop: '3px',
            }}>
              skills
            </span>
          </motion.div>
        </div>

        {/* ── Filter tabs ── */}
        {allKeys.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              display: 'flex', flexWrap: 'wrap', gap: '6px',
              marginBottom: '22px', position: 'relative', zIndex: 1,
            }}
          >
            {['all', ...allKeys].map(k => {
              const isActive = filter === k
              const s = k === 'all' ? null : getStyle(k)
              return (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.62rem', fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: '999px',
                    cursor: 'pointer', border: '1px solid',
                    transition: 'all 0.2s',
                    background: isActive
                      ? (s ? s.bg.replace('0.08','0.2') : 'rgba(255,255,255,0.1)')
                      : 'transparent',
                    borderColor: isActive
                      ? (s ? s.accent + '55' : 'rgba(255,255,255,0.3)')
                      : 'rgba(255,255,255,0.1)',
                    color: isActive
                      ? (s ? s.accent : 'rgba(255,255,255,0.9)')
                      : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {k === 'all' ? 'All' : (s?.label ?? k)}
                </button>
              )
            })}
          </motion.div>
        )}

        {/* ── Category groups ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '22px',
          position: 'relative', zIndex: 1,
        }}>
          {displayKeys.map((key, i) => (
            <CategoryGroup
              key={key}
              categoryKey={key}
              skills={grouped[key]}
              groupIndex={i}
              inView={inView}
            />
          ))}

          {/* Empty state */}
          {displayKeys.length === 0 && (
            <p style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              padding: '24px 0',
            }}>
              No skills detected in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}