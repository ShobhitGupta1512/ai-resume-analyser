import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, X, Sparkles, AlertCircle,
  ChevronDown, Search, Check
} from 'lucide-react'

// ─── Role Data ────────────────────────────────────────────────────────────────
const ROLE_CATEGORIES = [
  {
    category: 'Engineering',
    color: '#00D4FF',
    roles: [
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'Mobile Developer (iOS)', 'Mobile Developer (Android)',
      'React Native Developer', 'DevOps Engineer',
      'Site Reliability Engineer', 'Cloud Engineer',
      'Embedded Systems Engineer',
    ],
  },
  {
    category: 'Data & AI',
    color: '#00E5A0',
    roles: [
      'Data Scientist', 'Data Engineer', 'Machine Learning Engineer',
      'AI/ML Researcher', 'Data Analyst', 'Business Intelligence Analyst',
      'NLP Engineer', 'Computer Vision Engineer',
    ],
  },
  {
    category: 'Design',
    color: '#FFB347',
    roles: [
      'UI/UX Designer', 'Product Designer', 'Graphic Designer',
      'Motion Designer', 'UX Researcher', 'Design Systems Designer',
    ],
  },
  {
    category: 'Product & Management',
    color: '#FF4D6A',
    roles: [
      'Product Manager', 'Technical Product Manager',
      'Engineering Manager', 'Scrum Master',
      'Project Manager', 'Program Manager',
    ],
  },
  {
    category: 'Cybersecurity',
    color: '#A78BFA',
    roles: [
      'Security Engineer', 'Penetration Tester', 'SOC Analyst',
      'Cloud Security Engineer', 'Application Security Engineer',
    ],
  },
  {
    category: 'Other Tech',
    color: '#00E5A0',
    roles: [
      'QA Engineer', 'Automation Test Engineer', 'Technical Writer',
      'Solutions Architect', 'Systems Analyst', 'IT Support Engineer',
    ],
  },
]

const ALL_ROLES = ROLE_CATEGORIES.flatMap((c) =>
  c.roles.map((r) => ({ role: r, category: c.category, color: c.color }))
)

const MAX_CHARS = 3000

// ─── Role Option Row ──────────────────────────────────────────────────────────
function RoleOption({ role, color, selected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => onSelect(role)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 16px', cursor: 'pointer',
        background: selected
          ? `${color}14`
          : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.12s ease',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '0.855rem',
        color: selected ? color : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'color 0.12s ease',
      }}>
        {role}
      </span>
      {selected && <Check size={13} color={color} />}
    </div>
  )
}

