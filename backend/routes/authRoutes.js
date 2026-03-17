/**
 * routes/authRoutes.js
 * AI Resume Analyser — Full Auth with JWT + OTP
 *
 * POST /api/auth/register       → register → send verify OTP email
 * POST /api/auth/verify-email   → confirm OTP → issue tokens
 * POST /api/auth/resend-otp     → resend OTP
 * POST /api/auth/login          → password check → send 2FA OTP
 * POST /api/auth/verify-login   → confirm 2FA OTP → issue tokens
 * POST /api/auth/refresh        → new access token from refresh cookie
 * POST /api/auth/logout         → revoke refresh token + clear cookie
 * GET  /api/auth/me             → get current user (protected)
 */

import express   from 'express'
import rateLimit from 'express-rate-limit'
import User      from '../models/user.js'
import { protect } from '../middleware/authMiddleware.js'
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/tokens.js'
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  sendVerifyEmail,
  sendLoginOTP,
} from '../utils/email/otpMailer.js'

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, error: 'Too many attempts. Try again in 15 minutes.' },
})

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      3,
  message:  { success: false, error: 'Too many OTP requests. Wait 1 minute.' },
})

async function issueTokens(res, user, req) {
  const accessToken  = generateAccessToken(user._id, user.role)
  const refreshToken = generateRefreshToken()
  user.refreshTokens.push({
    token:     refreshToken,
    userAgent: req.headers['user-agent'] || '',
    ip:        req.ip,
  })
  if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5)
  user.lastLogin = new Date()
  await user.save()
  setRefreshCookie(res, refreshToken)
  return accessToken
}

async function validateOTP(user, plainOTP, purpose) {
  const { otp } = user
  if (!otp?.code || !otp?.expiresAt)
    return { valid: false, error: 'No OTP found. Please request a new one.' }
  if (otp.purpose !== purpose)
    return { valid: false, error: 'OTP purpose mismatch. Please request a new one.' }
  if (new Date() > otp.expiresAt)
    return { valid: false, error: 'OTP has expired. Please request a new one.' }
  if (otp.attempts >= 5) {
    user.otp = { code: null, expiresAt: null, purpose: null, attempts: 0 }
    await user.save()
    return { valid: false, error: 'Too many incorrect attempts. Please request a new OTP.' }
  }
  const match = await verifyOTP(plainOTP, otp.code)
  if (!match) {
    user.otp.attempts += 1
    await user.save()
    const remaining = 5 - user.otp.attempts
    return { valid: false, error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` }
  }
  return { valid: true }
}

// 1. REGISTER
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'All fields are required' })
    if (password.length < 8)
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' })

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) {
      if (!exists.isEmailVerified) {
        const otp = generateOTP()
        const hashed = await hashOTP(otp)
        exists.otp = { code: hashed, expiresAt: new Date(Date.now() + 10 * 60 * 1000), purpose: 'verify_email', attempts: 0 }
        await exists.save()
        await sendVerifyEmail(email, exists.name, otp)
        return res.status(200).json({ success: true, message: 'OTP resent. Please verify your email.', step: 'verify_email', email })
      }
      return res.status(409).json({ success: false, error: 'Email already registered' })
    }

    const otp    = generateOTP()
    const hashed = await hashOTP(otp)
    const user   = new User({
      name, email, password,
      isEmailVerified: false,
      otp: { code: hashed, expiresAt: new Date(Date.now() + 10 * 60 * 1000), purpose: 'verify_email', attempts: 0 },
    })
    await user.save()
    await sendVerifyEmail(email, name, otp)

    res.status(201).json({ success: true, message: 'Account created! Check your email for the OTP.', step: 'verify_email', email })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

// 2. VERIFY EMAIL
router.post('/verify-email', otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ success: false, error: 'Email and OTP are required' })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    if (user.isEmailVerified) return res.status(400).json({ success: false, error: 'Email already verified' })

    const result = await validateOTP(user, otp, 'verify_email')
    if (!result.valid) return res.status(400).json({ success: false, error: result.error })

    user.isEmailVerified = true
    user.otp = { code: null, expiresAt: null, purpose: null, attempts: 0 }
    const accessToken = await issueTokens(res, user, req)

    res.json({ success: true, message: 'Email verified! Welcome aboard.', accessToken, user: user.toSafeObject() })
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ success: false, error: 'Verification failed' })
  }
})

// 3. RESEND OTP
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { email, purpose } = req.body
    if (!email || !purpose)
      return res.status(400).json({ success: false, error: 'Email and purpose are required' })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    const otp    = generateOTP()
    const hashed = await hashOTP(otp)
    user.otp     = { code: hashed, expiresAt: new Date(Date.now() + 10 * 60 * 1000), purpose, attempts: 0 }
    await user.save()

    if (purpose === 'verify_email') await sendVerifyEmail(email, user.name, otp)
    else                            await sendLoginOTP(email, user.name, otp)

    res.json({ success: true, message: 'OTP resent successfully' })
  } catch (err) {
    console.error('Resend OTP error:', err)
    res.status(500).json({ success: false, error: 'Failed to resend OTP' })
  }
})

// 4. LOGIN step 1
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    if (!user.password)
      return res.status(400).json({ success: false, error: 'This account uses social login.' })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' })
    if (!user.isEmailVerified)
      return res.status(403).json({ success: false, error: 'Please verify your email first.', step: 'verify_email', email })

    const otp    = generateOTP()
    const hashed = await hashOTP(otp)
    user.otp     = { code: hashed, expiresAt: new Date(Date.now() + 10 * 60 * 1000), purpose: 'login_2fa', attempts: 0 }
    await user.save()
    await sendLoginOTP(email, user.name, otp)

    res.json({ success: true, message: 'Password verified. Check your email for the OTP.', step: 'login_2fa', email })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

// 5. VERIFY LOGIN OTP
router.post('/verify-login', otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ success: false, error: 'Email and OTP are required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    const result = await validateOTP(user, otp, 'login_2fa')
    if (!result.valid) return res.status(400).json({ success: false, error: result.error })

    user.otp = { code: null, expiresAt: null, purpose: null, attempts: 0 }
    const accessToken = await issueTokens(res, user, req)

    res.json({ success: true, message: 'Login successful!', accessToken, user: user.toSafeObject() })
  } catch (err) {
    console.error('Verify login error:', err)
    res.status(500).json({ success: false, error: 'Login verification failed' })
  }
})

// 6. REFRESH
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) return res.status(401).json({ success: false, error: 'No refresh token' })

    const user = await User.findOne({ 'refreshTokens.token': token })
    if (!user) return res.status(401).json({ success: false, error: 'Invalid refresh token' })

    user.refreshTokens = user.refreshTokens.filter(t => t.token !== token)
    const accessToken  = await issueTokens(res, user, req)
    res.json({ success: true, accessToken })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Token refresh failed' })
  }
})

// 7. LOGOUT
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (token) {
      const user = await User.findOne({ 'refreshTokens.token': token })
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== token)
        await user.save()
      }
    }
    clearRefreshCookie(res)
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Logout failed' })
  }
})

// 8. GET ME
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -refreshTokens -providers')
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' })
  }
})

export default router