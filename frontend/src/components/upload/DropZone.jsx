import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, X, CheckCircle,
  AlertCircle, File, Trash2
} from 'lucide-react'

// ─── Animated border dots ─────────────────────────────────────────────────────
function DashedBorder({ active, accepted, rejected }) {
  const color = rejected
    ? '#FF4D6A'
    : accepted
    ? '#00E5A0'
    : active
    ? '#00D4FF'
    : 'var(--border-default)'

  return (
    <svg
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', borderRadius: '20px',
        overflow: 'visible',
      }}
    >
      <motion.rect
        x="1" y="1"
        width="calc(100% - 2px)" height="calc(100% - 2px)"
        rx="19" ry="19"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="8 6"
        animate={{
          strokeDashoffset: active ? [0, -56] : 0,
          stroke: color,
        }}
        transition={{
          strokeDashoffset: { duration: 1.2, repeat: Infinity, ease: 'linear' },
          stroke: { duration: 0.3 },
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </svg>
  )
}

// ─── File size formatter ──────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Particle burst on drop ───────────────────────────────────────────────────
function ParticleBurst({ trigger }) {
  const particles = Array.from({ length: 12 }, (_, i) => i)
  return (
    <AnimatePresence>
      {trigger && (
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none', overflow: 'hidden',
          borderRadius: '20px',
        }}>
          {particles.map((i) => {
            const angle = (i / particles.length) * 360
            const distance = 60 + Math.random() * 40
            const rad = (angle * Math.PI) / 180
            const x = Math.cos(rad) * distance
            const y = Math.sin(rad) * distance
            const colors = ['#00D4FF', '#00E5A0', '#FFB347']
            const color = colors[i % colors.length]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: '50%', y: '50%', scale: 1 }}
                animate={{ opacity: 0, x: `calc(50% + ${x}px)`, y: `calc(50% + ${y}px)`, scale: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.02 }}
                style={{
                  position: 'absolute',
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                  top: 0, left: 0,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── DropZone Component ───────────────────────────────────────────────────────
export default function DropZone({ onFileSelect, disabled = false }) {
  const [file, setFile]           = useState(null)
  const [error, setError]         = useState(null)
  const [burst, setBurst]         = useState(false)
  const burstTimer                = useRef(null)

  const triggerBurst = () => {
    setBurst(true)
    clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => setBurst(false), 800)
  }

  const onDrop = useCallback((accepted, rejected) => {
    setError(null)

    if (rejected.length > 0) {
      const reason = rejected[0].errors[0]
      if (reason.code === 'file-too-large') {
        setError('File too large. Maximum size is 5MB.')
      } else if (reason.code === 'file-invalid-type') {
        setError('Only PDF files are accepted.')
      } else {
        setError('Invalid file. Please upload a PDF.')
      }
      return
    }

    if (accepted.length > 0) {
      const selected = accepted[0]
      setFile(selected)
      triggerBurst()
      onFileSelect?.(selected)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled,
  })

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
    setError(null)
    onFileSelect?.(null)
  }

  // ── State-based styles ──────────────────────────────────────────────────────
  const getBgColor = () => {
    if (isDragReject || error)  return 'rgba(255,77,106,0.04)'
    if (isDragAccept)           return 'rgba(0,229,160,0.05)'
    if (isDragActive)           return 'rgba(0,212,255,0.05)'
    if (file)                   return 'rgba(0,229,160,0.04)'
    return 'var(--bg-surface)'
  }

  return (
    <div style={{ width: '100%' }}>
      {/* ── Drop Zone Box ──────────────────────────────────── */}
      <motion.div
        {...getRootProps()}
        animate={{
          scale: isDragActive ? 1.01 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          position: 'relative',
          borderRadius: '20px',
          padding: '48px 32px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: getBgColor(),
          transition: 'background 0.3s ease',
          outline: 'none',
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input {...getInputProps()} />

        {/* Animated dashed border */}
        <DashedBorder
          active={isDragActive}
          accepted={isDragAccept}
          rejected={isDragReject || !!error}
        />

        {/* Particle burst */}
        <ParticleBurst trigger={burst} />

        {/* Inner glow when dragging */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0,
                background: isDragReject
                  ? 'radial-gradient(ellipse at center, rgba(255,77,106,0.06) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
                borderRadius: '20px',
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Content: No file ───────────────────────────── */}
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '16px',
                textAlign: 'center', position: 'relative', zIndex: 2,
              }}
            >
              {/* Icon */}
              <motion.div
                animate={{
                  y: isDragActive ? -8 : 0,
                  scale: isDragActive ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: '72px', height: '72px',
                  borderRadius: '18px',
                  background: isDragReject
                    ? 'rgba(255,77,106,0.12)'
                    : isDragActive
                    ? 'rgba(0,212,255,0.12)'
                    : 'var(--bg-elevated)',
                  border: `1px solid ${
                    isDragReject ? 'rgba(255,77,106,0.3)'
                    : isDragActive ? 'rgba(0,212,255,0.3)'
                    : 'var(--border-default)'
                  }`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: isDragActive ? '0 0 30px rgba(0,212,255,0.15)' : 'none',
                }}
              >
                <AnimatePresence mode="wait">
                  {isDragReject ? (
                    <motion.div key="reject" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <AlertCircle size={32} color="#FF4D6A" />
                    </motion.div>
                  ) : isDragActive ? (
                    <motion.div key="active" initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                      <Upload size={32} color="#00D4FF" />
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <FileText size={32} color="var(--text-muted)" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Text */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem', fontWeight: 700,
                  color: isDragReject
                    ? '#FF4D6A'
                    : isDragActive
                    ? '#00D4FF'
                    : 'var(--text-primary)',
                  marginBottom: '8px',
                  transition: 'color 0.3s ease',
                }}>
                  {isDragReject
                    ? 'PDF files only'
                    : isDragActive
                    ? 'Release to upload'
                    : 'Drop your resume here'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}>
                  {!isDragActive && (
                    <>
                      or{' '}
                      <span style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                        browse files
                      </span>
                      {' '}— PDF only, max 5MB
                    </>
                  )}
                </div>
              </div>

              {/* Format tags */}
              {!isDragActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  {['PDF'].map(fmt => (
                    <span key={fmt} className="badge badge-cyan">{fmt}</span>
                  ))}
                  <span className="badge" style={{
                    color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    borderColor: 'var(--border-default)',
                  }}>
                    Max 5MB
                  </span>
                </motion.div>
              )}
            </motion.div>

          ) : (
            /* ── Content: File selected ──────────────────── */
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '20px',
                textAlign: 'center', position: 'relative', zIndex: 2,
                width: '100%',
              }}
            >
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                style={{
                  width: '72px', height: '72px',
                  borderRadius: '18px',
                  background: 'rgba(0,229,160,0.10)',
                  border: '1px solid rgba(0,229,160,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(0,229,160,0.12)',
                }}
              >
                <CheckCircle size={32} color="#00E5A0" />
              </motion.div>

              {/* File info card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(0,229,160,0.2)',
                  borderRadius: '14px',
                  padding: '14px 20px',
                  width: '100%', maxWidth: '360px',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <File size={18} color="#00D4FF" />
                </div>

                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem', fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {file.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem', color: 'var(--text-muted)',
                    marginTop: '3px',
                  }}>
                    {formatSize(file.size)} · PDF
                  </div>
                </div>

                {/* Remove button */}
                <motion.button
                  whileHover={{ scale: 1.1, color: '#FF4D6A' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={removeFile}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '6px', flexShrink: 0,
                    transition: 'color 0.2s ease',
                  }}
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>

              {/* Ready label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#00E5A0',
                  boxShadow: '0 0 8px #00E5A0',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem', color: '#00E5A0',
                  letterSpacing: '0.08em',
                }}>
                  READY TO ANALYSE
                </span>
              </motion.div>

              {/* Replace hint */}
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem', color: 'var(--text-muted)',
              }}>
                Click or drop a new file to replace
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Error Message ───────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginTop: '12px',
              padding: '12px 16px',
              background: 'rgba(255,77,106,0.08)',
              border: '1px solid rgba(255,77,106,0.25)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <AlertCircle size={15} color="#FF4D6A" style={{ flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem', color: '#FF4D6A',
            }}>
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', color: 'rgba(255,77,106,0.6)',
                display: 'flex', alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}