// ─── Role Selector ────────────────────────────────────────────────────────────
function RoleSelector({ value, onChange }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef          = useRef(null)
  const wrapRef           = useRef(null)

  const filtered = query.trim()
    ? ALL_ROLES.filter(
        (r) =>
          r.role.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase())
      )
    : null

  const meta = ALL_ROLES.find((r) => r.role === value)

  const handleOpen = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSelect = (role) => {
    onChange(role)
    setOpen(false)
    setQuery('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <motion.div
        onClick={handleOpen}
        whileTap={{ scale: 0.998 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--bg-surface)',
          border: `1px solid ${
            open
              ? 'rgba(0,212,255,0.5)'
              : value
              ? `${meta?.color}44`
              : 'var(--border-default)'
          }`,
          borderRadius: open ? '12px 12px 0 0' : '12px',
          padding: '13px 16px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: open ? '0 0 0 3px rgba(0,212,255,0.06)' : 'none',
          userSelect: 'none',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '34px', height: '34px', flexShrink: 0,
          background: value ? `${meta?.color}16` : 'var(--bg-elevated)',
          border: `1px solid ${value ? `${meta?.color}30` : 'var(--border-default)'}`,
          borderRadius: '9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s ease',
        }}>
          <Briefcase size={14} color={value ? meta?.color : 'var(--text-muted)'} />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          {value ? (
            <>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {value}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem', color: meta?.color,
                marginTop: '1px',
              }}>
                {meta?.category}
              </div>
            </>
          ) : (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem', color: 'var(--text-muted)',
            }}>
              Select your target role
            </span>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AnimatePresence>
            {value && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={handleClear}
                style={{
                  width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '7px', color: 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,77,106,0.1)'
                  e.currentTarget.style.color = '#FF4D6A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <X size={13} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: 'var(--text-muted)', lineHeight: 0 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop to close */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 90 }}
              onClick={() => { setOpen(false); setQuery('') }}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(0,212,255,0.3)',
                borderTop: '1px solid var(--border-subtle)',
                borderRadius: '0 0 14px 14px',
                zIndex: 100, maxHeight: '320px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
                transformOrigin: 'top',
                overflow: 'hidden',
              }}
            >
              {/* Search bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                flexShrink: 0,
              }}>
                <Search size={13} color="var(--text-muted)" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search roles or categories..."
                  style={{
                    flex: 1, background: 'none',
                    border: 'none', outline: 'none',
                    fontFamily: 'var(--font-body)', fontSize: '0.84rem',
                    color: 'var(--text-primary)',
                    caretColor: 'var(--accent-cyan)',
                  }}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--text-muted)',
                      lineHeight: 0, padding: '2px',
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {filtered ? (
                  filtered.length === 0 ? (
                    <div style={{
                      padding: '28px', textAlign: 'center',
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}>
                      No roles found for "{query}"
                    </div>
                  ) : (
                    filtered.map(({ role, category, color }) => (
                      <RoleOption
                        key={role} role={role} category={category}
                        color={color} selected={value === role}
                        onSelect={handleSelect}
                      />
                    ))
                  )
                ) : (
                  ROLE_CATEGORIES.map((cat) => (
                    <div key={cat.category}>
                      {/* Category label */}
                      <div style={{
                        padding: '10px 16px 4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem', fontWeight: 700,
                        color: cat.color, letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        borderTop: '1px solid var(--border-subtle)',
                      }}>
                        {cat.category}
                      </div>
                      {cat.roles.map((role) => (
                        <RoleOption
                          key={role} role={role} category={cat.category}
                          color={cat.color} selected={value === role}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function JobDescInput({
  role, jobDesc,
  onRoleChange, onJobDescChange,
  disabled = false,
}) {
  const [focused, setFocused] = useState(false)

  const charCount  = jobDesc?.length || 0
  const isNearMax  = charCount > MAX_CHARS * 0.85
  const isAtMax    = charCount >= MAX_CHARS
  const roleOk     = !!role
  const descOk     = charCount > 30
  const bothReady  = roleOk && descOk

  const handleDescChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) onJobDescChange?.(e.target.value)
  }

  return (
    <div style={{
      width: '100%',
      background: 'var(--bg-surface)',
      border: `1px solid ${bothReady ? 'rgba(0,229,160,0.25)' : 'var(--border-default)'}`,
      borderRadius: '16px',
      padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      transition: 'border-color 0.3s ease',
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem', fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            Target Role & Job Description
          </span>
          <span className="badge badge-red" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
            Required
          </span>
        </div>

        <AnimatePresence>
          {bothReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="badge badge-green"
              style={{ fontSize: '0.62rem' }}
            >
              <Check size={9} /> Ready
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role selector */}
      <div>
        <label style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          color: 'var(--text-muted)', letterSpacing: '0.1em',
          display: 'block', marginBottom: '6px',
        }}>
          TARGET ROLE
        </label>
        <RoleSelector value={role} onChange={onRoleChange} />
      </div>

      {/* Job description textarea */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '6px',
        }}>
          <label style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: 'var(--text-muted)', letterSpacing: '0.1em',
          }}>
            JOB DESCRIPTION
          </label>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: isAtMax
              ? 'var(--accent-red)'
              : isNearMax ? 'var(--accent-amber)' : 'var(--text-muted)',
            transition: 'color 0.3s',
          }}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        <div style={{
          position: 'relative',
          background: 'var(--bg-elevated)',
          border: `1px solid ${
            focused
              ? 'rgba(0,212,255,0.45)'
              : descOk
              ? 'rgba(0,229,160,0.25)'
              : 'var(--border-default)'
          }`,
          borderRadius: '12px',
          boxShadow: focused ? '0 0 0 3px rgba(0,212,255,0.05)' : 'none',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}>
          <textarea
            value={jobDesc || ''}
            onChange={handleDescChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Paste the full job description here...

We are looking for a ${role || 'Software Engineer'} with strong experience in building scalable systems. The ideal candidate should have 3+ years of experience...`}
            style={{
              width: '100%', minHeight: '160px', maxHeight: '300px',
              resize: 'vertical',
              background: 'transparent', border: 'none', outline: 'none',
              padding: '14px',
              fontFamily: 'var(--font-body)', fontSize: '0.875rem',
              color: 'var(--text-primary)', lineHeight: 1.7,
              caretColor: 'var(--accent-cyan)', display: 'block',
            }}
          />

          {/* Clear */}
          <AnimatePresence>
            {descOk && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => onJobDescChange?.('')}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px', cursor: 'pointer',
                  width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,77,106,0.4)'
                  e.currentTarget.style.color = '#FF4D6A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <X size={12} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem', color: 'var(--text-muted)',
            }}>
              {isAtMax ? (
                <>
                  <AlertCircle size={11} color="var(--accent-amber)" />
                  <span style={{ color: 'var(--accent-amber)' }}>Limit reached</span>
                </>
              ) : (
                <>
                  <Sparkles size={11} />
                  Keyword matching runs automatically
                </>
              )}
            </div>
            {/* Char fill bar */}
            <div style={{
              width: '72px', height: '3px',
              background: 'var(--bg-overlay)', borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%` }}
                transition={{ duration: 0.1 }}
                style={{
                  height: '100%', borderRadius: '999px',
                  background: isAtMax
                    ? 'var(--accent-red)'
                    : isNearMax
                    ? 'var(--accent-amber)'
                    : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))',
                  transition: 'background 0.3s',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Validation hint */}
      <AnimatePresence>
        {!bothReady && (role || charCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px',
              background: 'rgba(255,179,71,0.06)',
              border: '1px solid rgba(255,179,71,0.18)',
              borderRadius: '10px',
            }}
          >
            <AlertCircle size={13} color="var(--accent-amber)" />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.79rem',
              color: 'var(--accent-amber)',
            }}>
              {!roleOk
                ? 'Select a target role to enable role-specific ATS scoring'
                : 'Add a job description to enable keyword gap analysis'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}