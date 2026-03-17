import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, ArrowRight, Lock } from 'lucide-react'
import ATSGauge from "../components/dashboard/ATSGauge";
import DropZone        from '../components/upload/DropZone'
import JobDescInput    from '../components/upload/JobDescInput'
import LoadingScreen   from '../components/upload/LoadingScreen'
import useResumeUpload from '../hooks/useResumeUpload'
import useResumeStore  from '../store/resumeStore'

export default function AnalysisPage() {
  const navigate              = useNavigate()
  const [file, setFile]       = useState(null)
  const [role, setRole]       = useState('')
  const [jobDesc, setJobDesc] = useState('')

  const atsScore = useResumeStore(s => s.atsScore)

  const { analyse, status, progress, error, reset } = useResumeUpload()

  const isLoading  = status === 'uploading' || status === 'analysing'
  const isError    = status === 'error'
  const isDone     = status === 'done'
  const canAnalyse = !!file && !!role && jobDesc.length > 30 && !isLoading

  useEffect(() => {
    if (isDone) navigate('/dashboard')
  }, [isDone, navigate])

  const handleAnalyse = () => {
    if (!canAnalyse) return
    analyse(file, `Target Role: ${role}\n\n${jobDesc}`)
  }

  if (isLoading) {
    return <LoadingScreen progress={progress} fileName={file?.name} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>

      {/* Grid bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={16} color="#0A0A0F" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.1rem', color: 'var(--text-primary)',
          }}>
            ResumeAI
          </span>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={15} /> Back
        </button>
      </nav>

      {/* Main */}
      <main style={{
        position: 'relative', zIndex: 10,
        maxWidth: '660px', margin: '0 auto',
        padding: '72px 24px 100px',
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: '12px',
          }}>
            Analyse Your Resume
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            Complete all three steps for a fully targeted ATS score,
            keyword gap analysis, and AI-powered feedback.
          </p>
        </motion.div>

        {/* 3-step progress tracker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}
        >
          {[
            { label: 'Upload Resume',   done: !!file },
            { label: 'Select Role',     done: !!role },
            { label: 'Job Description', done: jobDesc.length > 30 },
          ].map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1 }}>
                <motion.div
                  animate={{
                    background:  step.done ? 'var(--accent-green)' : 'var(--bg-elevated)',
                    borderColor: step.done ? 'var(--accent-green)' : 'var(--border-default)',
                    boxShadow:   step.done ? '0 0 10px rgba(0,229,160,0.4)' : 'none',
                  }}
                  style={{
                    width: '20px', height: '20px', flexShrink: 0,
                    borderRadius: '50%', border: '2px solid',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s ease',
                  }}
                >
                  {step.done && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%', background: '#0A0A0F',
                      }}
                    />
                  )}
                </motion.div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.73rem',
                  color: step.done ? 'var(--accent-green)' : 'var(--text-muted)',
                  transition: 'color 0.3s', whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  height: '1px', flex: 1, margin: '0 6px',
                  background: step.done ? 'rgba(0,229,160,0.3)' : 'var(--border-subtle)',
                  transition: 'background 0.4s ease',
                }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step 01 — Upload */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          style={{ marginBottom: '20px' }}
        >
          <StepLabel number="01" label="Upload Resume" done={!!file} />
          <DropZone onFileSelect={setFile} disabled={isLoading} />
        </motion.div>

        {/* Step 02 — Role + Job Description */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          style={{ marginBottom: '28px' }}
        >
          <StepLabel
            number="02"
            label="Target Role & Job Description"
            done={!!role && jobDesc.length > 30}
          />
          <JobDescInput
            role={role} jobDesc={jobDesc}
            onRoleChange={setRole}
            onJobDescChange={setJobDesc}
            disabled={isLoading}
          />
        </motion.div>

        {/* API Error */}
        <AnimatePresence>
          {isError && error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                marginBottom: '16px', padding: '14px 18px',
                background: 'rgba(255,77,106,0.08)',
                border: '1px solid rgba(255,77,106,0.25)',
                borderRadius: '12px', color: '#FF4D6A',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '12px',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
              }}
            >
              <span>⚠ {error}</span>
              <button onClick={reset} style={{
                background: 'none', border: 'none', color: '#FF4D6A',
                cursor: 'pointer', fontSize: '0.8rem',
                textDecoration: 'underline', fontFamily: 'var(--font-body)',
              }}>
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyse button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            className="btn-primary"
            onClick={handleAnalyse}
            disabled={!canAnalyse}
            style={{
              width: '100%', fontSize: '1rem', padding: '16px 32px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '10px',
              opacity: canAnalyse ? 1 : 0.4,
              cursor: canAnalyse ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.3s ease',
            }}
          >
            {!canAnalyse ? (
              <><Lock size={15} /> Complete all steps to analyse</>
            ) : (
              <>Analyse My Resume <ArrowRight size={16} /></>
            )}
          </button>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.78rem',
            color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center',
          }}>
            {canAnalyse
              ? `ATS score for ${role} · keyword match · AI feedback · ~10 seconds`
              : 'Upload resume, select role, and add job description to continue'}
          </p>

          {/* ✅ FIXED: pass the whole atsScore object, not individual props */}
          {atsScore && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <ATSGauge atsScore={atsScore} />
            </div>
          )}
        </motion.div>

      </main>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function StepLabel({ number, label, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        color: done ? 'var(--accent-green)' : 'var(--accent-cyan)',
        letterSpacing: '0.1em', transition: 'color 0.3s',
      }}>
        {number}
      </span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600,
        color: done ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'color 0.3s',
      }}>
        {label}
      </span>
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="badge badge-green" style={{ fontSize: '0.6rem', padding: '2px 8px' }}
          >
            ✓ Done
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}