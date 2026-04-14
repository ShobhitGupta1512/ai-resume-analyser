import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Zap, Target, TrendingUp, ArrowRight,
  CheckCircle, Brain, Shield, ChevronDown, Sparkles
} from 'lucide-react'

/* ───────── GRID BACKGROUND ───────── */
function GridBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, background: '#05070d' }} // deeper dark base
    >
      {/* Grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow top-center */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          background:
            'radial-gradient(ellipse, rgba(0,255,255,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Radial glow bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(ellipse, rgba(0,255,180,0.08) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 🔥 Background scanning glow */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '120px',
          background:
            'linear-gradient(180deg, transparent, rgba(0,255,255,0.08), transparent)',
          filter: 'blur(25px)',
        }}
        animate={{ top: ['-20%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* 🚀 Main scan line */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',

          background:
            'linear-gradient(90deg, transparent, rgba(0,255,255,0.9), transparent)',

          boxShadow: `
            0 0 10px rgba(0,255,255,0.8),
            0 0 25px rgba(0,255,255,0.6),
            0 0 40px rgba(0,255,255,0.3)
          `,

          filter: 'blur(0.6px)',
        }}
        animate={{
          top: ['0%', '100%'],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          top: { duration: 5, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedStat({ value, suffix, label, delay }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    const timer = setTimeout(() => {
      let start = 0
      const duration = 1500
      const step = (timestamp) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * value))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timer)
  }, [inView, value, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000, duration: 0.6 }}
      style={{ textAlign: 'center' }}
    >
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 700,
        color: 'var(--accent-cyan)',
        lineHeight: 1,
        marginBottom: '8px',
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </motion.div>
  )
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ number, icon: Icon, title, desc, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
        padding: '36px 32px',
        cursor: 'default',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent + '44'
        e.currentTarget.style.boxShadow = `0 0 40px ${accent}10`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-default)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Step number watermark */}
      <div style={{
        position: 'absolute', top: '16px', right: '20px',
        fontFamily: 'var(--font-display)',
        fontSize: '4rem', fontWeight: 800,
        color: accent + '08',
        lineHeight: 1, userSelect: 'none',
      }}>
        {String(number).padStart(2, '0')}
      </div>

      {/* Icon */}
      <div style={{
        width: '52px', height: '52px',
        background: accent + '15',
        border: `1px solid ${accent}33`,
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <Icon size={24} color={accent} />
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.15rem', fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '12px',
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
      }}>
        {desc}
      </p>
    </motion.div>
  )
}

