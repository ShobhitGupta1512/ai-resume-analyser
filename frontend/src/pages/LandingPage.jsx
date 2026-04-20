import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Zap, Target, TrendingUp, ArrowRight,
  CheckCircle, Brain, Shield, ChevronDown, Sparkles,
  X, Eye, EyeOff, Mail, Lock, User, ArrowLeft,
  LogOut, LayoutDashboard
} from 'lucide-react'
import useAuthStore from '../store/auth/authStore'

/* ═══════════════════════════════════════════════════════════
   GRID BACKGROUND
═══════════════════════════════════════════════════════════ */
function GridBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0, background: '#05070d' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(0,255,255,0.10) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '600px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(0,255,180,0.07) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />
      <motion.div
        style={{
          position: 'absolute', left: 0, right: 0, height: '120px',
          background: 'linear-gradient(180deg, transparent, rgba(0,255,255,0.06), transparent)',
          filter: 'blur(25px)',
        }}
        animate={{ top: ['-20%', '110%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.85), transparent)',
          boxShadow: '0 0 10px rgba(0,255,255,0.8), 0 0 25px rgba(0,255,255,0.5)',
        }}
        animate={{ top: ['0%', '100%'], opacity: [0.3, 1, 0.3] }}
        transition={{ top: { duration: 6, repeat: Infinity, ease: 'linear' }, opacity: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MODAL SUB-COMPONENTS
   NOTE: Each is its own closed function — no nesting!
═══════════════════════════════════════════════════════════ */
function ModalHeader({ title, sub, icon }) {
  return (
    <div style={{ marginBottom: '26px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,255,0.12)', marginBottom: '14px' }}>
        <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>{icon}</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)', fontSize: '1.55rem', fontWeight: 800, color: '#f0f0f0', margin: '0 0 8px', lineHeight: 1.1 }}>{title}</h2>
      <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>{sub}</p>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.83rem', color: '#ff8080' }}>
      {msg}
    </div>
  )
}

function InputField({ icon, style, onEnter, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>{icon}</div>
      <input
        {...props}
        style={{ ...style, paddingLeft: '40px' }}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  )
}

function ModalSwitch({ text, link, onClick }) {
  return (
    <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)' }}>
      {text}{' '}
      <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#00D4FF', cursor: 'pointer', fontSize: '0.83rem', padding: 0, textDecoration: 'underline' }}>{link}</button>
    </p>
  )
}

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════ */
const MODAL_MODES = { LOGIN: 'login', REGISTER: 'register', OTP_EMAIL: 'otp_email', OTP_LOGIN: 'otp_login' }

function AuthModal({ isOpen, onClose, initialMode = MODAL_MODES.LOGIN }) {
  const navigate = useNavigate()
  const { register, verifyEmail, login, verifyLogin, resendOtp, loading, error, clearError } = useAuthStore()

  const [mode, setMode] = useState(initialMode)
  const [showPass, setShowPass] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(0)
  const [localError, setLocalError] = useState('')
  const otpRefs = useRef([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setForm({ name: '', email: '', password: '' })
      setOtp(['', '', '', '', '', ''])
      setLocalError('')
      clearError?.()
    }
  }, [isOpen, initialMode])

  useEffect(() => {
    if (otpTimer <= 0) return
    const t = setTimeout(() => setOtpTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [otpTimer])

  const handleField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const getOtpString = () => otp.join('')

  const handleRegister = async () => {
    setLocalError('')
    if (!form.name || !form.email || !form.password) return setLocalError('All fields are required.')
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      setPendingEmail(form.email)
      setOtp(['', '', '', '', '', ''])
      setOtpTimer(120)
      setMode(MODAL_MODES.OTP_EMAIL)
    } catch (e) {
      setLocalError(e.message || 'Registration failed.')
    }
  }

  const handleVerifyEmail = async () => {
    setLocalError('')
    const code = getOtpString()
    if (code.length < 6) return setLocalError('Enter the 6-digit code.')
    try {
      await verifyEmail({ email: pendingEmail, otp: code })
      onClose()
      navigate('/dashboard')
    } catch (e) {
      setLocalError(e.message || 'Invalid or expired code.')
    }
  }

  const handleLogin = async () => {
    setLocalError('')
    if (!form.email || !form.password) return setLocalError('Email and password are required.')
    try {
      await login({ email: form.email, password: form.password })
      setPendingEmail(form.email)
      setOtp(['', '', '', '', '', ''])
      setOtpTimer(120)
      setMode(MODAL_MODES.OTP_LOGIN)
    } catch (e) {
      setLocalError(e.message || 'Login failed. Check your credentials.')
    }
  }

  const handleVerifyLogin = async () => {
    setLocalError('')
    const code = getOtpString()
    if (code.length < 6) return setLocalError('Enter the 6-digit code.')
    try {
      await verifyLogin({ email: pendingEmail, otp: code })
      onClose()
      navigate('/dashboard')
    } catch (e) {
      setLocalError(e.message || 'Invalid or expired code.')
    }
  }

  const handleResend = async () => {
    try {
      const purpose = mode === MODAL_MODES.OTP_EMAIL ? 'verify-email' : 'login'
      await resendOtp({ email: pendingEmail, purpose })
      setOtpTimer(120)
      setOtp(['', '', '', '', '', ''])
    } catch (e) {
      setLocalError(e.message || 'Could not resend code. Try again.')
    }
  }

  const displayError = localError || error

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px',
    padding: '14px 16px', color: '#f0f0f0', fontSize: '0.95rem',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box', fontFamily: 'inherit',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.16)',
  }

  const btnPrimary = {
    width: '100%', padding: '14px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #00D4FF, #00E5A0)',
    border: 'none', color: '#05070d', fontWeight: 700,
    fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.75 : 1, transition: 'opacity 0.2s, transform 0.15s',
    letterSpacing: '0.02em', fontFamily: 'inherit',
    boxShadow: '0 18px 40px rgba(0,212,255,0.12)',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative', zIndex: 201, width: '100%', maxWidth: '480px',
              maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
              background: 'rgba(9,14,22,0.96)', border: '1px solid rgba(0,212,255,0.18)',
              borderRadius: '24px', padding: '32px',
              boxShadow: '0 35px 90px rgba(0,0,0,0.35)',
            }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <X size={18} />
            </button>

            {/* LOGIN */}
            {mode === MODAL_MODES.LOGIN && (
              <div>
                <ModalHeader title="Welcome back" sub="Sign in to your ResumeAI account" icon="👋" />
                {displayError && <ErrorBox msg={displayError} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <InputField icon={<Mail size={15} />} style={inputStyle} type="email" name="email" placeholder="Email address" value={form.email} onChange={handleField} onEnter={handleLogin} />
                  <div style={{ position: 'relative' }}>
                    <InputField icon={<Lock size={15} />} style={{ ...inputStyle, paddingRight: '44px' }} type={showPass ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleField} onEnter={handleLogin} />
                    <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button style={btnPrimary} onClick={handleLogin} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
                <ModalSwitch text="Don't have an account?" link="Create one" onClick={() => { setLocalError(''); clearError?.(); setMode(MODAL_MODES.REGISTER) }} />
              </div>
            )}

            {/* REGISTER */}
            {mode === MODAL_MODES.REGISTER && (
              <div>
                <ModalHeader title="Create account" sub="Start analysing your resume for free" icon="🚀" />
                {displayError && <ErrorBox msg={displayError} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <InputField icon={<User size={15} />} style={inputStyle} type="text" name="name" placeholder="Full name" value={form.name} onChange={handleField} onEnter={handleRegister} />
                  <InputField icon={<Mail size={15} />} style={inputStyle} type="email" name="email" placeholder="Email address" value={form.email} onChange={handleField} onEnter={handleRegister} />
                  <div style={{ position: 'relative' }}>
                    <InputField icon={<Lock size={15} />} style={{ ...inputStyle, paddingRight: '44px' }} type={showPass ? 'text' : 'password'} name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleField} onEnter={handleRegister} />
                    <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button style={btnPrimary} onClick={handleRegister} disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account →'}
                </button>
                <ModalSwitch text="Already have an account?" link="Sign in" onClick={() => { setLocalError(''); clearError?.(); setMode(MODAL_MODES.LOGIN) }} />
              </div>
            )}

            {/* OTP */}
            {(mode === MODAL_MODES.OTP_EMAIL || mode === MODAL_MODES.OTP_LOGIN) && (
              <div>
                <button onClick={() => setMode(mode === MODAL_MODES.OTP_EMAIL ? MODAL_MODES.REGISTER : MODAL_MODES.LOGIN)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginBottom: '20px', padding: 0 }}>
                  <ArrowLeft size={13} /> Back
                </button>
                <ModalHeader
                  title={mode === MODAL_MODES.OTP_EMAIL ? 'Verify your email' : 'Two-factor check'}
                  sub={`We sent a 6-digit code to ${pendingEmail}`}
                  icon="📬"
                />
                {displayError && <ErrorBox msg={displayError} />}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '24px 0' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      maxLength={1}
                      style={{
                        width: '46px', height: '54px', textAlign: 'center',
                        background: digit ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.04)',
                        border: digit ? '1px solid rgba(0,212,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', color: '#00D4FF',
                        fontSize: '1.3rem', fontWeight: 700, outline: 'none',
                        transition: 'all 0.15s', fontFamily: 'monospace',
                      }}
                    />
                  ))}
                </div>
                <button style={btnPrimary}
                  onClick={mode === MODAL_MODES.OTP_EMAIL ? handleVerifyEmail : handleVerifyLogin}
                  disabled={loading || getOtpString().length < 6}>
                  {loading ? 'Verifying…' : 'Verify Code →'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
                  {otpTimer > 0
                    ? <span>Resend in <span style={{ color: '#00D4FF' }}>{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span></span>
                    : <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#00D4FF', cursor: 'pointer', fontSize: '0.82rem' }}>Resend code</button>
                  }
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════
   SCORE PREVIEW CARD
═══════════════════════════════════════════════════════════ */
function ScorePreview() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 900); return () => clearTimeout(t) }, [])

  const radius = 70, circumference = 2 * Math.PI * radius, score = 84
  const offset = circumference - (score / 100) * circumference

  const categories = [
    { label: 'Completeness', score: 90, color: '#00D4FF' },
    { label: 'Skills', score: 85, color: '#00E5A0' },
    { label: 'Experience', score: 78, color: '#FFB347' },
    { label: 'Keywords', score: 82, color: '#00D4FF' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '24px', padding: '32px', boxShadow: '0 0 80px rgba(0,212,255,0.06), 0 24px 64px rgba(0,0,0,0.5)', width: '100%', maxWidth: '360px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#00E5A0', boxShadow: '0 0 8px #00E5A0' }} />
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>ANALYSIS COMPLETE</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '170px', height: '170px' }}>
          <svg width="170" height="170" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="85" cy="85" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
            <motion.circle cx="85" cy="85" r={radius} fill="none" stroke="url(#sg)" strokeWidth="9"
              strokeLinecap="round" strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: animated ? offset : circumference }}
              transition={{ duration: 1.6, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D4FF" /><stop offset="100%" stopColor="#00E5A0" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#00D4FF', lineHeight: 1, fontFamily: 'monospace' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
              {score}
            </motion.div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>ATS Score</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories.map((cat, i) => (
          <div key={cat.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{cat.label}</span>
              <span style={{ fontSize: '0.78rem', color: cat.color, fontFamily: 'monospace' }}>{cat.score}</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${cat.color}66, ${cat.color})` }}
                initial={{ width: 0 }}
                animate={{ width: animated ? `${cat.score}%` : 0 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1 }}
        style={{ marginTop: '20px', padding: '11px 14px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <CheckCircle size={15} color="#00E5A0" />
        <span style={{ fontSize: '0.8rem', color: '#00E5A0' }}>Strong candidate — Grade A</span>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED STAT
═══════════════════════════════════════════════════════════ */
function AnimatedStat({ value, suffix, label, delay }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    const timer = setTimeout(() => {
      let start = 0
      const step = (ts) => {
        if (!start) start = ts
        const p = Math.min((ts - start) / 1500, 1)
        setCount(Math.floor((1 - Math.pow(1 - p, 3)) * value))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timer)
  }, [inView, value, delay])

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: delay / 1000, duration: 0.6 }} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, color: '#00D4FF', lineHeight: 1, marginBottom: '8px', fontFamily: 'monospace' }}>{count}{suffix}</div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP CARD
═══════════════════════════════════════════════════════════ */
function StepCard({ number, icon: Icon, title, desc, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      style={{ position: 'relative', background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '32px 28px', overflow: 'hidden', transition: 'border-color 0.3s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '44'; e.currentTarget.style.boxShadow = `0 0 40px ${accent}10` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ position: 'absolute', top: '14px', right: '18px', fontSize: '3.5rem', fontWeight: 800, color: accent + '08', lineHeight: 1, fontFamily: 'monospace', userSelect: 'none' }}>{String(number).padStart(2, '0')}</div>
      <div style={{ width: '48px', height: '48px', background: accent + '12', border: `1px solid ${accent}2a`, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <Icon size={22} color={accent} />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{desc}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FEATURE ROW
═══════════════════════════════════════════════════════════ */
function FeatureRow({ icon: Icon, title, desc, accent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -25 : 25 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.55 }}
      style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', padding: '20px', borderRadius: '14px', border: '1px solid transparent', transition: 'all 0.25s' }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div style={{ width: '42px', height: '42px', flexShrink: 0, background: accent + '12', border: `1px solid ${accent}28`, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={19} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0f0f0', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -55])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState(MODAL_MODES.LOGIN)

  const { user, logout } = useAuthStore()

  const openLogin = useCallback(() => { setModalMode(MODAL_MODES.LOGIN); setModalOpen(true) }, [])
  const openRegister = useCallback(() => { setModalMode(MODAL_MODES.REGISTER); setModalOpen(true) }, [])

  const handleAnalyseClick = useCallback(() => {
    if (user) navigate('/dashboard')
    else openLogin()
  }, [user, navigate, openLogin])

  const handleLogout = useCallback(async () => {
    await logout?.()
    navigate('/')
  }, [logout, navigate])

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const steps = [
    { number: 1, icon: FileText, title: 'Upload Your Resume', desc: 'Drop your PDF. Our parser extracts every section — contact, skills, experience, education, projects — with precision.', accent: '#00D4FF' },
    { number: 2, icon: Brain, title: 'AI Deep Analysis', desc: 'LLaMA 3.1 powered by Groq scans your resume across 6 weighted categories and scores your ATS compatibility instantly.', accent: '#00E5A0' },
    { number: 3, icon: Target, title: 'Match Job Descriptions', desc: "Paste any job posting. See exactly which keywords you have, which you're missing, and your match score in real-time.", accent: '#FFB347' },
    { number: 4, icon: TrendingUp, title: 'Get Actionable Feedback', desc: 'Receive rewritten summaries, quick wins, and specific improvements ranked by impact. Apply them and re-score instantly.', accent: '#00D4FF' },
  ]

  const features = [
    { icon: Zap, title: 'Instant ATS Scoring', desc: 'Six-category scoring: completeness, skills, summary, experience, keywords, and formatting — all in under 3 seconds.', accent: '#00D4FF' },
    { icon: Brain, title: 'LLaMA 3.1 Feedback', desc: 'Not generic tips. Groq-powered AI reads your actual resume and writes feedback specific to your content and target role.', accent: '#00E5A0' },
    { icon: Target, title: 'Keyword Gap Analysis', desc: 'Side-by-side diff of matched and missing keywords from any job description. Know exactly what to add before you apply.', accent: '#FFB347' },
    { icon: Shield, title: 'Privacy First', desc: 'Your resume is analysed in memory and never stored without your consent. You own your data, always.', accent: '#00D4FF' },
    { icon: Sparkles, title: 'AI Summary Rewriter', desc: "Get a professionally rewritten summary tailored to your experience level and the job you're targeting.", accent: '#00E5A0' },
    { icon: TrendingUp, title: 'Score Tracking', desc: 'Upload improved versions and watch your ATS score climb. Visual trend charts show your progress over time.', accent: '#FFB347' },
  ]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', color: '#f0f0f0' }}>
      <GridBackground />
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialMode={modalMode} />

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px', background: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={15} color="#05070d" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f0f0', letterSpacing: '-0.02em' }}>ResumeAI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[{ label: 'How it works', id: 'how-it-works' }, { label: 'Features', id: 'features' }].map(item => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: 'color 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => e.target.style.color = '#f0f0f0'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
            >{item.label}</button>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '20px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#05070d' }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.email}</span>
              </div>
              <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', border: 'none', borderRadius: '8px', color: '#05070d', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                <LayoutDashboard size={14} /> Dashboard
              </button>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,80,80,0.4)'; e.currentTarget.style.color = '#ff8080' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
              <button onClick={openLogin}
                style={{ padding: '9px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#f0f0f0' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                Sign In
              </button>
              <button onClick={openRegister} style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', border: 'none', borderRadius: '8px', color: '#05070d', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Get Started
              </button>
            </div>
          )}

          <button onClick={() => setMenuOpen(m => !m)}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'none', marginLeft: '8px' }}
            className="hamburger-btn">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ position: 'fixed', top: '68px', left: '12px', right: '12px', zIndex: 99, background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {[{ label: 'How it works', id: 'how-it-works' }, { label: 'Features', id: 'features' }].map(item => (
              <button key={item.id} onClick={() => { scrollTo(item.id); setMenuOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#f0f0f0', fontSize: '0.95rem', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {item.label}
              </button>
            ))}
            {!user && (
              <>
                <button onClick={() => { openLogin(); setMenuOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '8px', padding: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f0f0f0', cursor: 'pointer', fontFamily: 'inherit' }}>Sign In</button>
                <button onClick={() => { openRegister(); setMenuOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '8px', padding: '11px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', border: 'none', borderRadius: '10px', color: '#05070d', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Get Started</button>
              </>
            )}
            {user && (
              <button onClick={() => { navigate('/dashboard'); setMenuOpen(false) }} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '8px', padding: '11px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', border: 'none', borderRadius: '10px', color: '#05070d', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Go to Dashboard
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <motion.section style={{ y: heroY, opacity: heroOpacity }}>
        <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 48px 60px', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', maxWidth: '1200px', width: '100%', alignItems: 'center' }}>
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '22px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '20px', fontSize: '0.75rem', color: '#00D4FF', letterSpacing: '0.04em' }}>
                  <Sparkles size={11} /> Powered by LLaMA 3.1 + Groq
                </span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: 'clamp(2.3rem, 5vw, 3.7rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#f0f0f0', margin: 0 }}>
                Your Resume,
              </motion.h1>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: 'clamp(2.3rem, 5vw, 3.7rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 22px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Surgically Scored.
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: '460px', marginBottom: '36px' }}>
                Upload your PDF. Get an ATS score, keyword gap analysis, and AI-powered rewrite suggestions — all in under 10 seconds.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button onClick={handleAnalyseClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', border: 'none', borderRadius: '10px', color: '#05070d', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '0.01em', fontFamily: 'inherit' }}>
                  {user ? 'Go to Dashboard' : 'Analyse My Resume'} <ArrowRight size={16} />
                </button>
                {!user && (
                  <button onClick={openRegister}
                    style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#f0f0f0' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                    Create Free Account
                  </button>
                )}
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                style={{ display: 'flex', gap: '22px', marginTop: '36px', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
                {[
                  { icon: CheckCircle, text: user ? `Hi, ${user.name?.split(' ')[0] || 'there'}! 👋` : 'No account required' },
                  { icon: Shield, text: 'Resume stays private' },
                  { icon: Zap, text: 'Results in ~8 seconds' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Icon size={13} color="#00E5A0" />
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ScorePreview />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', marginTop: '-56px', marginBottom: '56px', position: 'relative', zIndex: 10 }}>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
        <ChevronDown size={15} color="rgba(255,255,255,0.2)" />
      </motion.div>

      {/* ── STATS BAR ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '56px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.6)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '36px' }}>
          <AnimatedStat value={94} suffix="%" label="ATS Pass Rate" delay={0} />
          <AnimatedStat value={8} suffix="s" label="Avg Analysis Time" delay={150} />
          <AnimatedStat value={6} suffix="+" label="Score Categories" delay={300} />
          <AnimatedStat value={100} suffix="+" label="Skills Detected" delay={450} />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 10, padding: '110px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '20px', fontSize: '0.72rem', color: '#00E5A0', letterSpacing: '0.06em', marginBottom: '18px' }}>HOW IT WORKS</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.9rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '14px', lineHeight: 1.1 }}>
              From upload to insights<br />
              <span style={{ background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in four steps.</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', maxWidth: '460px', margin: '0 auto', lineHeight: 1.7 }}>No fluff. No lengthy onboarding. Drop your resume, get a comprehensive breakdown that actually helps you improve.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {steps.map((step, i) => <StepCard key={step.title} {...step} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ position: 'relative', zIndex: 10, padding: '110px 48px', background: 'rgba(13,17,23,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: '20px', fontSize: '0.72rem', color: '#FFB347', letterSpacing: '0.06em', marginBottom: '18px' }}>EVERYTHING YOU NEED</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#f0f0f0', marginBottom: '18px' }}>
              Not just a score.<br />
              <span style={{ background: 'linear-gradient(135deg, #FFB347, #FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>A full diagnosis.</span>
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: '32px' }}>
              Most ATS checkers give you a number and leave you guessing. ResumeAI breaks down every dimension of your resume and tells you exactly what to fix — and in what order.
            </p>
            <button onClick={handleAnalyseClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 26px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', border: 'none', borderRadius: '10px', color: '#05070d', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Get Your Free Analysis <ArrowRight size={15} />
            </button>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {features.map((f, i) => <FeatureRow key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '130px 48px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '620px', margin: '0 auto', position: 'relative' }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '20px', fontSize: '0.72rem', color: '#00D4FF', letterSpacing: '0.06em', marginBottom: '22px' }}>
            {user ? `WELCOME BACK, ${user.name?.toUpperCase().split(' ')[0] || 'USER'}` : 'FREE TO USE. NO SIGN-UP.'}
          </span>
          <h2 style={{ fontSize: 'clamp(1.9rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, color: '#f0f0f0', marginBottom: '18px' }}>
            Your next job starts with{' '}
            <span style={{ background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>a better resume.</span>
          </h2>
          <p style={{ fontSize: '0.97rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: '36px' }}>
            Drop your PDF and find out exactly where you stand — before a recruiter's ATS system makes that decision for you.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleAnalyseClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.97rem', padding: '15px 38px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', border: 'none', borderRadius: '11px', color: '#05070d', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {user ? 'Go to Dashboard' : 'Analyse My Resume Now'} <ArrowRight size={17} />
            </button>
            {!user && (
              <button onClick={openRegister}
                style={{ padding: '15px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '11px', color: 'rgba(255,255,255,0.55)', fontSize: '0.97rem', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#f0f0f0' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}>
                Create Account Free
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 10, padding: '28px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={11} color="#05070d" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>ResumeAI</span>
        </div>
        {!user && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={openLogin} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>Sign In</button>
            <button onClick={openRegister} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>Register</button>
          </div>
        )}
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>Built with Node.js + LLaMA 3.1 · © {new Date().getFullYear()}</span>
      </footer>

      <style>{`
        @media (max-width: 900px) { .hamburger-btn { display: flex !important; } }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; gap: 40px !important; }
          nav { padding: 16px 20px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (max-width: 560px) {
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}