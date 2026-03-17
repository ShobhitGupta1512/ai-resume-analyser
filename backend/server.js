/**
 * server.js  (UPDATED)
 * AI Resume Analyser — Main Express Server
 * Added: cookie-parser, passport, cors with credentials, auth routes
 */

import 'dotenv/config'
import express       from 'express'
import cors          from 'cors'
import cookieParser  from 'cookie-parser'
import connectDB     from './config/db.js'
import './config/passport.js'           // registers Passport strategies
import passport      from 'passport'
import authRoutes    from './routes/authRoutes.js'
import uploadRoutes  from './routes/uploadRoutes.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ── Connect DB ───────────────────────────────────────────────────────────────
connectDB()

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,    // required for cookies
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(passport.initialize())   // no sessions — JWT only

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes)
app.use('/api/upload', uploadRoutes)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'AI Resume Analyser API is running' })
)

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))