// ─── Feature Row ──────────────────────────────────────────────────────────────
function FeatureRow({ icon: Icon, title, desc, accent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      style={{
        display: 'flex', gap: '20px', alignItems: 'flex-start',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid transparent',
        background: 'transparent',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
      whileHover={{
        borderColor: 'var(--border-default)',
      }}
    >
      <div style={{
        width: '44px', height: '44px', flexShrink: 0,
        background: accent + '15',
        border: `1px solid ${accent}30`,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem', fontWeight: 600,
          color: 'var(--text-primary)', marginBottom: '6px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          {desc}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Fake Resume Score Preview ────────────────────────────────────────────────
function ScorePreview() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const score = 84
  const offset = circumference - (score / 100) * circumference

  const categories = [
    { label: 'Completeness', score: 90, color: '#00D4FF' },
    { label: 'Skills',       score: 85, color: '#00E5A0' },
    { label: 'Experience',   score: 78, color: '#FFB347' },
    { label: 'Keywords',     score: 82, color: '#00D4FF' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 0 80px rgba(0,212,255,0.08), 0 24px 64px rgba(0,0,0,0.5)',
        width: '100%', maxWidth: '380px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '10px', marginBottom: '28px',
      }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: '#00E5A0',
          boxShadow: '0 0 8px #00E5A0',
        }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
        }}>
          ANALYSIS COMPLETE
        </span>
      </div>

      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="90" cy="90" r={radius}
              fill="none" stroke="var(--border-default)" strokeWidth="10"
            />
            {/* Progress */}
            <motion.circle
              cx="90" cy="90" r={radius}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: animated ? offset : circumference }}
              transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D4FF" />
                <stop offset="100%" stopColor="#00E5A0" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <motion.div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.2rem', fontWeight: 700,
                color: 'var(--accent-cyan)', lineHeight: 1,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {score}
            </motion.div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginTop: '4px',
            }}>
              ATS Score
            </div>
          </div>
        </div>
      </div>

      {/* Category bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {categories.map((cat, i) => (
          <div key={cat.label}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem', color: 'var(--text-secondary)',
              }}>
                {cat.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem', color: cat.color,
              }}>
                {cat.score}
              </span>
            </div>
            <div style={{
              height: '4px', background: 'var(--bg-overlay)',
              borderRadius: '999px', overflow: 'hidden',
            }}>
              <motion.div
                style={{
                  height: '100%', borderRadius: '999px',
                  background: `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: animated ? `${cat.score}%` : 0 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Grade badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.4 }}
        style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'rgba(0,229,160,0.08)',
          border: '1px solid rgba(0,229,160,0.25)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}
      >
        <CheckCircle size={16} color="#00E5A0" />
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem', color: '#00E5A0',
        }}>
          Strong candidate — Grade A
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -60])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const steps = [
    {
      number: 1,
      icon: FileText,
      title: 'Upload Your Resume',
      desc: 'Drop your PDF resume. Our parser extracts every section — contact, skills, experience, education, projects — with precision.',
      accent: '#00D4FF',
    },
    {
      number: 2,
      icon: Brain,
      title: 'AI Deep Analysis',
      desc: 'LLaMA 3.1 powered by Groq scans your resume across 6 weighted categories and scores your ATS compatibility instantly.',
      accent: '#00E5A0',
    },
    {
      number: 3,
      icon: Target,
      title: 'Match Job Descriptions',
      desc: 'Paste any job posting. See exactly which keywords you have, which you\'re missing, and your match score in real-time.',
      accent: '#FFB347',
    },
    {
      number: 4,
      icon: TrendingUp,
      title: 'Get Actionable Feedback',
      desc: 'Receive rewritten summaries, quick wins, and specific improvements ranked by impact. Apply them and re-score instantly.',
      accent: '#00D4FF',
    },
  ]

  const features = [
    {
      icon: Zap,
      title: 'Instant ATS Scoring',
      desc: 'Six-category scoring system: completeness, skills, summary, experience, keywords, and formatting — all in under 3 seconds.',
      accent: '#00D4FF',
    },
    {
      icon: Brain,
      title: 'LLaMA 3.1 Feedback',
      desc: 'Not generic tips. Groq-powered AI reads your actual resume and writes feedback specific to your content and target role.',
      accent: '#00E5A0',
    },
    {
      icon: Target,
      title: 'Keyword Gap Analysis',
      desc: 'Side-by-side diff of matched and missing keywords from any job description. Know exactly what to add before you apply.',
      accent: '#FFB347',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      desc: 'Your resume is analyzed in memory and never stored without your consent. You own your data, always.',
      accent: '#00D4FF',
    },
    {
      icon: Sparkles,
      title: 'AI Summary Rewriter',
      desc: 'Get a professionally rewritten summary tailored to your experience level and the job you\'re targeting.',
      accent: '#00E5A0',
    },
    {
      icon: TrendingUp,
      title: 'Score Tracking',
      desc: 'Upload improved versions and watch your ATS score climb. Visual trend charts show your progress over time.',
      accent: '#FFB347',
    },
  ]

  const [menuOpen, setMenuOpen] = useState(false)
  const navItems = [
    { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'How It Works', action: () => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Features', action: () => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Analyze', action: () => navigate('/analyse') },
  ]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <GridBackground />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 48px',
          background: 'rgba(10,10,15,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          aria-label="Go to home"
        >
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={16} color="#0A0A0F" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800, fontSize: '1.1rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            ResumeAI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="hidden md:flex" style={{ gap: '14px', alignItems: 'center' }}>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action()
                  setMenuOpen(false)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: '8px 10px',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button className="btn-ghost hidden md:inline-flex" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            Sign In
          </button>

          <button
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.82rem' }}
            onClick={() => {
              navigate('/analyse')
              setMenuOpen(false)
            }}
          >
            Analyse Resume
          </button>

          <button
            className="btn-ghost md:hidden"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{ padding: '10px 12px', fontSize: '0.9rem' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div
            className="md:hidden"
            style={{
              position: 'absolute', top: '72px', right: '16px',
              background: 'rgba(10,10,15,0.95)',
              border: '1px solid var(--border-default)',
              borderRadius: '14px',
              padding: '12px',
              width: 'calc(100% - 32px)',
              maxWidth: '320px',
              boxShadow: '0 10px 35px rgba(0,0,0,0.4)',
              zIndex: 110,
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action()
                  setMenuOpen(false)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  padding: '10px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/analyse')
                setMenuOpen(false)
              }}
              style={{
                width: '100%',
                textAlign: 'center',
                marginTop: '8px',
                padding: '10px',
              }}
              className="btn-primary"
            >
              Analyse Resume
            </button>
          </div>
        )}
      </motion.nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="page-enter"
      >
        <div style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 48px 80px',
          position: 'relative',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            maxWidth: '1200px',
            width: '100%',
            alignItems: 'center',
          }}>
            {/* Left — Text */}
            <div>
              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                style={{ marginBottom: '24px' }}
              >
                <span className="badge badge-cyan">
                  <Sparkles size={11} />
                  Powered by LLaMA 3.1 + Groq
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                Your Resume,
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  marginBottom: '24px',
                }}
              >
                <span className="gradient-text">Surgically Scored.</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  maxWidth: '480px',
                  marginBottom: '40px',
                }}
              >
                Upload your PDF. Get an ATS score, keyword gap analysis, and
                AI-powered rewrite suggestions — all in under 10 seconds.
                Built for engineers who take their career seriously.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
              >
                <button
                  className="btn-primary"
                  onClick={() => navigate('/analyse')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Analyse My Resume
                  <ArrowRight size={16} />
                </button>
                <button className="btn-ghost">
                  See Sample Report
                </button>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                style={{
                  display: 'flex', gap: '24px',
                  marginTop: '40px',
                  paddingTop: '32px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                {[
                  { icon: CheckCircle, text: 'No account required' },
                  { icon: Shield, text: 'Resume stays private' },
                  { icon: Zap, text: 'Results in ~8 seconds' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <Icon size={14} color="var(--accent-green)" />
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem', color: 'var(--text-muted)',
                    }}>
                      {text}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Score Preview Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ScorePreview />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '8px', marginTop: '-60px', marginBottom: '60px',
          position: 'relative', zIndex: 10,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem', color: 'var(--text-muted)',
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          Scroll
        </span>
        <ChevronDown size={16} color="var(--text-muted)" />
      </motion.div>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 10,
        padding: '60px 48px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px',
        }}>
          <AnimatedStat value={94}  suffix="%" label="ATS Pass Rate"     delay={0}   />
          <AnimatedStat value={8}   suffix="s"  label="Avg Analysis Time" delay={150} />
          <AnimatedStat value={6}   suffix="+"  label="Score Categories"  delay={300} />
          <AnimatedStat value={100} suffix="+"  label="Skills Detected"   delay={450} />
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" style={{
        position: 'relative', zIndex: 10,
        padding: '120px 48px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '72px' }}
          >
            <span className="badge badge-green" style={{ marginBottom: '20px' }}>
              How It Works
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              From upload to insights
              <br />
              <span className="gradient-text">in four steps.</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem', color: 'var(--text-secondary)',
              maxWidth: '480px', margin: '0 auto', lineHeight: 1.7,
            }}>
              No fluff. No lengthy onboarding. Drop your resume, get a
              comprehensive breakdown that actually helps you improve.
            </p>
          </motion.div>

          {/* Step cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {steps.map((step, i) => (
              <StepCard key={step.title} {...step} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────── */}
      <section id="features" style={{
        position: 'relative', zIndex: 10,
        padding: '120px 48px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '80px', alignItems: 'center',
        }}>
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="badge badge-amber" style={{ marginBottom: '20px' }}>
              Everything You Need
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}>
              Not just a score.
              <br />
              <span className="gradient-text-amber">A full diagnosis.</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: '36px',
            }}>
              Most ATS checkers give you a number and leave you guessing.
              ResumeAI breaks down every dimension of your resume and tells you
              exactly what to fix — and in what order.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/analyse')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Get Your Free Analysis
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Right features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {features.map((f, i) => (
              <FeatureRow key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 10,
        padding: '140px 48px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}
        >
          <span className="badge badge-cyan" style={{ marginBottom: '24px' }}>
            Free to use. No sign-up.
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--text-primary)',
            marginBottom: '20px',
          }}>
            Your next job starts with{' '}
            <span className="gradient-text">a better resume.</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem', color: 'var(--text-secondary)',
            lineHeight: 1.7, marginBottom: '40px',
          }}>
            Drop your PDF and find out exactly where you stand — before a
            recruiter's ATS system makes that decision for you.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate('/analyse')}
            style={{
              fontSize: '1rem', padding: '16px 40px',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
            }}
          >
            Analyse My Resume Now
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        padding: '32px 48px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px', height: '24px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={12} color="#0A0A0F" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '0.95rem',
            color: 'var(--text-muted)',
          }}>
            ResumeAI
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem', color: 'var(--text-muted)',
        }}>
          Built with Node.js + LLaMA 3.1
        </span>
      </footer>
    </div>
  )
}